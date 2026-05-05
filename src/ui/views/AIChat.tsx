import { lazy, Suspense, useRef, useEffect } from "react";
import { ErrorBoundary } from "../components/ErrorBoundary.js";
import { useAIContext } from "../context/AIContext.js";
import { AIVoiceFeatureProviders } from "../context/AIVoiceFeatureProviders.js";
import { useAppState } from "../context/AppStateContext.js";
import * as api from "../api/ai.js";

const AIChatPanel = lazy(() =>
  import("../components/AIChatPanel.js").then((module) => ({ default: module.AIChatPanel })),
);

let lmStudioAutoRunId = 0;
let activeLMStudioAutoLoad: { runId: number; model: string } | null = null;

interface AIChatViewProps {
  onOpenSettings: () => void;
  onSelectTask?: (taskId: string) => void;
}

export function AIChat({ onOpenSettings, onSelectTask }: AIChatViewProps) {
  return (
    <AIVoiceFeatureProviders>
      <AIChatContent onOpenSettings={onOpenSettings} onSelectTask={onSelectTask} />
    </AIVoiceFeatureProviders>
  );
}

function AIChatContent({ onOpenSettings, onSelectTask }: AIChatViewProps) {
  // Auto-manage LM Studio models when AI Chat view is active
  const autoLoadedRunRef = useRef<number | null>(null);
  const { config: aiConfig } = useAIContext();
  const { selectedTaskId } = useAppState();

  useEffect(() => {
    const autoManage = window.localStorage.getItem("junban.ai.auto-manage-lmstudio") === "1";
    if (!autoManage || aiConfig?.provider !== "lmstudio" || !aiConfig.model) return;

    const model = aiConfig.model;
    const runId = ++lmStudioAutoRunId;
    let loadSettled = false;
    let loadSucceeded = false;
    let unloadQueued = false;
    activeLMStudioAutoLoad = { runId, model };

    const unloadIfStale = () => {
      if (unloadQueued) return;
      const activeLoad = activeLMStudioAutoLoad;
      if (activeLoad?.runId === runId || activeLoad?.model === model) return;
      unloadQueued = true;
      api
        .unloadModel("lmstudio", model)
        .catch((err: unknown) => console.warn("[ai-chat] Failed to unload model:", err));
    };

    // Auto-load model when view mounts
    const loadPromise = api
      .loadModel("lmstudio", model)
      .then(() => {
        loadSettled = true;
        loadSucceeded = true;
        if (activeLMStudioAutoLoad?.runId === runId) {
          autoLoadedRunRef.current = runId;
        } else {
          unloadIfStale();
        }
      })
      .catch((err: unknown) => {
        loadSettled = true;
        console.warn("[ai-chat] Failed to auto-load model:", err);
      });

    return () => {
      // Auto-unload model when view unmounts
      if (activeLMStudioAutoLoad?.runId === runId) {
        activeLMStudioAutoLoad = null;
      }
      if (autoLoadedRunRef.current === runId) {
        autoLoadedRunRef.current = null;
      }
      if (loadSettled && loadSucceeded) {
        unloadIfStale();
      } else {
        void loadPromise.then(() => {
          if (loadSucceeded) unloadIfStale();
        });
      }
    };
  }, [aiConfig?.model, aiConfig?.provider]);

  return (
    <div className="h-full w-full">
      <ErrorBoundary
        fallback={
          <div className="flex items-center justify-center h-full text-on-surface-secondary">
            AI Chat encountered an error. Please try refreshing.
          </div>
        }
      >
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-on-surface-secondary">
              Loading AI chat...
            </div>
          }
        >
          <AIChatPanel
            onClose={() => {}}
            onOpenSettings={onOpenSettings}
            onSelectTask={onSelectTask}
            focusedTaskId={selectedTaskId}
            mode="view"
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
