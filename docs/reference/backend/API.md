# Backend API Reference

This page covers `src/api/` as the canonical transport layer for Junban's server-facing routes.

Boundary note: keep high-level runtime/startup wiring in [`../../guides/ARCHITECTURE.md`](../../guides/ARCHITECTURE.md). Keep frontend request helpers in [`../frontend/API_LAYER.md`](../frontend/API_LAYER.md).

## What Lives Here

The backend API layer defines route modules, request/response handling, and transport-facing boundaries for:

- tasks, tags, projects, sections, comments, templates, and stats
- AI and voice endpoints
- plugin and settings endpoints

## Canonical Source Files

| File                   | Responsibility                                                      |
| ---------------------- | ------------------------------------------------------------------- |
| `src/api/tasks.ts`     | Task CRUD, bulk operations, hierarchy, reminders, and import routes |
| `src/api/projects.ts`  | Project CRUD and project-level route behavior                       |
| `src/api/tags.ts`      | Tag management endpoints                                            |
| `src/api/sections.ts`  | Section CRUD endpoints                                              |
| `src/api/comments.ts`  | Task-comment endpoints                                              |
| `src/api/templates.ts` | Template CRUD endpoints                                             |
| `src/api/stats.ts`     | Statistics and reporting endpoints                                  |
| `src/api/settings.ts`  | App-setting endpoints                                               |
| `src/api/ai.ts`        | AI transport endpoints and chat/config flows                        |
| `src/api/voice.ts`     | Voice/STT/TTS transport endpoints                                   |
| `src/api/plugins.ts`   | Plugin runtime / plugin-management transport endpoints              |

## Responsibilities

- Validate request shape at the route boundary
- Translate transport requests into core-service operations
- Keep HTTP / route semantics separate from frontend client helpers
- Preserve compatibility expectations for request and response behavior

## Server-level Guardrails

- `src/server.ts` binds the standalone Hono API to `127.0.0.1` by default. Non-loopback `API_HOST` values require `JUNBAN_ALLOW_UNSAFE_API_HOST=true`.
- Global request bodies are limited to 10 MB; `/api/voice/transcribe` uses 25 MB for audio uploads.
- `/api/health` returns Junban identity fields plus readiness fields: `{ ok, ready, degraded, service, runtime }`.
- `/api/test-reset` exists only in test/E2E mode and is restricted to loopback callers or `x-junban-test-reset-token` matching `JUNBAN_TEST_RESET_TOKEN`.
- `/api/ai/config` rejects unsafe `baseUrl` values before persistence, and AI model/chat execution paths revalidate persisted values before use.

## Task Import/Transfer Scope

- `POST /api/tasks/import` imports flat task transfer data, including core task fields such as reminders, estimates, actual time, deadlines, someday flags, and dread level when present in Junban JSON. Referenced projects and tags are restored by name only. On SQLite-backed services it uses the storage transaction hook so a failed import rolls back as one unit; non-transactional backends fall back to best-effort cleanup of tasks/projects created during that import run.
- Project hierarchy/status/favorites/view settings, tag colors, settings, plugin data, AI chat history/memories, comments/activity, task relations, section layout, templates, stats, and database recovery metadata are not part of the current import/export transfer format.

## Related Docs

- [`../../guides/ARCHITECTURE.md`](../../guides/ARCHITECTURE.md)
- [`CORE.md`](CORE.md)
- [`AI.md`](AI.md)
- [`VOICE.md`](VOICE.md)
- [`PLUGINS.md`](PLUGINS.md)
- [`../frontend/API_LAYER.md`](../frontend/API_LAYER.md)
