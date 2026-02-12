import { describe, it, expect } from "vitest";
import { generateId } from "../../src/utils/ids.js";

describe("generateId", () => {
  it("returns a string of length 21", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id).toHaveLength(21);
  });

  it("uses only URL-safe characters", () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9A-Za-z_-]+$/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
