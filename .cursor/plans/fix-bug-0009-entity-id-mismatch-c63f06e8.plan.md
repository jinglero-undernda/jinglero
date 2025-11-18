<!-- c63f06e8-5cb0-416d-97fe-d6bb82103025 7f86ae61-ab19-4036-bf2f-ed2c4de53e61 -->
# Fix BUG_0009: RelatedEntities uses wrong entity ID when mismatch detected

## Problem

The BUG_0005 fix modified the validation guard to use `effectiveEntityType = detectedType` when there's a mismatch, but this still uses the wrong `entity.id` in `fetchFn` calls. When `entity.id` is stale (e.g., Tematica ID `ty2ux6e1k`) but `entityType` is correct (e.g., `'jingle'`), calling `fetchJingleAllRelationships('ty2ux6e1k')` causes a 404 error.

## Solution

Revert to BUG_0003's approach: when a mismatch is detected, skip loading relationships until `entity.id` and `entityType` are synchronized. This prevents using wrong entity IDs.

## Changes

### 1. Update validation guard in RelatedEntities.tsx

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Location**: Lines 1468-1486

**Change**: Replace the `effectiveEntityType` logic with early return when mismatch detected.

**Before**:

```typescript
let effectiveEntityType = entityType;
if (detectedType && detectedType !== entityType) {
  console.warn('[RelatedEntities] Entity ID/Type mismatch detected, using detected type:', {
    entityId: entity.id,
    detectedType,
    propEntityType: entityType,
    entityPath,
    action: 'Using detectedType for relationship loading',
  });
  effectiveEntityType = detectedType; // Use detected type instead of blocking
}
```

**After**:

```typescript
// If detectedType doesn't match entityType, skip loading until synchronized
if (detectedType && detectedType !== entityType) {
  console.warn('[RelatedEntities] Entity ID/Type mismatch detected, skipping load:', {
    entityId: entity.id,
    detectedType,
    expectedType: entityType,
    entityPath,
    action: 'Skipping relationship loading until entity and entityType are synchronized',
  });
  return; // Skip loading relationships until entity and entityType match
}
```

### 2. Remove effectiveEntityType usage in cache key

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Location**: Line 1503

**Change**: Use `entityType` instead of `effectiveEntityType` (since we return early on mismatch, this code path only runs when types match).

**Before**:

```typescript
const cacheKey = getCacheKey(entity.id, effectiveEntityType, key);
```

**After**:

```typescript
const cacheKey = getCacheKey(entity.id, entityType, key);
```

### 3. Remove effectiveEntityType usage in fetchFn call

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Location**: Line 1562

**Change**: Use `entityType` instead of `effectiveEntityType`.

**Before**:

```typescript
const entities = await rel.fetchFn(entity.id, effectiveEntityType);
```

**After**:

```typescript
const entities = await rel.fetchFn(entity.id, entityType);
```

## Rationale

- Aligns with BUG_0003's original approach: skip loading when mismatched
- Prevents using wrong entity IDs in API calls
- The `setEntity(null)` fix from BUG_0003 should prevent most race conditions; this guard is a safety net
- If a mismatch occurs, it's safer to wait for synchronization than to use wrong data

## Testing

- Navigate to Jingle admin page - should not see "Jingle not found" error
- Navigate between different entity types - should not see errors with wrong entity IDs
- Relationships should load correctly once entity and entityType are synchronized
- Console warnings should still appear for debugging when mismatches occur

### To-dos

- [ ] Update validation guard in RelatedEntities.tsx to skip loading on mismatch instead of using effectiveEntityType
- [ ] Change cache key generation to use entityType instead of effectiveEntityType
- [ ] Change fetchFn call to use entityType instead of effectiveEntityType