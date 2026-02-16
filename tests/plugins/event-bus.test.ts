import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventBus } from "../../src/core/event-bus.js";
import type { Task } from "../../src/core/types.js";

const mockTask: Task = {
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
  tags: [],
  sortOrder: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("EventBus", () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  it("should call listener when event is emitted", () => {
    const callback = vi.fn();
    bus.on("task:create", callback);
    bus.emit("task:create", mockTask);
    expect(callback).toHaveBeenCalledWith(mockTask);
  });

  it("should support multiple listeners for the same event", () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    bus.on("task:create", cb1);
    bus.on("task:create", cb2);
    bus.emit("task:create", mockTask);
    expect(cb1).toHaveBeenCalledOnce();
    expect(cb2).toHaveBeenCalledOnce();
  });

  it("should not call listener after off()", () => {
    const callback = vi.fn();
    bus.on("task:create", callback);
    bus.off("task:create", callback);
    bus.emit("task:create", mockTask);
    expect(callback).not.toHaveBeenCalled();
  });

  it("should not call listeners for other events", () => {
    const callback = vi.fn();
    bus.on("task:create", callback);
    bus.emit("task:complete", mockTask);
    expect(callback).not.toHaveBeenCalled();
  });

  it("should handle task:update event with changes", () => {
    const callback = vi.fn();
    bus.on("task:update", callback);

    const changes = { title: "Updated" };
    bus.emit("task:update", { task: mockTask, changes });
    expect(callback).toHaveBeenCalledWith({ task: mockTask, changes });
  });

  it("should catch and log errors from listeners without crashing", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const badListener = vi.fn(() => {
      throw new Error("listener error");
    });
    const goodListener = vi.fn();

    bus.on("task:create", badListener);
    bus.on("task:create", goodListener);

    bus.emit("task:create", mockTask);

    expect(badListener).toHaveBeenCalled();
    expect(goodListener).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Listener error"),
    );

    errorSpy.mockRestore();
  });

  it("should do nothing when emitting with no listeners", () => {
    // Should not throw
    bus.emit("task:create", mockTask);
  });

  it("should report correct listenerCount", () => {
    expect(bus.listenerCount("task:create")).toBe(0);

    const cb1 = vi.fn();
    const cb2 = vi.fn();
    bus.on("task:create", cb1);
    expect(bus.listenerCount("task:create")).toBe(1);

    bus.on("task:create", cb2);
    expect(bus.listenerCount("task:create")).toBe(2);

    bus.off("task:create", cb1);
    expect(bus.listenerCount("task:create")).toBe(1);
  });

  it("should clear all listeners", () => {
    bus.on("task:create", vi.fn());
    bus.on("task:complete", vi.fn());
    bus.on("task:delete", vi.fn());

    bus.clear();

    expect(bus.listenerCount("task:create")).toBe(0);
    expect(bus.listenerCount("task:complete")).toBe(0);
    expect(bus.listenerCount("task:delete")).toBe(0);
  });

  it("should handle off() for non-existent listener gracefully", () => {
    const cb = vi.fn();
    // Should not throw
    bus.off("task:create", cb);
  });
});
