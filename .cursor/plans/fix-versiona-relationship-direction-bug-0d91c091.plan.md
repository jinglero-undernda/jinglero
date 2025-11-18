<!-- 0d91c091-a76a-4246-a206-da8256ed6ea2 9aae1c83-6420-4b74-9e40-ec91c3ee81f3 -->
# Review and Fix All Relationship Direction Logic

## Problem

Relationship direction logic is inconsistent across the codebase. Some relationships use `entityType` (correct) while others use `rel.entityType` or `relEntityType` (buggy). This causes relationships to be created/deleted in the wrong direction, making them invisible in the UI.

## Schema Definitions (from backend schema.ts)

1. **APPEARS_IN**: `(Jingle)-[APPEARS_IN]->(Fabrica)`
2. **VERSIONA**: `(Jingle)-[VERSIONA]->(Cancion)` ✅ Fixed
3. **TAGGED_WITH**: `(Jingle)-[TAGGED_WITH]->(Tematica)` ✅ Correct
4. **AUTOR_DE**: `(Artista)-[AUTOR_DE]->(Cancion)`
5. **JINGLERO_DE**: `(Artista)-[JINGLERO_DE]->(Jingle)`

## Current State Analysis

### Functions to Review

1. `handleCreateRelationship` (lines ~626-675)
2. `getRelationshipProperties` (lines ~1322-1334)
3. `handleDeleteRelationshipClick` (lines ~955-980)

### Issues Found

**APPEARS_IN**: Uses `rel.entityType === 'fabrica'` in create/delete - BUGGY

**VERSIONA**: Fixed in create, but still buggy in delete

**TAGGED_WITH**: All correct ✅

**AUTOR_DE/JINGLERO_DE**: All correct ✅

## Implementation Plan

### Task 1: Fix APPEARS_IN Relationship

#### 1.1 Fix handleCreateRelationship

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Lines**: 626-629

**Current (buggy)**:

```typescript
if (relType === 'appears_in') {
  // Jingle -> Fabrica
  startId = rel.entityType === 'fabrica' ? selectedEntity.id : entity.id;
  endId = rel.entityType === 'fabrica' ? entity.id : selectedEntity.id;
}
```

**Problem**: From Jingle page selecting Fabrica, `rel.entityType === 'fabrica'` is true, so:

- `startId = selectedEntity.id` (Fabrica) ❌ Should be Jingle
- `endId = entity.id` (Jingle) ❌ Should be Fabrica

**Fix**: Use `entityType` pattern like `tagged_with`:

```typescript
if (relType === 'appears_in') {
  // APPEARS_IN: (Jingle)-[APPEARS_IN]->(Fabrica)
  // Jingle is always start, Fabrica is always end
  if (entityType === 'jingle') {
    startId = entity.id; // Jingle (current entity)
    endId = selectedEntity.id; // Fabrica (selected entity)
  } else if (entityType === 'fabrica') {
    startId = selectedEntity.id; // Jingle (selected entity)
    endId = entity.id; // Fabrica (current entity)
  } else {
    startId = entity.id;
    endId = selectedEntity.id;
  }
}
```

#### 1.2 Verify getRelationshipProperties

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Lines**: 1322-1324

**Current**: Uses `entityType === 'jingle'` - CORRECT ✅

**Action**: Verify it matches the fix above

#### 1.3 Fix handleDeleteRelationshipClick

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Lines**: 955-958

**Current (buggy)**:

```typescript
if (relType === 'appears_in') {
  startId = relEntityType === 'fabrica' ? relatedEntityId : entity.id;
  endId = relEntityType === 'fabrica' ? entity.id : relatedEntityId;
}
```

**Fix**: Use `entityType` pattern:

```typescript
if (relType === 'appears_in') {
  // APPEARS_IN: (Jingle)-[APPEARS_IN]->(Fabrica)
  if (entityType === 'jingle') {
    startId = entity.id; // Jingle (current entity)
    endId = relatedEntityId; // Fabrica (related entity)
  } else if (entityType === 'fabrica') {
    startId = relatedEntityId; // Jingle (related entity)
    endId = entity.id; // Fabrica (current entity)
  } else {
    startId = entity.id;
    endId = relatedEntityId;
  }
}
```

#### 1.4 Test APPEARS_IN validity

- From Jingle page: Create relationship to Fabrica → Verify appears immediately
- From Fabrica page: Create relationship to Jingle → Verify appears immediately
- Delete relationship from both pages → Verify deletion works
- Console logs: Verify correct startId/endId in all operations

---

### Task 2: Fix VERSIONA Relationship (Delete Handler)

#### 2.1 Fix handleDeleteRelationshipClick

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Lines**: 959-962

**Current (buggy)**:

```typescript
} else if (relType === 'versiona') {
  startId = relEntityType === 'cancion' ? relatedEntityId : entity.id;
  endId = relEntityType === 'cancion' ? entity.id : relatedEntityId;
}
```

**Fix**: Use `entityType` pattern (matching the create fix):

```typescript
} else if (relType === 'versiona') {
  // VERSIONA: (Jingle)-[VERSIONA]->(Cancion)
  if (entityType === 'jingle') {
    startId = entity.id; // Jingle (current entity)
    endId = relatedEntityId; // Cancion (related entity)
  } else if (entityType === 'cancion') {
    startId = relatedEntityId; // Jingle (related entity)
    endId = entity.id; // Cancion (current entity)
  } else {
    startId = entity.id;
    endId = relatedEntityId;
  }
}
```

#### 2.2 Verify handleCreateRelationship

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Lines**: 630-646

**Status**: Already fixed ✅

**Action**: Verify it's correct

#### 2.3 Verify getRelationshipProperties

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Lines**: 1325-1327

**Status**: Already correct ✅

**Action**: Verify it matches the pattern

#### 2.4 Test VERSIONA validity

- From Jingle page: Create relationship to Cancion → Verify appears immediately
- From Cancion page: Create relationship to Jingle → Verify appears immediately
- Delete relationship from both pages → Verify deletion works
- Console logs: Verify correct startId/endId in all operations

---

### Task 3: Verify TAGGED_WITH Relationship

#### 3.1 Verify handleCreateRelationship

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Lines**: 659-674

**Status**: Uses `entityType` pattern - CORRECT ✅

**Action**: Verify logic is correct

#### 3.2 Verify getRelationshipProperties

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Lines**: 1331-1333

**Status**: Uses `entityType === 'jingle'` - CORRECT ✅

**Action**: Verify it matches create pattern

#### 3.3 Verify handleDeleteRelationshipClick

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Lines**: 967-980

**Status**: Uses `entityType` pattern - CORRECT ✅

**Action**: Verify logic is correct

#### 3.4 Test TAGGED_WITH validity

- From Jingle page: Create relationship to Tematica → Verify appears immediately
- From Tematica page: Create relationship to Jingle → Verify appears immediately
- Delete relationship from both pages → Verify deletion works
- Console logs: Verify correct startId/endId in all operations

---

### Task 4: Verify AUTOR_DE Relationship

#### 4.1 Verify handleCreateRelationship

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Lines**: 647-650

**Current**: Uses `rel.entityType === 'artista'`

**Analysis**:

- From Artista page selecting Cancion: `rel.entityType === 'artista'` is false → `startId = entity.id` (Artista) ✅, `endId = selectedEntity.id` (Cancion) ✅
- From Cancion page selecting Artista: `rel.entityType === 'artista'` is true → `startId = selectedEntity.id` (Artista) ✅, `endId = entity.id` (Cancion) ✅

**Status**: Logic is CORRECT ✅ (happens to work because it checks for the start node type)

**Action**: Consider refactoring to `entityType` pattern for consistency, but not required

#### 4.2 Verify getRelationshipProperties

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Lines**: 1328-1330

**Status**: Uses `entityType === 'artista'` - CORRECT ✅

**Action**: Verify it matches create pattern

#### 4.3 Verify handleDeleteRelationshipClick

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Lines**: 963-966

**Current**: Uses `relEntityType === 'artista'`

**Analysis**: Same logic as create - CORRECT ✅

**Action**: Consider refactoring for consistency

#### 4.4 Test AUTOR_DE validity

- From Artista page: Create relationship to Cancion → Verify appears immediately
- From Cancion page: Create relationship to Artista → Verify appears immediately
- Delete relationship from both pages → Verify deletion works
- Console logs: Verify correct startId/endId in all operations

---

### Task 5: Verify JINGLERO_DE Relationship

#### 5.1 Verify handleCreateRelationship

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Lines**: 647-650 (shared with AUTOR_DE)

**Status**: Same logic as AUTOR_DE - CORRECT ✅

**Action**: Verify logic is correct

#### 5.2 Verify getRelationshipProperties

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Lines**: 1328-1330 (shared with AUTOR_DE)

**Status**: Uses `entityType === 'artista'` - CORRECT ✅

**Action**: Verify it matches create pattern

#### 5.3 Verify handleDeleteRelationshipClick

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Lines**: 963-966 (shared with AUTOR_DE)

**Status**: Same logic as AUTOR_DE - CORRECT ✅

**Action**: Verify logic is correct

#### 5.4 Test JINGLERO_DE validity

- From Artista page: Create relationship to Jingle → Verify appears immediately
- From Jingle page: Create relationship to Artista → Verify appears immediately
- Delete relationship from both pages → Verify deletion works
- Console logs: Verify correct startId/endId in all operations

---

## Summary of Required Fixes

1. **APPEARS_IN**: Fix create (line 626-629) and delete (line 955-958) handlers
2. **VERSIONA**: Fix delete handler (line 959-962) - create already fixed
3. **TAGGED_WITH**: All correct - verify only
4. **AUTOR_DE**: All correct - verify only
5. **JINGLERO_DE**: All correct - verify only

## Files to Modify

- `frontend/src/components/common/RelatedEntities.tsx`
  - Line ~626-629: Fix APPEARS_IN in handleCreateRelationship
  - Line ~955-958: Fix APPEARS_IN in handleDeleteRelationshipClick
  - Line ~959-962: Fix VERSIONA in handleDeleteRelationshipClick

## Testing Strategy

For each relationship type, test:

1. Create from entity A page selecting entity B
2. Create from entity B page selecting entity A
3. Delete from entity A page
4. Delete from entity B page
5. Verify console logs show correct startId/endId
6. Verify relationships appear immediately after creation
7. Verify relationships disappear after deletion
8. Verify refresh shows correct state

### To-dos

- [ ] Fix versiona relationship direction logic in handleCreateRelationship (lines 630-633) to use entityType instead of rel.entityType, following tagged_with pattern
- [ ] Verify getRelationshipProperties versiona logic (lines 1312-1314) is correct - should already be correct but confirm
- [ ] Test creating versiona relationship from Jingle page - verify relationship appears and has correct direction
- [ ] Test creating versiona relationship from Cancion page - verify relationship appears and has correct direction
- [ ] Verify console logs show correct startId/endId and entitiesCount > 0 after creation