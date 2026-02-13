import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as schema from "../../src/db/schema.js";
import { createQueries } from "../../src/db/queries.js";
import { TaskService } from "../../src/core/tasks.js";
import { ProjectService } from "../../src/core/projects.js";
import { TagService } from "../../src/core/tags.js";
import { EventBus } from "../../src/core/event-bus.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "../../src/db/migrations");

export function createTestServices() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder });

  const queries = createQueries(db);
  const tagService = new TagService(queries);
  const projectService = new ProjectService(queries);
  const eventBus = new EventBus();
  const taskService = new TaskService(queries, tagService, eventBus);

  return { db, queries, taskService, projectService, tagService, eventBus };
}
