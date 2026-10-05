"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./icons";
import { IconButton } from "./Button";

// CARD-05 / SRCH's add-panel: closes via Close button, Escape, or outside
// click. Focus moves to the panel on open and returns to the trigger on close.
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      lastFocused.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally re-runs only on open/close
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-[rgba(36,31,61,0.45)] flex items-center justify-center p-4 z-[500]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="bg-paper-raised border-[2.5px] border-ink rounded-card shadow-[0_8px_0_0_rgba(36,31,61,0.2)] max-w-[560px] w-full max-h-[88vh] overflow-y-auto p-6 flex flex-col gap-4 outline-none"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-display">{title}</h2>
          <IconButton onClick={onClose} aria-label={`Close ${title}`}>
            <CloseIcon className="w-5 h-5" />
          </IconButton>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
