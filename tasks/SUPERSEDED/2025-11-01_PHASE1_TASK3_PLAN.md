# Phase 1, Task 3: Create Entity Type Guards Utility - Detailed Plan

## Objective

Add type guard functions to `frontend/src/lib/utils/entityTypeUtils.ts` to enable TypeScript type narrowing for RelatedEntity union types. These functions will allow safe type checking and type narrowing in TypeScript without using unsafe type assertions.

## Current State Analysis

### File to Modify

**File**: `frontend/src/lib/utils/entityTypeUtils.ts`

- **Current contents**: Only has `normalizeEntityType` function
- **Task**: Add 5 type guard functions

### RelatedEntity Type Source

The `RelatedEntity` type is defined in:

- `frontend/src/lib/utils/entitySorters.ts` (exported)
- `frontend/src/components/common/RelatedEntities.tsx` (exported for backward compatibility)

**Strategy**: Import `RelatedEntity` from `entitySorters.ts` to keep dependencies clear.

### Entity Type Definitions Analysis

From `frontend/src/types/index.ts`, each entity has distinctive properties:

1. **Fabrica**:

   - Unique required properties: `date` (string), `status` ('DRAFT' | 'PROCESSING' | 'COMPLETED')
   - Unique optional properties: `visualizations`, `likes`, `contents`
   - **Best discriminator**: `date` and `status` (both required and unique)

2. **Jingle**:

   - Unique required properties: `timestamp` (string), `isJinglazo` (boolean), `isPrecario` (boolean), `isJinglazoDelDia` (boolean)
   - Unique optional properties: `youtubeClipUrl`, `comment`, `songTitle`, `artistName`
   - **Best discriminator**: `timestamp` and `isJinglazo` (both required and unique)

3. **Cancion**:

   - Unique required properties: `title` (required, unlike Fabrica/Jingle where it's optional)
   - Unique optional properties: `album`, `year`, `genre`, `youtubeMusic`, `lyrics`
   - **Best discriminator**: `album` or `year` (only Cancion has these) OR presence of `title` without `timestamp`/`date`/`isArg`/`category`

4. **Artista**:

   - Unique required properties: `isArg` (boolean)
   - Unique optional properties: `stageName`, `nationality`, `idUsuario`, `bio`, `website`, various social handles
   - **Best discriminator**: `stageName` (typical Artista property)

5. **Tematica**:
   - Unique required properties: `name` (string), `category` ('ACTUALIDAD' | 'CULTURA' | 'GELATINA' | 'GENTE' | 'POLITICA')
   - Unique optional properties: `description`
   - **Best discriminator**: `category` (required, unique to Tematica)

### Type Guard Strategy

We'll use a **discriminant property approach** - checking for the presence of unique required properties that don't overlap between types:

- **isFabrica**: Check for `date` and `status` properties
- **isJingle**: Check for `timestamp` and `isJinglazo` properties
- **isCancion**: Check for `title` (required) and absence of other type markers, OR presence of `album`/`year`
- **isArtista**: Check for `isArg` property
- **isTematica**: Check for `category` property

---

## Detailed Implementation Plan

### Step 1: Add Imports to entityTypeUtils.ts

**File**: `frontend/src/lib/utils/entityTypeUtils.ts`

**Action**: Add imports for entity types and RelatedEntity type

**Before** (lines 1-2):

```typescript
import type { EntityType } from "../../components/common/EntityCard";
```

**After**:

```typescript
import type { EntityType } from "../../components/common/EntityCard";
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from "../../types";
import type { RelatedEntity } from "./entitySorters";
```

**Notes**:

- Import entity types for use in type guard return types
- Import RelatedEntity from entitySorters.ts (where it's already defined)
- Use type-only imports to avoid circular dependencies

---

### Step 2: Create isFabrica Type Guard

**Location**: After `normalizeEntityType` function

**Function**:

```typescript
/**
 * Type guard to check if an entity is a Fabrica
 *
 * @param entity - Entity to check
 * @returns True if entity is a Fabrica, false otherwise
 *
 * @example
 * if (isFabrica(entity)) {
 *   // TypeScript knows entity is Fabrica here
 *   console.log(entity.date);
 * }
 */
export function isFabrica(entity: RelatedEntity): entity is Fabrica {
  return (
    "date" in entity &&
    "status" in entity &&
    typeof entity.date === "string" &&
    typeof (entity as Fabrica).status === "string"
  );
}
```

**Logic**:

- Check for presence of `date` property (required, unique to Fabrica)
- Check for presence of `status` property (required, unique to Fabrica)
- Verify types to ensure runtime safety

---

### Step 3: Create isJingle Type Guard

**Location**: After `isFabrica` function

**Function**:

```typescript
/**
 * Type guard to check if an entity is a Jingle
 *
 * @param entity - Entity to check
 * @returns True if entity is a Jingle, false otherwise
 *
 * @example
 * if (isJingle(entity)) {
 *   // TypeScript knows entity is Jingle here
 *   console.log(entity.timestamp);
 * }
 */
export function isJingle(entity: RelatedEntity): entity is Jingle {
  return (
    "timestamp" in entity &&
    "isJinglazo" in entity &&
    typeof entity.timestamp === "string" &&
    typeof (entity as Jingle).isJinglazo === "boolean"
  );
}
```

**Logic**:

- Check for presence of `timestamp` property (required, unique to Jingle)
- Check for presence of `isJinglazo` property (required boolean, unique to Jingle)
- Verify types to ensure runtime safety

---

### Step 4: Create isArtista Type Guard

**Location**: After `isJingle` function

**Function**:

```typescript
/**
 * Type guard to check if an entity is an Artista
 *
 * @param entity - Entity to check
 * @returns True if entity is an Artista, false otherwise
 *
 * @example
 * if (isArtista(entity)) {
 *   // TypeScript knows entity is Artista here
 *   console.log(entity.stageName);
 * }
 */
export function isArtista(entity: RelatedEntity): entity is Artista {
  return "isArg" in entity && typeof (entity as Artista).isArg === "boolean";
}
```

**Logic**:

- Check for presence of `isArg` property (required boolean, unique to Artista)
- This is the most distinctive property for Artista

---

### Step 5: Create isTematica Type Guard

**Location**: After `isArtista` function

**Function**:

```typescript
/**
 * Type guard to check if an entity is a Tematica
 *
 * @param entity - Entity to check
 * @returns True if entity is a Tematica, false otherwise
 *
 * @example
 * if (isTematica(entity)) {
 *   // TypeScript knows entity is Tematica here
 *   console.log(entity.category);
 * }
 */
export function isTematica(entity: RelatedEntity): entity is Tematica {
  return (
    "category" in entity && typeof (entity as Tematica).category === "string"
  );
}
```

**Logic**:

- Check for presence of `category` property (required, unique to Tematica)
- This is the most distinctive property for Tematica

---

### Step 6: Create isCancion Type Guard

**Location**: After `isTematica` function

**Function**:

```typescript
/**
 * Type guard to check if an entity is a Cancion
 *
 * @param entity - Entity to check
 * @returns True if entity is a Cancion, false otherwise
 *
 * @example
 * if (isCancion(entity)) {
 *   // TypeScript knows entity is Cancion here
 *   console.log(entity.album);
 * }
 */
export function isCancion(entity: RelatedEntity): entity is Cancion {
  // Cancion has required title, but other types can have optional title
  // Best discriminator: presence of album/year (unique to Cancion)
  // OR title is required AND none of the other type markers exist
  return (
    "album" in entity ||
    "year" in entity ||
    ("title" in entity &&
      typeof (entity as Cancion).title === "string" &&
      !isFabrica(entity) &&
      !isJingle(entity) &&
      !isArtista(entity) &&
      !isTematica(entity))
  );
}
```

**Logic**:

- Primary check: presence of `album` or `year` properties (unique to Cancion)
- Fallback: if entity has `title` (required) but is not any other entity type, it must be Cancion
- This approach handles cases where album/year might not be present

**Note**: This function depends on the other type guards, so order matters. It should be defined last.

---

## Complete File Structure

The final `entityTypeUtils.ts` file should look like:

```typescript
import type { EntityType } from "../../components/common/EntityCard";
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from "../../types";
import type { RelatedEntity } from "./entitySorters";

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

/**
 * Type guard to check if an entity is a Fabrica
 *
 * @param entity - Entity to check
 * @returns True if entity is a Fabrica, false otherwise
 *
 * @example
 * if (isFabrica(entity)) {
 *   // TypeScript knows entity is Fabrica here
 *   console.log(entity.date);
 * }
 */
export function isFabrica(entity: RelatedEntity): entity is Fabrica {
  return (
    "date" in entity &&
    "status" in entity &&
    typeof entity.date === "string" &&
    typeof (entity as Fabrica).status === "string"
  );
}

/**
 * Type guard to check if an entity is a Jingle
 *
 * @param entity - Entity to check
 * @returns True if entity is a Jingle, false otherwise
 *
 * @example
 * if (isJingle(entity)) {
 *   // TypeScript knows entity is Jingle here
 *   console.log(entity.timestamp);
 * }
 */
export function isJingle(entity: RelatedEntity): entity is Jingle {
  return (
    "timestamp" in entity &&
    "isJinglazo" in entity &&
    typeof entity.timestamp === "string" &&
    typeof (entity as Jingle).isJinglazo === "boolean"
  );
}

/**
 * Type guard to check if an entity is an Artista
 *
 * @param entity - Entity to check
 * @returns True if entity is an Artista, false otherwise
 *
 * @example
 * if (isArtista(entity)) {
 *   // TypeScript knows entity is Artista here
 *   console.log(entity.stageName);
 * }
 */
export function isArtista(entity: RelatedEntity): entity is Artista {
  return "isArg" in entity && typeof (entity as Artista).isArg === "boolean";
}

/**
 * Type guard to check if an entity is a Tematica
 *
 * @param entity - Entity to check
 * @returns True if entity is a Tematica, false otherwise
 *
 * @example
 * if (isTematica(entity)) {
 *   // TypeScript knows entity is Tematica here
 *   console.log(entity.category);
 * }
 */
export function isTematica(entity: RelatedEntity): entity is Tematica {
  return (
    "category" in entity && typeof (entity as Tematica).category === "string"
  );
}

/**
 * Type guard to check if an entity is a Cancion
 *
 * @param entity - Entity to check
 * @returns True if entity is a Cancion, false otherwise
 *
 * @example
 * if (isCancion(entity)) {
 *   // TypeScript knows entity is Cancion here
 *   console.log(entity.album);
 * }
 */
export function isCancion(entity: RelatedEntity): entity is Cancion {
  // Cancion has required title, but other types can have optional title
  // Best discriminator: presence of album/year (unique to Cancion)
  // OR title is required AND none of the other type markers exist
  return (
    "album" in entity ||
    "year" in entity ||
    ("title" in entity &&
      typeof (entity as Cancion).title === "string" &&
      !isFabrica(entity) &&
      !isJingle(entity) &&
      !isArtista(entity) &&
      !isTematica(entity))
  );
}
```

---

## Testing and Verification

### Manual Testing Checklist

1. **Type Guard Functionality**:

   - [ ] Each type guard correctly identifies its entity type
   - [ ] Each type guard returns false for other entity types
   - [ ] Type guards work with RelatedEntity union type

2. **TypeScript Type Narrowing**:

   - [ ] After `if (isFabrica(entity))`, TypeScript knows entity is Fabrica
   - [ ] After `if (isJingle(entity))`, TypeScript knows entity is Jingle
   - [ ] After `if (isCancion(entity))`, TypeScript knows entity is Cancion
   - [ ] After `if (isArtista(entity))`, TypeScript knows entity is Artista
   - [ ] After `if (isTematica(entity))`, TypeScript knows entity is Tematica

3. **Edge Cases**:

   - [ ] Type guards handle entities with missing optional properties
   - [ ] Type guards handle entities with all properties present
   - [ ] isCancion correctly identifies Cancion even without album/year
   - [ ] isCancion doesn't false-positive on other entities with title

4. **Type Checking**:

   - [ ] Run `npm run type-check` (or equivalent TypeScript check)
   - [ ] Verify no TypeScript errors
   - [ ] Verify type narrowing works in IDE

5. **Code Quality**:
   - [ ] Run linter (`npm run lint`)
   - [ ] Verify no linting errors
   - [ ] Verify code formatting is consistent

---

## Expected Outcomes

### Files Modified

1. ✅ `frontend/src/lib/utils/entityTypeUtils.ts` (MODIFIED - type guards added)

### Code Added

- 5 type guard functions with comprehensive JSDoc documentation
- Approximately 80-100 lines of code added
- All functions exported for use throughout the codebase

### Benefits

- Type-safe entity type checking without unsafe type assertions
- Better IntelliSense and autocomplete after type narrowing
- Runtime type safety with proper type guards
- Reusable across the codebase for entity type checking

---

## Potential Issues and Solutions

### Issue 1: Circular Dependency

**Problem**: If `entitySorters.ts` imports from `entityTypeUtils.ts`, and we import `RelatedEntity` from `entitySorters.ts`, we might create a circular dependency.

**Solution**:

- Use type-only imports (`import type`) which don't cause circular dependencies
- Type-only imports are erased at compile time, so they don't create runtime dependencies
- Verify no runtime imports exist between these files

### Issue 2: isCancion Logic Complexity

**Problem**: Cancion doesn't have a unique required property that other entities don't have, making it harder to distinguish.

**Solution**:

- Use `album`/`year` as primary discriminators (unique to Cancion)
- Fallback to checking for `title` (required) while excluding all other types
- This ensures Cancion is correctly identified even without album/year

### Issue 3: RelatedEntity Import Path

**Problem**: Importing `RelatedEntity` from `./entitySorters` might not work if the path is wrong.

**Solution**:

- Verify relative path: from `lib/utils/entityTypeUtils.ts` to `lib/utils/entitySorters.ts`
- Path should be: `./entitySorters` ✓
- Both files are in the same directory, so relative import is correct

### Issue 4: Type Guard Order Dependency

**Problem**: `isCancion` depends on other type guards, so it must be defined after them.

**Solution**:

- Define type guards in this order: isFabrica, isJingle, isArtista, isTematica, isCancion
- This ensures all dependencies are available when isCancion is defined

---

## Implementation Checklist

- [ ] **Step 1**: Add imports to `entityTypeUtils.ts`:
  - [ ] Import Artista, Cancion, Fabrica, Jingle, Tematica types
  - [ ] Import RelatedEntity type from entitySorters
- [ ] **Step 2**: Add `isFabrica` type guard function
- [ ] **Step 3**: Add `isJingle` type guard function
- [ ] **Step 4**: Add `isArtista` type guard function
- [ ] **Step 5**: Add `isTematica` type guard function
- [ ] **Step 6**: Add `isCancion` type guard function (last, as it depends on others)
- [ ] **Step 7**: Run TypeScript type checking
- [ ] **Step 8**: Run linter
- [ ] **Step 9**: Test type narrowing in TypeScript/IDE
- [ ] **Step 10**: Verify all type guards are exported
- [ ] **Step 11**: Commit changes with descriptive message

---

## Commit Message Template

```
feat: add entity type guards to entityTypeUtils

- Add isFabrica, isJingle, isCancion, isArtista, isTematica type guards
- Enable TypeScript type narrowing for RelatedEntity union types
- Replace unsafe type assertions with type-safe guards
- Add comprehensive JSDoc documentation

Phase 1, Task 3 of RelatedEntities refactoring
```

---

## Success Criteria

✅ Task is complete when:

1. All 5 type guard functions exist and are exported
2. Each type guard correctly identifies its entity type
3. Type guards return false for other entity types
4. TypeScript type narrowing works correctly after using type guards
5. TypeScript compilation succeeds
6. No linting errors
7. All functions have JSDoc documentation
8. Type guards can be imported and used in other files

---

## Notes for Junior Developer

- **Why type guards matter**: They allow TypeScript to narrow the type of a union type (like `RelatedEntity`) after a runtime check. This gives you autocomplete and type safety without using unsafe `as` assertions.

- **Type predicate syntax**: The return type `entity is Fabrica` is a TypeScript type predicate. It tells TypeScript "if this function returns true, the parameter is of type Fabrica."

- **Property checking**: We check for the presence of properties using the `in` operator, which is the proper way to check for property existence in JavaScript/TypeScript.

- **Order matters**: Since `isCancion` depends on the other type guards, it must be defined last. Otherwise, TypeScript will complain about functions being used before they're defined.

- **Runtime vs Compile-time**: Type guards are runtime checks, but they inform TypeScript's compile-time type system. Always ensure your runtime checks match what TypeScript expects.
