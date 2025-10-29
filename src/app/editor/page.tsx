"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ItemControls } from "@/components/editor/ItemControls";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs as UITabs, TabsList as UITabsList, TabsTrigger as UITabsTrigger, TabsContent as UITabsContent } from "@/components/ui/tabs";
import { useRef, useState, useEffect } from "react";
import { MapPin, Mail, Phone, Globe, Linkedin, Bold, Italic, Underline, Sparkles } from "lucide-react";
import { toPng } from 'html-to-image';
import jsPDF from "jspdf";
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

type BaseSection = {
  id: string;
  title: string;
  placement: "left" | "right"; // used for split layout
};

type TextSection = BaseSection & {
  type: "text";
  content: string;
};

type ListSection = BaseSection & {
  type: "list";
  content: string; // newline-separated
};

type ExperienceItem = {
  company: string;
  role: string;
  from: string;
  to: string;
  bullets: string; // newline-separated
};

type ExperienceSection = BaseSection & {
  type: "experience";
  items: ExperienceItem[];
};

type EducationItem = {
  school: string;
  degree: string;
  from: string;
  to: string;
};

type EducationSection = BaseSection & {
  type: "education";
  items: EducationItem[];
};

type SkillsSection = BaseSection & {
  type: "skills";
  skills: string[]; // simple chips
};

type ResumeSection = TextSection | ListSection | ExperienceSection | EducationSection | SkillsSection;

export default function EditorPage() {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<{ kind: "exp" | "edu" | "list" | "skill" | null; sectionId?: string; from: number } | null>(null);
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [isFixingGrammar, setIsFixingGrammar] = useState(false);
  const [layout, setLayout] = useState<"split" | "classic" | "hybrid">("split");
  const [font, setFont] = useState("Nunito");
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [showPhoto, setShowPhoto] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<{ name: string; color: string }>(
    { name: "blue", color: "#234795" }
  );
  const [name, setName] = useState("Your Name");
  const [role, setRole] = useState("Your Role");
  const [location, setLocation] = useState("City");
  const [email, setEmail] = useState("you@email.com");
  const [phone, setPhone] = useState("+123456789");
  
  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Text formatting functions
  const applyFormat = (command: string) => {
    document.execCommand(command, false);
  };

  // Fix grammar and spelling
  const fixGrammar = async () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) return;

    const selectedText = selection.toString();
    setIsFixingGrammar(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          kind: "grammar", 
          input: selectedText 
        })
      });
      const data = await res.json();
      const fixedText = String(data.text ?? selectedText);

      // Replace the selected text with the fixed version
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(fixedText));

      // Clear selection
      selection.removeAllRanges();
      setShowFormatToolbar(false);
    } catch (error) {
      console.error("Grammar fix error:", error);
      alert("Failed to fix grammar. Please try again.");
    } finally {
      setIsFixingGrammar(false);
    }
  };

  // Handle text selection for formatting toolbar
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Check if selection is within an editable element
        const container = selection.anchorNode?.parentElement;
        const isInEditableArea = container?.isContentEditable || container?.closest('[contenteditable="true"]');
        
        if (isInEditableArea) {
          // Position toolbar above the selection using viewport coordinates
          setToolbarPosition({
            top: rect.top - 50,
            left: rect.left + (rect.width / 2)
          });
          setShowFormatToolbar(true);
        } else {
          setShowFormatToolbar(false);
        }
      } else {
        setShowFormatToolbar(false);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [sections, setSections] = useState<ResumeSection[]>([
    { id: "about", title: "ABOUT ME", type: "text", content: "Experienced full-stack blockchain developer with a focus on microservices architecture and DeFi in Blockchain, currently exploring Web3 and Defi in various chains and tools. Skilled in MERN, Aws, GCP and Web3, with a passion for innovation and learning.", placement: "left" },
    { id: "work", title: "EXPERIENCE", type: "experience", items: [
      { company: "Company Name", role: "FULL STACK DEVELOPER", from: "June 2023", to: "Present (11 months)", bullets: "• Frontend: React.Next, Tailwind, Mui, Pwa\n• Backend: Nest, Node(ts) with postgres,mongo\n• Cloud: Aws(sqs,sns,dynmodb,ecs,rds)\n• Devops: Docker, Github actions, New relic,tf..." }
    ], placement: "right" },
    { id: "education", title: "EDUCATION", type: "education", items: [
      { school: "University Name", degree: "BSCS, COMPUTER SCIENCE", from: "2019", to: "2023" }
    ], placement: "right" },
    { id: "skills", title: "SKILLS", type: "skills", skills: ["React.Next", "Node.js", "TypeScript", "AWS", "Docker"], placement: "left" },
  ]);

  const [visible, setVisible] = useState<Record<string, boolean>>({
    picture: true,
    about: true,
    work: true,
    education: true,
    skills: true,
    location: true,
    email: true,
    phone: true,
  });

  const [newSectionType, setNewSectionType] = useState<"text" | "list">("text");
  const [newSectionPlacement, setNewSectionPlacement] = useState<"left" | "right">("right");

  const updateTextLikeSection = (id: string, content: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== id) return s;
      if (s.type === "text" || s.type === "list") return { ...s, content } as typeof s;
      return s;
    }));
  };

  const addExperienceItem = () => {
    setSections(prev => prev.map(s => s.type === "experience" ? {
      ...s,
      items: [...s.items, { company: "Company", role: "Role", from: "From", to: "Until", bullets: "" }],
    } : s));
  };

  const updateExperienceItem = (index: number, patch: Partial<ExperienceItem>) => {
    setSections(prev => prev.map(s => s.type === "experience" ? {
      ...s,
      items: s.items.map((it, i) => i === index ? { ...it, ...patch } : it),
    } : s));
  };

  const insertExperienceAfter = (index: number) => {
    setSections(prev => prev.map(s => s.type === "experience" ? {
      ...s,
      items: s.items.toSpliced(index + 1, 0, { company: "Company", role: "Role", from: "From", to: "Until", bullets: "" }),
    } : s));
  };

  const moveExperience = (index: number, direction: -1 | 1) => {
    setSections(prev => prev.map(s => {
      if (s.type !== "experience") return s;
      const next = [...s.items];
      const j = index + direction;
      if (j < 0 || j >= next.length) return s;
      [next[index], next[j]] = [next[j], next[index]];
      return { ...s, items: next };
    }));
  };

  const removeExperience = (index: number) => {
    setSections(prev => prev.map(s => {
      if (s.type !== "experience") return s;
      if (s.items.length <= 1) return s; // keep at least one
      return { ...s, items: s.items.filter((_, i)=> i !== index) };
    }));
  };

  const addEducationItem = () => {
    setSections(prev => prev.map(s => s.type === "education" ? {
      ...s,
      items: [...s.items, { school: "School", degree: "Degree", from: "From", to: "Until" }],
    } : s));
  };

  const updateEducationItem = (index: number, patch: Partial<EducationItem>) => {
    setSections(prev => prev.map(s => s.type === "education" ? {
      ...s,
      items: s.items.map((it, i) => i === index ? { ...it, ...patch } : it),
    } : s));
  };

  const insertEducationAfter = (index: number) => {
    setSections(prev => prev.map(s => s.type === "education" ? ({
      ...s,
      items: s.items.toSpliced(index + 1, 0, { school: "School", degree: "Degree", from: "From", to: "Until" })
    }) : s));
  };

  const moveEducation = (index: number, direction: -1 | 1) => {
    setSections(prev => prev.map(s => {
      if (s.type !== "education") return s;
      const next = [...s.items];
      const j = index + direction;
      if (j < 0 || j >= next.length) return s;
      [next[index], next[j]] = [next[j], next[index]];
      return { ...s, items: next };
    }));
  };

  const removeEducation = (index: number) => {
    setSections(prev => prev.map(s => {
      if (s.type !== "education") return s;
      if (s.items.length <= 1) return s; // keep at least one
      return { ...s, items: s.items.filter((_, i)=> i !== index) };
    }));
  };

  const addSkill = (value: string) => {
    if (!value.trim()) return;
    setSections(prev => prev.map(s => s.type === "skills" ? { ...s, skills: [...s.skills, value.trim()] } : s));
  };
  const removeSkill = (idx: number) => {
    setSections(prev => prev.map(s => {
      if (s.type !== "skills") return s;
      if (s.skills.length <= 1) return s; // keep at least one
      return { ...s, skills: s.skills.filter((_, i) => i !== idx) };
    }));
  };

  const reorderExperience = (from: number, to: number) => {
    setSections(prev => prev.map(s => {
      if (s.type !== "experience") return s;
      const next = [...s.items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...s, items: next };
    }));
  };

  const reorderEducation = (from: number, to: number) => {
    setSections(prev => prev.map(s => {
      if (s.type !== "education") return s;
      const next = [...s.items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...s, items: next };
    }));
  };

  const reorderListLine = (sectionId: string, from: number, to: number) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId || s.type !== "list") return s;
      const lines = s.content ? s.content.split(/\n+/) : [];
      const [moved] = lines.splice(from, 1);
      lines.splice(to, 0, moved);
      return { ...s, content: lines.join("\n") };
    }));
  };

  const reorderSkill = (from: number, to: number) => {
    setSections(prev => prev.map(s => {
      if (s.type !== "skills") return s;
      const next = [...s.skills];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...s, skills: next };
    }));
  };

  // Section-level operations
  const moveSection = (sectionId: string, direction: -1 | 1) => {
    setSections(prev => {
      const index = prev.findIndex(s => s.id === sectionId);
      if (index === -1) return prev;
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(newIndex, 0, moved);
      return next;
    });
  };

  const removeSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
    setVisible(prev => ({ ...prev, [sectionId]: false }));
  };

  const exportPdf = async () => {
    if (!previewRef.current) return;
    try {
      // Add a class to hide interactive elements
      previewRef.current.classList.add('print-mode');
      
      // Use html-to-image which handles modern CSS better
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        filter: (node) => {
          // Filter out buttons and interactive controls
          if (node.nodeType === 1) {
            const element = node as Element;
            // Skip buttons
            if (element.tagName === 'BUTTON') return false;
            // Skip file inputs
            if (element.tagName === 'INPUT' && element.getAttribute('type') === 'file') return false;
            // Skip ItemControls elements (they have opacity-0 and group-hover:opacity-100)
            if (element.classList?.contains('opacity-0') || element.classList?.contains('group-hover:opacity-100')) return false;
          }
          return true;
        }
      });
      
      // Remove the print mode class
      previewRef.current.classList.remove('print-mode');
      
      // Create an image to get dimensions
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
        orientation: "p", 
        unit: "pt", 
        format: [a4Width, pdfHeight] // Custom size based on content
      });
      
      pdf.addImage(dataUrl, "PNG", margin, margin, imgWidth, imgHeight);
      pdf.save("resume.pdf");
    } catch (error) {
      console.error("PDF export error:", error);
      previewRef.current?.classList.remove('print-mode');
      alert("There was an error generating the PDF. Please try again.");
    }
  };

  // Reusable helpers for list-type subsection lines (for list sections)
  const updateListLine = (sectionId: string, index: number, value: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId || s.type !== "list") return s;
      const lines = s.content ? s.content.split(/\n+/) : [];
      lines[index] = value;
      return { ...s, content: lines.join("\n") };
    }));
  };
  const moveListLine = (sectionId: string, index: number, dir: -1 | 1) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId || s.type !== "list") return s;
      const lines = s.content ? s.content.split(/\n+/) : [];
      const j = index + dir;
      if (j < 0 || j >= lines.length) return s;
      [lines[index], lines[j]] = [lines[j], lines[index]];
      return { ...s, content: lines.join("\n") };
    }));
  };
  const insertListLineAfter = (sectionId: string, index: number) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId || s.type !== "list") return s;
      const lines = s.content ? s.content.split(/\n+/) : [];
      lines.splice(index + 1, 0, "New item");
      return { ...s, content: lines.join("\n") };
    }));
  };
  const removeListLine = (sectionId: string, index: number) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId || s.type !== "list") return s;
      const lines = (s.content ? s.content.split(/\n+/) : []);
      if (lines.length <= 1) return { ...s, content: lines[0] ?? "Item" };
      const next = lines.filter((_, i) => i !== index);
      return { ...s, content: next.join("\n") };
    }));
  };

  const aiBulletsForExperience = async (i: number) => {
    const item = (sections.find(s=> s.type==='experience') as ExperienceSection)?.items[i];
    const prompt = `${item?.company ?? ''} ${item?.role ?? ''}. Write resume bullets.`;
    const res = await fetch("/api/ai/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "bullets", input: prompt }) });
    const data = await res.json();
    updateExperienceItem(i, { bullets: String(data.text ?? "") });
  };

  return (
    <div className="h-dvh grid grid-rows-[auto,1fr]">
      {/* Floating Text Formatting Toolbar */}
      {showFormatToolbar && (
        <div 
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 px-2 py-1.5 flex gap-1"
          style={{ 
            top: `${toolbarPosition.top}px`, 
            left: `${toolbarPosition.left}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <button
            onClick={() => applyFormat('bold')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('italic')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('underline')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px bg-gray-300 mx-1" />
          <button
            onClick={fixGrammar}
            disabled={isFixingGrammar}
            className="p-2 hover:bg-purple-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Fix Grammar & Spelling"
          >
            {isFixingGrammar ? (
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-purple-600" />
            )}
          </button>
        </div>
      )}

      {/* Top toolbar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b bg-background">
        <div className="font-semibold">ResumeMaker.Online</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">Color</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 p-3 space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-2">Preset Colors</Label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { name: "blue", color: "#234795" },
                  { name: "pink", color: "#c026d3" },
                  { name: "green", color: "#16a34a" },
                  { name: "orange", color: "#ea580c" },
                  { name: "black", color: "#111827" },
                ].map(c => (
                  <button
                    key={c.name}
                    onClick={()=> setTheme(c)}
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: c.color, outline: theme.name===c.name?`2px solid ${c.color}`:undefined }}
                    aria-label={c.name}
                  />
                ))}
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Custom Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.color}
                  onChange={(e)=> setTheme({ name: "custom", color: e.target.value })}
                  className="w-8 h-8 rounded border cursor-pointer"
                />
                <Input
                  type="text"
                  value={theme.color}
                  onChange={(e)=> setTheme({ name: "custom", color: e.target.value })}
                  placeholder="#000000"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">Layout</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80">
            <DropdownMenuLabel>Choose layout</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="grid grid-cols-3 gap-2 p-2">
              {(["split","classic","hybrid"] as const).map(l => (
                <Button key={l} variant={layout===l?"default":"secondary"} onClick={()=>setLayout(l)}>
                  {l.charAt(0).toUpperCase()+l.slice(1)}
                </Button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">Typography</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80 space-y-3 p-3">
            <div className="space-y-2">
              <Label>Font</Label>
              <Select value={font} onValueChange={setFont}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  {["Nunito","Poppins","Rubik","Fira Sans","Josefin Sans","Inter"].map(f=>(
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Size</Label>
              <div className="grid grid-cols-3 gap-2">
                {([ {k:"sm",label:"Small"}, {k:"md",label:"Medium"}, {k:"lg",label:"Big"}] as const).map(opt=> (
                  <Button key={opt.k} variant={size===opt.k?"default":"secondary"} onClick={()=>setSize(opt.k)}>
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">Sections</Button>
          </DropdownMenuTrigger>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">Language</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={()=> document.documentElement.lang = 'en'}>English</DropdownMenuItem>
            <DropdownMenuItem onClick={()=> document.documentElement.lang = 'es'}>Español</DropdownMenuItem>
            <DropdownMenuItem onClick={()=> document.documentElement.lang = 'de'}>Deutsch</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
          <DropdownMenuContent align="start" className="w-[520px] p-3">
            <DropdownMenuLabel>Personal Details</DropdownMenuLabel>
            <div className="grid grid-cols-2 gap-3 py-2">
              {[{k:"picture",label:"Picture"},{k:"about",label:"About Me"},{k:"work",label:"Work Experience"},{k:"education",label:"Education"},{k:"skills",label:"Skills"},{k:"location",label:"Location"},{k:"email",label:"Email"},{k:"phone",label:"Phone Number"}].map(item=> (
                <div key={item.k} className="flex items-center justify-between gap-2">
                  <span className="text-sm">{item.label}</span>
                  <Switch checked={!!visible[item.k]} onCheckedChange={(v)=>setVisible(s=>({...s,[item.k]:!!v}))} />
                </div>
              ))}
            </div>
            <DropdownMenuSeparator />
            <div className="flex items-center gap-2 mt-2">
              <Select value={newSectionType} onValueChange={(v)=> setNewSectionType(v as "text"|"list") }>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Section</SelectItem>
                  <SelectItem value="list">List Section</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newSectionPlacement} onValueChange={(v)=> setNewSectionPlacement(v as "left"|"right") }>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Placement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left Column</SelectItem>
                  <SelectItem value="right">Right Column</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="secondary"
                onClick={()=>
                  setSections(prev=>[
                    ...prev,
                    {
                      id:`custom-${prev.length+1}`,
                      title: newSectionType === "list" ? "List" : "Text",
                      content: newSectionType === "list" ? "New bullet point" : "",
                      type: newSectionType,
                      placement: newSectionPlacement,
                    },
                  ])
                }
              >
                +
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto space-x-2 flex items-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">AI Tools</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>AI Tools</DialogTitle>
              </DialogHeader>
              <UITabs defaultValue="summary" className="w-full">
                <UITabsList>
                  <UITabsTrigger value="summary">Summary</UITabsTrigger>
                  <UITabsTrigger value="bullets">Bullets</UITabsTrigger>
                  <UITabsTrigger value="skills">Skills</UITabsTrigger>
                </UITabsList>
                <UITabsContent value="summary" className="space-y-2">
                  <Textarea id="ai-summary" placeholder="Describe your role, highlights..." />
                  <Button onClick={async()=>{
                    const input = (document.getElementById("ai-summary") as HTMLTextAreaElement)?.value;
                    const res = await fetch("/api/ai/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "summary", input }) });
                    const data = await res.json();
                    setSections(prev=> prev.map(s=> s.id==="about" && s.type==="text" ? { ...s, content: String(data.text ?? "") } : s));
                  }}>Generate Summary</Button>
                </UITabsContent>
                <UITabsContent value="bullets" className="space-y-2">
                  <Textarea id="ai-bullets" placeholder="Paste job description or responsibilities..." />
                  <Button onClick={async()=>{
                    const input = (document.getElementById("ai-bullets") as HTMLTextAreaElement)?.value;
                    const res = await fetch("/api/ai/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "bullets", input }) });
                    const data = await res.json();
                    setSections(prev=> prev.map(s=> s.id==="work" && s.type==="experience" ? { ...s, items: [{ company: "Company", role: "Role", from: "From", to: "Until", bullets: String(data.text ?? "") }] } : s));
                  }}>Generate Bullets</Button>
                </UITabsContent>
                <UITabsContent value="skills" className="space-y-2">
                  <Input id="ai-skills" placeholder="Target role e.g. Senior Full Stack" />
                  <Button onClick={async()=>{
                    const input = (document.getElementById("ai-skills") as HTMLInputElement)?.value;
                    const res = await fetch("/api/ai/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "skills", input }) });
                    const data = await res.json();
                    const list = String(data.text ?? "").split(/,|\n/).map(s=> s.trim()).filter(Boolean);
                    setSections(prev=> prev.map(s=> s.id==="skills" && s.type==="skills" ? { ...s, skills: list } : s));
                  }}>Generate Skills</Button>
                </UITabsContent>
              </UITabs>
            </DialogContent>
          </Dialog>
          <Button onClick={exportPdf}>Download PDF</Button>
        </div>
      </div>

      <main className="w-full max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Layout: {layout} · Font: {font} · Size: {size}
          </div>
          <div className="space-x-2">
            <Button variant="secondary">Preview</Button>
            <Button onClick={exportPdf}>Download PDF</Button>
          </div>
        </div>

        <div className="rounded-xl p-8 shadow-2xl" style={{ backgroundColor: hexToRgba(theme.color, 0.08) }}>
          <div className="border-2 rounded-lg p-12 bg-white shadow-lg" ref={previewRef} style={{ borderColor: hexToRgba(theme.color, 0.12) }}>
          <div className="grid gap-8" style={{ fontFamily: `var(--font-${font.toLowerCase().replace(' ', '-')}), ${font}, sans-serif`, fontSize: size==="sm"?"0.9rem":size==="lg"?"1.1rem":"1rem" }}>
            {visible.picture && showPhoto ? (
              <div className="relative group">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover shadow-md" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-linear-to-br from-gray-200 to-gray-300 shadow-md flex items-center justify-center">
                    <label htmlFor="photo-upload" className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                      Click to upload
                    </label>
                  </div>
                )}
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {photoUrl && (
                  <label htmlFor="photo-upload" className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <span className="text-white text-sm">Change</span>
                  </label>
                )}
              </div>
            ) : null}
            <header className="space-y-3 border-b-2 pb-6" style={{ borderColor: theme.color }}>
              <h1
                contentEditable
                suppressContentEditableWarning
                className="text-4xl font-bold outline-none tracking-tight"
                onBlur={e=> setName((e.target as HTMLElement).innerText)}
                style={{ color: theme.color }}
              >
                {name}
              </h1>
              <p
                contentEditable
                suppressContentEditableWarning
                className="text-base font-semibold outline-none uppercase tracking-wide"
                style={{ color: '#4b5563' }}
                onBlur={e=> setRole((e.target as HTMLElement).innerText)}
              >
                {role}
              </p>
              <div className="text-sm flex flex-wrap gap-5 pt-2" style={{ color: '#6b7280' }}>
                {visible.location && (
                  <span className="inline-flex items-center gap-1.5 outline-none" contentEditable suppressContentEditableWarning onBlur={e=> setLocation((e.target as HTMLElement).innerText)}>
                    <MapPin size={16} color={theme.color} strokeWidth={2} />{location}
                  </span>
                )}
                {visible.email && (
                  <span className="inline-flex items-center gap-1.5 outline-none" contentEditable suppressContentEditableWarning onBlur={e=> setEmail((e.target as HTMLElement).innerText)}>
                    <Mail size={16} color={theme.color} strokeWidth={2} />{email}
                  </span>
                )}
                {visible.phone && (
                  <span className="inline-flex items-center gap-1.5 outline-none" contentEditable suppressContentEditableWarning onBlur={e=> setPhone((e.target as HTMLElement).innerText)}>
                    <Phone size={16} color={theme.color} strokeWidth={2} />{phone}
                  </span>
                )}
              </div>
            </header>
            {/* Body sections with layout-aware columns */}
            {layout === "split" ? (
              <div className="grid grid-cols-3 gap-10">
                <div className="col-span-1 space-y-8">
                  {sections.filter(s=> visible[s.id] !== false && s.placement === "left").map((s, idx, arr) => (
                    <section key={s.id} className="space-y-3 group relative p-3 -m-3 rounded-lg border-2 border-transparent hover:border-dashed hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200">
                      <div className="flex items-center justify-between border-b-2 pb-2" style={{ borderColor: theme.color }}>
                        <h2 className="text-base font-bold uppercase tracking-wide" style={{ color: theme.color }}>{s.title}</h2>
                        <div className="flex items-center gap-1">
                          {s.type === "list" && (
                            <ItemControls onInsertAfter={()=> insertListLineAfter(s.id, -1)} />
                          )}
                          {s.type === "experience" && (
                            <ItemControls onInsertAfter={()=> addExperienceItem()} />
                          )}
                          {s.type === "education" && (
                            <ItemControls onInsertAfter={()=> addEducationItem()} />
                          )}
                          {s.type === "skills" && (
                            <Button size="sm" variant="secondary" onClick={()=> addSkill("New skill")}>＋ Add skill</Button>
                          )}
                          <ItemControls 
                            className="ml-2"
                            onMoveUp={idx > 0 ? ()=> moveSection(s.id, -1) : undefined}
                            onMoveDown={idx < arr.length - 1 ? ()=> moveSection(s.id, 1) : undefined}
                            onRemove={()=> removeSection(s.id)}
                          />
                        </div>
                      </div>
                      {s.type === "list" ? (
                        <ul className="space-y-2 text-sm">
                          {s.content.split(/\n+/).filter(Boolean).map((line, i)=> (
                            <li
                              key={i}
                              className="relative group cursor-move flex gap-2"
                              draggable
                              onDragStart={(e)=>{ setDragState({ kind: "list", sectionId: s.id, from: i }); e.dataTransfer.setData("text/plain", `${i}`); }}
                              onDragOver={(e)=> e.preventDefault()}
                              onDrop={(e)=>{ e.preventDefault(); const from = dragState?.from ?? i; if (dragState?.kind === "list" && dragState.sectionId === s.id) { reorderListLine(s.id, from, i); } setDragState(null); }}
                            >
                              <span style={{ color: theme.color }}>•</span>
                              <span
                                className="outline-none flex-1"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e)=> updateListLine(s.id, i, (e.target as HTMLElement).innerText)}
                              >{line}</span>
                              <ItemControls
                                className="-right-6"
                                onMoveUp={()=> moveListLine(s.id, i, -1)}
                                onMoveDown={()=> moveListLine(s.id, i, 1)}
                                onInsertAfter={()=> insertListLineAfter(s.id, i)}
                                onRemove={()=> removeListLine(s.id, i)}
                              />
                            </li>
                          ))}
                        </ul>
                      ) : s.type === "skills" ? (
                        <div className="flex flex-wrap gap-2 text-sm">
                          {s.skills.map((sk, i)=> (
                            <div
                              key={i}
                              className="rounded-full px-3 py-1.5 relative group transition-all hover:shadow-md"
                              style={{ backgroundColor: hexToRgba(theme.color, 0.08), color: theme.color, fontWeight: 500 }}
                            >
                              <span
                                className="outline-none"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e)=> setSections(prev=> prev.map(sec=> sec.type==='skills' && sec.id===s.id ? { ...sec, skills: sec.skills.map((v,idx)=> idx===i ? (e.target as HTMLElement).innerText : v) } : sec))}
                              >{sk}</span>
                              <ItemControls className="-right-6" onRemove={()=> setSections(prev=> prev.map(sec=> sec.type==='skills' && sec.id===s.id ? { ...sec, skills: sec.skills.filter((_,idx)=> idx!==i) } : sec))} />
                            </div>
                          ))}
                          <button
                            className="rounded-full px-3 py-1.5 text-sm font-medium transition-all hover:shadow-md"
                            style={{ backgroundColor: hexToRgba(theme.color, 0.08), color: theme.color }}
                            onClick={()=> addSkill("New skill")}
                          >＋</button>
                        </div>
                      ) : s.type === "text" ? (
                        <p
                          className="whitespace-pre-wrap leading-relaxed text-sm text-gray-700 outline-none"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e)=> updateTextLikeSection(s.id, (e.target as HTMLElement).innerText)}
                        >{s.content || "Enter your professional summary..."}</p>
                      ) : null}
                    </section>
                  ))}
                </div>
                <div className="col-span-2 space-y-8">
                  {sections.filter(s=> visible[s.id] !== false && s.placement === "right").map((s, idx, arr) => (
                    <section key={s.id} className="space-y-3 group relative p-3 -m-3 rounded-lg border-2 border-transparent hover:border-dashed hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200">
                    <div className="flex items-center justify-between border-b-2 pb-2" style={{ borderColor: theme.color }}>
                      <h2 className="text-base font-bold uppercase tracking-wide" style={{ color: theme.color }}>{s.title}</h2>
                      <div className="flex items-center gap-1">
                        {s.type === "list" && (
                          <ItemControls onInsertAfter={()=> insertListLineAfter(s.id, -1)} />
                        )}
                        {s.type === "experience" && (
                          <ItemControls onInsertAfter={()=> addExperienceItem()} />
                        )}
                        {s.type === "education" && (
                          <ItemControls onInsertAfter={()=> addEducationItem()} />
                        )}
                        {s.type === "skills" && (
                          <Button size="sm" variant="secondary" onClick={()=> addSkill("New skill")}>＋ Add skill</Button>
                        )}
                        <ItemControls 
                          className="ml-2"
                          onMoveUp={idx > 0 ? ()=> moveSection(s.id, -1) : undefined}
                          onMoveDown={idx < arr.length - 1 ? ()=> moveSection(s.id, 1) : undefined}
                          onRemove={()=> removeSection(s.id)}
                        />
                      </div>
                    </div>
                      {s.type === "list" ? (
                        <ul className="space-y-2 text-sm">
                          {s.content.split(/\n+/).filter(Boolean).map((line, i)=> (
                            <li
                              key={i}
                              className="relative group cursor-move flex gap-2"
                              draggable
                              onDragStart={(e)=>{ setDragState({ kind: "list", sectionId: s.id, from: i }); e.dataTransfer.setData("text/plain", `${i}`); }}
                              onDragOver={(e)=> e.preventDefault()}
                              onDrop={(e)=>{ e.preventDefault(); const from = dragState?.from ?? i; if (dragState?.kind === "list" && dragState.sectionId === s.id) { reorderListLine(s.id, from, i); } setDragState(null); }}
                            >
                              <span style={{ color: theme.color }}>•</span>
                              <span
                                className="outline-none flex-1"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e)=> updateListLine(s.id, i, (e.target as HTMLElement).innerText)}
                              >{line}</span>
                              <ItemControls
                                className="-right-6"
                                onMoveUp={()=> moveListLine(s.id, i, -1)}
                                onMoveDown={()=> moveListLine(s.id, i, 1)}
                                onInsertAfter={()=> insertListLineAfter(s.id, i)}
                                onRemove={()=> removeListLine(s.id, i)}
                              />
                            </li>
                          ))}
                        </ul>
                      ) : s.type === "experience" ? (
                        <Timeline style={{ padding: 0, margin: 0 }}>
                          {s.items.map((it, i)=> (
                            <TimelineItem
                              key={i}
                              sx={{ minHeight: 'auto', '&:before': { display: 'none' } }}
                              className="group"
                            >
                              <TimelineSeparator>
                                <TimelineDot style={{ backgroundColor: theme.color, margin: '12px 0' }} />
                                {i < s.items.length - 1 && <TimelineConnector style={{ backgroundColor: hexToRgba(theme.color, 0.3) }} />}
                              </TimelineSeparator>
                              <TimelineContent
                                sx={{ paddingTop: 0, paddingBottom: 3 }}
                                className="cursor-move"
                                draggable
                                onDragStart={(e)=>{ setDragState({ kind: "exp", from: i }); e.dataTransfer.setData("text/plain", `${i}`); }}
                                onDragOver={(e)=> e.preventDefault()}
                                onDrop={(e)=>{ e.preventDefault(); const from = dragState?.from ?? i; if (dragState?.kind === "exp") { reorderExperience(from, i); } setDragState(null); }}
                              >
                                <div className="relative">
                                  <div className="flex items-start justify-between gap-4 mb-1">
                                    <span
                                      className="outline-none font-bold"
                                      style={{ color: theme.color }}
                                      contentEditable
                                      suppressContentEditableWarning
                                      onBlur={(e)=> updateExperienceItem(i,{company: (e.target as HTMLElement).innerText})}
                                    >{it.company}</span>
                                    <div className="text-xs font-medium whitespace-nowrap" style={{ color: '#9ca3af' }}>
                                      <span
                                        className="outline-none"
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e)=> updateExperienceItem(i,{from: (e.target as HTMLElement).innerText})}
                                      >{it.from}</span>
                                      {" "}-{" "}
                                      <span
                                        className="outline-none"
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e)=> updateExperienceItem(i,{to: (e.target as HTMLElement).innerText})}
                                      >{it.to}</span>
                                    </div>
                                  </div>
                                  <div
                                    className="outline-none font-semibold text-gray-800 mb-2"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e)=> updateExperienceItem(i,{role: (e.target as HTMLElement).innerText})}
                                  >{it.role}</div>
                                  <div
                                    className="text-sm leading-relaxed whitespace-pre-wrap outline-none text-gray-700"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e)=> updateExperienceItem(i,{bullets: (e.target as HTMLElement).innerText})}
                                  >{it.bullets}</div>
                                  <ItemControls
                                    className="right-0 -top-6"
                                    onAi={() => aiBulletsForExperience(i)}
                                    onMoveUp={() => moveExperience(i,-1)}
                                    onMoveDown={() => moveExperience(i,1)}
                                    onInsertAfter={() => insertExperienceAfter(i)}
                                    onRemove={() => removeExperience(i)}
                                  />
                                </div>
                              </TimelineContent>
                            </TimelineItem>
                          ))}
                        </Timeline>
                      ) : s.type === "education" ? (
                        <Timeline style={{ padding: 0, margin: 0 }}>
                          {s.items.map((ed, i)=>(
                            <TimelineItem
                              key={i}
                              sx={{ minHeight: 'auto', '&:before': { display: 'none' } }}
                              className="group"
                            >
                              <TimelineSeparator>
                                <TimelineDot style={{ backgroundColor: theme.color, margin: '12px 0' }} />
                                {i < s.items.length - 1 && <TimelineConnector style={{ backgroundColor: hexToRgba(theme.color, 0.3) }} />}
                              </TimelineSeparator>
                              <TimelineContent
                                sx={{ paddingTop: 0, paddingBottom: 2 }}
                                className="cursor-move text-sm"
                                draggable
                                onDragStart={(e)=>{ setDragState({ kind: "edu", from: i }); e.dataTransfer.setData("text/plain", `${i}`); }}
                                onDragOver={(e)=> e.preventDefault()}
                                onDrop={(e)=>{ e.preventDefault(); const from = dragState?.from ?? i; if (dragState?.kind === "edu") { reorderEducation(from, i); } setDragState(null); }}
                              >
                                <div className="relative">
                                  <div className="flex items-start justify-between gap-4 mb-1">
                                    <span
                                      className="font-bold outline-none"
                                      style={{ color: theme.color }}
                                      contentEditable
                                      suppressContentEditableWarning
                                      onBlur={(e)=> updateEducationItem(i,{school: (e.target as HTMLElement).innerText})}
                                    >{ed.school}</span>
                                    <div className="text-xs font-medium whitespace-nowrap" style={{ color: '#9ca3af' }}>
                                      <span
                                        className="outline-none"
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e)=> updateEducationItem(i,{from: (e.target as HTMLElement).innerText})}
                                      >{ed.from}</span>{" "}-{" "}
                                      <span
                                        className="outline-none"
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e)=> updateEducationItem(i,{to: (e.target as HTMLElement).innerText})}
                                      >{ed.to}</span>
                                    </div>
                                  </div>
                                  <div
                                    className="outline-none font-semibold text-gray-800"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e)=> updateEducationItem(i,{degree: (e.target as HTMLElement).innerText})}
                                  >{ed.degree}</div>
                                  <ItemControls
                                    className="right-0 -top-6"
                                    onMoveUp={() => moveEducation(i,-1)}
                                    onMoveDown={() => moveEducation(i,1)}
                                    onInsertAfter={() => insertEducationAfter(i)}
                                    onRemove={() => removeEducation(i)}
                                  />
                                </div>
                              </TimelineContent>
                            </TimelineItem>
                          ))}
                        </Timeline>
                      ) : s.type === "text" ? (
                        <p
                          className="whitespace-pre-wrap leading-relaxed text-sm text-gray-700 outline-none"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e)=> updateTextLikeSection(s.id, (e.target as HTMLElement).innerText)}
                        >{s.content || "Enter your professional summary..."}</p>
                      ) : null}
                    </section>
                  ))}
                </div>
              </div>
            ) : layout === "hybrid" ? (
              <div className="grid grid-cols-2 gap-8">
                {sections.filter(s=> visible[s.id] !== false).map((s, idx, arr) => (
                  <section key={s.id} className="space-y-3 group relative p-3 -m-3 rounded-lg border-2 border-transparent hover:border-dashed hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200">
                    <div className="flex items-center justify-between border-b-2 pb-2" style={{ borderColor: theme.color }}>
                      <h2 className="text-base font-bold uppercase tracking-wide" style={{ color: theme.color }}>{s.title}</h2>
                      <div className="flex items-center gap-1">
                        {s.type === "list" && (
                          <ItemControls onInsertAfter={()=> insertListLineAfter(s.id, -1)} />
                        )}
                        {s.type === "experience" && (
                          <ItemControls onInsertAfter={()=> addExperienceItem()} />
                        )}
                        {s.type === "education" && (
                          <ItemControls onInsertAfter={()=> addEducationItem()} />
                        )}
                        {s.type === "skills" && (
                          <Button size="sm" variant="secondary" onClick={()=> addSkill("New skill")}>＋ Add skill</Button>
                        )}
                        <ItemControls 
                          className="ml-2"
                          onMoveUp={idx > 0 ? ()=> moveSection(s.id, -1) : undefined}
                          onMoveDown={idx < arr.length - 1 ? ()=> moveSection(s.id, 1) : undefined}
                          onRemove={()=> removeSection(s.id)}
                        />
                      </div>
                    </div>
                    {s.type === "list" ? (
                      <ul className="space-y-2 text-sm">
                        {s.content.split(/\n+/).filter(Boolean).map((line, i)=> (
                          <li
                            key={i}
                            className="relative group cursor-move flex gap-2"
                            draggable
                            onDragStart={(e)=>{ setDragState({ kind: "list", sectionId: s.id, from: i }); e.dataTransfer.setData("text/plain", `${i}`); }}
                            onDragOver={(e)=> e.preventDefault()}
                            onDrop={(e)=>{ e.preventDefault(); const from = dragState?.from ?? i; if (dragState?.kind === "list" && dragState.sectionId === s.id) { reorderListLine(s.id, from, i); } setDragState(null); }}
                          >
                            <span style={{ color: theme.color }}>•</span>
                            <span
                              className="outline-none flex-1"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e)=> updateListLine(s.id, i, (e.target as HTMLElement).innerText)}
                            >{line}</span>
                            <ItemControls
                              className="-right-6"
                              onMoveUp={()=> moveListLine(s.id, i, -1)}
                              onMoveDown={()=> moveListLine(s.id, i, 1)}
                              onInsertAfter={()=> insertListLineAfter(s.id, i)}
                              onRemove={()=> removeListLine(s.id, i)}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : s.type === "experience" ? (
                      <Timeline sx={{ padding: 0, margin: 0 }}>
                        {s.items.map((it, i)=> (
                          <TimelineItem
                            key={i}
                            sx={{ minHeight: 'auto', '&:before': { display: 'none' } }}
                            className="group"
                          >
                            <TimelineSeparator>
                              <TimelineDot style={{ backgroundColor: theme.color, margin: '12px 0' }} />
                              {i < s.items.length - 1 && <TimelineConnector style={{ backgroundColor: hexToRgba(theme.color, 0.3) }} />}
                            </TimelineSeparator>
                            <TimelineContent
                              sx={{ paddingTop: 0, paddingBottom: 3 }}
                              className="cursor-move"
                              draggable
                              onDragStart={(e)=>{ setDragState({ kind: "exp", from: i }); e.dataTransfer.setData("text/plain", `${i}`); }}
                              onDragOver={(e)=> e.preventDefault()}
                              onDrop={(e)=>{ e.preventDefault(); const from = dragState?.from ?? i; if (dragState?.kind === "exp") { reorderExperience(from, i); } setDragState(null); }}
                            >
                              <div className="relative">
                                <div className="flex items-start justify-between gap-4 mb-1">
                                  <span
                                    className="outline-none font-bold"
                                    style={{ color: theme.color }}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e)=> updateExperienceItem(i,{company: (e.target as HTMLElement).innerText})}
                                  >{it.company}</span>
                                  <div className="text-xs font-medium whitespace-nowrap" style={{ color: '#9ca3af' }}>
                                    <span
                                      className="outline-none"
                                      contentEditable
                                      suppressContentEditableWarning
                                      onBlur={(e)=> updateExperienceItem(i,{from: (e.target as HTMLElement).innerText})}
                                    >{it.from}</span>
                                    {" "}-{" "}
                                    <span
                                      className="outline-none"
                                      contentEditable
                                      suppressContentEditableWarning
                                      onBlur={(e)=> updateExperienceItem(i,{to: (e.target as HTMLElement).innerText})}
                                    >{it.to}</span>
                                  </div>
                                </div>
                                <div
                                  className="outline-none font-semibold text-gray-800 mb-2"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e)=> updateExperienceItem(i,{role: (e.target as HTMLElement).innerText})}
                                >{it.role}</div>
                                <div
                                  className="text-sm leading-relaxed whitespace-pre-wrap outline-none text-gray-700"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e)=> updateExperienceItem(i,{bullets: (e.target as HTMLElement).innerText})}
                                >{it.bullets}</div>
                                <ItemControls
                                  className="right-0 -top-6"
                                  onAi={() => aiBulletsForExperience(i)}
                                  onMoveUp={() => moveExperience(i,-1)}
                                  onMoveDown={() => moveExperience(i,1)}
                                  onInsertAfter={() => insertExperienceAfter(i)}
                                  onRemove={() => removeExperience(i)}
                                />
                              </div>
                            </TimelineContent>
                          </TimelineItem>
                        ))}
                      </Timeline>
                    ) : s.type === "education" ? (
                      <Timeline sx={{ padding: 0, margin: 0 }}>
                        {s.items.map((ed, i)=>(
                          <TimelineItem
                            key={i}
                            sx={{ minHeight: 'auto', '&:before': { display: 'none' } }}
                            className="group"
                          >
                            <TimelineSeparator>
                              <TimelineDot style={{ backgroundColor: theme.color, margin: '12px 0' }} />
                              {i < s.items.length - 1 && <TimelineConnector style={{ backgroundColor: hexToRgba(theme.color, 0.3) }} />}
                            </TimelineSeparator>
                            <TimelineContent
                              sx={{ paddingTop: 0, paddingBottom: 2 }}
                              className="cursor-move text-sm"
                              draggable
                              onDragStart={(e)=>{ setDragState({ kind: "edu", from: i }); e.dataTransfer.setData("text/plain", `${i}`); }}
                              onDragOver={(e)=> e.preventDefault()}
                              onDrop={(e)=>{ e.preventDefault(); const from = dragState?.from ?? i; if (dragState?.kind === "edu") { reorderEducation(from, i); } setDragState(null); }}
                            >
                              <div className="relative">
                                <div className="flex items-start justify-between gap-4 mb-1">
                                  <span
                                    className="font-bold outline-none"
                                    style={{ color: theme.color }}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e)=> updateEducationItem(i,{school: (e.target as HTMLElement).innerText})}
                                  >{ed.school}</span>
                                  <div className="text-xs font-medium whitespace-nowrap" style={{ color: '#9ca3af' }}>
                                    <span
                                      className="outline-none"
                                      contentEditable
                                      suppressContentEditableWarning
                                      onBlur={(e)=> updateEducationItem(i,{from: (e.target as HTMLElement).innerText})}
                                    >{ed.from}</span>{" "}-{" "}
                                    <span
                                      className="outline-none"
                                      contentEditable
                                      suppressContentEditableWarning
                                      onBlur={(e)=> updateEducationItem(i,{to: (e.target as HTMLElement).innerText})}
                                    >{ed.to}</span>
                                  </div>
                                </div>
                                <div
                                  className="outline-none font-semibold text-gray-800"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e)=> updateEducationItem(i,{degree: (e.target as HTMLElement).innerText})}
                                >{ed.degree}</div>
                                <ItemControls
                                  className="right-0 -top-6"
                                  onMoveUp={() => moveEducation(i,-1)}
                                  onMoveDown={() => moveEducation(i,1)}
                                  onInsertAfter={() => insertEducationAfter(i)}
                                  onRemove={() => removeEducation(i)}
                                />
                              </div>
                            </TimelineContent>
                          </TimelineItem>
                        ))}
                      </Timeline>
                    ) : s.type === "skills" ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {s.skills.map((sk, i)=> (
                          <div
                            key={i}
                            className="rounded border px-2 py-1 relative group cursor-move"
                            draggable
                            onDragStart={(e)=>{ setDragState({ kind: "skill", from: i }); e.dataTransfer.setData("text/plain", `${i}`); }}
                            onDragOver={(e)=> e.preventDefault()}
                            onDrop={(e)=>{ e.preventDefault(); const from = dragState?.from ?? i; if (dragState?.kind === "skill") { reorderSkill(from, i); } setDragState(null); }}
                          >
                            <span
                              className="outline-none"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e)=> setSections(prev=> prev.map(sec=> sec.type==='skills' && sec.id===s.id ? { ...sec, skills: sec.skills.map((v,idx)=> idx===i ? (e.target as HTMLElement).innerText : v) } : sec))}
                            >{sk}</span>
                            <ItemControls className="-right-6" onRemove={()=> setSections(prev=> prev.map(sec=> sec.type==='skills' && sec.id===s.id ? { ...sec, skills: sec.skills.filter((_,idx)=> idx!==i) } : sec))} />
                          </div>
                        ))}
                        <button className="rounded border px-2 py-1 text-sm" onClick={()=> addSkill("New skill")}>＋</button>
                      </div>
                    ) : s.type === "text" ? (
                      <p
                        className="whitespace-pre-wrap leading-relaxed text-sm text-gray-700 outline-none"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e)=> updateTextLikeSection(s.id, (e.target as HTMLElement).innerText)}
                      >{s.content || "Enter your professional summary..."}</p>
                    ) : null}
                  </section>
                ))}
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                {sections.filter(s=> visible[s.id] !== false).map((s, idx, arr) => (
                  <section key={s.id} className="space-y-3 group relative p-3 -m-3 rounded-lg border-2 border-transparent hover:border-dashed hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200">
                    <div className="flex items-center justify-between border-b-2 pb-2" style={{ borderColor: theme.color }}>
                      <h2 className="text-base font-bold uppercase tracking-wide" style={{ color: theme.color }}>{s.title}</h2>
                      <div className="flex items-center gap-1">
                        {s.type === "list" && (
                          <ItemControls onInsertAfter={()=> insertListLineAfter(s.id, -1)} />
                        )}
                        {s.type === "experience" && (
                          <ItemControls onInsertAfter={()=> addExperienceItem()} />
                        )}
                        {s.type === "education" && (
                          <ItemControls onInsertAfter={()=> addEducationItem()} />
                        )}
                        {s.type === "skills" && (
                          <Button size="sm" variant="secondary" onClick={()=> addSkill("New skill")}>＋ Add skill</Button>
                        )}
                        <ItemControls 
                          className="ml-2"
                          onMoveUp={idx > 0 ? ()=> moveSection(s.id, -1) : undefined}
                          onMoveDown={idx < arr.length - 1 ? ()=> moveSection(s.id, 1) : undefined}
                          onRemove={()=> removeSection(s.id)}
                        />
                      </div>
                    </div>
                    {s.type === "list" ? (
                      <ul className="space-y-2 text-sm">
                        {s.content.split(/\n+/).filter(Boolean).map((line, i)=> (
                          <li
                            key={i}
                            className="relative group cursor-move flex gap-2"
                            draggable
                            onDragStart={(e)=>{ setDragState({ kind: "list", sectionId: s.id, from: i }); e.dataTransfer.setData("text/plain", `${i}`); }}
                            onDragOver={(e)=> e.preventDefault()}
                            onDrop={(e)=>{ e.preventDefault(); const from = dragState?.from ?? i; if (dragState?.kind === "list" && dragState.sectionId === s.id) { reorderListLine(s.id, from, i); } setDragState(null); }}
                          >
                            <span style={{ color: theme.color }}>•</span>
                            <span
                              className="outline-none flex-1"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e)=> updateListLine(s.id, i, (e.target as HTMLElement).innerText)}
                            >{line}</span>
                            <ItemControls
                              className="-right-6"
                              onMoveUp={()=> moveListLine(s.id, i, -1)}
                              onMoveDown={()=> moveListLine(s.id, i, 1)}
                              onInsertAfter={()=> insertListLineAfter(s.id, i)}
                              onRemove={()=> removeListLine(s.id, i)}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : s.type === "experience" ? (
                      <Timeline style={{ padding: 0, margin: 0 }}>
                        {s.items.map((it, i)=> (
                          <TimelineItem
                            key={i}
                            style={{ minHeight: 'auto' }}
                            className="group"
                          >
                            <TimelineSeparator>
                              <TimelineDot style={{ backgroundColor: theme.color, margin: '12px 0' }} />
                              {i < s.items.length - 1 && <TimelineConnector style={{ backgroundColor: hexToRgba(theme.color, 0.3) }} />}
                            </TimelineSeparator>
                            <TimelineContent
                              style={{ paddingTop: 0, paddingBottom: 3 }}
                              className="cursor-move"
                              draggable
                              onDragStart={(e)=>{ setDragState({ kind: "exp", from: i }); e.dataTransfer.setData("text/plain", `${i}`); }}
                              onDragOver={(e)=> e.preventDefault()}
                              onDrop={(e)=>{ e.preventDefault(); const from = dragState?.from ?? i; if (dragState?.kind === "exp") { reorderExperience(from, i); } setDragState(null); }}
                            >
                              <div className="relative">
                                <div className="flex items-start justify-between gap-4 mb-1">
                                  <span
                                    className="outline-none font-bold"
                                    style={{ color: theme.color }}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e)=> updateExperienceItem(i,{company: (e.target as HTMLElement).innerText})}
                                  >{it.company}</span>
                                  <div className="text-xs font-medium whitespace-nowrap" style={{ color: '#9ca3af' }}>
                                    <span
                                      className="outline-none"
                                      contentEditable
                                      suppressContentEditableWarning
                                      onBlur={(e)=> updateExperienceItem(i,{from: (e.target as HTMLElement).innerText})}
                                    >{it.from}</span>
                                    {" "}-{" "}
                                    <span
                                      className="outline-none"
                                      contentEditable
                                      suppressContentEditableWarning
                                      onBlur={(e)=> updateExperienceItem(i,{to: (e.target as HTMLElement).innerText})}
                                    >{it.to}</span>
                                  </div>
                                </div>
                                <div
                                  className="outline-none font-semibold text-gray-800 mb-2"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e)=> updateExperienceItem(i,{role: (e.target as HTMLElement).innerText})}
                                >{it.role}</div>
                                <div
                                  className="text-sm leading-relaxed whitespace-pre-wrap outline-none text-gray-700"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e)=> updateExperienceItem(i,{bullets: (e.target as HTMLElement).innerText})}
                                >{it.bullets}</div>
                                <ItemControls
                                  className="right-0 -top-6"
                                  onAi={() => aiBulletsForExperience(i)}
                                  onMoveUp={() => moveExperience(i,-1)}
                                  onMoveDown={() => moveExperience(i,1)}
                                  onInsertAfter={() => insertExperienceAfter(i)}
                                  onRemove={() => removeExperience(i)}
                                />
                              </div>
                            </TimelineContent>
                          </TimelineItem>
                        ))}
                      </Timeline>
                    ) : s.type === "education" ? (
                      <Timeline style={{ padding: 0, margin: 0 }}>
                        {s.items.map((ed, i)=>(
                          <TimelineItem
                            key={i}
                            style={{ minHeight: 'auto' }}
                            className="group"
                          >
                            <TimelineSeparator>
                              <TimelineDot style={{ backgroundColor: theme.color, margin: '12px 0' }} />
                              {i < s.items.length - 1 && <TimelineConnector style={{ backgroundColor: hexToRgba(theme.color, 0.3) }} />}
                            </TimelineSeparator>
                            <TimelineContent
                              style={{ paddingTop: 0, paddingBottom: 2 }}
                              className="cursor-move text-sm"
                              draggable
                              onDragStart={(e)=>{ setDragState({ kind: "edu", from: i }); e.dataTransfer.setData("text/plain", `${i}`); }}
                              onDragOver={(e)=> e.preventDefault()}
                              onDrop={(e)=>{ e.preventDefault(); const from = dragState?.from ?? i; if (dragState?.kind === "edu") { reorderEducation(from, i); } setDragState(null); }}
                            >
                              <div className="relative">
                                <div className="flex items-start justify-between gap-4 mb-1">
                                  <span
                                    className="font-bold outline-none"
                                    style={{ color: theme.color }}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e)=> updateEducationItem(i,{school: (e.target as HTMLElement).innerText})}
                                  >{ed.school}</span>
                                  <div className="text-xs font-medium whitespace-nowrap" style={{ color: '#9ca3af' }}>
                                    <span
                                      className="outline-none"
                                      contentEditable
                                      suppressContentEditableWarning
                                      onBlur={(e)=> updateEducationItem(i,{from: (e.target as HTMLElement).innerText})}
                                    >{ed.from}</span>{" "}-{" "}
                                    <span
                                      className="outline-none"
                                      contentEditable
                                      suppressContentEditableWarning
                                      onBlur={(e)=> updateEducationItem(i,{to: (e.target as HTMLElement).innerText})}
                                    >{ed.to}</span>
                                  </div>
                                </div>
                                <div
                                  className="outline-none font-semibold text-gray-800"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e)=> updateEducationItem(i,{degree: (e.target as HTMLElement).innerText})}
                                >{ed.degree}</div>
                                <ItemControls
                                  className="right-0 -top-6"
                                  onMoveUp={() => moveEducation(i,-1)}
                                  onMoveDown={() => moveEducation(i,1)}
                                  onInsertAfter={() => insertEducationAfter(i)}
                                  onRemove={() => removeEducation(i)}
                                />
                              </div>
                            </TimelineContent>
                          </TimelineItem>
                        ))}
                      </Timeline>
                    ) : s.type === "skills" ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {s.skills.map((sk, i)=> (
                          <div
                            key={i}
                            className="rounded border px-2 py-1 relative group cursor-move"
                            draggable
                            onDragStart={(e)=>{ setDragState({ kind: "skill", from: i }); e.dataTransfer.setData("text/plain", `${i}`); }}
                            onDragOver={(e)=> e.preventDefault()}
                            onDrop={(e)=>{ e.preventDefault(); const from = dragState?.from ?? i; if (dragState?.kind === "skill") { reorderSkill(from, i); } setDragState(null); }}
                          >
                            <span
                              className="outline-none"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e)=> setSections(prev=> prev.map(sec=> sec.type==='skills' && sec.id===s.id ? { ...sec, skills: sec.skills.map((v,idx)=> idx===i ? (e.target as HTMLElement).innerText : v) } : sec))}
                            >{sk}</span>
                            <ItemControls className="-right-6" onRemove={()=> setSections(prev=> prev.map(sec=> sec.type==='skills' && sec.id===s.id ? { ...sec, skills: sec.skills.filter((_,idx)=> idx!==i) } : sec))} />
                          </div>
                        ))}
                        <button className="rounded border px-2 py-1 text-sm" onClick={()=> addSkill("New skill")}>＋</button>
                      </div>
                    ) : s.type === "text" ? (
                      <p
                        className="whitespace-pre-wrap leading-relaxed text-sm text-gray-700 outline-none"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e)=> updateTextLikeSection(s.id, (e.target as HTMLElement).innerText)}
                      >{s.content || "Enter your professional summary..."}</p>
                    ) : null}
                  </section>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}


