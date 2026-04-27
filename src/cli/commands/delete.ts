import type { AppServices } from "../../bootstrap.js";
import { NotFoundError } from "../../core/errors.js";

interface DeleteOptions {
  json?: boolean;
}

export async function deleteTask(id: string, services: AppServices, options?: DeleteOptions) {
  const task = await services.taskService.get(id);
  if (!task) {
    throw new NotFoundError("Task", id);
  }

  await services.taskService.delete(id);

  if (options?.json) {
    console.log(JSON.stringify({ deleted: true, id: task.id, title: task.title }, null, 2));
  } else {
    console.log(` Deleted: ${task.title} [${task.id.slice(0, 8)}]`);
  }
}
