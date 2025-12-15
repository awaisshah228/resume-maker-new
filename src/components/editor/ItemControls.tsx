"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

type ItemControlsProps = {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onInsertAfter?: () => void;
  onRemove?: () => void;
  onAi?: () => void;
  onTogglePlacement?: () => void;
  placementLabel?: string;
  className?: string;
  hideOnInputFocus?: boolean;
};

export function ItemControls({ onMoveUp, onMoveDown, onInsertAfter, onRemove, onAi, onTogglePlacement, placementLabel, className, hideOnInputFocus }: ItemControlsProps) {
  const buttonClass = "w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium transition-all duration-200 bg-gray-800 hover:bg-gray-900 text-white border border-gray-700 active:scale-95";
  
  const [hasInputFocus, setHasInputFocus] = useState(false);
  
  useEffect(() => {
    if (!hideOnInputFocus) return;
    
    const checkInputFocus = () => {
      const activeElement = document.activeElement;
      return activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.getAttribute('contenteditable') === 'true'
      );
    };
    
    const handleFocus = () => {
      if (checkInputFocus()) {
        setHasInputFocus(true);
      }
    };
    
    const handleBlur = () => {
      // Use setTimeout to check after blur event completes
      setTimeout(() => {
        setHasInputFocus(checkInputFocus());
      }, 0);
    };
    
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    
    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, [hideOnInputFocus]);
  
  const shouldShow = !hideOnInputFocus || !hasInputFocus;
  
  // Ensure opacity-0 is always applied unless className explicitly sets opacity-100
  const hasExplicitOpacity = className?.includes("opacity-100") || className?.includes("opacity-");
  const baseClasses = hasExplicitOpacity 
    ? "absolute group-hover:opacity-100 transition-opacity duration-200 flex gap-1.5 z-20 bg-gray-800 rounded-lg p-1.5 shadow-2xl border border-gray-700"
    : "absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1.5 z-20 bg-gray-800 rounded-lg p-1.5 shadow-2xl border border-gray-700";
  
  return (
    <div className={cn(baseClasses, className, !shouldShow && "!hidden")}>
      {onAi ? (
        <button 
          onClick={onAi}
          className={buttonClass}
          title="AI Assistant"
        >
          ✦
        </button>
      ) : null}
      {onTogglePlacement ? (
        <button 
          onClick={onTogglePlacement}
          className={buttonClass}
          title={`Move to ${placementLabel === "left" ? "Right" : "Left"}`}
        >
          {placementLabel === "left" ? "→" : "←"}
        </button>
      ) : null}
      {onMoveUp ? (
        <button 
          onClick={onMoveUp}
          className={buttonClass}
          title="Move Up"
        >
          ↑
        </button>
      ) : null}
      {onMoveDown ? (
        <button 
          onClick={onMoveDown}
          className={buttonClass}
          title="Move Down"
        >
          ↓
        </button>
      ) : null}
      {onInsertAfter ? (
        <button 
          onClick={onInsertAfter}
          className={buttonClass}
          title="Add New"
        >
          ＋
        </button>
      ) : null}
      {onRemove ? (
        <button 
          onClick={onRemove}
          className={buttonClass}
          title="Remove"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}


