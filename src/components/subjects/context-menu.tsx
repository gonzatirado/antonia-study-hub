"use client";

import { useEffect, useRef } from "react";

export interface ContextMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

export interface ContextMenuProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  onClose: () => void;
  items: ContextMenuItem[];
}

export function ContextMenu({ anchorRef, open, onClose, items }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      className="absolute right-0 top-8 z-50 min-w-[180px] bg-card border border-border rounded-lg shadow-xl py-1 animate-in fade-in-0 zoom-in-95"
    >
      {items.map((itm) => (
        <button
          key={itm.label}
          onClick={(e) => { e.stopPropagation(); itm.onClick(); onClose(); }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
            itm.danger
              ? "text-destructive hover:bg-destructive/10"
              : "text-foreground hover:bg-muted"
          }`}
        >
          {itm.icon}
          {itm.label}
        </button>
      ))}
    </div>
  );
}
