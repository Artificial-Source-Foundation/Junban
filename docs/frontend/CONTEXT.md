# Frontend Context Providers Reference

> Every context provider in `src/ui/context/`.

---

## Provider Nesting Order

The providers are nested in `App.tsx` in this order (outermost first):

```
SettingsProvider
  TaskProvider
    PluginProvider
      AIProvider
        VoiceProvider
          UndoProvider
            <AppContent />
```

This nesting order matters because inner providers can depend on outer ones (e.g., AIProvider references tasks from TaskProvider).

---

## TaskContext.tsx

- **Path:** `src/ui/context/TaskContext.tsx` (234 lines)
- **Purpose:** Central task state management. Provides all tasks, projects, and tags to the component tree, along with CRUD operations and refresh functions.
- **Key Exports:**
  - `TaskProvider` -- context provider component
  - `useTaskContext()` -- hook to consume the context
- **Context Value:**
  - `tasks: Task[]` -- all tasks in the system
  - `projects: Project[]` -- all projects
  - `tags: { id, name, color }[]` -- all tags
  - `loading: boolean` -- initial load state
  - `refreshTasks: () => Promise<void>` -- re-fetch all tasks
  - `refreshProjects: () => Promise<void>` -- re-fetch all projects
  - `refreshTags: () => Promise<void>` -- re-fetch all tags
  - `dispatch: React.Dispatch<TaskAction>` -- reducer dispatch for optimistic updates
- **State Management:** Uses `useReducer` with actions: `SET_TASKS`, `ADD_TASK`, `UPDATE_TASK`, `REMOVE_TASK`, `COMPLETE_TASK`, `SET_PROJECTS`, `ADD_PROJECT`, `SET_TAGS`
- **Key Dependencies:** `api` (listTasks, listProjects, listTags)
- **Used By:** Nearly every view and many components that display or modify tasks
- **Notes:** Fetches all data on mount. Reducer enables optimistic UI updates -- the UI updates immediately and the API call happens in the background. `refreshTasks` is called after AI chat interactions to sync AI-created tasks.

---

## AIContext.tsx

- **Path:** `src/ui/context/AIContext.tsx` (361 lines)
- **Purpose:** AI chat state and operations. Manages chat messages, SSE streaming, tool call handling, configuration, and voice call mode.
- **Key Exports:**
  - `AIProvider` -- context provider component
  - `useAIContext()` -- hook to consume the context
- **Context Value:**
  - `config: AIConfigInfo | null` -- current AI provider config
  - `isConfigured: boolean` -- whether a provider is set up
  - `messages: AIChatMessage[]` -- chat history
  - `isStreaming: boolean` -- whether a response is currently streaming
  - `sendMessage: (text: string, opts?) => Promise<void>` -- send a chat message
  - `clearChat: () => Promise<void>` -- clear chat history
  - `retry: () => Promise<void>` -- retry the last failed message
  - `updateConfig: (config) => Promise<void>` -- update AI provider settings
  - `refreshConfig: () => Promise<void>` -- re-fetch config
  - `isVoiceCall: boolean` -- whether voice call mode is active
  - `setVoiceCall: (active: boolean) => void`
- **SSE Stream Parsing:** Parses server-sent events from `sendChatMessage` API:
  - `delta` -- appends text to the current assistant message
  - `tool_call` -- records tool invocation (name, arguments)
  - `tool_result` -- records tool output (task data, etc.)
  - `done` -- marks streaming complete
  - `error` -- sets error state on the message with retry info
- **Key Dependencies:** `api` (getAIConfig, updateAIConfig, sendChatMessage, getChatMessages, clearChat)
- **Used By:** `AIChatPanel.tsx`, `AITab.tsx` (settings)
- **Notes:** Messages are loaded from the API on mount to restore chat history across page refreshes. The `sendMessage` function handles the full SSE lifecycle: creates user message, opens stream, processes events, and creates assistant message. Error messages include `errorCategory` and `retryable` flags.

---

## PluginContext.tsx

- **Path:** `src/ui/context/PluginContext.tsx` (138 lines)
- **Purpose:** Plugin system state. Manages installed plugins, registered commands, status bar items, panels, and views.
- **Key Exports:**
  - `PluginProvider` -- context provider component
  - `usePluginContext()` -- hook to consume the context
- **Context Value:**
  - `plugins: PluginInfo[]` -- installed plugins with status
  - `commands: PluginCommandInfo[]` -- registered plugin commands
  - `statusBarItems: StatusBarItemInfo[]` -- status bar items
  - `panels: PanelInfo[]` -- sidebar panels
  - `views: ViewInfo[]` -- custom views
  - `refreshPlugins: () => void` -- re-fetch plugin list
- **Polling:** Status bar items and panels are polled every 1 second via `setInterval` to pick up dynamic updates from running plugins.
- **Key Dependencies:** `api` (listPlugins, listPluginCommands, getStatusBarItems, getPluginPanels, getPluginViews)
- **Used By:** `Sidebar.tsx` (panels, views), `App.tsx` (commands, status bar), `PluginsTab.tsx`, `PluginStoreView.tsx`
- **Notes:** Commands are fetched once on mount and on `refreshPlugins`. Plugins, panels, views, and status bar items are fetched on mount. The 1-second polling allows plugins to update their UI dynamically without manual refresh.

---

## VoiceContext.tsx

- **Path:** `src/ui/context/VoiceContext.tsx` (295 lines)
- **Purpose:** Voice system state and operations. Manages STT/TTS providers, voice settings, recording state, and TTS playback.
- **Key Exports:**
  - `VoiceProvider` -- context provider component
  - `useVoiceContext()` -- hook to consume the context
- **Context Value:**
  - `settings: VoiceSettings` -- all voice settings (providers, mode, mic, API keys, etc.)
  - `updateSettings: (patch: Partial<VoiceSettings>) => void` -- update settings
  - `registry: VoiceProviderRegistry` -- STT/TTS provider registry
  - `ttsVoices: { id, name }[]` -- available TTS voices
  - `ttsModels: { id, name }[]` -- available TTS models
  - `isRecording: boolean` -- STT recording active
  - `isSpeaking: boolean` -- TTS playback active
  - `transcript: string` -- latest STT transcript
  - `startRecording: () => Promise<void>` -- begin STT recording
  - `stopRecording: () => Promise<string>` -- stop recording and return transcript
  - `speak: (text: string) => Promise<void>` -- TTS playback
  - `stopSpeaking: () => void` -- cancel TTS playback
  - `cancelRecording: () => void` -- abort without transcript
- **VoiceSettings Interface:**
  - `sttProviderId, ttsProviderId` -- selected provider IDs
  - `voiceMode: "off" | "push-to-talk" | "vad"` -- input mode
  - `ttsEnabled, ttsVoice, ttsModel` -- TTS settings
  - `autoSend: boolean` -- auto-send transcript to AI
  - `microphoneId: string` -- selected microphone device
  - `smartEndpoint: boolean` -- VAD smart endpoint detection
  - `gracePeriodMs: number` -- VAD grace period (500-3000ms)
  - `groqApiKey, inworldApiKey` -- provider API keys
- **Key Dependencies:** `VoiceProviderRegistry` from `ai/voice/registry.js`, `localStorage` for persistence
- **Used By:** `AIChatPanel.tsx`, `VoiceTab.tsx`, `useVoiceCall.ts`, `useVAD.ts`
- **Notes:** Settings are persisted to `localStorage` under `saydo-voice-settings`. Provider registry is initialized on mount with available STT/TTS adapters. Voice list and model list refresh when the TTS provider changes. Recording and playback states are used by AIChatPanel to show visual indicators.

---

## UndoContext.tsx

- **Path:** `src/ui/context/UndoContext.tsx` (81 lines)
- **Purpose:** Undo/redo system with toast notifications. Provides a way to push undoable actions and trigger undo/redo.
- **Key Exports:**
  - `UndoProvider` -- context provider component
  - `useUndo()` -- hook to consume the context
- **Context Value:**
  - `push: (entry: UndoEntry) => void` -- push an undoable action
  - `undo: () => void` -- undo the last action
  - `redo: () => void` -- redo the last undone action
  - `canUndo: boolean`
  - `canRedo: boolean`
  - `toast: ToastData | null` -- current toast notification to display
  - `dismissToast: () => void`
- **UndoEntry Interface:**
  - `description: string` -- human-readable description (shown in toast)
  - `undo: () => void | Promise<void>` -- the undo function
  - `redo: () => void | Promise<void>` -- the redo function
- **Key Dependencies:** None (standalone)
- **Used By:** `App.tsx` (renders Toast from undo context), `useTaskHandlers.ts` (pushes undo entries for task completion/deletion)
- **Notes:** Maintains an undo stack and redo stack. When an action is pushed, a toast appears with the description and an "Undo" action button. Stack size is not explicitly limited. Redo stack clears when a new action is pushed.

---

## SettingsContext.tsx

- **Path:** `src/ui/context/SettingsContext.tsx` (176 lines)
- **Purpose:** General application settings management. Loads all settings on mount, persists changes to the API, and applies visual effects (accent color, density, font size, animations) immediately.
- **Key Exports:**
  - `SettingsProvider` -- context provider component
  - `useGeneralSettings()` -- hook to consume the context
- **Context Value:**
  - `settings: GeneralSettings` -- current settings object
  - `loaded: boolean` -- whether settings have been loaded from storage
  - `updateSetting: <K>(key, value) => void` -- update a single setting
- **GeneralSettings Interface:**
  - `accent_color: string` -- hex color for accent
  - `density: "compact" | "default" | "comfortable"`
  - `font_size: "small" | "default" | "large"`
  - `reduce_animations: "true" | "false"`
  - `week_start: "sunday" | "monday" | "saturday"`
  - `date_format: "relative" | "short" | "long" | "iso"`
  - `time_format: "12h" | "24h"`
  - `default_priority: "none" | "p1" | "p2" | "p3" | "p4"`
  - `confirm_delete: "true" | "false"`
  - `start_view: "inbox" | "today" | "upcoming"`
  - `sound_enabled, sound_volume, sound_complete, sound_create, sound_delete, sound_reminder` -- sound settings
- **Visual Side Effects:** On setting change, immediately applies:
  - `accent_color` -> sets `--color-accent` and `--color-accent-hover` CSS properties (hover color is auto-darkened)
  - `density` -> adds/removes `density-compact` / `density-comfortable` class on `<html>`
  - `font_size` -> adds/removes `font-small` / `font-large` class on `<html>`
  - `reduce_animations` -> toggles `reduce-motion` class on `<html>`
- **Key Dependencies:** `api` (getAppSetting, setAppSetting)
- **Used By:** `GeneralTab.tsx`, `AppearanceTab.tsx`, `DatePicker.tsx`, `useSoundEffect.ts`, and any component that reads user preferences
- **Notes:** The provider wraps children in a `<div>` that fades in once settings are loaded, preventing flash of unstyled content. All setting values are stored as strings in the backend. The `darkenColor` helper converts hex to HSL, reduces lightness, and converts back.
