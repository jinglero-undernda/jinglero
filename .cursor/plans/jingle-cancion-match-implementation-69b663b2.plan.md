<!-- 69b663b2-73af-4004-b873-e0ed32e343ac 238bfc40-f61f-4f94-8550-eb9a967cd3a2 -->
# Implementation Plan: Jingle-Cancion Matching Workflow

## Overview

This plan implements WORKFLOW_011: Jingle-Cancion Matching and Relationship Creation. The workflow allows admins to match Jingles without Cancion relationships by parsing comments, searching the database and MusicBrainz, and creating missing entities and relationships.

## Implementation Tasks

### Phase 1: Backend - MusicBrainz Search Endpoint

**Task 1.1**: Create MusicBrainz search endpoint

- **File**: `backend/src/server/api/admin.ts`
- **Action**: Add `POST /api/admin/musicbrainz/search` route handler
- **Location**: After existing admin routes (around line 1535)
- **Implementation**:
  - Import `searchRecording` from `../utils/musicbrainz`
  - Accept `{ title: string, artist?: string, limit?: number }` in request body
  - Call `searchRecording(title, artist, limit || 10)`
  - Return array of `MusicBrainzMatch[]`
  - Handle errors gracefully (return empty array on failure)
  - Use existing `asyncHandler` wrapper for error handling
- **Reference**: Validation doc section 9, gap #1

### Phase 2: Frontend Utilities

**Task 2.1**: Create comment parser utility

- **File**: `frontend/src/lib/utils/commentParser.ts` (new file)
- **Action**: Implement `parseJingleComment()` function
- **Patterns to handle**:
  - Dash separator: "Song Title - Artist Name"
  - "by" keyword: "Song Title by Artist Name"
  - Parentheses: "Song Title (Artist Name)"
  - Timestamp extraction: "00:02:30" or "2:30"
  - Contributor names (optional)
- **Return type**: `ParsedComment` interface with:
  - `songTitle?: string`
  - `artistName?: string`
  - `timestamp?: number` (seconds)
  - `contributor?: string`
  - `confidence: number` (0.0-1.0)
- **Reference**: Validation doc section 3, gap #3; Workflow doc Step 3

**Task 2.2**: Create fuzzy matching utility

- **File**: `frontend/src/lib/utils/fuzzyMatch.ts` (new file)
- **Action**: Implement fuzzy matching functions
- **Functions**:
  - `calculateSimilarity(str1: string, str2: string): number` - Returns 0.0-1.0
  - `searchDatabaseCanciones(songTitle: string, artistName?: string): Promise<Array<{ cancion: Cancion, similarity: number }>>`
- **Implementation approach**:
  - Use library like `fuse.js` (recommended) or implement Levenshtein distance
  - For `searchDatabaseCanciones`: Call `adminApi.search()` then apply fuzzy matching
  - Sort results by similarity descending
- **Reference**: Validation doc section 3, gap #4; Workflow doc Step 4

### Phase 3: Frontend API Client

**Task 3.1**: Add search method to AdminApiClient

- **File**: `frontend/src/lib/api/client.ts`
- **Action**: Add `search()` method to `AdminApiClient` class
- **Location**: After existing methods (around line 640)
- **Signature**:
  ```typescript
  async search(params: { q: string; types?: string; limit?: number; offset?: number }): Promise<SearchResults>
  ```

- **Implementation**: Build query params and call `GET /api/search`
- **Reference**: Validation doc section 3, gap #5

**Task 3.2**: Add MusicBrainz search method to AdminApiClient

- **File**: `frontend/src/lib/api/client.ts`
- **Action**: Add `searchMusicBrainz()` method
- **Signature**:
  ```typescript
  async searchMusicBrainz(params: { title: string; artist?: string; limit?: number }): Promise<MusicBrainzMatch[]>
  ```

- **Implementation**: Call `POST /api/admin/musicbrainz/search` (from Task 1.1)
- **Reference**: Validation doc section 3

### Phase 4: Frontend Component - JingleCancionMatchModal

**Task 4.1**: Create JingleCancionMatchModal component structure

- **File**: `frontend/src/components/admin/JingleCancionMatchModal.tsx` (new file)
- **Action**: Create component with props interface
- **Props**: `{ jingleId: string, isOpen: boolean, onClose: () => void }`
- **State variables** (all documented in validation):
  - `jingle: Jingle | null`
  - `parsedData: ParsedComment | null`
  - `databaseMatches: Array<{ cancion: Cancion, similarity: number }>`
  - `musicBrainzMatches: MusicBrainzMatch[]`
  - `isLoading`, `isParsing`, `isSearchingDatabase`, `isSearchingMusicBrainz`, `isCreating: boolean`
  - `error: string | null`
  - `selectedMatch: Match | null`
- **Reference**: Validation doc section 3, gap #2; Workflow doc Step 2

**Task 4.2**: Implement data fetching and parsing

- **File**: `frontend/src/components/admin/JingleCancionMatchModal.tsx`
- **Action**: Add `useEffect` to fetch Jingle and parse comment
- **Flow**:

  1. Fetch Jingle via `adminApi.getJingle(jingleId)`
  2. Parse comment using `parseJingleComment(comment, title)`
  3. Display parsed data in UI

- **Error handling**: Show error message on fetch failure
- **Reference**: Workflow doc Step 2-3

**Task 4.3**: Implement database and MusicBrainz search

- **File**: `frontend/src/components/admin/JingleCancionMatchModal.tsx`
- **Action**: Add search logic triggered after parsing
- **Flow**:

  1. If parsed song title exists, search database via `searchDatabaseCanciones()`
  2. Simultaneously search MusicBrainz via `adminApi.searchMusicBrainz()`
  3. Display results in two sections: "Database Matches" and "MusicBrainz Matches"
  4. Show similarity/confidence scores for each match

- **Reference**: Workflow doc Step 4-5

**Task 4.4**: Implement match selection and entity creation

- **File**: `frontend/src/components/admin/JingleCancionMatchModal.tsx`
- **Action**: Add handlers for match selection and creation
- **Flow**:

  1. User selects a match (database or MusicBrainz)
  2. If match is from MusicBrainz, create Cancion and Artista if needed:

     - Create Artista (if artist doesn't exist) via `adminApi.createArtista()`
     - Create Cancion via `adminApi.createCancion()` with `musicBrainzId`
     - Create AUTOR_DE relationship via `adminApi.post('/relationships/AUTOR_DE', ...)`

  1. Create VERSIONA relationship via `adminApi.post('/relationships/VERSIONA', ...)`
  2. Show success message and close modal

- **Error handling**: Show errors for each step, allow retry
- **Reference**: Workflow doc Step 6-7

**Task 4.5**: Implement UI layout and styling

- **File**: `frontend/src/components/admin/JingleCancionMatchModal.tsx`
- **Action**: Create modal UI following `FabricaTimestampFixModal` pattern
- **Sections**:
  - Header with Jingle title and close button
  - Parsed data display (song title, artist, confidence)
  - Database matches list (with similarity scores)
  - MusicBrainz matches list (with confidence scores)
  - Loading states for each operation
  - Error messages
  - Action buttons (Select Match, Cancel)
- **Styling**: Match existing modal patterns from `CleanupResultsModal` and `FabricaTimestampFixModal`
- **Reference**: Workflow doc UX Flow; `FabricaTimestampFixModal.tsx` for pattern

### Phase 5: Integration with CleanupResultsModal

**Task 5.1**: Add ARREGLAR button for Jingles

- **File**: `frontend/src/components/admin/CleanupResultsModal.tsx`
- **Action**: Add button similar to existing Fabrica button (lines 346-361)
- **Location**: In entity list rendering, after "Ver entidad" button
- **Condition**: `entity.entityType.toLowerCase() === 'jingle'`
- **Handler**: Open `JingleCancionMatchModal` with jingle ID
- **Reference**: Validation doc section 3, gap #6; Workflow doc Step 1

**Task 5.2**: Add state management for Jingle modal

- **File**: `frontend/src/components/admin/CleanupResultsModal.tsx`
- **Action**: Add state variables (similar to Fabrica modal state)
- **State**:
  - `showJingleMatchModal: boolean`
  - `selectedJingleId: string | null`
- **Import**: Import `JingleCancionMatchModal` component
- **Reference**: `CleanupResultsModal.tsx` lines 86-88, 459-469

**Task 5.3**: Add modal component to render tree

- **File**: `frontend/src/components/admin/CleanupResultsModal.tsx`
- **Action**: Add `JingleCancionMatchModal` component at end of JSX (similar to Fabrica modal)
- **Props**: Pass `jingleId`, `isOpen`, and `onClose` handler
- **Reference**: `CleanupResultsModal.tsx` lines 459-469

## Technical Decisions

1. **Fuzzy Matching Library**: Use `fuse.js` for frontend fuzzy matching (install via npm)
2. **Comment Parsing**: Rule-based approach (regex patterns) for Phase 1
3. **Error Handling**: Graceful degradation - show errors but allow user to continue
4. **Loading States**: Separate flags for each async operation (parsing, database search, MusicBrainz search, creation)
5. **Modal Pattern**: Follow `FabricaTimestampFixModal` structure and styling

## Dependencies

- **npm package**: `fuse.js` (for fuzzy matching)
- **Existing APIs**: All required endpoints exist except MusicBrainz search (Task 1.1)
- **Existing utilities**: None (all need to be created)

## Testing Checklist

After implementation:

- [ ] MusicBrainz endpoint returns results correctly
- [ ] Comment parser extracts song title and artist from various formats
- [ ] Fuzzy matching finds similar Canciones with correct similarity scores
- [ ] Modal opens when clicking ARREGLAR button
- [ ] Database and MusicBrainz searches execute in parallel
- [ ] Match selection creates entities and relationships correctly
- [ ] Error handling works for network failures
- [ ] Loading states display correctly
- [ ] Success message shows after relationship creation
- [ ] Modal closes and Jingle is removed/marked as fixed in results

## Estimated Time

- Phase 1 (Backend): 1-2 hours
- Phase 2 (Utilities): 3-4 hours
- Phase 3 (API Client): 1 hour
- Phase 4 (Component): 6-8 hours
- Phase 5 (Integration): 1-2 hours
- **Total**: 12-17 hours

### To-dos

- [ ] Create POST /api/admin/musicbrainz/search endpoint in backend/src/server/api/admin.ts
- [ ] Create frontend/src/lib/utils/commentParser.ts with parseJingleComment() function
- [ ] Create frontend/src/lib/utils/fuzzyMatch.ts with calculateSimilarity() and searchDatabaseCanciones() functions
- [ ] Add search() method to AdminApiClient in frontend/src/lib/api/client.ts
- [ ] Add searchMusicBrainz() method to AdminApiClient in frontend/src/lib/api/client.ts
- [ ] Create JingleCancionMatchModal component structure with props and state variables
- [ ] Implement Jingle fetching and comment parsing in JingleCancionMatchModal
- [ ] Implement database and MusicBrainz search in JingleCancionMatchModal
- [ ] Implement match selection and entity/relationship creation in JingleCancionMatchModal
- [ ] Implement UI layout and styling for JingleCancionMatchModal
- [ ] Add ARREGLAR button for Jingles in CleanupResultsModal
- [ ] Add state management for Jingle modal in CleanupResultsModal
- [ ] Add JingleCancionMatchModal to CleanupResultsModal render tree