import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { getDb } from "./client.js";
import { loadEnv } from "../config/env.js";

const env = loadEnv();
const db = getDb(env.DB_PATH);

migrate(db, { migrationsFolder: "src/db/migrations" });
console.log("Migrations applied successfully.");
