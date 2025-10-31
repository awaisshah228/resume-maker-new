"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Dynamically import GrapesJSEditor to avoid SSR issues
const GrapesJSEditor = dynamic(
  () => import('@/components/editor/GrapesJSEditor'),
  { ssr: false }
);

export default function GrapesEditorPage() {
  const [savedData, setSavedData] = useState<{ html: string; css: string } | null>(null);

  const handleSave = (html: string, css: string) => {
    setSavedData({ html, css });
    // You can also save to localStorage or send to backend
    if (typeof window !== 'undefined') {
      localStorage.setItem('resume-data', JSON.stringify({ html, css }));
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-50">
      <div className="absolute top-4 left-4 z-50">
        <Link 
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
      
      <GrapesJSEditor onSave={handleSave} />
    </div>
  );
}

