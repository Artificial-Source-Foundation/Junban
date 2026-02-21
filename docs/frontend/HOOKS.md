# Frontend Hooks Reference

> Every custom hook in `src/ui/hooks/`.

---

## useRouting.ts

- **Path:** `src/ui/hooks/useRouting.ts` (255 lines)
- **Purpose:** Hash-based client-side routing. Parses the URL hash into a structured `View` object and provides navigation functions.
- **Key Exports:** `useRouting`
- **Return Value:**
  - `view: View` -- current view state
  - `navigate: (view: string, id?: string) => void` -- change view
  - `navigateToTask: (taskId: string) => void` -- navigate to task detail page
  - `openTask: (taskId: string) => void` -- open task in detail panel (not page)
  - `closeTask: () => void` -- close task detail panel
  - `selectedTaskId: string | null`
  - `selectedProjectId: string | null`
  - `selectedPluginViewId: string | null`
- **View Type:** Union of view states: `inbox`, `today`, `upcoming`, `calendar`, `project` (with `projectId`), `completed`, `filters-labels`, `task` (with `taskId`), `plugin-store`, `plugin-view` (with `viewId`), `settings` (with optional `tab`), `ai-chat`
- **Key Dependencies:** `window.location.hash`, `hashchange` event listener
- **Used By:** `App.tsx`
- **Notes:** Parses hash routes like `#/inbox`, `#/project/abc123`, `#/task/xyz`, `#/settings/ai`. Uses `pushState` with hash for navigation. `startView` setting from SettingsContext determines the default route. Supports `?task=id` query parameter for opening task detail panel alongside any view.

---

## useTaskHandlers.ts

- **Path:** `src/ui/hooks/useTaskHandlers.ts` (124 lines)
- **Purpose:** Task CRUD handler functions that wrap TaskContext dispatch with API calls, sound effects, and undo support.
- **Key Exports:** `useTaskHandlers`
- **Params:**
  - `options?: { defaultProjectId?: string }`
- **Return Value:**
  - `handleAddTask: (input: CreateTaskInput) => Promise<void>`
  - `handleCompleteTask: (id: string) => Promise<void>`
  - `handleDeleteTask: (id: string) => Promise<void>`
  - `handleUpdateTask: (id, input) => Promise<void>`
  - `handleReorder: (orderedIds: string[]) => void`
  - `handleAddSubtask: (parentId, title) => Promise<void>`
  - `handleIndent: (id) => Promise<void>`
  - `handleOutdent: (id) => Promise<void>`
- **Key Dependencies:** `useTaskContext`, `useUndo`, `useSoundEffect`, `api`
- **Used By:** `App.tsx` (provides handlers to all views)
- **Notes:** `handleCompleteTask` pushes an undo entry that uncompletes the task. `handleDeleteTask` pushes an undo entry that re-creates the task. Sound effects triggered on create, complete, and delete (if enabled in settings).

---

## useKeyboardNavigation.ts

- **Path:** `src/ui/hooks/useKeyboardNavigation.ts` (71 lines)
- **Purpose:** Vim-style keyboard navigation for task lists. Supports j/k (up/down), Enter (select), and Escape (deselect).
- **Key Exports:** `useKeyboardNavigation`
- **Params:**
  - `tasks: Task[]`
  - `selectedId: string | null`
  - `onSelect: (id: string) => void`
  - `onOpen: (id: string) => void`
  - `enabled?: boolean`
- **Return Value:** None (registers global keydown listener as side effect)
- **Key Dependencies:** None
- **Used By:** `App.tsx`
- **Notes:** Only active when no input/textarea has focus and `enabled` is true. j moves to next task, k moves to previous. Enter opens the selected task. Escape clears selection.

---

## useMultiSelect.ts

- **Path:** `src/ui/hooks/useMultiSelect.ts` (52 lines)
- **Purpose:** Multi-task selection with Ctrl/Meta (toggle individual) and Shift (range select) support.
- **Key Exports:** `useMultiSelect`
- **Params:**
  - `tasks: Task[]`
- **Return Value:**
  - `multiSelectedIds: Set<string>` -- set of selected task IDs
  - `handleMultiSelect: (id: string, event: React.MouseEvent) => void`
  - `clearMultiSelect: () => void`
- **Key Dependencies:** None
- **Used By:** `App.tsx`
- **Notes:** Ctrl/Meta+click toggles a single task in/out of selection. Shift+click selects a range from the last-clicked task to the current one. Regular click (without modifier) is not handled here (falls through to normal selection).

---

## useBulkActions.ts

- **Path:** `src/ui/hooks/useBulkActions.ts` (51 lines)
- **Purpose:** Bulk task operations on multi-selected tasks.
- **Key Exports:** `useBulkActions`
- **Params:**
  - `multiSelectedIds: Set<string>`
  - `clearMultiSelect: () => void`
- **Return Value:**
  - `bulkComplete: () => Promise<void>`
  - `bulkDelete: () => Promise<void>`
  - `bulkMove: (projectId: string) => Promise<void>`
  - `bulkTag: (tagNames: string[]) => Promise<void>`
- **Key Dependencies:** `api` (completeManyTasks, deleteManyTasks, updateManyTasks), `useTaskContext`
- **Used By:** `App.tsx` (passed to `BulkActionBar`)
- **Notes:** All operations convert the `Set<string>` to an array of IDs, call the bulk API endpoint, refresh tasks, and clear selection on completion.

---

## useAppShortcuts.ts

- **Path:** `src/ui/hooks/useAppShortcuts.ts` (63 lines)
- **Purpose:** Registers global keyboard shortcuts with the ShortcutManager singleton.
- **Key Exports:** `useAppShortcuts`
- **Params:**
  - `callbacks: { onCommandPalette, onToggleTheme, onUndo, onRedo, onSearch }`
- **Return Value:** None (registers shortcuts as side effect)
- **Registered Shortcuts:**
  - `Ctrl+K` -- Open command palette
  - `Ctrl+Shift+D` -- Toggle dark/light theme
  - `Ctrl+Z` -- Undo
  - `Ctrl+Shift+Z` -- Redo
  - `Ctrl+F` -- Open search
- **Key Dependencies:** `shortcutManager` singleton
- **Used By:** `App.tsx`
- **Notes:** Registers on mount, unregisters on unmount. Shortcuts are customizable via KeyboardTab settings. The ShortcutManager handles conflict detection and rebinding.

---

## useAppCommands.ts

- **Path:** `src/ui/hooks/useAppCommands.ts` (126 lines)
- **Purpose:** Builds the command palette command list from all available actions (navigation, settings, theme, AI, focus, templates, projects, plugins).
- **Key Exports:** `useAppCommands`
- **Params:**
  - `options: { navigate, openSettings, toggleChat, toggleTheme, focusMode, openTemplate, openAddProject, pluginCommands, projects }`
- **Return Value:** `Command[]` -- array of `{ id, label, icon?, action }` objects
- **Key Dependencies:** `PluginContext` (for plugin commands), `api` (executePluginCommand)
- **Used By:** `App.tsx` (passed to `CommandPalette`)
- **Notes:** Commands include: Go to Inbox/Today/Upcoming/Completed/Filters/Plugin Store, Open Settings (and individual tabs), Toggle Theme, Toggle AI Chat, Enter Focus Mode, New Template, New Project, and all registered plugin commands. Plugin commands are dynamically added from the plugin registry.

---

## useIsMobile.ts

- **Path:** `src/ui/hooks/useIsMobile.ts` (19 lines)
- **Purpose:** Detects mobile viewport using `matchMedia` for `max-width: 767px`.
- **Key Exports:** `useIsMobile`
- **Return Value:** `boolean` -- true if viewport is 767px or narrower
- **Key Dependencies:** `window.matchMedia`
- **Used By:** `App.tsx` (switches between desktop and mobile layouts)
- **Notes:** Listens for `change` events on the media query so it updates in real time when the window is resized.

---

## useSoundEffect.ts

- **Path:** `src/ui/hooks/useSoundEffect.ts` (30 lines)
- **Purpose:** Provides a function to play sound effects for task events, respecting user sound settings.
- **Key Exports:** `useSoundEffect`
- **Return Value:** `(event: SoundEvent) => void` -- play a sound for the given event
- **Key Dependencies:** `useGeneralSettings`, `playSound` from `utils/sounds.js`
- **Used By:** `useTaskHandlers.ts`
- **Notes:** Checks `sound_enabled` global toggle and per-event toggles (`sound_complete`, `sound_create`, `sound_delete`, `sound_reminder`) before playing. Respects `sound_volume` setting.

---

## useReminders.ts

- **Path:** `src/ui/hooks/useReminders.ts` (51 lines)
- **Purpose:** Polls for due task reminders every 30 seconds and fires browser notifications.
- **Key Exports:** `useReminders`
- **Params:**
  - `onReminderFired?: (task: Task) => void` -- callback when a reminder fires
- **Return Value:** None (side effect only)
- **Key Dependencies:** `api` (fetchDueReminders), `useSoundEffect`
- **Used By:** `App.tsx`
- **Notes:** Uses `setInterval` with 30-second polling. Checks `notif_browser` and `notif_toast` app settings. Shows `Notification` (browser) and calls `onReminderFired` (toast). Plays reminder sound effect. Tracks already-fired reminders by ID to avoid duplicates.

---

## useVAD.ts

- **Path:** `src/ui/hooks/useVAD.ts` (202 lines)
- **Purpose:** Voice Activity Detection for hands-free voice input. Manages the @ricky0123/vad-web instance with smart endpoint grace period.
- **Key Exports:** `useVAD`
- **Params:**
  - `options: { enabled, onSpeechStart, onSpeechEnd, onAudioData, gracePeriodMs?, microphoneId? }`
- **Return Value:**
  - `isListening: boolean`
  - `isSpeechActive: boolean`
  - `start: () => Promise<void>`
  - `stop: () => void`
  - `graceProgress: number` -- 0-100 for UI grace period indicator
- **Key Dependencies:** `@ricky0123/vad-web` (MicVAD), `VoiceContext` (settings)
- **Used By:** `useVoiceCall.ts`, `AIChatPanel.tsx`
- **Notes:** Smart endpoint: when speech ends, starts a grace period timer. If speech resumes within the grace period, the timer cancels. If the grace period expires, `onSpeechEnd` fires. Grace period is configurable (500-3000ms). VAD outputs Float32Array audio chunks that are passed to STT providers. Handles microphone device selection.

---

## useVoiceCall.ts

- **Path:** `src/ui/hooks/useVoiceCall.ts` (197 lines)
- **Purpose:** Orchestrates the voice call state machine: idle -> greeting -> listening -> processing -> speaking -> listening (loop). Coordinates VAD, STT, TTS, and AI chat.
- **Key Exports:** `useVoiceCall`
- **Params:**
  - `options: { active, onTranscript?, onSend?, onEnd? }`
- **Return Value:**
  - `state: VoiceCallState` -- current state (idle/greeting/listening/processing/speaking)
  - `durationSeconds: number` -- call duration
  - `graceProgress: number` -- VAD grace period progress
  - `endCall: () => void`
- **VoiceCallState Flow:**
  1. `idle` -- not in a call
  2. `greeting` -- AI sends initial greeting via TTS
  3. `listening` -- VAD active, waiting for user speech
  4. `processing` -- speech ended, STT transcription in progress, then AI processing
  5. `speaking` -- AI response being spoken via TTS
  6. Back to `listening` when TTS finishes
- **Key Dependencies:** `useVAD`, `useVoiceContext`, `useAIContext`
- **Used By:** `AIChatPanel.tsx`
- **Notes:** Duration timer ticks every second while active. Greeting message is "How can I help you?" spoken via TTS. The loop continues until `endCall` is called or `active` becomes false. Handles errors gracefully by returning to listening state.

---

## useFocusTrap.ts

- **Path:** `src/ui/hooks/useFocusTrap.ts` (50 lines)
- **Purpose:** Custom focus trap hook for modals and drawers. Saves the previously focused element on activation, focuses the first focusable child, traps Tab/Shift+Tab within the container, and restores focus on deactivation.
- **Key Exports:** `useFocusTrap`
- **Params:**
  - `containerRef: RefObject<HTMLElement>` -- ref to the container element to trap focus within
  - `active: boolean` -- whether the trap is active
- **Return Value:** None (side effect only)
- **Key Dependencies:** None
- **Used By:** `MobileDrawer.tsx`
- **Notes:** Queries all focusable elements (a, button, input, textarea, select, [tabindex]) within the container. Tab on the last element wraps to the first; Shift+Tab on the first wraps to the last. Restores the originally focused element when the trap deactivates.
