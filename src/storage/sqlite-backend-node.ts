import { AsyncLocalStorage } from "node:async_hooks";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import type * as schema from "../db/schema.js";
import {
  SQLiteBackend,
  type SQLiteTransactionContext,
  type SQLiteTransactionContextStore,
} from "./sqlite-backend.js";

class NodeSQLiteTransactionContextStore implements SQLiteTransactionContextStore {
  private readonly storage = new AsyncLocalStorage<SQLiteTransactionContext>();

  getStore(): SQLiteTransactionContext | undefined {
    return this.storage.getStore();
  }

  run<T>(context: SQLiteTransactionContext, operation: () => Promise<T>): Promise<T> {
    return this.storage.run(context, operation);
  }
}

export class NodeSQLiteBackend extends SQLiteBackend {
  constructor(db: BaseSQLiteDatabase<"sync", unknown, typeof schema>) {
    super(db, new NodeSQLiteTransactionContextStore());
  }
}
