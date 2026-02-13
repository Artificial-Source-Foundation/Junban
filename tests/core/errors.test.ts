import { describe, it, expect } from "vitest";
import { NotFoundError, ValidationError, StorageError } from "../../src/core/errors.js";

describe("NotFoundError", () => {
  it("has correct name and message", () => {
    const err = new NotFoundError("Task", "abc123");
    expect(err.name).toBe("NotFoundError");
    expect(err.message).toBe("Task not found: abc123");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("ValidationError", () => {
  it("has correct name and message", () => {
    const err = new ValidationError("Title is required");
    expect(err.name).toBe("ValidationError");
    expect(err.message).toBe("Title is required");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("StorageError", () => {
  it("has correct name and message without cause", () => {
    const err = new StorageError("write /tmp/tasks/foo.md");
    expect(err.name).toBe("StorageError");
    expect(err.message).toBe("Storage operation failed: write /tmp/tasks/foo.md");
    expect(err).toBeInstanceOf(Error);
  });

  it("includes cause message when provided", () => {
    const cause = new Error("EACCES: permission denied");
    const err = new StorageError("write /tmp/tasks/foo.md", cause);
    expect(err.message).toContain("EACCES: permission denied");
    expect(err.cause).toBe(cause);
  });
});
