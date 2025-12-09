# Production Belt Video Viewing Component - Design Intent Document

## Status

- **Status**: draft (design intent documented)
- **Last Updated**: 2025-12-09
- **Code Reference**: N/A (to be implemented)
- **Related Implementation**: `frontend/src/pages/FabricaPage.tsx` (current `/show` route prototype)
- **Placeholder Location**: `frontend/src/components/composite/FeaturedFabricaPlaceholder.tsx` (landing page)

## Overview

This document describes the design intent for refactoring the video viewing component, which is one of the most important features of the entire project. The component presents a novel "production belt" interface where Jingles (songs) are visualized as boxes moving through a production line, with a central video player that continuously plays without remounting.

### Purpose

The Production Belt component allows users to:

- View and interact with Jingles (song clips) from a Fabrica (YouTube video)
- Experience a continuous playback experience without video player remounting
- Navigate through past and future Jingles by interacting with visual boxes
- View detailed information about any Jingle in a dockable side panel
- Understand the temporal flow of Jingles through a production line metaphor

### Key Design Principles

1. **Continuous Playback**: The central video player never remounts, ensuring smooth playback
2. **Temporal Visualization**: Jingles are represented as boxes moving through time
3. **Spatial Navigation**: Users can slide horizontally to explore past and future Jingles
4. **Information on Demand**: Detailed Jingle information is available but doesn't obstruct the main view
5. **Metaphorical Consistency**: The "production belt" and "oven" metaphor guides the visual design

## Conceptual Design

### Production Belt Metaphor

The component visualizes the Fabrica as a production line:

- **Boxes** = Individual Jingles (songs)
- **Conveyor Belt** = Temporal flow of the Fabrica
- **Central Processor/Oven** = Active video player area where Jingles are "processed"
- **Production Flow** = Right to left: Future Jingles → Active Jingle → Past Jingles

### Visual Flow

```
[Past Jingles] ← [Central Processor: Video Player] ← [Future Jingles]
     (Left)              (Fixed Center)                  (Right)
```

As playback progresses:

1. Future Jingles (right side) slide into the central processor when their timestamp becomes active
2. The active Jingle is displayed in the central processor with video playback
3. Completed Jingles slide out to the left, joining the Past Jingles queue
4. The conveyor belt can be scrolled horizontally to explore any Jingle

## Layout Structure

### Two Main Containers

The component consists of two primary containers:

#### 1. Production Chain Container (Main Area)

- **Purpose**: Displays the conveyor belt with Jingle boxes and central video player
- **Layout**: Horizontal scrolling container with three distinct areas
- **Position**: Primary, full-width area (or left side when information panel is docked)

#### 2. Information Panel Container (Side Panel)

- **Purpose**: Displays detailed information about the selected Jingle
- **Layout**: Vertical scrolling panel
- **Position**: Right side (docked) or overlay (undocked)
- **Default Selection**: The currently active/processing Jingle

### Production Chain: Three-Area Architecture

The production chain container is divided into three areas:

#### Area 1: Past Jingles Container (Left)

- **Content**: Jingles that have already been processed
- **Behavior**:
  - Jingles are added to this container as they complete playback
  - Container grows to the left as more Jingles are processed
  - User can scroll horizontally to view past Jingles
- **Visual**: Boxes representing completed Jingles, ordered chronologically (newest to oldest from center)

#### Area 2: Central Processor (Center, Fixed Width)

- **Content**: YouTube video player (fixed position, never remounts)
- **Behavior**:
  - Fixed width container that never moves
  - Video player continuously plays the Fabrica video
  - Seeks to appropriate timestamps as Jingles become active
  - No remounting - player instance persists throughout session
- **Visual**: Prominent video player area, styled as the "oven" or "processor"

#### Area 3: Future Jingles Container (Right)

- **Content**: Jingles that will be processed in the future
- **Behavior**:
  - Jingles are removed from this container as they become active
  - Container shrinks as Jingles move to center
  - User can scroll horizontally to preview future Jingles
- **Visual**: Boxes representing upcoming Jingles, ordered chronologically (next to last from center)

### Information Panel: Docking States

#### Docked State (Default)

- **Position**: Right side of screen, fixed width
- **Layout**: Side-by-side with production chain
- **Width**: Fixed (e.g., 400px or responsive percentage)
- **Scrolling**: Vertical scroll for content overflow
- **Visibility**: Always visible

#### Undocked State (Overlay)

- **Position**: Semi-transparent overlay over production chain
- **Layout**: Floating panel, can be positioned/resized
- **Transparency**: Semi-transparent background (e.g., rgba with 0.85-0.95 opacity)
- **Scrolling**: Vertical scroll for content overflow
- **Visibility**: Can be toggled on/off
- **Interaction**: Click outside to close, or dedicated close button

## Component Specifications

### ProductionBelt Component (Main Container)

**Purpose**: Root component that orchestrates the production belt experience

**Props**:

```typescript
interface ProductionBeltProps {
  fabricaId: string;
  initialTimestamp?: number; // Optional: start at specific timestamp
  onJingleSelect?: (jingleId: string) => void;
}
```

**State Management**:

- Current playback time (from YouTube player)
- Active Jingle ID (determined by timestamp)
- Selected Jingle ID (for information panel, defaults to active)
- Past Jingles array
- Future Jingles array
- Information panel docking state

**Key Behaviors**:

- Fetches Fabrica and Jingles data on mount
- Manages continuous video playback
- Updates Jingle positions based on playback time
- Handles horizontal scrolling of conveyor belt
- Coordinates between video player and Jingle boxes

### ConveyorBelt Component

**Purpose**: Horizontal scrolling container with three areas

**Layout Structure**:

```
┌─────────────────────────────────────────────────────────┐
│  [Past]        [Processor]        [Future]                │
│  [Jingles]     [Video Player]     [Jingles]              │
│  [Box]         [Fixed Width]      [Box]                  │
│  [Box]         [16:9 Aspect]      [Box]                  │
│  [Box]                            [Box]                  │
└─────────────────────────────────────────────────────────┘
```

**CSS Approach**:

- Flexbox or Grid layout for three areas
- Horizontal overflow scrolling
- Fixed-width central processor
- Flexible-width left and right containers

**Scrolling Behavior**:

- Smooth horizontal scrolling
- Scroll position can be programmatically controlled
- User can drag/scroll to explore past/future Jingles
- Auto-scroll to keep active Jingle visible (optional)

### JingleBox Component

**Purpose**: Visual representation of a single Jingle in the conveyor belt

**Visual Design**:

- Box/card appearance
- Displays Jingle metadata preview:
  - Timestamp
  - Title or song title
  - Artist name (if available)
  - Thumbnail or icon
- Visual indicator for active state (highlighted border, glow effect)
- Visual indicator for selected state (different styling)

**States**:

- **Default**: Normal box appearance
- **Active**: Currently playing (highlighted, may show "processing" animation)
- **Selected**: User has selected this Jingle for detailed view (different highlight)
- **Past**: Already processed (may be dimmed or styled differently)
- **Future**: Not yet processed (normal appearance)

**Interactions**:

- Click to select (updates information panel)
- Click to skip to this Jingle's timestamp
- Hover to show preview tooltip
- Visual feedback on interaction

**Props**:

```typescript
interface JingleBoxProps {
  jingle: JingleTimelineItem;
  isActive: boolean;
  isSelected: boolean;
  position: "past" | "future";
  onSelect: () => void;
  onSkipTo: () => void;
}
```

### CentralProcessor Component

**Purpose**: Fixed container for the YouTube video player

**Layout**:

- Fixed width (responsive, maintains 16:9 aspect ratio)
- Centered in the conveyor belt
- Never moves or remounts
- Contains YouTubePlayer component

**Styling**:

- Prominent visual treatment (the "oven")
- May include visual effects (glow, border, shadow) to emphasize importance
- Industrial aesthetic consistent with production belt metaphor

**Behavior**:

- Video player instance is created once and persists
- Seeks to timestamps as Jingles become active
- Never unmounts or remounts (key technical requirement)

### InformationPanel Component

**Purpose**: Displays detailed Jingle information

**Content**:

- Full JingleMetadata display (reuses existing JingleMetadata component)
- All relationship data (Jingleros, Cancion, Autores, Tematicas)
- Timestamp and navigation controls
- Replay button for current Jingle

**Layout**:

- Vertical scrolling container
- Fixed or flexible width (depending on docking state)
- Scrollable content area for information overflow

**Docking Controls**:

- Toggle button to dock/undock
- Close button (when undocked)
- Position controls (when undocked, optional)

**Props**:

```typescript
interface InformationPanelProps {
  jingle: JingleMetadataData | null;
  isDocked: boolean;
  onDockToggle: () => void;
  onClose?: () => void;
  onReplay?: () => void;
}
```

## User Interactions

### Navigation Interactions

#### 1. Horizontal Scrolling

- **Action**: User scrolls/drags horizontally on conveyor belt
- **Effect**:
  - Past and Future Jingle boxes scroll into view
  - Central processor remains fixed
  - User can explore any Jingle in the timeline
- **Implementation**: CSS `overflow-x: auto` or custom scroll handling

#### 2. Jingle Box Selection

- **Action**: User clicks on a Jingle box (past or future)
- **Effect**:
  - Information panel updates to show selected Jingle details
  - Selected box is visually highlighted
  - Video playback continues (does not seek unless explicitly requested)
- **Implementation**: State update for selected Jingle ID

#### 3. Skip to Jingle

- **Action**: User clicks "skip to" button on a Jingle box
- **Effect**:
  - Video player seeks to that Jingle's timestamp
  - Active Jingle updates to the skipped Jingle
  - Information panel updates to show the new active Jingle
  - Conveyor belt may auto-scroll to show the active Jingle
- **Implementation**: YouTube player `seekTo()` method

#### 4. Information Panel Docking

- **Action**: User toggles dock/undock button
- **Effect**:
  - **Dock**: Panel moves to right side, production chain adjusts width
  - **Undock**: Panel becomes overlay, production chain expands to full width
- **Implementation**: CSS layout changes, conditional rendering

### Playback Interactions

#### 1. Continuous Playback

- **Behavior**: Video plays continuously from start to end
- **Effect**:
  - Future Jingles automatically become active as their timestamps are reached
  - Active Jingle moves from Future → Processor → Past
  - Conveyor belt may auto-scroll to keep active Jingle visible
- **Implementation**: YouTube player time update events, state management

#### 2. Manual Seeking

- **Action**: User uses YouTube player controls to seek
- **Effect**:
  - Active Jingle updates based on new playback time
  - Past/Future Jingle arrays are recalculated
  - Information panel updates if showing active Jingle
- **Implementation**: YouTube player seek events, timestamp calculation

#### 3. Replay Current Jingle

- **Action**: User clicks replay button in information panel
- **Effect**: Video seeks to start of current active Jingle
- **Implementation**: YouTube player `seekTo()` with current Jingle timestamp

## Visual Design

### Production Belt Aesthetics

**Industrial Theme**:

- Conveyor belt visual treatment (subtle texture, lines, or pattern)
- Box styling with industrial/cardboard appearance
- Central processor styled as "oven" or "processing machine"
- Color scheme consistent with existing design system

**Visual Hierarchy**:

- Central processor is most prominent (largest, most visual weight)
- Active Jingle box is highlighted (border, glow, or color change)
- Selected Jingle box has distinct styling (different from active)
- Past Jingles may be slightly dimmed
- Future Jingles have normal appearance

### Animation and Transitions

**Jingle Movement**:

- Smooth transitions as Jingles move from Future → Processor → Past
- CSS transitions for position changes
- Optional: Slide animation when Jingle becomes active

**Box Interactions**:

- Hover effects (scale, shadow, or color change)
- Click feedback (brief highlight or animation)
- Active state transitions (smooth highlight appearance)

**Panel Docking**:

- Smooth transition when toggling dock/undock state
- Panel slides in/out or fades in/out
- Production chain width adjusts smoothly

### Responsive Design

**Desktop/Landscape**:

- Full-width production chain with docked information panel
- Three areas visible simultaneously
- Horizontal scrolling for exploration

**Tablet**:

- Production chain may take full width
- Information panel may default to overlay mode
- Reduced box sizes if needed

**Mobile/Portrait**:

- Production chain full width
- Information panel as overlay (undocked by default)
- Vertical stacking may be considered for very small screens
- Touch-optimized scrolling and interactions

## Technical Architecture

### Component Hierarchy

```
ProductionBelt (Root)
├── ConveyorBelt
│   ├── PastJinglesContainer
│   │   └── JingleBox[] (for each past jingle)
│   ├── CentralProcessor
│   │   └── YouTubePlayer (fixed, never remounts)
│   └── FutureJinglesContainer
│       └── JingleBox[] (for each future jingle)
└── InformationPanel
    └── JingleMetadata (reused from existing component)
```

### State Management

**Key State Variables**:

```typescript
interface ProductionBeltState {
  // Data
  fabrica: Fabrica | null;
  allJingles: JingleTimelineItem[];

  // Playback
  currentTime: number; // From YouTube player
  isPlaying: boolean;

  // Jingle Management
  activeJingleId: string | null; // Determined by currentTime
  selectedJingleId: string | null; // User selection, defaults to active

  // Layout
  pastJingles: JingleTimelineItem[];
  futureJingles: JingleTimelineItem[];

  // UI State
  isPanelDocked: boolean;
  scrollPosition: number; // Horizontal scroll of conveyor belt
}
```

**State Updates**:

- `currentTime` updates from YouTube player events
- `activeJingleId` calculated from `currentTime` and Jingle timestamps
- `pastJingles` and `futureJingles` recalculated when `activeJingleId` changes
- `selectedJingleId` updated by user interaction (defaults to `activeJingleId`)

### YouTube Player Integration

**Key Requirements**:

1. Player instance created once and never destroyed
2. Player seeks to timestamps but never remounts
3. Player time updates drive active Jingle calculation
4. Player state (playing/paused) is tracked

**Implementation Approach**:

- Use existing `YouTubePlayer` component with ref
- Use `useYouTubePlayer` hook for state management
- Use `useJingleSync` hook to determine active Jingle from playback time
- Never change `videoIdOrUrl` prop after initial mount
- Only use `seekTo()` method for navigation

### Data Fetching

**Initial Load**:

1. Fetch Fabrica data by ID
2. Fetch all Jingles for Fabrica
3. Transform to `JingleTimelineItem[]` format
4. Sort by timestamp
5. Partition into Past/Future based on initial timestamp

**Lazy Loading**:

- Full Jingle data (with relationships) fetched when:
  - Jingle becomes active (for information panel)
  - User selects a Jingle box
  - User expands a Jingle box (if expandable)

**Caching**:

- Cache full Jingle data after first fetch
- Reuse existing relationship service caching

### Performance Considerations

**Rendering Optimization**:

- Virtual scrolling for large numbers of Jingle boxes (if needed)
- Memoization of Jingle box components
- Lazy rendering of off-screen boxes (optional)

**Scroll Performance**:

- CSS `transform` for smooth scrolling (better than `left`/`top`)
- Debounce scroll position updates
- Use `requestAnimationFrame` for scroll-based animations

**Video Player**:

- Single player instance (no remounting) = optimal performance
- Efficient timestamp seeking
- Minimal re-renders during playback

## Differences from Current `/show` Implementation

### Current Implementation (FabricaPage.tsx)

**Layout**:

- Vertical scrolling layout with three containers stacked
- Past Jingles above, Current in middle, Future below
- Video player and metadata side-by-side in current container

**Video Player**:

- Player is in the current Jingle container
- Player may remount when navigating (if implementation changes)
- Vertical scrolling to navigate through timeline

**Navigation**:

- Vertical scrolling through timeline
- Click to expand/collapse Jingle rows
- Skip to Jingle functionality

### New Implementation (Production Belt)

**Layout**:

- Horizontal scrolling layout with three areas side-by-side
- Past Jingles on left, Processor in center, Future on right
- Information panel as separate dockable container

**Video Player**:

- Player is in fixed central processor (never moves)
- Player never remounts (critical requirement)
- Horizontal scrolling to navigate through timeline

**Navigation**:

- Horizontal scrolling/dragging through timeline
- Click Jingle boxes to view details
- Skip to Jingle functionality
- Visual production belt metaphor

**Key Improvements**:

1. Continuous playback experience (no remounting)
2. More intuitive temporal visualization (left = past, right = future)
3. Better use of horizontal screen space
4. Novel and engaging user experience
5. Information panel can be hidden/overlaid for focus

## Implementation Phases

### Phase 1: Core Structure

- Create ProductionBelt component shell
- Implement ConveyorBelt with three areas
- Integrate YouTubePlayer in central processor
- Basic horizontal scrolling

### Phase 2: Jingle Boxes

- Create JingleBox component
- Render boxes in Past and Future containers
- Implement active Jingle detection
- Basic box interactions (select, skip to)

### Phase 3: Information Panel

- Create InformationPanel component
- Integrate JingleMetadata component
- Implement docking/undocking functionality
- Connect panel to selected Jingle

### Phase 4: Playback Integration

- Connect YouTube player time updates to active Jingle
- Implement automatic Jingle movement (Future → Processor → Past)
- Handle seeking and playback state
- Auto-scroll to keep active Jingle visible (optional)

### Phase 5: Polish and Optimization

- Add animations and transitions
- Optimize rendering performance
- Responsive design adjustments
- Accessibility improvements
- Error handling and edge cases

### Phase 6: Integration

- Replace FeaturedFabricaPlaceholder on landing page
- Update routing if needed
- Migration from old `/show` route (if applicable)
- Testing and refinement

## Code References

### Existing Components to Reuse

1. **YouTubePlayer**: `frontend/src/components/player/YouTubePlayer.tsx`

   - Reuse as-is for central processor
   - Ensure it never remounts

2. **JingleMetadata**: `frontend/src/components/player/JingleMetadata.tsx`

   - Reuse in InformationPanel component
   - Already handles all Jingle relationship data

3. **useYouTubePlayer**: `frontend/src/lib/hooks/useYouTubePlayer.ts`

   - Reuse for player state management

4. **useJingleSync**: `frontend/src/lib/hooks/useJingleSync.ts`
   - Reuse for determining active Jingle from playback time

### Existing Types to Reuse

1. **JingleTimelineItem**: From `frontend/src/components/player/JingleTimeline.tsx`
2. **JingleMetadataData**: From `frontend/src/components/player/JingleMetadata.tsx`
3. **Fabrica**: From `frontend/src/types/index.ts`
4. **Jingle**: From `frontend/src/types/index.ts`

### API Endpoints

- `publicApi.getFabrica(fabricaId)` - Fetch Fabrica data
- `publicApi.getFabricaJingles(fabricaId)` - Fetch Jingles for Fabrica
- `publicApi.getJingle(jingleId)` - Fetch full Jingle with relationships

## Design Decisions and Rationale

### Why Horizontal Layout?

**Rationale**:

- Better represents temporal flow (left = past, right = future)
- More intuitive for timeline navigation
- Better use of wide screens
- Aligns with production belt metaphor

### Why Fixed Central Processor?

**Rationale**:

- Ensures video player never remounts (critical for performance)
- Provides stable reference point for user
- Emphasizes importance of active Jingle
- Simplifies layout calculations

### Why Dockable Information Panel?

**Rationale**:

- Allows users to focus on video when needed
- Provides flexibility for different screen sizes
- Overlay mode useful for mobile/tablet
- Docked mode useful for desktop with wide screens

### Why Boxes Instead of Timeline Rows?

**Rationale**:

- More compact representation
- Better for horizontal scrolling
- Aligns with production belt metaphor
- Allows for richer visual design
- More engaging user experience

## Accessibility Considerations

### Keyboard Navigation

- Tab through Jingle boxes
- Enter/Space to select Jingle
- Arrow keys for horizontal scrolling
- Escape to close undocked panel

### Screen Reader Support

- Semantic HTML structure
- ARIA labels for interactive elements
- Live regions for active Jingle announcements
- Descriptive labels for all controls

### Visual Accessibility

- High contrast for active/selected states
- Clear focus indicators
- Scalable text and controls
- Color not sole indicator of state

## Future Enhancements (Out of Scope)

### Potential Future Features

- Jingle box thumbnails/previews
- Playback speed controls
- Timeline scrubbing
- Multiple Fabrica comparison view
- Export/share functionality
- Keyboard shortcuts for power users
- Gesture support for touch devices

## Questions and Open Decisions

### To Be Resolved During Implementation

1. **Box Sizing**: What should be the default size of Jingle boxes?

   - Fixed size or responsive?
   - How many boxes visible at once?

2. **Auto-scroll**: Should the conveyor belt auto-scroll to keep active Jingle visible?

   - Always, never, or user preference?

3. **Box Content**: What information should be visible on boxes?

   - Minimal (timestamp + title)?
   - More detailed (thumbnail, artist)?
   - User preference?

4. **Panel Width**: What should be the default width of information panel?

   - Fixed (400px) or percentage-based?
   - Responsive breakpoints?

5. **Initial State**: Should the component start with a specific Jingle active?

   - First Jingle?
   - Jingle from URL parameter?
   - User preference?

6. **Empty States**: How to handle Fabrica with no Jingles?
   - Show empty conveyor belt?
   - Show message?
   - Redirect?

## Change History

| Date       | Change                                 | Author        |
| ---------- | -------------------------------------- | ------------- |
| 2025-12-09 | Initial design intent document created | Design System |

---

**Related Documents**:

- Current Implementation: `frontend/src/pages/FabricaPage.tsx`
- Placeholder: `frontend/src/components/composite/FeaturedFabricaPlaceholder.tsx`
- Design System Playbook: `docs/2_frontend_ui-design-system/playbooks/PLAYBOOK_02_01_DOCUMENT_DESIGN_INTENT.md`
