/**
 * Ghost block overlay that visualizes proposed (not yet committed) time blocks.
 * Renders with dashed border and reduced opacity to distinguish from real blocks.
 */

import type { ProposedBlock } from "../auto-scheduler.js";
import { timeToMinutes } from "./TimelineColumn.js";

interface ProposedBlockOverlayProps {
  proposed: ProposedBlock[];
  workDayStart: string;
  pixelsPerHour: number;
}

export function ProposedBlockOverlay({
  proposed,
  workDayStart,
  pixelsPerHour,
}: ProposedBlockOverlayProps) {
  const startMinutes = timeToMinutes(workDayStart);
  const pixelsPerMinute = pixelsPerHour / 60;

  return (
    <>
      {proposed.map((block) => {
        const blockStart = timeToMinutes(block.startTime);
        const blockEnd = timeToMinutes(block.endTime);
        const top = (blockStart - startMinutes) * pixelsPerMinute;
        const height = (blockEnd - blockStart) * pixelsPerMinute;

        return (
          <div
            key={`proposed-${block.taskId}`}
            className="absolute left-1 right-1 rounded-md border-2 border-dashed border-indigo-400 bg-indigo-500/15 opacity-70 pointer-events-none flex items-center px-2 overflow-hidden z-10"
            style={{ top, height }}
            data-testid={`proposed-block-${block.taskId}`}
          >
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-300 truncate">
                {block.title}
              </span>
              <span className="text-[10px] text-indigo-500 dark:text-indigo-400">
                {block.startTime} - {block.endTime}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}
