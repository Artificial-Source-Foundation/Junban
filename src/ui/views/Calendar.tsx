import { useMemo, useCallback } from "react";
import { CalendarRange, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toDateKey } from "../../utils/format-date.js";
import type { Task, Project } from "../../core/types.js";

interface CalendarProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  onUpdateDueDate?: (taskId: string, dueDate: string | null) => void;
}

function getWeekDays(startDate: Date): Date[] {
  const days: Date[] = [];
  const start = new Date(startDate);
  start.setDate(start.getDate() - start.getDay()); // Start from Sunday
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
}

function formatDayHeader(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

export function Calendar({
  tasks,
  projects,
  onSelectTask,
}: CalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const baseDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDays = useMemo(() => getWeekDays(baseDate), [baseDate]);

  const today = toDateKey(new Date());

  const projectMap = useMemo(() => {
    const map = new Map<string, Project>();
    for (const p of projects) map.set(p.id, p);
    return map;
  }, [projects]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const day of weekDays) {
      map.set(toDateKey(day), []);
    }
    for (const task of tasks) {
      if (task.dueDate) {
        const key = task.dueDate.split("T")[0];
        if (map.has(key)) {
          map.get(key)!.push(task);
        }
      }
    }
    return map;
  }, [tasks, weekDays]);

  const handlePrevWeek = useCallback(() => setWeekOffset((o) => o - 1), []);
  const handleNextWeek = useCallback(() => setWeekOffset((o) => o + 1), []);
  const handleToday = useCallback(() => setWeekOffset(0), []);

  const weekLabel = useMemo(() => {
    const first = weekDays[0];
    const last = weekDays[6];
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    if (first.getFullYear() !== last.getFullYear()) {
      return `${first.toLocaleDateString("en-US", { ...opts, year: "numeric" })} - ${last.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
    }
    if (first.getMonth() !== last.getMonth()) {
      return `${first.toLocaleDateString("en-US", opts)} - ${last.toLocaleDateString("en-US", opts)}`;
    }
    return `${first.toLocaleDateString("en-US", { month: "long" })} ${first.getDate()} - ${last.getDate()}, ${first.getFullYear()}`;
  }, [weekDays]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <CalendarRange size={24} className="text-accent" />
        <h1 className="text-xl md:text-2xl font-bold text-on-surface">Calendar</h1>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={handlePrevWeek}
          aria-label="Previous week"
          className="p-1.5 rounded-lg hover:bg-surface-secondary transition-colors text-on-surface-muted hover:text-on-surface"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={handleToday}
          className="px-3 py-1 text-sm font-medium rounded-lg hover:bg-surface-secondary transition-colors text-on-surface-muted hover:text-on-surface"
        >
          Today
        </button>
        <button
          onClick={handleNextWeek}
          aria-label="Next week"
          className="p-1.5 rounded-lg hover:bg-surface-secondary transition-colors text-on-surface-muted hover:text-on-surface"
        >
          <ChevronRight size={18} />
        </button>
        <span className="text-sm font-medium text-on-surface ml-2">{weekLabel}</span>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border border-border">
        {weekDays.map((day) => {
          const key = toDateKey(day);
          const dayTasks = tasksByDay.get(key) ?? [];
          const isToday = key === today;

          return (
            <div
              key={key}
              className={`min-h-[120px] p-2 bg-surface ${isToday ? "bg-accent/5" : ""}`}
            >
              <div
                className={`text-xs font-medium mb-1.5 ${
                  isToday ? "text-accent font-semibold" : "text-on-surface-muted"
                }`}
              >
                {formatDayHeader(day)}
              </div>
              <div className="space-y-0.5">
                {dayTasks.map((task) => {
                  const project = task.projectId ? projectMap.get(task.projectId) : null;
                  return (
                    <button
                      key={task.id}
                      onClick={() => onSelectTask(task.id)}
                      className={`w-full text-left text-xs px-1.5 py-1 rounded transition-colors truncate ${
                        task.status === "completed"
                          ? "line-through text-on-surface-muted"
                          : task.priority && task.priority <= 2
                            ? "bg-error/10 text-on-surface hover:bg-error/20"
                            : "bg-surface-secondary text-on-surface hover:bg-surface-tertiary"
                      }`}
                    >
                      <span className="truncate">{task.title}</span>
                      {project && (
                        <span
                          className="ml-1 inline-block w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
