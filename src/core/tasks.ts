import type { CreateTaskInput, UpdateTaskInput, Task } from "./types.js";
import { generateId } from "../utils/ids.js";

/**
 * Task service — handles task CRUD operations.
 * This is the core of the application. Both UI and CLI use this module.
 */
export class TaskService {
  // TODO: Accept storage backend (SQLite or Markdown) via constructor

  async create(input: CreateTaskInput): Promise<Task> {
    const now = new Date().toISOString();
    const task: Task = {
      id: generateId(),
      title: input.title,
      description: input.description ?? null,
      status: "pending",
      priority: input.priority ?? null,
      dueDate: input.dueDate ?? null,
      dueTime: input.dueTime ?? false,
      completedAt: null,
      projectId: input.projectId ?? null,
      recurrence: input.recurrence ?? null,
      tags: [], // TODO: Resolve tag names to Tag objects
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    };

    // TODO: Persist to storage
    // TODO: Emit task:create event for plugins

    return task;
  }

  async list(): Promise<Task[]> {
    // TODO: Query storage
    return [];
  }

  async get(id: string): Promise<Task | null> {
    // TODO: Query storage
    return null;
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task | null> {
    // TODO: Update in storage
    // TODO: Emit task:update event for plugins
    return null;
  }

  async complete(id: string): Promise<Task | null> {
    // TODO: Mark completed, handle recurrence
    // TODO: Emit task:complete event for plugins
    return null;
  }

  async delete(id: string): Promise<boolean> {
    // TODO: Delete from storage
    // TODO: Emit task:delete event for plugins
    return false;
  }
}
