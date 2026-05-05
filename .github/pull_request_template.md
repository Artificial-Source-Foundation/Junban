## Summary

-

## Target Branch

- [ ] Targeting `developer` for normal feature, fix, docs, or test work
- [ ] Targeting `main` only for a release promotion from `developer` or a production hotfix
- [ ] If this is a hotfix to `main`, I have a follow-up plan to merge it back into `developer`

## Testing

- [ ] `pnpm check`
- [ ] `pnpm docs:check` (docs, links, or workflow docs changed)
- [ ] `pnpm build` (build, packaging, runtime, or release-affecting changes)
- [ ] `pnpm test:e2e` (UI/browser flows or release candidate; not a default CI gate)
- [ ] `pnpm test:perf` (performance-sensitive changes; not a default CI gate)
- [ ] Accessibility/keyboard verification for UI semantics or focus changes; describe automated axe, interaction, or manual coverage below
- [ ] other: _describe below_

## Documentation Checklist

- [ ] No doc updates needed; behavior/API/workflow did not change
- [ ] Routed through `docs/README.md` (single source of truth for ownership map + doc-governance routing) before selecting docs to update
- [ ] Updated affected technical reference docs via `docs/reference/README.md` (`docs/reference/frontend/`, `docs/reference/backend/`, and/or `docs/reference/plugins/`)
- [ ] Updated `docs/product/` docs if mission, roadmap, status, or PRD scope changed
- [ ] Updated `AGENTS.md` / `CLAUDE.md` if contributor or agent workflow changed

## Notes

-
