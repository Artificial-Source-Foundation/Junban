# Master File Index

Complete index of every non-UI source file in `src/`. Sorted by directory, then filename.

| File | Path | Lines | Purpose |
|------|------|------:|---------|
| `anthropic.ts` | `src/ai/provider/adapters/anthropic.ts` | 192 | Anthropic provider adapter using the native Anthropic SDK |
| `lmstudio.ts` | `src/ai/provider/adapters/lmstudio.ts` | 141 | LM Studio provider with native API discovery and model loading/unloading |
| `ollama.ts` | `src/ai/provider/adapters/ollama.ts` | 47 | Ollama provider with native /api/tags model discovery |
| `openai-compat.ts` | `src/ai/provider/adapters/openai-compat.ts` | 260 | Shared base for OpenAI-compatible providers (OpenAI, OpenRouter, Ollama, LM Studio) |
| `openai.ts` | `src/ai/provider/adapters/openai.ts` | 14 | OpenAI provider (thin config over openai-compat) |
| `openrouter.ts` | `src/ai/provider/adapters/openrouter.ts` | 18 | OpenRouter provider (thin config over openai-compat with custom headers) |
| `interface.ts` | `src/ai/provider/interface.ts` | 48 | LLMProviderPlugin and LLMExecutor interfaces |
| `registry.ts` | `src/ai/provider/registry.ts` | 108 | LLMProviderRegistry -- manages provider plugin registration, executor creation, model discovery |
| `capabilities.ts` | `src/ai/core/capabilities.ts` | 27 | LLMCapabilities and ModelDescriptor interfaces, default capabilities |
| `context.ts` | `src/ai/core/context.ts` | 21 | LLMExecutionContext and PipelineResult types for the middleware pipeline |
| `middleware.ts` | `src/ai/core/middleware.ts` | 65 | Built-in middleware: capability guard, timeout wrapper, logging |
| `pipeline.ts` | `src/ai/core/pipeline.ts` | 33 | Composable middleware pipeline for LLM execution |
| `analyze-patterns.ts` | `src/ai/tools/builtin/analyze-patterns.ts` | 153 | analyze_completion_patterns tool -- productivity pattern mining |
| `analyze-workload.ts` | `src/ai/tools/builtin/analyze-workload.ts` | 248 | analyze_workload and check_overcommitment tools |
| `energy-recommendations.ts` | `src/ai/tools/builtin/energy-recommendations.ts` | 144 | get_energy_recommendations tool -- energy-aware task planning |
| `project-crud.ts` | `src/ai/tools/builtin/project-crud.ts` | 206 | Project CRUD tools: create, list, get, update, delete |
| `query-tasks.ts` | `src/ai/tools/builtin/query-tasks.ts` | 92 | query_tasks tool -- flexible task search/filter with TaskFilter |
| `reminder-tools.ts` | `src/ai/tools/builtin/reminder-tools.ts` | 195 | Reminder tools: list, set, snooze, dismiss |
| `smart-organize.ts` | `src/ai/tools/builtin/smart-organize.ts` | 395 | suggest_tags, find_similar_tasks, and check_duplicates tools |
| `tag-crud.ts` | `src/ai/tools/builtin/tag-crud.ts` | 120 | Tag tools: list_tags, add_tags_to_task, remove_tags_from_task |
| `task-breakdown.ts` | `src/ai/tools/builtin/task-breakdown.ts` | 80 | break_down_task tool -- creates subtasks under a parent |
| `task-crud.ts` | `src/ai/tools/builtin/task-crud.ts` | 196 | Task CRUD tools: create, update, complete, delete |
| `registry.ts` | `src/ai/tools/registry.ts` | 67 | ToolRegistry -- extensible registry for built-in and plugin tools |
| `types.ts` | `src/ai/tools/types.ts` | 32 | ToolDefinition, ToolContext, ToolExecutor, RegisteredTool types |
| `browser-stt.ts` | `src/ai/voice/adapters/browser-stt.ts` | 90 | Browser Web Speech API STT adapter |
| `browser-tts.ts` | `src/ai/voice/adapters/browser-tts.ts` | 71 | Browser SpeechSynthesis TTS adapter |
| `groq-stt.ts` | `src/ai/voice/adapters/groq-stt.ts` | 47 | Groq Whisper STT adapter |
| `groq-tts.ts` | `src/ai/voice/adapters/groq-tts.ts` | 75 | Groq TTS adapter |
| `inworld-tts.ts` | `src/ai/voice/adapters/inworld-tts.ts` | 76 | Inworld TTS adapter |
| `kokoro-local-tts.ts` | `src/ai/voice/adapters/kokoro-local-tts.ts` | 268 | Kokoro local TTS adapter (WebAssembly-based) |
| `piper-local-tts.ts` | `src/ai/voice/adapters/piper-local-tts.ts` | 145 | Piper local TTS adapter |
| `whisper-local-stt.ts` | `src/ai/voice/adapters/whisper-local-stt.ts` | 173 | Whisper local STT adapter (transformers.js) |
| `kokoro-worker-types.ts` | `src/ai/voice/workers/kokoro-worker-types.ts` | 14 | Type definitions for the Kokoro Web Worker |
| `kokoro.worker.ts` | `src/ai/voice/workers/kokoro.worker.ts` | 61 | Web Worker for Kokoro TTS model execution |
| `audio-utils.ts` | `src/ai/voice/audio-utils.ts` | 192 | WAV conversion, MediaRecorder wrapper, mic enumeration, audio playback |
| `interface.ts` | `src/ai/voice/interface.ts` | 70 | STTProviderPlugin and TTSProviderPlugin interfaces |
| `provider.ts` | `src/ai/voice/provider.ts` | 44 | Voice provider factory -- creates VoiceProviderRegistry with defaults |
| `registry.ts` | `src/ai/voice/registry.ts` | 62 | VoiceProviderRegistry for STT/TTS providers |
| `chat.ts` | `src/ai/chat.ts` | 569 | ChatSession (message loop, tool execution, streaming) and ChatManager (session lifecycle, context gathering) |
| `errors.ts` | `src/ai/errors.ts` | 109 | AIError class and classifyProviderError -- categorizes provider errors (auth, rate_limit, network, etc.) |
| `model-discovery.ts` | `src/ai/model-discovery.ts` | 75 | Model discovery shim -- delegates to provider registry for backward compatibility |
| `provider.ts` | `src/ai/provider.ts` | 62 | Factory functions: createDefaultRegistry (5 LLM providers) and createDefaultToolRegistry (all built-in tools) |
| `types.ts` | `src/ai/types.ts` | 61 | Shared AI types: ChatMessage, ToolCall, ChatResponse, StreamEvent, LLMRequest, LLMResponse |
| `index.ts` | `src/cli/index.ts` | 62 | CLI entry point -- Commander.js command registration |
| `add.ts` | `src/cli/commands/add.ts` | 39 | CLI `add` command handler |
| `delete.ts` | `src/cli/commands/delete.ts` | 21 | CLI `delete` command handler |
| `done.ts` | `src/cli/commands/done.ts` | 24 | CLI `done` command handler |
| `edit.ts` | `src/cli/commands/edit.ts` | 52 | CLI `edit` command handler |
| `list.ts` | `src/cli/commands/list.ts` | 71 | CLI `list` command handler |
| `formatter.ts` | `src/cli/formatter.ts` | 27 | Terminal output formatting for parsed tasks |
| `defaults.ts` | `src/config/defaults.ts` | 25 | Priority definitions, status list, color palette, UI constants |
| `env.ts` | `src/config/env.ts` | 25 | Zod-validated environment variable loading |
| `themes.ts` | `src/config/themes.ts` | 13 | Built-in theme definitions (Light, Dark, Nord) |
| `actions.ts` | `src/core/actions.ts` | 148 | UndoableAction factory functions for task mutations |
| `errors.ts` | `src/core/errors.ts` | 21 | Custom error classes: NotFoundError, ValidationError, StorageError |
| `event-bus.ts` | `src/core/event-bus.ts` | 66 | Typed pub/sub event bus for task lifecycle events |
| `export.ts` | `src/core/export.ts` | 74 | Data export: JSON, CSV, Markdown formats |
| `filters.ts` | `src/core/filters.ts` | 30 | TaskFilter interface and in-memory filtering |
| `import.ts` | `src/core/import.ts` | 316 | Data import: Saydo JSON, Todoist JSON, Markdown/text formats |
| `priorities.ts` | `src/core/priorities.ts` | 22 | Priority metadata lookup and task sorting |
| `projects.ts` | `src/core/projects.ts` | 68 | ProjectService -- project CRUD |
| `query-parser.ts` | `src/core/query-parser.ts` | 170 | Natural language query to TaskFilter parser |
| `recurrence.ts` | `src/core/recurrence.ts` | 45 | Recurring task next-occurrence calculator |
| `tags.ts` | `src/core/tags.ts` | 43 | TagService -- tag CRUD |
| `tasks.ts` | `src/core/tasks.ts` | 434 | TaskService -- task CRUD, subtasks, batch ops, recurrence |
| `templates.ts` | `src/core/templates.ts` | 132 | TemplateService -- task template CRUD with variable substitution |
| `types.ts` | `src/core/types.ts` | 88 | Core type definitions and Zod schemas (Task, Project, Tag, Template) |
| `undo.ts` | `src/core/undo.ts` | 67 | UndoManager -- command pattern undo/redo with 50-deep stack |
| `client.ts` | `src/db/client.ts` | 20 | better-sqlite3 database connection (Node.js) |
| `client-web.ts` | `src/db/client-web.ts` | 18 | sql.js database connection (browser/WebAssembly) |
| `migrate.ts` | `src/db/migrate.ts` | 25 | Drizzle ORM migration runner (Node.js) |
| `migrate-web.ts` | `src/db/migrate-web.ts` | 16 | Raw SQL migration runner (browser) |
| `persistence.ts` | `src/db/persistence.ts` | 23 | Tauri AppData file persistence for sql.js database |
| `queries.ts` | `src/db/queries.ts` | 203 | Drizzle query factory for all entity CRUD operations |
| `schema.ts` | `src/db/schema.ts` | 86 | Drizzle ORM table definitions (7 tables) |
| `grammar.ts` | `src/parser/grammar.ts` | 74 | Regex extraction rules: priority, tags, project, recurrence |
| `nlp.ts` | `src/parser/nlp.ts` | 50 | chrono-node date/time extraction and cleanup |
| `task-parser.ts` | `src/parser/task-parser.ts` | 57 | Main task parser orchestrator |
| `api.ts` | `src/plugins/api.ts` | 166 | Plugin API surface -- permission-gated access to tasks, commands, UI, events, storage, AI |
| `command-registry.ts` | `src/plugins/command-registry.ts` | 50 | Plugin command registry |
| `installer.ts` | `src/plugins/installer.ts` | 133 | Plugin installer -- download, extract, validate tar.gz archives |
| `lifecycle.ts` | `src/plugins/lifecycle.ts` | 25 | Plugin abstract base class with lifecycle hooks |
| `loader.ts` | `src/plugins/loader.ts` | 382 | Plugin loader -- discovery, validation, loading, permission management |
| `registry.ts` | `src/plugins/registry.ts` | 72 | Community plugin registry client (local + remote) |
| `sandbox.ts` | `src/plugins/sandbox.ts` | 22 | Plugin sandbox placeholder (permission checks in API, full isolation deferred) |
| `settings.ts` | `src/plugins/settings.ts` | 74 | Per-plugin settings manager with DB persistence and caching |
| `types.ts` | `src/plugins/types.ts` | 72 | Plugin manifest Zod schema, setting definitions, permission list |
| `ui-registry.ts` | `src/plugins/ui-registry.ts` | 94 | Plugin UI registry -- panels, views, status bar items |
| `interface.ts` | `src/storage/interface.ts` | 146 | IStorage interface and all row types |
| `markdown-backend.ts` | `src/storage/markdown-backend.ts` | 791 | Markdown storage backend (files + in-memory indexes) |
| `markdown-utils.ts` | `src/storage/markdown-utils.ts` | 167 | YAML frontmatter, slugify, task file parse/serialize |
| `sqlite-backend.ts` | `src/storage/sqlite-backend.ts` | 209 | SQLite storage backend (wraps Drizzle queries) |
| `color.ts` | `src/utils/color.ts` | 27 | Hex to rgba conversion |
| `dates.ts` | `src/utils/dates.ts` | 33 | Date utility functions (isToday, isOverdue, todayStart/End) |
| `format-date.ts` | `src/utils/format-date.ts` | 65 | Advanced date/time formatting (relative, short, long, ISO, 12h/24h) |
| `ids.ts` | `src/utils/ids.ts` | 12 | 21-char URL-safe ID generator |
| `logger.ts` | `src/utils/logger.ts` | 49 | Structured JSON logger with module scope |
| `sounds.ts` | `src/utils/sounds.ts` | 86 | Web Audio API procedural sound effects |
| `tauri.ts` | `src/utils/tauri.ts` | 6 | Tauri WebView detection |
| `bootstrap.ts` | `src/bootstrap.ts` | 113 | Node.js application bootstrap -- initializes storage, services, plugins |
| `bootstrap-web.ts` | `src/bootstrap-web.ts` | 101 | Browser/Tauri application bootstrap with auto-save and debounce |
| `main.ts` | `src/main.ts` | 26 | Entry point -- loads env, bootstraps services, loads plugins |
| `vite-env.d.ts` | `src/vite-env.d.ts` | 6 | Vite type declarations for SQL raw imports |

**Total non-UI source files:** 85
**Total non-UI lines of code:** 10,748
