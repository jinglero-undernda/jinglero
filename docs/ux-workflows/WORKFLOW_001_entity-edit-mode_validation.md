# WORKFLOW_001: Entity Edit Mode - Code Validation Checklist

This document provides a checklist for validating that the code implementation matches the workflow specification in `WORKFLOW_001_entity-edit-mode.md`.

## Validation Approach

1. **State Machine Validation**: Verify state transitions match documented flows
2. **Component Behavior**: Check component props and callbacks match workflow steps
3. **API Integration**: Verify API calls align with workflow data requirements
4. **Error Handling**: Ensure error paths match documented edge cases
5. **Navigation**: Verify navigation flows match documented paths

---

## 1. State Management Validation

### Edit Mode State

**File**: `frontend/src/pages/admin/AdminEntityAnalyze.tsx`

- [ ] `isEditing` state exists and is managed correctly
- [ ] `isEditing` starts as `false` (view mode)
- [ ] `isEditing` becomes `true` when "Editar" clicked
- [ ] `isEditing` becomes `false` when "Cancelar" clicked (after confirmation if needed)

**Code Search**: `const [isEditing, setIsEditing] = useState(false)`

### Change Tracking State

**File**: `frontend/src/pages/admin/AdminEntityAnalyze.tsx`

- [ ] `metadataHasChanges` state exists
- [ ] `relationshipHasChanges` state exists
- [ ] `hasUnsavedChanges = metadataHasChanges || relationshipHasChanges`
- [ ] Both states start as `false` when entering edit mode
- [ ] States update correctly when changes made

**Code Search**:

- `const [metadataHasChanges, setMetadataHasChanges] = useState(false)`
- `const [relationshipHasChanges, setRelationshipHasChanges] = useState(false)`
- `checkUnsavedChanges()` function

### Modal State

**File**: `frontend/src/pages/admin/AdminEntityAnalyze.tsx`

- [ ] `showUnsavedModal` state exists
- [ ] `pendingNavigation` state exists (for navigation target)
- [ ] Modal shows when navigating with unsaved changes
- [ ] Modal hides after user choice

**Code Search**:

- `const [showUnsavedModal, setShowUnsavedModal] = useState(false)`
- `const [pendingNavigation, setPendingNavigation] = useState(null)`

---

## 2. Component Behavior Validation

### EntityCard Component

**File**: `frontend/src/components/common/EntityCard.tsx`

- [ ] `showAdminEditButton` prop exists
- [ ] `isEditing` prop exists
- [ ] `onEditClick` callback exists
- [ ] `onSaveClick` callback exists
- [ ] `hasUnsavedChanges` prop exists
- [ ] Guardar button disabled when `hasUnsavedChanges = false`
- [ ] Guardar button enabled when `hasUnsavedChanges = true`

**Code Search**:

- `showAdminEditButton?: boolean`
- `onEditClick?: () => void`
- `hasUnsavedChanges?: boolean`

### EntityMetadataEditor Component

**File**: `frontend/src/components/admin/EntityMetadataEditor.tsx`

- [ ] `isEditing` prop exists
- [ ] `onChange` callback exists and called when changes made
- [ ] `onChange(false)` called when no changes
- [ ] `onChange(true)` called when changes exist
- [ ] `onChange` only called when `isEditing = true`
- [ ] Fields editable when `isEditing = true`
- [ ] Fields read-only when `isEditing = false`
- [ ] Modified fields highlighted (green border)

**Code Search**:

- `onChange?: (hasChanges: boolean) => void`
- `useEffect(() => { if (onChange && isEditing) { onChange(hasChanges); } })`

### RelatedEntities Component

**File**: `frontend/src/components/common/RelatedEntities.tsx`

- [ ] `onChange` callback exists
- [ ] `onChange` called when relationship changes made
- [ ] `onChange(false)` called when no changes
- [ ] `onChange(true)` called when changes exist
- [ ] `onChange` only called when `isEditing = true`
- [ ] Empty relationship rows shown when `isEditing = true`
- [ ] Placeholder relationships hidden when `isEditing = true`
- [ ] `onNavigateToEntity` callback exists
- [ ] Navigation blocked when unsaved changes exist

**Code Search**:

- `onChange?: (hasChanges: boolean) => void`
- `onNavigateToEntity?: (entityType: string, entityId: string) => void`
- `hasUnsavedChanges()` function

### UnsavedChangesModal Component

**File**: `frontend/src/components/admin/UnsavedChangesModal.tsx`

- [ ] `isOpen` prop exists
- [ ] `onCancel` callback exists
- [ ] `onDiscard` callback exists
- [ ] `onSave` callback exists
- [ ] All three buttons present: Cancelar, Descartar, Guardar y continuar
- [ ] Modal closes after user choice

**Code Search**:

- `onCancel?: () => void`
- `onDiscard?: () => void`
- `onSave?: () => Promise<void>`

---

## 3. Workflow Step Validation

### Step 1: Navigate to Entity

- [ ] Route: `/admin/:entityType/:entityId`
- [ ] Entity loads from API
- [ ] View mode displayed
- [ ] Metadata panel shows all fields
- [ ] Placeholder relationships shown (if applicable)

**Code Search**: `useEffect(() => { fetchEntity(); }, [entityType, entityId])`

### Step 2: Enter Edit Mode

- [ ] "Editar" button click sets `isEditing = true`
- [ ] Guardar button appears but is inactive
- [ ] Cancelar and Borrar buttons appear
- [ ] Empty relationship rows appear
- [ ] Placeholder relationships hidden
- [ ] Metadata fields become editable
- [ ] `hasUnsavedChanges = false` (CLEAN STATE)

**Code Search**: `onEditClick={() => setIsEditing(true)}`

### Step 3a: Make Changes

- [ ] Metadata change triggers `onChange(true)`
- [ ] Relationship change triggers `onChange(true)`
- [ ] Guardar button activates
- [ ] Modified properties highlighted (green border)

**Code Search**:

- `setMetadataHasChanges(true)`
- `setRelationshipHasChanges(true)`

### Step 3b: Navigate Away (No Changes)

- [ ] Navigation proceeds immediately
- [ ] No modal shown
- [ ] `checkUnsavedChanges()` returns `false`

**Code Search**: `if (!checkUnsavedChanges()) { navigate(...) }`

### Step 3c: Search Related Entity

- [ ] Search functionality works
- [ ] No match → Create option appears
- [ ] Match found → Relationship added
- [ ] If other changes exist → Modal shown before create

**Code Search**: Entity search in `RelatedEntities.tsx`

### Step 4a: Navigate Away (With Changes)

- [ ] Navigation attempt triggers modal
- [ ] Modal shows three options
- [ ] Cancelar → Stay on page
- [ ] Descartar y seguir → Discard and navigate
- [ ] Guardar y seguir → Save and navigate

**Code Search**:

- `onNavigateToEntity` with unsaved changes check
- `setShowUnsavedModal(true)`

### Step 4b: Press Guardar

- [ ] Save operation commits to database
- [ ] Both metadata and relationship changes saved
- [ ] `hasUnsavedChanges = false` after save
- [ ] Guardar button becomes inactive
- [ ] User remains in edit mode

**Code Search**:

- `handleSave` function
- `metadataEditorRef.current?.save()`
- `relatedEntitiesRef.current?.clearUnsavedChanges({ commit: true })`

### Step 4c: Press Cancelar

- [ ] If no changes → Exit edit mode immediately
- [ ] If changes exist → Show discard modal
- [ ] Cancelar in modal → Stay in edit mode
- [ ] Descartar in modal → Exit edit mode, discard changes

**Code Search**:

- `handleCancel` function
- `checkUnsavedChanges()` check

### Step 5: Entity Creation Flow

- [ ] Navigate to create page
- [ ] Pre-populate with search term
- [ ] After create/cancel → Return to previous entity
- [ ] Previous entity in edit mode
- [ ] Edit mode state preserved

**Code Search**:

- `AdminDashboard.tsx` entity creation
- Return navigation with state

---

## 4. Edge Case Validation

### Edge Case 1: Multiple Rapid Changes

- [ ] State updates handle rapid changes
- [ ] No race conditions
- [ ] Guardar activates correctly

**Code Search**: `useEffect` dependencies and state updates

### Edge Case 2: Network Error During Save

- [ ] Error message displayed
- [ ] Changes preserved
- [ ] Guardar remains active
- [ ] User can retry

**Code Search**: Error handling in `handleSave`

### Edge Case 3: Browser Back Button

- [ ] `beforeunload` event handler exists
- [ ] Warning shown when unsaved changes
- [ ] Changes preserved if user cancels

**Code Search**:

- `useEffect(() => { window.addEventListener('beforeunload', ...) })`

### Edge Case 4: Relationship Expansion (BUG_0002)

- [ ] Expanding relationship does NOT mark as dirty
- [ ] Only actual property changes mark as dirty
- [ ] `relationshipPropsInitialData` used for comparison

**Code Search**:

- `isRelationshipPropsDirty` function
- `relationshipPropsInitialData` state

---

## 5. API Integration Validation

### Save Metadata

- [ ] API endpoint: `PUT /api/admin/:entityType/:entityId`
- [ ] Request includes all changed fields
- [ ] Response handled correctly
- [ ] Error handling implemented

**Code Search**: `fetch('/api/admin/${entityType}/${entityId}', { method: 'PUT', ... })`

### Save Relationships

- [ ] Create: `POST /api/admin/relationships`
- [ ] Update: `PUT /api/admin/relationships/:id`
- [ ] Delete: `DELETE /api/admin/relationships/:id`
- [ ] All operations handled correctly

**Code Search**: Relationship API calls in `RelatedEntities.tsx`

---

## 6. Navigation Validation

### Navigation Blocking

- [ ] Navigation blocked when unsaved changes
- [ ] Modal shown before navigation
- [ ] Navigation proceeds based on user choice

**Code Search**: `onNavigateToEntity` callback

### Return Navigation

- [ ] Return from entity creation works
- [ ] Previous entity state preserved
- [ ] Edit mode maintained

**Code Search**: Navigation with state: `navigate(..., { state: { fromEntityCreation: true } })`

---

## 7. UI/UX Validation

### Visual Feedback

- [ ] Modified fields highlighted (green border)
- [ ] Guardar button state reflects changes
- [ ] Status indicators clear

**Code Search**: CSS classes for modified fields

### Modal Behavior

- [ ] Modal appears at correct times
- [ ] Modal closes after choice
- [ ] Modal text is clear

**Code Search**: `UnsavedChangesModal` component

---

## Validation Results Template

```
Validation Date: YYYY-MM-DD
Validator: [Name]
Status: [Pass / Fail / Partial]

Summary:
- State Management: [Pass/Fail]
- Component Behavior: [Pass/Fail]
- Workflow Steps: [Pass/Fail]
- Edge Cases: [Pass/Fail]
- API Integration: [Pass/Fail]
- Navigation: [Pass/Fail]
- UI/UX: [Pass/Fail]

Issues Found:
1. [Issue description]
2. [Issue description]

Recommendations:
1. [Recommendation]
2. [Recommendation]
```

---

## Automated Validation (Future)

Consider creating automated tests based on this checklist:

- Unit tests for state management
- Integration tests for workflow steps
- E2E tests for complete user flows
- Visual regression tests for UI states
