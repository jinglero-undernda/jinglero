<!-- a524dcd6-05b5-45ab-ab5c-fb0fb6da7fa5 0b295553-734e-4b1a-b577-ec542bca4537 -->
# Parse Timestamp from Jingle Comment on APPEARS_IN Creation

## Overview

When creating a Jingle-APPEARS_IN-Fabrica relationship from either the Fabrica Admin page or Jingle Admin page in Edit mode, automatically extract timestamp information from the Jingle's `comment` property and set it as the relationship's `timestamp` property.

## Implementation Steps

### 1. Create timestamp parsing utility function

**File**: `frontend/src/lib/utils/timestampParser.ts` (new file)

Create a utility function that:

- Parses MM:SS or HH:MM:SS format from text
- Returns normalized HH:MM:SS format (or null if not found)
- Handles edge cases (whitespace, multiple matches, invalid formats)

**Function signature**:

```typescript
export function parseTimestampFromText(text: string | null | undefined): string | null
```

**Logic**:

- Use regex to find patterns like `MM:SS` or `HH:MM:SS` in the text
- Validate that numbers are within valid ranges (0-59 for seconds/minutes, 0-23 for hours)
- Convert MM:SS to HH:MM:SS format (prepend "00:")
- Return null if no valid timestamp found

### 2. Update handleCreateRelationship in RelatedEntities

**File**: `frontend/src/components/common/RelatedEntities.tsx`

**Location**: In `handleCreateRelationship` function, after determining `startId` and `endId`, before preparing properties (around line 667-680)

**Changes**:

- When `relType === 'appears_in'` (creating APPEARS_IN relationship):
  - Determine which entity is the Jingle:
    - If `entityType === 'jingle'`: parse from `entity.comment` (current entity is Jingle)
    - If `rel.entityType === 'jingle'`: parse from `selectedEntity.comment` (selected entity is Jingle)
  - Check if timestamp should be overridden (see Override Logic below)
  - If override condition is met, call the parsing utility to extract timestamp from the Jingle's comment
  - If timestamp is found, use the parsed timestamp
  - Log the parsing result for debugging

### 3. Handle timestamp format conversion

The parsed timestamp should be in HH:MM:SS format (as expected by the backend API). The utility function will handle MM:SS → HH:MM:SS conversion automatically.

## Override Logic

Parse from comment and apply if current `relationshipProperties.timestamp` is:

- `null`, `undefined`, empty string (`''`), OR `'00:00:00'` (the default value)
- Also handle numeric format: `0` (seconds, which equals `'00:00:00'`)

**Implementation check**:

```typescript
const currentTimestamp = relationshipProperties.timestamp;
const shouldOverride = 
  currentTimestamp === null ||
  currentTimestamp === undefined ||
  currentTimestamp === '' ||
  currentTimestamp === '00:00:00' ||
  currentTimestamp === 0 ||
  (typeof currentTimestamp === 'string' && currentTimestamp.trim() === '00:00:00');
```

This means we override the default but respect any user-set value other than the default.

## Edge Cases

- If comment contains multiple timestamps, use the first valid one
- If parsing fails or no timestamp found, fall back to default behavior (empty timestamp, which backend defaults to '00:00:00')
- Handle whitespace and various text around the timestamp
- Only apply parsed timestamp if override condition is met (see Override Logic above)

## Testing Considerations

- Test with MM:SS format (e.g., "02:30")
- Test with HH:MM:SS format (e.g., "01:02:30")
- Test with text before/after timestamp
- Test with multiple timestamps in comment
- Test with invalid formats
- Test when comment is empty/null
- Test when timestamp is already manually set (should NOT override)
- Test when timestamp is '00:00:00' (SHOULD override)
- Test when timestamp is 0 (seconds, SHOULD override)
- Test from both Fabrica page (selecting Jingle) and Jingle page (selecting Fabrica)

### To-dos

- [ ] Create timestamp parsing utility function in frontend/src/lib/utils/timestampParser.ts that extracts MM:SS or HH:MM:SS from text and normalizes to HH:MM:SS format
- [ ] Update handleCreateRelationship in RelatedEntities.tsx to parse timestamp from selected Jingle's comment property when creating APPEARS_IN relationship