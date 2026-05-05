import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import * as schema from "../../src/db/schema.js";
import { NodeSQLiteBackend } from "../../src/storage/sqlite-backend-node.js";
import type { IStorage, TaskRow, ProjectRow, TagRow } from "../../src/storage/interface.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "../../src/db/migrations");

function createBackend(): IStorage {
  const sqlite = new Database(":memory:");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder });
  return new NodeSQLiteBackend(db);
}

const now = new Date().toISOString();

function makeTask(overrides: Partial<TaskRow> = {}): TaskRow {
  return {
    id: "task-1",
    title: "Test task",
    description: null,
    status: "pending",
    priority: null,
    dueDate: null,
    dueTime: false,
    completedAt: null,
    projectId: null,
    recurrence: null,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeProject(overrides: Partial<ProjectRow> = {}): ProjectRow {
  return {
    id: "proj-1",
    name: "Work",
    color: "#3b82f6",
    icon: null,
    sortOrder: 0,
    archived: false,
    createdAt: now,
    ...overrides,
  };
}

function makeTag(overrides: Partial<TagRow> = {}): TagRow {
  return {
    id: "tag-1",
    name: "urgent",
    color: "#ef4444",
    ...overrides,
  };
}

describe("SQLiteBackend", () => {
  let storage: IStorage;

  beforeEach(() => {
    storage = createBackend();
  });

  it("keeps Node async_hooks out of the shared browser backend module", () => {
    const sharedBackendPath = path.resolve(__dirname, "../../src/storage/sqlite-backend.ts");
    const source = fs.readFileSync(sharedBackendPath, "utf8");

    expect(source).not.toContain("node:async_hooks");
    expect(source).not.toContain("AsyncLocalStorage");
  });

  it("rolls back writes inside failed transactions", async () => {
    expect(storage.supportsTransactionalRollback).toBe(true);

    await expect(
      storage.transaction(() => {
        storage.insertTask(makeTask({ id: "tx-task" }));
        throw new Error("rollback me");
      }),
    ).rejects.toThrow("rollback me");

    expect(storage.getTask("tx-task")).toHaveLength(0);
  });

  it("serializes overlapping top-level transactions so independent work is not rolled back", async () => {
    let releaseTransactionA!: () => void;
    let transactionAPaused!: () => void;
    const transactionAReady = new Promise<void>((resolve) => {
      transactionAPaused = resolve;
    });
    const transactionACanRollback = new Promise<void>((resolve) => {
      releaseTransactionA = resolve;
    });

    const transactionA = storage.transaction(async () => {
      storage.insertTask(makeTask({ id: "tx-a" }));
      transactionAPaused();
      await transactionACanRollback;
      throw new Error("rollback transaction A");
    });

    await transactionAReady;

    let transactionBSettled = false;
    const transactionB = storage
      .transaction(() => {
        storage.insertTask(makeTask({ id: "tx-b" }));
      })
      .then(() => {
        transactionBSettled = true;
      });

    await Promise.resolve();
    expect(transactionBSettled).toBe(false);

    releaseTransactionA();

    await expect(transactionA).rejects.toThrow("rollback transaction A");
    await transactionB;

    expect(storage.getTask("tx-a")).toHaveLength(0);
    expect(storage.getTask("tx-b")).toHaveLength(1);
  });

  it("reuses the active transaction for true nested transaction calls", async () => {
    await expect(
      storage.transaction(async () => {
        storage.insertTask(makeTask({ id: "outer-task" }));
        await storage.transaction(() => {
          storage.insertTask(makeTask({ id: "inner-task" }));
        });
        throw new Error("rollback nested work");
      }),
    ).rejects.toThrow("rollback nested work");

    expect(storage.getTask("outer-task")).toHaveLength(0);
    expect(storage.getTask("inner-task")).toHaveLength(0);
  });

  describe("Tasks", () => {
    it("inserts and lists tasks", () => {
      storage.insertTask(makeTask());
      const tasks = storage.listTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe("Test task");
    });

    it("gets a task by ID", () => {
      storage.insertTask(makeTask());
      const rows = storage.getTask("task-1");
      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe("task-1");
    });

    it("returns empty array for unknown task", () => {
      expect(storage.getTask("nonexistent")).toHaveLength(0);
    });

    it("updates a task", () => {
      storage.insertTask(makeTask());
      storage.updateTask("task-1", { title: "Updated", priority: 2 });
      const [task] = storage.getTask("task-1");
      expect(task.title).toBe("Updated");
      expect(task.priority).toBe(2);
    });

    it("deletes a task", () => {
      storage.insertTask(makeTask());
      const result = storage.deleteTask("task-1");
      expect(result.changes).toBe(1);
      expect(storage.listTasks()).toHaveLength(0);
    });

    it("deleteManyTasks", () => {
      storage.insertTask(makeTask({ id: "t1" }));
      storage.insertTask(makeTask({ id: "t2" }));
      storage.insertTask(makeTask({ id: "t3" }));
      storage.deleteManyTasks(["t1", "t3"]);
      expect(storage.listTasks()).toHaveLength(1);
      expect(storage.listTasks()[0].id).toBe("t2");
    });

    it("updateManyTasks", () => {
      storage.insertTask(makeTask({ id: "t1" }));
      storage.insertTask(makeTask({ id: "t2" }));
      storage.updateManyTasks(["t1", "t2"], { priority: 1 });
      expect(storage.getTask("t1")[0].priority).toBe(1);
      expect(storage.getTask("t2")[0].priority).toBe(1);
    });

    it("insertTaskWithId works", () => {
      storage.insertTaskWithId(makeTask({ id: "custom-id" }));
      expect(storage.getTask("custom-id")).toHaveLength(1);
    });
  });

  describe("Task-Tag Relations", () => {
    it("inserts and retrieves task tags", () => {
      storage.insertTask(makeTask());
      storage.insertTag(makeTag());
      storage.insertTaskTag("task-1", "tag-1");

      const tags = storage.getTaskTags("task-1");
      expect(tags).toHaveLength(1);
      expect(tags[0].tags.name).toBe("urgent");
      expect(tags[0].task_tags.taskId).toBe("task-1");
    });

    it("deleteTaskTags removes all tags for a task", () => {
      storage.insertTask(makeTask());
      storage.insertTag(makeTag({ id: "tag-1" }));
      storage.insertTag(makeTag({ id: "tag-2", name: "home" }));
      storage.insertTaskTag("task-1", "tag-1");
      storage.insertTaskTag("task-1", "tag-2");

      storage.deleteTaskTags("task-1");
      expect(storage.getTaskTags("task-1")).toHaveLength(0);
    });

    it("listAllTaskTags returns all task-tag joins", () => {
      storage.insertTask(makeTask({ id: "t1" }));
      storage.insertTask(makeTask({ id: "t2" }));
      storage.insertTag(makeTag({ id: "tag-1", name: "urgent" }));
      storage.insertTag(makeTag({ id: "tag-2", name: "home" }));
      storage.insertTaskTag("t1", "tag-1");
      storage.insertTaskTag("t1", "tag-2");
      storage.insertTaskTag("t2", "tag-1");

      const all = storage.listAllTaskTags();
      expect(all).toHaveLength(3);

      const t1Tags = all.filter((j) => j.task_tags.taskId === "t1");
      expect(t1Tags).toHaveLength(2);
      expect(t1Tags.map((j) => j.tags.name).sort()).toEqual(["home", "urgent"]);

      const t2Tags = all.filter((j) => j.task_tags.taskId === "t2");
      expect(t2Tags).toHaveLength(1);
      expect(t2Tags[0].tags.name).toBe("urgent");
    });

    it("listAllTaskTags returns empty array when no tags", () => {
      storage.insertTask(makeTask());
      expect(storage.listAllTaskTags()).toHaveLength(0);
    });

    it("deleteManyTaskTags removes tags for multiple tasks", () => {
      storage.insertTask(makeTask({ id: "t1" }));
      storage.insertTask(makeTask({ id: "t2" }));
      storage.insertTag(makeTag());
      storage.insertTaskTag("t1", "tag-1");
      storage.insertTaskTag("t2", "tag-1");

      storage.deleteManyTaskTags(["t1", "t2"]);
      expect(storage.getTaskTags("t1")).toHaveLength(0);
      expect(storage.getTaskTags("t2")).toHaveLength(0);
    });
  });

  describe("Projects", () => {
    it("inserts and lists projects", () => {
      storage.insertProject(makeProject());
      expect(storage.listProjects()).toHaveLength(1);
    });

    it("gets project by ID", () => {
      storage.insertProject(makeProject());
      expect(storage.getProject("proj-1")).toHaveLength(1);
    });

    it("gets project by name", () => {
      storage.insertProject(makeProject());
      expect(storage.getProjectByName("Work")).toHaveLength(1);
      expect(storage.getProjectByName("Nonexistent")).toHaveLength(0);
    });

    it("updates a project", () => {
      storage.insertProject(makeProject());
      storage.updateProject("proj-1", { archived: true });
      expect(storage.getProject("proj-1")[0].archived).toBe(true);
    });

    it("deletes a project", () => {
      storage.insertProject(makeProject());
      const result = storage.deleteProject("proj-1");
      expect(result.changes).toBe(1);
      expect(storage.listProjects()).toHaveLength(0);
    });
  });

  describe("Tags", () => {
    it("inserts and lists tags", () => {
      storage.insertTag(makeTag());
      expect(storage.listTags()).toHaveLength(1);
    });

    it("gets tag by name", () => {
      storage.insertTag(makeTag());
      expect(storage.getTagByName("urgent")).toHaveLength(1);
      expect(storage.getTagByName("nonexistent")).toHaveLength(0);
    });

    it("deletes a tag", () => {
      storage.insertTag(makeTag());
      const result = storage.deleteTag("tag-1");
      expect(result.changes).toBe(1);
      expect(storage.listTags()).toHaveLength(0);
    });
  });

  describe("App Settings", () => {
    it("set, get, delete", () => {
      storage.setAppSetting("theme", "dark");
      const row = storage.getAppSetting("theme");
      expect(row?.value).toBe("dark");

      storage.deleteAppSetting("theme");
      expect(storage.getAppSetting("theme")).toBeUndefined();
    });

    it("updates on re-set", () => {
      storage.setAppSetting("theme", "light");
      storage.setAppSetting("theme", "dark");
      expect(storage.getAppSetting("theme")?.value).toBe("dark");
    });
  });

  describe("Plugin Settings", () => {
    it("save and load", () => {
      storage.savePluginSettings("pomodoro", '{"work":25}');
      const row = storage.loadPluginSettings("pomodoro");
      expect(row?.settings).toBe('{"work":25}');
    });

    it("returns undefined for unknown plugin", () => {
      expect(storage.loadPluginSettings("nonexistent")).toBeUndefined();
    });
  });

  describe("Chat Messages", () => {
    it("inserts and lists messages", () => {
      storage.insertChatMessage({
        sessionId: "s1",
        role: "user",
        content: "Hello",
        toolCallId: null,
        toolCalls: null,
        createdAt: now,
      });
      const messages = storage.listChatMessages("s1");
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe("Hello");
    });

    it("lists chat messages in insertion order", () => {
      storage.insertChatMessage({
        sessionId: "s1",
        role: "user",
        content: "First",
        toolCallId: null,
        toolCalls: null,
        createdAt: "2025-06-01T00:00:00.000Z",
      });
      storage.insertChatMessage({
        sessionId: "s1",
        role: "assistant",
        content: "Second",
        toolCallId: null,
        toolCalls: null,
        createdAt: "2025-01-01T00:00:00.000Z",
      });

      expect(storage.listChatMessages("s1").map((message) => message.content)).toEqual([
        "First",
        "Second",
      ]);
    });

    it("deletes a session", () => {
      storage.insertChatMessage({
        sessionId: "s1",
        role: "user",
        content: "Hello",
        toolCallId: null,
        toolCalls: null,
        createdAt: now,
      });
      storage.deleteChatSession("s1");
      expect(storage.listChatMessages("s1")).toHaveLength(0);
    });

    it("getLatestSessionId returns most recent", () => {
      storage.insertChatMessage({
        sessionId: "s1",
        role: "user",
        content: "Old",
        toolCallId: null,
        toolCalls: null,
        createdAt: "2025-01-01T00:00:00.000Z",
      });
      storage.insertChatMessage({
        sessionId: "s2",
        role: "user",
        content: "New",
        toolCallId: null,
        toolCalls: null,
        createdAt: "2025-06-01T00:00:00.000Z",
      });
      expect(storage.getLatestSessionId()?.sessionId).toBe("s2");
    });

    it("lists chat sessions by latest activity", () => {
      storage.insertChatMessage({
        sessionId: "s1",
        role: "user",
        content: "Old session first",
        toolCallId: null,
        toolCalls: null,
        createdAt: "2025-01-01T00:00:00.000Z",
      });
      storage.insertChatMessage({
        sessionId: "s2",
        role: "user",
        content: "Newer session",
        toolCallId: null,
        toolCalls: null,
        createdAt: "2025-02-01T00:00:00.000Z",
      });
      storage.insertChatMessage({
        sessionId: "s1",
        role: "assistant",
        content: "Latest reply",
        toolCallId: null,
        toolCalls: null,
        createdAt: "2025-03-01T00:00:00.000Z",
      });

      expect(storage.listChatSessions().map((session) => session.sessionId)).toEqual(["s1", "s2"]);
    });
  });

  describe("Plugin Permissions", () => {
    it("set and get", () => {
      storage.setPluginPermissions("p1", ["task:read", "storage"]);
      expect(storage.getPluginPermissions("p1")).toEqual(["task:read", "storage"]);
    });

    it("returns null for unknown plugin", () => {
      expect(storage.getPluginPermissions("unknown")).toBeNull();
    });

    it("delete permissions", () => {
      storage.setPluginPermissions("p1", ["task:read"]);
      storage.deletePluginPermissions("p1");
      expect(storage.getPluginPermissions("p1")).toBeNull();
    });
  });
});
