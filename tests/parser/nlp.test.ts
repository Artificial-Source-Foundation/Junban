import { describe, it, expect } from "vitest";
import { parseDate, removeDateText, expandDateShorthands } from "../../src/parser/nlp.js";

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

  it("removes connectors with date text", () => {
    expect(removeDateText("buy grocery by tomorrow", "tomorrow")).toBe("buy grocery");
  });

  it("removes dangling connectors after date text removal", () => {
    expect(removeDateText("buy grocery by tomorrow", "by tomorrow")).toBe("buy grocery");
  });
});

describe("expandDateShorthands", () => {
  it("expands 'tod' to 'today'", () => {
    expect(expandDateShorthands("buy milk tod")).toBe("buy milk today");
  });

  it("expands 'tom' to 'tomorrow'", () => {
    expect(expandDateShorthands("buy milk tom")).toBe("buy milk tomorrow");
  });

  it("expands 'yd' to 'yesterday'", () => {
    expect(expandDateShorthands("what did I do yd")).toBe("what did I do yesterday");
  });

  it("expands day abbreviations", () => {
    expect(expandDateShorthands("meeting mon")).toBe("meeting Monday");
    expect(expandDateShorthands("call tue")).toBe("call Tuesday");
    expect(expandDateShorthands("review wed")).toBe("review Wednesday");
    expect(expandDateShorthands("dentist thu")).toBe("dentist Thursday");
    expect(expandDateShorthands("deploy fri")).toBe("deploy Friday");
    expect(expandDateShorthands("hike sat")).toBe("hike Saturday");
    expect(expandDateShorthands("rest sun")).toBe("rest Sunday");
  });

  it("expands 'nxt' shorthands", () => {
    expect(expandDateShorthands("plan nxt wk")).toBe("plan next week");
    expect(expandDateShorthands("call nxt mon")).toBe("call next Monday");
  });

  it("expands 'eod', 'eow', 'eom'", () => {
    expect(expandDateShorthands("finish eod")).toBe("finish end of day");
    expect(expandDateShorthands("submit eow")).toBe("submit end of week");
    expect(expandDateShorthands("review eom")).toBe("review end of month");
  });

  it("is case-insensitive", () => {
    expect(expandDateShorthands("buy milk TOD")).toBe("buy milk today");
    expect(expandDateShorthands("buy milk Tom")).toBe("buy milk tomorrow");
  });

  it("does not expand within longer words", () => {
    expect(expandDateShorthands("tomato")).toBe("tomato");
    expect(expandDateShorthands("toddle")).toBe("toddle");
    expect(expandDateShorthands("monday")).toBe("monday");
    expect(expandDateShorthands("sunflower")).toBe("sunflower");
  });
});

describe("parseDate with shorthands", () => {
  it("parses 'tod' as today", () => {
    const result = parseDate("buy milk tod", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.date.getDate()).toBe(REF_DATE.getDate());
    expect(result!.text).toBe("tod");
  });

  it("parses 'tom' as tomorrow", () => {
    const result = parseDate("buy milk tom", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.date.getDate()).toBe(16);
    expect(result!.text).toBe("tom");
  });

  it("parses 'mon' as Monday", () => {
    const result = parseDate("meeting mon", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.date.getDay()).toBe(1);
  });

  it("parses 'fri' as Friday", () => {
    const result = parseDate("deploy fri", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.date.getDay()).toBe(5);
  });

  it("removeDateText works with shorthand text", () => {
    const result = parseDate("buy milk tom", REF_DATE);
    expect(result).not.toBeNull();
    const cleaned = removeDateText("buy milk tom", result!.text);
    expect(cleaned).toBe("buy milk");
  });

  it("removeDateText works with 'tod'", () => {
    const result = parseDate("clean house tod", REF_DATE);
    expect(result).not.toBeNull();
    const cleaned = removeDateText("clean house tod", result!.text);
    expect(cleaned).toBe("clean house");
  });
});
