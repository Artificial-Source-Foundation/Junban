import { parseTask } from "../../parser/task-parser.js";
import type { AppServices } from "../../bootstrap.js";

export async function addTask(description: string, services: AppServices) {
  const parsed = parseTask(description);

  // Resolve project if present
  let projectId: string | null = null;
  if (parsed.project) {
    const project = await services.projectService.getOrCreate(parsed.project);
    projectId = project.id;
  }

  const task = await services.taskService.create({
    title: parsed.title,
    priority: parsed.priority,
    dueDate: parsed.dueDate?.toISOString() ?? null,
    dueTime: parsed.dueTime,
    tags: parsed.tags,
    projectId,
  });

  const parts = [` Created: ${task.title}`];
  if (task.priority) parts.push(`P${task.priority}`);
  if (task.tags.length > 0) parts.push(task.tags.map((t) => `#${t.name}`).join(" "));
  if (task.dueDate) parts.push(`due ${new Date(task.dueDate).toLocaleDateString()}`);
  parts.push(`[${task.id.slice(0, 8)}]`);

  console.log(parts.join(" "));
}
