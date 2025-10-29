"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ItemControlsProps = {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onInsertAfter?: () => void;
  onRemove?: () => void;
  onAi?: () => void;
  className?: string;
};

export function ItemControls({ onMoveUp, onMoveDown, onInsertAfter, onRemove, onAi, className }: ItemControlsProps) {
  return (
    <div className={cn("absolute -right-2 -top-2 hidden gap-1 group-hover:flex z-10", className)}>
      {onAi ? (
        <Button size="sm" variant="secondary" onClick={onAi}>✦</Button>
      ) : null}
      {onMoveUp ? (
        <Button size="sm" variant="secondary" onClick={onMoveUp}>↑</Button>
      ) : null}
      {onMoveDown ? (
        <Button size="sm" variant="secondary" onClick={onMoveDown}>↓</Button>
      ) : null}
      {onInsertAfter ? (
        <Button size="sm" variant="secondary" onClick={onInsertAfter}>＋</Button>
      ) : null}
      {onRemove ? (
        <Button size="sm" variant="secondary" onClick={onRemove}>✕</Button>
      ) : null}
    </div>
  );
}


