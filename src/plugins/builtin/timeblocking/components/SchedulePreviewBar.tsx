/**
 * Bottom bar shown when an auto-schedule preview is active.
 * Displays summary and Apply All / Cancel actions.
 */

import type { ProposedSchedule } from "../auto-scheduler.js";

interface SchedulePreviewBarProps {
  schedule: ProposedSchedule;
  onApply: () => void;
  onCancel: () => void;
  isApplying: boolean;
}

export function SchedulePreviewBar({
  schedule,
  onApply,
  onCancel,
  isApplying,
}: SchedulePreviewBarProps) {
  const scheduledCount = schedule.proposed.length;
  const couldNotFit = schedule.warnings.filter((w) =>
    w.reason.includes("No available"),
  ).length;

  return (
    <div
      className="flex items-center justify-between px-4 py-2 bg-indigo-50 dark:bg-indigo-950/50 border-t border-indigo-200 dark:border-indigo-800 flex-shrink-0"
      data-testid="schedule-preview-bar"
    >
      <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
        <span className="font-medium">
          {scheduledCount} task{scheduledCount !== 1 ? "s" : ""} scheduled
        </span>
        {couldNotFit > 0 && (
          <span className="text-amber-600 dark:text-amber-400">
            ({couldNotFit} couldn&apos;t fit)
          </span>
        )}
        <span className="text-indigo-500 dark:text-indigo-400">
          &middot; {schedule.totalScheduledMinutes}min total
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          disabled={isApplying}
          className="px-3 py-1.5 text-sm rounded-md border border-border text-on-surface-secondary hover:bg-surface-secondary transition-colors disabled:opacity-50"
          data-testid="schedule-cancel-btn"
        >
          Cancel
        </button>
        <button
          onClick={onApply}
          disabled={isApplying}
          className="px-3 py-1.5 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
          data-testid="schedule-apply-btn"
        >
          {isApplying ? "Applying..." : "Apply All"}
        </button>
      </div>
    </div>
  );
}
