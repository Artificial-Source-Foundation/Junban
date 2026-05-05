import { describe, it, expect, vi } from "vitest";
import { importTasksWithRollback } from "../../src/core/import-execution.js";
import type { ImportedTask } from "../../src/core/import.js";
import { createTestServices } from "../integration/helpers.js";

function makeImportedTask(overrides: Partial<ImportedTask> = {}): ImportedTask {
  return {
    title: "Imported task",
    description: null,
    status: "pending",
    priority: null,
    dueDate: null,
    dueTime: false,
    projectName: null,
    tagNames: [],
    recurrence: null,
    ...overrides,
  };
}

describe("importTasksWithRollback", () => {
  it("imports all tasks successfully", async () => {
    const services = {
      projectService: {
        getByName: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "project-1" }),
        delete: vi.fn().mockResolvedValue(true),
      },
      taskService: {
        create: vi
          .fn()
          .mockResolvedValueOnce({ id: "task-1" })
          .mockResolvedValueOnce({ id: "task-2" }),
        complete: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(true),
      },
    };

    const result = await importTasksWithRollback(services, [
      makeImportedTask({ projectName: "Work" }),
      makeImportedTask({ title: "Done", status: "completed", projectName: "Work" }),
    ]);

    expect(result).toEqual({ imported: 2, errors: [] });
    expect(services.projectService.create).toHaveBeenCalledTimes(1);
    expect(services.taskService.complete).toHaveBeenCalledWith("task-2");
    expect(services.taskService.delete).not.toHaveBeenCalled();
    expect(services.projectService.delete).not.toHaveBeenCalled();
  });

  it("passes Junban transfer task metadata through to task creation", async () => {
    const services = {
      projectService: {
        getByName: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "project-1" }),
        delete: vi.fn().mockResolvedValue(true),
      },
      taskService: {
        create: vi.fn().mockResolvedValue({ id: "task-1" }),
        complete: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(true),
      },
    };

    await importTasksWithRollback(services, [
      makeImportedTask({
        remindAt: "2025-12-24T09:00:00.000Z",
        estimatedMinutes: 45,
        actualMinutes: 30,
        deadline: "2025-12-26T00:00:00.000Z",
        isSomeday: true,
        dreadLevel: 4,
      }),
    ]);

    expect(services.taskService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        remindAt: "2025-12-24T09:00:00.000Z",
        estimatedMinutes: 45,
        actualMinutes: 30,
        deadline: "2025-12-26T00:00:00.000Z",
        isSomeday: true,
        dreadLevel: 4,
      }),
    );
  });

  it("rolls back created tasks and projects when import fails", async () => {
    const services = {
      projectService: {
        getByName: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "project-1" }),
        delete: vi.fn().mockResolvedValue(true),
      },
      taskService: {
        create: vi
          .fn()
          .mockResolvedValueOnce({ id: "task-1" })
          .mockRejectedValueOnce(new Error("write failed")),
        complete: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(true),
      },
    };

    const result = await importTasksWithRollback(services, [
      makeImportedTask({ title: "First", projectName: "Work" }),
      makeImportedTask({ title: "Second", projectName: "Work" }),
    ]);

    expect(result.imported).toBe(0);
    expect(result.errors[0]).toContain("Import aborted and rolled back");
    expect(services.taskService.delete).toHaveBeenCalledWith("task-1");
    expect(services.projectService.delete).toHaveBeenCalledWith("project-1");
  });

  it("uses provided transactional rollback instead of manual cleanup", async () => {
    const transaction = vi.fn(async <T>(operation: () => T | Promise<T>) => operation());
    const services = {
      transaction,
      projectService: {
        getByName: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "project-1" }),
        delete: vi.fn().mockResolvedValue(true),
      },
      taskService: {
        create: vi
          .fn()
          .mockResolvedValueOnce({ id: "task-1" })
          .mockRejectedValueOnce(new Error("write failed")),
        complete: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(true),
      },
    };

    const result = await importTasksWithRollback(services, [
      makeImportedTask({ title: "First", projectName: "Work" }),
      makeImportedTask({ title: "Second", projectName: "Work" }),
    ]);

    expect(transaction).toHaveBeenCalledOnce();
    expect(result.imported).toBe(0);
    expect(result.errors[0]).toContain("Import aborted and rolled back");
    expect(services.taskService.delete).not.toHaveBeenCalled();
    expect(services.projectService.delete).not.toHaveBeenCalled();
  });

  it("does not emit task create or complete events from a failed transactional import", async () => {
    const services = createTestServices();
    const createListener = vi.fn();
    const completeListener = vi.fn();
    services.eventBus.on("task:create", createListener);
    services.eventBus.on("task:complete", completeListener);

    const originalInsertTask = services.storage.insertTask.bind(services.storage);
    vi.spyOn(services.storage, "insertTask").mockImplementation((task) => {
      if (task.title === "Fail import") {
        throw new Error("import write failed");
      }
      return originalInsertTask(task);
    });

    const result = await importTasksWithRollback(
      {
        taskService: services.taskService,
        projectService: services.projectService,
        transaction: (operation) => services.storage.transaction(operation),
      },
      [
        makeImportedTask({ title: "Imported done", status: "completed" }),
        makeImportedTask({ title: "Fail import" }),
      ],
    );

    expect(result.imported).toBe(0);
    expect(result.errors[0]).toContain("Import aborted and rolled back");
    expect(createListener).not.toHaveBeenCalled();
    expect(completeListener).not.toHaveBeenCalled();
    expect(await services.taskService.list()).toEqual([]);
  });
});
