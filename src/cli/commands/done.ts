import type { AppServices } from "../../bootstrap.js";
import { NotFoundError } from "../../core/errors.js";

export async function doneTask(id: string, services: AppServices) {
  try {
    const task = await services.taskService.complete(id);
    console.log(` Completed: ${task.title} [${task.id.slice(0, 8)}]`);
  } catch (err) {
    if (err instanceof NotFoundError) {
      console.error(`Task not found: ${id}`);
      process.exit(1);
    }
    throw err;
  }
}
