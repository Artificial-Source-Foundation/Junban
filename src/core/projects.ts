import type { Project } from "./types.js";
import { generateId } from "../utils/ids.js";

/** Project service — manages task groupings. */
export class ProjectService {
  async create(name: string, color?: string): Promise<Project> {
    const project: Project = {
      id: generateId(),
      name,
      color: color ?? "#3b82f6",
      icon: null,
      sortOrder: 0,
      archived: false,
      createdAt: new Date().toISOString(),
    };

    // TODO: Persist to storage
    return project;
  }

  async list(): Promise<Project[]> {
    // TODO: Query storage
    return [];
  }

  async get(id: string): Promise<Project | null> {
    // TODO: Query storage
    return null;
  }

  async archive(id: string): Promise<boolean> {
    // TODO: Update in storage
    return false;
  }

  async delete(id: string): Promise<boolean> {
    // TODO: Delete from storage
    return false;
  }
}
