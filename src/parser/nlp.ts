import * as chrono from "chrono-node";

export interface ParsedDate {
  date: Date;
  hasTime: boolean;
  text: string; // The matched text that was parsed
}

/**
 * Extract date/time from natural language input.
 * Uses chrono-node for parsing.
 *
 * Examples:
 *  "tomorrow at 3pm" → { date: <tomorrow 15:00>, hasTime: true }
 *  "next Friday" → { date: <next Friday>, hasTime: false }
 *  "in 2 hours" → { date: <now + 2h>, hasTime: true }
 */
export function parseDate(input: string, referenceDate?: Date): ParsedDate | null {
  const results = chrono.parse(input, referenceDate ?? new Date());
  if (results.length === 0) return null;

  const result = results[0];
  const hasTime = result.start.isCertain("hour");

  return {
    date: result.start.date(),
    hasTime,
    text: result.text,
  };
}

/** Remove the date/time portion from input text, returning the remaining string. */
export function removeDateText(input: string, parsedText: string): string {
  return input.replace(parsedText, "").replace(/\s+/g, " ").trim();
}
