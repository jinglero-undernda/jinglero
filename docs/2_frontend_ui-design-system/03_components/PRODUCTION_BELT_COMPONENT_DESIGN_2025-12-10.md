# Production Belt Component - Re-Shaped Design Intent Document

## Status

- **Status**: draft (design intent documented, not yet implemented)
- **Last Updated**: 2025-12-10
- **Last Validated**: 2025-12-10
- **Validation Status**: ⚠️ Major discrepancies found - design intent does not match current implementation
- **Validation Report**: `PRODUCTION_BELT_COMPONENT_DESIGN_2025-12-10_VALIDATION.md`
- **Code Reference**:
  - `frontend/src/components/production-belt/ProductionBelt.tsx:1-218`
  - `frontend/src/components/production-belt/ConveyorBelt.tsx:1-87`
  - `frontend/src/components/production-belt/InformationPanel.tsx:1-55`
  - `frontend/src/components/production-belt/JingleBox.tsx:1-69`
  - `frontend/src/styles/components/production-belt.css:1-235`
- **Related Implementation**: Current Production Belt implementation (2025-12-09) - uses horizontal scrolling layout, not the industrial factory design described in this document
- **Previous Design Document**: `PRODUCTION_BELT_COMPONENT_DESIGN_2025-12-09.md`

## Overview

This document describes the design intent for re-shaping the Production Belt component based on a new industrial factory interface design. The component presents a factory-themed interface with three core visual elements: a main video player styled as a CRT monitor, a machine control panel, and a conveyor belt system displaying Jingles as metallic boxes.

### Purpose

The re-shaped Production Belt component maintains the core functionality while presenting a more immersive industrial factory aesthetic:

- View and interact with Jingles (song clips) from a Fabrica (YouTube video)
- Experience continuous playback through a retro CRT-style monitor interface
- Control playback and view Jingle information through an industrial machine control panel
- Visualize Jingles as metallic boxes moving along a conveyor belt
- Navigate through past and future Jingles by interacting with conveyor belt boxes

### Key Design Principles

1. **Industrial Factory Aesthetic**: The entire interface uses a factory/industrial theme with mechanical elements, gauges, pipes, and metallic surfaces
2. **Retro CRT Monitor**: The main video player is styled as an old CRT television/monitor
3. **Machine Control Panel**: Interactive control panel with buttons, gauges, text fields, and indicator lights
4. **Conveyor Belt Visualization**: Jingles are represented as metallic boxes moving along a production line
5. **Continuous Playback**: The video player maintains continuous playback without remounting

## Core Elements

Based on the design specification, the Production Belt component consists of three core visual elements:

### 1. Main Video Player (CRT Monitor)

**Visual Design**:

- Styled as a retro CRT television/monitor
- Large, prominent display on the left side of the interface
- Dark frame with rounded corners (typical CRT appearance)
- Screen area displays the video player
- Video controls (progress bar, skip buttons) integrated into the monitor interface - nested YouTubePlayer component
- Interaction controls (skip forward, skip backwards, start/stop and status Indicator light) below the monitor (four small buttons and one light)

**Functional Elements**:

- Video player embedded in the monitor screen
- Three buttons and an indicator light (red, green, yellow) below the monitor

**Code Reference**:

- Current implementation: `frontend/src/components/production-belt/ProductionBelt.tsx:198-204`
- YouTubePlayer component: `frontend/src/components/player/YouTubePlayer.tsx`
- Styles: `frontend/src/styles/components/production-belt.css:72-94` (processor-section, processor-frame)

**Design Intent**:

- The monitor should be the primary focal point for video playback
- Maintains the industrial/retro aesthetic while providing modern video functionality
- The CRT styling creates a nostalgic, factory control room atmosphere
- Video controls are integrated into the monitor interface rather than floating

### 2. Machine Control Panel

**Visual Design**:

- Large metallic interface panel positioned on the right side
- Industrial machine aesthetic with buttons, gauges, and text fields
- Connected to the monitor via industrial pipes (with visible steam)
- Pressure gauge visible on one of the connecting pipes (function TBD, for now purely decorative)

**Control Elements**:

**Top Section - Category Buttons**:

- Five labeled indicator lights:
  - "JINGLAZO" (turns on if the active Jingle is a Jinglazo)
  - "JDD" (turns on if the active Jingle is a Jigle Del Dia)
  - "PRECARIO" (turns on if the active Jingle is a Precario)
  - "VIVO" (turns on if the active Jingle is a Vivo)
  - "CLÁSICO" (turns on if the active Jingle is a Clásico)

**Middle Section - Information Fields**:

- Five text fields displaying Jingle metadata:
  - "JINGLE: [PLACEHOLDER TITLE]" - Displays Jingle title/segment name
  - "CANCION: [PLACEHOLDER SONG]" - Displays song name (Cancion)
  - "PROVEEDOR: [PLACEHOLDER AUTHOR]" - Displays author/artist (Autores)
  - "JINGLERO: [PLACEHOLDER JINGLERO]" - Displays Jinglero name
  - "TEMATICAS: [PLACEHOLDER TOPICS]" - Displays Tematicas/topics

**Right Section - Action Buttons**:

- Five control buttons to the right of each information field:
  - ">>" - Navigate to selected Jingle
  - "VER" - Open/view song details in new tab
  - "VER" - Open/view supplier (author) details in new tab
  - "VER" - Open/view Jinglero details in new tab
  - "VER" - Open/view Tematicas details in new tab
- Small vent and three indicator lights (yellow, red, green) at the bottom

**Code Reference**:

- Current implementation: `frontend/src/components/production-belt/InformationPanel.tsx:1-55`
- JingleMetadata component: `frontend/src/components/player/JingleMetadata.tsx`
- Styles: `frontend/src/styles/components/production-belt.css:165-208` (info-panel-wrapper)

**Design Intent**:

- The control panel replaces the current InformationPanel with a more immersive industrial interface
- Light indicators lit up to present the active Jingle boolean properties (Jinglalo, Jigle Del Dia, Precario, Vivo, Clásico)
- Information fields use industrial terminology (JINGLE, CANCION, PROVEEDOR, JINGLERO, TEMATICAS) to match the factory metaphor
- Action buttons provide quick access to related entities (song, supplier, jinglero) in new tabs
- Indicator lights provide visual feedback for system status(TBD, for now purely decorative)
- Gauges add to the industrial aesthetic and could display playback metrics (TBD, for now purely decorative)

### 3. Conveyor Belt (Sequence of Jingles)

**Visual Design**:

- Horizontal conveyor belt system positioned below the monitor
- Extends from below the monitor to the right, connecting to the control panel area
- Metallic boxes moving along the belt
- Each box has:
  - A label presenting the Jingle title (e.g., "La cumbia del Sufragio", "La lanchina", "Votando al FIT", "Compran pesos"...)
  - Two light indicators show the Jingle that is currently plating and the one whose properties are being displayed in the control panel
- Industrial background with gears, pipes, and machinery visible

**Functional Elements**:

- Boxes represent individual Jingles in the sequence
- Boxes move along the conveyor belt (left to right or right to left depending on temporal flow)
- Boxes can be clicked to select/view details in the control panel
- Labels on boxes identify the Jingle (by title)

**Code Reference**:

- Current implementation: `frontend/src/components/production-belt/ConveyorBelt.tsx:1-87`
- JingleBox component: `frontend/src/components/production-belt/JingleBox.tsx:1-69`
- Styles: `frontend/src/styles/components/production-belt.css:33-163` (conveyor-section, jingle-box)

**Design Intent**:

- The conveyor belt visualizes the temporal flow of Jingles through the production line
- Metallic boxes maintain the industrial aesthetic
- Indicator lights on boxes provide status information (active, selected, etc.)
- The belt connects the monitor (where Jingles are "processed") to the control panel
- Conveyor belt overspills to both sides of the screen, user can scroll horizontally to navigate through the Jingles

## Layout Structure

### Overall Layout

```
┌──────────────────────────────────────────────────────────────┐
│                    [Factory Background]                      │
│  ┌──────────────┐                    ┌───────────────────┐   │
│  │              │                    │                   │   │
│  │   CRT        │  [Pipes/Steam]     │   CONTROL         │   │
│  │   MONITOR    │  ────────────────> │   PANEL           │   │
│  │              │                    │                   │   │
│  │ [Video]      │                    │ [Indicators]      │   │
│  └──────────────┘                    │ [Fields] [Actions]|   │
│         │ [Controls]                 │                   │   │
│         |                            │                   │   │
│                                      │                   │   |
│ └────────[CONVEYOR BELT]─────────────| - - - - - - - - - |─┘ |
│         [Box] [Box] [Box] [Box]      │                   |   |
│                                      └───────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Spatial Relationships

1. **Monitor (Left)**:

   - Primary position on the left side
   - Large, prominent display
   - Contains video player and playback controls
   - Connected to control panel via visual pipes

2. **Control Panel (Right)**:

   - Positioned on the right side - full height of the component, approx. 1/3 of the screen width
   - Large metallic interface
   - Connected to monitor via industrial pipes (with steam effects)
   - Contains all interactive controls and information display
   - Opening at the bottom for the conveyor belt to slide in and out

3. **Conveyor Belt (Bottom)**:
   - Positioned below the monitor - full width of the screen (behind the control panel), approx. 1/3 bottom part of the screen height
   - Extends horizontally from monitor area toward control panel
   - Contains Jingle boxes moving along the belt
   - Visual connection between monitor (processing) and control panel (monitoring)

**NOTE**: Need to do further research on the layout for vertical and small screens.

## Component Specifications

This section provides technical implementation specifications for the three core components. For visual design and functional descriptions, refer to the [Core Elements](#core-elements) section above.

### 1. CRT Monitor Component (Main Video Player)

**Technical Implementation**:

- **Component Structure**: Wraps YouTubePlayer component within CRT-styled frame
- **Video Player**: Embeds YouTubePlayer component (never remounts for continuous playback)
- **Aspect Ratio**: 16:9 for video content
- **Controls Integration**: Video controls (progress bar, volume, fullscreen) are nested within YouTubePlayer component
- **External Controls**: Three buttons (skip forward, skip backward, pause/play) and one status indicator light positioned below the monitor frame
- **Status Indicator**: Single light with three states (red: buffering, yellow: paused, green: playing)

**Code Reference**:

- Current: `frontend/src/components/production-belt/ProductionBelt.tsx:198-204`
- YouTubePlayer: `frontend/src/components/player/YouTubePlayer.tsx`
- Styles: `frontend/src/styles/components/production-belt.css:72-94`

**Implementation Notes**:

- CRT frame styling should overlap video edges slightly (acceptable design choice)
- Monitor frame must not interfere with video playback functionality
- Status indicator light state managed by YouTubePlayer playback state

### 2. Machine Control Panel Component

**Technical Implementation**:

- **Component Structure**: Replaces current InformationPanel with industrial-styled interface
- **Layout Sections**: Three distinct sections (top: category indicators, middle: information fields, right of each information field: action buttons)
- **Category Indicators**: Five boolean indicator lights corresponding to Jingle properties (JINGLAZO, JDD, PRECARIO, VIVO, CLÁSICO)
  - State: Off with red tint when property is false/null, lit green when property is true
- **Information Fields**: Five read-only text fields displaying Jingle metadata
  - Field labels: "JINGLE", "CANCION", "PROVEEDOR", "JINGLERO", "TEMATICAS"
  - Data source: Jingle metadata via Public API
  - Empty state: Fields display empty when data is missing
- **Action Buttons**: Five buttons positioned to the right of each information field
  - ">>" button: Navigate to selected Jingle timestamp
  - "VER" buttons (4): Open related entity detail pages in new tabs (song, supplier, jinglero, tematicas)
- **Decorative Elements**: Two pressure gauges (green and red needles), steam effects from pipes, vent with three indicator lights at bottom
  - Gauges: Purely decorative (TBD for future metrics display)
  - Bottom indicator lights: Purely decorative (TBD for future system status)

**Code Reference**:

- Current: `frontend/src/components/production-belt/InformationPanel.tsx:1-55`
- JingleMetadata: `frontend/src/components/player/JingleMetadata.tsx`
- Styles: `frontend/src/styles/components/production-belt.css:165-208`

**Implementation Notes**:

- Control panel must cover conveyor belt at bottom (opening allows belt to slide in/out)
- Boolean indicator lights update based on active/selected Jingle properties
- Information fields update when Jingle selection changes
- Action buttons trigger navigation or open new tabs based on entity type

### 3. Conveyor Belt Component (Sequence of Jingles)

**Technical Implementation**:

- **Component Structure**: Horizontal scrolling container with metallic belt surface
- **Box Rendering**: Displays all the Jingles in the Fabrica as metallic boxes **This is a change from previous implementation**
- **Box Elements**:
  - Label: Displays Jingle title using `displayPrimary` property (Title or song/author)
  - Indicator Lights: Two lights per box
    - Playing indicator: Lit green when Jingle is currently playing
    - Selected indicator: Lit green when Jingle is selected and displayed in control panel
- **Movement**: Boxes animate along belt during horizontal scroll navigation
- **Background Elements**: Industrial setting with gears, pipes, and machinery (decorative)

**Code Reference**:

- Current: `frontend/src/components/production-belt/ConveyorBelt.tsx:1-87`
- JingleBox: `frontend/src/components/production-belt/JingleBox.tsx:1-69`
- Styles: `frontend/src/styles/components/production-belt.css:33-163`

**Implementation Notes**:

- Belt extends full width of screen (behind control panel)
- Horizontal scrolling allows navigation through all Jingles
- Box click updates selected Jingle and control panel information
- Box indicator lights update based on playing and selected states

## Visual Design Details

### Industrial Factory Theme

**Color Palette**:

- Metallic grays and silvers for machinery
- Industrial yellows, reds, greens for indicator lights
- Dark backgrounds for monitor and control panel
- Steam effects (white/semi-transparent)

**Visual Elements**:

- Gears and mechanical parts in background
- Pipes connecting monitor to control panel
- Steam effects from pipes
- Pressure gauges with needles
- Indicator lights (various colors)
- Metallic textures and surfaces
- Industrial typography

**Aesthetic Principles**:

- Retro-futuristic industrial design
- Mechanical/analog feel despite digital functionality
- Rich visual detail without overwhelming functionality
- Consistent factory metaphor throughout

### CRT Monitor Styling

**Visual Characteristics**:

- Rounded corners (typical CRT appearance)
- Dark frame with slight bezel
- Screen area with slight curvature (CRT effect)
- Controls on the border of the CRT monitor (skip forward, skip backward, pause/play)
- Indicator light below monitor (playing, paused, buffering)

**Design Intent**:

- Creates nostalgic factory control room atmosphere
- Maintains modern video functionality
- Large controls for easy interaction
- Clear visual hierarchy

### Control Panel Styling

**Visual Characteristics**:

- Metallic surface with industrial texture
- Buttons with indicator lights
- Text fields with industrial labels
- Gauges with needles
- Pipes connecting to monitor
- Steam effects
- Vent and additional indicator lights

**Design Intent**:

- Immersive industrial interface
- Clear visual feedback through lights and gauges
- Factory terminology matches metaphor
- Rich detail enhances user experience

### Conveyor Belt Styling

**Visual Characteristics**:

- Metallic belt surface
- Boxes with metallic appearance
- Indicator lights on boxes
- Industrial background elements
- Movement animation

**Design Intent**:

- Clear visualization of temporal flow
- Industrial aesthetic consistency
- Status indicators on boxes
- Engaging visual experience

## User Interactions

### Monitor Interactions

1. **Video Playback**:

   - Standard video player controls
   - Progress bar shows current time / total time
   - Skip Back/Forward buttons for navigation

2. **Visual Feedback**:
   - Indicator lights show system status
   - Monitor displays "FABRICA LIVE STREAM" branding

### Control Panel Interactions

1. **Category Buttons**:

   - Click to filter/categorize Jingles
   - Indicator lights show active category
   - Gauges may update based on selection

2. **Information Fields**:

   - Display current/selected Jingle metadata
   - Read-only display (or editable in future)
   - Updates when Jingle changes

3. **Action Buttons**:
   - SKIP TO: Navigate video to selected Jingle
   - OPEN SONG: View/open song (Cancion) details
   - OPEN SUPPLIER: View/open supplier (Autor) details
   - OPEN JINGLERO: View/open Jinglero details

### Conveyor Belt Interactions

1. **Box Selection**:

   - Click box to select Jingle
   - Control panel updates with Jingle information
   - Box indicator lights show selected state

2. **Box Navigation**:

   - Boxes represent Past and Future Jingles
   - Active Jingle is in monitor (not a box)
   - Boxes move as playback progresses

3. **Visual Feedback**:
   - Indicator lights on boxes show status
   - Selected box is highlighted
   - Boxes can show category labels

## Technical Considerations

### Component Architecture

**Proposed Structure**:

```
ProductionBelt (Root)
├── CRTMonitor
│   ├── MonitorFrame
│   ├── VideoPlayer (YouTubePlayer)
│   ├── VideoControls
│   │   ├── ProgressBar
│   │   ├── SkipBackButton
│   │   └── SkipForwardButton
│   └── IndicatorLight
├── MachineControlPanel
│   ├── BooleanIndicatorLights
│   │   ├── JINGLAZOIndicator
│   │   ├── JDDIndicator
│   │   ├── PRECARIOIndicator
│   │   ├── VIVOIndicator
│   │   └── CLÁSICOIndicator
│   ├── Gauges (decorative)
│   ├── InformationFields
│   │   ├── JingleTitleField
│   │   ├── CancionField
│   │   ├── AutorField
│   │   ├── JingleroField
│   │   └── TematicasField
│   ├── ActionButtons
│   │   ├── SkipToButton
│   │   ├── OpenCancionButton
│   │   ├── OpenAutorButton
│   │   ├── OpenJingleroButton
│   │   └── OpenTematicasButton
│   └── IndicatorLights (decorative)
│   └── Cover in front of the Conveyor Belt
└── ConveyorBelt
    ├── BeltSurface
    ├── JingleBox[]
    │   └── JingleLabel
    │   └── JingleIndicatorLights
    │         └── JinglePlayingIndicatorLight
    │         └── JingleSelectedIndicatorLight
    └── BackgroundElements
```

### State Management

**Key State Variables**:

- Current Jingle (active in monitor)
- Selected Jingle (for control panel display)
- Playback state (playing, paused, time)
- Jingle arrays

### Visual Effects

**Required Effects**:

- Steam animation from pipes
- Gauge needle movement (TBD, for now purely decorative)
- Indicator light animations
- Box movement along conveyor belt
- CRT screen effects (optional)
- Metallic texture rendering

### Performance Considerations

- Efficient rendering of multiple Jingle boxes
- Smooth animations for belt movement
- Optimized visual effects (steam, gauges)
- Maintain video player performance (no remounting)

## Implementation Notes

### Design vs. Current Implementation

**Current Implementation (2025-12-09)**:

- Horizontal scrolling layout
- Simple processor section with video player
- Floating information panel
- Basic Jingle boxes

**New Design (2025-12-10)**:

- Three distinct visual elements (Monitor, Control Panel, Conveyor Belt)
- Industrial factory aesthetic throughout
- CRT monitor styling for video player
- Machine control panel replacing information panel
- Enhanced conveyor belt with metallic boxes
- Industrial background elements

### Migration Considerations

1. **Monitor Component**:

   - Enhance current processor-section with CRT styling
   - Add indicator lights

2. **Control Panel Component**:

   - Replace InformationPanel with MachineControlPanel
   - Add boolean properties with indicator lights
   - Add information fields with industrial labels
   - Add action buttons for navigation
   - Add gauges and visual effects (TBD, for now purely decorative)

3. **Conveyor Belt Component**:

   - Enhance JingleBox with metallic styling
   - Add Label to box
   - Add 2 indicator lights to boxes
   - Add industrial background elements
   - Enhance belt visual design

## Questions and Open Decisions

### To Be Resolved During Implementation

1. **Boolean Indicator Lights**:

   - JINGLAZO, JDD, PRECARIO, VIVO, CLÁSICO are Jingle metadata properties

2. **Information Fields**:

   - All fields are read-only.
   - Data is retrieved from the Jingle metadata via Public API.
   - When data is missing, the fields are empty.

3. **Action Buttons**:

   - Skip to Jingle button: Navigate to selected Jingle's timestamp on the video player, change status on the relevant Jingle boxes on the belt.
   - "OPEN SONG", "OPEN SUPPLIER", "OPEN JINGLERO", "OPEN TEMATICAS" buttons: Open the corresponding entity detail page in a new tab.

4. **Gauges**:

   - Gauges are purely decorative (TBD, for now, they could display Fabrica metrics)
   - They do not update based on state.

5. **Indicator Lights**:

   - Boolean Indicator Lights in Control Panel: off with a red tint for boolean property = false or null, lit green for boolean property = true
   - Jingle box indicators:
     1. lit green for Jingle that is currently playing,
     2. lit green for Jingle that is currently selected and displayed in the Control Panel
   - System status (light below the monitor): lit red for Jingle that is currently buffering, lit yellow for paused, lit green for playing.

6. **Conveyor Belt Boxes**:

   - Boxes are labeled using the displayPrimary property (Title or song (author) )?
   - The two indicator lights show Playing and onPanel
   - Box movement is animated on container horizontal scroll.

7. **Visual Effects**:
   **Need AI assistant evaluation of options**
   - How are steam effects implemented (CSS animations, SVG, images)?
   - How are metallic textures applied?
   - What level of detail is needed for background elements?

## Change History

| Date       | Change                                                                                       | Author        |
| ---------- | -------------------------------------------------------------------------------------------- | ------------- |
| 2025-12-10 | Initial re-shaped design intent document created                                             | Design System |
| 2025-12-10 | Core elements identified and documented                                                      | AI Assistant  |
| 2025-12-10 | Component Specifications section revised to remove redundancies and align with Core Elements | AI Assistant  |

---

**Related Documents**:

- Previous Design: `PRODUCTION_BELT_COMPONENT_DESIGN_2025-12-09.md`
- Current Implementation: `frontend/src/components/production-belt/ProductionBelt.tsx`
- Design System Playbook: `docs/2_frontend_ui-design-system/playbooks/PLAYBOOK_02_01_DOCUMENT_DESIGN_INTENT.md`
