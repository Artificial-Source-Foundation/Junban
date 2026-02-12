import type { ParsedTask } from "../parser/task-parser.js";

/** Format a parsed task for terminal output. */
export function formatTaskSummary(task: ParsedTask): string {
  const parts = [task.title];

  if (task.dueDate) {
    const dateStr = task.dueTime
      ? task.dueDate.toLocaleString()
      : task.dueDate.toLocaleDateString();
    parts.push(`(due ${dateStr})`);
  }

  if (task.priority) {
    parts.push(`P${task.priority}`);
  }

  if (task.tags.length > 0) {
    parts.push(task.tags.map((t) => `#${t}`).join(" "));
  }

  if (task.project) {
    parts.push(`+${task.project}`);
  }

  return parts.join(" ");
}
