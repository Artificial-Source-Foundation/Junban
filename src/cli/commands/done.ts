import type { AppServices } from "../../bootstrap.js";
import { NotFoundError } from "../../core/errors.js";

interface DoneOptions {
  json?: boolean;
}

export async function doneTask(id: string, services: AppServices, options?: DoneOptions) {
  try {
    const task = await services.taskService.complete(id);

    if (options?.json) {
      console.log(JSON.stringify(task, null, 2));
    } else {
      console.log(` Completed: ${task.title} [${task.id.slice(0, 8)}]`);
    }
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw new NotFoundError("Task", id);
    }
    throw err;
  }
}
