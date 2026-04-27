import { describe, it, expect } from "vitest";
import { jsonSchemaToZod } from "../../src/mcp/schema-converter.js";

describe("jsonSchemaToZod", () => {
  it("converts a string property", () => {
    const schema = jsonSchemaToZod({
      type: "object",
      properties: { name: { type: "string", description: "A name" } },
      required: ["name"],
    });
    expect(schema.shape.name).toBeDefined();
    const result = schema.safeParse({ name: "hello" });
    expect(result.success).toBe(true);
  });

  it("marks required fields as non-optional", () => {
    const schema = jsonSchemaToZod({
      type: "object",
      properties: { title: { type: "string" } },
      required: ["title"],
    });
    const missing = schema.safeParse({});
    expect(missing.success).toBe(false);
  });

  it("marks non-required fields as optional", () => {
    const schema = jsonSchemaToZod({
      type: "object",
      properties: { title: { type: "string" } },
    });
    const result = schema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("converts a number property", () => {
    const schema = jsonSchemaToZod({
      type: "object",
      properties: { count: { type: "number" } },
      required: ["count"],
    });
    const result = schema.safeParse({ count: 42 });
    expect(result.success).toBe(true);
    const bad = schema.safeParse({ count: "not a number" });
    expect(bad.success).toBe(false);
  });

  it("converts an integer property", () => {
    const schema = jsonSchemaToZod({
      type: "object",
      properties: { amount: { type: "integer" } },
      required: ["amount"],
    });
    const result = schema.safeParse({ amount: 5 });
    expect(result.success).toBe(true);
    const floatResult = schema.safeParse({ amount: 5.5 });
    expect(floatResult.success).toBe(false);
  });

  it("converts a boolean property", () => {
    const schema = jsonSchemaToZod({
      type: "object",
      properties: { active: { type: "boolean" } },
      required: ["active"],
    });
    const result = schema.safeParse({ active: true });
    expect(result.success).toBe(true);
  });

  it("converts an array of strings property", () => {
    const schema = jsonSchemaToZod({
      type: "object",
      properties: { tags: { type: "array", items: { type: "string" } } },
      required: ["tags"],
    });
    const result = schema.safeParse({ tags: ["a", "b"] });
    expect(result.success).toBe(true);
    const bad = schema.safeParse({ tags: [1, 2] });
    expect(bad.success).toBe(false);
  });

  it("converts an array of nested objects property", () => {
    const schema = jsonSchemaToZod({
      type: "object",
      properties: {
        tasks: {
          type: "array",
          minItems: 1,
          maxItems: 2,
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              priority: { type: "number", enum: [1, 2, 3, 4] },
            },
            required: ["title"],
          },
        },
      },
      required: ["tasks"],
    });

    const result = schema.safeParse({ tasks: [{ title: "A", priority: 2 }] });
    expect(result.success).toBe(true);

    const missingNestedRequired = schema.safeParse({ tasks: [{ priority: 2 }] });
    expect(missingNestedRequired.success).toBe(false);

    const empty = schema.safeParse({ tasks: [] });
    expect(empty.success).toBe(false);

    const tooMany = schema.safeParse({
      tasks: [{ title: "A" }, { title: "B" }, { title: "C" }],
    });
    expect(tooMany.success).toBe(false);
  });

  it("converts a nested object property", () => {
    const schema = jsonSchemaToZod({
      type: "object",
      properties: {
        changes: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["pending", "completed", "cancelled"] },
          },
          required: ["status"],
        },
      },
      required: ["changes"],
    });

    expect(schema.safeParse({ changes: { status: "pending" } }).success).toBe(true);
    expect(schema.safeParse({ changes: { status: "blocked" } }).success).toBe(false);
  });

  it("honors additionalProperties false on nested objects", () => {
    const schema = jsonSchemaToZod({
      type: "object",
      properties: {
        changes: {
          type: "object",
          additionalProperties: false,
          properties: { priority: { type: "number" } },
        },
      },
      required: ["changes"],
    });

    expect(schema.safeParse({ changes: { priority: 1 } }).success).toBe(true);
    expect(schema.safeParse({ changes: { priority: 1, typo: true } }).success).toBe(false);
  });

  it("honors additionalProperties false on the root object", () => {
    const schema = jsonSchemaToZod({
      type: "object",
      additionalProperties: false,
      properties: { name: { type: "string" } },
      required: ["name"],
    });

    expect(schema.safeParse({ name: "Junban" }).success).toBe(true);
    expect(schema.safeParse({ name: "Junban", typo: true }).success).toBe(false);
  });

  it("converts a string enum property", () => {
    const schema = jsonSchemaToZod({
      type: "object",
      properties: { level: { type: "string", enum: ["low", "medium", "high"] } },
      required: ["level"],
    });
    const result = schema.safeParse({ level: "low" });
    expect(result.success).toBe(true);
    const bad = schema.safeParse({ level: "extreme" });
    expect(bad.success).toBe(false);
  });

  it("converts a number enum property", () => {
    const schema = jsonSchemaToZod({
      type: "object",
      properties: { priority: { type: "number", enum: [1, 2, 3, 4] } },
      required: ["priority"],
    });
    const result = schema.safeParse({ priority: 2 });
    expect(result.success).toBe(true);
    const bad = schema.safeParse({ priority: 5 });
    expect(bad.success).toBe(false);
  });

  it("handles empty properties object", () => {
    const schema = jsonSchemaToZod({ type: "object" });
    expect(Object.keys(schema.shape)).toHaveLength(0);
  });

  it("preserves description on fields", () => {
    const schema = jsonSchemaToZod({
      type: "object",
      properties: { name: { type: "string", description: "The user's name" } },
      required: ["name"],
    });
    expect(schema.shape.name.description).toBe("The user's name");
  });

  it("converts a real tool schema (create_task-like)", () => {
    const schema = jsonSchemaToZod({
      type: "object",
      properties: {
        title: { type: "string", description: "Task title" },
        priority: { type: "number", enum: [1, 2, 3, 4] },
        dueDate: { type: "string", description: "ISO 8601" },
        tags: { type: "array", items: { type: "string" } },
        isSomeday: { type: "boolean" },
        estimatedMinutes: { type: "integer" },
      },
      required: ["title"],
    });

    const result = schema.safeParse({
      title: "Buy milk",
      priority: 2,
      tags: ["groceries"],
    });
    expect(result.success).toBe(true);

    // Optional fields can be omitted
    const minimal = schema.safeParse({ title: "Hello" });
    expect(minimal.success).toBe(true);
  });
});
