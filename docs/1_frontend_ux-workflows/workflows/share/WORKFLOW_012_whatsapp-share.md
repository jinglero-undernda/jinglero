# WORKFLOW_012: WhatsApp Share

## Metadata

- **Status**: draft
- **User Experience Category**: Guest Experience
- **Access Level**: Public
- **Last Updated**: 2025-12-30
- **Last Validated**: 2025-12-30
- **Code Reference**: To be implemented
- **Version**: 1.0
- **Workflow Type**: Interaction Pattern

## User Intent

Users want to share pages from the Jinglero platform on WhatsApp. They want to share entity pages (Jingles, Canciones, Artistas, Temáticas, Fábricas) with context-specific titles and previews, as well as other pages (landing page, search results) with appropriate messaging.

## Overview

- **Purpose**: Enable users to share any page from the platform via WhatsApp with context-appropriate titles and previews
- **User Persona**:
  - **Primary**: Guest users browsing the platform who discover interesting content (jingles, songs, artists, themes, episodes) and want to share it with friends or family via WhatsApp
  - **Context**: Users are viewing entity detail pages or browsing the platform and want to quickly share what they're looking at
  - **Goals**: Share content easily, provide context to recipients, drive engagement and discovery
- **User Context**:
  - Users are viewing entity pages (jingle, canción, artista, temática, fábrica) or other pages (landing, search)
  - Users want to share the current page URL with a descriptive message
  - Users expect the shared link to show a preview with title and image when opened in WhatsApp
- **Success Criteria**:
  - "Compartir en WhatsApp" button is visible in the floating header on all pages
  - Clicking the button opens WhatsApp with a pre-filled message containing the page URL
  - For entity pages, the message includes entity-specific title (displayPrimary and displaySecondary)
  - For non-entity pages, the message includes appropriate generic title
  - Open Graph meta tags are set dynamically for proper preview generation
  - Preview image is based on the FileteSign SVG from the landing page
- **Related Components**:
  - `FloatingHeader.tsx` - Main component where button will be added
  - `FileteSign.tsx` - Source for preview image SVG
  - Entity inspection pages (`InspectJingle.tsx`, `InspectFabrica.tsx`, `InspectCancion.tsx`, `InspectArtista.tsx`, `InspectTematica.tsx`)
  - `index.html` - Where Open Graph meta tags will be managed
- **Dependencies**:
  - WORKFLOW_010: Basic Navigation Access (floating header navigation)
  - Entity data structure with `displayPrimary` and `displaySecondary` properties

## UX Flow

### Step 1: User Views Any Page

**User Action**: User navigates to any page on the platform (entity page, landing page, search page, etc.)

**System Response**:

- FloatingHeader component renders with all navigation buttons
- "Compartir en WhatsApp" button is visible in the floating header (in the right section with other buttons)
- System detects current route and page type

**UI State**:

- `location.pathname`: Current route path (e.g., `/j/j12345678`, `/f/fabricaId`, `/`, `/search`)
- `isEntityPage`: Boolean indicating if current page is an entity inspection page
- `entityType`: Entity type if on entity page (jingle, cancion, artista, tematica, fabrica)
- `entityId`: Entity ID if on entity page
- Visual: Floating header visible with "Compartir en WhatsApp" button

**Data Changes**: None (page load)

**Code Reference**: `frontend/src/components/composite/FloatingHeader.tsx:14-118`

### Step 2: System Determines Share Context

**User Action**: (Automatic - no user action)

**System Response**:

- System analyzes current route to determine share context
- For entity routes (`/j/:id`, `/c/:id`, `/a/:id`, `/t/:id`, `/f/:id`, `/show/:id`):
  - Extract entity type and ID from route
  - Fetch entity data if not already loaded (for Open Graph tags)
  - Extract `displayPrimary` and `displaySecondary` from entity
- For non-entity routes (`/`, `/search`, etc.):
  - Use generic share message

**UI State**:

- `shareTitle`: Title for share message (entity-specific or generic)
- `shareUrl`: Current page URL (window.location.href)
- `entityData`: Entity object if on entity page (contains displayPrimary, displaySecondary)

**Data Changes**:

- Entity data fetched if on entity page and not already loaded
- Share metadata prepared

**Code Reference**:

- Route detection: `frontend/src/components/composite/FloatingHeader.tsx:25` (useLocation)
- Entity route patterns: `frontend/src/lib/utils/entityDisplay.ts:53-62` (getEntityRoute)
- Entity data structure: `frontend/src/types/index.ts:68-122` (Entity interfaces with displayPrimary, displaySecondary)

### Step 3: System Sets Open Graph Meta Tags

**User Action**: (Automatic - no user action)

**System Response**:

- System dynamically updates Open Graph meta tags in document head
- For entity pages:
  - `og:title`: Entity displayPrimary (preserving emojis) + displaySecondary if available
  - `og:description`: Entity displaySecondary or generic description (preserving emojis)
  - `og:image`: URL to FileteSign SVG-based image (or rendered version)
  - `og:url`: Current page URL using `https://www.jingle.ar/` base domain
- For non-entity pages:
  - `og:title`: Generic title (e.g., "Cooperativa jingle.ar")
  - `og:description`: Generic description
  - `og:image`: FileteSign SVG-based image
  - `og:url`: Current page URL using `https://www.jingle.ar/` base domain

**UI State**:

- Meta tags in `<head>` updated dynamically
- WhatsApp will use these tags when generating link previews

**Data Changes**:

- Document head meta tags updated
- Preview metadata ready for WhatsApp

**Code Reference**:

- Meta tag management: To be implemented (likely in FloatingHeader or a custom hook)
- FileteSign SVG: `frontend/src/components/composite/FileteSign.tsx:32-262`
- Current HTML head: `frontend/index.html:1-26`

### Step 4: User Clicks "Compartir en WhatsApp" Button

**User Action**: User clicks the "Compartir en WhatsApp" button in the floating header

**System Response**:

- System constructs WhatsApp share URL
- Format: `https://wa.me/?text=${encodeURIComponent(message + url)}`
- For entity pages:
  - Message: Entity-specific message with displayPrimary and displaySecondary (preserving emojis)
  - URL: Current page URL using `https://www.jingle.ar/` base domain
- For non-entity pages:
  - Message: "¡Mira esto en Cooperativa jingle.ar!"
  - URL: Current page URL using `https://www.jingle.ar/` base domain
- Opens WhatsApp share interface in new tab/window

**UI State**:

- `whatsappUrl`: Constructed WhatsApp share URL
- Visual: WhatsApp app/web opens with pre-filled message

**Data Changes**: None (navigation to external service)

**Code Reference**:

- WhatsApp share function: To be implemented in FloatingHeader
- URL encoding: JavaScript `encodeURIComponent()`
- Research reference: `docs/1_frontend_ux-workflows/workflows/share/WA_research.md:32-46`

### Step 5: User Shares via WhatsApp

**User Action**: User confirms share in WhatsApp interface (sends message to contact/group)

**System Response**:

- WhatsApp sends message with link
- Recipient receives message with link preview
- Preview shows:
  - Title: From og:title meta tag
  - Description: From og:description meta tag
  - Image: From og:image meta tag (FileteSign SVG-based)
  - URL: Shared page URL

**UI State**:

- External to application (WhatsApp interface)

**Data Changes**: None (external service)

**Code Reference**:

- WhatsApp link preview behavior: Standard Open Graph protocol
- Research reference: `docs/1_frontend_ux-workflows/workflows/share/WA_research.md:61-65`

## Edge Cases

### Edge Case 1: Entity Data Not Loaded Yet

**Trigger**: User clicks share button before entity data has finished loading

**Expected Behavior**:

- Show loading state or disable button until data is available
- Alternatively: Use route-based fallback title (e.g., "Jingle j12345678") until entity data loads
- Once entity data loads, update share message with displayPrimary/displaySecondary

**Code Reference**: To be implemented (loading state handling in FloatingHeader)

### Edge Case 2: Entity Missing displayPrimary/displaySecondary

**Trigger**: Entity exists but displayPrimary or displaySecondary properties are null/undefined

**Expected Behavior**:

- Fallback to computed primary/secondary text using existing utility functions
- Use `getPrimaryText()` and `getSecondaryText()` from `entityDisplay.ts`
- Ensure share message always has meaningful content

**Code Reference**:

- Fallback utilities: `frontend/src/lib/utils/entityDisplay.ts:129-345` (getPrimaryText, getSecondaryText)
- EntityCard fallback logic: `frontend/src/components/common/EntityCard.tsx:210-226`

### Edge Case 3: Non-Entity Routes

**Trigger**: User is on landing page (`/`), search page (`/search`), or other non-entity route

**Expected Behavior**:

- Use generic share message: "¡Mira esto en Cooperativa jingle.ar!"
- Set generic Open Graph tags with site-wide title and description
- Use FileteSign SVG as preview image for all non-entity pages

**Code Reference**:

- Route detection: `frontend/src/components/composite/FloatingHeader.tsx:31` (isLandingPage check)
- Generic meta tags: To be implemented

### Edge Case 4: WhatsApp Not Available

**Trigger**: User clicks share button but WhatsApp is not installed/available on device

**Expected Behavior**:

- WhatsApp Web opens in browser (desktop)
- On mobile, if app not installed, WhatsApp Web opens
- User can still share via WhatsApp Web interface

**Code Reference**:

- WhatsApp API behavior: `docs/1_frontend_ux-workflows/workflows/share/WA_research.md:130` (desktop/mobile behavior)

### Edge Case 5: Very Long Entity Titles

**Trigger**: Entity displayPrimary or displaySecondary is extremely long

**Expected Behavior**:

- Truncate title in share message if exceeds reasonable length (e.g., 100 characters)
- Keep full URL intact
- Ensure og:title meta tag is also truncated appropriately (Open Graph recommends < 60 characters for title)

**Code Reference**: To be implemented (title truncation utility)

### Edge Case 6: Special Characters and Emojis in Entity Titles

**Trigger**: Entity displayPrimary or displaySecondary contains special characters, emojis, or URL-unsafe characters

**Expected Behavior**:

- **Preserve emojis** in displayPrimary and displaySecondary - they are important and relevant for context
- Use `encodeURIComponent()` to properly encode all special characters and emojis in the WhatsApp share URL
- Emojis will be properly encoded in the URL and WhatsApp will decode and display them correctly in the message
- The emojis provide important visual context (e.g., 🏭 for Fabrica, 🎤 for jingleros count)

**Code Reference**:

- URL encoding: JavaScript `encodeURIComponent()` (standard)
- Research reference: `docs/1_frontend_ux-workflows/workflows/share/WA_research.md:57` (encodeURIComponent best practice)

### Edge Case 7: FileteSign SVG Image Generation

**Trigger**: Need to provide og:image URL for preview

**Expected Behavior**:

- Option 1: Export FileteSign SVG as static image file (PNG/JPG) and host it
- Option 2: Use data URI for SVG (may have size limitations)
- Option 3: Render SVG to canvas and generate image URL
- Recommended: Static image file hosted at known URL (e.g., `/images/share-preview.png`)
- Image should be at least 1200x630px for optimal WhatsApp preview (Open Graph recommendation)

**Code Reference**:

- FileteSign SVG: `frontend/src/components/composite/FileteSign.tsx:32-262`
- Image hosting: To be determined (static assets directory)

## Technical Implementation

### State Management

**State Variables**:

- `shareTitle` (string): Title for share message - `FloatingHeader.tsx:to-be-implemented`
- `shareUrl` (string): Current page URL using `https://www.jingle.ar/` base domain - `FloatingHeader.tsx:to-be-implemented`
- `entityData` (Entity | null): Current entity data if on entity page - `FloatingHeader.tsx:to-be-implemented`
- `isEntityPage` (boolean): Whether current page is an entity inspection page - `FloatingHeader.tsx:to-be-implemented`
- `entityType` (EntityType | null): Entity type if on entity page - `FloatingHeader.tsx:to-be-implemented`
- `entityId` (string | null): Entity ID if on entity page - `FloatingHeader.tsx:to-be-implemented`

**State Transitions**:

- Route change → Detect entity page → Fetch entity data (if needed) → Update share metadata
- Entity data loaded → Extract displayPrimary/displaySecondary → Update shareTitle
- Share button click → Construct WhatsApp URL → Open WhatsApp

### API Integration

**Endpoints Used**:

- `GET /api/public/entities/{type}/{id}` - Fetch entity data for share metadata - `frontend/src/lib/api/client.ts:to-be-verified`
  - Used when: On entity page and entity data not already loaded in page component
  - Purpose: Get displayPrimary and displaySecondary for share message and Open Graph tags

**Data Flow**:

1. User navigates to entity page
2. Page component fetches entity data (existing behavior)
3. FloatingHeader detects entity route and extracts entity type/ID
4. FloatingHeader may need to fetch entity data if not passed as prop (or use React Context)
5. Extract displayPrimary/displaySecondary from entity (preserving emojis)
6. Normalize current page URL to use `https://www.jingle.ar/` base domain (for DNS resilience)
7. Update Open Graph meta tags with entity data and normalized URL
8. Construct entity-specific share message ("Mira esta Fabrica...", "Mira este Jingle...", etc.)
9. User clicks share button
10. Open WhatsApp with pre-filled message containing entity-specific text and normalized URL

### Components

**Component Responsibilities**:

- `FloatingHeader.tsx`:
  - Render "Compartir en WhatsApp" button - `frontend/src/components/composite/FloatingHeader.tsx:88-107`
  - Detect current route and entity context
  - Fetch entity data if needed (or receive via props/context)
  - Construct WhatsApp share URL
  - Handle share button click
  - Manage Open Graph meta tags (via custom hook or direct DOM manipulation)
- `useWhatsAppShare.ts` (to be created):
  - Custom hook for WhatsApp share functionality
  - Encapsulates share URL construction
  - Handles entity data fetching if needed
  - Normalizes URLs to use `https://www.jingle.ar/` base domain (replaces any protocol/host with www.jingle.ar for DNS resilience)
  - Constructs entity-specific share messages based on entity type:
    - Fabrica: "Mira esta Fabrica en la Cooperativa jingle.ar:"
    - Jingle: "Mira este Jingle en la Cooperativa jingle.ar:"
    - Artista: "Mira este Artista en la Cooperativa jingle.ar:"
    - Cancion: "Mira esta Materia Prima (Cancion) en la Cooperativa jingle.ar:"
    - Tematica: "Mira esta Tematica en la Cooperativa jingle.ar:"
  - Preserves emojis in displayPrimary and displaySecondary
  - Manages Open Graph meta tag updates
- `useOpenGraphTags.ts` (to be created):
  - Custom hook for managing Open Graph meta tags
  - Updates og:title, og:description, og:image, og:url
  - Cleans up tags on unmount
- Meta tag management utility (to be created):
  - Functions to set/update/remove Open Graph meta tags
  - Handles tag creation if they don't exist

### Share Message Format

**Entity Pages** - Entity-specific messages with displayPrimary and displaySecondary (emojis preserved):

**Fabrica**:

```
Mira esta Fabrica en la Cooperativa jingle.ar:
[displayPrimary with emojis]
[displaySecondary with emojis if available]

https://www.jingle.ar/f/[fabricaId]
```

Example:

```
Mira esta Fabrica en la Cooperativa jingle.ar:
🏭 LA ÚLTIMA FÁBRICA DE JINGLES DE LA HISTORIA | 04/12/2025 • 🎤: 11

https://www.jingle.ar/f/DaUIzWcrE3w
```

**Jingle**:

```
Mira este Jingle en la Cooperativa jingle.ar:
[displayPrimary with emojis] | [displaySecondary with emojis if available]

https://www.jingle.ar/j/[jingleId]
```

**Artista**:

```
Mira este Artista en la Cooperativa jingle.ar:
[displayPrimary with emojis] | [displaySecondary with emojis if available]

https://www.jingle.ar/a/[artistaId]
```

**Cancion (Materia Prima)**:

```
Mira esta Materia Prima (Cancion) en la Cooperativa jingle.ar:
[displayPrimary with emojis] | [displaySecondary with emojis if available]

https://www.jingle.ar/c/[cancionId]
```

**Tematica**:

```
Mira esta Tematica en la Cooperativa jingle.ar:
[displayPrimary with emojis] | [displaySecondary with emojis if available]

https://www.jingle.ar/t/[tematicaId]
```

**Non-Entity Pages**:

```
¡Mira esto en Cooperativa jingle.ar!
[Page URL]
```

Example:

```
¡Mira esto en Cooperativa jingle.ar!
https://www.jingle.ar/
```

### Open Graph Meta Tags

**Required Tags**:

- `og:title`: Page title (entity displayPrimary with emojis preserved, or generic)
- `og:description`: Page description (entity displaySecondary with emojis preserved, or generic)
- `og:image`: Preview image URL (FileteSign SVG-based image)
- `og:url`: Current page URL using `https://www.jingle.ar/` base domain
- `og:type`: "website" (standard for all pages)

**Tag Management**:

- Tags should be updated when route changes
- Tags should be set initially on page load
- Tags should be cleaned up or reset when navigating away

## Validation Checklist

**Last Validated**: 2025-12-30  
**Validation Status**: draft (workflow not yet implemented)  
**Validation Report**: `WORKFLOW_012_whatsapp-share_validation.md`

### 1. Code References

- [x] All file paths exist
- [x] All line numbers accurate (where code exists)
- [x] Code matches descriptions (where code exists)
- [x] No moved/deleted code
- [ ] Implementation code added (workflow describes to-be-implemented functionality)

### 2. State Management

- [ ] All state variables exist (to be implemented)
- [ ] Initial states match workflow
- [ ] State transitions match workflow
- [ ] State coordination correct

### 3. API Integration

- [x] Backend endpoint exists (`GET /api/public/entities/{type}/{id}`)
- [ ] Frontend API client method exists (generic method or specific methods)
- [ ] Request/response handling matches workflow
- [ ] Error handling matches edge cases

### 4. Component Behavior

- [x] FloatingHeader component exists
- [ ] WhatsApp share button implemented
- [ ] Props match workflow (if applicable)
- [ ] Callbacks match actions
- [ ] UI states match workflow

### 5. Workflow Steps

- [x] Step 1: User Views Any Page - ✅ Validated (component exists)
- [x] Step 2: System Determines Share Context - ✅ Validated (route detection, entity structure)
- [x] Step 3: System Sets Open Graph Meta Tags - ⚠️ Partially validated (SVG exists, meta tags need implementation)
- [ ] Step 4: User Clicks Share Button - ⚠️ Needs implementation
- [x] Step 5: User Shares via WhatsApp - ✅ Validated (external behavior)

### 6. Edge Cases

- [x] Edge Case 1: Entity Data Not Loaded - ✅ Approach validated
- [x] Edge Case 2: Missing displayPrimary/displaySecondary - ✅ Fallback utilities exist
- [x] Edge Case 3: Non-Entity Routes - ✅ Route detection validated
- [x] Edge Case 4: WhatsApp Not Available - ✅ Behavior documented
- [ ] Edge Case 5: Very Long Titles - ⚠️ Truncation utility needed
- [x] Edge Case 6: Special Characters and Emojis - ✅ Encoding approach validated
- [x] Edge Case 7: FileteSign SVG Image - ✅ SVG exists, approach validated

### 7. Implementation Checklist

- [ ] "Compartir en WhatsApp" button visible in FloatingHeader on all pages
- [ ] Button styled consistently with other FloatingHeader buttons
- [ ] Button opens WhatsApp with correct pre-filled message
- [ ] Entity pages show entity-specific messages ("Mira esta Fabrica...", "Mira este Jingle...", etc.) with displayPrimary and displaySecondary
- [ ] Emojis are preserved in displayPrimary and displaySecondary in share messages
- [ ] URLs use `https://www.jingle.ar/` base domain for DNS resilience
- [ ] Non-entity pages show generic share message
- [ ] Open Graph meta tags are set correctly for entity pages
- [ ] Open Graph meta tags are set correctly for non-entity pages
- [ ] Preview image (FileteSign-based) displays correctly in WhatsApp
- [ ] Special characters and emojis are properly encoded
- [ ] Long titles are handled gracefully
- [ ] Edge cases (missing data, loading states) are handled
- [ ] Share functionality works on desktop (WhatsApp Web)
- [ ] Share functionality works on mobile (WhatsApp app)

## Related Workflows

- WORKFLOW_010: Basic Navigation Access (floating header navigation structure)
- Entity inspection workflows (entity data fetching patterns)

## Change History

| Version | Date       | Change                | Author | Rationale |
| ------- | ---------- | --------------------- | ------ | --------- |
| 1.0     | 2025-12-30 | Initial documentation | -      | Baseline  |
