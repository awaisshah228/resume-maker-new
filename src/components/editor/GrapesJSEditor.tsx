"use client";

import { useEffect, useRef, useState } from 'react';
import 'grapesjs/dist/css/grapes.min.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Download, Save, Sparkles, Wand2, Upload, Eye, EyeOff } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface GrapesJSEditorProps {
  onSave?: (html: string, css: string) => void;
}

export default function GrapesJSEditor({ onSave }: GrapesJSEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editor, setEditor] = useState<unknown>(null);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [aiMenuPosition, setAIMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPanels, setShowPanels] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle text selection for AI features
  useEffect(() => {
    if (!isClient) return;

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      
      if (text && text.length > 0) {
        setSelectedText(text);
        
        // Get selection position
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        
        if (rect) {
          setAIMenuPosition({
            top: rect.bottom + window.scrollY + 10,
            left: rect.left + window.scrollX
          });
          setShowAIMenu(true);
        }
      } else {
        setShowAIMenu(false);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !editorRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let editorInstance: any = null;

    const initEditor = async () => {
      const grapesjs = (await import('grapesjs')).default;
      const presetWebpage = (await import('grapesjs-preset-webpage')).default;

      // Clear any existing global functions
      delete (window as { handleAIAction?: unknown; closeAIMenu?: unknown }).handleAIAction;
      delete (window as { handleAIAction?: unknown; closeAIMenu?: unknown }).closeAIMenu;

      // Function to show AI enhancement options (define before init)
      const showAIOptionsMenu = (text: string, position: { x: number; y: number } | null = null) => {
        const menuHtml = `
          <div id="ai-menu" style="position: fixed; z-index: 10000; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); padding: 8px; min-width: 180px; border: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px; border-bottom: 1px solid #e5e7eb; margin-bottom: 4px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px; color: #7c3aed;">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
              </svg>
              <span style="font-size: 13px; font-weight: 600; color: #374151;">AI Enhance</span>
            </div>
            <button onclick="handleAIAction('fix', '${text.replace(/'/g, "\\'")}', this)" style="width: 100%; text-align: left; padding: 10px 12px; border: none; background: transparent; cursor: pointer; border-radius: 4px; font-size: 13px; color: #374151; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.background='#eff6ff'; this.style.color='#2563eb';" onmouseout="this.style.background='transparent'; this.style.color='#374151';">
              <span style="font-size: 16px;">✓</span>
              <span>Fix Grammar</span>
            </button>
            <button onclick="handleAIAction('enhance', '${text.replace(/'/g, "\\'")}', this)" style="width: 100%; text-align: left; padding: 10px 12px; border: none; background: transparent; cursor: pointer; border-radius: 4px; font-size: 13px; color: #374151; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.background='#f3e8ff'; this.style.color='#7c3aed';" onmouseout="this.style.background='transparent'; this.style.color='#374151';">
              <span style="font-size: 16px;">✨</span>
              <span>Enhance</span>
            </button>
            <button onclick="handleAIAction('shorten', '${text.replace(/'/g, "\\'")}', this)" style="width: 100%; text-align: left; padding: 10px 12px; border: none; background: transparent; cursor: pointer; border-radius: 4px; font-size: 13px; color: #374151; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.background='#ecfdf5'; this.style.color='#059669';" onmouseout="this.style.background='transparent'; this.style.color='#374151';">
              <span style="font-size: 16px;">⚡</span>
              <span>Make Shorter</span>
            </button>
            <button onclick="handleAIAction('expand', '${text.replace(/'/g, "\\'")}', this)" style="width: 100%; text-align: left; padding: 10px 12px; border: none; background: transparent; cursor: pointer; border-radius: 4px; font-size: 13px; color: #374151; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.background='#fff7ed'; this.style.color='#ea580c';" onmouseout="this.style.background='transparent'; this.style.color='#374151';">
              <span style="font-size: 16px;">📝</span>
              <span>Expand</span>
            </button>
            <button onclick="closeAIMenu()" style="width: 100%; text-align: left; padding: 10px 12px; border: none; background: transparent; cursor: pointer; border-radius: 4px; font-size: 13px; color: #6b7280; display: flex; align-items: center; gap: 8px; margin-top: 4px; border-top: 1px solid #e5e7eb;" onmouseover="this.style.background='#f9fafb';" onmouseout="this.style.background='transparent';">
              <span style="font-size: 16px;">✕</span>
              <span>Close</span>
            </button>
          </div>
        `;

        // Remove existing menu if any
        const existingMenu = document.getElementById('ai-menu');
        if (existingMenu) existingMenu.remove();

        // Create and position menu
        const menuDiv = document.createElement('div');
        menuDiv.innerHTML = menuHtml;
        const menuElement = menuDiv.firstElementChild as HTMLElement;
        document.body.appendChild(menuElement);

        // Position menu
        const menu = document.getElementById('ai-menu');
        if (menu) {
          if (position) {
            // Use provided position
            menu.style.left = `${position.x}px`;
            menu.style.top = `${position.y}px`;
          } else {
            // Try to get position from selection
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              menu.style.left = `${rect.left + window.scrollX}px`;
              menu.style.top = `${rect.bottom + window.scrollY + 10}px`;
            } else {
              // Fallback: try to find RTE toolbar
              const toolbar = document.querySelector('.gjs-rte-toolbar');
              if (toolbar) {
                const toolbarRect = toolbar.getBoundingClientRect();
                menu.style.left = `${toolbarRect.right + window.scrollX - 200}px`;
                menu.style.top = `${toolbarRect.bottom + window.scrollY + 10}px`;
              } else {
                // Last fallback: center of viewport
                menu.style.left = `${(window.innerWidth / 2) - 100}px`;
                menu.style.top = `${(window.innerHeight / 2) - 150}px`;
              }
            }
          }

          // Ensure menu is visible on screen
          const menuRect = menu.getBoundingClientRect();
          if (menuRect.right > window.innerWidth) {
            menu.style.left = `${window.innerWidth - menuRect.width - 20}px`;
          }
          if (menuRect.bottom > window.innerHeight) {
            menu.style.top = `${window.scrollY + window.innerHeight - menuRect.height - 20}px`;
          }
          if (parseInt(menu.style.left) < 0) {
            menu.style.left = '20px';
          }
          if (parseInt(menu.style.top) < 0) {
            menu.style.top = '20px';
          }
        }
      };

      editorInstance = grapesjs.init({
        container: editorRef.current!,
        height: '100%',
        width: 'auto',
        plugins: [presetWebpage],
        storageManager: false,
        fromElement: false,
        canvas: {
          styles: [
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700&display=swap'
          ]
        },
        canvasCss: `
          * {
            box-sizing: border-box;
          }
          @media (max-width: 768px) {
            .gjs-cv-canvas {
              overflow: auto !important;
              overflow-x: auto !important;
              overflow-y: auto !important;
              -webkit-overflow-scrolling: touch !important;
            }
            .gjs-cv-canvas iframe {
              width: 100% !important;
              min-width: 100% !important;
              overflow: auto !important;
              -webkit-overflow-scrolling: touch !important;
            }
            /* Add top padding to body to prevent toolbar overlap */
            body {
              padding-top: 60px !important;
            }
            /* Position toolbar at bottom on mobile to avoid covering content */
            .gjs-toolbar {
              position: fixed !important;
              bottom: 20px !important;
              top: auto !important;
              left: 50% !important;
              transform: translateX(-50%) !important;
              z-index: 1000 !important;
              max-width: calc(100vw - 40px) !important;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
            }
          }
        `,
        richTextEditor: {
          actions: ['bold', 'italic', 'underline', 'strikethrough', 'link'],
        },
        deviceManager: {
          devices: [{
            name: 'Desktop',
            width: '1024px',
          }, {
            name: 'Tablet',
            width: '768px',
          }, {
            name: 'Mobile',
            width: '375px',
          }, {
            name: 'A4',
            width: '794px', // A4 width in pixels at 96 DPI
          }]
        },
        pluginsOpts: {
          'gjs-preset-webpage': {
            modalImportTitle: 'Import Template',
            modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
            modalImportContent: function(editor: { getHtml: () => string; getCss: () => string }) {
              return editor.getHtml() + '<style>' + editor.getCss() + '</style>'
            },
          }
        },
      });

      // Add AI Enhancement button after editor is initialized
      const rte = editorInstance.RichTextEditor;
      rte.add('ai-enhance', {
        icon: '<b style="font-size: 12px;">✨</b>',
        attributes: {
          title: 'AI Enhance Text',
          class: 'ai-enhance-btn',
          style: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; border-radius: 3px; padding: 4px 8px;'
        },
        result: (rte: { selection: () => { toString: () => string } | null }) => {
          const selection = rte.selection();
          if (!selection) {
            alert('Please select some text first');
            return;
          }
          
          const selectedText = selection.toString().trim();
          if (!selectedText || selectedText.length === 0) {
            alert('Please select some text first');
            return;
          }

          // Console log selected text
          console.log('Selected text:', selectedText);
          console.log('Text length:', selectedText.length);

          // Get selection position before losing focus
          const windowSelection = window.getSelection();
          let menuPosition = { x: 0, y: 0 };
          
          if (windowSelection && windowSelection.rangeCount > 0) {
            const range = windowSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            menuPosition = {
              x: rect.left + (rect.width / 2),
              y: rect.bottom + window.scrollY + 10
            };
          } else {
            // Fallback: try to find RTE toolbar position
            const toolbar = document.querySelector('.gjs-rte-toolbar');
            if (toolbar) {
              const toolbarRect = toolbar.getBoundingClientRect();
              menuPosition = {
                x: toolbarRect.right - 200,
                y: toolbarRect.bottom + window.scrollY + 10
              };
            } else {
              // Last fallback: center of screen
              menuPosition = {
                x: window.innerWidth / 2 - 100,
                y: window.innerHeight / 2 - 150
              };
            }
          }

          // Show AI options menu with position
          showAIOptionsMenu(selectedText, menuPosition);
        }
      });

      // Add global function to handle AI actions
      (window as { handleAIAction?: (action: string, text: string) => void }).handleAIAction = async (action: string, text: string) => {
        const menu = document.getElementById('ai-menu');
        if (menu) {
          menu.innerHTML = '<div style="padding: 20px; text-align: center;"><div style="display: inline-block; width: 20px; height: 20px; border: 2px solid #7c3aed; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div><p style="margin-top: 10px; font-size: 13px; color: #6b7280;">AI is processing...</p></div>';
        }

        try {
          let prompt = '';
          switch (action) {
            case 'fix':
              prompt = `Fix grammar and spelling errors in the following text. Return ONLY the corrected text without any explanations:\n\n${text}`;
              break;
            case 'enhance':
              prompt = `Improve and enhance the following text to make it more professional and impactful for a resume. Return ONLY the enhanced text without any explanations:\n\n${text}`;
              break;
            case 'shorten':
              prompt = `Make the following text more concise while keeping the key information. Return ONLY the shortened text without any explanations:\n\n${text}`;
              break;
            case 'expand':
              prompt = `Expand the following text with more details while keeping it professional for a resume. Return ONLY the expanded text without any explanations:\n\n${text}`;
              break;
          }

          const response = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
          });

          if (!response.ok) throw new Error('AI request failed');

          const data = await response.json();
          const improvedText = data.text || '';

          // Replace selected text
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(improvedText));
            selection.removeAllRanges();
          }

          // Close menu
          if (menu) menu.remove();

        } catch (error) {
          console.error('AI error:', error);
          alert('Failed to process text. Please try again.');
          if (menu) menu.remove();
        }
      };

      // Add global function to close menu
      (window as { closeAIMenu?: () => void }).closeAIMenu = () => {
        const menu = document.getElementById('ai-menu');
        if (menu) menu.remove();
      };

      // Add keyframe animation for spinner
      const style = document.createElement('style');
      style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
      document.head.appendChild(style);

      // Add custom resume blocks
      editorInstance.BlockManager.add('resume-header', {
        label: '<div style="text-align: center;"><div style="font-size: 20px; margin-bottom: 5px;">👤</div>Header</div>',
        category: 'Resume Sections',
        content: `
          <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <h1 style="margin: 0; font-size: 42px; font-weight: 700; margin-bottom: 10px;">John Doe</h1>
            <p style="margin: 5px 0; font-size: 20px; opacity: 0.95;">Software Engineer</p>
            <div style="margin-top: 20px; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; font-size: 14px;">
              <span>📧 john.doe@email.com</span>
              <span>📱 (555) 123-4567</span>
              <span>🌐 linkedin.com/in/johndoe</span>
              <span>📍 San Francisco, CA</span>
            </div>
          </div>
        `,
        attributes: { class: 'fa fa-user' }
      });

      editorInstance.BlockManager.add('resume-header-minimal', {
        label: '<div style="text-align: center;"><div style="font-size: 20px; margin-bottom: 5px;">📝</div>Minimal Header</div>',
        category: 'Resume Sections',
        content: `
          <div style="padding: 30px 40px; border-bottom: 3px solid #2563eb;">
            <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: #1e293b;">Jane Smith</h1>
            <p style="margin: 8px 0 0 0; font-size: 18px; color: #475569;">Product Manager</p>
            <div style="margin-top: 15px; display: flex; gap: 20px; flex-wrap: wrap; font-size: 14px; color: #64748b;">
              <span>jane.smith@email.com</span>
              <span>|</span>
              <span>(555) 987-6543</span>
              <span>|</span>
              <span>linkedin.com/in/janesmith</span>
            </div>
          </div>
        `,
      });

      editorInstance.BlockManager.add('resume-summary', {
        label: '<div style="text-align: center;"><div style="font-size: 20px; margin-bottom: 5px;">📄</div>Summary</div>',
        category: 'Resume Sections',
        content: `
          <div style="padding: 30px 40px;">
            <h2 style="margin: 0 0 15px 0; font-size: 24px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Professional Summary</h2>
            <p style="margin: 0; line-height: 1.7; color: #475569; font-size: 15px;">
              Results-driven professional with 5+ years of experience in software development and project management. 
              Proven track record of delivering high-quality solutions and leading cross-functional teams. 
              Passionate about leveraging technology to solve complex business problems and drive innovation.
            </p>
          </div>
        `,
      });

      editorInstance.BlockManager.add('resume-experience', {
        label: '<div style="text-align: center;"><div style="font-size: 20px; margin-bottom: 5px;">💼</div>Experience</div>',
        category: 'Resume Sections',
        content: `
          <div style="padding: 30px 40px;">
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Work Experience</h2>
            
            <div style="margin-bottom: 25px;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; flex-wrap: wrap;">
                <div>
                  <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">Senior Software Engineer</h3>
                  <p style="margin: 4px 0 0 0; font-size: 16px; color: #475569;">Tech Company Inc.</p>
                </div>
                <span style="font-size: 14px; color: #64748b; white-space: nowrap;">Jan 2020 - Present</span>
              </div>
              <ul style="margin: 12px 0 0 0; padding-left: 20px; color: #475569; line-height: 1.7;">
                <li style="margin-bottom: 8px;">Led development of microservices architecture, improving system scalability by 300%</li>
                <li style="margin-bottom: 8px;">Mentored team of 5 junior developers, implementing code review best practices</li>
                <li style="margin-bottom: 8px;">Reduced deployment time by 60% through CI/CD pipeline optimization</li>
              </ul>
            </div>

            <div style="margin-bottom: 25px;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; flex-wrap: wrap;">
                <div>
                  <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">Software Engineer</h3>
                  <p style="margin: 4px 0 0 0; font-size: 16px; color: #475569;">Previous Company LLC</p>
                </div>
                <span style="font-size: 14px; color: #64748b; white-space: nowrap;">Jun 2018 - Dec 2019</span>
              </div>
              <ul style="margin: 12px 0 0 0; padding-left: 20px; color: #475569; line-height: 1.7;">
                <li style="margin-bottom: 8px;">Developed RESTful APIs serving 1M+ daily requests</li>
                <li style="margin-bottom: 8px;">Collaborated with product team to define technical requirements</li>
                <li style="margin-bottom: 8px;">Improved application performance by 40% through code optimization</li>
              </ul>
            </div>
          </div>
        `,
      });

      editorInstance.BlockManager.add('resume-education', {
        label: '<div style="text-align: center;"><div style="font-size: 20px; margin-bottom: 5px;">🎓</div>Education</div>',
        category: 'Resume Sections',
        content: `
          <div style="padding: 30px 40px;">
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Education</h2>
            
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap;">
                <div>
                  <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">Bachelor of Science in Computer Science</h3>
                  <p style="margin: 4px 0 0 0; font-size: 16px; color: #475569;">University of California, Berkeley</p>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">GPA: 3.8/4.0</p>
                </div>
                <span style="font-size: 14px; color: #64748b; white-space: nowrap;">2014 - 2018</span>
              </div>
            </div>
          </div>
        `,
      });

      editorInstance.BlockManager.add('resume-skills', {
        label: '<div style="text-align: center;"><div style="font-size: 20px; margin-bottom: 5px;">⚡</div>Skills</div>',
        category: 'Resume Sections',
        content: `
          <div style="padding: 30px 40px;">
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Skills</h2>
            
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              <span style="background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">JavaScript</span>
              <span style="background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">TypeScript</span>
              <span style="background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">React</span>
              <span style="background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">Node.js</span>
              <span style="background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">Python</span>
              <span style="background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">SQL</span>
              <span style="background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">AWS</span>
              <span style="background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">Docker</span>
            </div>
          </div>
        `,
      });

      editorInstance.BlockManager.add('resume-skills-columns', {
        label: '<div style="text-align: center;"><div style="font-size: 20px; margin-bottom: 5px;">📊</div>Skills (Columns)</div>',
        category: 'Resume Sections',
        content: `
          <div style="padding: 30px 40px;">
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Technical Skills</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
              <div>
                <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #1e293b;">Languages</h3>
                <p style="margin: 0; color: #475569; line-height: 1.6; font-size: 14px;">JavaScript, TypeScript, Python, Java, C++</p>
              </div>
              <div>
                <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #1e293b;">Frameworks</h3>
                <p style="margin: 0; color: #475569; line-height: 1.6; font-size: 14px;">React, Next.js, Node.js, Express, Django</p>
              </div>
              <div>
                <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #1e293b;">Tools</h3>
                <p style="margin: 0; color: #475569; line-height: 1.6; font-size: 14px;">Git, Docker, AWS, Jenkins, Kubernetes</p>
              </div>
            </div>
          </div>
        `,
      });

      editorInstance.BlockManager.add('resume-projects', {
        label: '<div style="text-align: center;"><div style="font-size: 20px; margin-bottom: 5px;">🚀</div>Projects</div>',
        category: 'Resume Sections',
        content: `
          <div style="padding: 30px 40px;">
            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Projects</h2>
            
            <div style="margin-bottom: 20px;">
              <h3 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 600; color: #1e293b;">E-Commerce Platform</h3>
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">React, Node.js, MongoDB, Stripe API</p>
              <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.7;">
                <li style="margin-bottom: 6px;">Built full-stack e-commerce application with payment integration</li>
                <li style="margin-bottom: 6px;">Implemented real-time inventory management system</li>
                <li style="margin-bottom: 6px;">Achieved 99.9% uptime with 10,000+ monthly active users</li>
              </ul>
            </div>

            <div>
              <h3 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 600; color: #1e293b;">Task Management App</h3>
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">Next.js, TypeScript, PostgreSQL, Tailwind CSS</p>
              <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.7;">
                <li style="margin-bottom: 6px;">Developed collaborative task management tool with real-time updates</li>
                <li style="margin-bottom: 6px;">Integrated third-party calendar APIs for seamless scheduling</li>
              </ul>
            </div>
          </div>
        `,
      });

      // Add predefined templates
      editorInstance.BlockManager.add('template-professional', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">📄</div><strong>Professional</strong><br/><small>Classic Layout</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Inter', sans-serif; max-width: 794px; margin: 0 auto; background: white;">
            <div style="text-align: center; padding: 40px 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
              <h1 style="margin: 0; font-size: 42px; font-weight: 700; margin-bottom: 10px;">Your Name</h1>
              <p style="margin: 5px 0; font-size: 20px; opacity: 0.95;">Your Job Title</p>
              <div style="margin-top: 20px; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; font-size: 14px;">
                <span>📧 your.email@example.com</span>
                <span>📱 (555) 123-4567</span>
                <span>🌐 linkedin.com/in/yourprofile</span>
              </div>
            </div>

            <div style="padding: 30px 40px;">
              <h2 style="margin: 0 0 15px 0; font-size: 24px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Professional Summary</h2>
              <p style="margin: 0; line-height: 1.7; color: #475569; font-size: 15px;">
                [Write your professional summary here. Highlight your key achievements, years of experience, and what makes you unique.]
              </p>
            </div>

            <div style="padding: 30px 40px;">
              <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Work Experience</h2>
              
              <div style="margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                  <div>
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">Job Title</h3>
                    <p style="margin: 4px 0 0 0; font-size: 16px; color: #475569;">Company Name</p>
                  </div>
                  <span style="font-size: 14px; color: #64748b;">Month Year - Present</span>
                </div>
                <ul style="margin: 12px 0 0 0; padding-left: 20px; color: #475569; line-height: 1.7;">
                  <li style="margin-bottom: 8px;">Achievement or responsibility #1</li>
                  <li style="margin-bottom: 8px;">Achievement or responsibility #2</li>
                  <li style="margin-bottom: 8px;">Achievement or responsibility #3</li>
                </ul>
              </div>
            </div>

            <div style="padding: 30px 40px;">
              <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Education</h2>
              <div>
                <div style="display: flex; justify-content: space-between; align-items: start;">
                  <div>
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">Degree Name</h3>
                    <p style="margin: 4px 0 0 0; font-size: 16px; color: #475569;">University Name</p>
                  </div>
                  <span style="font-size: 14px; color: #64748b;">Year - Year</span>
                </div>
              </div>
            </div>

            <div style="padding: 30px 40px;">
              <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Skills</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                <span style="background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">Skill 1</span>
                <span style="background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">Skill 2</span>
                <span style="background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">Skill 3</span>
              </div>
            </div>
          </div>
        `,
        attributes: { class: 'fa fa-file-text' }
      });

      editorInstance.BlockManager.add('template-modern', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">✨</div><strong>Modern</strong><br/><small>Two Column</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Roboto', sans-serif; max-width: 794px; margin: 0 auto; background: white; display: grid; grid-template-columns: 280px 1fr;">
            <div style="background: #1e293b; color: white; padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 120px; height: 120px; border-radius: 50%; background: #334155; margin: 0 auto 15px;"></div>
                <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Your Name</h1>
                <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.8;">Your Title</p>
              </div>

              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; border-bottom: 2px solid #334155; padding-bottom: 8px;">CONTACT</h3>
                <div style="font-size: 13px; line-height: 1.8; opacity: 0.9;">
                  <p style="margin: 0 0 10px 0;">📧 email@example.com</p>
                  <p style="margin: 0 0 10px 0;">📱 (555) 123-4567</p>
                  <p style="margin: 0 0 10px 0;">📍 City, State</p>
                  <p style="margin: 0;">🔗 linkedin.com/in/you</p>
                </div>
              </div>

              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; border-bottom: 2px solid #334155; padding-bottom: 8px;">SKILLS</h3>
                <div style="font-size: 13px; line-height: 1.8;">
                  <p style="margin: 0 0 8px 0;">• JavaScript</p>
                  <p style="margin: 0 0 8px 0;">• React & Next.js</p>
                  <p style="margin: 0 0 8px 0;">• Node.js</p>
                  <p style="margin: 0 0 8px 0;">• Python</p>
                  <p style="margin: 0 0 8px 0;">• SQL & NoSQL</p>
                </div>
              </div>

              <div>
                <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; border-bottom: 2px solid #334155; padding-bottom: 8px;">LANGUAGES</h3>
                <div style="font-size: 13px; line-height: 1.8;">
                  <p style="margin: 0 0 8px 0;">English - Native</p>
                  <p style="margin: 0;">Spanish - Professional</p>
                </div>
              </div>
            </div>

            <div style="padding: 40px;">
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; font-size: 22px; font-weight: 700; color: #1e293b;">PROFESSIONAL SUMMARY</h2>
                <p style="margin: 0; line-height: 1.7; color: #475569; font-size: 14px;">
                  [Your professional summary goes here. Describe your experience, expertise, and career goals.]
                </p>
              </div>

              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; color: #1e293b;">EXPERIENCE</h2>
                
                <div style="margin-bottom: 20px;">
                  <div style="margin-bottom: 6px;">
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1e293b;">Job Title</h3>
                    <p style="margin: 4px 0; font-size: 14px; color: #475569;">Company Name | Month Year - Present</p>
                  </div>
                  <ul style="margin: 8px 0 0 0; padding-left: 18px; color: #475569; font-size: 13px; line-height: 1.7;">
                    <li style="margin-bottom: 6px;">Key achievement or responsibility</li>
                    <li style="margin-bottom: 6px;">Key achievement or responsibility</li>
                    <li>Key achievement or responsibility</li>
                  </ul>
                </div>

                <div>
                  <div style="margin-bottom: 6px;">
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1e293b;">Previous Job Title</h3>
                    <p style="margin: 4px 0; font-size: 14px; color: #475569;">Previous Company | Month Year - Month Year</p>
                  </div>
                  <ul style="margin: 8px 0 0 0; padding-left: 18px; color: #475569; font-size: 13px; line-height: 1.7;">
                    <li style="margin-bottom: 6px;">Key achievement or responsibility</li>
                    <li>Key achievement or responsibility</li>
                  </ul>
                </div>
              </div>

              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; font-size: 22px; font-weight: 700; color: #1e293b;">EDUCATION</h2>
                <div>
                  <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1e293b;">Degree Name</h3>
                  <p style="margin: 4px 0; font-size: 14px; color: #475569;">University Name | Year - Year</p>
                </div>
              </div>

              <div>
                <h2 style="margin: 0 0 15px 0; font-size: 22px; font-weight: 700; color: #1e293b;">KEY SKILLS</h2>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                  <span style="background: #f1f5f9; color: #1e293b; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;">JavaScript</span>
                  <span style="background: #f1f5f9; color: #1e293b; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;">React</span>
                  <span style="background: #f1f5f9; color: #1e293b; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;">Node.js</span>
                  <span style="background: #f1f5f9; color: #1e293b; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;">Python</span>
                  <span style="background: #f1f5f9; color: #1e293b; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;">TypeScript</span>
                  <span style="background: #f1f5f9; color: #1e293b; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;">SQL</span>
                  <span style="background: #f1f5f9; color: #1e293b; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;">AWS</span>
                  <span style="background: #f1f5f9; color: #1e293b; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;">Docker</span>
                  <span style="background: #f1f5f9; color: #1e293b; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;">Git</span>
                </div>
                
                <div style="margin-top: 20px;">
                  <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #1e293b;">Technical Expertise</h3>
                  <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 13px; line-height: 1.8;">
                    <li style="margin-bottom: 5px;">Frontend Development: React, Vue.js, Angular</li>
                    <li style="margin-bottom: 5px;">Backend Development: Node.js, Express, REST APIs</li>
                    <li style="margin-bottom: 5px;">Database: PostgreSQL, MongoDB, Redis</li>
                    <li style="margin-bottom: 5px;">Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD</li>
                    <li>Tools: Git, Jira, Jenkins, Webpack</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        `,
      });

      editorInstance.BlockManager.add('template-creative', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">🎨</div><strong>Creative</strong><br/><small>Bold & Colorful</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Open Sans', sans-serif; max-width: 794px; margin: 0 auto; background: white;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 50px 40px; position: relative;">
              <h1 style="margin: 0; font-size: 48px; font-weight: 700; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">Your Name</h1>
              <p style="margin: 10px 0 0 0; font-size: 24px; color: white; opacity: 0.95;">Creative Professional</p>
            </div>

            <div style="padding: 30px 40px; background: #fff;">
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px;">
                <div style="text-align: center; padding: 15px; background: #fef3c7; border-radius: 10px;">
                  <p style="margin: 0; font-size: 12px; color: #92400e; font-weight: 600;">EMAIL</p>
                  <p style="margin: 5px 0 0 0; font-size: 13px; color: #78350f;">you@email.com</p>
                </div>
                <div style="text-align: center; padding: 15px; background: #dbeafe; border-radius: 10px;">
                  <p style="margin: 0; font-size: 12px; color: #1e40af; font-weight: 600;">PHONE</p>
                  <p style="margin: 5px 0 0 0; font-size: 13px; color: #1e3a8a;">(555) 123-4567</p>
                </div>
                <div style="text-align: center; padding: 15px; background: #fce7f3; border-radius: 10px;">
                  <p style="margin: 0; font-size: 12px; color: #9f1239; font-weight: 600;">LOCATION</p>
                  <p style="margin: 5px 0 0 0; font-size: 13px; color: #881337;">City, State</p>
                </div>
              </div>

              <div style="margin-bottom: 30px;">
                <div style="background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%); height: 4px; width: 60px; margin-bottom: 15px;"></div>
                <h2 style="margin: 0 0 15px 0; font-size: 24px; font-weight: 700; color: #1e293b;">About Me</h2>
                <p style="margin: 0; line-height: 1.7; color: #475569; font-size: 15px;">
                  [Share your creative journey, unique approach, and what drives your passion in your field.]
                </p>
              </div>

              <div style="margin-bottom: 30px;">
                <div style="background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%); height: 4px; width: 60px; margin-bottom: 15px;"></div>
                <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1e293b;">Experience</h2>
                
                <div style="border-left: 3px solid #fce7f3; padding-left: 20px; margin-bottom: 20px;">
                  <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">Your Current Role</h3>
                  <p style="margin: 6px 0; font-size: 15px; color: #f5576c; font-weight: 600;">Company Name</p>
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">Month Year - Present</p>
                  <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.7;">
                    <li style="margin-bottom: 6px;">Creative achievement or project highlight</li>
                    <li style="margin-bottom: 6px;">Impact you've made in your role</li>
                    <li>Skills or tools you've mastered</li>
                  </ul>
                </div>
              </div>

              <div style="margin-bottom: 30px;">
                <div style="background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%); height: 4px; width: 60px; margin-bottom: 15px;"></div>
                <h2 style="margin: 0 0 15px 0; font-size: 24px; font-weight: 700; color: #1e293b;">Skills & Expertise</h2>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                  <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 18px; border-radius: 25px; font-size: 14px; font-weight: 600;">Design</span>
                  <span style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 10px 18px; border-radius: 25px; font-size: 14px; font-weight: 600;">Creativity</span>
                  <span style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 10px 18px; border-radius: 25px; font-size: 14px; font-weight: 600;">Innovation</span>
                </div>
              </div>

              <div>
                <div style="background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%); height: 4px; width: 60px; margin-bottom: 15px;"></div>
                <h2 style="margin: 0 0 15px 0; font-size: 24px; font-weight: 700; color: #1e293b;">Education</h2>
                <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">Your Degree</h3>
                <p style="margin: 6px 0; font-size: 15px; color: #475569;">University Name</p>
                <p style="margin: 0; font-size: 14px; color: #64748b;">Year - Year</p>
              </div>
            </div>
          </div>
        `,
      });

      // Template 4: Minimalist
      editorInstance.BlockManager.add('template-minimalist', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">📋</div><strong>Minimalist</strong><br/><small>Simple & Clean</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Inter', sans-serif; max-width: 794px; margin: 0 auto; background: white; padding: 50px;">
            <div style="margin-bottom: 40px;">
              <h1 style="margin: 0; font-size: 36px; font-weight: 300; color: #1a1a1a; letter-spacing: -1px;">Your Name</h1>
              <p style="margin: 8px 0 15px 0; font-size: 16px; color: #666; font-weight: 300;">Your Professional Title</p>
              <p style="margin: 0; font-size: 13px; color: #888; line-height: 1.8;">
                email@example.com • (555) 123-4567 • City, State • linkedin.com/in/yourprofile
              </p>
            </div>

            <div style="margin-bottom: 35px;">
              <h2 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px;">Summary</h2>
              <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #444;">
                Brief professional summary highlighting your expertise and value proposition. Keep it concise and impactful.
              </p>
            </div>

            <div style="margin-bottom: 35px;">
              <h2 style="margin: 0 0 20px 0; font-size: 12px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px;">Experience</h2>
              <div style="margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #1a1a1a;">Job Title</h3>
                  <span style="font-size: 13px; color: #888;">2020 - Present</span>
                </div>
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Company Name</p>
                <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #444; line-height: 1.7;">
                  <li style="margin-bottom: 6px;">Key achievement or responsibility</li>
                  <li style="margin-bottom: 6px;">Key achievement or responsibility</li>
                </ul>
              </div>
            </div>

            <div style="margin-bottom: 35px;">
              <h2 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px;">Education</h2>
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #1a1a1a;">Degree Name</h3>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #666;">University Name</p>
                </div>
                <span style="font-size: 13px; color: #888;">2016 - 2020</span>
              </div>
            </div>

            <div>
              <h2 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px;">Skills</h2>
              <p style="margin: 0; font-size: 13px; color: #444; line-height: 1.8;">
                Skill 1 • Skill 2 • Skill 3 • Skill 4 • Skill 5 • Skill 6
              </p>
            </div>
          </div>
        `,
      });

      // Template 5: Executive
      editorInstance.BlockManager.add('template-executive', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">👔</div><strong>Executive</strong><br/><small>Senior Level</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Roboto', serif; max-width: 794px; margin: 0 auto; background: white;">
            <div style="background: #1a1a1a; color: white; padding: 50px 50px 40px;">
              <h1 style="margin: 0; font-size: 40px; font-weight: 700; letter-spacing: -1px;">YOUR NAME</h1>
              <p style="margin: 12px 0 0 0; font-size: 18px; opacity: 0.9;">Chief Executive Officer</p>
            </div>
            
            <div style="padding: 0 50px 30px; background: #1a1a1a;">
              <div style="background: white; padding: 25px; margin-top: -20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.6; text-align: center;">
                  email@example.com  |  (555) 123-4567  |  linkedin.com/in/profile  |  City, State
                </p>
              </div>
            </div>

            <div style="padding: 30px 50px;">
              <h2 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; border-bottom: 3px solid #1a1a1a; padding-bottom: 8px; letter-spacing: 1px;">Executive Profile</h2>
              <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #333;">
                Senior executive with 15+ years driving organizational growth and operational excellence. Proven expertise in strategic planning, P&L management, and building high-performing teams.
              </p>
            </div>

            <div style="padding: 30px 50px;">
              <h2 style="margin: 0 0 20px 0; font-size: 14px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; border-bottom: 3px solid #1a1a1a; padding-bottom: 8px; letter-spacing: 1px;">Professional Experience</h2>
              <div style="margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <div>
                    <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1a1a1a;">Chief Operating Officer</h3>
                    <p style="margin: 4px 0; font-size: 14px; color: #666;">Fortune 500 Company</p>
                  </div>
                  <span style="font-size: 13px; color: #888; white-space: nowrap;">2018 - Present</span>
                </div>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 13px; color: #333; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">Spearheaded $50M revenue growth initiative across 5 business units</li>
                  <li style="margin-bottom: 8px;">Led organizational transformation impacting 500+ employees</li>
                  <li>Optimized operations resulting in 25% efficiency improvement</li>
                </ul>
              </div>
            </div>

            <div style="padding: 30px 50px;">
              <h2 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; border-bottom: 3px solid #1a1a1a; padding-bottom: 8px; letter-spacing: 1px;">Education & Credentials</h2>
              <div style="margin-bottom: 12px;">
                <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: #1a1a1a;">MBA, Business Administration</h3>
                <p style="margin: 4px 0; font-size: 14px; color: #666;">Harvard Business School</p>
              </div>
            </div>
          </div>
        `,
      });

      // Template 6: Tech Focus
      editorInstance.BlockManager.add('template-tech', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">💻</div><strong>Tech Pro</strong><br/><small>Developer Style</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Roboto', monospace; max-width: 794px; margin: 0 auto; background: #0a0a0a; color: #e0e0e0;">
            <div style="background: linear-gradient(135deg, #00d4ff 0%, #7b2ff7 100%); padding: 2px;">
              <div style="background: #0a0a0a; padding: 40px;">
                <h1 style="margin: 0; font-size: 38px; font-weight: 700; color: #00d4ff;">Your Name</h1>
                <p style="margin: 8px 0 0 0; font-size: 18px; color: #7b2ff7; font-weight: 600;">Full Stack Developer</p>
                <p style="margin: 15px 0 0 0; font-size: 13px; color: #888;">
                  <span style="color: #00d4ff;">const</span> contact = { email: "dev@example.com", phone: "+1-555-0123", github: "@username" }
                </p>
              </div>
            </div>

            <div style="padding: 35px 40px;">
              <h2 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #00d4ff; text-transform: uppercase; font-family: monospace;">// About</h2>
              <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #c0c0c0;">
                Passionate software engineer specializing in modern web technologies. Building scalable applications with clean code and best practices.
              </p>
            </div>

            <div style="padding: 35px 40px;">
              <h2 style="margin: 0 0 20px 0; font-size: 14px; font-weight: 700; color: #00d4ff; text-transform: uppercase; font-family: monospace;">// Experience</h2>
              <div style="margin-bottom: 25px; border-left: 2px solid #7b2ff7; padding-left: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #e0e0e0;">Senior Developer</h3>
                  <span style="font-size: 12px; color: #888;">2020 - Present</span>
                </div>
                <p style="margin: 4px 0 10px 0; font-size: 14px; color: #7b2ff7;">Tech Startup Inc.</p>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #c0c0c0; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">Built microservices architecture using Node.js and Docker</li>
                  <li style="margin-bottom: 8px;">Implemented CI/CD pipeline reducing deployment time by 70%</li>
                  <li>Mentored 5 junior developers in modern JavaScript practices</li>
                </ul>
              </div>
            </div>

            <div style="padding: 35px 40px;">
              <h2 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #00d4ff; text-transform: uppercase; font-family: monospace;">// Tech Stack</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <span style="background: #1a1a1a; border: 1px solid #7b2ff7; color: #00d4ff; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-family: monospace;">JavaScript</span>
                <span style="background: #1a1a1a; border: 1px solid #7b2ff7; color: #00d4ff; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-family: monospace;">React</span>
                <span style="background: #1a1a1a; border: 1px solid #7b2ff7; color: #00d4ff; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-family: monospace;">Node.js</span>
                <span style="background: #1a1a1a; border: 1px solid #7b2ff7; color: #00d4ff; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-family: monospace;">TypeScript</span>
                <span style="background: #1a1a1a; border: 1px solid #7b2ff7; color: #00d4ff; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-family: monospace;">Docker</span>
                <span style="background: #1a1a1a; border: 1px solid #7b2ff7; color: #00d4ff; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-family: monospace;">AWS</span>
              </div>
            </div>
          </div>
        `,
      });

      // Template 7: Compact
      editorInstance.BlockManager.add('template-compact', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">📄</div><strong>Compact</strong><br/><small>One Page</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Inter', sans-serif; max-width: 794px; margin: 0 auto; background: white; padding: 40px; font-size: 12px;">
            <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #2563eb;">
              <h1 style="margin: 0 0 6px 0; font-size: 28px; font-weight: 700; color: #1e293b;">YOUR NAME</h1>
              <p style="margin: 0 0 8px 0; font-size: 15px; color: #2563eb; font-weight: 600;">Your Professional Title</p>
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                email@example.com • (555) 123-4567 • linkedin.com/in/profile • City, State
              </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
              <div>
                <h2 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #1e293b; text-transform: uppercase; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">Experience</h2>
                <div style="margin-bottom: 15px;">
                  <h3 style="margin: 0 0 3px 0; font-size: 13px; font-weight: 600; color: #1e293b;">Job Title</h3>
                  <p style="margin: 0 0 2px 0; font-size: 11px; color: #2563eb;">Company Name</p>
                  <p style="margin: 0 0 6px 0; font-size: 10px; color: #64748b;">2020 - Present</p>
                  <ul style="margin: 0; padding-left: 15px; font-size: 11px; color: #475569; line-height: 1.6;">
                    <li style="margin-bottom: 4px;">Key achievement</li>
                    <li>Key achievement</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #1e293b; text-transform: uppercase; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">Skills</h2>
                <p style="margin: 0 0 15px 0; font-size: 11px; color: #475569; line-height: 1.6;">
                  JavaScript • Python • React • Node.js • SQL • AWS • Docker • Git
                </p>
                
                <h2 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #1e293b; text-transform: uppercase; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">Education</h2>
                <h3 style="margin: 0 0 3px 0; font-size: 12px; font-weight: 600; color: #1e293b;">Degree Name</h3>
                <p style="margin: 0 0 2px 0; font-size: 11px; color: #475569;">University Name</p>
                <p style="margin: 0; font-size: 10px; color: #64748b;">2016 - 2020</p>
              </div>
            </div>
          </div>
        `,
      });

      // Template 8: Timeline
      editorInstance.BlockManager.add('template-timeline', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">⏱️</div><strong>Timeline</strong><br/><small>Visual Journey</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Inter', sans-serif; max-width: 794px; margin: 0 auto; background: white;">
            <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 40px; color: white; text-align: center;">
              <h1 style="margin: 0 0 8px 0; font-size: 40px; font-weight: 700;">Your Name</h1>
              <p style="margin: 0; font-size: 18px; opacity: 0.95;">Your Career Journey</p>
            </div>

            <div style="padding: 40px;">
              <div style="border-left: 3px solid #3b82f6; padding-left: 30px; margin-left: 20px;">
                <div style="position: relative; margin-bottom: 35px;">
                  <div style="position: absolute; left: -38px; top: 0; width: 16px; height: 16px; border-radius: 50%; background: #3b82f6; border: 3px solid white; box-shadow: 0 0 0 3px #3b82f6;"></div>
                  <span style="display: block; font-size: 12px; color: #3b82f6; font-weight: 600; margin-bottom: 8px;">2020 - PRESENT</span>
                  <h3 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 700; color: #1e293b;">Senior Developer</h3>
                  <p style="margin: 0 0 10px 0; font-size: 15px; color: #64748b;">Tech Company Inc.</p>
                  <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.7;">
                    <li style="margin-bottom: 6px;">Led development of key features</li>
                    <li>Managed team of 5 developers</li>
                  </ul>
                </div>

                <div style="position: relative; margin-bottom: 35px;">
                  <div style="position: absolute; left: -38px; top: 0; width: 16px; height: 16px; border-radius: 50%; background: #3b82f6; border: 3px solid white; box-shadow: 0 0 0 3px #3b82f6;"></div>
                  <span style="display: block; font-size: 12px; color: #3b82f6; font-weight: 600; margin-bottom: 8px;">2017 - 2020</span>
                  <h3 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 700; color: #1e293b;">Developer</h3>
                  <p style="margin: 0 0 10px 0; font-size: 15px; color: #64748b;">Previous Company</p>
                  <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.7;">
                    <li style="margin-bottom: 6px;">Built scalable applications</li>
                    <li>Collaborated with cross-functional teams</li>
                  </ul>
                </div>

                <div style="position: relative;">
                  <div style="position: absolute; left: -38px; top: 0; width: 16px; height: 16px; border-radius: 50%; background: #3b82f6; border: 3px solid white; box-shadow: 0 0 0 3px #3b82f6;"></div>
                  <span style="display: block; font-size: 12px; color: #3b82f6; font-weight: 600; margin-bottom: 8px;">2013 - 2017</span>
                  <h3 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 700; color: #1e293b;">Bachelor's Degree</h3>
                  <p style="margin: 0; font-size: 15px; color: #64748b;">University Name</p>
                </div>
              </div>
            </div>

            <div style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700; color: #1e293b;">Skills</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                <span style="background: #eff6ff; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">JavaScript</span>
                <span style="background: #eff6ff; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">React</span>
                <span style="background: #eff6ff; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">Node.js</span>
              </div>
            </div>
          </div>
        `,
      });

      // Template 9: Bold Colors
      editorInstance.BlockManager.add('template-bold', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">🎨</div><strong>Bold Colors</strong><br/><small>Eye-catching</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Inter', sans-serif; max-width: 794px; margin: 0 auto; background: #fef3c7;">
            <div style="background: #f59e0b; padding: 50px; text-align: center;">
              <h1 style="margin: 0; font-size: 44px; font-weight: 800; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">YOUR NAME</h1>
              <p style="margin: 10px 0 0 0; font-size: 20px; color: #fffbeb; font-weight: 600;">Marketing & Brand Specialist</p>
            </div>

            <div style="padding: 35px 50px;">
              <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #f59e0b;">About Me</h2>
                <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #1f2937;">
                  Creative professional with a passion for building compelling brand narratives and driving engagement.
                </p>
              </div>

              <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h2 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 700; color: #f59e0b;">Experience</h2>
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">Brand Manager</h3>
                <p style="margin: 6px 0; font-size: 14px; color: #6b7280;">Company Name | 2019 - Present</p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 13px; color: #374151; line-height: 1.7;">
                  <li style="margin-bottom: 6px;">Increased brand awareness by 150%</li>
                  <li>Managed $2M marketing budget</li>
                </ul>
              </div>

              <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #f59e0b;">Skills</h2>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  <span style="background: #f59e0b; color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">Branding</span>
                  <span style="background: #f59e0b; color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">Marketing</span>
                  <span style="background: #f59e0b; color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">Design</span>
                </div>
              </div>
            </div>
          </div>
        `,
      });

      // Template 10: Academic
      editorInstance.BlockManager.add('template-academic', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">🎓</div><strong>Academic</strong><br/><small>Research Focus</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Roboto', serif; max-width: 794px; margin: 0 auto; background: white; padding: 60px 50px;">
            <div style="text-align: center; margin-bottom: 35px; border-bottom: 1px solid #cbd5e1; padding-bottom: 25px;">
              <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 400; color: #1e293b;">Dr. Your Name, Ph.D.</h1>
              <p style="margin: 0 0 10px 0; font-size: 15px; color: #64748b; font-style: italic;">Research Scientist | Assistant Professor</p>
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                email@university.edu • Office: Building 123 • Phone: (555) 123-4567
              </p>
            </div>

            <div style="margin-bottom: 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #1e293b; text-transform: uppercase; letter-spacing: 1px;">Research Interests</h2>
              <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #475569;">
                Machine Learning, Natural Language Processing, Computational Linguistics, AI Ethics
              </p>
            </div>

            <div style="margin-bottom: 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #1e293b; text-transform: uppercase; letter-spacing: 1px;">Education</h2>
              <div style="margin-bottom: 12px;">
                <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b;">Ph.D. in Computer Science</h3>
                <p style="margin: 4px 0; font-size: 13px; color: #64748b; font-style: italic;">Stanford University, 2018</p>
                <p style="margin: 4px 0; font-size: 13px; color: #475569;">Dissertation: "Advanced Neural Networks for Language Understanding"</p>
              </div>
            </div>

            <div style="margin-bottom: 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #1e293b; text-transform: uppercase; letter-spacing: 1px;">Selected Publications</h2>
              <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;">
                <li style="margin-bottom: 10px;">Your Name, et al. (2023). "Paper Title." <i>Journal Name</i>, Vol. 10, pp. 123-145.</li>
                <li>Your Name, et al. (2022). "Another Paper Title." <i>Conference Name</i>.</li>
              </ol>
            </div>

            <div>
              <h2 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #1e293b; text-transform: uppercase; letter-spacing: 1px;">Teaching Experience</h2>
              <p style="margin: 0; font-size: 14px; color: #475569;"><strong>CS 101:</strong> Introduction to Computer Science (Fall 2020 - Present)</p>
            </div>
          </div>
        `,
      });

      // Template 11: Sidebar Blue
      editorInstance.BlockManager.add('template-sidebar-blue', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">📘</div><strong>Blue Sidebar</strong><br/><small>Split Layout</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Inter', sans-serif; max-width: 794px; margin: 0 auto; background: white; display: grid; grid-template-columns: 260px 1fr;">
            <div style="background: #1e40af; color: white; padding: 40px 25px;">
              <div style="margin-bottom: 30px;">
                <h1 style="margin: 0; font-size: 26px; font-weight: 700;">Your Name</h1>
                <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.9;">Professional Title</p>
              </div>

              <div style="margin-bottom: 25px;">
                <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 6px;">Contact</h3>
                <p style="margin: 0; font-size: 11px; line-height: 1.8; opacity: 0.95;">
                  📧 email@example.com<br/>
                  📱 (555) 123-4567<br/>
                  📍 City, State<br/>
                  🔗 linkedin.com/in/you
                </p>
              </div>

              <div style="margin-bottom: 25px;">
                <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 6px;">Skills</h3>
                <div style="font-size: 11px; line-height: 2;">
                  • JavaScript<br/>
                  • Python<br/>
                  • React<br/>
                  • Node.js<br/>
                  • SQL
                </div>
              </div>

              <div>
                <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 6px;">Languages</h3>
                <p style="margin: 0; font-size: 11px; line-height: 1.8;">English (Native)<br/>Spanish (Fluent)</p>
              </div>
            </div>

            <div style="padding: 40px 35px;">
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #1e40af;">Profile</h2>
                <p style="margin: 0; font-size: 13px; line-height: 1.7; color: #475569;">
                  Dedicated professional with expertise in delivering high-quality solutions and driving results.
                </p>
              </div>

              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700; color: #1e40af;">Experience</h2>
                <div style="margin-bottom: 20px;">
                  <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #1e293b;">Job Title</h3>
                  <p style="margin: 4px 0; font-size: 13px; color: #64748b;">Company Name | 2020 - Present</p>
                  <ul style="margin: 8px 0 0 0; padding-left: 18px; font-size: 12px; color: #475569; line-height: 1.6;">
                    <li style="margin-bottom: 5px;">Key responsibility or achievement</li>
                    <li>Key responsibility or achievement</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #1e40af;">Education</h2>
                <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b;">Degree Name</h3>
                <p style="margin: 4px 0; font-size: 13px; color: #64748b;">University Name | 2016 - 2020</p>
              </div>
            </div>
          </div>
        `,
      });

      // Template 12: Green Nature
      editorInstance.BlockManager.add('template-green', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">🌿</div><strong>Green Fresh</strong><br/><small>Nature Theme</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Open Sans', sans-serif; max-width: 794px; margin: 0 auto; background: white;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 45px; text-align: center; color: white;">
              <h1 style="margin: 0 0 10px 0; font-size: 42px; font-weight: 700;">Your Name</h1>
              <p style="margin: 0; font-size: 19px; opacity: 0.95;">Environmental Specialist</p>
              <p style="margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">
                email@example.com • (555) 123-4567 • City, State
              </p>
            </div>

            <div style="padding: 35px 45px;">
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #059669;">About</h2>
                <div style="height: 3px; width: 50px; background: #10b981; margin-bottom: 15px;"></div>
                <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #475569;">
                  Passionate about sustainability and environmental conservation with 8+ years of experience.
                </p>
              </div>

              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #059669;">Professional Experience</h2>
                <div style="height: 3px; width: 50px; background: #10b981; margin-bottom: 15px;"></div>
                <div style="margin-bottom: 20px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <h3 style="margin: 0; font-size: 17px; font-weight: 600; color: #1e293b;">Senior Environmental Consultant</h3>
                    <span style="font-size: 13px; color: #10b981; font-weight: 600;">2019 - Present</span>
                  </div>
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">Green Solutions Inc.</p>
                  <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;">
                    <li style="margin-bottom: 6px;">Led 20+ sustainability projects</li>
                    <li>Reduced carbon footprint by 40%</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #059669;">Core Competencies</h2>
                <div style="height: 3px; width: 50px; background: #10b981; margin-bottom: 15px;"></div>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                  <span style="background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">Sustainability</span>
                  <span style="background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">Project Management</span>
                  <span style="background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">Environmental Policy</span>
                </div>
              </div>
            </div>
          </div>
        `,
      });

      // Template 13: Purple Creative
      editorInstance.BlockManager.add('template-purple', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">💜</div><strong>Purple Wave</strong><br/><small>Creative Design</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Inter', sans-serif; max-width: 794px; margin: 0 auto; background: linear-gradient(180deg, #f3e8ff 0%, white 30%);">
            <div style="padding: 50px 45px 30px;">
              <h1 style="margin: 0; font-size: 46px; font-weight: 800; color: #7c3aed; line-height: 1.2;">Your Name</h1>
              <p style="margin: 12px 0 0 0; font-size: 20px; color: #6d28d9; font-weight: 600;">Creative Director & Designer</p>
              <div style="margin-top: 20px; font-size: 14px; color: #64748b;">
                <span style="margin-right: 20px;">✉️ email@example.com</span>
                <span style="margin-right: 20px;">📱 (555) 123-4567</span>
                <span>🌐 portfolio.com</span>
              </div>
            </div>

            <div style="padding: 0 45px 35px;">
              <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.1); margin-bottom: 25px;">
                <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700; color: #7c3aed;">Creative Vision</h2>
                <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #475569;">
                  Award-winning designer with 10+ years creating memorable brand experiences and innovative digital solutions.
                </p>
              </div>

              <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.1); margin-bottom: 25px;">
                <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #7c3aed;">Experience Highlights</h2>
                <div style="margin-bottom: 20px; border-left: 4px solid #7c3aed; padding-left: 20px;">
                  <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: #1e293b;">Creative Director</h3>
                  <p style="margin: 6px 0; font-size: 14px; color: #64748b;">Design Studio | 2018 - Present</p>
                  <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;">
                    <li style="margin-bottom: 6px;">Led rebranding for Fortune 500 companies</li>
                    <li>Managed creative team of 15+ designers</li>
                  </ul>
                </div>
              </div>

              <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.1);">
                <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700; color: #7c3aed;">Expertise</h2>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                  <span style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); color: white; padding: 10px 18px; border-radius: 25px; font-size: 13px; font-weight: 600;">UI/UX Design</span>
                  <span style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); color: white; padding: 10px 18px; border-radius: 25px; font-size: 13px; font-weight: 600;">Branding</span>
                  <span style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); color: white; padding: 10px 18px; border-radius: 25px; font-size: 13px; font-weight: 600;">Figma</span>
                </div>
              </div>
            </div>
          </div>
        `,
      });

      // Template 14: Red Corporate
      editorInstance.BlockManager.add('template-red', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">🔴</div><strong>Red Power</strong><br/><small>Corporate Bold</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Roboto', sans-serif; max-width: 794px; margin: 0 auto; background: white;">
            <div style="background: #dc2626; color: white; padding: 0;">
              <div style="padding: 45px 50px;">
                <h1 style="margin: 0; font-size: 40px; font-weight: 700; letter-spacing: -1px;">YOUR NAME</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: 500; opacity: 0.95;">Business Development Executive</p>
              </div>
              <div style="background: rgba(0,0,0,0.15); padding: 18px 50px; font-size: 13px;">
                📧 email@example.com  •  📱 (555) 123-4567  •  📍 City, State
              </div>
            </div>

            <div style="padding: 40px 50px;">
              <div style="margin-bottom: 35px;">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <div style="width: 6px; height: 24px; background: #dc2626; margin-right: 12px;"></div>
                  <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #1e293b;">Executive Summary</h2>
                </div>
                <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #475569;">
                  Dynamic business leader with proven track record of driving revenue growth and building strategic partnerships. 12+ years of experience in B2B sales and business development.
                </p>
              </div>

              <div style="margin-bottom: 35px;">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <div style="width: 6px; height: 24px; background: #dc2626; margin-right: 12px;"></div>
                  <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #1e293b;">Professional Experience</h2>
                </div>
                <div style="margin-bottom: 20px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: #1e293b;">VP of Business Development</h3>
                    <span style="font-size: 13px; color: #dc2626; font-weight: 600;">2018 - Present</span>
                  </div>
                  <p style="margin: 0 0 10px 0; font-size: 15px; color: #64748b;">Tech Corporation Inc.</p>
                  <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;">
                    <li style="margin-bottom: 6px;">Increased annual revenue by $25M through strategic partnerships</li>
                    <li style="margin-bottom: 6px;">Expanded market presence to 15 new territories</li>
                    <li>Built and led high-performing sales team of 30+</li>
                  </ul>
                </div>
              </div>

              <div>
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <div style="width: 6px; height: 24px; background: #dc2626; margin-right: 12px;"></div>
                  <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #1e293b;">Core Competencies</h2>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; color: #475569;">
                  <div>• Strategic Planning</div>
                  <div>• Partnership Development</div>
                  <div>• Revenue Growth</div>
                  <div>• Team Leadership</div>
                </div>
              </div>
            </div>
          </div>
        `,
      });

      // Template 15: Orange Energy
      editorInstance.BlockManager.add('template-orange', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">🟠</div><strong>Orange Vibe</strong><br/><small>Energetic</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Inter', sans-serif; max-width: 794px; margin: 0 auto; background: white;">
            <div style="display: grid; grid-template-columns: 1fr 1fr;">
              <div style="background: #ea580c; padding: 50px 35px; color: white;">
                <h1 style="margin: 0; font-size: 36px; font-weight: 800;">Your<br/>Name</h1>
                <p style="margin: 15px 0 0 0; font-size: 16px; opacity: 0.95;">Sales & Marketing Pro</p>
              </div>
              <div style="background: #fed7aa; padding: 50px 35px;">
                <div style="font-size: 13px; color: #7c2d12; line-height: 2;">
                  <div><strong>Email:</strong> you@email.com</div>
                  <div><strong>Phone:</strong> (555) 123-4567</div>
                  <div><strong>Location:</strong> City, State</div>
                  <div><strong>LinkedIn:</strong> /in/yourname</div>
                </div>
              </div>
            </div>

            <div style="padding: 35px 40px;">
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 700; color: #ea580c;">Professional Summary</h2>
                <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #475569;">
                  Results-driven sales professional with 8+ years exceeding targets and building lasting client relationships.
                </p>
              </div>

              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700; color: #ea580c;">Key Achievements</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div style="background: #ffedd5; padding: 20px; border-radius: 8px;">
                    <h3 style="margin: 0; font-size: 24px; font-weight: 800; color: #ea580c;">150%</h3>
                    <p style="margin: 6px 0 0 0; font-size: 12px; color: #7c2d12;">Exceeded Sales Target</p>
                  </div>
                  <div style="background: #ffedd5; padding: 20px; border-radius: 8px;">
                    <h3 style="margin: 0; font-size: 24px; font-weight: 800; color: #ea580c;">$5M+</h3>
                    <p style="margin: 6px 0 0 0; font-size: 12px; color: #7c2d12;">Revenue Generated</p>
                  </div>
                </div>
              </div>

              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700; color: #ea580c;">Experience</h2>
                <div>
                  <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1e293b;">Senior Sales Manager</h3>
                  <p style="margin: 4px 0 8px 0; font-size: 13px; color: #64748b;">Company Name | 2018 - Present</p>
                  <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;">
                    <li style="margin-bottom: 5px;">Built pipeline of 200+ qualified leads</li>
                    <li>Closed deals worth $5M+ annually</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #ea580c;">Skills</h2>
                <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.8;">
                  B2B Sales • Lead Generation • CRM Management • Negotiation • Account Management
                </p>
              </div>
            </div>
          </div>
        `,
      });

      // Template 16: Teal Modern
      editorInstance.BlockManager.add('template-teal', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">🔷</div><strong>Teal Modern</strong><br/><small>Fresh Look</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Inter', sans-serif; max-width: 794px; margin: 0 auto; background: white;">
            <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 2px;">
              <div style="background: white; margin: 30px; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 38px; font-weight: 700; color: #0f766e;">Your Name</h1>
                <p style="margin: 10px 0 0 0; font-size: 17px; color: #14b8a6; font-weight: 600;">Data Analyst</p>
              </div>
            </div>

            <div style="padding: 35px 45px;">
              <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #99f6e4;">
                <p style="margin: 0; font-size: 13px; color: #64748b;">
                  email@example.com  |  (555) 123-4567  |  linkedin.com/in/profile  |  City, State
                </p>
              </div>

              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #0f766e; text-transform: uppercase; letter-spacing: 2px;">Professional Profile</h2>
                <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #475569;">
                  Data-driven analyst with expertise in turning complex datasets into actionable insights. Proficient in Python, SQL, and data visualization tools.
                </p>
              </div>

              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #0f766e; text-transform: uppercase; letter-spacing: 2px;">Work Experience</h2>
                <div style="background: #f0fdfa; padding: 20px; border-left: 4px solid #14b8a6; margin-bottom: 15px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1e293b;">Data Analyst</h3>
                    <span style="font-size: 12px; color: #0f766e; font-weight: 600;">2020 - Present</span>
                  </div>
                  <p style="margin: 4px 0 10px 0; font-size: 14px; color: #14b8a6;">Tech Company</p>
                  <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;">
                    <li style="margin-bottom: 5px;">Analyzed datasets of 10M+ records</li>
                    <li>Built dashboards improving decision-making by 40%</li>
                  </ul>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                <div>
                  <h2 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #0f766e; text-transform: uppercase; letter-spacing: 2px;">Skills</h2>
                  <div style="font-size: 12px; color: #475569; line-height: 1.8;">
                    • Python & R<br/>
                    • SQL & NoSQL<br/>
                    • Tableau & Power BI<br/>
                    • Machine Learning<br/>
                    • Statistical Analysis
                  </div>
                </div>
                <div>
                  <h2 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #0f766e; text-transform: uppercase; letter-spacing: 2px;">Education</h2>
                  <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b;">B.S. in Data Science</h3>
                  <p style="margin: 4px 0; font-size: 12px; color: #64748b;">University Name, 2020</p>
                </div>
              </div>
            </div>
          </div>
        `,
      });

      // Template 17: Pink Creative
      editorInstance.BlockManager.add('template-pink', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">🌸</div><strong>Pink Dream</strong><br/><small>Soft & Creative</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Inter', sans-serif; max-width: 794px; margin: 0 auto; background: linear-gradient(180deg, #fce7f3 0%, white 40%);">
            <div style="padding: 50px 45px 35px;">
              <div style="display: inline-block; background: white; padding: 25px 35px; border-radius: 20px; box-shadow: 0 8px 30px rgba(219, 39, 119, 0.15);">
                <h1 style="margin: 0; font-size: 40px; font-weight: 700; color: #db2777;">Your Name</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px; color: #ec4899; font-weight: 500;">Content Creator & Influencer</p>
              </div>
            </div>

            <div style="padding: 0 45px 40px;">
              <div style="display: flex; justify-content: center; gap: 25px; margin-bottom: 35px; flex-wrap: wrap;">
                <div style="background: white; padding: 15px 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(219, 39, 119, 0.1);">
                  <span style="font-size: 12px; color: #db2777;">📧</span> email@example.com
                </div>
                <div style="background: white; padding: 15px 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(219, 39, 119, 0.1);">
                  <span style="font-size: 12px; color: #db2777;">📱</span> (555) 123-4567
                </div>
                <div style="background: white; padding: 15px 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(219, 39, 119, 0.1);">
                  <span style="font-size: 12px; color: #db2777;">🌐</span> @yourusername
                </div>
              </div>

              <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 20px rgba(219, 39, 119, 0.08); margin-bottom: 25px;">
                <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #db2777;">About Me</h2>
                <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #475569;">
                  Creative content creator with 500K+ followers across platforms. Specializing in lifestyle, fashion, and brand collaborations.
                </p>
              </div>

              <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 20px rgba(219, 39, 119, 0.08); margin-bottom: 25px;">
                <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700; color: #db2777;">Brand Collaborations</h2>
                <div style="margin-bottom: 15px;">
                  <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1e293b;">Fashion Brand Campaign</h3>
                  <p style="margin: 6px 0; font-size: 13px; color: #64748b;">Major Fashion Brand | 2023</p>
                  <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6;">
                    Reached 2M+ impressions with 8% engagement rate
                  </p>
                </div>
              </div>

              <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 20px rgba(219, 39, 119, 0.08);">
                <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700; color: #db2777;">Platform Stats</h2>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center;">
                  <div style="background: #fce7f3; padding: 15px; border-radius: 10px;">
                    <div style="font-size: 20px; font-weight: 700; color: #db2777;">300K</div>
                    <div style="font-size: 11px; color: #9f1239; margin-top: 4px;">Instagram</div>
                  </div>
                  <div style="background: #fce7f3; padding: 15px; border-radius: 10px;">
                    <div style="font-size: 20px; font-weight: 700; color: #db2777;">150K</div>
                    <div style="font-size: 11px; color: #9f1239; margin-top: 4px;">TikTok</div>
                  </div>
                  <div style="background: #fce7f3; padding: 15px; border-radius: 10px;">
                    <div style="font-size: 20px; font-weight: 700; color: #db2777;">50K</div>
                    <div style="font-size: 11px; color: #9f1239; margin-top: 4px;">YouTube</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
      });

      // Template 18: Navy Professional
      editorInstance.BlockManager.add('template-navy', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">🔷</div><strong>Navy Elite</strong><br/><small>Professional</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Roboto', sans-serif; max-width: 794px; margin: 0 auto; background: white;">
            <div style="background: #1e3a8a; color: white; padding: 45px 50px;">
              <h1 style="margin: 0; font-size: 38px; font-weight: 700;">YOUR NAME</h1>
              <p style="margin: 10px 0 20px 0; font-size: 17px; opacity: 0.95;">Financial Analyst | CFA Candidate</p>
              <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 15px; font-size: 13px; opacity: 0.9;">
                email@example.com • (555) 123-4567 • City, State • linkedin.com/in/profile
              </div>
            </div>

            <div style="padding: 40px 50px;">
              <div style="margin-bottom: 35px;">
                <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1px;">Professional Summary</h2>
                <div style="height: 2px; background: #1e3a8a; width: 60px; margin-bottom: 15px;"></div>
                <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #475569;">
                  Analytical financial professional with 7+ years of experience in investment analysis, portfolio management, and financial modeling. Strong track record of delivering data-driven insights.
                </p>
              </div>

              <div style="margin-bottom: 35px;">
                <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1px;">Professional Experience</h2>
                <div style="height: 2px; background: #1e3a8a; width: 60px; margin-bottom: 15px;"></div>
                <div style="margin-bottom: 20px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1e293b;">Senior Financial Analyst</h3>
                    <span style="font-size: 13px; color: #1e3a8a; font-weight: 600;">2019 - Present</span>
                  </div>
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">Investment Firm LLC</p>
                  <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;">
                    <li style="margin-bottom: 6px;">Managed portfolio of $50M+ in assets</li>
                    <li style="margin-bottom: 6px;">Conducted financial analysis for 100+ investment opportunities</li>
                    <li>Achieved 15% annual return outperforming market benchmark</li>
                  </ul>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                <div>
                  <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1px;">Education</h2>
                  <div style="height: 2px; background: #1e3a8a; width: 60px; margin-bottom: 12px;"></div>
                  <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b;">MBA in Finance</h3>
                  <p style="margin: 4px 0; font-size: 13px; color: #64748b;">Top Business School, 2019</p>
                </div>
                <div>
                  <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1px;">Certifications</h2>
                  <div style="height: 2px; background: #1e3a8a; width: 60px; margin-bottom: 12px;"></div>
                  <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.8;">
                    • CFA Level II Candidate<br/>
                    • Bloomberg Certified<br/>
                    • Series 7 & 63
                  </p>
                </div>
              </div>
            </div>
          </div>
        `,
      });

      // Template 19: Cyan Tech
      editorInstance.BlockManager.add('template-cyan', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">⚡</div><strong>Cyan Tech</strong><br/><small>Digital Pro</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Inter', sans-serif; max-width: 794px; margin: 0 auto; background: #083344;">
            <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 40px; clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);">
              <h1 style="margin: 0; font-size: 42px; font-weight: 800; color: white;">YOUR NAME</h1>
              <p style="margin: 12px 0 0 0; font-size: 20px; color: #cffafe; font-weight: 600;">Full Stack Developer</p>
            </div>

            <div style="padding: 30px 40px; color: white;">
              <div style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; font-size: 12px; color: #a5f3fc;">
                <span>📧 dev@example.com</span>
                <span>📱 (555) 123-4567</span>
                <span>💻 github.com/yourname</span>
                <span>📍 San Francisco, CA</span>
              </div>

              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 1px;">&lt; About /&gt;</h2>
                <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #cffafe;">
                  Passionate full-stack developer with 5+ years building scalable web applications. Expertise in React, Node.js, and cloud technologies.
                </p>
              </div>

              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 1px;">&lt; Experience /&gt;</h2>
                <div style="background: rgba(6, 182, 212, 0.1); padding: 20px; border-left: 3px solid #06b6d4; margin-bottom: 15px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: white;">Senior Developer</h3>
                    <span style="font-size: 12px; color: #06b6d4; font-weight: 600;">2020 - Present</span>
                  </div>
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #a5f3fc;">Tech Startup Inc.</p>
                  <div style="font-size: 13px; color: #cffafe; line-height: 1.8;">
                    • Built microservices handling 1M+ requests/day<br/>
                    • Reduced API response time by 60%<br/>
                    • Implemented CI/CD pipeline with 99.9% uptime
                  </div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
                <div>
                  <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 1px;">&lt; Stack /&gt;</h2>
                  <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <span style="background: rgba(6, 182, 212, 0.2); color: #06b6d4; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-family: monospace; border: 1px solid #06b6d4;">JavaScript</span>
                    <span style="background: rgba(6, 182, 212, 0.2); color: #06b6d4; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-family: monospace; border: 1px solid #06b6d4;">React</span>
                    <span style="background: rgba(6, 182, 212, 0.2); color: #06b6d4; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-family: monospace; border: 1px solid #06b6d4;">Node.js</span>
                    <span style="background: rgba(6, 182, 212, 0.2); color: #06b6d4; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-family: monospace; border: 1px solid #06b6d4;">Docker</span>
                  </div>
                </div>
                <div>
                  <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 1px;">&lt; Education /&gt;</h2>
                  <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: white;">B.S. Computer Science</h3>
                  <p style="margin: 4px 0; font-size: 12px; color: #a5f3fc;">Tech University, 2018</p>
                </div>
              </div>
            </div>
          </div>
        `,
      });

      // Template 20: Elegant Monochrome
      editorInstance.BlockManager.add('template-mono', {
        label: '<div style="text-align: center; padding: 10px;"><div style="font-size: 24px; margin-bottom: 5px;">⚫</div><strong>Monochrome</strong><br/><small>Elegant B&W</small></div>',
        category: 'Templates',
        content: `
          <div style="font-family: 'Roboto', serif; max-width: 794px; margin: 0 auto; background: white;">
            <div style="border: 8px solid #0a0a0a; padding: 50px 55px;">
              <div style="text-align: center; margin-bottom: 35px; padding-bottom: 30px; border-bottom: 2px solid #0a0a0a;">
                <h1 style="margin: 0; font-size: 44px; font-weight: 300; color: #0a0a0a; letter-spacing: 3px;">YOUR NAME</h1>
                <p style="margin: 15px 0 0 0; font-size: 16px; color: #444; letter-spacing: 4px; text-transform: uppercase;">Art Director</p>
              </div>

              <div style="display: flex; justify-content: center; gap: 30px; margin-bottom: 40px; font-size: 12px; color: #666;">
                <span>email@example.com</span>
                <span>|</span>
                <span>(555) 123-4567</span>
                <span>|</span>
                <span>portfolio.com</span>
              </div>

              <div style="margin-bottom: 35px;">
                <h2 style="margin: 0 0 15px 0; font-size: 12px; font-weight: 700; color: #0a0a0a; text-transform: uppercase; letter-spacing: 3px; text-align: center;">Profile</h2>
                <p style="margin: 0; font-size: 13px; line-height: 1.9; color: #444; text-align: center; max-width: 600px; margin-left: auto; margin-right: auto;">
                  Award-winning art director with 12+ years of experience creating visually stunning campaigns for international brands. Expertise in branding, print, and digital design.
                </p>
              </div>

              <div style="margin-bottom: 35px;">
                <h2 style="margin: 0 0 20px 0; font-size: 12px; font-weight: 700; color: #0a0a0a; text-transform: uppercase; letter-spacing: 3px; text-align: center;">Experience</h2>
                <div style="margin-bottom: 25px; padding: 20px; border: 1px solid #e5e7eb;">
                  <div style="text-align: center; margin-bottom: 10px;">
                    <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #0a0a0a; letter-spacing: 1px;">Senior Art Director</h3>
                    <p style="margin: 6px 0; font-size: 13px; color: #666;">Creative Agency | 2018 - Present</p>
                  </div>
                  <ul style="margin: 0; padding-left: 0; list-style: none; font-size: 12px; color: #444; line-height: 1.8; text-align: center;">
                    <li style="margin-bottom: 5px;">◆ Led creative direction for 50+ brand campaigns</li>
                    <li style="margin-bottom: 5px;">◆ Won 3 international design awards</li>
                    <li>◆ Managed creative team of 10+ designers</li>
                  </ul>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                <div style="text-align: center;">
                  <h2 style="margin: 0 0 15px 0; font-size: 12px; font-weight: 700; color: #0a0a0a; text-transform: uppercase; letter-spacing: 3px;">Expertise</h2>
                  <p style="margin: 0; font-size: 11px; color: #666; line-height: 2;">
                    Brand Identity<br/>
                    Print Design<br/>
                    Digital Campaigns<br/>
                    Art Direction<br/>
                    Typography
                  </p>
                </div>
                <div style="text-align: center;">
                  <h2 style="margin: 0 0 15px 0; font-size: 12px; font-weight: 700; color: #0a0a0a; text-transform: uppercase; letter-spacing: 3px;">Education</h2>
                  <h3 style="margin: 0; font-size: 13px; font-weight: 600; color: #0a0a0a;">BFA in Graphic Design</h3>
                  <p style="margin: 6px 0; font-size: 11px; color: #666;">Art Institute, 2010</p>
                </div>
              </div>
            </div>
          </div>
        `,
      });

      // Customize panels
      editorInstance.Panels.addButton('options', {
        id: 'export-pdf',
        className: 'fa fa-download',
        command: 'export-pdf',
        attributes: { title: 'Export as PDF' },
      });

      // Add export PDF command with proper CSS handling
      editorInstance.Commands.add('export-pdf', {
        run: async () => {
          try {
            // Get the canvas frame to access current content
            const canvasFrame = document.querySelector('.gjs-cv-canvas iframe') as HTMLIFrameElement;
            if (!canvasFrame || !canvasFrame.contentDocument) {
              alert('Unable to access canvas content. Please try again.');
              return;
            }

            // Get HTML from iframe directly to ensure we have the latest content including images
            const iframeDoc = canvasFrame.contentDocument;
            const iframeBody = iframeDoc.body;
            
            // Clone the body content to get the actual rendered HTML with images
            const bodyClone = iframeBody.cloneNode(true) as HTMLElement;
            
            // Get the actual profile image src from iframe if it exists
            const profileImage = iframeDoc.getElementById('profile-image') as HTMLImageElement;
            if (profileImage && profileImage.src && profileImage.style.display !== 'none') {
              // Find the image in the clone and update its src
              const clonedImage = bodyClone.querySelector('#profile-image') as HTMLImageElement;
              if (clonedImage) {
                clonedImage.src = profileImage.src;
                clonedImage.style.display = 'block';
                // Also hide the emoji in clone
                const clonedEmoji = bodyClone.querySelector('#profile-emoji');
                if (clonedEmoji) {
                  (clonedEmoji as HTMLElement).style.display = 'none';
                }
              }
            }
            
            // Get HTML from the cloned body
            const html = bodyClone.innerHTML;
            
            // Get CSS from GrapesJS
            const css = editorInstance.getCss() || '';

            // Get all stylesheets from the iframe (including inline styles)
            let allStyles = css + '\n';
            
            // Collect styles from stylesheets (avoiding CORS issues)
            try {
              const styleSheets = iframeDoc.styleSheets;
              for (let i = 0; i < styleSheets.length; i++) {
                try {
                  const sheet = styleSheets[i];
                  if (sheet.cssRules) {
                    for (let j = 0; j < sheet.cssRules.length; j++) {
                      allStyles += sheet.cssRules[j].cssText + '\n';
                    }
                  }
                } catch {
                  // Skip stylesheets with CORS issues (external stylesheets)
                  // They should already be in the HTML/CSS from GrapesJS
                }
              }
            } catch {
              // Continue if we can't access stylesheets
            }

            // Also get inline styles from style tags
            const styleTags = iframeDoc.querySelectorAll('style');
            styleTags.forEach((styleTag) => {
              allStyles += styleTag.textContent || '';
            });

            // Create a complete standalone HTML document
            const fullHtml = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
                <style>
                  * {
                    box-sizing: border-box;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Inter', sans-serif;
                  }
                  ${allStyles}
                </style>
              </head>
              <body style="margin: 0; padding: 0; background: white;">
                ${html}
              </body>
              </html>
            `;

            // Create a temporary iframe to render the complete HTML
            const tempIframe = document.createElement('iframe');
            tempIframe.style.position = 'absolute';
            tempIframe.style.left = '-9999px';
            tempIframe.style.width = '794px';
            tempIframe.style.border = 'none';
            document.body.appendChild(tempIframe);

            // Wait for iframe to load
            await new Promise((resolve) => {
              tempIframe.onload = resolve;
              tempIframe.srcdoc = fullHtml;
            });

            // Wait a bit for fonts and styles to load
            await new Promise((resolve) => setTimeout(resolve, 500));

            const tempIframeBody = tempIframe.contentDocument?.body;
            if (!tempIframeBody) {
              document.body.removeChild(tempIframe);
              alert('Failed to create export preview. Please try again.');
              return;
            }

            // Convert to image using toPng
            const dataUrl = await toPng(tempIframeBody, {
              cacheBust: true,
              pixelRatio: 2,
              backgroundColor: '#ffffff',
              filter: (node) => {
                // Filter out any editor controls
                if (node.nodeType === 1) {
                  const element = node as Element;
                  if (element.classList?.contains('gjs-selected') || 
                      element.classList?.contains('gjs-hovered') ||
                      element.classList?.contains('gjs-toolbar') ||
                      element.classList?.contains('gjs-badge')) {
                    return false;
                  }
                }
                return true;
              }
            });

            // Clean up temporary iframe
            document.body.removeChild(tempIframe);

            // Create image to get dimensions
            const img = new Image();
            img.src = dataUrl;
            await new Promise((resolve) => {
              img.onload = resolve;
            });

            // Calculate dimensions based on content
            const margin = 32; // margin in points
            const a4Width = 595; // A4 width in points
            const maxWidth = a4Width - (margin * 2);

            // Calculate the scaled dimensions
            const imgWidth = maxWidth;
            const imgHeight = (img.height * imgWidth) / img.width;

            // Create PDF with custom height to fit content exactly
            const pdfHeight = imgHeight + (margin * 2);
            const pdf = new jsPDF({
              orientation: 'p',
              unit: 'pt',
              format: [a4Width, pdfHeight]
            });

            pdf.addImage(dataUrl, 'PNG', margin, margin, imgWidth, imgHeight);
            pdf.save('resume.pdf');
          } catch (error) {
            console.error('PDF export error:', error);
            alert('There was an error generating the PDF. Please try again.');
          }
        }
      });

      // Load default template
      const defaultTemplate = `
        <div style="font-family: 'Inter', sans-serif; max-width: 794px; margin: 0 auto; background: white; display: grid; grid-template-columns: 280px 1fr; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Left Sidebar -->
          <div style="background: linear-gradient(180deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 50px 30px;">
            <!-- Name & Title -->
            <div style="margin-bottom: 40px; text-align: center; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 25px;">
              <div id="profile-image-placeholder" style="width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.2); margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 48px; overflow: hidden; object-fit: cover; cursor: pointer; position: relative; border: 2px dashed rgba(255,255,255,0.5); transition: all 0.3s ease;" title="Click to upload or change photo">
                <img id="profile-image" src="" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: none; pointer-events: none;" />
                <span id="profile-emoji" style="display: inline-block; pointer-events: none;">👤</span>
                <div id="upload-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; pointer-events: none; z-index: 1;">
                  <span style="color: white; font-size: 32px;">📷</span>
                </div>
              </div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; margin-bottom: 8px;">Your Name</h1>
              <p style="margin: 0; font-size: 14px; opacity: 0.95; font-weight: 500;">Your Job Title</p>
            </div>

            <!-- Contact -->
            <div style="margin-bottom: 35px;">
              <h3 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 8px;">Contact</h3>
              <p style="margin: 0; font-size: 12px; line-height: 2; opacity: 0.95;">
                📧 your.email@example.com<br/>
                📱 (555) 123-4567<br/>
                📍 Your City, State<br/>
                🔗 linkedin.com/in/yourprofile<br/>
                🌐 yourwebsite.com
              </p>
            </div>

            <!-- Skills -->
            <div style="margin-bottom: 35px;">
              <h3 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 8px;">Skills</h3>
              <div style="font-size: 12px; line-height: 2;">
                <div style="margin-bottom: 8px;">• JavaScript</div>
                <div style="margin-bottom: 8px;">• React & Next.js</div>
                <div style="margin-bottom: 8px;">• Node.js</div>
                <div style="margin-bottom: 8px;">• TypeScript</div>
                <div style="margin-bottom: 8px;">• AWS</div>
                <div style="margin-bottom: 8px;">• Docker</div>
                <div style="margin-bottom: 8px;">• Git</div>
                <div style="margin-bottom: 8px;">• SQL</div>
              </div>
            </div>

            <!-- Languages -->
            <div style="margin-bottom: 35px;">
              <h3 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 8px;">Languages</h3>
              <p style="margin: 0; font-size: 12px; line-height: 1.8;">
                English (Native)<br/>
                Spanish (Fluent)
              </p>
            </div>
          </div>

          <!-- Right Content -->
          <div style="padding: 50px 40px;">
            <!-- Professional Summary -->
            <div style="margin-bottom: 40px;">
              <h2 style="margin: 0 0 15px 0; font-size: 22px; font-weight: 700; color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 8px;">Professional Summary</h2>
              <p style="margin: 0; line-height: 1.8; color: #475569; font-size: 14px;">
                Accomplished professional with [X] years of experience in [your field]. Proven track record of delivering exceptional results and driving innovation. Skilled in [key skill 1], [key skill 2], and [key skill 3]. Passionate about leveraging expertise to solve complex challenges and contribute to organizational success.
              </p>
            </div>

            <!-- Work Experience -->
            <div style="margin-bottom: 40px;">
              <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 8px;">Work Experience</h2>
              
              <div style="margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; flex-wrap: wrap;">
                  <div>
                    <h3 style="margin: 0; font-size: 17px; font-weight: 600; color: #1e293b;">Your Current Job Title</h3>
                    <p style="margin: 4px 0 0 0; font-size: 15px; color: #475569; font-weight: 500;">Company Name</p>
                  </div>
                  <span style="font-size: 13px; color: #64748b; white-space: nowrap; font-weight: 500;">Jan 2020 - Present</span>
                </div>
                <ul style="margin: 12px 0 0 0; padding-left: 20px; color: #475569; line-height: 1.8; font-size: 13px;">
                  <li style="margin-bottom: 6px;">Led cross-functional team of 10+ members to deliver key projects, resulting in 40% increase in efficiency</li>
                  <li style="margin-bottom: 6px;">Implemented new processes that reduced costs by $500K annually while improving quality metrics</li>
                  <li style="margin-bottom: 6px;">Mentored junior team members and conducted training sessions on best practices and emerging technologies</li>
                  <li>Collaborated with stakeholders to define requirements and ensure alignment with business objectives</li>
                </ul>
              </div>

              <div style="margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; flex-wrap: wrap;">
                  <div>
                    <h3 style="margin: 0; font-size: 17px; font-weight: 600; color: #1e293b;">Previous Job Title</h3>
                    <p style="margin: 4px 0 0 0; font-size: 15px; color: #475569; font-weight: 500;">Previous Company</p>
                  </div>
                  <span style="font-size: 13px; color: #64748b; white-space: nowrap; font-weight: 500;">Jun 2017 - Dec 2019</span>
                </div>
                <ul style="margin: 12px 0 0 0; padding-left: 20px; color: #475569; line-height: 1.8; font-size: 13px;">
                  <li style="margin-bottom: 6px;">Developed and maintained critical systems serving thousands of daily users</li>
                  <li style="margin-bottom: 6px;">Improved application performance by 60% through optimization and refactoring</li>
                  <li>Participated in code reviews and contributed to technical documentation</li>
                </ul>
              </div>
            </div>

            <!-- Education -->
            <div style="margin-bottom: 40px;">
              <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 8px;">Education</h2>
              
              <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap;">
                  <div>
                    <h3 style="margin: 0; font-size: 17px; font-weight: 600; color: #1e293b;">Bachelor of Science in [Your Major]</h3>
                    <p style="margin: 4px 0 0 0; font-size: 15px; color: #475569; font-weight: 500;">University Name</p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">GPA: 3.X/4.0 • Dean's List • Relevant Coursework</p>
                  </div>
                  <span style="font-size: 13px; color: #64748b; white-space: nowrap; font-weight: 500;">2013 - 2017</span>
                </div>
              </div>
            </div>

            <!-- Certifications -->
            <div>
              <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 8px;">Certifications & Awards</h2>
              <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8; font-size: 13px;">
                <li style="margin-bottom: 8px;"><strong>Professional Certification</strong> - Issuing Organization, Year</li>
                <li style="margin-bottom: 8px;"><strong>Excellence Award</strong> - Recognizing outstanding performance, Year</li>
                <li><strong>Industry Certification</strong> - Relevant credential, Year</li>
              </ul>
            </div>
          </div>
        </div>
      `;

      // Try to load saved resume from localStorage
      const loadSavedResume = () => {
        try {
          const savedDataStr = localStorage.getItem('resume-maker-saved-resume');
          if (savedDataStr) {
            const savedData = JSON.parse(savedDataStr);
            if (savedData.html && savedData.css) {
              // Load saved HTML and CSS
              editorInstance.setComponents(savedData.html);
              editorInstance.setStyle(savedData.css);
              
              // Load profile image if it exists
              if (savedData.profileImage) {
                setTimeout(() => {
                  const canvasFrame = document.querySelector('.gjs-cv-canvas iframe') as HTMLIFrameElement;
                  if (canvasFrame?.contentDocument) {
                    const profileImage = canvasFrame.contentDocument.getElementById('profile-image') as HTMLImageElement;
                    const profileEmoji = canvasFrame.contentDocument.getElementById('profile-emoji');
                    if (profileImage && profileEmoji) {
                      profileImage.src = savedData.profileImage;
                      profileImage.style.display = 'block';
                      profileImage.style.visibility = 'visible';
                      profileEmoji.style.display = 'none';
                    }
                  }
                }, 500);
              }
              
              console.log('Loaded saved resume from localStorage');
              return true;
            }
          }
        } catch (error) {
          console.error('Failed to load saved resume:', error);
        }
        return false;
      };

      // Try to load saved resume, otherwise use default template
      const savedLoaded = loadSavedResume();
      if (!savedLoaded) {
        editorInstance.setComponents(defaultTemplate);
      }

      // Simple mobile fix: ensure canvas can scroll
      const fixMobileScrolling = () => {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          setTimeout(() => {
            const canvasWrapper = document.querySelector('.gjs-cv-canvas');
            const iframe = document.querySelector('.gjs-cv-canvas iframe') as HTMLIFrameElement;
            
            if (canvasWrapper) {
              (canvasWrapper as HTMLElement).style.overflow = 'auto';
            }
            
            if (iframe) {
              try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc?.body) {
                  iframeDoc.body.style.overflow = 'auto';
                  // Add padding-top on mobile to prevent toolbar from hiding content
                  iframeDoc.body.style.paddingTop = '60px';
                  if (iframeDoc.documentElement) {
                    iframeDoc.documentElement.style.overflow = 'auto';
                  }
                }
              } catch {
                // Cross-origin issue, ignore
              }
            }
          }, 200);
        }
      };

      // Fix toolbar positioning on mobile to prevent hiding content
      const fixMobileToolbar = () => {
        const isMobile = window.innerWidth <= 768;
        if (!isMobile) return (() => {}); // Return empty cleanup function if not mobile

        const repositionToolbar = () => {
          const currentIsMobile = window.innerWidth <= 768;
          if (!currentIsMobile) return;
          
          setTimeout(() => {
            const toolbar = document.querySelector('.gjs-toolbar') as HTMLElement;
            if (toolbar) {
              // Position toolbar at bottom on mobile to avoid covering content
              toolbar.style.position = 'fixed';
              toolbar.style.bottom = '20px';
              toolbar.style.top = 'auto';
              toolbar.style.left = '50%';
              toolbar.style.transform = 'translateX(-50%)';
              toolbar.style.zIndex = '1000';
              toolbar.style.maxWidth = 'calc(100vw - 40px)';
              toolbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            }
          }, 100);
        };

        // Listen for component selection to reposition toolbar
        editorInstance.on('component:selected', repositionToolbar);
        editorInstance.on('component:update', repositionToolbar);
        
        // Also observe for toolbar creation
        const observer = new MutationObserver(repositionToolbar);
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        // Initial check
        repositionToolbar();

        return () => {
          observer.disconnect();
          editorInstance.off('component:selected', repositionToolbar);
          editorInstance.off('component:update', repositionToolbar);
        };
      };

      // Fix on init and device change
      const handleResize = () => {
        fixMobileScrolling();
        fixMobileToolbar();
      };
      fixMobileScrolling();
      const toolbarCleanup = fixMobileToolbar();
      editorInstance.on('change:device', handleResize);
      window.addEventListener('resize', handleResize);
      
      // Store toolbar cleanup for later
      (editorInstance as { _toolbarCleanup?: () => void })._toolbarCleanup = toolbarCleanup;

      // Add click handler to profile image placeholder
      // Store handlers to remove them later and track if already set up
      const uploadState = {
        handlers: {
          placeholder: null as HTMLElement | null,
          mouseenter: null as (() => void) | null,
          mouseleave: null as (() => void) | null,
          click: null as ((e: Event) => void) | null,
        },
        isSetupComplete: false
      };

      const setupImageUpload = () => {
        setTimeout(() => {
          const canvasFrame = document.querySelector('.gjs-cv-canvas iframe') as HTMLIFrameElement;
          if (canvasFrame?.contentDocument) {
            const placeholder = canvasFrame.contentDocument.getElementById('profile-image-placeholder');
            const uploadOverlay = canvasFrame.contentDocument.getElementById('upload-overlay');
            
            // Remove old listeners if they exist
            if (uploadState.handlers.placeholder && uploadState.handlers.mouseenter) {
              uploadState.handlers.placeholder.removeEventListener('mouseenter', uploadState.handlers.mouseenter);
              uploadState.handlers.placeholder.removeEventListener('mouseleave', uploadState.handlers.mouseleave!);
              uploadState.handlers.placeholder.removeEventListener('click', uploadState.handlers.click!);
              uploadState.isSetupComplete = false;
            }
            
            // Only set up if we have a placeholder and it's not already set up
            if (placeholder && !uploadState.isSetupComplete) {
              // Create new handlers
              const mouseenterHandler = () => {
                placeholder.style.borderColor = 'rgba(255,255,255,0.8)';
                placeholder.style.background = 'rgba(255,255,255,0.3)';
                if (uploadOverlay) {
                  (uploadOverlay as HTMLElement).style.opacity = '1';
                }
              };
              
              const mouseleaveHandler = () => {
                placeholder.style.borderColor = 'rgba(255,255,255,0.5)';
                placeholder.style.background = 'rgba(255,255,255,0.2)';
                if (uploadOverlay) {
                  (uploadOverlay as HTMLElement).style.opacity = '0';
                }
              };
              
              const clickHandler = (e: Event) => {
                e.stopPropagation();
                e.preventDefault();
                
                console.log('Placeholder clicked, triggering file input...');
                
                // Find the file input element
                const fileInput = document.getElementById('image-upload-input') as HTMLInputElement;
                
                if (fileInput) {
                  console.log('File input found, triggering click');
                  // Trigger click on the file input
                  // Use setTimeout to ensure it's not blocked by GrapesJS event handling
                  setTimeout(() => {
                    fileInput.click();
                  }, 50);
                } else {
                  console.error('File input not found. Make sure the input element exists.');
                  alert('Upload button not ready. Please try the Upload Photo button in the toolbar instead.');
                }
              };
              
              // Store handlers
              uploadState.handlers = {
                placeholder,
                mouseenter: mouseenterHandler,
                mouseleave: mouseleaveHandler,
                click: clickHandler
              };
              
              // Add new listeners
              placeholder.addEventListener('mouseenter', mouseenterHandler, { once: false });
              placeholder.addEventListener('mouseleave', mouseleaveHandler, { once: false });
              placeholder.addEventListener('click', clickHandler, { once: false });
              uploadState.isSetupComplete = true;
            }
          }
        }, 500);
      };

      // Store setupImageUpload globally so it can be called after image updates
      (window as { setupImageUpload?: () => void }).setupImageUpload = setupImageUpload;

      // Store upload state globally so it can be accessed elsewhere
      (window as { imageUploadState?: typeof uploadState }).imageUploadState = uploadState;

      // Setup image upload when canvas loads
      editorInstance.on('canvas:frame:load', () => {
        uploadState.isSetupComplete = false;
        setupImageUpload();
      });
      
      // Only re-setup on component update if placeholder was actually changed
      editorInstance.on('component:update', () => {
        const canvasFrame = document.querySelector('.gjs-cv-canvas iframe') as HTMLIFrameElement;
        if (canvasFrame?.contentDocument) {
          const placeholder = canvasFrame.contentDocument.getElementById('profile-image-placeholder');
          // Only re-setup if placeholder exists but handlers are missing
          if (placeholder && !uploadState.isSetupComplete) {
            setTimeout(setupImageUpload, 200);
          }
        }
      });
      
      // Initial setup
      setupImageUpload();

      setEditor(editorInstance);
      
      // Store resize cleanup for later
      (editorInstance as { _resizeCleanup?: () => void })._resizeCleanup = () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    initEditor();

    return () => {
      // Cleanup on unmount
      if (editorInstance) {
        // Cleanup toolbar observer
        const toolbarCleanup = (editorInstance as { _toolbarCleanup?: () => void })._toolbarCleanup;
        if (toolbarCleanup) {
          toolbarCleanup();
        }
        // Cleanup resize listener
        const resizeCleanup = (editorInstance as { _resizeCleanup?: () => void })._resizeCleanup;
        if (resizeCleanup) {
          resizeCleanup();
        }
        // Destroy editor
        if (typeof editorInstance.destroy === 'function') {
          editorInstance.destroy();
        }
      }
      // Clean up global functions
      delete (window as { handleAIAction?: unknown; closeAIMenu?: unknown }).handleAIAction;
      delete (window as { handleAIAction?: unknown; closeAIMenu?: unknown }).closeAIMenu;
      // Remove any AI menus
      const menu = document.getElementById('ai-menu');
      if (menu) menu.remove();
    };
  }, [isClient]);

  const handleExportPDF = () => {
    if (!editor) return;
    (editor as { runCommand: (cmd: string) => void }).runCommand('export-pdf');
  };

  const togglePanels = () => {
    const newState = !showPanels;
    setShowPanels(newState);
    
    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
      const panels = document.querySelector('.gjs-pn-panels') as HTMLElement;
      const panelContainer = document.querySelector('.gjs-pn-panel') as HTMLElement;
      const canvas = document.querySelector('.gjs-cv-canvas') as HTMLElement;
      const editorContainer = document.querySelector('.gjs-editor') as HTMLElement;
      
      if (panels && panelContainer) {
        if (newState) {
          // Show panels
          panels.style.display = '';
          panelContainer.style.display = '';
          if (canvas) {
            canvas.style.width = '';
            canvas.style.marginLeft = '';
          }
          if (editorContainer) {
            editorContainer.style.gridTemplateColumns = '';
          }
        } else {
          // Hide panels
          panels.style.display = 'none';
          panelContainer.style.display = 'none';
          if (canvas) {
            canvas.style.width = '100%';
            canvas.style.marginLeft = '0';
            canvas.style.maxWidth = '100%';
          }
          if (editorContainer) {
            editorContainer.style.gridTemplateColumns = '1fr';
          }
        }
      }
    }, 50);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleImageUpload called', e.target.files);
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    if (file && file.type.startsWith('image/')) {
      console.log('Processing image file:', file.name, file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        
        if (!imageDataUrl) {
          alert('Failed to read image file. Please try again.');
          return;
        }
        
        // Update the profile image in the canvas
        if (editor) {
          // Try multiple times to ensure the iframe is ready
          const updateImage = (attempts = 0) => {
            if (attempts > 10) {
              alert('Failed to update image. Please try clicking the placeholder again.');
              return;
            }
            
            const canvasFrame = document.querySelector('.gjs-cv-canvas iframe') as HTMLIFrameElement;
            if (canvasFrame?.contentDocument) {
              const profileImage = canvasFrame.contentDocument.getElementById('profile-image') as HTMLImageElement;
              const profileEmoji = canvasFrame.contentDocument.getElementById('profile-emoji');
              
              if (profileImage && profileEmoji) {
                console.log('Updating profile image in canvas');
                // Update the image
                profileImage.src = imageDataUrl;
                profileImage.style.display = 'block';
                profileImage.style.visibility = 'visible';
                profileEmoji.style.display = 'none';
                
                // Force image load
                profileImage.onload = () => {
                  console.log('Image loaded successfully');
                };
                
                // Also hide the upload overlay if it exists
                const uploadOverlay = canvasFrame.contentDocument.getElementById('upload-overlay');
                if (uploadOverlay) {
                  (uploadOverlay as HTMLElement).style.display = 'none';
                }
                
                // Trigger GrapesJS update to save the change
                try {
                  const editorInstance = editor as { 
                    trigger: (event: string) => void; 
                    store: () => void;
                    Components: {
                      getComponent: (wrapper: HTMLElement) => unknown;
                    };
                  };
                  
                  // Find the component that contains the profile image
                  const wrapper = profileImage.closest('[data-gjs-type]') || canvasFrame.contentDocument.body.firstElementChild;
                  
                  if (wrapper) {
                    // Try to get the component and update it
                    try {
                      const component = editorInstance.Components.getComponent(wrapper as HTMLElement);
                      if (component) {
                        (component as { set: (prop: string, value: unknown) => void }).set('src', imageDataUrl);
                      }
                    } catch {
                      console.log('Could not update component directly, using HTML update');
                    }
                  }
                  
                  // Force a store/update
                  editorInstance.trigger('component:update');
                  editorInstance.trigger('update');
                  
                  console.log('GrapesJS updated successfully');
                } catch (error) {
                  console.error('Error updating GrapesJS:', error);
                  // Fallback: image is already updated in DOM, just need to persist
                  const editorInstance = editor as { store: () => void };
                  editorInstance.store();
                }
              } else {
                // Retry if elements not found
                setTimeout(() => updateImage(attempts + 1), 100);
              }
            } else {
              // Retry if iframe not ready
              setTimeout(() => updateImage(attempts + 1), 100);
            }
          };
          
          updateImage();
        } else {
          alert('Editor not ready. Please try again.');
        }
      };
      
      reader.onerror = () => {
        alert('Error reading image file. Please try again.');
      };
      
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file (JPG, PNG, GIF, etc.).');
    }
    
    // Reset input value to allow same file to be selected again
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleSave = () => {
    if (!editor) return;
    const html = (editor as { getHtml: () => string | undefined; getCss: () => string | undefined }).getHtml() || '';
    const css = (editor as { getHtml: () => string | undefined; getCss: () => string | undefined }).getCss() || '';
    
    // Save to localStorage
    try {
      const savedData: {
        html: string;
        css: string;
        timestamp: string;
        profileImage?: string;
      } = {
        html,
        css,
        timestamp: new Date().toISOString(),
      };
      
      // Also save profile image if it exists
      const canvasFrame = document.querySelector('.gjs-cv-canvas iframe') as HTMLIFrameElement;
      if (canvasFrame?.contentDocument) {
        const profileImage = canvasFrame.contentDocument.getElementById('profile-image') as HTMLImageElement;
        if (profileImage && profileImage.src && profileImage.src.startsWith('data:')) {
          savedData.profileImage = profileImage.src;
        }
      }
      
      localStorage.setItem('resume-maker-saved-resume', JSON.stringify(savedData));
      
      onSave?.(html, css);
      alert('Resume saved successfully to local storage!');
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      alert('Failed to save resume. Please try again.');
    }
  };

  const handleGenerateTemplate = async () => {
    if (!generatePrompt.trim() || !editor) return;

    setIsGenerating(true);
    try {
      const prompt = `Generate a complete professional resume HTML template based on this description: ${generatePrompt}

Return ONLY valid HTML code (no markdown, no explanations) with inline CSS styles. The HTML should be a complete resume layout with:
- Header section with name, title, and contact info
- Professional summary section
- Work experience section with at least 2 job entries
- Education section
- Skills section
- Use modern, professional styling with colors, spacing, and typography
- Make it A4 page width (794px max-width)
- Use professional fonts and clean design
- Include placeholder text like "Your Name", "Your Job Title", etc. that users can edit

Return the complete HTML code wrapped in a single div with inline styles.`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate template');

      const data = await response.json();
      let generatedHtml = data.text || '';

      // Clean up the response - remove markdown code blocks if present
      generatedHtml = generatedHtml.replace(/```html/g, '').replace(/```/g, '').trim();
      
      // If the response doesn't start with <, it might be wrapped in explanations
      if (!generatedHtml.includes('<div') && !generatedHtml.includes('<html')) {
        // Try to extract HTML from the response
        const htmlMatch = generatedHtml.match(/(<div[\s\S]*<\/div>)/i) || generatedHtml.match(/(<html[\s\S]*<\/html>)/i);
        if (htmlMatch) {
          generatedHtml = htmlMatch[1];
        } else {
          // Wrap in a div if it's just plain HTML content
          generatedHtml = `<div style="max-width: 794px; margin: 0 auto; font-family: 'Inter', sans-serif; padding: 40px; background: white;">${generatedHtml}</div>`;
        }
      }

      // Load the generated template into the editor
      (editor as { setComponents: (html: string) => void }).setComponents(generatedHtml);

      setShowGenerateDialog(false);
      setGeneratePrompt('');
      alert('Template generated successfully! You can now edit it in the canvas.');

    } catch (error) {
      console.error('Template generation error:', error);
      alert('Failed to generate template. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIAction = async (action: 'fix' | 'enhance' | 'shorten' | 'expand') => {
    if (!selectedText || isProcessingAI) return;
    
    setIsProcessingAI(true);
    setShowAIMenu(false);

    try {
      let prompt = '';
      switch (action) {
        case 'fix':
          prompt = `Fix grammar and spelling errors in the following text. Return ONLY the corrected text without any explanations:\n\n${selectedText}`;
          break;
        case 'enhance':
          prompt = `Improve and enhance the following text to make it more professional and impactful for a resume. Return ONLY the enhanced text without any explanations:\n\n${selectedText}`;
          break;
        case 'shorten':
          prompt = `Make the following text more concise while keeping the key information. Return ONLY the shortened text without any explanations:\n\n${selectedText}`;
          break;
        case 'expand':
          prompt = `Expand the following text with more details while keeping it professional for a resume. Return ONLY the expanded text without any explanations:\n\n${selectedText}`;
          break;
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      const data = await response.json();
      const improvedText = data.text || data.response || '';

      // Replace selected text with improved version
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(improvedText));
        
        // Clear selection
        selection.removeAllRanges();
      }

    } catch (error) {
      console.error('AI processing error:', error);
      alert('Failed to process text with AI. Please try again.');
    } finally {
      setIsProcessingAI(false);
    }
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col w-full h-screen ${isMobile ? 'overflow-auto' : 'overflow-hidden'}`}>
      {/* Top toolbar for buttons */}
      <div className="bg-gray-900 border-b border-gray-700 px-2 sm:px-4 py-2 flex items-center justify-between z-50 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <h1 className="text-white font-semibold text-sm sm:text-lg">Resume Builder</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm px-2 sm:px-4">
                <Wand2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">AI Generate</span>
                <span className="sm:hidden">AI</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-600" />
                  Generate Resume Template with AI
                </DialogTitle>
                <DialogDescription>
                  Describe the type of resume you want. For example: &quot;A modern software engineer resume with 5 years experience&quot; or &quot;A creative designer resume with portfolio links&quot;
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Textarea
                  placeholder="Example: Create a professional software engineer resume with experience in React, Node.js, and AWS. Include sections for professional summary, work experience (2 jobs), education, and technical skills. Use a modern blue color scheme."
                  value={generatePrompt}
                  onChange={(e) => setGeneratePrompt(e.target.value)}
                  rows={6}
                  className="w-full"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowGenerateDialog(false);
                      setGeneratePrompt('');
                    }}
                    disabled={isGenerating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateTemplate}
                    disabled={!generatePrompt.trim() || isGenerating}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Template
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-2 sm:px-4">
            <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Save</span>
            <span className="sm:hidden">💾</span>
          </Button>
          <Button 
            onClick={() => {
              if (confirm('Are you sure you want to clear the saved resume and start fresh?')) {
                localStorage.removeItem('resume-maker-saved-resume');
                window.location.reload();
              }
            }} 
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm px-2 sm:px-4"
            title="Clear saved resume and reload"
          >
            <span className="hidden sm:inline">Clear & Reload</span>
            <span className="sm:hidden">🔄</span>
          </Button>
          <Button onClick={handleExportPDF} className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-2 sm:px-4">
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">📥</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload-input"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm px-2 sm:px-4"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Upload Photo</span>
            <span className="sm:hidden">📷</span>
          </Button>
          <Button 
            onClick={togglePanels} 
            className="bg-gray-700 hover:bg-gray-600 text-white text-xs sm:text-sm px-2 sm:px-4"
            title={showPanels ? "Hide Sidebar" : "Show Sidebar"}
          >
            {showPanels ? (
              <>
                <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Hide Sidebar</span>
                <span className="sm:hidden">👁️</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Show Sidebar</span>
                <span className="sm:hidden">👁️</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* AI Text Enhancement Menu */}
      {showAIMenu && !isProcessingAI && (
        <div
          className="fixed z-9999 bg-white rounded-lg shadow-2xl border border-gray-200 p-2 min-w-[200px]"
          style={{
            top: `${aiMenuPosition.top}px`,
            left: `${aiMenuPosition.left}px`,
          }}
        >
          <div className="flex items-center gap-2 px-2 py-1 mb-2 border-b border-gray-200">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">AI Enhance</span>
          </div>
          <button
            onClick={() => handleAIAction('fix')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <span className="text-lg">✓</span>
            <span>Fix Grammar</span>
          </button>
          <button
            onClick={() => handleAIAction('enhance')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 rounded flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
          >
            <span className="text-lg">✨</span>
            <span>Enhance</span>
          </button>
          <button
            onClick={() => handleAIAction('shorten')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 rounded flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors"
          >
            <span className="text-lg">⚡</span>
            <span>Make Shorter</span>
          </button>
          <button
            onClick={() => handleAIAction('expand')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50 rounded flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
          >
            <span className="text-lg">📝</span>
            <span>Expand</span>
          </button>
          <button
            onClick={() => setShowAIMenu(false)}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mt-1 border-t border-gray-200"
          >
            <span className="text-lg">✕</span>
            <span>Close</span>
          </button>
        </div>
      )}

      {/* AI Processing Indicator */}
      {isProcessingAI && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-2xl flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-gray-700 font-medium">AI is enhancing your text...</p>
          </div>
        </div>
      )}

      {/* GrapesJS Editor */}
      <div ref={editorRef} className={`flex-1 w-full ${isMobile ? 'overflow-auto' : 'overflow-hidden'}`} style={{ minHeight: 0 }} />
    </div>
  );
}

