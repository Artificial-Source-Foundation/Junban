import { createContext, useContext } from "react";
import type { AIChatMessage } from "../../api/ai.js";

export interface AIChatContextValue {
  messages: AIChatMessage[];
  isStreaming: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => Promise<void>;
  restoreMessages: () => Promise<void>;
  retryLastMessage: () => void;
  editAndResend: (messageIndex: number, newText: string) => void;
  regenerateLastResponse: () => void;
  voiceCallActive: boolean;
  setVoiceCallMode: (active: boolean) => void;
  /** Increments when AI tools mutate projects/tags -- watch this to refresh data */
  dataMutationCount: number;
  /** Currently focused task ID -- used to give AI context about what the user is viewing */
  focusedTaskId: string | null;
  setFocusedTaskId: (taskId: string | null) => void;
}

export const AIChatContext = createContext<AIChatContextValue | null>(null);

export function useAIChatContext(): AIChatContextValue {
  const context = useContext(AIChatContext);
  if (!context) {
    throw new Error("useAIChatContext must be used within an AIProvider");
  }
  return context;
}
