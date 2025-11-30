# Schema: Cleanup Operations

## Status

- **Status**: draft
- **Last Updated**: 2025-11-29
- **Last Validated**: not yet validated
- **Code Reference**: `backend/src/server/db/cleanup/` (to be created)

## Overview

This document describes database operations performed by cleanup scripts. These are not schema changes, but rather data quality operations that query, analyze, and optionally modify the knowledge graph to improve data integrity, completeness, and consistency.

**Workflow Reference**: See `docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup.md` for user workflow.

**API Reference**: See `docs/5_backend_api-contracts/contracts/admin-api-cleanup.md` for API endpoints.

---

## MusicBrainzConfidence Property Evaluation

### Recommendation: **Store MusicBrainzConfidence as Optional Property**

**Rationale**: 
- Confidence scores are calculated during MusicBrainz API queries
- Low-confidence matches (< 0.8) require manual review before automation
- Storing confidence allows tracking match quality over time
- Enables filtering and querying entities by confidence level
- Supports audit trail of automated fixes

### Proposed Property Definition

**Property Name**: `musicBrainzConfidence`

**Applicable Node Types**:
- `Artista` - Confidence for MusicBrainz ID matches
- `Cancion` - Confidence for MusicBrainz ID matches

**Property Details**:
- **Type**: number (float)
- **Range**: 0.0 to 1.0
- **Required**: No (optional)
- **Default**: None
- **Description**: Confidence score for MusicBrainz ID match. Values below 0.8 indicate low confidence and require manual review before automation.

**Thresholds**:
- **High Confidence**: >= 0.8 (80%) - Can be automated without review
- **Low Confidence**: < 0.8 (< 80%) - Requires manual review before automation
- **Very Low Confidence**: < 0.6 (< 60%) - Likely incorrect match, should not be automated

**When Property is Set**:
- Set when MusicBrainz ID is assigned via cleanup scripts
- Updated when MusicBrainz match is re-evaluated
- Set to null when MusicBrainz ID is manually changed or removed

**Usage in Automation**:
- Automation endpoint checks `musicBrainzConfidence` property
- If confidence < 0.8 and `applyLowConfidence: false`, automation is skipped
- If confidence >= 0.8, automation proceeds automatically
- Manual review can override confidence threshold

### Alternative: Store on Relationships

**Consideration**: For AUTOR_DE relationships created via MusicBrainz matching, confidence could be stored on the relationship instead of the node.

**Decision**: Store on nodes (Artista, Cancion) because:
- Confidence applies to the MusicBrainz ID match, not the relationship
- Multiple relationships may exist with the same confidence source
- Node-level confidence is more queryable and useful for filtering

---

## Cleanup Scripts Catalog

### Fabricas Scripts

#### 1. Find Fabricas where not all Jingles are listed

**Operation Type**: Query and Relationship Creation

**Entities Queried**:
- `Fabrica` nodes
- `Jingle` nodes
- `APPEARS_IN` relationships

**Entities Modified**:
- Creates `APPEARS_IN` relationships (if automated)

**Query Pattern**:
```
MATCH (f:Fabrica)
WHERE f.contenidos IS NOT NULL
// Parse contenidos property to extract Jingle references
// Compare with existing APPEARS_IN relationships
// Identify missing relationships
```

**Data Quality Pattern**:
- Checks if all Jingle references in `contenidos` property have corresponding `APPEARS_IN` relationships
- Identifies missing relationships

**Automatable**: Yes - Can create missing `APPEARS_IN` relationships

---

#### 2. Find Fabricas with two or more Jingles matching time-stamps

**Operation Type**: Query Only

**Entities Queried**:
- `Fabrica` nodes
- `Jingle` nodes
- `APPEARS_IN` relationships

**Entities Modified**: None

**Query Pattern**:
```
MATCH (f:Fabrica)-[:APPEARS_IN]->(j:Jingle)
WITH f, j.timestamp as timestamp, collect(j) as jingles
WHERE size(jingles) >= 2
RETURN f, timestamp, jingles
```

**Data Quality Pattern**:
- Identifies potential duplicate Jingles or data entry errors
- Flags Fabricas with multiple Jingles having identical timestamps

**Automatable**: No - Requires manual review to determine if duplicates or valid entries

---

### Jingles Scripts

#### 3. Find Jingles with time-stamp 00:00:00

**Operation Type**: Query Only

**Entities Queried**:
- `Jingle` nodes

**Entities Modified**: None (manual update required)

**Query Pattern**:
```
MATCH (j:Jingle)
WHERE j.timestamp = "00:00:00" OR j.timestamp IS NULL
RETURN j
```

**Data Quality Pattern**:
- Identifies Jingles with missing or invalid timestamp data
- Zero timestamp likely indicates missing data

**Automatable**: No - Requires manual timestamp entry

---

#### 4. Find Jingles without a Cancion relationship

**Operation Type**: Query and Relationship Suggestion

**Entities Queried**:
- `Jingle` nodes
- `Cancion` nodes
- `VERSIONA` relationships

**Entities Modified**:
- Suggests `VERSIONA` relationships (if automated)

**Query Pattern**:
```
MATCH (j:Jingle)
WHERE NOT EXISTS {
  (j)-[:VERSIONA]->(:Cancion)
}
RETURN j
```

**Data Quality Pattern**:
- Identifies Jingles not linked to any Cancion
- May suggest Canciones based on title matching

**Automatable**: Partial - Can suggest Canciones based on title matching, but requires confirmation

---

### Canciones Scripts

#### 5. Find Cancion without MusicBrainz id and suggest it from query

**Operation Type**: Query and External API Integration

**Entities Queried**:
- `Cancion` nodes

**Entities Modified**:
- Updates `musicBrainzId` property (if automated)
- Sets `musicBrainzConfidence` property (if automated and confidence >= 0.8)

**External API**: MusicBrainz API - Search endpoint

**Query Pattern**:
```
MATCH (c:Cancion)
WHERE c.musicBrainzId IS NULL
RETURN c
// Then query MusicBrainz API for each Cancion
```

**Data Quality Pattern**:
- Identifies Canciones missing MusicBrainz ID
- Queries MusicBrainz API to find matches
- Calculates confidence score for matches
- Suggests MusicBrainz ID with confidence score

**Automatable**: Yes - Can update `musicBrainzId` if confidence >= 0.8

**MusicBrainzConfidence Usage**: 
- Set when MusicBrainz ID is assigned
- Value: 0.0 to 1.0 based on match quality
- Threshold: < 0.8 requires manual review

---

#### 6. Fill out missing Cancion details from MusicBrainz id

**Operation Type**: Query and External API Integration

**Entities Queried**:
- `Cancion` nodes with `musicBrainzId` property

**Entities Modified**:
- Updates missing properties (album, year, genre, etc.)

**External API**: MusicBrainz API - Lookup endpoint

**Query Pattern**:
```
MATCH (c:Cancion)
WHERE c.musicBrainzId IS NOT NULL
  AND (c.album IS NULL OR c.year IS NULL OR c.genre IS NULL)
RETURN c
// Then lookup each Cancion in MusicBrainz API
```

**Data Quality Pattern**:
- Identifies Canciones with MusicBrainz ID but incomplete metadata
- Fetches missing metadata from MusicBrainz API
- Backfills missing fields

**Automatable**: Yes - Can backfill missing fields from MusicBrainz

**MusicBrainzConfidence Usage**:
- Not set (this script uses existing MusicBrainz ID)
- If MusicBrainz ID was set with low confidence, may want to re-evaluate

---

#### 7. Find a Cancion without an Autor asociado

**Operation Type**: Query and Relationship Suggestion

**Entities Queried**:
- `Cancion` nodes
- `Artista` nodes
- `AUTOR_DE` relationships

**Entities Modified**:
- Suggests `AUTOR_DE` relationships (if automated)
- May create `Artista` nodes (if automated and artist doesn't exist)

**External API**: MusicBrainz API - Search endpoint (for artist lookup)

**Query Pattern**:
```
MATCH (c:Cancion)
WHERE NOT EXISTS {
  (:Artista)-[:AUTOR_DE]->(c)
}
RETURN c
// Then query MusicBrainz API for artist information
```

**Data Quality Pattern**:
- Identifies Canciones not linked to any Artista
- Queries MusicBrainz API to find artist information
- Suggests creating Artista entity if needed
- Suggests AUTOR_DE relationship

**Automatable**: Partial - Can suggest Artistas based on MusicBrainz data, but requires confirmation

**MusicBrainzConfidence Usage**:
- Could be set on created Artista node if MusicBrainz ID is assigned
- Could be set on AUTOR_DE relationship if stored there (not recommended)

---

### Artistas Scripts

#### 8. Suggest Autor based on MusicBrainz query, Auto-generate Artista entity if new is needed

**Operation Type**: Query, External API Integration, and Entity Creation

**Entities Queried**:
- `Cancion` nodes without `AUTOR_DE` relationships
- `Artista` nodes

**Entities Modified**:
- Creates `Artista` nodes (if automated and artist doesn't exist)
- Creates `AUTOR_DE` relationships (if automated)
- Sets `musicBrainzId` property on new Artista (if automated)
- Sets `musicBrainzConfidence` property on new Artista (if automated and confidence >= 0.8)

**External API**: MusicBrainz API - Search endpoint

**Query Pattern**:
```
MATCH (c:Cancion)
WHERE NOT EXISTS {
  (:Artista)-[:AUTOR_DE]->(c)
}
RETURN c
// Then query MusicBrainz API for artist information
// Create Artista if not exists
// Create AUTOR_DE relationship
```

**Data Quality Pattern**:
- Identifies Canciones without Autor
- Queries MusicBrainz API to find artist information
- Creates Artista entity if needed
- Creates AUTOR_DE relationship
- Assigns MusicBrainz ID with confidence score

**Automatable**: Yes - Can create Artista entities and AUTOR_DE relationships if confidence >= 0.8

**MusicBrainzConfidence Usage**:
- Set on newly created Artista node when MusicBrainz ID is assigned
- Value: 0.0 to 1.0 based on match quality
- Threshold: < 0.8 requires manual review before automation

---

#### 9. Find Artista without MusicBrainz id and backfill based on online research

**Operation Type**: Query and External API Integration

**Entities Queried**:
- `Artista` nodes

**Entities Modified**:
- Updates `musicBrainzId` property (if automated)
- Sets `musicBrainzConfidence` property (if automated and confidence >= 0.8)

**External API**: MusicBrainz API - Search endpoint

**Query Pattern**:
```
MATCH (a:Artista)
WHERE a.musicBrainzId IS NULL
RETURN a
// Then query MusicBrainz API for each Artista
```

**Data Quality Pattern**:
- Identifies Artistas missing MusicBrainz ID
- Queries MusicBrainz API to find matches
- Calculates confidence score for matches
- Suggests MusicBrainz ID with confidence score

**Automatable**: Yes - Can update `musicBrainzId` if confidence >= 0.8

**MusicBrainzConfidence Usage**:
- Set when MusicBrainz ID is assigned
- Value: 0.0 to 1.0 based on match quality
- Threshold: < 0.8 requires manual review

---

#### 10. Fill out missing Autor details from MusicBrainz id

**Operation Type**: Query and External API Integration

**Entities Queried**:
- `Artista` nodes with `musicBrainzId` property

**Entities Modified**:
- Updates missing properties (bio, genre, etc.)

**External API**: MusicBrainz API - Lookup endpoint

**Query Pattern**:
```
MATCH (a:Artista)
WHERE a.musicBrainzId IS NOT NULL
  AND (a.bio IS NULL OR a.genre IS NULL)
RETURN a
// Then lookup each Artista in MusicBrainz API
```

**Data Quality Pattern**:
- Identifies Artistas with MusicBrainz ID but incomplete metadata
- Fetches missing metadata from MusicBrainz API
- Backfills missing fields

**Automatable**: Yes - Can backfill missing fields from MusicBrainz

**MusicBrainzConfidence Usage**:
- Not set (this script uses existing MusicBrainz ID)
- If MusicBrainz ID was set with low confidence, may want to re-evaluate

---

### General Scripts

#### 11. Refresh all redundant properties and all empty booleans

**Operation Type**: Query and Property Update

**Entities Queried**:
- All node types
- All relationship types

**Entities Modified**:
- Updates redundant properties (relationship counts, etc.)
- Sets default values for empty boolean fields

**Query Pattern**:
```
// For each entity type:
MATCH (n:NodeType)
// Recalculate redundant properties
// Set default values for empty booleans
```

**Data Quality Pattern**:
- Recalculates redundant properties based on current relationships
- Ensures boolean fields have default values (false if not set)

**Automatable**: Yes - Can update all redundant properties automatically

---

## MusicBrainzConfidence Property Schema

### Property Definition

**Property Name**: `musicBrainzConfidence`

**Node Types**: 
- `Artista`
- `Cancion`

**Type**: number (float)

**Range**: 0.0 to 1.0

**Required**: No (optional)

**Default**: None

**Description**: Confidence score for MusicBrainz ID match. Indicates the quality/reliability of the MusicBrainz ID assignment. Values below 0.8 indicate low confidence and require manual review before automation.

**Code Reference**: `backend/src/server/db/schema/schema.ts` (to be added)

### Confidence Score Calculation

**High Confidence (>= 0.8)**:
- Exact title match: 0.9-1.0
- Title + artist match: 0.85-0.95
- Very close match with minor differences: 0.8-0.9

**Low Confidence (< 0.8)**:
- Partial match: 0.6-0.8
- Ambiguous match (multiple candidates): 0.5-0.7
- Very low confidence: < 0.6

### Usage in Automation

- **Automation Endpoint**: Checks `musicBrainzConfidence` before applying fixes
- **Threshold**: 0.8 (80%) - fixes below this require manual review
- **Override**: Manual review can approve low-confidence fixes
- **Query**: Can filter entities by confidence level for review

### Property Updates

- **Set**: When MusicBrainz ID is assigned via cleanup scripts
- **Updated**: When MusicBrainz match is re-evaluated
- **Cleared**: When MusicBrainz ID is manually changed or removed (set to null)

---

## Data Quality Patterns

### Missing Relationships
- Scripts 1, 4, 7 identify missing relationships
- Can be automated if relationships can be inferred

### Missing External IDs
- Scripts 5, 9 identify missing MusicBrainz IDs
- Requires external API queries
- Confidence scoring needed for automation

### Incomplete Data
- Scripts 6, 10 identify incomplete metadata
- Can be backfilled from MusicBrainz API

### Invalid Data
- Script 3 identifies invalid timestamps
- Requires manual correction

### Data Consistency
- Script 11 refreshes redundant properties
- Ensures data consistency across graph

---

## Related Documentation

- **Workflow**: `docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup.md`
- **API Contracts**: `docs/5_backend_api-contracts/contracts/admin-api-cleanup.md`
- **System Architecture**: `docs/3_system_architecture/data-flow.md`
- **Node Schema**: `docs/4_backend_database-schema/schema/nodes.md`

---

## Change History

| Version | Date       | Change                      | Author | Rationale      |
| ------- | ---------- | --------------------------- | ------ | -------------- |
| 1.0     | 2025-11-29 | Initial cleanup operations documentation and MusicBrainzConfidence evaluation | -      | Baseline       |

