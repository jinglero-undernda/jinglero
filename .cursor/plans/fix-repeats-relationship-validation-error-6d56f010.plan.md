<!-- 6d56f010-7825-4450-820f-420299aad8f4 f14afa75-4334-4480-97f2-03dca04f7064 -->
# Fix BUG_0011: REPEATS Relationship Validation Error

## Problem

`fetchJingleRepeats` fails validation because it uses `JingleArraySchema` which requires `timestamp: z.number()`, but the API returns Jingles without a `timestamp` field (or it's undefined). This causes validation to fail and return an empty array, preventing REPEATS relationships from displaying in the UI.

**Console Error**:

```
Validation error in fetchJingleRepeats(jg9ktoevy): 
{
  "expected": "number",
  "code": "invalid_type",
  "path": [0, "timestamp"],
  "message": "Invalid input: expected number, received undefined"
}
```

## Solution

Change the validation schema from `JingleArraySchema` to `JinglePartialArraySchema` in `fetchJingleRepeats`. The `JinglePartialArraySchema` uses `JinglePartialSchema` which has `timestamp: z.number().optional()`, allowing Jingles without timestamps to pass validation.

## Implementation

### File: `frontend/src/lib/services/relationshipService.ts`

**Change line 367**:

- **From**: `const validated = safeParseArray(JingleArraySchema, jingles, \`fetchJingleRepeats(${jingleId})\`) as unknown as Jingle[];`
- **To**: `const validated = safeParseArray(JinglePartialArraySchema, jingles, \`fetchJingleRepeats(${jingleId})\`) as unknown as Jingle[];`

**Note**: `JinglePartialArraySchema` is already imported (line 9), so no import changes needed.

## Validation

After the fix:

1. Navigate to a Jingle admin page with REPEATS relationships
2. Verify no validation errors in console
3. Verify REPEATS relationships appear in the "Versiones" section
4. Test creating a new REPEATS relationship and verify it appears immediately

## Related Context

- `JinglePartialArraySchema` is already used in `fetchCancionJingles` (line 426) for similar reasons
- This matches the pattern used for other relationship functions that handle partial Jingle data
- The fix aligns with the schema design where `JinglePartialSchema` is intended for relationship endpoints that may return incomplete Jingle data

### To-dos

- [ ] Change JingleArraySchema to JinglePartialArraySchema in fetchJingleRepeats (line 367)
- [ ] Test that REPEATS relationships now display correctly on Jingle pages
- [ ] Test creating a new REPEATS relationship and verify it appears immediately
- [ ] Update BUG_0011.md with resolution details and mark as resolved