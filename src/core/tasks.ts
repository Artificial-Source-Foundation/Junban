import type { CreateTaskInput, UpdateTaskInput, Task, Tag } from "./types.js";
import type { Queries } from "../db/queries.js";
import type { TagService } from "./tags.js";
import type { TaskFilter } from "./filters.js";
import { filterTasks } from "./filters.js";
import { sortByPriority } from "./priorities.js";
import { generateId } from "../utils/ids.js";
import { NotFoundError } from "./errors.js";

/**
 * Task service — handles task CRUD operations.
 * This is the core of the application. Both UI and CLI use this module.
 */
export class TaskService {
  constructor(
    private queries: Queries,
    private tagService: TagService,
  ) {}

  async create(input: CreateTaskInput): Promise<Task> {
    const now = new Date().toISOString();
    const id = generateId();

    // Resolve tags: getOrCreate each tag name
    const tags: Tag[] = [];
    for (const tagName of input.tags ?? []) {
      const tag = await this.tagService.getOrCreate(tagName);
      tags.push(tag);
    }

    // Insert the task row
    this.queries.insertTask({
      id,
      title: input.title,
      description: input.description ?? null,
      status: "pending",
      priority: input.priority ?? null,
      dueDate: input.dueDate ?? null,
      dueTime: input.dueTime ?? false,
      completedAt: null,
      projectId: input.projectId ?? null,
      recurrence: input.recurrence ?? null,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Insert task-tag associations
    for (const tag of tags) {
      this.queries.insertTaskTag(id, tag.id);
    }

    return {
      id,
      title: input.title,
      description: input.description ?? null,
      status: "pending",
      priority: input.priority ?? null,
      dueDate: input.dueDate ?? null,
      dueTime: input.dueTime ?? false,
      completedAt: null,
      projectId: input.projectId ?? null,
      recurrence: input.recurrence ?? null,
      tags,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  async list(filter?: TaskFilter): Promise<Task[]> {
    const rows = this.queries.listTasks();

    // Hydrate each task with its tags
    const tasks: Task[] = rows.map((row) => {
      const tagRows = this.queries.getTaskTags(row.id);
      const tags = tagRows.map((r) => r.tags);
      return { ...row, dueTime: row.dueTime ?? false, tags };
    });

    // Apply in-memory filtering (reuses existing filterTasks)
    let result = filter ? filterTasks(tasks, filter) : tasks;

    // Apply priority sorting
    result = sortByPriority(result);

    return result;
  }

  async get(id: string): Promise<Task | null> {
    const rows = this.queries.getTask(id);
    if (rows.length === 0) return null;

    const row = rows[0];
    const tagRows = this.queries.getTaskTags(id);
    const tags = tagRows.map((r) => r.tags);

    return { ...row, dueTime: row.dueTime ?? false, tags };
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    const existing = await this.get(id);
    if (!existing) throw new NotFoundError("Task", id);

    const now = new Date().toISOString();
    const { tags: tagNames, ...fields } = input;

    // Update task fields
    this.queries.updateTask(id, { ...fields, updatedAt: now });

    // If tags are being updated, replace all tag associations
    if (tagNames !== undefined) {
      this.queries.deleteTaskTags(id);
      for (const tagName of tagNames) {
        const tag = await this.tagService.getOrCreate(tagName);
        this.queries.insertTaskTag(id, tag.id);
      }
    }

    return (await this.get(id))!;
  }

  async complete(id: string): Promise<Task> {
    const existing = await this.get(id);
    if (!existing) throw new NotFoundError("Task", id);

    const now = new Date().toISOString();
    this.queries.updateTask(id, {
      status: "completed",
      completedAt: now,
      updatedAt: now,
    });

    // TODO: Handle recurrence (Sprint 2, C-11)
    // TODO: Emit task:complete event for plugins (Sprint 3)

    return (await this.get(id))!;
  }

  async delete(id: string): Promise<boolean> {
    this.queries.deleteTaskTags(id);
    const result = this.queries.deleteTask(id);
    return result.changes > 0;
  }
}
