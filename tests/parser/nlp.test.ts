import { describe, it, expect } from "vitest";
import { parseDate, removeDateText } from "../../src/parser/nlp.js";

// Use a fixed reference date so tests are deterministic
const REF_DATE = new Date("2025-01-15T10:00:00Z");

describe("parseDate", () => {
  it("parses 'tomorrow'", () => {
    const result = parseDate("buy milk tomorrow", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.date.getDate()).toBe(16);
    expect(result!.hasTime).toBe(false);
    expect(result!.text).toBe("tomorrow");
  });

  it("parses 'tomorrow at 3pm' with time", () => {
    const result = parseDate("buy milk tomorrow at 3pm", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.date.getDate()).toBe(16);
    expect(result!.date.getHours()).toBe(15);
    expect(result!.hasTime).toBe(true);
  });

  it("parses 'next Friday'", () => {
    const result = parseDate("review PR next Friday", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.date.getDay()).toBe(5); // Friday
    expect(result!.hasTime).toBe(false);
  });

  it("parses 'January 20'", () => {
    const result = parseDate("do thing January 20", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.date.getMonth()).toBe(0); // January
    expect(result!.date.getDate()).toBe(20);
  });

  it("returns null for input with no date", () => {
    const result = parseDate("buy milk", REF_DATE);
    expect(result).toBeNull();
  });

  it("parses 'today'", () => {
    const result = parseDate("do thing today", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.date.getDate()).toBe(REF_DATE.getDate());
  });

  it("parses time-only like 'at 5pm'", () => {
    const result = parseDate("meeting at 5pm", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.hasTime).toBe(true);
    expect(result!.date.getHours()).toBe(17);
  });
});

describe("removeDateText", () => {
  it("removes date text from input", () => {
    expect(removeDateText("buy milk tomorrow", "tomorrow")).toBe("buy milk");
  });

  it("handles date text in the middle", () => {
    expect(removeDateText("buy tomorrow milk", "tomorrow")).toBe("buy milk");
  });

  it("handles date text at the beginning", () => {
    expect(removeDateText("tomorrow buy milk", "tomorrow")).toBe("buy milk");
  });

  it("collapses extra whitespace", () => {
    expect(removeDateText("buy   tomorrow   milk", "tomorrow")).toBe("buy milk");
  });

  it("returns original text when date text not found", () => {
    expect(removeDateText("buy milk", "tomorrow")).toBe("buy milk");
  });
});
