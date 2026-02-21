import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Task } from "../../core/types.js";
import { TaskItem } from "./TaskItem.js";

interface VirtualizedTaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  selectedTaskId: string | null;
  onUpdateDueDate?: (taskId: string, dueDate: string | null) => void;
}

export function VirtualizedTaskList({
  tasks,
  onToggle,
  onSelect,
  selectedTaskId,
  onUpdateDueDate,
}: VirtualizedTaskListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  return (
    <div
      ref={parentRef}
      role="list"
      aria-label="Tasks"
      className="overflow-auto"
      style={{ maxHeight: "calc(100vh - 200px)" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const task = tasks[virtualRow.index];
          return (
            <div
              key={task.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <TaskItem
                task={task}
                onToggle={onToggle}
                onSelect={onSelect}
                isSelected={selectedTaskId === task.id}
                onUpdateDueDate={onUpdateDueDate}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
