# Round 7 Analysis: Security

## Scope
- Timeblocking RPC argument validation
- Plugin install URL validation
- API body parsing safety

## Findings

### 1. Timeblocking RPC args validation (FIXED)
- **Severity:** Warning (carried from Round 6)
- **Location:** `src/api/plugins.ts` lines 149-222
- **Issue:** RPC dispatcher accepted `method` and `args` without type checking. Malformed payloads (non-string method, non-array args, wrong arg types per method) would cause uncaught runtime errors or pass invalid data to store methods.
- **Status:** FIXED in this round. See fixes/security.md.

### 2. Plugin install URL validation (OK)
- `src/api/plugins.ts` lines 106-129 already validate HTTPS-only and block internal/private network hostnames.

### 3. `c.req.json()` calls across API (LOW RISK)
- 32 `c.req.json()` calls found across `src/api/`. Most use TypeScript type assertions (`as { ... }`) without runtime validation.
- Risk is low because this is a local-first app (API is localhost-only), but worth noting for future hardening.
- Recommendation: Consider adding Zod validation for API bodies in a future sprint.

### 4. `as any` usage (ACCEPTABLE)
- 9 instances found in source (excluding tests):
  - `src/api/plugins.ts:160` — timeblocking plugin instance cast (unavoidable, plugin typing boundary)
  - `src/plugins/installer.ts:75` — Node.js stream compatibility (`Readable.fromWeb`)
  - `src/ai/voice/adapters/browser-stt.ts` — browser Speech API compatibility
  - `src/ai/voice/adapters/piper-local-tts.ts` — third-party library typing gaps
- All are at FFI/library boundaries where `as any` is the pragmatic choice.

## Verdict: PASS
No critical or high-severity security issues. The one warning from Round 6 has been resolved.
