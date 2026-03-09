import { useState } from "react";
import { CheckCircle2, AlertTriangle, Clock, Tag, ChevronDown, ChevronRight } from "lucide-react";

export const PRIORITY_COLORS: Record<number, string> = {
  1: "bg-error/80 text-white",
  2: "bg-warning/80 text-white",
  3: "bg-info/80 text-white",
  4: "bg-on-surface-muted/30 text-on-surface-muted",
};

export const PRIORITY_LABELS: Record<number, string> = {
  1: "P1",
  2: "P2",
  3: "P3",
  4: "P4",
};

export function formatDueLabel(dueDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff <= 7) return `${due.toLocaleDateString("en", { weekday: "short" })}`;
  return due.toLocaleDateString("en", { month: "short", day: "numeric" });
}

export interface TaskResultItem {
  id?: string;
  title?: string;
  status?: string;
  priority?: number;
  dueDate?: string;
  tags?: string[];
  projectId?: string;
}

export function TaskListCard({
  data,
  onSelectTask,
}: {
  data: Record<string, unknown>;
  onSelectTask?: (taskId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const tasks = (data.tasks ?? []) as TaskResultItem[];

  if (tasks.length === 0) return null;

  const visibleTasks = expanded ? tasks : tasks.slice(0, 5);
  const hasMore = tasks.length > 5;
  const pendingCount = tasks.filter(
    (t) => t.status !== "completed" && t.status !== "cancelled",
  ).length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-medium text-on-surface-secondary"
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </button>
        <div className="flex items-center gap-1.5 text-[10px] text-on-surface-muted">
          {pendingCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {pendingCount} pending
            </span>
          )}
          {completedCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              {completedCount} done
            </span>
          )}
        </div>
      </div>
      {/* Task rows */}
      <div className="space-y-px">
        {visibleTasks.map((task, i) => {
          const isCompleted = task.status === "completed";
          const isOverdue = !isCompleted && task.dueDate && new Date(task.dueDate) < new Date();
          return (
            <button
              key={task.id ?? i}
              onClick={() => task.id && onSelectTask?.(task.id)}
              className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-surface-secondary/80 transition-colors flex items-center gap-2 group/row"
            >
              {isCompleted ? (
                <CheckCircle2 size={14} className="text-success shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-on-surface-muted/30 shrink-0 group-hover/row:border-accent transition-colors" />
              )}
              <span
                className={`flex-1 min-w-0 truncate ${
                  isCompleted ? "line-through text-on-surface-muted" : "text-on-surface"
                }`}
              >
                {task.title}
              </span>
              {/* Priority badge */}
              {task.priority && task.priority >= 1 && task.priority <= 4 && (
                <span
                  className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded ${PRIORITY_COLORS[task.priority]}`}
                >
                  {PRIORITY_LABELS[task.priority]}
                </span>
              )}
              {/* Due date */}
              {task.dueDate && (
                <span
                  className={`shrink-0 flex items-center gap-0.5 text-[10px] ${
                    isOverdue ? "text-error font-medium" : "text-on-surface-muted"
                  }`}
                >
                  <Clock size={9} />
                  {formatDueLabel(task.dueDate)}
                </span>
              )}
              {/* Tag dots */}
              {task.tags && task.tags.length > 0 && (
                <div className="shrink-0 flex items-center gap-0.5">
                  {task.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="w-1.5 h-1.5 rounded-full bg-accent/50" title={tag} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-xs text-accent hover:text-accent-hover px-2.5 py-1.5 font-medium"
          >
            +{tasks.length - 5} more
          </button>
        )}
      </div>
    </div>
  );
}

export function TaskBreakdown({ data }: { data: Record<string, unknown> }) {
  const parent = (data.parent ?? data.task) as { title?: string } | undefined;
  const subtasks = (data.subtasks ?? data.steps ?? []) as {
    title?: string;
    description?: string;
  }[];

  if (subtasks.length === 0) return null;

  return (
    <div>
      {parent?.title && (
        <p className="text-xs font-semibold text-on-surface mb-2">{parent.title}</p>
      )}
      <div className="ml-2 border-l-2 border-accent/30 pl-3 space-y-2">
        {subtasks.map((st, i) => (
          <div key={i} className="text-xs">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[9px] font-bold shrink-0">
                {i + 1}
              </span>
              <p className="text-on-surface font-medium">{st.title ?? `Step ${i + 1}`}</p>
            </div>
            {st.description && (
              <p className="text-on-surface-muted text-[10px] mt-0.5 ml-6">{st.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function OvercommitmentStatus({ data }: { data: Record<string, unknown> }) {
  const overloaded = data.overloaded ?? data.isOverloaded ?? data.overcommitted;
  const suggestion = (data.suggestion ?? data.message ?? data.recommendation) as string | undefined;

  return (
    <div>
      <div className="flex items-center gap-2.5">
        {overloaded ? (
          <>
            <div className="w-7 h-7 rounded-lg bg-error/10 flex items-center justify-center">
              <AlertTriangle size={14} className="text-error" />
            </div>
            <div>
              <span className="text-xs font-semibold text-error">Overloaded</span>
              {suggestion && (
                <p className="text-[10px] text-on-surface-muted mt-0.5">{suggestion}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 size={14} className="text-success" />
            </div>
            <div>
              <span className="text-xs font-semibold text-success">All clear</span>
              {suggestion && (
                <p className="text-[10px] text-on-surface-muted mt-0.5">{suggestion}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function TagSuggestions({ data }: { data: Record<string, unknown> }) {
  const tags = (data.tags ?? data.suggestions ?? []) as (
    | string
    | { name?: string; tag?: string }
  )[];
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t, i) => {
        const name = typeof t === "string" ? t : (t.name ?? t.tag ?? "");
        return (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-accent/10 text-accent rounded-lg font-medium"
          >
            <Tag size={10} />
            {name}
          </span>
        );
      })}
    </div>
  );
}

export function SimilarTasks({
  data,
  onSelectTask,
}: {
  data: Record<string, unknown>;
  onSelectTask?: (taskId: string) => void;
}) {
  const tasks = (data.tasks ?? data.similar ?? data.duplicates ?? []) as {
    id?: string;
    title?: string;
    similarity?: number;
    score?: number;
  }[];
  if (tasks.length === 0) return null;

  return (
    <div className="space-y-0.5">
      {tasks.map((task, i) => {
        const pct = Math.round((task.similarity ?? task.score ?? 0) * 100);
        return (
          <button
            key={task.id ?? i}
            onClick={() => task.id && onSelectTask?.(task.id)}
            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-on-surface hover:bg-surface-secondary/80 transition-colors flex items-center gap-2"
          >
            <span className="flex-1 truncate">{task.title}</span>
            {pct > 0 && (
              <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-md bg-accent/10 text-accent font-semibold tabular-nums">
                {pct}%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function ProjectList({ data }: { data: Record<string, unknown> }) {
  const projects = (data.projects ?? []) as {
    id?: string;
    name?: string;
    color?: string;
  }[];
  if (projects.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {projects.map((p, i) => (
        <span
          key={p.id ?? i}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-surface-tertiary text-on-surface-secondary rounded-lg font-medium"
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: p.color || "var(--color-accent)" }}
          />
          {p.name}
        </span>
      ))}
    </div>
  );
}

export function ReminderList({ data }: { data: Record<string, unknown> }) {
  const reminders = (data.reminders ?? []) as {
    id?: string;
    taskTitle?: string;
    remindAt?: string;
    time?: string;
  }[];
  if (reminders.length === 0) return null;

  return (
    <div className="space-y-1">
      {reminders.map((r, i) => (
        <div
          key={r.id ?? i}
          className="flex items-center gap-2.5 text-xs px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary/50 transition-colors"
        >
          <div className="w-5 h-5 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
            <Clock size={10} className="text-accent" />
          </div>
          <span className="flex-1 truncate text-on-surface font-medium">
            {r.taskTitle ?? `Reminder ${i + 1}`}
          </span>
          {(r.remindAt ?? r.time) && (
            <span className="shrink-0 text-[10px] text-on-surface-muted tabular-nums">
              {(r.remindAt ?? r.time ?? "").slice(0, 16).replace("T", " ")}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
