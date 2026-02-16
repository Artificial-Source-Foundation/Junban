import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("db");

let db: BetterSQLite3Database<typeof schema> | null = null;

export function getDb(dbPath: string): BetterSQLite3Database<typeof schema> {
  if (!db) {
    logger.debug("Opening SQLite database", { path: dbPath });
    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    db = drizzle(sqlite, { schema });
    logger.debug("Database pragmas configured (WAL, FK)");
  }
  return db;
}
