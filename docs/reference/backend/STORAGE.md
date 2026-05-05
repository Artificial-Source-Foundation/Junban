# Storage Abstraction

The `src/storage/` directory implements Junban's dual-backend storage architecture. Both SQLite and Markdown backends implement the same `IStorage` interface, allowing the app to swap backends without changing any business logic.

## Files

| File                    | Purpose                                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| `interface.ts`          | `IStorage` interface + row types (`TaskRow`, `ProjectRow`, `TagRow`, etc.)  |
| `sqlite-backend.ts`     | Browser-safe SQLite implementation wrapping Drizzle ORM queries             |
| `sqlite-backend-node.ts` | Node-only SQLite transaction context wrapper                                |
| `markdown-backend.ts`   | Markdown backend orchestrator with in-memory indexes                        |
| `markdown/*.ts`         | Markdown backend task/project/metadata/persistence modules                  |
| `markdown-utils.ts`     | YAML parsing/formatting helpers for the Markdown backend                    |
| `encrypted-settings.ts` | Encrypted settings wrapper for sensitive values such as API keys and tokens |

## IStorage Interface

Defined in `interface.ts`. CRUD/query methods are synchronous (both backends return values directly). The `transaction()` helper is async so higher-level import/completion flows can keep a SQLite transaction open across service calls; `afterTransactionCommit()` lets services defer side effects until the outermost transaction commits. Callers must check `supportsTransactionalRollback` before treating a backend as durable rollback support.

### Row Types

| Type                | Key Fields                                                                                                                                                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `TaskRow`           | id, title, description, status (`"pending"` / `"completed"` / `"cancelled"`), priority, dueDate, dueTime, completedAt, projectId, parentId, sectionId, recurrence, remindAt, deadline, isSomeday, estimatedMinutes, actualMinutes, dreadLevel, sortOrder, createdAt, updatedAt |
| `ProjectRow`        | id, name, color, icon, parentId, isFavorite, viewStyle (`"list"` / `"board"` / `"calendar"`), sortOrder, archived                                                                                                                                                              |
| `TagRow`            | id, name, color                                                                                                                                                                                                                                                                |
| `SectionRow`        | id, projectId, name, sortOrder, isCollapsed                                                                                                                                                                                                                                    |
| `TaskCommentRow`    | id, taskId, content                                                                                                                                                                                                                                                            |
| `TaskActivityRow`   | id, taskId, action, field, oldValue, newValue                                                                                                                                                                                                                                  |
| `TaskRelationRow`   | taskId, relatedTaskId, type (`"blocks"`)                                                                                                                                                                                                                                       |
| `DailyStatRow`      | id, date, tasksCompleted, tasksCreated, minutesTracked, streak                                                                                                                                                                                                                 |
| `TemplateRow`       | id, name, title, description, priority, tags, projectId, recurrence                                                                                                                                                                                                            |
| `ChatMessageRow`    | sessionId, role, content, toolCallId, toolCalls                                                                                                                                                                                                                                |
| `ChatSessionInfo`   | sessionId, title, createdAt, messageCount                                                                                                                                                                                                                                      |
| `PluginSettingsRow` | pluginId, settings (JSON string)                                                                                                                                                                                                                                               |
| `AppSettingRow`     | key, value                                                                                                                                                                                                                                                                     |
| `AiMemoryRow`       | id, content, category (`"preference" \| "habit" \| "context" \| "instruction" \| "pattern"`)                                                                                                                                                                                   |
| `MutationResult`    | changes (affected row count)                                                                                                                                                                                                                                                   |

### Method Groups

| Group              | Methods                                                                                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transactions       | `supportsTransactionalRollback`, `transaction`, `afterTransactionCommit`                                                                                                    |
| Tasks              | `listTasks`, `listTasksByParent`, `getTask`, `insertTask`, `insertTaskWithId`, `updateTask`, `deleteTask`, `deleteManyTasks`, `updateManyTasks`, `listTasksDueForReminder` |
| Task-Tag Relations | `getTaskTags`, `getTaskTagsByTaskIds`, `listAllTaskTags`, `insertTaskTag`, `deleteTaskTags`, `deleteManyTaskTags`                                                          |
| Projects           | `listProjects`, `getProject`, `getProjectByName`, `insertProject`, `updateProject`, `deleteProject`                                                                        |
| Tags               | `listTags`, `getTagByName`, `insertTag`, `deleteTag`                                                                                                                       |
| Sections           | `listSections`, `getSection`, `insertSection`, `updateSection`, `deleteSection`                                                                                            |
| Task Comments      | `listTaskComments`, `insertTaskComment`, `updateTaskComment`, `deleteTaskComment`                                                                                          |
| Task Activity      | `listTaskActivity`, `insertTaskActivity`                                                                                                                                   |
| Task Relations     | `listTaskRelations`, `getTaskRelations`, `insertTaskRelation`, `deleteTaskRelation`, `deleteAllTaskRelations`                                                              |
| Daily Stats        | `getDailyStat`, `upsertDailyStat`, `listDailyStats`                                                                                                                        |
| Templates          | `listTemplates`, `getTemplate`, `insertTemplate`, `updateTemplate`, `deleteTemplate`                                                                                       |
| Chat               | `listChatMessages`, `insertChatMessage`, `deleteChatSession`, `getLatestSessionId`, `listChatSessions`, `renameChatSession`                                                |
| Plugin Settings    | `loadPluginSettings`, `savePluginSettings`                                                                                                                                 |
| Plugin Permissions | `getPluginPermissions`, `setPluginPermissions`, `deletePluginPermissions`                                                                                                  |
| App Settings       | `getAppSetting`, `listAllAppSettings`, `setAppSetting`, `deleteAppSetting`                                                                                                 |
| AI Memories        | `listAiMemories`, `insertAiMemory`, `updateAiMemory`, `deleteAiMemory`                                                                                                     |

## SQLite Backend

`sqlite-backend.ts` wraps the `createQueries()` function from `src/db/queries.ts`. Each IStorage method maps directly to a Drizzle query. This is the default backend and handles all complex filtering via SQL. `supportsTransactionalRollback` is `true`; task create/update with tags, task completion cascades/recurrence and `completeMany`, bulk task updates/deletes, project/section cleanup, reorder operations, and import execution use SQLite transactions where the current service architecture allows it. Independent top-level SQLite transactions are serialized so overlapping async callers cannot accidentally share one rollback/commit boundary; nested calls from the same logical transaction reuse the active transaction. The browser/Tauri sql.js path uses the shared browser-safe backend, while Node startup uses `sqlite-backend-node.ts` for the Node-only async transaction context. Task create/complete events queued during a transaction are emitted only after the outermost SQLite commit and are discarded on rollback.

Recent performance-oriented additions:

- `listTasksByParent(parentId)` supports targeted child-task lookup without full task scans.
- `getTaskTagsByTaskIds(taskIds)` supports batched tag hydration for reminder and child-task flows.
- Hot-path indexes cover task status/project/section/parent/reminder lookups, task-tag reverse lookup, and chat message/session ordering.
- Task and section lists use stable sort-order/created/id ordering; chat messages are read in insertion order and chat sessions are sorted by latest activity.

## Markdown Backend

`markdown-backend.ts` stores data as `.md` files with YAML frontmatter in a directory tree:

```
<basePath>/
├── inbox/
│   └── <slug>-<idSuffix>.md
├── projects/
│   └── <project-slug>/
│       ├── _project.yaml
│       └── <slug>-<idSuffix>.md
├── _tags.yaml
├── _settings.yaml
├── _templates.yaml
├── _sections.yaml
├── _daily_stats.yaml
├── _task_relations.yaml
├── _ai_memories.json
├── _task_meta/
│   └── <taskId>.yaml
├── _plugins/
│   ├── <pluginId>.yaml
│   └── permissions.yaml
└── _chat/
    └── <sessionId>.yaml
```

Key design decisions:

- In-memory indexes for reads, disk writes on mutations
- YAML frontmatter keys sorted alphabetically for git-friendly diffs
- Uses the `yaml` package (not `js-yaml`) for parsing
- `markdown-utils.ts` handles YAML ↔ object conversion
- Task move/rename writes are fail-safe: the new file is written first, and the old file is removed only after a successful write
- Metadata and YAML/JSON sidecar writes use a temp-file-and-rename helper where practical, and empty task metadata files are removed when comments/activity are cleared
- V1 cascade parity covers task delete (children, tags, relations, comments/activity metadata), tag delete (task frontmatter/tag links), project delete/move-to-inbox (task project/section clearing, child-project promotion, section cleanup), and section delete/clear
- Task/tag lookup helpers mirror the SQLite targeted-query surface so core services can keep the same optimized code paths across both backends
- Markdown `transaction()` is operation-scoped only and `supportsTransactionalRollback` is `false`; it does not provide SQLite-equivalent transactional recovery across multiple files. Use filesystem backups or version control for recovery before large Markdown imports or bulk edits.

## Backend Selection

`src/bootstrap.ts` selects the backend based on the `STORAGE_MODE` environment variable:

| Value                | Backend         | Notes                                  |
| -------------------- | --------------- | -------------------------------------- |
| `"sqlite"` (default) | SQLiteBackend   | Faster queries, structured data        |
| `"markdown"`         | MarkdownBackend | Human-readable, git-friendly, portable |

`src/bootstrap-web.ts` always uses SQLite (no filesystem access in browser via sql.js WASM).

## Related

- [DATABASE.md](DATABASE.md) — Drizzle schema, tables, migrations
- [CORE.md](CORE.md) — Services that consume IStorage (TaskService, ProjectService, TagService)
