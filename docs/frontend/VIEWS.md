# Frontend Views Reference

> Every file in `src/ui/views/` and `src/ui/views/settings/`.

---

## Main Views

### Inbox.tsx

- **Path:** `src/ui/views/Inbox.tsx` (83 lines)
- **Purpose:** Default inbox view. Shows tasks that have no project assignment and are still pending, plus a section of recently completed tasks.
- **Key Exports:** `InboxView`
- **Props:**
  - `tasks: Task[]`
  - `projects: Project[]`
  - `onAddTask, onComplete, onDelete, onSelect, onNavigateToTask` -- task action callbacks
  - `onReorder?, selectedTaskId?, highlightedTaskIds?, multiSelectedIds?, onMultiSelect?`
  - `onAddSubtask?, onIndent?, onOutdent?`
- **Key Dependencies:** `TaskInput.tsx`, `TaskList.tsx`
- **Used By:** `App.tsx`
- **Notes:** Filters tasks by `!task.projectId && task.status === 'pending'`. Recently completed section shows last 5 completed-today tasks.

---

### Today.tsx

- **Path:** `src/ui/views/Today.tsx` (197 lines)
- **Purpose:** Shows tasks due today and overdue tasks with a reschedule option.
- **Key Exports:** `TodayView`
- **Props:**
  - `tasks: Task[]`
  - `projects: Project[]`
  - Same task action callbacks as InboxView
  - `onUpdate: (id, input) => void` -- needed for reschedule
- **Key Dependencies:** `TaskInput.tsx`, `TaskList.tsx`
- **Used By:** `App.tsx`
- **Notes:** Two sections: "Overdue" (red header, with "Reschedule to today" button for each) and "Today". Empty state message when no tasks due today.

---

### Upcoming.tsx

- **Path:** `src/ui/views/Upcoming.tsx` (239 lines)
- **Purpose:** Shows upcoming tasks grouped by date, plus an overdue section at the top.
- **Key Exports:** `UpcomingView`
- **Props:**
  - Same as TodayView
- **Key Dependencies:** `TaskInput.tsx`, `TaskList.tsx`
- **Used By:** `App.tsx`
- **Notes:** Groups tasks by due date with date headers (e.g., "Monday, Jan 15"). Overdue section collapsible. Tasks without due dates shown in a "No date" section at the bottom.

---

### Project.tsx

- **Path:** `src/ui/views/Project.tsx` (79 lines)
- **Purpose:** Single project view. Shows tasks belonging to the selected project.
- **Key Exports:** `ProjectView`
- **Props:**
  - `project: Project`
  - `tasks: Task[]`
  - Same task action callbacks
  - `projects: Project[]`
- **Key Dependencies:** `TaskInput.tsx`, `TaskList.tsx`
- **Used By:** `App.tsx`
- **Notes:** Passes `defaultProjectId` to TaskInput so new tasks auto-assign to the project. Shows project name and icon in header.

---

### Completed.tsx

- **Path:** `src/ui/views/Completed.tsx` (158 lines)
- **Purpose:** Shows completed tasks grouped by completion date, with project filter dropdown.
- **Key Exports:** `CompletedView`
- **Props:**
  - `tasks: Task[]`
  - `projects: Project[]`
  - `onDelete, onSelect, onNavigateToTask`
  - `onComplete` -- used for "uncomplete" action
- **Key Dependencies:** `TaskList.tsx`
- **Used By:** `App.tsx`
- **Notes:** Tasks grouped by completedAt date into sections: "Today", "Yesterday", "This Week", "Older". Filter by project dropdown in header. No TaskInput here (cannot add tasks to completed view).

---

### FiltersLabels.tsx

- **Path:** `src/ui/views/FiltersLabels.tsx` (283 lines)
- **Purpose:** Saved filters and labels (tags) management view with CRUD for both.
- **Key Exports:** `FiltersLabelsView`
- **Props:**
  - `tasks: Task[]`
  - `projects: Project[]`
  - `onNavigateToTask, onSelect, onComplete, onDelete`
- **Key Dependencies:** `QueryBar.tsx`, `TaskList.tsx`, `TagsInput.tsx`, `api` for tag CRUD
- **Used By:** `App.tsx`
- **Notes:** Two tabs: "Filters" (saved query presets) and "Labels" (tag management with color editing). Filter syntax supports `priority:`, `tag:`, `project:`, `status:`, `due:` operators.

---

### TaskPage.tsx

- **Path:** `src/ui/views/TaskPage.tsx` (183 lines)
- **Purpose:** Full-page task detail view (used when navigating to `#/task/:id`). Two-column layout with content and metadata sidebar.
- **Key Exports:** `TaskPageView`
- **Props:**
  - `taskId: string`
  - `tasks: Task[]`
  - `projects: Project[]`
  - `onUpdate, onComplete, onDelete, onNavigateToTask`
  - `onAddSubtask?, onCompleteSubtask?, onDeleteSubtask?, onUpdateSubtask?, onReorderSubtasks?`
- **Key Dependencies:** `SubtaskSection.tsx`, `TaskMetadataSidebar.tsx`
- **Used By:** `App.tsx`
- **Notes:** Similar layout to `TaskDetailPanel` but rendered as a full page view instead of a modal overlay. Title and description inline-editable. Breadcrumb navigation at top.

---

### PluginStore.tsx

- **Path:** `src/ui/views/PluginStore.tsx` (225 lines)
- **Purpose:** Community plugin store. Browse, search, install, and uninstall plugins.
- **Key Exports:** `PluginStoreView`
- **Props:**
  - `installedPlugins: PluginInfo[]`
- **Key Dependencies:** `api` (getPluginStore, installPlugin, uninstallPlugin), `lucide-react`
- **Used By:** `App.tsx`
- **Notes:** Fetches store index from API on mount. Search filters by name, description, author, and tags. Shows install/uninstall buttons based on `installedPlugins`. Displays plugin author, version, and tags.

---

### PluginView.tsx

- **Path:** `src/ui/views/PluginView.tsx` (40 lines)
- **Purpose:** Renders content from a plugin-registered custom view.
- **Key Exports:** `PluginView`
- **Props:**
  - `viewId: string`
- **Key Dependencies:** `api.getPluginViewContent`
- **Used By:** `App.tsx`
- **Notes:** Polls view content every 1 second using `setInterval`. Renders content as raw HTML-like text (plugins set content as strings).

---

### Settings.tsx

- **Path:** `src/ui/views/Settings.tsx` (321 lines)
- **Purpose:** Settings modal with 9 tabs. Desktop layout shows sidebar tab list + content area. Mobile layout uses drill-down navigation (tab list -> tab content with back button).
- **Key Exports:** `SettingsView`
- **Props:**
  - `open: boolean`
  - `onClose: () => void`
  - `initialTab?: SettingsTab`
- **Key Dependencies:** All settings tab components, `lucide-react`
- **Used By:** `App.tsx`
- **Notes:** Tabs: General, Appearance, AI, Voice, Plugins, Templates, Keyboard, Data, About. Each tab has its own icon. Modal with backdrop, closes on Escape. Mobile-responsive with full-screen layout on small screens.

---

## Settings Tabs

### settings/types.ts

- **Path:** `src/ui/views/settings/types.ts` (10 lines)
- **Purpose:** Type definition for the `SettingsTab` union type.
- **Key Exports:** `SettingsTab` type (`"general" | "appearance" | "ai" | "voice" | "plugins" | "templates" | "keyboard" | "data" | "about"`)
- **Used By:** `Settings.tsx`, all tab components

---

### settings/components.tsx

- **Path:** `src/ui/views/settings/components.tsx` (129 lines)
- **Purpose:** Shared UI primitives for settings tabs.
- **Key Exports:**
  - `SegmentedControl<T>` -- horizontal button group for enum-like options
  - `ColorSwatchPicker` -- color circle picker with check mark
  - `SettingRow` -- label + description + control layout
  - `SettingSelect<T>` -- styled `<select>` dropdown
  - `Toggle` -- on/off toggle switch
- **Used By:** `GeneralTab.tsx`, `AppearanceTab.tsx`
- **Notes:** These are generic, reusable primitives. `Toggle` renders as a rounded pill with sliding circle indicator.

---

### settings/GeneralTab.tsx

- **Path:** `src/ui/views/settings/GeneralTab.tsx` (326 lines)
- **Purpose:** General settings: Date & Time (week start, date format, time format), Task Behavior (default priority, confirm delete, start view), Sound Effects (enable/disable, volume, per-event toggles with preview), and Notifications (browser notifications, toast notifications, default reminder offset).
- **Key Exports:** `GeneralTab`
- **Props:** None (reads from `useGeneralSettings` context)
- **Key Dependencies:** `SettingsContext`, settings `components.tsx`, `previewSound` from `utils/sounds.js`
- **Used By:** `Settings.tsx`
- **Notes:** Sound section includes per-event preview buttons. Notification section handles browser permission requests. Date format shows live preview.

---

### settings/AppearanceTab.tsx

- **Path:** `src/ui/views/settings/AppearanceTab.tsx` (97 lines)
- **Purpose:** Appearance settings: Theme (system/light/dark/nord), Accent color (8 preset colors), Layout (density: compact/default/comfortable, font size: small/default/large), and Accessibility (reduce animations toggle).
- **Key Exports:** `AppearanceTab`
- **Props:** None (reads from `useGeneralSettings` context and `themeManager`)
- **Key Dependencies:** `SettingsContext`, `ThemeManager`, `DEFAULT_PROJECT_COLORS`, settings `components.tsx`
- **Used By:** `Settings.tsx`
- **Notes:** Theme changes take effect immediately via ThemeManager. Accent color, density, and font size also apply immediately via CSS custom properties and classes.

---

### settings/AITab.tsx

- **Path:** `src/ui/views/settings/AITab.tsx` (322 lines)
- **Purpose:** AI provider configuration: provider selection, API key input, model selection (dropdown or custom text), base URL, and save button. Supports model discovery for local providers (Ollama, LM Studio).
- **Key Exports:** `AITab`
- **Props:** None (reads from `useAIContext`)
- **Key Dependencies:** `AIContext`, `api` (listAIProviders, fetchModels, loadModel)
- **Used By:** `Settings.tsx`
- **Notes:** Provider help text shown below API key input. Model dropdown auto-populated via `fetchModels` API call with 300ms debounce on baseUrl changes. LM Studio supports auto-load/unload checkbox. Shows "Connected" or "Not configured" status.

---

### settings/VoiceTab.tsx

- **Path:** `src/ui/views/settings/VoiceTab.tsx` (803 lines)
- **Purpose:** Voice settings: Microphone selection (with permission handling), STT provider selection, TTS provider and voice/model selection with preview, Voice interaction mode (off/push-to-talk/VAD), auto-send, smart endpoint with grace period slider, and Local Models management (download, preload, delete browser-cached ML models).
- **Key Exports:** `VoiceTab`
- **Props:** None (reads from `useVoiceContext`)
- **Key Dependencies:** `VoiceContext`, `VoiceProviderRegistry`, voice audio utilities
- **Used By:** `Settings.tsx`
- **Notes:** MicrophoneSection handles permission prompt with timeout fallback for Linux/PipeWire issues. Local Models section shows download progress bars, cached status, and model sizes. Voice preview button speaks a test sentence.

---

### settings/PluginsTab.tsx

- **Path:** `src/ui/views/settings/PluginsTab.tsx` (281 lines)
- **Purpose:** Plugin management: list installed plugins with expand/collapse cards showing permissions, settings, enable/disable toggle, permission approval/revocation.
- **Key Exports:** `PluginsTab`
- **Props:** None (reads from `usePluginContext`)
- **Key Dependencies:** `PluginContext`, `PermissionDialog.tsx`, `api` (plugin settings and permissions)
- **Used By:** `Settings.tsx`
- **Notes:** PluginCard sub-component renders expandable cards. PluginSettings sub-component renders dynamic settings fields based on `SettingDefinitionInfo` (text, number, boolean, select). Links to Plugin Store when no plugins installed.

---

### settings/TemplatesTab.tsx

- **Path:** `src/ui/views/settings/TemplatesTab.tsx` (295 lines)
- **Purpose:** Task template management: create, edit, and delete templates. Template form supports name, title template (with `{{variable}}` syntax), description, priority, tags, and recurrence.
- **Key Exports:** `TemplatesTab`
- **Props:** None (uses `api` directly)
- **Key Dependencies:** `api` (listTemplates, createTemplate, updateTemplate, deleteTemplate), `core/types.js`
- **Used By:** `Settings.tsx`
- **Notes:** TemplateForm sub-component for create/edit. Tags entered as comma-separated string. Empty state with prompt to create first template.

---

### settings/KeyboardTab.tsx

- **Path:** `src/ui/views/settings/KeyboardTab.tsx` (92 lines)
- **Purpose:** Keyboard shortcut customization. Lists all registered shortcuts with current key bindings. Supports recording new bindings and resetting to defaults.
- **Key Exports:** `KeyboardTab`
- **Props:** None (uses `shortcutManager` singleton)
- **Key Dependencies:** `shortcutManager` from `shortcutManagerInstance.js`, `api` (persists custom bindings)
- **Used By:** `Settings.tsx`
- **Notes:** Recording mode captures next keypress as new binding. Escape cancels recording. Reset button shown only when binding differs from default. Persists to `keyboard_shortcuts` app setting.

---

### settings/DataTab.tsx

- **Path:** `src/ui/views/settings/DataTab.tsx` (293 lines)
- **Purpose:** Data management: storage info display, export (JSON/CSV/Markdown), and import (Saydo JSON, Todoist JSON, Markdown/text) with preview step.
- **Key Exports:** `DataTab`
- **Props:** None (uses `api` and `useTaskContext`)
- **Key Dependencies:** `api` (exportAllData, importTasks, getStorageInfo), `core/export.js`, `core/import.js`, `TaskContext`
- **Used By:** `Settings.tsx`
- **Notes:** StorageSection shows current mode (SQLite/Markdown) and path. Export triggers browser file download. Import has a preview step showing task count, projects, tags, and warnings before confirming. Supports multiple import formats.

---

### settings/AboutTab.tsx

- **Path:** `src/ui/views/settings/AboutTab.tsx` (313 lines)
- **Purpose:** About page with app info, version, update checker (Tauri only), and open source credits listing all dependencies organized by category.
- **Key Exports:** `AboutTab`
- **Props:** None
- **Key Dependencies:** `@tauri-apps/plugin-updater` (lazy import), `@tauri-apps/plugin-process` (lazy import), `isTauri` utility
- **Used By:** `Settings.tsx`
- **Notes:** Update check only available in Tauri desktop mode. Credits organized into 6 categories: AI & ML, Frontend, Database & Storage, Desktop & Platform, Parsing & Utilities, Testing. Each credit links to its repository. Footer links to AI Strategic Forum GitHub.
