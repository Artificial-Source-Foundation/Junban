/**
 * Shared regex patterns for heuristic task extraction from unstructured text.
 * Used by both the AI tool (extract-tasks-from-text) and the UI preview (ExtractTasksModal).
 */

/** Action verbs that indicate a line is likely a task. */
export const ACTION_VERBS =
  /^(review|send|update|create|schedule|prepare|follow[\s-]?up|contact|call|email|write|fix|implement|deploy|check|set[\s-]?up|complete|finalize|submit|organize|plan|discuss|investigate|research|design|test|build|draft|arrange|confirm|approve|cancel|assign|notify|share|clean|move|order|book|coordinate)/i;

/** Patterns that indicate list items (bullets, numbered lists, TODO markers). */
export const LIST_PREFIX = /^(?:[-*+]|\d+[.)]\s*|(?:TODO|ACTION|AI|TASK)[:\s]+)/i;
