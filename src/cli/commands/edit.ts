import type { AppServices } from "../../bootstrap.js";
import type { UpdateTaskInput } from "../../core/types.js";
import { NotFoundError } from "../../core/errors.js";
import { parseDate } from "../../parser/nlp.js";

interface EditOptions {
  title?: string;
  priority?: string;
  due?: string;
  description?: string;
  json?: boolean;
}

export async function editTask(id: string, options: EditOptions, services: AppServices) {
  const updates: UpdateTaskInput = {};

  if (options.title) updates.title = options.title;
  if (options.priority) updates.priority = parseInt(options.priority, 10);
  if (options.description) updates.description = options.description;

  if (options.due) {
    const parsed = parseDate(options.due);
    if (parsed) {
      updates.dueDate = parsed.date.toISOString();
      updates.dueTime = parsed.hasTime;
    } else {
      console.error(`Could not parse date: "${options.due}"`);
      process.exit(1);
    }
  }

  if (Object.keys(updates).length === 0) {
    console.error("No updates provided. Use --title, --priority, --due, or --description.");
    process.exit(1);
  }

  try {
    const task = await services.taskService.update(id, updates);

    if (options.json) {
      console.log(JSON.stringify(task, null, 2));
    } else {
      console.log(` Updated: ${task.title} [${task.id.slice(0, 8)}]`);
    }
  } catch (err) {
    if (err instanceof NotFoundError) {
      console.error(`Task not found: ${id}`);
      process.exit(1);
    }
    throw err;
  }
}
