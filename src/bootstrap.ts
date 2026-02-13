import path from "node:path";
import fs from "node:fs";
import { getDb } from "./db/client.js";
import { runMigrations } from "./db/migrate.js";
import { createQueries } from "./db/queries.js";
import { TaskService } from "./core/tasks.js";
import { ProjectService } from "./core/projects.js";
import { TagService } from "./core/tags.js";
import { loadEnv } from "./config/env.js";

export interface AppServices {
  taskService: TaskService;
  projectService: ProjectService;
  tagService: TagService;
}

export function bootstrap(dbPath?: string): AppServices {
  const env = loadEnv();
  const resolvedPath = dbPath ?? env.DB_PATH;

  // Ensure data directory exists
  const dir = path.dirname(resolvedPath);
  if (dir !== "." && dir !== ":memory:") {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = getDb(resolvedPath);
  runMigrations(db);

  const queries = createQueries(db);
  const tagService = new TagService(queries);
  const projectService = new ProjectService(queries);
  const taskService = new TaskService(queries, tagService);

  return { taskService, projectService, tagService };
}
