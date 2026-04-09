import { Plus } from "lucide-react";
import { useReducedMotion } from "./useReducedMotion.js";

interface FABProps {
  onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
  const reducedMotion = useReducedMotion();
  return (
    <button
      onClick={onClick}
      aria-label="Add task"
      className={`fixed z-40 md:hidden right-4 bottom-[calc(var(--height-bottom-nav)+1rem)] w-14 h-14 rounded-full bg-accent text-white shadow-lg flex items-center justify-center hover:bg-accent-hover ${reducedMotion ? "transition-colors" : "animate-scale-fade-in transition-transform duration-150 hover:scale-105 active:scale-95"}`}
    >
      <Plus size={24} />
    </button>
  );
}
