# Run tests for Junban

This page is a task-focused guide for running validation checks after code or configuration changes.

## Fast path commands

Use these scripts from the repo root:

```bash
pnpm test             # Vitest (unit + ui + plugin-ui projects)
pnpm test:watch       # Watch mode for Vitest
pnpm test:coverage    # Vitest with coverage
pnpm test:e2e         # Playwright browser tests
pnpm test:perf        # Playwright performance spec
pnpm docs:check       # Documentation links, ownership targets, and legacy-path policy
pnpm build            # Typecheck + CLI build + Vite production build
pnpm check            # lint + format:check + typecheck + coverage-gated Vitest
```

## What each test stack checks

- **Vitest (`pnpm test`)** reads `vitest.config.ts` and runs three projects:
  - `unit` (`tests/**/*.test.ts`, `tests/**/*.test.tsx` excluding ui-focused test trees)
  - `ui` (`tests/ui/**/*.test.ts`, `tests/ui/**/*.test.tsx`)
  - `plugin-ui` (`tests/**/components/**/*.test.tsx`)
- **Playwright (`pnpm test:e2e`)** runs tests from `tests/e2e` using `playwright.config.ts`.
- **Performance (`pnpm test:perf`)** is a specific Playwright spec for performance (`tests/e2e/performance.spec.ts`).
- **`pnpm check`** includes the repository validation set from `package.json` (`lint`, `format:check`, `typecheck`, `test:coverage`).
- **Coverage thresholds** are intentionally modest global floors in `vitest.config.ts`: 60% statements, 50% branches, 60% functions, and 60% lines.
- **`pnpm docs:check`** validates documentation links, docs ownership targets, and legacy docs path usage.
- **`pnpm build`** runs `pnpm typecheck`, builds the CLI output under `dist-node/`, and runs the Vite production build.

## What CI currently gates

- The default GitHub Actions CI job runs `pnpm lint`, `pnpm format:check`, `pnpm docs:check`, `pnpm typecheck`, coverage-gated Vitest, `pnpm build`, sidecar preparation/validation, and Tauri Rust library tests.
- `pnpm check` is the local fast quality gate, but it does not include `pnpm docs:check`, `pnpm build`, Playwright E2E, Playwright performance, or dependency review.
- `pnpm test:e2e` and `pnpm test:perf` are available targeted checks. They are not default CI gates today.
- Accessibility-sensitive UI changes should include focused automated interaction/focus tests and axe coverage where practical. Manual keyboard/screen-reader smoke notes are still needed when automation is insufficient.

## Typical quick flow for feature changes

1. Run targeted unit/UI tests by change area to validate behavior.
2. If you touched UI behavior, run the relevant Vitest UI coverage and add `pnpm test:e2e` for browser-flow risk or release-candidate confidence.
3. If you changed UI semantics, focus, or keyboard behavior, add focused accessibility regression coverage or document the manual keyboard/screen-reader smoke performed.
4. Before handing off, run `pnpm check`; add `pnpm docs:check`, `pnpm build`, `pnpm test:perf`, or `pnpm audit --audit-level=moderate` when the change affects those areas.

## Helpful verification targets

- MCP behavior changes: `tests/mcp/*.test.ts`
- Plugin runtime-facing behavior: `tests/ui/api/plugins.test.ts`, `tests/ui/api/plugins.policy-sync.test.ts`
- Accessibility-sensitive components: `tests/ui/accessibility/core-components.a11y.test.tsx`
- Storage/backend regressions: `tests/storage/**/*.test.ts`, `tests/db/**/*.test.ts`

## Related docs

- Test runner config: [`../../vitest.config.ts`](../../vitest.config.ts)
- Browser test config: [`../../playwright.config.ts`](../../playwright.config.ts)
- Development setup (profile defaults and scripts): [`../guides/SETUP.md`](../guides/SETUP.md)
