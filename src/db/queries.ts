import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

export function createQueries(db: BetterSQLite3Database<typeof schema>) {
  return {
    // Tasks
    listTasks: () => db.select().from(schema.tasks),
    getTask: (id: string) => db.select().from(schema.tasks).where(eq(schema.tasks.id, id)),
    insertTask: (task: typeof schema.tasks.$inferInsert) => db.insert(schema.tasks).values(task),
    updateTask: (id: string, data: Partial<typeof schema.tasks.$inferInsert>) =>
      db.update(schema.tasks).set(data).where(eq(schema.tasks.id, id)),
    deleteTask: (id: string) => db.delete(schema.tasks).where(eq(schema.tasks.id, id)),

    // Projects
    listProjects: () => db.select().from(schema.projects),
    insertProject: (project: typeof schema.projects.$inferInsert) =>
      db.insert(schema.projects).values(project),

    // Tags
    listTags: () => db.select().from(schema.tags),
    insertTag: (tag: typeof schema.tags.$inferInsert) => db.insert(schema.tags).values(tag),
  };
}
