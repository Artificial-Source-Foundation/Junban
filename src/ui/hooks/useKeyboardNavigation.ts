import { useEffect, useCallback } from "react";
import type { Task } from "../../core/types.js";

interface UseKeyboardNavigationOptions {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onClose: () => void;
  enabled: boolean;
}

export function useKeyboardNavigation({
  tasks,
  selectedTaskId,
  onSelect,
  onOpen,
  onClose,
  enabled,
}: UseKeyboardNavigationOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Skip when focus is in form elements
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const currentIndex = selectedTaskId ? tasks.findIndex((t) => t.id === selectedTaskId) : -1;

      switch (e.key) {
        case "j": {
          e.preventDefault();
          const nextIndex = currentIndex + 1;
          if (nextIndex < tasks.length) {
            onSelect(tasks[nextIndex].id);
          } else if (tasks.length > 0 && currentIndex === -1) {
            onSelect(tasks[0].id);
          }
          break;
        }
        case "k": {
          e.preventDefault();
          const prevIndex = currentIndex - 1;
          if (prevIndex >= 0) {
            onSelect(tasks[prevIndex].id);
          }
          break;
        }
        case "Enter": {
          if (selectedTaskId) {
            e.preventDefault();
            onOpen(selectedTaskId);
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          onClose();
          break;
        }
      }
    },
    [tasks, selectedTaskId, onSelect, onOpen, onClose, enabled],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
