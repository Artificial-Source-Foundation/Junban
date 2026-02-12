import { parseTask } from "../../parser/task-parser.js";
import { formatTaskSummary } from "../formatter.js";

export async function addTask(description: string) {
  const parsed = parseTask(description);

  // TODO: Create task via TaskService
  console.log(`Created: ${formatTaskSummary(parsed)}`);
}
