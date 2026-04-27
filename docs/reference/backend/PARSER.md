# Parser Module Documentation

The `src/parser/` directory implements natural language parsing for task input. It transforms strings like `"buy milk tomorrow at 3pm p1 #groceries +shopping"` into structured task data with extracted title, priority, tags, project, due date, recurrence, and more.

---

## Parsing Pipeline

The parser operates in a fixed sequence of extraction steps:

```
Raw Input
  |-> extractPriority()     -- removes "p1" through "p4"
  |-> extractTags()         -- removes "#tag" patterns
  |-> extractProject()      -- removes "+projectName" patterns
  |-> extractRecurrence()   -- removes "daily", "weekly", "every N days", etc.
  |-> extractDuration()     -- removes "~30m", "~1h", "~1.5h", "~1h30m"
  |-> extractDreadLevel()   -- removes "~d1" through "~d5" or "!frog1" through "!frog5"
  |-> extractDeadline()     -- removes "deadline friday" or "!!friday"
  |-> extractSomeday()      -- removes "~someday" or "/someday"
  |-> parseDate()           -- chrono-node extracts dates/times
  |-> removeDateText()      -- strips matched date text
  |-> remaining text        -- becomes the task title
```

Each step extracts its tokens and returns the cleaned remaining text for the next step.

---

## Files

### `nlp.ts`

**Path:** `src/parser/nlp.ts`
**Purpose:** Date/time extraction from natural language using chrono-node. Wraps chrono-node's parser and provides a utility to remove the matched date text from the input string.

**Key Exports:**

- `ParsedDate` -- interface: `{ date: Date; hasTime: boolean; text: string }`
- `parseDate(input: string, referenceDate?: Date): ParsedDate | null` -- extracts the first date/time from text
- `removeDateText(input: string, parsedText: string): string` -- removes the date portion and connector words (by, on, at, before)

**Key Dependencies:** `chrono-node`

**Used By:** `src/parser/task-parser.ts`, `src/cli/commands/edit.ts`

**Recognized Patterns (via chrono-node):**

- Relative dates: "tomorrow", "next Friday", "in 2 days"
- Relative times: "in 2 hours", "in 30 minutes"
- Absolute dates: "March 15", "2026-03-15"
- Combined: "tomorrow at 3pm", "next Monday at 9:00"
- Contextual: "this weekend", "end of month"

---

### `grammar.ts`

**Path:** `src/parser/grammar.ts`
**Purpose:** Grammar rules for task-specific syntax extraction. Each function extracts a specific token type from the input string and returns both the extracted value and the cleaned remaining text.

**Key Exports:**

- `extractPriority(input: string): { priority: number | null; text: string }`
  - Matches: `p1`, `p2`, `p3`, `p4` (case-insensitive, word-bounded)
- `extractTags(input: string): { tags: string[]; text: string }`
  - Matches: `#tag-name` (word chars and hyphens, lowercased)
  - Supports multiple tags in one input
- `extractRecurrence(input: string): { recurrence: string | null; text: string }`
  - Matches: `daily`, `weekly`, `monthly`, `weekdays`
  - Matches: `every day`, `every week`, `every month`
  - Matches: `every N days`, `every N weeks`
- `extractProject(input: string): { project: string | null; text: string }`
  - Matches: `+project-name` (word chars and hyphens)
- `extractDuration(input: string): { estimatedMinutes: number | null; text: string }`
  - Matches: `~30m`, `~1h`, `~1.5h`, `~90m`, `~1h30m` (requires `~` prefix)
- `extractDreadLevel(input: string): { dreadLevel: number | null; text: string }`
  - Matches: `~d1` through `~d5` and `!frog1` through `!frog5`
  - Used by motivation features such as Eat the Frog
- `extractDeadline(input: string): { deadlineText: string | null; text: string }`
  - Matches: `deadline friday`, `deadline next friday` (keyword syntax, case-insensitive)
  - Matches: `!!friday`, `!!next friday` (`!!` prefix syntax)
  - Keyword syntax tried first, then `!!` prefix as fallback
- `extractSomeday(input: string): { isSomeday: boolean; text: string }`
  - Matches: `~someday` or `/someday`

**Key Dependencies:** None (pure regex functions)

**Used By:** `src/parser/task-parser.ts`

---

### `task-parser.ts`

**Path:** `src/parser/task-parser.ts`
**Purpose:** The main parser entry point. Orchestrates the full parsing pipeline: priority, tags, project, recurrence, duration, dread level, deadline, someday, then date/time. Whatever text remains after all extractions becomes the task title.

**Key Exports:**

- `ParsedTask` -- interface: `{ title: string; priority: number | null; tags: string[]; project: string | null; dueDate: Date | null; dueTime: boolean; recurrence: string | null; estimatedMinutes: number | null; deadline: Date | null; isSomeday: boolean; dreadLevel: number | null }`
- `parseTask(input: string): ParsedTask`

**Key Dependencies:** `parseDate`, `removeDateText` from `nlp.ts`; `extractPriority`, `extractTags`, `extractProject`, `extractRecurrence`, `extractDuration`, `extractDreadLevel`, `extractDeadline`, `extractSomeday` from `grammar.ts`

**Used By:** `src/cli/commands/add.ts`, `src/core/import.ts` (Markdown import)

**Examples:**
| Input | Result |
|-------|--------|
| `"buy milk tomorrow at 3pm p1 #groceries +shopping"` | title: "buy milk", dueDate: tomorrow 15:00, dueTime: true, priority: 1, tags: ["groceries"], project: "shopping" |
| `"review PR #dev"` | title: "review PR", priority: null, tags: ["dev"], project: null, dueDate: null |
| `"standup daily"` | title: "standup", recurrence: "daily" |
| `"clean house every 2 weeks"` | title: "clean house", recurrence: "every 2 weeks" |
| `"deploy p2 #ops +infra next friday"` | title: "deploy", priority: 2, tags: ["ops"], project: "infra", dueDate: next Friday |
| `"submit report deadline friday p1"` | title: "submit report", deadline: Friday, priority: 1, dueDate: null |
| `"write docs !!jan 15"` | title: "write docs", deadline: Jan 15 |
| `"deep work ~2h p1"` | title: "deep work", estimatedMinutes: 120, priority: 1 |
| `"read book ~someday"` | title: "read book", isSomeday: true |
| `"call accountant ~d4"` | title: "call accountant", dreadLevel: 4 |
| `"write migration plan !frog5 ~1h30m"` | title: "write migration plan", dreadLevel: 5, estimatedMinutes: 90 |

### `task-extraction-patterns.ts`

**Path:** `src/parser/task-extraction-patterns.ts`
**Purpose:** Shared regex patterns for detecting likely tasks in unstructured text. These patterns support the AI `extract-tasks-from-text` flow and the UI preview in `ExtractTasksModal`.

**Key Exports:**

- `ACTION_VERBS` -- action-oriented line starter regex such as review, send, update, create, schedule, fix, implement, and similar verbs
- `LIST_PREFIX` -- bullet, numbered-list, TODO/ACTION/AI/TASK marker detection

**Used By:** AI task extraction and UI task extraction preview paths.
