import type { ChatMessage, ToolCall } from "./types.js";
import type { ChatMessageRow } from "../storage/interface.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("message-utils");

/**
 * Deserialize chat message rows from storage into ChatMessage objects.
 * Filters out system messages and safely parses toolCalls JSON.
 * Shared by api/ai.ts, ai/chat.ts, and ui/api/ai/ai-sessions.ts.
 */
export function deserializeChatMessages(rows: ChatMessageRow[]): ChatMessage[] {
  const messages: ChatMessage[] = [];
  for (const row of rows) {
    if (row.role === "system") continue;

    let toolCalls: ToolCall[] | undefined;
    if (row.toolCalls) {
      try {
        toolCalls = JSON.parse(row.toolCalls);
      } catch {
        logger.warn("Corrupted toolCalls JSON in chat message — skipping toolCalls", {
          sessionId: row.sessionId,
          role: row.role,
        });
      }
    }

    messages.push({
      role: row.role as ChatMessage["role"],
      content: row.content,
      ...(row.toolCallId ? { toolCallId: row.toolCallId } : {}),
      ...(toolCalls ? { toolCalls } : {}),
    });
  }
  return messages;
}
