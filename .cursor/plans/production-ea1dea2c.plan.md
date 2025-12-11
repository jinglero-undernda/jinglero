<!-- ea1dea2c-c997-443f-bd9c-1d270aa1bf44 84c42c94-8717-4f86-bfff-279dfa727d05 -->
# Production Belt Refactor Plan

## Goals

- Align UI/UX with the 2025-12-10 design intent and attached visual (CRT monitor, machine control panel, metallic conveyor).
- Simplify past/current/future handling: render all jingles on the belt with playing/selected indicators.
- Preserve continuous playback (no YouTubePlayer remount), update metadata and controls per design.

## Scope & Key Changes

- Files: [`frontend/src/components/production-belt/ProductionBelt.tsx`](frontend/src/components/production-belt/ProductionBelt.tsx), [`frontend/src/components/production-belt/ConveyorBelt.tsx`](frontend/src/components/production-belt/ConveyorBelt.tsx), [`frontend/src/components/production-belt/JingleBox.tsx`](frontend/src/components/production-belt/JingleBox.tsx), new [`frontend/src/components/production-belt/MachineControlPanel.tsx`](frontend/src/components/production-belt/MachineControlPanel.tsx) (replace `InformationPanel`), [`frontend/src/styles/components/production-belt.css`](frontend/src/styles/components/production-belt.css); ensure data comes from existing types/hooks.

## Implementation Steps

1) **Layout Restructure**

- Refactor `ProductionBelt` layout to three zones: `CRTMonitor` (left), `MachineControlPanel` (right, full height ~1/3 width), `ConveyorBelt` (bottom, full width, runs behind panel). Remove past/processor/future track split and floating overlay panel.

2) **State & Data Flow**

- Continue using `useYouTubePlayer` + `useJingleSync`; keep `activeJingle`, `selectedJingle`. Unify jingles array for belt rendering (all items). Provide selected/playing flags to belt/panel. Preserve lazy fetch of full jingle data.

3) **CRT Monitor & Controls**

- Wrap `YouTubePlayer` in a `CRTMonitor` frame with CRT styling. Add external controls under screen: skip back, skip forward, play/pause, and a tri-state status indicator (buffering=red, paused=yellow, playing=green) driven by player state. Maintain 16:9 aspect ratio and avoid remounting.

4) **Machine Control Panel**

- Implement new `MachineControlPanel` component (replace `InformationPanel`):
- Top: five boolean indicators (JINGLAZO, JDD, PRECARIO, VIVO from `isLive`, CLÁSICO from `isRepeat`).
- Middle: five readonly fields with industrial labels (SEGMENT/JINGLE title, RAW MATERIAL/CANCION, SUPPLIER/AUTOR, WORKER/JINGLERO, TAGS/TEMATICAS) sourced from `JingleMetadataData` (or empty state).
- Right-side buttons: `>>` (seek to selected), `OPEN SONG`, `OPEN SUPPLIER`, `OPEN JINGLERO`, `OPEN TOPICS` opening documented routes in new tabs when data exists: `/c/{cancionId}`, `/a/{autorId}`, `/j/{jingleroId or jingleId}`, `/t/{tematicaId}`.
- Decorative gauges/vent/pipe placeholders (static for now) matching design.

5) **Conveyor Belt & Jingle Boxes**

- Render all jingles in a single horizontal belt (no past/future split). Each `JingleBox` shows metallic styling, label via `displayPrimary` fallback to title, and two indicator lights: playing (active), selected (panel). Box click selects; dedicated skip button seeks.
- Add industrial belt background and subtle motion/steam accents (CSS animations, lightweight, optional toggles if perf issues).

6) **Styling Overhaul**

- Update `production-belt.css` for industrial theme: metallic surfaces, CRT bezel, control panel, indicator lights, gauges, vents, pipes, belt/gear background. Ensure responsive behavior; keep scrollbar hidden while preserving horizontal scroll.

7) **Accessibility & i18n**

- Maintain aria-labels for buttons/boxes; keep text in current locale (Spanish) unless design specifies otherwise. Preserve keyboard interaction for selection/skip.

8) **Testing & Validation**

- Manual: verify playback continuity, skip controls, indicator states, selection vs active behavior, action buttons open correct links. Visual check against provided reference. Responsive sanity (desktop-first).

## Deliverables

- Updated components and styles implementing the industrial design and belt logic.
- Machine Control Panel replacing InformationPanel with required indicators and actions.
- Validation notes confirming alignment with design doc and attached visual.

### To-dos

- [ ] Restructure ProductionBelt layout to monitor/panel/belt
- [ ] Unify jingles array and pass playing/selected flags
- [ ] Add CRT frame, external controls, status light
- [ ] Build MachineControlPanel with indicators, fields, actions
- [ ] Render all jingles in belt with metallic boxes and indicators
- [ ] Apply industrial theme CSS across monitor/panel/belt
- [ ] Manual verification against design and controls behavior