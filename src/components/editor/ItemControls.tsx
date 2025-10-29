"use client";

import { cn } from "@/lib/utils";

type ItemControlsProps = {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onInsertAfter?: () => void;
  onRemove?: () => void;
  onAi?: () => void;
  onTogglePlacement?: () => void;
  placementLabel?: string;
  className?: string;
};

export function ItemControls({ onMoveUp, onMoveDown, onInsertAfter, onRemove, onAi, onTogglePlacement, placementLabel, className }: ItemControlsProps) {
  const buttonClass = "w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg active:scale-95";
  
  return (
    <div className={cn("absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1.5 z-10 bg-white/95 backdrop-blur-sm rounded-lg p-1.5 shadow-xl border border-gray-200", className)}>
      {onAi ? (
        <button 
          onClick={onAi}
          className={cn(buttonClass, "bg-linear-to-br from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600")}
          title="AI Assistant"
        >
          ✦
        </button>
      ) : null}
      {onTogglePlacement ? (
        <button 
          onClick={onTogglePlacement}
          className={cn(buttonClass, "bg-linear-to-br from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700")}
          title={`Move to ${placementLabel === "left" ? "Right" : "Left"}`}
        >
          {placementLabel === "left" ? "→" : "←"}
        </button>
      ) : null}
      {onMoveUp ? (
        <button 
          onClick={onMoveUp}
          className={cn(buttonClass, "bg-linear-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700")}
          title="Move Up"
        >
          ↑
        </button>
      ) : null}
      {onMoveDown ? (
        <button 
          onClick={onMoveDown}
          className={cn(buttonClass, "bg-linear-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700")}
          title="Move Down"
        >
          ↓
        </button>
      ) : null}
      {onInsertAfter ? (
        <button 
          onClick={onInsertAfter}
          className={cn(buttonClass, "bg-linear-to-br from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700")}
          title="Add New"
        >
          ＋
        </button>
      ) : null}
      {onRemove ? (
        <button 
          onClick={onRemove}
          className={cn(buttonClass, "bg-linear-to-br from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700")}
          title="Remove"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}


