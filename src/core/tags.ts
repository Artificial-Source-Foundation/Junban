import type { Tag } from "./types.js";
import { generateId } from "../utils/ids.js";

/** Tag service — manages task labels. */
export class TagService {
  async create(name: string, color?: string): Promise<Tag> {
    const tag: Tag = {
      id: generateId(),
      name: name.toLowerCase(),
      color: color ?? "#6b7280",
    };

    // TODO: Persist to storage
    return tag;
  }

  async list(): Promise<Tag[]> {
    // TODO: Query storage
    return [];
  }

  async getOrCreate(name: string): Promise<Tag> {
    // TODO: Look up by name, create if not found
    return this.create(name);
  }

  async delete(id: string): Promise<boolean> {
    // TODO: Delete from storage and remove from task_tags
    return false;
  }
}
