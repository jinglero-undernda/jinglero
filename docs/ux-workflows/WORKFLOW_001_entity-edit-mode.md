# WORKFLOW_001: Entity Edit Mode

**Status**: draft  
**Last Updated**: 2025-01-XX  
**Related Components**:

- `AdminEntityAnalyze.tsx`
- `EntityMetadataEditor.tsx`
- `RelatedEntities.tsx`
- `EntityCard.tsx`
- `UnsavedChangesModal.tsx`

**Dependencies**: None

---

## Overview

This workflow defines the complete user experience for editing entity metadata and relationships in the Admin Portal. It covers entering edit mode, making changes, handling unsaved changes, and exiting edit mode.

**User Context**: Admin user managing entity data in the knowledge graph  
**Success Criteria**: User can edit entity data, see clear feedback on changes, and safely navigate away with appropriate warnings

---

## Flow Diagram

See `WORKFLOW_001_entity-edit-mode_diagram.md` for the complete Mermaid flowchart.

**Key States**:

- View Mode (read-only)
- Edit Mode - Clean State (no changes)
- Edit Mode - Dirty State (unsaved changes)
- Navigation Warning Modal
- Discard Confirmation Modal

---

## Detailed Steps

### 1. Navigate to Entity

**User Action**: Navigate to `/admin/:entityType/:entityId`

**System Response**:

- Load entity data from API
- Display entity in view mode
- Show metadata panel with all fields (including empty fields)
- Show placeholder relationships (if applicable)

**UI State**:

- Entity card in view mode
- No edit controls visible
- Placeholder relationships visible

**Validation**:

- ✅ Entity loads successfully
- ✅ All metadata fields displayed per specification
- ✅ Placeholder relationships shown correctly

---

### 2. Enter Edit Mode

**User Action**: Click "Editar" button in entity heading row

**System Response**:

- Switch to edit mode
- Show edit controls: Guardar (inactive), Cancelar, Borrar
- Show empty relationship rows for adding new relationships
- Hide placeholder relationships
- Enable metadata field editing

**UI State**:

- `isEditing = true`
- `hasUnsavedChanges = false` (clean state)
- Guardar button disabled
- Cancelar and Borrar buttons visible
- Metadata fields editable
- Empty relationship rows visible

**Validation**:

- ✅ Guardar button appears but is inactive
- ✅ Cancelar and Borrar buttons appear
- ✅ Empty relationship rows visible
- ✅ Placeholder relationships hidden
- ✅ Metadata fields become editable

**Key Code References**:

- `AdminEntityAnalyze.tsx`: `setIsEditing(true)`
- `EntityCard.tsx`: `onEditClick` handler
- `EntityMetadataEditor.tsx`: `isEditing` prop

---

### 3. User Actions in Edit Mode

#### 3a. Make Changes

**User Action**: Modify metadata fields or relationships

**System Response**:

- Activate Guardar button
- Highlight modified properties (green border)
- Track changes in state

**UI State**:

- `hasUnsavedChanges = true`
- Guardar button enabled
- Modified fields highlighted

**Validation**:

- ✅ Guardar button activates immediately
- ✅ Modified properties show green border
- ✅ Changes tracked correctly

**Key Code References**:

- `EntityMetadataEditor.tsx`: `onChange` callback
- `RelatedEntities.tsx`: `onChange` callback
- `AdminEntityAnalyze.tsx`: `setMetadataHasChanges`, `setRelationshipHasChanges`

#### 3b. Navigate Away (No Changes)

**User Action**: Navigate to another entity (no changes made)

**System Response**:

- Navigate immediately without warning
- No modal shown

**UI State**:

- Navigation proceeds normally

**Validation**:

- ✅ Navigation happens immediately
- ✅ No warning modal appears

**Key Code References**:

- `AdminEntityAnalyze.tsx`: `checkUnsavedChanges()` returns false
- `RelatedEntities.tsx`: `onNavigateToEntity` callback

#### 3c. Search Related Entity

**User Action**: Search for related entity in empty relationship row

**System Response**:

- Show search results
- If no match: offer to create new entity
- If match found: add relationship

**UI State**:

- Search results displayed
- Create option available if no match

**Validation**:

- ✅ Search works correctly
- ✅ Create option appears when no match
- ✅ Relationship added when match found

**Key Code References**:

- `RelatedEntities.tsx`: Entity search logic
- `AdminDashboard.tsx`: Entity creation flow

---

### 4. Actions After Changes

#### 4a. Navigate Away (With Changes)

**User Action**: Attempt to navigate to another entity while having unsaved changes

**System Response**:

- Show navigation warning modal with options:
  - Cancelar: Stay on current page
  - Descartar y seguir: Discard changes and navigate
  - Guardar y seguir: Save changes and navigate

**UI State**:

- Modal visible
- Navigation paused

**Validation**:

- ✅ Modal appears when unsaved changes exist
- ✅ All three options work correctly
- ✅ Navigation proceeds based on choice

**Key Code References**:

- `AdminEntityAnalyze.tsx`: `showUnsavedModal` state
- `UnsavedChangesModal.tsx`: Modal component
- `RelatedEntities.tsx`: `onNavigateToEntity` with unsaved changes check

#### 4b. Press Guardar Button

**User Action**: Click Guardar button to save changes

**System Response**:

- Commit changes to database (direct and derivative)
- Return to edit mode with Guardar inactive
- Clear change tracking

**UI State**:

- `hasUnsavedChanges = false`
- Guardar button inactive
- Still in edit mode

**Validation**:

- ✅ Changes saved to database
- ✅ Guardar button becomes inactive
- ✅ User remains in edit mode
- ✅ Change indicators cleared

**Key Code References**:

- `AdminEntityAnalyze.tsx`: `handleSave` function
- `EntityMetadataEditor.tsx`: `save()` method
- `RelatedEntities.tsx`: `clearUnsavedChanges({ commit: true })`

#### 4c. Press Cancelar Button

**User Action**: Click Cancelar button to exit edit mode

**System Response**:

- If no changes: Exit edit mode immediately
- If changes exist: Show discard confirmation modal:
  - Cancelar: Stay in edit mode
  - Descartar: Exit edit mode and discard changes

**UI State**:

- Modal visible (if changes exist)
- Edit mode state preserved (if Cancelar chosen)

**Validation**:

- ✅ No modal if no changes
- ✅ Modal appears if changes exist
- ✅ Changes discarded correctly
- ✅ Returns to view mode

**Key Code References**:

- `AdminEntityAnalyze.tsx`: `handleCancel` function
- `EntityMetadataEditor.tsx`: `clearUnsavedChanges()`
- `RelatedEntities.tsx`: `clearUnsavedChanges({ commit: false })`

---

### 5. Entity Creation Flow (from Search)

**User Action**: Create new entity when no search match found

**System Response**:

- Navigate to entity creation page
- Pre-populate with search term
- After creation/cancel: Return to previous entity in edit mode

**UI State**:

- Entity creation page
- Previous entity state preserved

**Validation**:

- ✅ Creation page pre-populated correctly
- ✅ Returns to previous entity in edit mode
- ✅ Edit mode state preserved

**Key Code References**:

- `AdminDashboard.tsx`: Entity creation
- `AdminEntityAnalyze.tsx`: Return navigation with state

---

## Edge Cases

### Edge Case 1: Multiple Rapid Changes

**Scenario**: User makes multiple changes rapidly

**Expected Behavior**: All changes tracked correctly, Guardar activates once

**Validation**:

- ✅ Change tracking handles rapid updates
- ✅ No race conditions in state updates

### Edge Case 2: Network Error During Save

**Scenario**: Save operation fails due to network error

**Expected Behavior**: Show error message, keep changes, allow retry

**Validation**:

- ✅ Error displayed to user
- ✅ Changes preserved
- ✅ Guardar button remains active

### Edge Case 3: Concurrent Edits

**Scenario**: Entity edited in another tab/window

**Expected Behavior**: (To be defined - currently not handled)

**Validation**:

- ⚠️ Not yet implemented

### Edge Case 4: Browser Back Button

**Scenario**: User presses browser back button with unsaved changes

**Expected Behavior**: Show beforeunload warning

**Validation**:

- ✅ Browser warning appears
- ✅ Changes preserved if user cancels

**Key Code References**:

- `AdminEntityAnalyze.tsx`: `beforeunload` event handler

---

## Implementation Notes

### State Management

**Key State Variables**:

- `isEditing`: Boolean - whether in edit mode
- `metadataHasChanges`: Boolean - metadata has unsaved changes
- `relationshipHasChanges`: Boolean - relationships have unsaved changes
- `showUnsavedModal`: Boolean - show navigation warning modal
- `pendingNavigation`: Object - navigation target when modal shown

**State Coordination**:

- `hasUnsavedChanges = metadataHasChanges || relationshipHasChanges`
- Both `EntityMetadataEditor` and `RelatedEntities` report changes via `onChange` callbacks

### Component Responsibilities

**AdminEntityAnalyze**:

- Manages edit mode state
- Coordinates metadata and relationship changes
- Handles navigation warnings
- Manages save/cancel operations

**EntityMetadataEditor**:

- Tracks metadata field changes
- Reports changes via `onChange` callback
- Handles save operation for metadata

**RelatedEntities**:

- Tracks relationship changes
- Reports changes via `onChange` callback
- Handles relationship property edits
- Manages relationship creation/deletion

**UnsavedChangesModal**:

- Displays navigation warning
- Handles user choice (Cancelar, Descartar, Guardar y seguir)

### API Integration

**Save Operations**:

- Metadata: `PUT /api/admin/:entityType/:entityId`
- Relationships: `POST /api/admin/relationships` (create)
- Relationships: `PUT /api/admin/relationships/:id` (update)
- Relationships: `DELETE /api/admin/relationships/:id` (delete)

**Data Flow**:

1. User makes changes → Component state updated
2. User clicks Guardar → API calls made
3. API success → State cleared, UI updated
4. API error → Error displayed, changes preserved

---

## Validation Checklist

### Code Review Checklist

- [ ] Edit mode state managed correctly
- [ ] Change tracking works for both metadata and relationships
- [ ] Guardar button activates/deactivates correctly
- [ ] Navigation warnings appear when appropriate
- [ ] Save operations commit all changes
- [ ] Cancel operations discard changes correctly
- [ ] Error handling implemented
- [ ] Browser back button handled

### Test Scenarios

1. **Enter Edit Mode**

   - [ ] Click Editar → Edit mode activated
   - [ ] Guardar inactive, Cancelar/Borrar visible
   - [ ] Empty relationship rows appear
   - [ ] Placeholder relationships hidden

2. **Make Changes**

   - [ ] Edit metadata → Guardar activates
   - [ ] Add relationship → Guardar activates
   - [ ] Modify relationship properties → Guardar activates
   - [ ] Modified fields highlighted

3. **Save Changes**

   - [ ] Click Guardar → Changes saved
   - [ ] Guardar becomes inactive
   - [ ] Remains in edit mode
   - [ ] Changes persist after page reload

4. **Cancel Changes**

   - [ ] No changes → Exit edit mode immediately
   - [ ] With changes → Show modal
   - [ ] Cancelar in modal → Stay in edit mode
   - [ ] Descartar in modal → Exit edit mode, changes lost

5. **Navigate with Changes**

   - [ ] No changes → Navigate immediately
   - [ ] With changes → Show warning modal
   - [ ] Cancelar → Stay on page
   - [ ] Descartar y seguir → Navigate, changes lost
   - [ ] Guardar y seguir → Save and navigate

6. **Entity Creation Flow**
   - [ ] Search with no match → Create option appears
   - [ ] Create entity → Returns to previous entity in edit mode
   - [ ] Cancel creation → Returns to previous entity in edit mode

### Acceptance Criteria

- ✅ User can enter and exit edit mode smoothly
- ✅ Changes are clearly indicated in UI
- ✅ Unsaved changes are protected from accidental loss
- ✅ Save and cancel operations work correctly
- ✅ Navigation warnings appear when appropriate
- ✅ Entity creation flow integrates correctly

---

## Related Workflows

- **WORKFLOW_002**: Entity Creation (draft)
- **WORKFLOW_003**: Relationship Management (draft)
- **WORKFLOW_004**: Navigation with Unsaved Changes (draft)

---

## Change History

| Date       | Change                         | Author | Reason                                   |
| ---------- | ------------------------------ | ------ | ---------------------------------------- |
| 2025-01-XX | Initial workflow documentation | -      | Establish workflow documentation process |

---

## Notes

- This workflow is based on the comprehensive specification in `docs/adminWorkflow.md`
- The "CLEAN STATE" concept is critical - edit mode should start with no changes tracked
- BUG_0002 relates to this workflow - relationship expansion should not mark as dirty
- Future enhancement: Consider auto-save draft functionality
