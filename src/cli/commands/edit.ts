import type { AppServices } from "../../bootstrap.js";
import type { UpdateTaskInput } from "../../core/types.js";
import { NotFoundError, ValidationError } from "../../core/errors.js";
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
  if (options.priority) {
    const priority = Number(options.priority);
    if (!Number.isInteger(priority) || priority < 1 || priority > 4) {
      throw new ValidationError("Priority must be a whole number from 1 to 4.");
    }
    updates.priority = priority;
  }
  if (options.description) updates.description = options.description;

  if (options.due) {
    const parsed = parseDate(options.due);
    if (parsed) {
      updates.dueDate = parsed.date.toISOString();
      updates.dueTime = parsed.hasTime;
    } else {
      throw new ValidationError(`Could not parse date: "${options.due}"`);
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ValidationError(
      "No updates provided. Use --title, --priority, --due, or --description.",
    );
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
      throw new NotFoundError("Task", id);
    }
    throw err;
  }
}
