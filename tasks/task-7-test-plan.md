# Task 7.0: Entity Creation Flow - Test Plan

**Date:** November 15, 2025  
**Status:** Ready for Testing  
**Tester:** [Your Name]

## Overview

This document provides a comprehensive test plan for Task 7.0 - Standardize Entity Creation Flow. Follow these test cases to verify that all entity creation flows work correctly with proper relationship handling and navigation.

---

## Pre-Test Setup

1. Start the development server: `npm run dev` (frontend) and ensure backend is running
2. Log in to admin portal at `/admin/login`
3. Have at least one entity of each type in the database for relationship testing
4. Open browser DevTools console to monitor for errors

---

## Test Case 1: Dashboard Creation WITHOUT Relationship Context

### Objective
Verify that creating an entity from Dashboard dropdown works without relationship context.

### Steps
1. Navigate to `/admin/dashboard`
2. Select "Jingles" from the dropdown
3. Click "Crear" button
4. Verify URL changes to `/admin/dashboard?create=j`
5. Fill in the form:
   - Title: "Test Jingle Creation"
   - Comment: "Test comment"
6. Click "Crear" button
7. Wait for entity to be created

### Expected Results
- ✅ Entity is created successfully
- ✅ Toast notification shows success message
- ✅ User is navigated to `/admin/j/{newEntityId}`
- ✅ Entity detail page displays the new entity
- ✅ No console errors

---

## Test Case 2: Dashboard Creation WITH Relationship Context (Manual URL)

### Objective
Verify that creating an entity with relationship context auto-creates the relationship.

### Setup
- Note the ID of an existing Jingle (e.g., "jingle-123")

### Steps
1. Navigate to `/admin/dashboard?create=c&from=j&fromId=jingle-123&relType=versiona`
2. Verify the form displays with a message about automatic relationship creation
3. Fill in the form:
   - Title: "Test Cancion with Relationship"
   - Album: "Test Album"
4. Click "Crear" button
5. Wait for navigation

### Expected Results
- ✅ Entity is created successfully
- ✅ Relationship is created automatically
- ✅ User is navigated back to `/admin/j/jingle-123`
- ✅ Toast notification shows success
- ✅ RelatedEntities automatically refreshes
- ✅ New Cancion appears in the "Cancion" section
- ✅ No console errors

---

## Test Case 3: Dashboard Creation WITH searchText Pre-Population

### Objective
Verify that searchText parameter pre-populates the appropriate field.

### Steps
1. Navigate to `/admin/dashboard?create=a&searchText=Madonna`
2. Verify the form loads
3. Check that the "Nombre" field is pre-filled with "Madonna"
4. Add additional data:
   - Nombre Artístico: "Madonna"
   - Nacionalidad: "USA"
5. Click "Crear"

### Expected Results
- ✅ "Nombre" field is pre-populated with "Madonna"
- ✅ Entity is created successfully
- ✅ User is navigated to new entity detail page
- ✅ No console errors

---

## Test Case 4: Blank Row Entity Creation (EntitySearchAutocomplete "+" Button)

### Objective
Verify that clicking "+" in blank row navigates to Dashboard with full context.

### Setup
- Navigate to an existing Jingle detail page: `/admin/j/{jingleId}`
- Click "Editar" to enable edit mode

### Steps
1. Scroll to "Tematicas" section
2. Type "NonExistentTematica" in the blank row search field
3. Wait for search to complete (no results)
4. Verify green "+" button appears with "Crear nueva entidad"
5. Click the "+" button
6. Verify URL is `/admin/dashboard?create=t&from=jingle&fromId={jingleId}&relType=tagged_with&searchText=NonExistentTematica`
7. Verify "Nombre" field is pre-populated with "NonExistentTematica"
8. Add:
   - Descripción: "Test tematica"
   - Categoría: "Test"
9. Click "Crear"

### Expected Results
- ✅ "+" button appears when no results found
- ✅ Navigation to Dashboard with correct URL parameters
- ✅ "Nombre" field pre-populated
- ✅ Entity is created
- ✅ Relationship is created automatically
- ✅ User is navigated back to `/admin/j/{jingleId}`
- ✅ RelatedEntities refreshes automatically
- ✅ New Tematica appears in "Tematicas" section
- ✅ No console errors

---

## Test Case 5: AdminEntityList "New" Button

### Objective
Verify that "New" button in AdminEntityList navigates to Dashboard.

### Steps
1. Navigate to `/admin/c` (Canciones list)
2. Verify "Crear Cancion" button exists in header (green button with "+")
3. Click the "Crear Cancion" button
4. Verify URL changes to `/admin/dashboard?create=c`
5. Fill in the form:
   - Title: "Test Cancion from List"
6. Click "Crear"

### Expected Results
- ✅ "Crear Cancion" button is visible and clickable
- ✅ Navigation to Dashboard with correct create parameter
- ✅ Entity is created successfully
- ✅ User is navigated to new entity detail page
- ✅ No console errors

---

## Test Case 6: Relationship Direction - APPEARS_IN (Jingle → Fabrica)

### Objective
Verify correct relationship direction for APPEARS_IN.

### Steps
1. Navigate to an existing Jingle: `/admin/j/{jingleId}`
2. Click "Editar"
3. In "Fabrica" section blank row, search for non-existent fabrica
4. Click "+" button
5. Fill in Fabrica form:
   - ID: "test-video-id"
   - Título: "Test Fabrica"
   - Fecha: Select today's date
6. Click "Crear"
7. After navigation back, verify relationship appears
8. Click on the new Fabrica to view its detail page
9. Verify the Jingle appears in the Fabrica's "Jingles" section

### Expected Results
- ✅ Relationship created with correct direction: (Jingle)-[APPEARS_IN]->(Fabrica)
- ✅ Fabrica shows in Jingle's "Fabrica" section
- ✅ Jingle shows in Fabrica's "Jingles" section
- ✅ No console errors

---

## Test Case 7: Relationship Direction - AUTOR_DE (Artista → Cancion)

### Objective
Verify correct relationship direction for AUTOR_DE.

### Steps
1. Navigate to an existing Cancion: `/admin/c/{cancionId}`
2. Click "Editar"
3. In "Autor" section blank row, search for non-existent artista
4. Click "+" button
5. Fill in Artista form:
   - Nombre: "Test Artist"
   - Nombre Artístico: "Test"
6. Click "Crear"
7. After navigation back, verify relationship appears
8. Click on the new Artista to view its detail page
9. Verify the Cancion appears in the Artista's "Canciones" section

### Expected Results
- ✅ Relationship created with correct direction: (Artista)-[AUTOR_DE]->(Cancion)
- ✅ Artista shows in Cancion's "Autor" section
- ✅ Cancion shows in Artista's "Canciones" section
- ✅ No console errors

---

## Test Case 8: Error Handling - Entity Creation Fails

### Objective
Verify error handling when entity creation fails.

### Steps
1. Navigate to `/admin/dashboard?create=f`
2. Leave "ID" field empty (required field)
3. Fill in only:
   - Título: "Test Fabrica Without ID"
4. Click "Crear"

### Expected Results
- ✅ Error message appears for missing required field
- ✅ Form data is preserved (Title still filled)
- ✅ User can correct and retry
- ✅ No navigation occurs
- ✅ Error displayed as field-level error (red border) or toast

---

## Test Case 9: Error Handling - Relationship Creation Fails

### Objective
Verify error handling when relationship creation fails (entity succeeds).

### Setup
This is difficult to test without backend manipulation. Manual verification:
- Check console logs for relationship creation errors
- Verify that even if relationship fails, user is still navigated back
- Verify error toast is shown

### Expected Results
- ✅ Toast shows: "Entidad creada, pero error al crear la relación: {error}"
- ✅ User is still navigated to source entity
- ✅ Entity can be seen in appropriate list
- ✅ User can manually create relationship later

---

## Test Case 10: Navigation State Triggers Refresh

### Objective
Verify that fromEntityCreation state triggers RelatedEntities refresh.

### Steps
1. Navigate to existing Jingle: `/admin/j/jingle-123`
2. Note the relationships currently displayed
3. Manually navigate to: `/admin/dashboard?create=t&from=j&fromId=jingle-123&relType=tagged_with&searchText=TestTag`
4. Create the Tematica
5. Observe after navigation back to Jingle

### Expected Results
- ✅ After navigation back, RelatedEntities automatically refreshes
- ✅ New Tematica appears without manual page reload
- ✅ Console shows refresh being called (check for any refresh logs)
- ✅ 100ms delay prevents race conditions

---

## Test Case 11: All Entity Types Work

### Objective
Verify creation works for all entity types.

### Steps
Test creation for each entity type from Dashboard:

1. **Fabrica**: `/admin/dashboard?create=f`
   - Required: ID, Título
2. **Jingle**: `/admin/dashboard?create=j`
   - Required: (check validation)
3. **Cancion**: `/admin/dashboard?create=c`
   - Required: Título
4. **Artista**: `/admin/dashboard?create=a`
   - Required: Nombre OR Nombre Artístico
5. **Tematica**: `/admin/dashboard?create=t`
   - Required: Nombre
6. **Usuario**: `/admin/dashboard?create=u`
   - Required: Email

### Expected Results
- ✅ All entity types can be created
- ✅ Required field validation works
- ✅ Navigation works for all types
- ✅ No console errors for any type

---

## Test Case 12: Multiple Consecutive Creations

### Objective
Verify that multiple consecutive entity creations work without issues.

### Steps
1. Create a Fabrica
2. Navigate back to Dashboard
3. Create a Jingle
4. Navigate back to Dashboard
5. Create an Artista
6. Verify all entities exist

### Expected Results
- ✅ All entities are created successfully
- ✅ No state pollution between creations
- ✅ Form resets between each creation
- ✅ No memory leaks or console errors

---

## Test Case 13: Cancel Creation

### Objective
Verify that canceling creation returns to Dashboard without creating entity.

### Steps
1. Navigate to `/admin/dashboard?create=j&from=f&fromId=fabrica-123&relType=appears_in`
2. Fill in some fields
3. Click "Cancelar" button
4. Verify URL returns to `/admin/dashboard`
5. Navigate to `/admin/f/fabrica-123`
6. Verify no new Jingle was created

### Expected Results
- ✅ "Cancelar" button returns to Dashboard
- ✅ No entity is created
- ✅ No relationship is created
- ✅ No console errors

---

## Regression Tests

### Test existing functionality isn't broken

1. **Search still works**: Verify EntitySearchAutocomplete finds existing entities
2. **Manual relationship creation**: Create relationships without going through creation flow
3. **Edit existing entities**: Verify edit mode still works
4. **Delete relationships**: Verify deletion still works
5. **Public pages**: Verify public inspection pages still work

---

## Browser Compatibility

Test on:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

---

## Success Criteria

**All tests must pass for Task 7.0 to be considered complete:**

- [ ] All 13 test cases pass
- [ ] No console errors in any test case
- [ ] All relationship directions are correct
- [ ] Navigation and refresh work reliably
- [ ] Error handling is graceful
- [ ] UI is responsive and user-friendly
- [ ] Documentation is clear and complete

---

## Known Issues / Notes

[Document any issues found during testing here]

---

## Test Results

**Tested by:** _______________  
**Date:** _______________  
**Result:** PASS / FAIL  
**Notes:**


