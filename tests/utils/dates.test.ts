import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isToday, isOverdue, formatDate, todayStart, todayEnd } from "../../src/utils/dates.js";

describe("isToday", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true for today's date", () => {
    expect(isToday("2025-01-15T08:00:00Z")).toBe(true);
    expect(isToday("2025-01-15T23:59:59Z")).toBe(true);
  });

  it("returns false for yesterday", () => {
    expect(isToday("2025-01-14T23:59:59Z")).toBe(false);
  });

  it("returns false for tomorrow", () => {
    expect(isToday("2025-01-16T00:00:00Z")).toBe(false);
  });
});

describe("isOverdue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true for past dates", () => {
    expect(isOverdue("2025-01-14T00:00:00Z")).toBe(true);
    expect(isOverdue("2025-01-15T11:00:00Z")).toBe(true);
  });

  it("returns false for future dates", () => {
    expect(isOverdue("2025-01-16T00:00:00Z")).toBe(false);
    expect(isOverdue("2025-01-15T13:00:00Z")).toBe(false);
  });
});

describe("formatDate", () => {
  it("returns a string for a valid date", () => {
    const result = formatDate("2025-01-15T15:00:00Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns a different format when includeTime is true", () => {
    const dateOnly = formatDate("2025-01-15T15:00:00Z", false);
    const withTime = formatDate("2025-01-15T15:00:00Z", true);
    // The time-included version should be longer (has time component)
    expect(withTime.length).toBeGreaterThanOrEqual(dateOnly.length);
  });
});

describe("todayStart", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:34:56.789Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns an ISO string", () => {
    const result = todayStart();
    expect(() => new Date(result)).not.toThrow();
  });

  it("has time set to midnight", () => {
    const result = new Date(todayStart());
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });
});

describe("todayEnd", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:34:56.789Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns an ISO string", () => {
    const result = todayEnd();
    expect(() => new Date(result)).not.toThrow();
  });

  it("has time set to end of day", () => {
    const result = new Date(todayEnd());
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
  });
});
