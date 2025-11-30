# Testing Cleanup API Endpoints

## Prerequisites

1. Backend server running on port 3000
2. Admin authentication configured (ADMIN_PASSWORD in .env)
3. Neo4j database connected and populated with test data

## Start Backend Server

```bash
cd backend
npm run dev
```

## Test Endpoints

### 1. Login to Get Authentication Token

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"YOUR_ADMIN_PASSWORD"}'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d"
}
```

**Save the token** for subsequent requests.

### 2. List Available Cleanup Scripts

```bash
curl http://localhost:3000/api/admin/cleanup/scripts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "scripts": [
    {
      "id": "find-jingles-zero-timestamp",
      "name": "Find Jingles with time-stamp 00:00:00",
      "description": "Identifies Jingles with zero timestamp, which likely indicates missing or invalid timestamp data",
      "entityType": "jingles",
      "category": "jingles",
      "automatable": false,
      "estimatedDuration": "2-10s",
      "usesMusicBrainz": false
    }
  ],
  "total": 1
}
```

### 3. Execute Cleanup Script

```bash
curl -X POST http://localhost:3000/api/admin/cleanup/find-jingles-zero-timestamp/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "scriptId": "find-jingles-zero-timestamp",
  "scriptName": "Find Jingles with time-stamp 00:00:00",
  "totalFound": 5,
  "executionTime": 1234,
  "timestamp": "2025-11-29T10:30:00.000Z",
  "entities": [
    {
      "entityType": "jingle",
      "entityId": "j12345678",
      "entityTitle": "Jingle Title",
      "issue": "Timestamp is 00:00:00 (or null) in Fabrica abc123. Found parseable timestamp 01:23:45 in comentario",
      "currentValue": "00:00:00",
      "suggestion": {
        "type": "update",
        "field": "timestamp",
        "recommendedValue": 5025,
        "automatable": false,
        "requiresManualReview": true
      }
    }
  ],
  "suggestions": [
    {
      "type": "update",
      "field": "timestamp",
      "count": 5,
      "automatable": 0,
      "requiresReview": 5
    }
  ]
}
```

### 4. Test Error Cases

#### Invalid Script ID
```bash
curl -X POST http://localhost:3000/api/admin/cleanup/invalid-script-id/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response (404):**
```json
{
  "error": "Script not found: invalid-script-id",
  "code": "NOT_FOUND"
}
```

#### Unauthorized Request
```bash
curl http://localhost:3000/api/admin/cleanup/scripts
```

**Expected Response (401):**
```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

## Testing Timestamp Parsing

The script now checks both `comentario` and `titulo` fields for parseable timestamps. Test with:

1. **Jingle with timestamp in comentario:**
   - Create a Jingle with `comentario: "This happens at 01:23:45 in the video"`
   - The script should detect and suggest this timestamp

2. **Jingle with timestamp in titulo:**
   - Create a Jingle with `titulo: "Jingle at 02:30:00"`
   - The script should detect and suggest this timestamp

3. **Jingle with MM:SS format:**
   - Create a Jingle with `comentario: "Starts at 03:45"`
   - The script should parse as `00:03:45` and suggest it

## Notes

- The script checks for timestamps in both `comentario` and `titulo` fields
- Timestamps are parsed using regex patterns for HH:MM:SS and MM:SS formats
- Suggested timestamps are returned as integer seconds (for database storage)
- All suggestions require manual review (automatable: false)

