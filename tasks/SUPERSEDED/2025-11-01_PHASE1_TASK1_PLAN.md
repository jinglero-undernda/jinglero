# Phase 1, Task 1: Extract Entity Type Mapping Utility - Detailed Plan

## Objective

Extract the duplicate entity type mapping logic from `InspectRelatedEntitiesPage.tsx` and `InspectEntityPage.tsx` into a reusable utility function in `frontend/src/lib/utils/entityTypeUtils.ts`.

## Current State Analysis

### Duplicate Code Locations

1. **File**: `frontend/src/pages/inspect/InspectRelatedEntitiesPage.tsx`

   - **Lines**: 21-29
   - **Code**:
     ```typescript
     const entityTypeMap: Record<string, EntityType> = {
       f: "fabrica",
       j: "jingle",
       c: "cancion",
       a: "artista",
       t: "tematica",
     };
     const entityType = rawEntityType ? entityTypeMap[rawEntityType] : null;
     ```

2. **File**: `frontend/src/pages/inspect/InspectEntityPage.tsx`
   - **Lines**: 23-31
   - **Code**: (Identical to above)

### Dependencies

- `EntityType` type from `frontend/src/components/common/EntityCard.tsx`
- Both files import: `import type { EntityType } from '../../components/common/EntityCard';`

---

## Detailed Implementation Plan

### Step 1: Create the Utility File

**Action**: Create new file `frontend/src/lib/utils/entityTypeUtils.ts`

**File Structure**:

```typescript
import type { EntityType } from "../../components/common/EntityCard";

/**
 * Entity type abbreviation to full type mapping
 * Maps route parameters (single letter) to full entity type names
 */
const ENTITY_TYPE_MAP: Record<string, EntityType> = {
  f: "fabrica",
  j: "jingle",
  c: "cancion",
  a: "artista",
  t: "tematica",
} as const;

/**
 * Normalizes a raw entity type string (from route parameter) to a full EntityType
 *
 * @param rawType - The raw entity type string from route parameter (e.g., 'f', 'j', 'c')
 * @returns The normalized EntityType or null if the raw type is invalid/undefined
 *
 * @example
 * normalizeEntityType('f') // Returns 'fabrica'
 * normalizeEntityType('j') // Returns 'jingle'
 * normalizeEntityType('invalid') // Returns null
 * normalizeEntityType(undefined) // Returns null
 */
export function normalizeEntityType(
  rawType: string | undefined
): EntityType | null {
  if (!rawType) {
    return null;
  }

  return ENTITY_TYPE_MAP[rawType] || null;
}
```

**Notes**:

- Use `as const` to make the map readonly
- Export only the function, keep the map private
- Include comprehensive JSDoc documentation
- Handle undefined/null inputs gracefully
- Return null for invalid types (matches current behavior)

---

### Step 2: Update InspectRelatedEntitiesPage.tsx

**File**: `frontend/src/pages/inspect/InspectRelatedEntitiesPage.tsx`

**Changes Required**:

1. **Add import** (after existing imports, around line 7):

   ```typescript
   import { normalizeEntityType } from "../../lib/utils/entityTypeUtils";
   ```

2. **Remove duplicate mapping code** (lines 20-29):

   - Delete the `entityTypeMap` constant declaration
   - Delete the `entityType` variable declaration using the map

3. **Replace with utility function call** (replace line 29):
   ```typescript
   const entityType = normalizeEntityType(rawEntityType);
   ```

**Before**:

```typescript
const { entityType: rawEntityType, entityId } = params;

// Normalize entity type
const entityTypeMap: Record<string, EntityType> = {
  f: "fabrica",
  j: "jingle",
  c: "cancion",
  a: "artista",
  t: "tematica",
};

const entityType = rawEntityType ? entityTypeMap[rawEntityType] : null;
```

**After**:

```typescript
const { entityType: rawEntityType, entityId } = params;

// Normalize entity type
const entityType = normalizeEntityType(rawEntityType);
```

**Verification**:

- Import statement is at the top with other imports
- No unused imports remain
- The `entityType` variable is still used the same way throughout the component
- Type checking: `entityType` should still be `EntityType | null`

---

### Step 3: Update InspectEntityPage.tsx

**File**: `frontend/src/pages/inspect/InspectEntityPage.tsx`

**Changes Required**:

1. **Add import** (after existing imports, around line 4):

   ```typescript
   import { normalizeEntityType } from "../../lib/utils/entityTypeUtils";
   ```

2. **Remove duplicate mapping code** (lines 22-31):

   - Delete the `entityTypeMap` constant declaration
   - Delete the `entityType` variable declaration using the map

3. **Replace with utility function call** (replace line 31):
   ```typescript
   const entityType = normalizeEntityType(rawEntityType);
   ```

**Before**:

```typescript
const { entityType: rawEntityType, entityId } = params;

// Normalize entity type
const entityTypeMap: Record<string, EntityType> = {
  f: "fabrica",
  j: "jingle",
  c: "cancion",
  a: "artista",
  t: "tematica",
};

const entityType = rawEntityType ? entityTypeMap[rawEntityType] : null;
```

**After**:

```typescript
const { entityType: rawEntityType, entityId } = params;

// Normalize entity type
const entityType = normalizeEntityType(rawEntityType);
```

**Verification**:

- Import statement is at the top with other imports
- No unused imports remain
- The `entityType` variable is still used the same way throughout the component
- Type checking: `entityType` should still be `EntityType | null`

---

### Step 4: Remove Unused EntityType Import (If Applicable)

**Check both files**:

- In `InspectRelatedEntitiesPage.tsx`: Verify if `EntityType` import is still needed
  - **Keep it** if it's used elsewhere in the file (e.g., in type annotations)
  - **Remove it** if it's only used for the mapping (which we just removed)

**Note**: Based on the code review, `EntityType` is likely still needed for type annotations on the `entityType` variable and in other places. Do not remove it unless you verify it's unused.

---

### Step 5: Testing and Verification

#### Manual Testing Checklist

1. **Test InspectRelatedEntitiesPage**:

   - [ ] Navigate to `/inspect-related/f/test-fabrica` - should work
   - [ ] Navigate to `/inspect-related/j/test-jingle` - should work
   - [ ] Navigate to `/inspect-related/c/test-cancion` - should work
   - [ ] Navigate to `/inspect-related/a/test-artista` - should work
   - [ ] Navigate to `/inspect-related/t/test-tematica` - should work
   - [ ] Navigate to `/inspect-related/x/invalid` - should show error message (entityType should be null)
   - [ ] Verify page renders correctly with valid entity types
   - [ ] Verify error handling works for invalid entity types

2. **Test InspectEntityPage**:

   - [ ] Navigate to `/inspect/f/test-fabrica` - should work
   - [ ] Navigate to `/inspect/j/test-jingle` - should work
   - [ ] Navigate to `/inspect/c/test-cancion` - should work
   - [ ] Navigate to `/inspect/a/test-artista` - should work
   - [ ] Navigate to `/inspect/t/test-tematica` - should work
   - [ ] Navigate to `/inspect/x/invalid` - should show error message (entityType should be null)
   - [ ] Verify page renders correctly with valid entity types
   - [ ] Verify error handling works for invalid entity types

3. **Type Checking**:

   - [ ] Run `npm run type-check` (or equivalent TypeScript check)
   - [ ] Verify no TypeScript errors related to entity type mapping
   - [ ] Verify `entityType` variable has correct type (`EntityType | null`)

4. **Code Quality**:
   - [ ] Run linter (`npm run lint`)
   - [ ] Verify no linting errors introduced
   - [ ] Verify code formatting is consistent

---

## Expected Outcomes

### Files Modified

1. ✅ `frontend/src/lib/utils/entityTypeUtils.ts` (NEW FILE)
2. ✅ `frontend/src/pages/inspect/InspectRelatedEntitiesPage.tsx` (MODIFIED)
3. ✅ `frontend/src/pages/inspect/InspectEntityPage.tsx` (MODIFIED)

### Code Removed

- Approximately 10 lines of duplicate code removed from each file
- Total: ~20 lines of duplicate code eliminated

### Code Added

- New utility file with ~25 lines (including documentation)
- Net result: DRY principle applied, code reusability improved

---

## Potential Issues and Solutions

### Issue 1: Type Import Path

**Problem**: If `EntityType` cannot be imported from `EntityCard.tsx` in the utils folder, the path might be incorrect.

**Solution**:

- Verify the relative path: `../../components/common/EntityCard` from `lib/utils/`
- Count directory levels: `lib/utils` → `lib` → `src` → `components/common/EntityCard.tsx`
- Path should be: `../../components/common/EntityCard` ✓

### Issue 2: Circular Dependencies

**Problem**: If `EntityCard.tsx` imports from `entityTypeUtils.ts`, and vice versa, we might create a circular dependency.

**Solution**:

- Check if `EntityCard.tsx` uses any functions from utils folder
- This is unlikely as `EntityCard` only exports the `EntityType` type
- Types don't cause circular dependencies, only imports of values/functions do

### Issue 3: Other Files Using Similar Mapping

**Problem**: There might be other files with the same mapping logic we're not aware of.

**Solution**:

- After implementation, search codebase for `entityTypeMap` or similar patterns
- If found, update those files too (but that's outside this task scope)

---

## Implementation Checklist

- [ ] **Step 1**: Create `frontend/src/lib/utils/entityTypeUtils.ts` with the utility function
- [ ] **Step 2**: Update `InspectRelatedEntitiesPage.tsx`:
  - [ ] Add import for `normalizeEntityType`
  - [ ] Remove `entityTypeMap` constant
  - [ ] Replace `entityType` assignment with function call
  - [ ] Verify import of `EntityType` is still needed
- [ ] **Step 3**: Update `InspectEntityPage.tsx`:
  - [ ] Add import for `normalizeEntityType`
  - [ ] Remove `entityTypeMap` constant
  - [ ] Replace `entityType` assignment with function call
  - [ ] Verify import of `EntityType` is still needed
- [ ] **Step 4**: Run TypeScript type checking
- [ ] **Step 5**: Run linter
- [ ] **Step 6**: Test all routes manually
- [ ] **Step 7**: Verify no console errors in browser
- [ ] **Step 8**: Commit changes with descriptive message

---

## Commit Message Template

```
refactor: extract entity type mapping to utility function

- Create entityTypeUtils.ts with normalizeEntityType function
- Remove duplicate entityTypeMap from InspectRelatedEntitiesPage
- Remove duplicate entityTypeMap from InspectEntityPage
- Both files now use shared utility function

Phase 1, Task 1 of RelatedEntities refactoring
```

---

## Success Criteria

✅ Task is complete when:

1. New utility file exists with proper function and documentation
2. Both inspect pages use the utility function instead of duplicate code
3. All tests pass (manual testing)
4. TypeScript compilation succeeds
5. No linting errors
6. Functionality remains identical to before (no regressions)

---

## Notes for Junior Developer

- **Why this matters**: This follows the DRY (Don't Repeat Yourself) principle. Having the same code in two places means if we need to change the mapping, we'd have to remember to change it in both places, which is error-prone.
- **The function name**: `normalizeEntityType` is descriptive - it "normalizes" a raw string into a proper EntityType.
- **Error handling**: Returning `null` for invalid types matches the current behavior, so the rest of the code doesn't need to change.
- **Testing**: Always test with both valid and invalid inputs to make sure error handling works.
