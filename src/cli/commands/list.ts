import type { AppServices } from "../../bootstrap.js";
import type { TaskFilter } from "../../core/filters.js";
import type { Task } from "../../core/types.js";
import { NotFoundError } from "../../core/errors.js";

interface ListOptions {
  today?: boolean;
  project?: string;
  tag?: string;
  search?: string;
  json?: boolean;
}

export async function listTasks(options: ListOptions, services: AppServices) {
  const filter: TaskFilter = { status: "pending" };

  if (options.today) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    filter.dueAfter = todayStart.toISOString();
    filter.dueBefore = todayEnd.toISOString();
  }

  if (options.tag) {
    filter.tag = options.tag;
  }

  if (options.search) {
    filter.search = options.search;
  }

  if (options.project) {
    const project = await services.projectService.getByName(options.project);
    if (project) {
      filter.projectId = project.id;
    } else {
      throw new NotFoundError("Project", options.project);
    }
  }

  const tasks = await services.taskService.list(filter);

  if (options.json) {
    console.log(JSON.stringify(tasks, null, 2));
    return;
  }

  if (tasks.length === 0) {
    console.log("No tasks found.");
    return;
  }

  for (const task of tasks) {
    console.log(formatRow(task));
  }
}

function formatRow(task: Task): string {
  const id = task.id.slice(0, 8);
  const priority = task.priority ? `P${task.priority}` : "  ";
  const tags = task.tags.map((t) => `#${t.name}`).join(" ");
  const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "";

  const parts = [id, priority, task.title];
  if (due) parts.push(`(${due})`);
  if (tags) parts.push(tags);

  return parts.join("  ");
}
