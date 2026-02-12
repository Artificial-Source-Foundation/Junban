import { describe, it, expect } from "vitest";
import { formatTaskSummary } from "../../src/cli/formatter.js";
import type { ParsedTask } from "../../src/parser/task-parser.js";

function makeParsed(overrides: Partial<ParsedTask> = {}): ParsedTask {
  return {
    title: "Buy milk",
    priority: null,
    tags: [],
    project: null,
    dueDate: null,
    dueTime: false,
    ...overrides,
  };
}

describe("formatTaskSummary", () => {
  it("formats a simple task", () => {
    const result = formatTaskSummary(makeParsed());
    expect(result).toBe("Buy milk");
  });

  it("includes priority", () => {
    const result = formatTaskSummary(makeParsed({ priority: 1 }));
    expect(result).toContain("P1");
  });

  it("includes tags", () => {
    const result = formatTaskSummary(makeParsed({ tags: ["groceries", "urgent"] }));
    expect(result).toContain("#groceries");
    expect(result).toContain("#urgent");
  });

  it("includes project", () => {
    const result = formatTaskSummary(makeParsed({ project: "shopping" }));
    expect(result).toContain("+shopping");
  });

  it("includes due date without time", () => {
    const date = new Date("2025-01-16T00:00:00Z");
    const result = formatTaskSummary(makeParsed({ dueDate: date, dueTime: false }));
    expect(result).toContain("(due ");
    expect(result).toContain(")");
  });

  it("includes due date with time", () => {
    const date = new Date("2025-01-16T15:00:00Z");
    const result = formatTaskSummary(makeParsed({ dueDate: date, dueTime: true }));
    expect(result).toContain("(due ");
  });

  it("formats everything together", () => {
    const result = formatTaskSummary(
      makeParsed({
        title: "Review PR",
        priority: 2,
        tags: ["dev"],
        project: "work",
        dueDate: new Date("2025-01-16T15:00:00Z"),
        dueTime: true,
      }),
    );
    expect(result).toContain("Review PR");
    expect(result).toContain("P2");
    expect(result).toContain("#dev");
    expect(result).toContain("+work");
    expect(result).toContain("(due ");
  });

  it("omits absent fields", () => {
    const result = formatTaskSummary(makeParsed());
    expect(result).not.toContain("P");
    expect(result).not.toContain("#");
    expect(result).not.toContain("+");
    expect(result).not.toContain("due");
  });
});
