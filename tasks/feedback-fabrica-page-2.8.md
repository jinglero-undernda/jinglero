# FabricaPage Feedback - Task 2.8

Feedback collection document for the FabricaPage implementation. Please fill in your observations, desired changes, and suggestions below. Once complete, I'll review everything holistically and address all items together to avoid knock-on effects.

## Status

- [ ] Feedback collection complete
- [ ] Issues addressed
- [ ] Changes tested
- [ ] Ready to mark task complete

---

## General Layout & Page Structure

**Intro and context**
I am using the Fabrica "0hmxZPp0xq0" for testing.
I am able to compare and check the expected information directly in the AuraDB instance, and therefore provide concrete examples of the expected response.

### A. Overall Layout

- [ ] 1: I would like the list of Jingles (timeline section) to be merged with the Player in a continuous list, that is scrolling in the screen: The Jingles before the current time-stamp appear before the player, the current Jingle meta-data appears in the side-bar, and the Jingles after appear below the player.

### B. Header Section

- [ ] 2: The Date field is not showing - reads "Invalid date".
- [ ] 3: Label the date: "Fecha de publicacion: "

### C. Main Content Grid (Video + Metadata)

- [ ] 4: Becomes a special case of the "Timeline Selection" rows.
- [ ] 5: Align to the top of the row both Player Component and Metadata panel. Whichever is taller sets the height for the row.
- [x] Keep the Metadata Panel at 400px wide, and leave the rest to the Player (current behaviour) [NO CHANGE]

### D. Timeline Section

- [ ] 6: Remove the row with headings for the Timeline Section
- [ ] 7: Add a scroll bar on the right, inactive if all the information fits the screen.
- [ ] 8: All Jingles on the list are displayed (currently, when one is expanded, the others disappear)

---

## YouTube Player Component

### E. Player Sizing & Positioning

- [ ] 7. Preserve the default aspect ratio (also in the preview image). In narrow settings make it proportionally smaller.

### Player Controls & Behavior

- [x] 8. I am content with the current controls and behaviour [NO CHANGE]

### Loading & Error States

**Will continue testing**

---

## Jingle Metadata Panel

### Layout & Spacing

- [ ] 9. Start with a rectangle with rounded corners top corners, that contains the Jingle title. The rest of the metadata in a box contained within.
- [x] Width = 400px [NO CHANGE]
- [ ] 10. Include a "Replay" icon on the top-right corner (next to the title) that allows to jump back to the start time-stamp

### Content Display

- [ ] 11: The Metadata panel to look like a table
- [ ] 12: 3 columns (headings on the left can be smaller than they are now), reserve a narrow column on the right for future implementation of navigation links to entity pages
- [ ] 13: Rows as needed based on data
- [ ] 14: Table fields: - Titulo del Jingle (merges 2 columns across) - Cancion: | Titulo de la cancion - Autor: (merge rows for the heading if more than one) | StageName - Jinglero: (merge rows for heading if more than one) | StageName - Tematica: (merge rows for heading if more than one) | 1 row per Tematica - Comentario: | Comentario
- [ ] 15: At the moment only one Jinglero is showing even if there are more...
- [ ] 16: Avoid the "pill" tags for Tematica
- [ ] 17: Text wrap in the cell in case of overspill

### Styling & Visual Hierarchy

**Will be developed later**

### Empty/No Active Jingle State

- [ ] 18: Assuming there is at least one Jingle, the player could read "Saltar al primer Jingle" that, if clicked, skips to the first Jingle instance.
- [x] Current behaviour is to keep the panel even after the last time-stamp - which is acceptable. [NO CHANGE]
- [ ] 19: In case of a Fabrica without any Jingle associated, the panel displays "Disfruta del programa" (=Enjoy the stream)

---

## Jingle Timeline Component

### Layout & Structure

- [ ] 20: Each row / Jingle will be an expandable box similar to the Metadata Panel but using the full width of the app.
- [ ] 21: The collapsed row to show the Comentario field as text (temporary behaviour)
- [ ] 22: When the row is expanded, show the following fields like a table (similar to the Metadata panel): - Titulo del Jingle - Cancion - Autor (may be more than 1 row) - Jinglero (may be more than 1 row) - Tematica (may be more than 1 row)
- [ ] 23: Cancion, Autor, Jinglero and Tematica to have an "Expand/Collapse" icon per row (disabled for now, future feature)

### Visual Design

- [ ] 24: Match the style of the Metadata Panel, i.e. a box with rounded corners
- [ ] 25: Expand/Collapse and Skip-to to be simple, intuitive icons (arrow down/up and 2 triangles) and no wording.

### Active Jingle Highlighting

- [ ] 26: Follow the description in the Metadata Panel.

### Expand/Collapse Behavior

- [ ] 27: Remember the Expanded/Collapsed state: When the Jingle is "current", it will be expanded, but when the player moves to the next Jingle (or the user skips to another segment)

### Scroll Behavior (especially with many jingles)

- [ ] 28: Scroll across all the list of Jingles, leaving the Heading static.
- [ ] 29: Even if the YouTube player is not showing ("current" row), keep the player status (playing or paused) unchanged.

---

## User Interactions & Navigation

### Skip-to-Timestamp (from Timeline)

- [ ] 30: The Metadata Panel in the current Jingle goes back to its state (collapsed or expanded) before being "active"
- [ ] 31: The Timeline row shrinks to the right and expands to become the Metadata Panel (if it was collapsed)
- [ ] 32: The YouTube Player slides to occupy the position at the left of the Current Jingle
- [ ] 33: Scroll the Timeline so the YT Player is at the top of the page.

- [ ] 34: Current Metadata Panel will have a "Replay" button on the top-right that allows to jump back to the start of the Jingle.

### Deep Linking (URL timestamp param)

- [ ] 35: Build timeline, and jump the YT Player to the timestamp setting, with the Metadata Panel showing the appropriate row.
- [ ] 36: Scroll the Timeline so the YT Player and Metadata Panel are at the top of the page.

### Metadata Updates During Playback

- [x] These are unlikely - I will re-load the page if changes are needed. [NO CHANGE]

---

## Loading & Error States

### Loading State

- [ ] 37: Load Jingles in order of playback, and create each Timeline row as the information is loaded.

### Error State (Missing Fabrica, Invalid URL, etc.)

- [ ] 38: Default to "latest Fabrica" with a Warning Modal "Error de datos, cargando la ultima Fabrica"

### Empty State (No Jingles)

- [ ] 39: As described in the Metadata Panel section.

---

## Responsiveness & Mobile Considerations

**Will be developed later**

### Desktop Layout

**Will be developed later**

### Tablet Layout

**Will be developed later**

### Mobile Layout

**Will be developed later**

---

## Performance & Data Loading

### Initial Page Load

- [ ] Feedback item: _your notes here_

### Metadata Fetching (when jingle becomes active)

- [ ] Fetch Metadata when building the timeline

### API Call Optimization

- [ ] I will consider DB Schema changes so the critical Jingle information is stored in the node (Cancion, Autor, Jinglero, Tematica) and maintained when updating the relationships.

---

## Text & Localization

### Spanish (Argentina) Text

- [ ] Feedback item: _your notes here_

### Labels & Messages

- [ ] Feedback item: _your notes here_

---

## Styling & Visual Design

**Will be developed later**

### Colors & Theme

- [ ] Feedback item: _your notes here_

### Typography

- [ ] Feedback item: _your notes here_

### Spacing & Alignment

- [ ] Feedback item: _your notes here_

### Borders & Shadows

- [ ] Feedback item: _your notes here_

---

## Accessibility

### Keyboard Navigation

- [ ] Feedback item: _your notes here_

### Screen Reader Support

- [ ] Feedback item: _your notes here_

### Focus States

- [ ] Feedback item: _your notes here_

---

## Edge Cases & Special Scenarios

### Very Long Jingle Lists

- [ ] Feedback item: _your notes here_

### Missing Data (null relationships)

- [ ] Feedback item: _your notes here_

### Video Unavailability

- [ ] Feedback item: _your notes here_

### Network Errors During Playback

- [ ] Feedback item: _your notes here_

---

## Additional Feedback

### Other Issues or Suggestions

- [ ] Feedback item: _your notes here_

### Features You'd Like to See

- [ ] Feedback item: _your notes here_

---

## Notes for Resolution

_This section will be filled by AI during resolution planning_

### Priority Order

1.
2.
3.

### Dependencies & Interactions

- _Notes about how changes might interact_

### Testing Checklist

- [ ] Test after changes complete
