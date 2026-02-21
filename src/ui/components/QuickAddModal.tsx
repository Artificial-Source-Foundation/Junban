import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { TaskInput } from "./TaskInput.js";
import type { parseTask } from "../../parser/task-parser.js";

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  onCreateTask: (input: ReturnType<typeof parseTask>) => void;
}

export function QuickAddModal({ open, onClose, onCreateTask }: QuickAddModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(
    (input: ReturnType<typeof parseTask>) => {
      onCreateTask(input);
      onClose();
    },
    [onCreateTask, onClose],
  );

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-lg mx-4 bg-surface rounded-xl shadow-2xl border border-border animate-scale-fade-in">
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <span className="text-xs font-medium text-on-surface-muted uppercase tracking-wider">
            Quick Add
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-on-surface-muted hover:text-on-surface rounded-md hover:bg-surface-tertiary transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-4 pb-4">
          <TaskInput
            onSubmit={handleSubmit}
            placeholder='Add a task... (e.g., "buy milk tomorrow p1 #groceries")'
            autoFocusTrigger={open ? 1 : 0}
          />
        </div>
      </div>
    </div>
  );
}
