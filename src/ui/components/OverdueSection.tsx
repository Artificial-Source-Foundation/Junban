import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import type { Task, Project } from "../../core/types.js";

interface OverdueSectionProps {
  tasks: Task[];
  projects: Map<string, Project>;
  onSelectTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  onReschedule: () => void;
  selectedTaskId: string | null;
}

export function OverdueSection({
  tasks,
  projects,
  onSelectTask,
  onToggleTask,
  onReschedule,
  selectedTaskId,
}: OverdueSectionProps) {
  const [expanded, setExpanded] = useState(true);

  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm font-semibold text-error hover:text-error/80 transition-colors"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <AlertTriangle size={14} />
          Overdue
        </button>
        <span className="text-xs text-error font-medium">{tasks.length}</span>
        <button
          onClick={onReschedule}
          className="ml-auto text-xs text-accent hover:text-accent/80 font-medium transition-colors"
        >
          Reschedule
        </button>
      </div>
      {expanded && (
        <div className="space-y-0.5">
          {tasks.map((task) => {
            const project = task.projectId ? projects.get(task.projectId) : null;
            return (
              <div
                key={task.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectTask(task.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectTask(task.id);
                  }
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  selectedTaskId === task.id
                    ? "bg-accent/5 ring-1 ring-accent/50"
                    : "hover:bg-surface-secondary"
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleTask(task.id);
                  }}
                  aria-label="Complete task"
                  className="w-5 h-5 rounded-full border-2 border-error flex-shrink-0 transition-colors"
                />
                <span className="flex-1 text-sm text-on-surface">{task.title}</span>
                {project && (
                  <span className="flex items-center gap-1.5 text-xs text-on-surface-muted flex-shrink-0">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    {project.name}
                  </span>
                )}
                <span className="text-xs text-error font-medium flex-shrink-0">
                  {new Date(task.dueDate!).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
