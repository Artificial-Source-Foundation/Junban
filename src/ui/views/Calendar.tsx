import { useMemo, useCallback, useState } from "react";
import { CalendarRange, ChevronLeft, ChevronRight, Circle, CheckCircle2 } from "lucide-react";
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
  start.setDate(start.getDate() - start.getDay());
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
}

const PRIORITY_COLORS: Record<number, string> = {
  1: "border-l-red-500",
  2: "border-l-amber-500",
  3: "border-l-accent",
};

export function Calendar({
  tasks,
  projects,
  onSelectTask,
  onToggleTask,
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

  const totalTasksThisWeek = useMemo(() => {
    let count = 0;
    for (const arr of tasksByDay.values()) count += arr.length;
    return count;
  }, [tasksByDay]);

  const handlePrevWeek = useCallback(() => setWeekOffset((o) => o - 1), []);
  const handleNextWeek = useCallback(() => setWeekOffset((o) => o + 1), []);
  const handleToday = useCallback(() => setWeekOffset(0), []);

  const weekLabel = useMemo(() => {
    const first = weekDays[0];
    const last = weekDays[6];
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    if (first.getFullYear() !== last.getFullYear()) {
      return `${first.toLocaleDateString("en-US", { ...opts, year: "numeric" })} – ${last.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
    }
    if (first.getMonth() !== last.getMonth()) {
      return `${first.toLocaleDateString("en-US", opts)} – ${last.toLocaleDateString("en-US", opts)}`;
    }
    return `${first.toLocaleDateString("en-US", { month: "long" })} ${first.getDate()}–${last.getDate()}, ${first.getFullYear()}`;
  }, [weekDays]);

  return (
    <div className="flex flex-col h-full -m-3 md:-m-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <CalendarRange size={22} className="text-accent" />
          <h1 className="text-lg font-semibold text-on-surface">{weekLabel}</h1>
          {totalTasksThisWeek > 0 && (
            <span className="text-xs text-on-surface-muted bg-surface-secondary px-2 py-0.5 rounded-full">
              {totalTasksThisWeek} task{totalTasksThisWeek !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevWeek}
            aria-label="Previous week"
            className="p-1.5 rounded-lg hover:bg-surface-secondary transition-colors text-on-surface-muted hover:text-on-surface"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleToday}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              weekOffset === 0
                ? "bg-accent/10 text-accent"
                : "hover:bg-surface-secondary text-on-surface-muted hover:text-on-surface"
            }`}
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
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border bg-surface shrink-0">
        {weekDays.map((day) => {
          const key = toDateKey(day);
          const isToday = key === today;
          const weekday = day.toLocaleDateString("en-US", { weekday: "short" });
          const dayNum = day.getDate();

          return (
            <div
              key={key}
              className={`flex flex-col items-center py-2.5 ${
                isToday ? "bg-accent/5" : ""
              }`}
            >
              <span className={`text-[10px] uppercase tracking-wider font-medium ${
                isToday ? "text-accent" : "text-on-surface-muted"
              }`}>
                {weekday}
              </span>
              <span className={`text-lg font-semibold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full ${
                isToday
                  ? "bg-accent text-white"
                  : "text-on-surface"
              }`}>
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>

      {/* Week grid — fills remaining space */}
      <div className="grid grid-cols-7 flex-1 min-h-0 overflow-auto">
        {weekDays.map((day) => {
          const key = toDateKey(day);
          const dayTasks = tasksByDay.get(key) ?? [];
          const isToday = key === today;

          return (
            <div
              key={key}
              className={`border-r border-border last:border-r-0 p-1.5 overflow-y-auto ${
                isToday ? "bg-accent/[0.03]" : ""
              }`}
            >
              <div className="space-y-1">
                {dayTasks.map((task) => {
                  const project = task.projectId ? projectMap.get(task.projectId) : null;
                  const isCompleted = task.status === "completed";
                  const priorityBorder = !isCompleted && task.priority
                    ? PRIORITY_COLORS[task.priority] ?? "border-l-transparent"
                    : "border-l-transparent";

                  return (
                    <div
                      key={task.id}
                      className={`group relative rounded-md border-l-2 ${priorityBorder} transition-all ${
                        isCompleted
                          ? "opacity-50"
                          : "hover:shadow-sm"
                      }`}
                    >
                      <button
                        onClick={() => onSelectTask(task.id)}
                        className={`w-full text-left text-[11px] leading-tight px-1.5 py-1.5 rounded-r-md transition-colors ${
                          isCompleted
                            ? "bg-surface-secondary/50"
                            : "bg-surface-secondary hover:bg-surface-tertiary"
                        }`}
                      >
                        <div className="flex items-start gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleTask(task.id);
                            }}
                            className="shrink-0 mt-px text-on-surface-muted hover:text-accent transition-colors"
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={12} className="text-accent" />
                            ) : (
                              <Circle size={12} />
                            )}
                          </button>
                          <span className={`line-clamp-2 ${
                            isCompleted ? "line-through text-on-surface-muted" : "text-on-surface"
                          }`}>
                            {task.title}
                          </span>
                        </div>
                        {project && (
                          <div className="flex items-center gap-1 mt-0.5 ml-4">
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: project.color }}
                            />
                            <span className="text-[10px] text-on-surface-muted truncate">
                              {project.name}
                            </span>
                          </div>
                        )}
                      </button>
                    </div>
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
