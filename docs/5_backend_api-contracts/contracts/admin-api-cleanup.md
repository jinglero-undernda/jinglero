# API Contract: Admin API - Cleanup Endpoints

## Status

- **Status**: validated
- **Last Updated**: 2025-11-29
- **Last Validated**: 2025-11-29
- **Version**: 1.0
- **Code Reference**: `backend/src/server/api/admin.ts` (to be created)
- **Validation Report**: `docs/5_backend_api-contracts/contracts/admin-api-cleanup_validation.md`

## Overview

The Cleanup API provides endpoints for executing database cleanup and validation scripts. These scripts identify data quality issues, missing relationships, incomplete data, and other problems across the knowledge graph. Scripts can suggest automated fixes, and some fixes can be applied automatically.

**Base Path**: `/api/admin/cleanup`

**Authentication**: JWT token required (inherits from Admin API)

**Architecture Reference**: See `docs/3_system_architecture/data-flow.md` for data flow patterns.

**Database Schema Reference**: See `docs/4_backend_database-schema/schema/` for entity and relationship definitions.

**Workflow Reference**: See `docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup.md` for user workflow.

## MusicBrainz Integration

Several cleanup scripts interact with the MusicBrainz API to:

- Search for matches by title or artist name
- Look up entity details by MusicBrainz ID
- Fetch missing metadata (album, year, genre, etc.)

**MusicBrainz API Details**:

- Base URL: `https://musicbrainz.org/ws/2/`
- Rate Limiting: 1 request per second (recommended)
- Response Format: XML (MusicBrainz native) or JSON (if using wrapper)
- Authentication: Optional (user-agent required)

**Scripts Using MusicBrainz**:

- Script 5: Find Cancion without MusicBrainz id and suggest it from query
- Script 6: Fill out missing Cancion details from MusicBrainz id
- Script 8: Suggest Autor based on MusicBrainz query, Auto-generate Artista entity if new is needed
- Script 9: Find Artista without MusicBrainz id and backfill based on online research
- Script 10: Fill out missing Autor details from MusicBrainz id

**Error Handling**:

- MusicBrainz API failures are handled gracefully
- Scripts continue execution even if MusicBrainz API is unavailable
- Errors are reported in script results with details

## Endpoints

### GET /api/admin/cleanup/scripts

**Method**: GET  
**Path**: `/api/admin/cleanup/scripts`  
**Code Reference**: `backend/src/server/api/admin.ts` (to be created)

**Description**: List all available cleanup scripts with metadata.

**Query Parameters**: None

**Success Response (200)**

```json
{
  "scripts": [
    {
      "id": "find-fabricas-missing-jingles",
      "name": "Find Fabricas where not all Jingles are listed",
      "description": "Identifies Fabricas where the 'Contenidos' property contains Jingle references that are not present in the APPEARS_IN relationships",
      "entityType": "fabricas",
      "category": "fabricas",
      "automatable": true,
      "estimatedDuration": "5-30s",
      "usesMusicBrainz": false
    },
    {
      "id": "find-jingles-zero-timestamp",
      "name": "Find Jingles with time-stamp 00:00:00",
      "description": "Identifies Jingles with zero timestamp, which likely indicates missing or invalid timestamp data",
      "entityType": "jingles",
      "category": "jingles",
      "automatable": false,
      "estimatedDuration": "2-10s",
      "usesMusicBrainz": false
    },
    {
      "id": "find-cancion-without-musicbrainz-id",
      "name": "Find Cancion without MusicBrainz id and suggest it from query",
      "description": "Identifies Canciones missing MusicBrainz ID and attempts to suggest matches via MusicBrainz API query",
      "entityType": "canciones",
      "category": "canciones",
      "automatable": true,
      "estimatedDuration": "10-60s",
      "usesMusicBrainz": true
    }
  ],
  "total": 11
}
```

**Error Responses**

- **401**: Unauthorized - Authentication required
- **500**: Internal Server Error - Server error loading scripts

**Validation Rules**

- None (read-only endpoint)

---

### POST /api/admin/cleanup/:scriptId/execute

**Method**: POST  
**Path**: `/api/admin/cleanup/:scriptId/execute`  
**Code Reference**: `backend/src/server/api/admin.ts` (to be created)

**Description**: Execute a cleanup script. The script will analyze the database and return results with identified issues and suggested fixes.

**Path Parameters**

- `scriptId` (required): Identifier of the cleanup script to execute (e.g., `find-jingles-zero-timestamp`)

**Query Parameters**: None

**Request Body**: None

**Success Response (200)**

```json
{
  "scriptId": "find-jingles-zero-timestamp",
  "scriptName": "Find Jingles with time-stamp 00:00:00",
  "totalFound": 15,
  "executionTime": 1234,
  "timestamp": "2025-11-29T10:30:00Z",
  "entities": [
    {
      "entityType": "jingle",
      "entityId": "0001",
      "entityTitle": "Jingle Title",
      "issue": "Timestamp is 00:00:00",
      "currentValue": "00:00:00",
      "suggestion": {
        "type": "update",
        "field": "timestamp",
        "recommendedValue": null,
        "automatable": false,
        "requiresManualReview": true
      }
    },
    {
      "entityType": "jingle",
      "entityId": "0002",
      "entityTitle": "Another Jingle",
      "issue": "Timestamp is 00:00:00",
      "currentValue": "00:00:00",
      "suggestion": {
        "type": "update",
        "field": "timestamp",
        "recommendedValue": null,
        "automatable": false,
        "requiresManualReview": true
      }
    }
  ],
  "suggestions": [],
  "musicBrainzCalls": 0,
  "musicBrainzErrors": []
}
```

**Response with MusicBrainz Integration** (for scripts that use MusicBrainz):

```json
{
  "scriptId": "find-cancion-without-musicbrainz-id",
  "scriptName": "Find Cancion without MusicBrainz id and suggest it from query",
  "totalFound": 8,
  "executionTime": 45234,
  "timestamp": "2025-11-29T10:30:00Z",
  "entities": [
    {
      "entityType": "cancion",
      "entityId": "c001",
      "entityTitle": "Song Title",
      "issue": "Missing MusicBrainz ID",
      "currentValue": null,
      "suggestion": {
        "type": "update",
        "field": "musicBrainzId",
        "recommendedValue": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "automatable": true,
        "requiresManualReview": false,
        "musicBrainzMatch": {
          "musicBrainzId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "title": "Song Title",
          "artist": "Artist Name",
          "confidence": 0.95,
          "source": "musicbrainz_search"
        }
      }
    },
    {
      "entityType": "cancion",
      "entityId": "c002",
      "entityTitle": "Ambiguous Song",
      "issue": "Missing MusicBrainz ID",
      "currentValue": null,
      "suggestion": {
        "type": "update",
        "field": "musicBrainzId",
        "recommendedValue": "x1y2z3w4-v5u6-7890-tsrq-ponmlkjihgf",
        "automatable": false,
        "requiresManualReview": true,
        "musicBrainzMatch": {
          "musicBrainzId": "x1y2z3w4-v5u6-7890-tsrq-ponmlkjihgf",
          "title": "Ambiguous Song",
          "artist": "Possible Artist",
          "confidence": 0.65,
          "source": "musicbrainz_search",
          "alternatives": [
            {
              "musicBrainzId": "a9b8c7d6-e5f4-3210-wxyz-9876543210ab",
              "title": "Ambiguous Song",
              "artist": "Another Artist",
              "confidence": 0.6
            }
          ]
        }
      }
    }
  ],
  "suggestions": [
    {
      "type": "update",
      "field": "musicBrainzId",
      "count": 8,
      "automatable": 5,
      "requiresReview": 3
    }
  ],
  "musicBrainzCalls": 12,
  "musicBrainzErrors": [
    {
      "entityId": "c003",
      "error": "MusicBrainz API timeout",
      "retryable": true
    }
  ]
}
```

**Error Responses**

- **400**: Bad Request - Invalid scriptId
- **401**: Unauthorized - Authentication required
- **404**: Not Found - Script not found
- **500**: Internal Server Error - Script execution failed
- **503**: Service Unavailable - MusicBrainz API unavailable (for scripts using MusicBrainz)

**Validation Rules**

- `scriptId` must be a valid script identifier
- Script must exist in available scripts list

**Special Notes**

- Script execution is asynchronous and may take time (especially for large datasets)
- Scripts using MusicBrainz may take longer due to external API calls
- Results include execution time in milliseconds
- MusicBrainz API calls are rate-limited to 1 request per second
- Low-confidence MusicBrainz matches (confidence < 0.8) require manual review

---

### POST /api/admin/cleanup/:scriptId/automate

**Method**: POST  
**Path**: `/api/admin/cleanup/:scriptId/automate`  
**Code Reference**: `backend/src/server/api/admin.ts` (to be created)

**Description**: Apply automated fixes suggested by a cleanup script. Only automatable suggestions are applied.

**Path Parameters**

- `scriptId` (required): Identifier of the cleanup script that generated the suggestions

**Query Parameters**: None

**Request Body**

```json
{
  "entityIds": ["c001", "c002", "c003"],
  "applyLowConfidence": false
}
```

**Request Body Parameters**

- `entityIds` (required, array): List of entity IDs to apply fixes for
- `applyLowConfidence` (optional, boolean): Whether to apply fixes with low confidence scores (default: false). If false, only high-confidence fixes (confidence >= 0.8) are applied.

**Success Response (200)**

```json
{
  "scriptId": "fill-missing-cancion-details",
  "totalRequested": 3,
  "totalApplied": 3,
  "successful": 3,
  "failed": 0,
  "skipped": 0,
  "results": [
    {
      "entityId": "c001",
      "status": "success",
      "changes": {
        "album": "Album Name",
        "year": 2020,
        "genre": "Rock"
      },
      "musicBrainzId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    },
    {
      "entityId": "c002",
      "status": "success",
      "changes": {
        "album": "Another Album",
        "year": 2019
      },
      "musicBrainzId": "x1y2z3w4-v5u6-7890-tsrq-ponmlkjihgf"
    },
    {
      "entityId": "c003",
      "status": "success",
      "changes": {
        "album": "Third Album",
        "year": 2021,
        "genre": "Pop"
      },
      "musicBrainzId": "m9n8o7p6-q5r4-3210-zyxw-vutsrqponmlk"
    }
  ],
  "errors": []
}
```

**Response with Partial Success**:

```json
{
  "scriptId": "fill-missing-cancion-details",
  "totalRequested": 3,
  "totalApplied": 2,
  "successful": 2,
  "failed": 1,
  "skipped": 1,
  "results": [
    {
      "entityId": "c001",
      "status": "success",
      "changes": {
        "album": "Album Name",
        "year": 2020
      }
    },
    {
      "entityId": "c002",
      "status": "success",
      "changes": {
        "album": "Another Album",
        "year": 2019
      }
    },
    {
      "entityId": "c003",
      "status": "failed",
      "error": "MusicBrainz API unavailable",
      "retryable": true
    }
  ],
  "errors": [
    {
      "entityId": "c003",
      "error": "MusicBrainz API unavailable",
      "code": "MUSICBRAINZ_UNAVAILABLE",
      "retryable": true
    }
  ]
}
```

**Response with Low Confidence Skipped**:

```json
{
  "scriptId": "find-cancion-without-musicbrainz-id",
  "totalRequested": 3,
  "totalApplied": 1,
  "successful": 1,
  "failed": 0,
  "skipped": 2,
  "results": [
    {
      "entityId": "c001",
      "status": "success",
      "changes": {
        "musicBrainzId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
      },
      "confidence": 0.95
    }
  ],
  "skippedEntities": [
    {
      "entityId": "c002",
      "reason": "Low confidence score (0.65 < 0.8 threshold)",
      "confidence": 0.65
    },
    {
      "entityId": "c003",
      "reason": "Low confidence score (0.72 < 0.8 threshold)",
      "confidence": 0.72
    }
  ],
  "errors": []
}
```

**Error Responses**

- **400**: Bad Request - Invalid scriptId or entityIds
- **401**: Unauthorized - Authentication required
- **404**: Not Found - Script not found
- **422**: Unprocessable Entity - No automatable suggestions for provided entities
- **500**: Internal Server Error - Automation failed
- **503**: Service Unavailable - MusicBrainz API unavailable (for scripts using MusicBrainz)

**Validation Rules**

- `scriptId` must be a valid script identifier
- `entityIds` must be a non-empty array
- All entity IDs must be valid entity identifiers
- Script must have automatable suggestions for the provided entities

**Special Notes**

- Only automatable suggestions are applied
- Low-confidence fixes (confidence < 0.8) are skipped unless `applyLowConfidence: true`
- MusicBrainz API calls are made during automation if needed
- Failed automations can be retried individually
- Automation is idempotent (safe to retry)

---

## Request/Response Formats

### Script List Response Schema

```typescript
interface ScriptListResponse {
  scripts: ScriptMetadata[];
  total: number;
}

interface ScriptMetadata {
  id: string;
  name: string;
  description: string;
  entityType: string;
  category: "fabricas" | "jingles" | "canciones" | "artistas" | "general";
  automatable: boolean;
  estimatedDuration: string;
  usesMusicBrainz: boolean;
}
```

### Script Execution Response Schema

```typescript
interface ScriptExecutionResponse {
  scriptId: string;
  scriptName: string;
  totalFound: number;
  executionTime: number; // milliseconds
  timestamp: string; // ISO 8601
  entities: EntityIssue[];
  suggestions: SuggestionSummary[];
  musicBrainzCalls?: number;
  musicBrainzErrors?: MusicBrainzError[];
}

interface EntityIssue {
  entityType: string;
  entityId: string;
  entityTitle?: string;
  issue: string;
  currentValue: any;
  suggestion?: Suggestion;
}

interface Suggestion {
  type: "update" | "create" | "delete" | "relationship";
  field?: string;
  recommendedValue?: any;
  automatable: boolean;
  requiresManualReview: boolean;
  musicBrainzMatch?: MusicBrainzMatch;
}

interface MusicBrainzMatch {
  musicBrainzId: string;
  title: string;
  artist?: string;
  confidence: number; // 0.0 to 1.0
  source: "musicbrainz_search" | "musicbrainz_lookup";
  alternatives?: MusicBrainzMatch[];
}

interface SuggestionSummary {
  type: string;
  field?: string;
  count: number;
  automatable: number;
  requiresReview: number;
}

interface MusicBrainzError {
  entityId: string;
  error: string;
  retryable: boolean;
}
```

### Automation Request Schema

```typescript
interface AutomationRequest {
  entityIds: string[];
  applyLowConfidence?: boolean; // default: false
}
```

### Automation Response Schema

```typescript
interface AutomationResponse {
  scriptId: string;
  totalRequested: number;
  totalApplied: number;
  successful: number;
  failed: number;
  skipped: number;
  results: AutomationResult[];
  skippedEntities?: SkippedEntity[];
  errors: AutomationError[];
}

interface AutomationResult {
  entityId: string;
  status: "success" | "failed";
  changes?: Record<string, any>;
  musicBrainzId?: string;
  confidence?: number;
  error?: string;
}

interface SkippedEntity {
  entityId: string;
  reason: string;
  confidence?: number;
}

interface AutomationError {
  entityId: string;
  error: string;
  code?: string;
  retryable: boolean;
}
```

---

## Validation Rules

### Parameter Validation

#### scriptId

- **Type**: string
- **Required**: Yes
- **Constraints**: Must match a valid script identifier from `/api/admin/cleanup/scripts`
- **Validation**: Must exist in available scripts list

#### entityIds (automation)

- **Type**: array of strings
- **Required**: Yes
- **Constraints**: Non-empty array, all elements must be valid entity IDs
- **Validation**: All entity IDs must exist in the database

#### applyLowConfidence (automation)

- **Type**: boolean
- **Required**: No
- **Default**: false
- **Constraints**: None
- **Validation**: None

### Data Validation

#### MusicBrainz Confidence Scores

- **Type**: number
- **Range**: 0.0 to 1.0
- **Threshold**: 0.8 (80%) - fixes below this require manual review
- **Validation**: Confidence scores are calculated based on match quality:
  - Exact title match: 0.9-1.0
  - Title + artist match: 0.85-0.95
  - Partial match: 0.6-0.8
  - Low confidence: < 0.8 (requires review)

### Business Logic Validation

- Scripts can only be executed if they exist in the available scripts list
- Automation can only be applied to entities that have automatable suggestions
- Low-confidence fixes (confidence < 0.8) are skipped unless explicitly requested
- MusicBrainz API calls are rate-limited to 1 request per second
- Scripts continue execution even if MusicBrainz API is unavailable (errors reported)

---

## MusicBrainz API Integration Details

### MusicBrainz API Endpoints Used

1. **Search Endpoint**: `GET https://musicbrainz.org/ws/2/recording/?query={query}&fmt=json`

   - Used for: Searching for recordings (Canciones) by title
   - Used for: Searching for artists (Artistas) by name
   - Rate Limit: 1 request per second

2. **Lookup Endpoint**: `GET https://musicbrainz.org/ws/2/recording/{mbid}?fmt=json&inc=artist-credits+releases`

   - Used for: Fetching detailed metadata for a recording by MusicBrainz ID
   - Used for: Fetching artist information
   - Rate Limit: 1 request per second

3. **Artist Search**: `GET https://musicbrainz.org/ws/2/artist/?query={query}&fmt=json`
   - Used for: Searching for artists by name
   - Rate Limit: 1 request per second

### MusicBrainz Response Processing

- MusicBrainz API returns XML by default, but JSON format is requested via `fmt=json`
- Responses are parsed and transformed to internal format
- Confidence scores are calculated based on match quality
- Multiple matches are returned as alternatives when confidence is low

### Error Handling

- **Timeout**: MusicBrainz API timeout (30s) - retryable
- **Rate Limit**: 429 Too Many Requests - retryable with backoff
- **Not Found**: 404 - no match found, not an error
- **Server Error**: 500/503 - retryable
- All errors are logged and reported in script results

---

## Versioning

### Versioning Strategy

Cleanup API endpoints follow the same versioning strategy as the Admin API. No separate versioning is used.

### Current Version

1.0

### Version History

| Version | Date       | Changes                      |
| ------- | ---------- | ---------------------------- |
| 1.0     | 2025-11-29 | Initial cleanup API contract |

---

## Related Documentation

- **Workflow**: `docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup.md`
- **System Architecture**: `docs/3_system_architecture/data-flow.md`
- **Database Schema**: `docs/4_backend_database-schema/schema/`
- **Admin API**: `docs/5_backend_api-contracts/contracts/admin-api.md`

---

## Change History

| Version | Date       | Change               | Author | Rationale |
| ------- | ---------- | -------------------- | ------ | --------- |
| 1.0     | 2025-11-29 | Initial API contract | -      | Baseline  |
