# Sprint 3 — "Plugins: Foundation"

**Goal**: Plugin loader works. Plugins can be discovered, validated, loaded, and unloaded. The event bus dispatches task lifecycle hooks. The example plugin actually runs.

| ID | Item | Status |
|----|------|--------|
| PL-16 | Event bus for task lifecycle hooks | done |
| PL-04 | Plugin loader (discover + validate manifests) | done |
| PL-05 | Plugin lifecycle (load/unload, call onLoad/onUnload) | done |
| PL-06 | Plugin sandbox (restricted execution context) | done |
| PL-07 | Plugin API surface (task read/write, events) | done |
| PL-17 | Plugin-specific isolated storage (persist to DB) | done |
| T-10 | Plugin loader integration tests | done |

**Result**: Full plugin system with loader, sandbox, lifecycle management, event bus, and per-plugin storage. 275 passing tests.
