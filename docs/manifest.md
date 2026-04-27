# Documentation Manifest

This manifest inventories the public-facing documentation surface that currently exists in this repository.

The repository already treats [`README.md`](README.md) as the documentation ownership map and [`reference/README.md`](reference/README.md) as the technical reference index. This file is an inventory, not a second governance document.

## Public Diataxis Surface

| Page | Type | Why it exists |
| --- | --- | --- |
| [`index.md`](index.md) | Index | Public entry point for readers who need to choose between tutorials, how-to guides, explanation, and reference |
| [`tutorials/README.md`](tutorials/README.md) | Tutorials index | Groups learning-oriented walkthroughs in recommended order |
| [`tutorials/first-run.md`](tutorials/first-run.md) | Tutorial | Gets a new user from clone to a working local app and a first task |
| [`tutorials/your-first-plugin.md`](tutorials/your-first-plugin.md) | Tutorial | Walks through the real plugin scaffolding flow supported by `pnpm plugin:create` |
| [`how-to/README.md`](how-to/README.md) | How-to index | Groups task-oriented operational guides |
| [`how-to/install.md`](how-to/install.md) | How-to | Fast install path for contributors and source users |
| [`how-to/configure.md`](how-to/configure.md) | How-to | Documents real configuration tasks from `.env.example` and `src/config/env.ts` |
| [`how-to/run-locally.md`](how-to/run-locally.md) | How-to | Covers local dev modes from `package.json` and `src/server.ts` |
| [`how-to/remote-access.md`](how-to/remote-access.md) | How-to | Documents the packaged-desktop trusted-network remote-access workflow |
| [`how-to/use-cli.md`](how-to/use-cli.md) | How-to | Covers CLI usage from `src/cli/index.ts` and the backend CLI reference |
| [`how-to/connect-claude-desktop.md`](how-to/connect-claude-desktop.md) | How-to | Documents the MCP setup path shown in the setup guide |
| [`how-to/test.md`](how-to/test.md) | How-to | Maps real test commands and test layers present in the repo |
| [`explanation/README.md`](explanation/README.md) | Explanation index | Routes readers into conceptual docs |
| [`explanation/architecture.md`](explanation/architecture.md) | Explanation | Explains the shared-core architecture and runtime boundaries |
| [`explanation/storage-model.md`](explanation/storage-model.md) | Explanation | Explains the SQLite and Markdown persistence tradeoffs |
| [`explanation/plugin-system.md`](explanation/plugin-system.md) | Explanation | Explains plugin loading, permission approval, and sandbox boundaries |
| [`explanation/ai-and-mcp.md`](explanation/ai-and-mcp.md) | Explanation | Explains how AI tools and the MCP server reuse the same service layer |
| [`reference/README.md`](reference/README.md) | Reference index | Canonical technical reference library |

## Technical Reference Inventory

The reference library is public and canonical for implementation details. It is listed separately from the Diataxis routing surface so this manifest can stay useful without duplicating the ownership rules in [`README.md`](README.md).

### Frontend Reference

| Page | Why it exists |
| --- | --- |
| [`reference/frontend/API_LAYER.md`](reference/frontend/API_LAYER.md) | Frontend API/direct-service access patterns |
| [`reference/frontend/COMPONENTS.md`](reference/frontend/COMPONENTS.md) | React component responsibilities and integration points |
| [`reference/frontend/CONTEXT.md`](reference/frontend/CONTEXT.md) | Context-provider ownership and state boundaries |
| [`reference/frontend/HOOKS.md`](reference/frontend/HOOKS.md) | Custom hook responsibilities and integration points |
| [`reference/frontend/SHORTCUTS.md`](reference/frontend/SHORTCUTS.md) | Keyboard shortcut map and customization behavior |
| [`reference/frontend/THEMES.md`](reference/frontend/THEMES.md) | Theme tokens, CSS variables, and theme loading |
| [`reference/frontend/VIEWS.md`](reference/frontend/VIEWS.md) | Screen-level view composition and routing |

### Backend Reference

| Page | Why it exists |
| --- | --- |
| [`reference/backend/AI.md`](reference/backend/AI.md) | AI chat, providers, tools, and runtime integration |
| [`reference/backend/API.md`](reference/backend/API.md) | Hono route modules and HTTP API surface |
| [`reference/backend/CLI.md`](reference/backend/CLI.md) | Commander CLI commands and behavior |
| [`reference/backend/CONFIG.md`](reference/backend/CONFIG.md) | Environment and runtime configuration reference |
| [`reference/backend/CORE.md`](reference/backend/CORE.md) | Domain services, types, and core logic |
| [`reference/backend/DATABASE.md`](reference/backend/DATABASE.md) | Drizzle schema, migrations, and SQLite persistence |
| [`reference/backend/MCP.md`](reference/backend/MCP.md) | MCP server bridge, tools, resources, and prompts |
| [`reference/backend/PARSER.md`](reference/backend/PARSER.md) | Natural-language task parsing syntax and pipeline |
| [`reference/backend/PLUGINS.md`](reference/backend/PLUGINS.md) | Plugin runtime internals, policies, and cleanup |
| [`reference/backend/STORAGE.md`](reference/backend/STORAGE.md) | Storage interface and backend implementations |
| [`reference/backend/UTILS.md`](reference/backend/UTILS.md) | Shared utility modules |
| [`reference/backend/VOICE.md`](reference/backend/VOICE.md) | STT/TTS providers, voice registry, and audio utilities |

### Plugin Author Reference

| Page | Why it exists |
| --- | --- |
| [`reference/plugins/README.md`](reference/plugins/README.md) | Plugin-author onboarding and routing |
| [`reference/plugins/API.md`](reference/plugins/API.md) | Public plugin API contract |
| [`reference/plugins/EXAMPLES.md`](reference/plugins/EXAMPLES.md) | Plugin examples and authoring patterns |

## Canonical Sources

| Canonical area | Purpose |
| --- | --- |
| [`README.md`](README.md) | Documentation ownership map and maintenance policy |
| [`reference/README.md`](reference/README.md) | Technical reference routing |
| [`guides/`](guides/) | Contributor and maintainer workflows |
| [`product/README.md`](product/README.md) | Product-facing mission, roadmap, and status |

## Scope Notes

- Public Diataxis pages may link to `docs/guides/`, `docs/reference/`, and selected `docs/product/` pages.
- Public Diataxis pages should describe stable user and developer workflows, not sprint plans or private backlog detail.
- Reference details remain authoritative in `docs/reference/`; Diataxis pages summarize and route.
- If a workflow appears incomplete or explicitly marked future-facing in the repository, it should be omitted or described as tentative.

## Planned Content Expansion

The remaining major public-facing gap after this pass is mostly additional conceptual coverage, not basic navigation or workflow docs. The deepest technical details continue to live in the canonical reference library under `docs/reference/`.

## Legacy Compatibility Paths

The repository still ships legacy compatibility aliases for the historical frontend, backend, plugins, and planning documentation surfaces. Their lifecycle is governed by [`guides/LEGACY_COMPATIBILITY_POLICY.md`](guides/LEGACY_COMPATIBILITY_POLICY.md).

## See Also

- Public docs entry: [`index.md`](index.md)
- Technical reference: [`reference/README.md`](reference/README.md)
- Contributor docs index: [`README.md`](README.md)
