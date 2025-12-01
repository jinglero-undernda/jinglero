# WORKFLOW_011: Jingle-Cancion Matching and Relationship Creation

## Metadata

- **Status**: draft
- **User Experience Category**: Admin Experience
- **Access Level**: Admin-only
- **Last Updated**: 2025-11-30
- **Last Validated**: not yet validated
- **Code Reference**: See Code References section below
- **Version**: 1.0
- **Workflow Type**: User Journey
- **Related Workflow**: WORKFLOW_011_database-cleanup.md

## User Intent

As a database curator, when I see a Jingle instance report showing that a Jingle has no Cancion relationship, I want to click an "ARREGLAR" button that will parse the Jingle's comment to extract song information, search for matching Canciones in our database and MusicBrainz, suggest matches for my confirmation, and automatically create missing entities and relationships.

## Overview

- **Purpose**: Provide an intelligent matching system that parses Jingle comments to extract song title, artist name, and other metadata, then matches against existing Canciones (with fuzzy matching) and MusicBrainz, suggests matches for user confirmation, and creates missing entities (Artista, Cancion) and relationships (AUTOR_DE, VERSIONA) as needed.

- **User Persona**: Database curator/admin user working on Jingle validation, specifically addressing cases where Jingles are not linked to Canciones. They need a semi-automated tool that can intelligently parse unstructured comment text and match it to songs, reducing manual data entry while maintaining accuracy through user confirmation.

- **User Context**: Admin user has executed the "Find Jingles without a Cancion relationship" cleanup script and sees instance reports showing Jingles missing VERSIONA relationships. They need a tool that can:

  - Parse Jingle comments to extract song information (title, artist, timestamp, contributor, etc.)
  - Match against existing Canciones in the database (with fuzzy matching for typos)
  - Search MusicBrainz for high-confidence matches
  - Present suggestions for user confirmation
  - Create missing Artista and Cancion entities if needed
  - Create AUTOR_DE and VERSIONA relationships

- **Success Criteria**:

  - User can click "ARREGLAR" button next to each Jingle instance report
  - System parses Jingle comment to extract potential song title, artist name, and other metadata
  - System searches existing Canciones with fuzzy matching
  - System searches MusicBrainz for matches
  - User sees ranked suggestions with confidence scores
  - User can confirm a match or create new entities
  - Missing Artista and Cancion entities are created automatically
  - AUTOR_DE and VERSIONA relationships are created automatically
  - Jingle is successfully linked to Cancion

- **Related Components**:

  - `CleanupResultsModal.tsx` - Where "ARREGLAR" button is added
  - `JingleCancionMatchModal.tsx` - New modal component for matching workflow (to be created)
  - `adminApi` - API client for creating entities and relationships
  - `musicbrainz.ts` - MusicBrainz API client utility

- **Dependencies**:
  - **Parent Workflow**: WORKFLOW_011: Database Cleanup - This feature is accessed from cleanup script results
  - **Backend APIs**:
    - `GET /api/admin/:type/:id` - Fetch Jingle entity
    - `POST /api/admin/artistas` - Create Artista entity
    - `POST /api/admin/canciones` - Create Cancion entity
    - `POST /api/admin/relationships/AUTOR_DE` - Create AUTOR_DE relationship
    - `POST /api/admin/relationships/VERSIONA` - Create VERSIONA relationship
    - `GET /api/search` - Search existing Canciones and Artistas
  - **External APIs**:
    - MusicBrainz API - Search for recordings and artists
  - **Frontend Utilities**:
    - Text parsing utilities (to be created)
    - Fuzzy matching utilities (to be created)
  - **Existing Components**:
    - `CleanupResultsModal.tsx` - Must be modified to add "ARREGLAR" button
    - `adminApi` client from `frontend/src/lib/api/client.ts` - For API calls
    - `musicbrainz.ts` from `backend/src/server/utils/musicbrainz.ts` - For MusicBrainz searches

## Architecture Decision: LLM Integration

### Question

Should we include a parsing/testing LLM node such as Gemini to retrieve the matching song?

### Analysis

**Option 1: Rule-Based Parsing (Recommended for Phase 1)**

- **Pros**:
  - No external dependencies or API costs
  - Fast and predictable
  - Works well for structured comments (e.g., "Song Title - Artist Name")
  - Can handle common patterns (timestamps, contributor names, etc.)
  - Easier to debug and maintain
- **Cons**:
  - May struggle with highly unstructured or ambiguous comments
  - Requires pattern maintenance as new formats emerge
  - Less flexible than LLM-based parsing

**Option 2: LLM-Based Parsing (Future Enhancement)**

- **Pros**:
  - Handles unstructured text very well
  - Can extract information from complex, ambiguous comments
  - Adapts to new formats without code changes
  - Can provide confidence scores for extracted fields
- **Cons**:
  - Requires API key and external service (costs, rate limits)
  - Slower response times
  - Less predictable behavior
  - More complex error handling
  - Privacy considerations for sending data to external service

**Recommendation**:

- **Phase 1**: Implement rule-based parsing with fuzzy matching. This covers the majority of use cases where comments follow common patterns.
- **Phase 2**: Add LLM-based parsing as an optional enhancement for complex cases. The system can fall back to LLM parsing when rule-based parsing yields low confidence or no matches.

**Implementation Strategy**:

1. Start with rule-based parsing (regex patterns, keyword extraction)
2. Use fuzzy string matching for database searches
3. Use MusicBrainz API for external matching
4. If confidence is low or no matches found, optionally offer "Advanced parsing with AI" button that uses LLM
5. Store parsing method used for each match (for analytics and improvement)

## UX Flow

### Step 1: View Jingle Instance Report

**User Action**: User has executed "Find Jingles without a Cancion relationship" cleanup script and sees results in CleanupResultsModal

**System Response**:

- Display Jingle instance reports in results list
- Each report shows:
  - Jingle title/ID
  - Jingle comment (truncated if long)
  - Issue description (e.g., "Missing VERSIONA relationship - no Cancion linked")
  - "Ver Entidad" button (existing)
  - **"ARREGLAR" button (new)** - placed below "Ver Entidad" button

**UI State**:

- CleanupResultsModal is open
- Jingle instances are listed with issue descriptions
- Each instance has two buttons: "Ver Entidad" and "ARREGLAR"

**Code Reference**: `frontend/src/components/admin/CleanupResultsModal.tsx` (to be modified)

---

### Step 2: Click "ARREGLAR" Button

**User Action**: Click "ARREGLAR" button next to a Jingle instance report

**System Response**:

- Open new modal: `JingleCancionMatchModal`
- Fetch Jingle data including:
  - `title` property
  - `comment` property (full text)
- Start parsing comment text
- Show loading state while parsing and searching

**UI State**:

- `JingleCancionMatchModal` is open (overlay on top of CleanupResultsModal)
- Loading state: `isLoading = true` while fetching and parsing
- Error state: `error = null` initially, set to error message if fetch/parse fails
- Parsing results ready to display after processing

**Loading States**:

- Show loading spinner or skeleton UI while fetching Jingle data
- Show progress indicator: "Parsing comment..." while extracting information
- Show progress indicator: "Searching database..." while searching Canciones
- Show progress indicator: "Searching MusicBrainz..." while querying external API

**Error Handling**:

- If Jingle fetch fails: Show error message "Error loading Jingle data" with retry button
- If parsing fails: Show warning message but continue with available data
- Network errors: Show "Connection error. Please check your internet connection." with retry option

**Data Changes**: None (data fetch and parsing only)

**Code Reference**:

- `frontend/src/components/admin/CleanupResultsModal.tsx` (button handler)
- `frontend/src/components/admin/JingleCancionMatchModal.tsx` (to be created)
- Backend API: `GET /api/admin/:type/:id` where `type=jingles` and `id=jingleId`

---

### Step 3: Parse Jingle Comment

**User Action**: Wait for parsing to complete (automatic)

**System Response**:

- Parse Jingle comment text to extract:
  - **Timestamp** (if present, e.g., "00:02:30")
  - **Song Title** (potential song name)
  - **Artist Name** (potential artist/author name)
  - **Contributor** (jinglero contributor name, if mentioned)
  - **Jingle Title** (if different from song title)
  - **Additional Commentary** (any other text)
- Display parsed information in structured format
- Show confidence indicators for each extracted field

**UI State**:

- Parsed information displayed in sections:
  - **Extracted Song Title**: [extracted text] (confidence: High/Medium/Low)
  - **Extracted Artist Name**: [extracted text] (confidence: High/Medium/Low)
  - **Other Information**: [timestamp, contributor, etc.]
- Raw comment text shown in collapsible section for reference

**Parsing Algorithm** (Rule-Based):

```typescript
interface ParsedComment {
  songTitle?: string;
  artistName?: string;
  timestamp?: string;
  contributor?: string;
  jingleTitle?: string;
  commentary?: string;
  confidence: {
    songTitle: "high" | "medium" | "low";
    artistName: "high" | "medium" | "low";
  };
}

function parseJingleComment(comment: string, title?: string): ParsedComment {
  // Common patterns:
  // 1. "Song Title - Artist Name"
  // 2. "Artist Name - Song Title"
  // 3. "Song Title by Artist Name"
  // 4. "Song Title (Artist Name)"
  // 5. Timestamp at start: "00:02:30 Song Title - Artist"
  // 6. Contributor mention: "Song Title - Artist (contributed by Contributor)"

  const result: ParsedComment = {
    confidence: { songTitle: "low", artistName: "low" },
  };

  // Extract timestamp (HH:MM:SS or MM:SS format)
  const timestampMatch = comment.match(/(\d{1,2}):(\d{2}):?(\d{2})?/);
  if (timestampMatch) {
    result.timestamp = timestampMatch[0];
  }

  // Remove timestamp from text for further parsing
  let text = comment.replace(/(\d{1,2}):(\d{2}):?(\d{2})?/, "").trim();

  // Pattern 1: "Song Title - Artist Name"
  const dashPattern = /^(.+?)\s*-\s*(.+)$/;
  const dashMatch = text.match(dashPattern);
  if (dashMatch) {
    result.songTitle = dashMatch[1].trim();
    result.artistName = dashMatch[2].trim();
    result.confidence.songTitle = "high";
    result.confidence.artistName = "high";
    return result;
  }

  // Pattern 2: "Song Title by Artist Name"
  const byPattern = /^(.+?)\s+by\s+(.+)$/i;
  const byMatch = text.match(byPattern);
  if (byMatch) {
    result.songTitle = byMatch[1].trim();
    result.artistName = byMatch[2].trim();
    result.confidence.songTitle = "high";
    result.confidence.artistName = "high";
    return result;
  }

  // Pattern 3: "Song Title (Artist Name)"
  const parenPattern = /^(.+?)\s*\((.+?)\)/;
  const parenMatch = text.match(parenPattern);
  if (parenMatch) {
    result.songTitle = parenMatch[1].trim();
    result.artistName = parenMatch[2].trim();
    result.confidence.songTitle = "high";
    result.confidence.artistName = "medium";
    return result;
  }

  // If no clear pattern, use entire text as potential song title
  if (text.length > 0) {
    result.songTitle = text;
    result.confidence.songTitle = "low";
  }

  // Check if title property contains additional info
  if (title && title !== text) {
    result.jingleTitle = title;
  }

  return result;
}
```

**Code Reference**:

- `frontend/src/lib/utils/commentParser.ts` (to be created)
- `frontend/src/components/admin/JingleCancionMatchModal.tsx` (parsing display)

---

### Step 4: Search for Matches

**User Action**: Wait for searches to complete (automatic)

**System Response**:

- Search existing Canciones in database:
  - Use extracted song title to search Canciones
  - Use fuzzy string matching to handle typos and variations
  - Filter by artist name if available (also with fuzzy matching)
  - Return matches with similarity scores
- Search MusicBrainz:
  - Query MusicBrainz API with song title and artist name
  - Return top matches with confidence scores
  - Include MusicBrainz ID, album, year, genre if available
- Combine and rank all matches:
  - Database matches (higher priority if artist also matches)
  - MusicBrainz matches (with confidence scores)
  - Sort by confidence/relevance

**UI State**:

- Search results displayed in two sections:
  - **Database Matches**: List of existing Canciones with similarity scores
  - **MusicBrainz Matches**: List of MusicBrainz recordings with confidence scores
- Each match shows:
  - Song title
  - Artist name(s)
  - Confidence/Similarity score (visual indicator)
  - Additional metadata (album, year, genre) if available
  - "Select" button

**Fuzzy Matching Algorithm**:

```typescript
function calculateSimilarity(str1: string, str2: string): number {
  // Normalize strings
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "");
  const n1 = normalize(str1);
  const n2 = normalize(str2);

  // Exact match
  if (n1 === n2) return 1.0;

  // One contains the other
  if (n1.includes(n2) || n2.includes(n1)) return 0.9;

  // Levenshtein distance (simplified)
  const maxLen = Math.max(n1.length, n2.length);
  const distance = levenshteinDistance(n1, n2);
  return 1.0 - distance / maxLen;
}

async function searchDatabaseCanciones(
  songTitle: string,
  artistName?: string
): Promise<Array<{ cancion: Cancion; similarity: number }>> {
  // Search Canciones by title (fuzzy)
  const query = `
    MATCH (c:Cancion)
    WHERE toLower(c.title) CONTAINS toLower($songTitle)
       OR toLower($songTitle) CONTAINS toLower(c.title)
    OPTIONAL MATCH (a:Artista)-[:AUTOR_DE]->(c)
    WITH c, collect(a) AS artistas
    RETURN c, artistas
  `;

  const results = await db.executeQuery(query, { songTitle });

  return results
    .map((result) => {
      const cancion = result.c;
      const artistas = result.artistas;

      // Calculate similarity for title
      const titleSimilarity = calculateSimilarity(songTitle, cancion.title);

      // Calculate similarity for artist if provided
      let artistSimilarity = 0;
      if (artistName && artistas.length > 0) {
        artistSimilarity = Math.max(
          ...artistas.map((a) =>
            Math.max(
              calculateSimilarity(artistName, a.name || ""),
              calculateSimilarity(artistName, a.stageName || "")
            )
          )
        );
      }

      // Combined similarity (weighted: 70% title, 30% artist)
      const similarity = artistName
        ? titleSimilarity * 0.7 + artistSimilarity * 0.3
        : titleSimilarity;

      return { cancion, similarity };
    })
    .filter((m) => m.similarity > 0.5) // Only return matches above 50% similarity
    .sort((a, b) => b.similarity - a.similarity);
}
```

**Code Reference**:

- `frontend/src/lib/utils/fuzzyMatch.ts` (to be created)
- `backend/src/server/api/search.ts` - Search endpoint (may need enhancement)
- `backend/src/server/utils/musicbrainz.ts` - `searchRecording()` function

---

### Step 5: Review and Select Match

**User Action**: Review search results and select a match, or choose to create new entities

**System Response**:

- Display ranked list of matches:
  - **Database Matches** section (if any found)
    - Each match shows: Song title, Artist(s), Similarity score, "Select" button
  - **MusicBrainz Matches** section (if any found)
    - Each match shows: Song title, Artist, Confidence score, Album, Year, "Select" button
- If no good matches found:
  - Show "Create New Cancion" option
  - Pre-fill form with extracted song title and artist name
- Allow user to:
  - Select an existing Cancion from database
  - Select a MusicBrainz match (will create Cancion from MusicBrainz data)
  - Create new Cancion manually
  - Cancel and return to results

**UI State**:

- Match selection interface visible
- Database matches listed (if any)
- MusicBrainz matches listed (if any)
- "Create New" button visible
- "Cancel" button visible
- Selected match highlighted (if user hovers/clicks)

**Data Changes**: None (selection only)

**Code Reference**:

- `frontend/src/components/admin/JingleCancionMatchModal.tsx` (match selection UI)

---

### Step 6: Confirm and Create Relationships

**User Action**: Click "Select" button on a match or "Create New" button

**System Response**:

**Scenario A: Existing Cancion Selected**

1. Check if Cancion has AUTOR_DE relationship with matching Artista
2. If Artista doesn't exist or relationship missing:
   - Create Artista entity (if doesn't exist)
   - Create AUTOR_DE relationship
3. Create VERSIONA relationship: Jingle → Cancion
4. Show success message
5. Close modal and refresh cleanup results

**Scenario B: MusicBrainz Match Selected**

1. Create Cancion entity from MusicBrainz data:
   - Title, Album, Year, Genre from MusicBrainz
   - MusicBrainz ID stored
2. Create Artista entity (if doesn't exist):
   - Name from MusicBrainz artist credit
   - MusicBrainz ID if available
3. Create AUTOR_DE relationship: Artista → Cancion
4. Create VERSIONA relationship: Jingle → Cancion
5. Show success message
6. Close modal and refresh cleanup results

**Scenario C: Create New Cancion**

1. Show form pre-filled with extracted data
2. User edits and confirms
3. Create Cancion entity
4. Create Artista entity (if provided and doesn't exist)
5. Create AUTOR_DE relationship (if Artista provided)
6. Create VERSIONA relationship: Jingle → Cancion
7. Show success message
8. Close modal and refresh cleanup results

**UI State**:

- Confirmation dialog or form visible (depending on scenario)
- Loading state: `isCreating = true` while creating entities/relationships
- Success message displayed after completion
- Modal closes automatically or shows "Done" button

**Loading States**:

- Show loading spinner during entity creation
- Show progress: "Creating Cancion...", "Creating Artista...", "Creating relationships..."
- Disable all buttons during creation

**Error Handling**:

- If Cancion creation fails: Show error message with retry option
- If Artista creation fails: Show error, but continue if Cancion was created
- If AUTOR_DE relationship creation fails: Show warning, allow manual creation
- If VERSIONA relationship creation fails: Show error with retry option
- Network errors: Show "Connection error" with retry option

**Data Changes**:

- New Cancion entity created (if scenario B or C)
- New Artista entity created (if doesn't exist)
- AUTOR_DE relationship created (if Artista provided)
- VERSIONA relationship created: Jingle → Cancion
- Jingle redundant properties (cancionId, songTitle, artistName, genre) auto-synced

**Code Reference**:

- `frontend/src/components/admin/JingleCancionMatchModal.tsx` (creation handlers)
- `frontend/src/lib/api/client.ts` - `adminApi.createCancion()`, `adminApi.createArtista()`
- `frontend/src/lib/api/client.ts` - `adminApi.post('/relationships/AUTOR_DE')`, `adminApi.post('/relationships/VERSIONA')`
- `backend/src/server/api/admin.ts:1455` - Create entity endpoint
- `backend/src/server/api/admin.ts` - Create relationship endpoints

---

### Step 7: Close Modal

**User Action**: Click "Close" or "Done" button, or click outside modal

**System Response**:

- Close JingleCancionMatchModal
- Return to CleanupResultsModal
- Optionally refresh CleanupResultsModal to show updated counts (if relationships were created)
- Update Jingle instance report to show it now has a Cancion relationship (or remove from list)

**UI State**:

- JingleCancionMatchModal closed
- CleanupResultsModal visible again
- Results may be refreshed if entities/relationships were created

**Data Changes**: None (UI state only)

---

## Technical Implementation Details

### Comment Parsing Strategy

**Phase 1: Rule-Based Parsing**

1. **Pattern Recognition**:

   - Common delimiters: " - ", " by ", " (", ")"
   - Timestamp patterns: HH:MM:SS, MM:SS
   - Contributor patterns: "contributed by", "by [name]", etc.

2. **Extraction Priority**:

   - High confidence: Clear delimiters (dash, "by", parentheses)
   - Medium confidence: Partial matches, single field extraction
   - Low confidence: Ambiguous text, no clear pattern

3. **Fallback Strategy**:
   - If parsing yields low confidence, use entire comment as potential song title
   - Allow user to manually edit extracted fields

**Phase 2: LLM-Enhanced Parsing (Future)**

1. **Trigger Conditions**:

   - Rule-based parsing confidence < 0.6
   - No matches found in database or MusicBrainz
   - User explicitly requests "Advanced parsing"

2. **LLM Integration**:

   - Send comment text to LLM API (Gemini, OpenAI, etc.)
   - Request structured extraction: {songTitle, artistName, timestamp, contributor}
   - Return structured data with confidence scores
   - Cache results to avoid repeated API calls

3. **Cost Management**:
   - Only use LLM when necessary
   - Cache common patterns
   - Batch requests when possible

### Fuzzy Matching Implementation

**String Similarity Algorithms**:

1. **Levenshtein Distance**: For character-level differences
2. **Jaro-Winkler**: For name matching (better for artist names)
3. **Token-based Matching**: Split into words, compare word sets
4. **Normalization**: Remove punctuation, lowercase, handle accents

**Implementation**:

- Use library like `fuse.js` or `string-similarity` for frontend
- Or implement custom similarity function in backend
- Threshold: Only show matches with similarity > 0.5 (50%)

### MusicBrainz Integration

**Search Strategy**:

1. **Primary Search**: Song title + artist name (if available)
2. **Fallback Search**: Song title only (if artist not found)
3. **Confidence Scoring**: Use existing `calculateConfidence()` function from `musicbrainz.ts`
4. **Result Filtering**: Only show matches with confidence > 0.7 (70%)

**Rate Limiting**:

- MusicBrainz API: 1 request per second (already implemented)
- Cache results when possible
- Show progress indicator during search

### Entity Creation Flow

**Cancion Creation**:

```typescript
async function createCancionFromMatch(
  match: MusicBrainzMatch | DatabaseMatch,
  extractedData: ParsedComment
): Promise<Cancion> {
  const cancionData: Partial<Cancion> = {
    title: match.title,
    album: match.album,
    year: match.year,
    genre: match.genre,
  };

  if ("musicBrainzId" in match) {
    cancionData.musicBrainzId = match.musicBrainzId;
  }

  return await adminApi.createCancion(cancionData);
}
```

**Artista Creation**:

```typescript
async function createOrGetArtista(
  artistName: string,
  musicBrainzId?: string
): Promise<Artista> {
  // First, search for existing Artista
  const existing = await searchArtistas(artistName);
  if (existing.length > 0 && existing[0].similarity > 0.9) {
    return existing[0].artista;
  }

  // Create new Artista
  const artistaData: Partial<Artista> = {
    name: artistName,
  };

  if (musicBrainzId) {
    artistaData.musicBrainzId = musicBrainzId;
  }

  return await adminApi.createArtista(artistaData);
}
```

**Relationship Creation**:

```typescript
async function createRelationships(
  jingleId: string,
  cancionId: string,
  artistaId?: string
): Promise<void> {
  // Create VERSIONA: Jingle → Cancion
  await adminApi.post("/relationships/VERSIONA", {
    start: jingleId,
    end: cancionId,
    status: "DRAFT", // User should confirm before setting to CONFIRMED
  });

  // Create AUTOR_DE: Artista → Cancion (if artista provided)
  if (artistaId) {
    // Check if relationship already exists
    const existing = await checkAutorDeRelationship(artistaId, cancionId);
    if (!existing) {
      await adminApi.post("/relationships/AUTOR_DE", {
        start: artistaId,
        end: cancionId,
        status: "DRAFT",
      });
    }
  }
}
```

### API Endpoints

**Fetch Jingle**:

- **Endpoint**: `GET /api/admin/:type/:id` where `type=jingles` and `id=jingleId`
- **Code Reference**: `backend/src/server/api/admin.ts:1438-1453`
- **Frontend Method**: `adminApi.getJingle(jingleId)` or `adminApi.get('/jingles/' + jingleId)`
- **Response**: Jingle entity with properties

**Search Canciones**:

- **Endpoint**: `GET /api/search?q={query}&types=canciones`
- **Code Reference**: `backend/src/server/api/search.ts:76-263`
- **Frontend Method**: `adminApi.search({ q: query, types: 'canciones' })`
- **Response**: Array of Canciones matching query
- **Note**: May need enhancement for fuzzy matching

**Search Artistas**:

- **Endpoint**: `GET /api/search?q={query}&types=artistas`
- **Code Reference**: `backend/src/server/api/search.ts:76-263`
- **Frontend Method**: `adminApi.search({ q: query, types: 'artistas' })`
- **Response**: Array of Artistas matching query

**Create Cancion**:

- **Endpoint**: `POST /api/admin/canciones`
- **Code Reference**: `backend/src/server/api/admin.ts:1455-1535`
- **Frontend Method**: `adminApi.createCancion(data)`
- **Request Body**: `{ title, album?, year?, genre?, musicBrainzId? }`
- **Response**: Created Cancion object

**Create Artista**:

- **Endpoint**: `POST /api/admin/artistas`
- **Code Reference**: `backend/src/server/api/admin.ts:1455-1535`
- **Frontend Method**: `adminApi.createArtista(data)`
- **Request Body**: `{ name, stageName?, musicBrainzId?, ... }`
- **Response**: Created Artista object

**Create AUTOR_DE Relationship**:

- **Endpoint**: `POST /api/admin/relationships/AUTOR_DE`
- **Code Reference**: `backend/src/server/api/admin.ts` (relationship creation)
- **Frontend Method**: `adminApi.post('/relationships/AUTOR_DE', payload)`
- **Request Body**: `{ start: artistaId, end: cancionId, status?: 'DRAFT' | 'CONFIRMED' }`
- **Response**: Created relationship object

**Create VERSIONA Relationship**:

- **Endpoint**: `POST /api/admin/relationships/VERSIONA`
- **Code Reference**: `backend/src/server/api/admin.ts` (relationship creation)
- **Frontend Method**: `adminApi.post('/relationships/VERSIONA', payload)`
- **Request Body**: `{ start: jingleId, end: cancionId, status?: 'DRAFT' | 'CONFIRMED' }`
- **Response**: Created relationship object

**MusicBrainz Search** (Backend):

- **Function**: `searchRecording(title, artist?, limit?)`
- **Code Reference**: `backend/src/server/utils/musicbrainz.ts:216-277`
- **Returns**: Array of `MusicBrainzMatch` objects with confidence scores
- **Note**: May need new backend endpoint to expose this to frontend, or call from existing cleanup script endpoint

## Data Model

### Jingle Entity

- `id`: string
- `title`: string (optional)
- `comment`: string (optional) - Source text for parsing
- `cancionId`: string (optional, redundant property, auto-synced from VERSIONA)

### Cancion Entity

- `id`: string
- `title`: string
- `album`: string (optional)
- `year`: number (optional)
- `genre`: string (optional)
- `musicBrainzId`: string (optional)

### Artista Entity

- `id`: string
- `name`: string
- `stageName`: string (optional)
- `musicBrainzId`: string (optional)

### VERSIONA Relationship

- `start`: Jingle ID
- `end`: Cancion ID
- `status`: 'DRAFT' | 'CONFIRMED'
- `createdAt`: datetime

### AUTOR_DE Relationship

- `start`: Artista ID
- `end`: Cancion ID
- `status`: 'DRAFT' | 'CONFIRMED'
- `createdAt`: datetime

## Code References

### Frontend Components

- **CleanupResultsModal**: `frontend/src/components/admin/CleanupResultsModal.tsx`

  - Lines 320-334: Entity card with "Ver Entidad" button
  - **To be added**: "ARREGLAR" button below "Ver Entidad" for Jingles without Cancion

- **JingleCancionMatchModal**: `frontend/src/components/admin/JingleCancionMatchModal.tsx` (to be created)

  - New component for matching workflow
  - Handles comment parsing, matching, and entity/relationship creation

- **Comment Parser**: `frontend/src/lib/utils/commentParser.ts` (to be created)

  - `parseJingleComment()`: Parses comment text to extract song/artist information

- **Fuzzy Matcher**: `frontend/src/lib/utils/fuzzyMatch.ts` (to be created)

  - `calculateSimilarity()`: Calculates string similarity score
  - `searchDatabaseCanciones()`: Searches Canciones with fuzzy matching

- **API Client**: `frontend/src/lib/api/client.ts`
  - `adminApi.createCancion()`: Creates Cancion entity
  - `adminApi.createArtista()`: Creates Artista entity
  - `adminApi.post('/relationships/AUTOR_DE')`: Creates AUTOR_DE relationship
  - `adminApi.post('/relationships/VERSIONA')`: Creates VERSIONA relationship

### Backend API

- **Create Entity**: `backend/src/server/api/admin.ts:1455`

  - `POST /api/admin/:type` where `type=canciones` or `type=artistas`
  - Auto-syncs redundant properties with relationships

- **Create Relationships**: `backend/src/server/api/admin.ts` (relationship endpoints)

  - `POST /api/admin/relationships/AUTOR_DE`
  - `POST /api/admin/relationships/VERSIONA`

- **Search**: `backend/src/server/api/search.ts:76-263`

  - `GET /api/search` - May need enhancement for fuzzy matching

- **MusicBrainz Client**: `backend/src/server/utils/musicbrainz.ts`

  - `searchRecording()`: Searches MusicBrainz for recordings
  - `calculateConfidence()`: Calculates match confidence scores

- **Cleanup Script**: `backend/src/server/db/cleanup/scripts/jingles.ts:252-341`
  - `findJinglesWithoutCancion()`: Identifies Jingles missing VERSIONA relationships

### Schema Documentation

- **VERSIONA Relationship**: `docs/4_backend_database-schema/schema/relationships.md:202-258`

  - Relationship structure and properties

- **AUTOR_DE Relationship**: `docs/4_backend_database-schema/schema/relationships.md:169-199`

  - Relationship structure and properties

- **Jingle Node**: `docs/4_backend_database-schema/schema/nodes.md:180-398`

  - Jingle entity properties including `title` and `comment`

- **Cancion Node**: `docs/4_backend_database-schema/schema/nodes.md:400-600` (approximate)

  - Cancion entity properties

- **Artista Node**: `docs/4_backend_database-schema/schema/nodes.md:600-800` (approximate)
  - Artista entity properties

## UI/UX Specifications

### Modal Layout

- **Modal Size**: Max width 1000px, max height 90vh
- **Modal Position**: Centered overlay on top of CleanupResultsModal
- **Modal Styling**:
  - White background (#fff)
  - Border radius: 8px
  - Box shadow: 0 4px 20px rgba(0, 0, 0, 0.5)
  - Padding: 2rem
  - Close button: Top-right corner (× icon)

### Parsing Results Display

- **Section Layout**: Collapsible sections for each extracted field
- **Confidence Indicators**: Color-coded badges (Green: High, Yellow: Medium, Red: Low)
- **Raw Comment**: Collapsible section showing original comment text

### Match Results Display

- **Two-Column Layout**: Database matches on left, MusicBrainz matches on right
- **Match Cards**: Each match in a card with:
  - Song title (bold)
  - Artist name(s)
  - Confidence/Similarity score (progress bar or percentage)
  - Additional metadata (album, year, genre) in smaller text
  - "Select" button (primary action)
- **Empty States**: "No matches found" message with "Create New" option

### Button States

- **"ARREGLAR" button (enabled)**:

  - Background: #1976d2 (blue)
  - Color: white
  - Padding: 0.25rem 0.5rem
  - Border radius: 4px
  - Cursor: pointer
  - Hover: Darker blue (#1565c0)

- **"Select" button (enabled)**:

  - Background: #4caf50 (green)
  - Color: white
  - Padding: 0.5rem 1rem
  - Border radius: 4px
  - Cursor: pointer

- **"Select" button (loading)**:
  - Background: #4caf50
  - Show spinner icon
  - Disabled state
  - Text: "Creating..."

### Accessibility

- **Keyboard Navigation**:
  - Tab through match cards
  - Enter/Space to select match
  - Escape to close modal
- **Screen Reader Support**:
  - Match cards properly labeled
  - Confidence scores announced
  - Button states announced
- **Focus Management**:
  - Focus trap within modal
  - Focus returns to "ARREGLAR" button after closing

## Error Handling Specifications

### Error Scenarios

1. **Jingle Fetch Failure**

   - **Trigger**: Network error, 404, 500, or timeout
   - **UI Response**: Show error message with retry button
   - **User Action**: Click retry to attempt fetch again

2. **Parsing Failure**

   - **Trigger**: Comment text is unparseable or empty
   - **UI Response**: Show warning, allow manual entry of song title/artist
   - **User Action**: Manually enter information or cancel

3. **Database Search Failure**

   - **Trigger**: Network error or search API failure
   - **UI Response**: Show warning, continue with MusicBrainz search only
   - **User Action**: Proceed with MusicBrainz matches or create new

4. **MusicBrainz Search Failure**

   - **Trigger**: Network error, rate limit, or API failure
   - **UI Response**: Show warning, continue with database matches only
   - **User Action**: Proceed with database matches or create new

5. **Entity Creation Failure**

   - **Trigger**: Validation error, network error, or duplicate entity
   - **UI Response**: Show specific error message with retry option
   - **User Action**: Review error, fix if needed, click retry

6. **Relationship Creation Failure**
   - **Trigger**: Network error, validation error, or duplicate relationship
   - **UI Response**: Show warning if entity was created, allow manual relationship creation
   - **User Action**: Manually create relationship or use provided link

## Loading States

### Initial Data Fetch

- **State Variable**: `isLoading = true`
- **UI Display**: Show loading spinner with "Loading Jingle data..."
- **Duration**: Typically < 1 second

### Comment Parsing

- **State Variable**: `isParsing = true`
- **UI Display**: Show progress indicator "Parsing comment..."
- **Duration**: Typically < 100ms

### Database Search

- **State Variable**: `isSearchingDatabase = true`
- **UI Display**: Show progress indicator "Searching database..."
- **Duration**: Typically < 1 second

### MusicBrainz Search

- **State Variable**: `isSearchingMusicBrainz = true`
- **UI Display**: Show progress indicator "Searching MusicBrainz..."
- **Duration**: Typically 1-3 seconds (due to rate limiting)

### Entity Creation

- **State Variable**: `isCreating = true`
- **UI Display**: Show loading spinner on "Select" button, disable all buttons
- **Duration**: Typically 1-3 seconds

## Edge Cases and Considerations

1. **Empty or Missing Comment**: Allow manual entry of song title/artist
2. **Ambiguous Parsing**: Show multiple interpretation options for user to choose
3. **Multiple Artists**: Handle collaborations (multiple AUTOR_DE relationships)
4. **Duplicate Matches**: Show all matches, let user choose best one
5. **Very Long Comments**: Truncate in display, show full in expandable section
6. **Special Characters**: Handle accents, punctuation, Unicode properly
7. **Existing Relationships**: Check if VERSIONA already exists before creating
8. **Concurrent Edits**: If another user creates relationship while modal is open, refresh on next action
9. **Low Confidence Matches**: Require explicit user confirmation for matches < 0.7 confidence
10. **MusicBrainz Rate Limiting**: Queue requests, show progress, handle gracefully

## Future Enhancements

1. **LLM-Enhanced Parsing**: Add optional LLM parsing for complex comments (Phase 2)
2. **Bulk Processing**: Allow processing multiple Jingles at once
3. **Learning from Confirmations**: Store user corrections to improve parsing patterns
4. **Match History**: Show previously matched Jingles for reference
5. **Confidence Thresholds**: Allow user to adjust confidence thresholds
6. **Manual Override**: Always allow manual entry even when matches are found
7. **Batch MusicBrainz Queries**: Optimize API usage for multiple searches
8. **Caching**: Cache MusicBrainz results to avoid repeated queries

## Validation Checklist

**Last Validated**: 2025-11-30  
**Validation Status**: discrepancies_found  
**Workflow Version**: 1.0

### Summary

- **Total Checks**: 45
- **Passed**: 18 (40%)
- **Needs Implementation**: 24 (53%)
- **Gaps Found**: 3 (7%)

See [`WORKFLOW_011_database-cleanup_jingle-cancion-match_validation.md`](./WORKFLOW_011_database-cleanup_jingle-cancion-match_validation.md) for complete validation report.

### Code References

- [x] GET /api/admin/:type/:id - ✅ Validated (backend/src/server/api/admin.ts:1438-1453)
- [x] POST /api/admin/canciones - ✅ Validated (backend/src/server/api/admin.ts:1455-1535)
- [x] POST /api/admin/artistas - ✅ Validated (backend/src/server/api/admin.ts:1455-1535)
- [x] POST /api/admin/relationships/AUTOR_DE - ✅ Validated (backend/src/server/api/admin.ts:831-985)
- [x] POST /api/admin/relationships/VERSIONA - ✅ Validated (backend/src/server/api/admin.ts:831-985)
- [x] GET /api/search - ✅ Validated (backend/src/server/api/search.ts:76-263) - ⚠️ Gap: Needs fuzzy matching enhancement
- [ ] POST /api/admin/musicbrainz/search - ❌ **Gap**: Endpoint needs creation
- [x] frontend/src/lib/api/client.ts methods - ✅ Validated (getJingle, createArtista, createCancion, post exist)
- [ ] frontend/src/lib/api/client.ts search() - ⚠️ **Gap**: Method needs creation

### Components

- [x] CleanupResultsModal.tsx - ✅ Exists, needs ARREGLAR button addition
- [ ] JingleCancionMatchModal.tsx - ❌ **Gap**: Component needs creation
- [ ] commentParser.ts - ❌ **Gap**: Utility needs creation
- [ ] fuzzyMatch.ts - ❌ **Gap**: Utility needs creation

### State Management

- [x] All state variables can be implemented - ✅ Validated
- [x] State transitions are valid - ✅ Validated
- [x] Loading states for concurrent operations - ✅ Validated

### Data Flow

- [x] Jingle fetch flow - ✅ Validated
- [x] Comment parsing flow - ⚠️ Validated (parser needs creation)
- [x] Database search flow - ⚠️ Validated (fuzzy matcher needs creation)
- [x] MusicBrainz search flow - ❌ Validated (endpoint needs creation)
- [x] Entity creation flow - ✅ Validated
- [x] Redundant property sync - ✅ Validated

### External API Integration

- [x] MusicBrainz rate limiting - ✅ Validated
- [x] Error handling - ✅ Validated
- [ ] Caching strategy - ⚠️ Not implemented (optional enhancement)
- [x] Security (backend-only calls) - ✅ Validated

### Integration Points

- [x] Parent workflow integration - ✅ Validated
- [ ] ARREGLAR button for Jingles - ⚠️ Needs addition to CleanupResultsModal
- [x] Related workflow dependencies - ✅ Validated

### Architecture

- [x] Performance considerations - ✅ Validated
- [x] Security validation - ✅ Validated
- [x] Scalability considerations - ✅ Validated

## Related Workflows

- **Parent Workflow**: [`WORKFLOW_011_database-cleanup.md`](./WORKFLOW_011_database-cleanup.md)

  - This feature is accessed from cleanup script results (Step 6b, to be added)

- **Similar Workflow**: [`WORKFLOW_011_database-cleanup_fabrica-timestamp-fix.md`](./WORKFLOW_011_database-cleanup_fabrica-timestamp-fix.md)
  - Similar pattern of "ARREGLAR" button triggering detailed fix modal

## Change History

| Version | Date       | Change                | Author | Rationale |
| ------- | ---------- | --------------------- | ------ | --------- |
| 1.0     | 2025-11-30 | Initial documentation | -      | Baseline  |

---

**Last Updated**: 2025-11-30
**Last Validated**: 2025-11-30
**Status**: draft - Feature specification complete, validation complete, gaps identified, ready for implementation
