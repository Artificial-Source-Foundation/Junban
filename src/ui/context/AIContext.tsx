import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import * as api from "../api/ai.js";
import type { AIConfigInfo, AIChatMessage, ChatSessionInfo } from "../api/ai.js";
import { useTaskContext } from "./TaskContext.js";
import type { AIContextValue } from "./ai/ai-context-types.js";
import { useAISendMessage } from "./ai/useAISendMessage.js";
import { useAISessionManagement } from "./ai/useAISessionManagement.js";
import { useAIMessageActions } from "./ai/useAIMessageActions.js";

// Re-export types for backward compatibility
export type { AIState, AIContextValue } from "./ai/ai-context-types.js";

const AIContext = createContext<AIContextValue | null>(null);

export function AIProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AIConfigInfo | null>(null);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [voiceCallActive, setVoiceCallActive] = useState(false);
  const [dataMutationCount, setDataMutationCount] = useState(0);
  const [sessions, setSessions] = useState<ChatSessionInfo[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const voiceCallActiveRef = useRef(false);
  const lastUserMessageRef = useRef<string>("");
  const mountedRef = useRef(true);
  const { refreshTasks } = useTaskContext();

  // Dynamic check: provider is configured if it has an API key or doesn't need one
  // For built-in providers we check known names; for plugin providers,
  // we assume they handle their own key requirements
  const isConfigured = !!(
    config?.provider &&
    (config.hasApiKey ||
      config.hasOAuthToken ||
      config.provider === "ollama" ||
      config.provider === "lmstudio" ||
      config.provider.includes(":"))
  );

  const refreshConfig = useCallback(async () => {
    try {
      const cfg = await api.getAIConfig();
      if (mountedRef.current) {
        setConfig(cfg);
      }
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const run = () => {
      void refreshConfig();
    };

    let idleHandle: number | null = null;
    let timeoutHandle: ReturnType<typeof globalThis.setTimeout> | null = null;
    let didRun = false;

    const runOnce = () => {
      if (didRun) return;
      didRun = true;
      if (timeoutHandle !== null) {
        globalThis.clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }
      run();
    };

    timeoutHandle = globalThis.setTimeout(runOnce, 300);

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleHandle = window.requestIdleCallback(runOnce, { timeout: 1500 });
    }

    return () => {
      if (idleHandle !== null && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== null) {
        globalThis.clearTimeout(timeoutHandle);
      }
    };
  }, [refreshConfig]);

  const refreshSessions = useCallback(async () => {
    try {
      const list = await api.listChatSessions();
      setSessions(list);
    } catch {
      // Non-critical
    }
  }, []);

  const { sendMessage, restoreMessages } = useAISendMessage({
    voiceCallActiveRef,
    lastUserMessageRef,
    focusedTaskId,
    setMessages,
    setIsStreaming,
    setDataMutationCount,
    refreshTasks,
    refreshSessions,
  });

  const { retryLastMessage, editAndResend, regenerateLastResponse } = useAIMessageActions({
    lastUserMessageRef,
    setMessages,
    sendMessage,
  });

  const { createNewSession, switchSession, deleteSession, renameSession } = useAISessionManagement({
    setMessages,
    setActiveSessionId,
    activeSessionId,
    refreshSessions,
  });

  const setVoiceCallMode = useCallback((active: boolean) => {
    setVoiceCallActive(active);
    voiceCallActiveRef.current = active;
  }, []);

  const clearChat = useCallback(async () => {
    await api.clearChat();
    setMessages([]);
    setActiveSessionId(null);
    await refreshSessions();
  }, [refreshSessions]);

  const updateConfig = useCallback(
    async (cfg: {
      provider?: string;
      apiKey?: string;
      model?: string;
      baseUrl?: string;
      authType?: string;
      oauthToken?: string;
    }) => {
      await api.updateAIConfig(cfg);
      await refreshConfig();
      setMessages([]);
    },
    [refreshConfig],
  );

  const value = useMemo(
    () => ({
      config,
      messages,
      isStreaming,
      isConfigured,
      sendMessage,
      clearChat,
      restoreMessages,
      updateConfig,
      refreshConfig,
      retryLastMessage,
      voiceCallActive,
      setVoiceCallMode,
      dataMutationCount,
      focusedTaskId,
      setFocusedTaskId,
      editAndResend,
      regenerateLastResponse,
      sessions,
      activeSessionId,
      createNewSession,
      switchSession,
      deleteSession,
      renameSession,
      refreshSessions,
    }),
    [
      config,
      messages,
      isStreaming,
      isConfigured,
      sendMessage,
      clearChat,
      restoreMessages,
      updateConfig,
      refreshConfig,
      retryLastMessage,
      voiceCallActive,
      setVoiceCallMode,
      dataMutationCount,
      focusedTaskId,
      setFocusedTaskId,
      editAndResend,
      regenerateLastResponse,
      sessions,
      activeSessionId,
      createNewSession,
      switchSession,
      deleteSession,
      renameSession,
      refreshSessions,
    ],
  );

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAIContext(): AIContextValue {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAIContext must be used within an AIProvider");
  }
  return context;
}
