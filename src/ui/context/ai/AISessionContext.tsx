import { createContext, useContext } from "react";
import type { ChatSessionInfo } from "../../api/index.js";

export interface AISessionContextValue {
  sessions: ChatSessionInfo[];
  activeSessionId: string | null;
  createNewSession: () => Promise<void>;
  switchSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  renameSession: (sessionId: string, title: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

export const AISessionContext = createContext<AISessionContextValue | null>(null);

export function useAISessionContext(): AISessionContextValue {
  const context = useContext(AISessionContext);
  if (!context) {
    throw new Error("useAISessionContext must be used within an AIProvider");
  }
  return context;
}
