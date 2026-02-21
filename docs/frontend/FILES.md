# Frontend Files Index

> Master index of every file in `src/ui/`, sorted by directory.

---

## Root Files

| File | Lines | Purpose |
|------|-------|---------|
| `src/ui/App.tsx` | 783 | Root React component. Wraps everything in 6 nested context providers. Contains `AppContent` which handles routing, layout, state orchestration, and renders all views. |
| `src/ui/main.tsx` | 11 | Entry point. Renders `<App />` in `React.StrictMode`. Imports theme manager to trigger initialization. |
| `src/ui/index.css` | 108 | Root CSS. Imports Tailwind and all theme CSS files. Defines custom fonts (Outfit, Space Grotesk, Space Mono), density scaling, font size variants, reduce-motion class, and 6 entrance animations. |
| `src/ui/shortcuts.ts` | 159 | `ShortcutManager` class. Handles registration, rebinding, conflict detection, key normalization, serialization, and subscription for keyboard shortcuts. |
| `src/ui/shortcutManagerInstance.ts` | 3 | Singleton `ShortcutManager` instance shared across the app. |

---

## API Layer (`src/ui/api/`)

| File | Lines | Purpose |
|------|-------|---------|
| `src/ui/api/index.ts` | 27 | Barrel export. Combines all submodules into unified `api` object. Re-exports types. |
| `src/ui/api/helpers.ts` | 44 | Shared utilities: `isTauri`, `BASE` URL, `handleResponse`, `handleVoidResponse`, lazy `getServices`. |
| `src/ui/api/tasks.ts` | 236 | Task CRUD, bulk operations, tree/subtask ops, reminders, reorder, import. |
| `src/ui/api/projects.ts` | 72 | Project CRUD and tag listing. |
| `src/ui/api/templates.ts` | 77 | Template CRUD and instantiation with variable interpolation. |
| `src/ui/api/plugins.ts` | 265 | Plugin management, commands, UI registry, permissions, store, install/uninstall. |
| `src/ui/api/ai.ts` | 343 | AI provider config, SSE chat streaming, model discovery, load/unload. |
| `src/ui/api/settings.ts` | 64 | App settings get/set, storage info, data export. |

---

## Components (`src/ui/components/`)

### Task Components

| File | Lines | Purpose |
|------|-------|---------|
| `src/ui/components/TaskInput.tsx` | 106 | Natural language task input with live NLP preview. |
| `src/ui/components/TaskItem.tsx` | 291 | Single task row with priority circle, metadata, drag handle. `React.memo` wrapped. |
| `src/ui/components/TaskList.tsx` | 277 | Sortable task list with @dnd-kit, tree flattening, inline subtask creation. |
| `src/ui/components/TaskDetailPanel.tsx` | 349 | Modal task detail with two-column layout, inline editing, subtask section. |
| `src/ui/components/SubtaskBlock.tsx` | 141 | Individual subtask row with inline editing and DnD sortable wrapper. |
| `src/ui/components/SubtaskSection.tsx` | 267 | Collapsible subtask list with DnD, progress bar, inline add. |
| `src/ui/components/InlineAddSubtask.tsx` | 64 | Inline subtask creation input for tree view. |
| `src/ui/components/TaskMetadataSidebar.tsx` | 331 | Task metadata editor sidebar (date, priority, tags, reminder, recurrence). |
| `src/ui/components/OverdueSection.tsx` | 98 | Shared overdue tasks section with expand/collapse and reschedule. |
| `src/ui/components/VirtualizedTaskList.tsx` | 71 | Virtualized task list using @tanstack/react-virtual for large lists. |
| `src/ui/components/TaskPreview.tsx` | 73 | Hover popover showing task metadata on 300ms delay. |

### Navigation Components

| File | Lines | Purpose |
|------|-------|---------|
| `src/ui/components/Sidebar.tsx` | 479 | Main navigation sidebar with views, projects, plugins, tools. Collapsible. |
| `src/ui/components/BottomNavBar.tsx` | 132 | Mobile bottom nav with AI orb (long-press for voice). |
| `src/ui/components/MobileDrawer.tsx` | 62 | Slide-in drawer for mobile sidebar. |
| `src/ui/components/CommandPalette.tsx` | 150 | Fuzzy search command palette (Ctrl+K). |
| `src/ui/components/SearchModal.tsx` | 248 | Global task search with debounced query and keyboard nav. |
| `src/ui/components/Breadcrumb.tsx` | 35 | Breadcrumb navigation for project and task views. |

### AI Components

| File | Lines | Purpose |
|------|-------|---------|
| `src/ui/components/AIChatPanel.tsx` | 817 | AI chat panel with SSE streaming, markdown, voice, tool calls. |
| `src/ui/components/VoiceCallOverlay.tsx` | 89 | Voice call full-screen overlay with state indicator and timer. |
| `src/ui/components/ChatTaskCard.tsx` | 57 | Compact task card for AI chat messages. |

### Forms & Modals

| File | Lines | Purpose |
|------|-------|---------|
| `src/ui/components/DatePicker.tsx` | 217 | Calendar date picker with quick options and time input. |
| `src/ui/components/RecurrencePicker.tsx` | 131 | Recurrence rule picker (daily, weekly, monthly, custom). |
| `src/ui/components/TagsInput.tsx` | 145 | Tag input with autocomplete and colored chips. |
| `src/ui/components/TemplateSelector.tsx` | 206 | Template browser with variable form. |
| `src/ui/components/AddProjectModal.tsx` | 181 | Project creation modal with name, emoji, color. |
| `src/ui/components/PermissionDialog.tsx` | 83 | Plugin permission approval dialog. |
| `src/ui/components/ConfirmDialog.tsx` | 102 | Styled confirmation dialog (danger/default). |
| `src/ui/components/QuickAddModal.tsx` | 65 | Quick-add task modal (Ctrl+N / q shortcut). |
| `src/ui/components/ContextMenu.tsx` | 182 | Generic right-click context menu with submenus and keyboard nav. |
| `src/ui/components/OnboardingModal.tsx` | 102 | 3-step onboarding wizard for first-run experience. |

### UI Chrome

| File | Lines | Purpose |
|------|-------|---------|
| `src/ui/components/BulkActionBar.tsx` | 124 | Sticky bar for multi-select bulk operations. |
| `src/ui/components/FAB.tsx` | 17 | Mobile floating action button. |
| `src/ui/components/FocusMode.tsx` | 258 | Full-screen single-task focus mode with keyboard shortcuts. |
| `src/ui/components/QueryBar.tsx` | 177 | Search/filter bar with debounced parsing and suggestions. |
| `src/ui/components/StatusBar.tsx` | 20 | Bottom status bar for plugin items. |
| `src/ui/components/PluginPanel.tsx` | 17 | Plugin sidebar panel container. |
| `src/ui/components/Toast.tsx` | 42 | Auto-dismissing toast notification with undo action. |
| `src/ui/components/EmptyState.tsx` | 26 | Reusable empty state with icon, title, description, and optional action. |
| `src/ui/components/Skeleton.tsx` | 45 | Skeleton loading components (SkeletonLine, SkeletonTaskItem, SkeletonTaskList). |
| `src/ui/components/CompletionRing.tsx` | 45 | SVG circle progress ring for daily completion stats. |
| `src/ui/components/ErrorBoundary.tsx` | 57 | React error boundary with fallback UI. |

---

## Views (`src/ui/views/`)

| File | Lines | Purpose |
|------|-------|---------|
| `src/ui/views/Inbox.tsx` | 83 | Inbox view -- unassigned pending tasks. |
| `src/ui/views/Today.tsx` | 142 | Today's tasks + overdue section with reschedule. |
| `src/ui/views/Upcoming.tsx` | 176 | Date-grouped upcoming tasks + overdue section. |
| `src/ui/views/Project.tsx` | 79 | Single project view. |
| `src/ui/views/Completed.tsx` | 160 | Completed tasks grouped by date with project filter. |
| `src/ui/views/FiltersLabels.tsx` | 283 | Saved filters and tag/label management. |
| `src/ui/views/TaskPage.tsx` | 183 | Full-page task detail view. |
| `src/ui/views/PluginStore.tsx` | 225 | Community plugin store. |
| `src/ui/views/PluginView.tsx` | 40 | Plugin custom view renderer (polls content). |
| `src/ui/views/Calendar.tsx` | 170 | Week-based calendar view with task entries by due date. |
| `src/ui/views/Settings.tsx` | 321 | Settings modal with 9 tabs, responsive layout. |

### Settings Tabs (`src/ui/views/settings/`)

| File | Lines | Purpose |
|------|-------|---------|
| `src/ui/views/settings/types.ts` | 10 | `SettingsTab` union type. |
| `src/ui/views/settings/components.tsx` | 129 | Shared primitives: SegmentedControl, ColorSwatchPicker, SettingRow, SettingSelect, Toggle. |
| `src/ui/views/settings/GeneralTab.tsx` | 326 | Date/time, task behavior, sound effects, notifications. |
| `src/ui/views/settings/AppearanceTab.tsx` | 97 | Theme, accent color, density, font size, reduce animations. |
| `src/ui/views/settings/AITab.tsx` | 322 | AI provider config, model selection, connection status. |
| `src/ui/views/settings/VoiceTab.tsx` | 803 | Microphone, STT/TTS providers, voice mode, local models. |
| `src/ui/views/settings/PluginsTab.tsx` | 281 | Plugin cards with settings, permissions, enable/disable. |
| `src/ui/views/settings/TemplatesTab.tsx` | 295 | Template CRUD with variable syntax support. |
| `src/ui/views/settings/KeyboardTab.tsx` | 92 | Keyboard shortcut customization with recording. |
| `src/ui/views/settings/DataTab.tsx` | 293 | Storage info, export (JSON/CSV/MD), import with preview. |
| `src/ui/views/settings/AboutTab.tsx` | 313 | App info, update checker, open source credits. |

---

## Context Providers (`src/ui/context/`)

| File | Lines | Purpose |
|------|-------|---------|
| `src/ui/context/TaskContext.tsx` | 234 | Task/project/tag state with useReducer. Central data store. |
| `src/ui/context/AIContext.tsx` | 361 | AI chat state, SSE streaming, tool calls, voice call mode. |
| `src/ui/context/PluginContext.tsx` | 138 | Plugin state: plugins, commands, status bar, panels, views. |
| `src/ui/context/VoiceContext.tsx` | 295 | Voice state: STT/TTS providers, recording, playback, settings. |
| `src/ui/context/UndoContext.tsx` | 81 | Undo/redo stack with toast notifications. |
| `src/ui/context/SettingsContext.tsx` | 176 | General settings with live CSS property application. |

---

## Hooks (`src/ui/hooks/`)

| File | Lines | Purpose |
|------|-------|---------|
| `src/ui/hooks/useRouting.ts` | 255 | Hash-based routing with View type and navigation functions. |
| `src/ui/hooks/useTaskHandlers.ts` | 124 | Task CRUD handlers with sound effects and undo support. |
| `src/ui/hooks/useKeyboardNavigation.ts` | 71 | Vim-style j/k/Enter/Escape task list navigation. |
| `src/ui/hooks/useMultiSelect.ts` | 52 | Ctrl/Shift multi-select with range support. |
| `src/ui/hooks/useBulkActions.ts` | 51 | Bulk complete/delete/move/tag operations. |
| `src/ui/hooks/useAppShortcuts.ts` | 63 | Registers global keyboard shortcuts (Ctrl+K, Ctrl+Z, etc.). |
| `src/ui/hooks/useAppCommands.ts` | 126 | Builds command palette command list. |
| `src/ui/hooks/useIsMobile.ts` | 19 | Mobile viewport detection via matchMedia. |
| `src/ui/hooks/useSoundEffect.ts` | 30 | Sound playback respecting user settings. |
| `src/ui/hooks/useReminders.ts` | 51 | Polls for due reminders, fires browser notifications. |
| `src/ui/hooks/useVAD.ts` | 202 | Voice Activity Detection with smart endpoint grace period. |
| `src/ui/hooks/useVoiceCall.ts` | 197 | Voice call state machine orchestration. |
| `src/ui/hooks/useFocusTrap.ts` | 50 | Focus trapping for modals/drawers (saves/restores focus, traps Tab). |

---

## Theme System (`src/ui/themes/`)

| File | Lines | Purpose |
|------|-------|---------|
| `src/ui/themes/manager.ts` | 90 | ThemeManager class: load, switch, toggle, persist themes. |
| `src/ui/themes/light.css` | 27 | Light theme design tokens (default). |
| `src/ui/themes/dark.css` | 22 | Dark theme token overrides. |
| `src/ui/themes/nord.css` | 22 | Nord palette token overrides. |

---

## Total Line Count Summary

| Category | Files | Total Lines |
|----------|-------|-------------|
| Root files | 5 | 1,064 |
| API layer | 8 | 1,128 |
| Components | 35 | 5,450 |
| Views | 11 | 1,862 |
| Settings tabs | 11 | 2,668 |
| Context providers | 6 | 1,285 |
| Hooks | 13 | 1,291 |
| Theme system | 4 | 161 |
| **Total** | **93** | **14,909** |
