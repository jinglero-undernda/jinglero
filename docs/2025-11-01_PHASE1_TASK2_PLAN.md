# Phase 1, Task 2: Extract Sorting Logic to Separate Utility - Detailed Plan

## Objective

Extract the `sortEntities` function from `RelatedEntities.tsx` into a reusable utility file `frontend/src/lib/utils/entitySorters.ts` to improve code organization and reusability.

## Current State Analysis

### Function Location

**File**: `frontend/src/components/common/RelatedEntities.tsx`
- **Lines**: 39-140 (function definition)
- **Function name**: `sortEntities`
- **Function signature**: 
  ```typescript
  function sortEntities<T extends RelatedEntity>(
    entities: T[],
    sortKey?: RelationshipConfig['sortKey'],
    entityType?: EntityType
  ): T[]
  ```

### Function Usage

The function is called in 3 places within `RelatedEntities.tsx`:
1. **Line 211**: `const sorted = sortEntities(entities, rel.sortKey, rel.entityType);`
2. **Line 262**: `const sorted = sortEntities(entities, rel.sortKey, rel.entityType);`
3. **Line 294**: `const sorted = sortEntities(entities, rel.sortKey, rel.entityType);`

### Dependencies

The function requires the following imports:
- `RelatedEntity` type (defined in RelatedEntities.tsx line 7)
- `EntityType` from `./EntityCard`
- `RelationshipConfig` type (specifically the `sortKey` property type)
- Entity types: `Artista`, `Cancion`, `Fabrica`, `Jingle`, `Tematica` from `../../types`

### Sort Keys Supported

The function handles the following sort keys:
- `'timestamp'` - For Jingle entities (handles both string HH:MM:SS and number formats)
- `'date'` - For Fabrica and Jingle entities (descending order)
- `'stageName'` - For Artista entities (alphabetical)
- `'title'` - For Cancion, Fabrica, Jingle entities (alphabetical)
- `'name'` - For Tematica and Artista entities (alphabetical)
- `'category'` - For Tematica entities (category first, then name)

---

## Detailed Implementation Plan

### Step 1: Create the Utility File

**Action**: Create new file `frontend/src/lib/utils/entitySorters.ts`

**File Structure**:
```typescript
import type { EntityType } from "../../components/common/EntityCard";
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from "../../types";

/**
 * Union type representing any related entity
 */
export type RelatedEntity = Artista | Cancion | Fabrica | Jingle | Tematica;

/**
 * Sort key options for entity sorting
 */
export type SortKey = 'timestamp' | 'date' | 'stageName' | 'title' | 'name' | 'category';

/**
 * Sorts entities based on sortKey
 *
 * This function provides sorting logic for different entity types based on various
 * sort keys. It handles type-specific sorting rules and edge cases.
 *
 * @param entities - Array of entities to sort (generic type extending RelatedEntity)
 * @param sortKey - Optional sort key to determine sorting strategy
 * @param entityType - Optional entity type to enable type-specific sorting (e.g., category for tematica)
 * @returns Sorted array of entities (new array, original not modified)
 *
 * @example
 * // Sort jingles by timestamp
 * const sorted = sortEntities(jingles, 'timestamp');
 *
 * // Sort tematicas by category (then by name)
 * const sorted = sortEntities(tematicas, 'category', 'tematica');
 *
 * // Sort artistas by stage name
 * const sorted = sortEntities(artistas, 'stageName');
 */
export function sortEntities<T extends RelatedEntity>(
  entities: T[],
  sortKey?: SortKey,
  entityType?: EntityType
): T[] {
  if (!sortKey || entities.length === 0) return entities;

  const sorted = [...entities];

  switch (sortKey) {
    case 'timestamp':
      return sorted.sort((a, b) => {
        const aTimestamp = (a as Jingle).timestamp;
        const bTimestamp = (b as Jingle).timestamp;
        
        // Handle both string (HH:MM:SS) and number (seconds) formats, and null/undefined
        let aSeconds: number;
        let bSeconds: number;
        
        if (aTimestamp == null) {
          aSeconds = 0;
        } else if (typeof aTimestamp === 'string') {
          // Parse HH:MM:SS format to seconds
          const parts = aTimestamp.split(':');
          if (parts.length === 3) {
            aSeconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
          } else {
            aSeconds = 0;
          }
        } else if (typeof aTimestamp === 'number') {
          aSeconds = aTimestamp;
        } else {
          aSeconds = 0;
        }
        
        if (bTimestamp == null) {
          bSeconds = 0;
        } else if (typeof bTimestamp === 'string') {
          const parts = bTimestamp.split(':');
          if (parts.length === 3) {
            bSeconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
          } else {
            bSeconds = 0;
          }
        } else if (typeof bTimestamp === 'number') {
          bSeconds = bTimestamp;
        } else {
          bSeconds = 0;
        }
        
        return aSeconds - bSeconds;
      });

    case 'date':
      return sorted.sort((a, b) => {
        const aDate = (a as Fabrica).date || (a as Jingle).createdAt || '';
        const bDate = (b as Fabrica).date || (b as Jingle).createdAt || '';
        return new Date(bDate).getTime() - new Date(aDate).getTime(); // Descending
      });

    case 'stageName':
      return sorted.sort((a, b) => {
        const aName = (a as Artista).stageName || (a as Artista).name || '';
        const bName = (b as Artista).stageName || (b as Artista).name || '';
        return aName.localeCompare(bName);
      });

    case 'title':
      return sorted.sort((a, b) => {
        const aTitle = (a as Cancion | Fabrica | Jingle).title || '';
        const bTitle = (b as Cancion | Fabrica | Jingle).title || '';
        return aTitle.localeCompare(bTitle);
      });

    case 'name':
      return sorted.sort((a, b) => {
        const aName = (a as Tematica | Artista).name || '';
        const bName = (b as Tematica | Artista).name || '';
        return aName.localeCompare(bName);
      });

    case 'category':
      // For tematicas: sort by category first, then name
      if (entityType === 'tematica') {
        return sorted.sort((a, b) => {
          const aCat = (a as Tematica).category || '';
          const bCat = (b as Tematica).category || '';
          if (aCat !== bCat) return aCat.localeCompare(bCat);
          const aName = (a as Tematica).name || '';
          const bName = (b as Tematica).name || '';
          return aName.localeCompare(bName);
        });
      }
      return sorted;

    default:
      return sorted;
  }
}
```

**Notes**:
- Export the `RelatedEntity` type for consistency (even though it may be used elsewhere)
- Export the `SortKey` type for type safety
- Export the `sortEntities` function
- Include comprehensive JSDoc documentation
- Use proper relative import paths from `lib/utils/` directory
- Preserve all existing logic exactly as-is

---

### Step 2: Update RelatedEntities.tsx to Import from Utility

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Changes Required**:

1. **Add import** (after existing imports, around line 4):
   ```typescript
   import { sortEntities } from '../../lib/utils/entitySorters';
   ```

2. **Remove the function definition** (lines 39-140):
   - Delete the entire `sortEntities` function (including JSDoc comment)

3. **Keep RelatedEntity export** (line 7):
   - The `RelatedEntity` type is still exported from RelatedEntities.tsx for backward compatibility
   - If other files import `RelatedEntity` from RelatedEntities.tsx, we need to keep it
   - We can also export it from entitySorters.ts, but keep both for now to avoid breaking changes

**Before** (lines 1-7):
```typescript
import { useState, useCallback, useEffect } from 'react';
import EntityCard, { type EntityType } from './EntityCard';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import '../../styles/components/related-entities.css';

export type RelatedEntity = Artista | Cancion | Fabrica | Jingle | Tematica;
```

**After**:
```typescript
import { useState, useCallback, useEffect } from 'react';
import EntityCard, { type EntityType } from './EntityCard';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';
import { getRelationshipsForEntityType } from '../../lib/utils/relationshipConfigs';
import { sortEntities } from '../../lib/utils/entitySorters';
import '../../styles/components/related-entities.css';

export type RelatedEntity = Artista | Cancion | Fabrica | Jingle | Tematica;
```

**After** (remove function definition, lines 39-140):
- The function definition and JSDoc comment should be completely removed
- The component code should continue directly after the interfaces

**Verification**:
- Import statement is at the top with other imports
- Function definition is completely removed
- All 3 usages of `sortEntities` (lines 211, 262, 294) remain unchanged
- TypeScript compilation should succeed

---

### Step 3: Verify RelatedEntity Type Export

**Action**: Check if `RelatedEntity` type is imported elsewhere in the codebase

**Potential Issue**: If other files import `RelatedEntity` from `RelatedEntities.tsx`, we need to ensure compatibility.

**Solution**:
- Keep `RelatedEntity` export in `RelatedEntities.tsx` for now (backward compatibility)
- Also export it from `entitySorters.ts` for future use
- This is safe because TypeScript will treat them as the same type if the definition is identical

**Note**: This step is mainly for verification - no code changes needed unless we find breaking imports.

---

### Step 4: Testing and Verification

#### Manual Testing Checklist

1. **Test RelatedEntities Component**:
   - [ ] Navigate to a page using RelatedEntities (e.g., `/inspect-related/f/test-fabrica`)
   - [ ] Verify entities are sorted correctly by their configured sort keys
   - [ ] Test with different entity types:
     - [ ] Fabrica with Jingles (sorted by timestamp)
     - [ ] Jingle with relationships (sorted by date, stageName, etc.)
     - [ ] Artista with Canciones (sorted by title)
     - [ ] Artista with Jingles (sorted by date)
     - [ ] Tematica with Jingles (sorted by date)
   - [ ] Verify sorting order is correct:
     - [ ] Timestamp: ascending (0:00:00 before 1:00:00)
     - [ ] Date: descending (newer dates first)
     - [ ] Alphabetical (stageName, title, name): A before Z
     - [ ] Category: categories sorted, then names within category

2. **Edge Cases**:
   - [ ] Entities with null/undefined sort values should be handled gracefully
   - [ ] Empty arrays should return empty arrays (no errors)
   - [ ] Arrays with single entity should work correctly
   - [ ] Timestamp parsing (HH:MM:SS format) works correctly
   - [ ] Timestamp as number works correctly

3. **Type Checking**:
   - [ ] Run `npm run type-check` (or equivalent TypeScript check)
   - [ ] Verify no TypeScript errors related to sorting
   - [ ] Verify function signature matches usage

4. **Code Quality**:
   - [ ] Run linter (`npm run lint`)
   - [ ] Verify no linting errors introduced
   - [ ] Verify code formatting is consistent

---

## Expected Outcomes

### Files Modified
1. ✅ `frontend/src/lib/utils/entitySorters.ts` (NEW FILE)
2. ✅ `frontend/src/components/common/RelatedEntities.tsx` (MODIFIED)

### Code Moved
- Approximately 102 lines moved from RelatedEntities.tsx to entitySorters.ts
- Function logic remains identical
- All sorting behavior preserved

### Benefits
- Better code organization (sorting logic separated from component logic)
- Reusability (sorting function can be used in other components)
- Easier testing (sorting logic can be tested independently)
- Cleaner component file (RelatedEntities.tsx is more focused)

---

## Potential Issues and Solutions

### Issue 1: Type Import Path
**Problem**: If import paths are incorrect, TypeScript compilation will fail.

**Solution**:
- Verify relative paths from `lib/utils/entitySorters.ts`:
  - `../../components/common/EntityCard` → correct (up 2 levels: utils → lib → src → components/common)
  - `../../types` → correct (up 2 levels: utils → lib → src → types)
- If paths are wrong, adjust based on actual directory structure

### Issue 2: RelatedEntity Type Duplication
**Problem**: `RelatedEntity` type is defined in both files, which could cause confusion.

**Solution**:
- Keep `RelatedEntity` in both places for now (they're identical, so no conflict)
- RelatedEntities.tsx keeps it for backward compatibility
- entitySorters.ts has it for type safety
- TypeScript will treat them as the same type if definitions match
- Future refactoring could consolidate to a shared types file

### Issue 3: Function Calls Still Work
**Problem**: After moving the function, the function calls might not work if the import is wrong.

**Solution**:
- Verify import statement is correct: `import { sortEntities } from '../../lib/utils/entitySorters';`
- From `components/common/RelatedEntities.tsx` to `lib/utils/entitySorters.ts`:
  - Up 1 level: `components/common` → `components`
  - Up 1 level: `components` → `src`
  - Down to `lib/utils/entitySorters`
  - Path: `../../lib/utils/entitySorters` ✓

### Issue 4: SortKey Type Reference
**Problem**: The function signature uses `RelationshipConfig['sortKey']`, but we're moving it away from that context.

**Solution**:
- Define `SortKey` type in `entitySorters.ts` with the same values
- Update function signature to use `SortKey` instead of `RelationshipConfig['sortKey']`
- This is cleaner and doesn't create a dependency on RelationshipConfig

---

## Implementation Checklist

- [ ] **Step 1**: Create `frontend/src/lib/utils/entitySorters.ts`:
  - [ ] Add imports for EntityType and entity types
  - [ ] Define RelatedEntity type (exported)
  - [ ] Define SortKey type (exported)
  - [ ] Move sortEntities function with all logic
  - [ ] Add comprehensive JSDoc documentation
- [ ] **Step 2**: Update `RelatedEntities.tsx`:
  - [ ] Add import for `sortEntities` from entitySorters
  - [ ] Remove `sortEntities` function definition (lines 39-140)
  - [ ] Keep RelatedEntity type export (for backward compatibility)
  - [ ] Verify all 3 function calls still work
- [ ] **Step 3**: Verify RelatedEntity type usage (optional):
  - [ ] Search codebase for imports of RelatedEntity from RelatedEntities.tsx
  - [ ] Confirm no breaking changes needed
- [ ] **Step 4**: Run TypeScript type checking
- [ ] **Step 5**: Run linter
- [ ] **Step 6**: Test sorting functionality manually:
  - [ ] Test all sort keys work correctly
  - [ ] Test edge cases (null values, empty arrays, etc.)
  - [ ] Verify timestamp parsing works
- [ ] **Step 7**: Verify no console errors in browser
- [ ] **Step 8**: Commit changes with descriptive message

---

## Commit Message Template

```
refactor: extract sortEntities function to utility module

- Create entitySorters.ts with sortEntities function
- Move sorting logic from RelatedEntities component to utility
- Export SortKey type for type safety
- Keep RelatedEntity type in both places for compatibility

Phase 1, Task 2 of RelatedEntities refactoring
```

---

## Success Criteria

✅ Task is complete when:
1. New utility file exists with `sortEntities` function and proper types
2. RelatedEntities.tsx imports and uses the utility function
3. Function definition is removed from RelatedEntities.tsx
4. All tests pass (manual testing)
5. TypeScript compilation succeeds
6. No linting errors
7. Sorting functionality remains identical to before (no regressions)
8. All sort keys work correctly (timestamp, date, stageName, title, name, category)

---

## Notes for Junior Developer

- **Why this matters**: Separating sorting logic makes the code more modular and testable. The RelatedEntities component becomes simpler and focused on UI/state management, while sorting logic is isolated and reusable.

- **Type Safety**: We're creating a `SortKey` type that matches the values from `RelationshipConfig['sortKey']`. This ensures type safety without creating a circular dependency.

- **Backward Compatibility**: Keeping `RelatedEntity` type in RelatedEntities.tsx ensures that any other files importing it won't break. Both definitions are identical, so TypeScript treats them as the same type.

- **Testing**: Pay special attention to timestamp sorting since it handles multiple formats (string "HH:MM:SS" and number). Test with both formats to ensure it works correctly.

- **No Logic Changes**: This is a pure refactoring - we're moving code but not changing its behavior. If sorting works differently after this change, something is wrong!

