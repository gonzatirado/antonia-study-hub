"use client";

import { useEffect, useRef, useState } from "react";

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
  const [openUp, setOpenUp] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Detect if menu would overflow viewport bottom
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const menuHeight = items.length * 40 + 8; // approx height
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUp(spaceBelow < menuHeight);
    }

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
  }, [open, onClose, anchorRef, items.length]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      className={`absolute right-0 z-50 min-w-[180px] bg-card border border-border rounded-lg shadow-xl py-1 animate-in fade-in-0 zoom-in-95 ${
        openUp ? "bottom-8" : "top-8"
      }`}
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
