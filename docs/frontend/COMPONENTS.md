# Frontend Components Reference

> Every file in `src/ui/components/`, grouped by category.

---

## Task Components

### TaskInput.tsx

- **Path:** `src/ui/components/TaskInput.tsx` (93 lines)
- **Purpose:** Natural language task input field. Parses free-text into structured task data in real time using the NLP parser.
- **Key Exports:** `TaskInput`
- **Props:**
  - `onAddTask: (input: CreateTaskInput) => void` -- callback fired with parsed task data on submit
  - `defaultProjectId?: string` -- pre-selects a project for the created task
- **Key Dependencies:** `parseTask` from `../../parser/task-parser.js`, `CreateTaskInput` from `../../core/types.js`
- **Used By:** `Inbox.tsx`, `Today.tsx`, `Upcoming.tsx`, `Project.tsx`
- **Notes:** Shows a live preview line below the input displaying parsed due date, priority, and tags. Submits on Enter, clears input on success.

---

### TaskItem.tsx

- **Path:** `src/ui/components/TaskItem.tsx` (291 lines)
- **Purpose:** Renders a single task row with priority-colored completion circle, title, metadata line (due date, project, tags, recurrence), drag handle, and optional subtask expand toggle.
- **Key Exports:** `TaskItem` (wrapped in `React.memo`)
- **Props:**
  - `task: Task` -- the task data
  - `onComplete: (id: string) => void`
  - `onDelete: (id: string) => void`
  - `onSelect: (id: string) => void`
  - `onNavigateToTask?: (id: string) => void`
  - `selected?: boolean`
  - `highlighted?: boolean`
  - `isMultiSelected?: boolean`
  - `depth?: number` -- indentation level for subtask hierarchy
  - `childCount?: number`
  - `isExpanded?: boolean`
  - `onToggleExpand?: (id: string) => void`
  - `dragHandleProps?: object` -- from @dnd-kit for drag handle
  - `projects?: Project[]`
- **Key Dependencies:** `lucide-react` icons, `DatePicker.tsx` (inline date editing), `core/types.js`
- **Used By:** `TaskList.tsx` (via `SortableTaskItem`), `FocusMode.tsx`
- **Notes:** Priority colors map: p1=red, p2=amber, p3=accent, p4=muted. Overdue dates shown in red. Mobile-responsive -- hides drag handle on touch devices.

---

### TaskList.tsx

- **Path:** `src/ui/components/TaskList.tsx` (247 lines)
- **Purpose:** Renders a sortable list of tasks with drag-and-drop reordering, hierarchical tree flattening, and inline subtask creation.
- **Key Exports:** `TaskList`
- **Props:**
  - `tasks: Task[]`
  - `onComplete, onDelete, onSelect, onNavigateToTask` -- task action callbacks
  - `onReorder?: (orderedIds: string[]) => void`
  - `selectedTaskId?: string | null`
  - `highlightedTaskIds?: Set<string>`
  - `multiSelectedIds?: Set<string>`
  - `onMultiSelect?: (id, event) => void`
  - `projects?: Project[]`
  - `onAddSubtask?: (parentId: string, title: string) => void`
  - `onIndent?: (id: string) => void`
  - `onOutdent?: (id: string) => void`
- **Key Dependencies:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `TaskItem.tsx`, `InlineAddSubtask.tsx`
- **Used By:** `Inbox.tsx`, `Today.tsx`, `Upcoming.tsx`, `Project.tsx`, `Completed.tsx`
- **Notes:** Builds a flat tree from `parentId` relationships. Uses `DndContext` + `SortableContext` with `verticalListSortingStrategy`. Supports keyboard-based indent/outdent (Tab/Shift+Tab) on focused items.

---

### TaskDetailPanel.tsx

- **Path:** `src/ui/components/TaskDetailPanel.tsx` (349 lines)
- **Purpose:** Modal dialog showing full task details in a two-column layout: content area (title, description, subtasks) on the left and metadata sidebar on the right.
- **Key Exports:** `TaskDetailPanel`
- **Props:**
  - `task: Task`
  - `tasks: Task[]` -- full task list for prev/next navigation
  - `projects: Project[]`
  - `onUpdate: (id, input) => void`
  - `onComplete: (id) => void`
  - `onDelete: (id) => void`
  - `onClose: () => void`
  - `onNavigateToTask: (id) => void`
  - `onAddSubtask?: (parentId, title) => void`
  - `onCompleteSubtask?: (id) => void`
  - `onDeleteSubtask?: (id) => void`
  - `onUpdateSubtask?: (id, input) => void`
  - `onReorderSubtasks?: (ids) => void`
- **Key Dependencies:** `SubtaskSection.tsx`, `TaskMetadataSidebar.tsx`, `lucide-react`
- **Used By:** `App.tsx` (rendered as overlay when a task is selected)
- **Notes:** Title and description are inline-editable with auto-save on blur. Arrow key navigation between tasks in the list. Closes on Escape. Mobile-responsive -- stacks columns vertically on small screens.

---

### SubtaskBlock.tsx

- **Path:** `src/ui/components/SubtaskBlock.tsx` (141 lines)
- **Purpose:** Renders an individual subtask row with inline editing, completion toggle, and delete button. Wraps in a sortable container for DnD.
- **Key Exports:** `SubtaskBlock`, `SortableSubtaskBlock`
- **Props:**
  - `subtask: Task`
  - `onComplete, onDelete, onUpdate` -- callbacks
- **Key Dependencies:** `@dnd-kit/sortable`, `@dnd-kit/utilities`, `lucide-react`
- **Used By:** `SubtaskSection.tsx`
- **Notes:** Double-click or Enter to start editing. Escape cancels edit. Saves on blur or Enter.

---

### SubtaskSection.tsx

- **Path:** `src/ui/components/SubtaskSection.tsx` (267 lines)
- **Purpose:** Collapsible subtask list with DnD reordering, progress bar showing completion ratio, and inline "add subtask" input.
- **Key Exports:** `SubtaskSection`
- **Props:**
  - `parentId: string`
  - `subtasks: Task[]`
  - `onAdd?: (parentId, title) => void`
  - `onComplete?, onDelete?, onUpdate?, onReorder?` -- subtask action callbacks
- **Key Dependencies:** `@dnd-kit/core`, `@dnd-kit/sortable`, `SubtaskBlock.tsx`, `lucide-react`
- **Used By:** `TaskDetailPanel.tsx`, `TaskPage.tsx`
- **Notes:** Collapsed by default if there are no subtasks. Progress bar uses accent color. Shows "X of Y" completion count.

---

### InlineAddSubtask.tsx

- **Path:** `src/ui/components/InlineAddSubtask.tsx` (64 lines)
- **Purpose:** Inline input for creating subtasks directly within the TaskList tree view (not the detail panel).
- **Key Exports:** `InlineAddSubtask`
- **Props:**
  - `parentId: string`
  - `depth: number`
  - `onAdd: (parentId: string, title: string) => void`
- **Key Dependencies:** `lucide-react` (Plus icon)
- **Used By:** `TaskList.tsx`
- **Notes:** Appears below expanded parent tasks. Submits on Enter, clears on success.

---

### TaskMetadataSidebar.tsx

- **Path:** `src/ui/components/TaskMetadataSidebar.tsx` (331 lines)
- **Purpose:** Right sidebar within task detail views showing and editing all task metadata: status, due date/time, priority, tags, project, reminder, recurrence, and delete action.
- **Key Exports:** `TaskMetadataSidebar`
- **Props:**
  - `task: Task`
  - `projects: Project[]`
  - `onUpdate, onComplete, onDelete` -- callbacks
- **Key Dependencies:** `DatePicker.tsx`, `RecurrencePicker.tsx`, `TagsInput.tsx`, `lucide-react`
- **Used By:** `TaskDetailPanel.tsx`, `TaskPage.tsx`
- **Notes:** Each metadata field is rendered as a clickable row that expands an inline editor. Reminder uses DatePicker with time enabled. Delete shows confirmation.

---

## Navigation Components

### Sidebar.tsx

- **Path:** `src/ui/components/Sidebar.tsx` (407 lines)
- **Purpose:** Main navigation sidebar with task views (Inbox, Today, Upcoming, Filters & Labels, Completed), collapsible projects section, plugin panels/views, tools section (AI Chat, Focus Mode), and workspace section (Plugin Store, Settings).
- **Key Exports:** `Sidebar`
- **Props:**
  - `currentView: string`
  - `onNavigate: (view, id?) => void`
  - `onOpenSettings?: () => void`
  - `projects: Project[]`
  - `selectedProjectId: string | null`
  - `panels?: PanelInfo[]`
  - `pluginViews?: ViewInfo[]`
  - `selectedPluginViewId?: string | null`
  - `onToggleChat?, chatOpen?` -- AI chat toggle
  - `onFocusMode?` -- focus mode trigger
  - `collapsed?: boolean, onToggleCollapsed?` -- sidebar collapse
  - `projectTaskCounts?: Map<string, number>`
  - `onAddTask?, onSearch?` -- top action buttons
  - `inboxCount?, todayCount?` -- badge counts
  - `onOpenProjectModal?` -- add project button
- **Key Dependencies:** `lucide-react`, `core/types.js`, `api/index.js` (PanelInfo, ViewInfo)
- **Used By:** `App.tsx`
- **Notes:** Collapsed mode shows only icons with hover tooltips (`CollapsedTooltip` internal component). Badge counts on Inbox and Today items. Projects section has a "+" button for creating new projects.

---

### BottomNavBar.tsx

- **Path:** `src/ui/components/BottomNavBar.tsx` (132 lines)
- **Purpose:** Mobile-only bottom navigation bar with Inbox, Today, Search, and Settings buttons, plus a center AI orb button that supports long-press for voice mode.
- **Key Exports:** `BottomNavBar`
- **Props:**
  - `currentView: string`
  - `onNavigate: (view) => void`
  - `onToggleChat?: () => void`
  - `chatOpen?: boolean`
  - `onOpenSettings?: () => void`
  - `onSearch?: () => void`
  - `onStartVoiceCall?: () => void`
- **Key Dependencies:** `lucide-react`, `useIsMobile` (implicit -- rendered only on mobile by parent)
- **Used By:** `App.tsx`
- **Notes:** The center button uses a `setTimeout` for long-press detection (400ms). Short tap toggles AI chat; long press starts voice call. Pulsing animation on the AI orb when chat is open.

---

### MobileDrawer.tsx

- **Path:** `src/ui/components/MobileDrawer.tsx` (55 lines)
- **Purpose:** Slide-in drawer overlay for mobile sidebar navigation. Wraps the Sidebar component.
- **Key Exports:** `MobileDrawer`
- **Props:**
  - `open: boolean`
  - `onClose: () => void`
  - `children: ReactNode`
- **Key Dependencies:** None (pure layout component)
- **Used By:** `App.tsx`
- **Notes:** Slides in from the left with a backdrop overlay. Closes on backdrop click.

---

### CommandPalette.tsx

- **Path:** `src/ui/components/CommandPalette.tsx` (150 lines)
- **Purpose:** Fuzzy search command palette (triggered by Ctrl+K). Filters commands by query, supports keyboard navigation (arrow keys, Enter, Escape).
- **Key Exports:** `CommandPalette`
- **Props:**
  - `commands: { id, label, icon?, action }[]`
  - `open: boolean`
  - `onClose: () => void`
- **Key Dependencies:** `lucide-react` (Search icon)
- **Used By:** `App.tsx`
- **Notes:** Case-insensitive fuzzy matching on command labels. Auto-focuses input on open. Closes on Escape or backdrop click. Each command can optionally have an icon string.

---

### SearchModal.tsx

- **Path:** `src/ui/components/SearchModal.tsx` (248 lines)
- **Purpose:** Global task search modal. Searches task titles, descriptions, and tag names. Shows results grouped with keyboard navigation.
- **Key Exports:** `SearchModal`
- **Props:**
  - `open: boolean`
  - `onClose: () => void`
  - `onNavigateToTask: (taskId) => void`
  - `tasks: Task[]`
  - `projects: Project[]`
- **Key Dependencies:** `lucide-react` (Search, X icons)
- **Used By:** `App.tsx`
- **Notes:** Debounced search (150ms). Highlights matching text in results. Keyboard navigation with arrow keys and Enter to select. Closes on Escape.

---

## AI Components

### AIChatPanel.tsx

- **Path:** `src/ui/components/AIChatPanel.tsx` (817 lines)
- **Purpose:** AI chat sidebar panel with SSE streaming, markdown rendering, voice input (push-to-talk + VAD), voice call mode, tool call badges, and inline `ChatTaskCard` display.
- **Key Exports:** `AIChatPanel`
- **Props:**
  - `onClose: () => void`
  - `onNavigateToTask?: (taskId) => void`
  - `onRefreshTasks?: () => void`
- **Key Dependencies:** `react-markdown`, `remark-gfm`, `AIContext`, `VoiceContext`, `ChatTaskCard.tsx`, `VoiceCallOverlay.tsx`, `lucide-react`
- **Used By:** `App.tsx`
- **Notes:** Renders as a right-side panel on desktop. Full-screen on mobile. Parses SSE events: `delta` (streaming text), `tool_call` (tool invocations), `tool_result` (task data), `done`, `error`. Messages with tool results containing task JSON render as `ChatTaskCard`. Voice button switches between push-to-talk (hold) and VAD (toggle). Retry button on error messages. Clear chat button in header.

---

### VoiceCallOverlay.tsx

- **Path:** `src/ui/components/VoiceCallOverlay.tsx` (89 lines)
- **Purpose:** Full-screen overlay shown during voice call mode. Displays pulsing audio indicator, current state label (Listening/Processing/Speaking), call duration timer, grace period progress bar, and end call button.
- **Key Exports:** `VoiceCallOverlay`
- **Props:**
  - `state: VoiceCallState`
  - `onEnd: () => void`
  - `durationSeconds: number`
  - `graceProgress?: number` -- 0-100 for grace period countdown
- **Key Dependencies:** `lucide-react` (PhoneOff icon)
- **Used By:** `AIChatPanel.tsx`
- **Notes:** Dark backdrop with centered content. State indicator pulses green when listening, amber when processing, blue when speaking. Duration formatted as MM:SS.

---

### ChatTaskCard.tsx

- **Path:** `src/ui/components/ChatTaskCard.tsx` (57 lines)
- **Purpose:** Compact task card rendered inline within AI chat messages when the AI creates or references a task.
- **Key Exports:** `ChatTaskCard`
- **Props:**
  - `task: { id?, title, status?, priority?, dueDate?, projectId? }`
  - `onNavigate?: (taskId) => void`
- **Key Dependencies:** `lucide-react` (CheckCircle2, Circle, Calendar, Flag)
- **Used By:** `AIChatPanel.tsx`
- **Notes:** Clickable if `onNavigate` is provided and task has an `id`. Shows priority flag, due date, and completion status.

---

## Forms & Modals

### DatePicker.tsx

- **Path:** `src/ui/components/DatePicker.tsx` (217 lines)
- **Purpose:** Calendar date picker with quick-select options (Today, Tomorrow, Next week, No date), optional time input, and optional "Set reminder" shortcut button.
- **Key Exports:** `DatePicker`
- **Props:**
  - `selectedDate?: string` -- ISO date string
  - `selectedTime?: string` -- HH:MM
  - `reminderAt?: string` -- ISO datetime
  - `onSelect: (date, time?) => void`
  - `onClose: () => void`
  - `showTime?: boolean`
  - `onSetReminder?: (iso) => void`
- **Key Dependencies:** None (fully custom calendar rendering)
- **Used By:** `TaskItem.tsx`, `TaskMetadataSidebar.tsx`
- **Notes:** Calendar renders full month grid. Navigation with left/right month arrows. Today highlighted. Week start respects general settings. Positioned absolutely relative to trigger element.

---

### RecurrencePicker.tsx

- **Path:** `src/ui/components/RecurrencePicker.tsx` (131 lines)
- **Purpose:** Recurrence rule picker with preset options (daily, weekly, monthly, weekdays) and a custom "every N days/weeks" editor.
- **Key Exports:** `RecurrencePicker`
- **Props:**
  - `value?: string` -- current recurrence rule string
  - `onChange: (rule: string | undefined) => void`
  - `onClose: () => void`
- **Key Dependencies:** `lucide-react` (Repeat, X icons)
- **Used By:** `TaskMetadataSidebar.tsx`
- **Notes:** Returns rule strings like `"daily"`, `"weekly"`, `"every 3 days"`, `"weekdays"`. "None" option clears recurrence.

---

### TagsInput.tsx

- **Path:** `src/ui/components/TagsInput.tsx` (145 lines)
- **Purpose:** Tag input field with autocomplete suggestions dropdown and colored tag chips.
- **Key Exports:** `TagsInput`
- **Props:**
  - `tags: { id, name, color }[]` -- currently attached tags
  - `allTags: { id, name, color }[]` -- available tags for autocomplete
  - `onChange: (tags) => void`
  - `onClose: () => void`
- **Key Dependencies:** `lucide-react` (X, Tag icons), `hexToRgba` utility
- **Used By:** `TaskMetadataSidebar.tsx`, `BulkActionBar.tsx`
- **Notes:** Creates new tags on Enter if no match found. Autocomplete filters existing tags. Tags shown as colored chips with remove button.

---

### TemplateSelector.tsx

- **Path:** `src/ui/components/TemplateSelector.tsx` (206 lines)
- **Purpose:** Template browser and variable form modal. Lists available templates, and when selected shows a form for any `{{variable}}` placeholders before instantiation.
- **Key Exports:** `TemplateSelector`
- **Props:**
  - `open: boolean`
  - `onClose: () => void`
  - `onSelectTemplate: (templateId, variables?) => void`
  - `templates: TaskTemplate[]`
- **Key Dependencies:** `lucide-react` (FileText, X icons), `core/types.js`
- **Used By:** `App.tsx`
- **Notes:** Extracts variable names from title/description using `{{varName}}` regex. Shows variable input form before confirming. Empty variable list skips the form step.

---

### AddProjectModal.tsx

- **Path:** `src/ui/components/AddProjectModal.tsx` (181 lines)
- **Purpose:** Modal dialog for creating a new project with name, emoji icon, and color picker.
- **Key Exports:** `AddProjectModal`
- **Props:**
  - `open: boolean`
  - `onClose: () => void`
  - `onSubmit: (name, color, icon) => void`
- **Key Dependencies:** `lucide-react` (X, Check icons), `DEFAULT_PROJECT_COLORS` from `config/defaults.js`
- **Used By:** `App.tsx`
- **Notes:** Name has 120 character limit with counter. Emoji input limited to 2 characters. 8 preset colors with check mark on selected. Blue selected by default. Auto-focuses name input on open. Closes on Escape or backdrop click.

---

### PermissionDialog.tsx

- **Path:** `src/ui/components/PermissionDialog.tsx` (83 lines)
- **Purpose:** Plugin permission approval dialog. Shows the list of permissions a plugin requests and lets the user approve or deny.
- **Key Exports:** `PermissionDialog`
- **Props:**
  - `pluginName: string`
  - `permissions: string[]`
  - `onApprove: (permissions: string[]) => void`
  - `onCancel: () => void`
- **Key Dependencies:** `lucide-react` (Shield, X icons)
- **Used By:** `PluginsTab.tsx` (settings)
- **Notes:** Permissions shown as monospace badges. Approve sends the full permission list; there is no partial approval.

---

### ConfirmDialog.tsx

- **Path:** `src/ui/components/ConfirmDialog.tsx` (102 lines)
- **Purpose:** Reusable styled confirmation dialog with "danger" and "default" variants.
- **Key Exports:** `ConfirmDialog`
- **Props:**
  - `open: boolean`
  - `title: string`
  - `message: string`
  - `confirmLabel?: string`
  - `cancelLabel?: string`
  - `variant?: "danger" | "default"`
  - `onConfirm: () => void`
  - `onCancel: () => void`
- **Key Dependencies:** `lucide-react` (AlertTriangle icon for danger variant)
- **Used By:** `App.tsx` (task deletion confirmation when `confirm_delete` setting is enabled)
- **Notes:** Danger variant shows red confirm button and warning icon. Entrance animation with zoom-in effect. Closes on Escape.

---

## UI Chrome

### BulkActionBar.tsx

- **Path:** `src/ui/components/BulkActionBar.tsx` (124 lines)
- **Purpose:** Sticky action bar shown when multiple tasks are selected. Provides Complete, Delete, Move (to project), and Tag bulk operations.
- **Key Exports:** `BulkActionBar`
- **Props:**
  - `selectedCount: number`
  - `onComplete: () => void`
  - `onDelete: () => void`
  - `onMove: (projectId) => void`
  - `onTag: (tagNames) => void`
  - `onClear: () => void`
  - `projects: Project[]`
  - `allTags: { id, name, color }[]`
- **Key Dependencies:** `lucide-react`, dropdown menus for project/tag selection
- **Used By:** `App.tsx`
- **Notes:** Fixed position at bottom of viewport. Shows selected count with "Clear selection" button. Move and Tag open dropdown pickers.

---

### FAB.tsx

- **Path:** `src/ui/components/FAB.tsx` (17 lines)
- **Purpose:** Mobile floating action button for adding tasks.
- **Key Exports:** `FAB`
- **Props:**
  - `onClick: () => void`
- **Key Dependencies:** `lucide-react` (Plus icon)
- **Used By:** `App.tsx` (mobile layout only)
- **Notes:** Fixed position, bottom-right, above the BottomNavBar. Uses accent background color.

---

### FocusMode.tsx

- **Path:** `src/ui/components/FocusMode.tsx` (258 lines)
- **Purpose:** Full-screen single-task focus mode. Shows one task at a time with large display, keyboard shortcuts for completion and navigation.
- **Key Exports:** `FocusMode`
- **Props:**
  - `tasks: Task[]`
  - `onComplete: (id) => void`
  - `onClose: () => void`
  - `onSkip?: () => void`
- **Key Dependencies:** `lucide-react`, `core/types.js`
- **Used By:** `App.tsx`
- **Notes:** Keyboard shortcuts: Space to complete, N for next, P for previous, Escape to exit. Shows progress bar (X of Y tasks). Dark backdrop. Displays task priority, due date, description, and tags.

---

### QueryBar.tsx

- **Path:** `src/ui/components/QueryBar.tsx` (177 lines)
- **Purpose:** Search and filter bar with debounced query parsing and suggestions dropdown.
- **Key Exports:** `QueryBar`
- **Props:**
  - `value: string`
  - `onChange: (query) => void`
  - `placeholder?: string`
  - `suggestions?: string[]`
- **Key Dependencies:** `lucide-react` (Search, X icons)
- **Used By:** `FiltersLabels.tsx`
- **Notes:** 200ms debounced onChange. Suggestions dropdown appears below. Supports filter syntax like `priority:p1`, `tag:work`, `project:inbox`.

---

### RightActionRail.tsx

- **Path:** `src/ui/components/RightActionRail.tsx` (74 lines)
- **Purpose:** Desktop right-side vertical rail with AI chat toggle button and focus mode button.
- **Key Exports:** `RightActionRail`
- **Props:**
  - `onToggleChat?: () => void`
  - `chatOpen?: boolean`
  - `onFocusMode?: () => void`
- **Key Dependencies:** `lucide-react` (MessageSquare, Focus icons)
- **Used By:** `App.tsx` (desktop layout, hidden on mobile)
- **Notes:** Fixed position on the right edge. Buttons stack vertically. Chat button shows active state when panel is open.

---

### StatusBar.tsx

- **Path:** `src/ui/components/StatusBar.tsx` (20 lines)
- **Purpose:** Bottom status bar displaying plugin-registered status bar items.
- **Key Exports:** `StatusBar`
- **Props:**
  - `items: StatusBarItemInfo[]`
- **Key Dependencies:** `api/index.js` (StatusBarItemInfo type)
- **Used By:** `App.tsx`
- **Notes:** Each item shows icon + text. Only visible when plugins register status bar items.

---

### PluginPanel.tsx

- **Path:** `src/ui/components/PluginPanel.tsx` (17 lines)
- **Purpose:** Container for rendering plugin sidebar panel content.
- **Key Exports:** `PluginPanel`
- **Props:**
  - `panel: PanelInfo`
- **Key Dependencies:** `api/index.js` (PanelInfo type)
- **Used By:** `Sidebar.tsx`
- **Notes:** Renders panel icon, title, and content as text. Minimal wrapper component.

---

### Toast.tsx

- **Path:** `src/ui/components/Toast.tsx` (42 lines)
- **Purpose:** Auto-dismissing toast notification with optional action button (used for undo).
- **Key Exports:** `Toast`
- **Props:**
  - `message: string`
  - `action?: { label: string; onClick: () => void }`
  - `onDismiss: () => void`
  - `duration?: number` -- milliseconds (default 4000)
- **Key Dependencies:** None
- **Used By:** `App.tsx` (via UndoContext)
- **Notes:** Auto-dismisses after duration. Entrance animation with slide-up. Action button shown inline (e.g., "Undo" after task completion).

---

### ErrorBoundary.tsx

- **Path:** `src/ui/components/ErrorBoundary.tsx` (57 lines)
- **Purpose:** React class component error boundary. Catches render errors and displays a fallback UI with reset button.
- **Key Exports:** `ErrorBoundary`
- **Props:**
  - `children: ReactNode`
  - `fallback?: ReactNode` -- optional custom fallback
- **Key Dependencies:** None
- **Used By:** `App.tsx` (wraps the entire app)
- **Notes:** Shows error message and stack trace in development. "Try Again" button resets the error state. Class component (required by React error boundary API).
