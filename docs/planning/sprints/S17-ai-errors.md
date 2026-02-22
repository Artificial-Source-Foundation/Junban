# Sprint 17 — "AI Error Handling"

**Goal**: AI resilience — error classification, retry, streaming timeouts, graceful degradation.

| ID | Item | Status |
|----|------|--------|
| A-19a | AIError class + classifyProviderError | done |
| A-22a | Streaming error recovery with withTimeout() | done |
| A-22b | Error bubbles with retry button | done |
| A-22c | Safety timeout | done |

**Result**: Errors classified (auth, rate limit, network, model, unknown). ~620 tests.
