# Round 7 Fixes: Security

## Fix 1: Timeblocking RPC argument validation

**File:** `src/api/plugins.ts` (lines 149-280)

**Problem:** The timeblocking RPC dispatcher accepted untyped `method` and `args` from the request body and passed them directly to store methods via type assertions (`as string`, `as string[]`). Invalid payloads would cause runtime errors deep in the store layer rather than being caught at the API boundary.

**Fix applied:**
1. Added top-level validation: `method` must be a non-empty string, `args` must be an array
2. Added per-method argument validation using helper functions:
   - `expectString(i, name)` — validates arg is a non-empty string
   - `expectOptionalString(i)` — allows undefined/null, validates string if present
   - `expectObject(i, name)` — validates arg is a non-null, non-array object
   - `expectStringArray(i, name)` — validates arg is an array of strings
3. Each RPC method now validates its specific args before calling store methods
4. Validation failures return 400 with descriptive error messages

**Methods validated:**
- `listBlocks(date?)` — optional string
- `listBlocksInRange(start, end)` — two required strings
- `listSlots(date?)` — optional string
- `listSlotsInRange(start, end)` — two required strings
- `createBlock(input)` — required object
- `updateBlock(id, updates)` — string + object
- `deleteBlock(id)` — required string
- `createSlot(input)` — required object
- `addTaskToSlot(slotId, taskId)` — two required strings
- `reorderSlotTasks(slotId, taskIds)` — string + string array
- `getSettings(key)` — required string
- `setSettings(key, value)` — string + required value (any type)
- `listTasks()` — no args needed

**Verification:**
- TypeScript: 0 errors
- Tests: 2469/2469 passing
