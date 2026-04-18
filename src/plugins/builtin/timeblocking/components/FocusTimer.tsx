import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Square, Clock } from "lucide-react";
import type { TimeBlock } from "../types.js";
import { timeToMinutes } from "./TimelineColumn.js";
import { formatRemaining, isBlockActive } from "./focus-timer-utils.js";

interface FocusTimerProps {
  block: TimeBlock;
  onComplete?: () => void;
  onStatusUpdate?: (status: string) => void;
}

export function FocusTimer({ block, onComplete, onStatusUpdate }: FocusTimerProps) {
  const [focusing, setFocusing] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [completed, setCompleted] = useState(false);
  const completedRef = useRef(false);
  const active = isBlockActive(block);

  // Calculate remaining time
  const updateRemaining = useCallback(() => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const endMinutes = timeToMinutes(block.endTime);
    const remaining = Math.max(0, endMinutes - nowMinutes);
    setRemainingMinutes(remaining);

    if (remaining <= 0 && focusing && !completedRef.current) {
      completedRef.current = true;
      setCompleted(true);
      setFocusing(false);
      onComplete?.();
      onStatusUpdate?.("");
    }

    return remaining;
  }, [block.endTime, focusing, onComplete, onStatusUpdate]);

  // Timer tick
  useEffect(() => {
    if (!focusing) return;
    updateRemaining();
    const timer = setInterval(updateRemaining, 10000); // Update every 10 seconds
    return () => clearInterval(timer);
  }, [focusing, updateRemaining]);

  // Update status bar
  useEffect(() => {
    if (focusing && remainingMinutes > 0) {
      onStatusUpdate?.(`📅 Focus: ${block.title} (${formatRemaining(remainingMinutes)} left)`);
    }
  }, [focusing, remainingMinutes, block.title, onStatusUpdate]);

  const handleStartFocus = useCallback(() => {
    completedRef.current = false;
    setCompleted(false);
    setFocusing(true);
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const endMinutes = timeToMinutes(block.endTime);
    setRemainingMinutes(Math.max(0, endMinutes - nowMinutes));
  }, [block.endTime]);

  const handleStopFocus = useCallback(() => {
    setFocusing(false);
    onStatusUpdate?.("");
  }, [onStatusUpdate]);

  if (completed) {
    return (
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-success/10 text-success text-xs font-medium"
        data-testid="focus-complete"
      >
        <Clock size={12} />
        <span>Time block complete!</span>
      </div>
    );
  }

  if (focusing) {
    return (
      <div className="flex items-center gap-2" data-testid="focus-active">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-medium animate-pulse">
          <Clock size={12} />
          <span>{formatRemaining(remainingMinutes)} remaining</span>
        </div>
        <button
          onClick={handleStopFocus}
          className="p-1 rounded hover:bg-surface-secondary text-on-surface-muted transition-colors"
          aria-label="Stop focus"
          data-testid="focus-stop"
        >
          <Square size={12} />
        </button>
      </div>
    );
  }

  if (!active) return null;

  return (
    <button
      onClick={handleStartFocus}
      className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
      data-testid="focus-start"
    >
      <Play size={12} />
      <span>Focus</span>
    </button>
  );
}
