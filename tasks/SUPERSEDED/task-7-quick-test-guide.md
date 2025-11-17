# Task 7.0: Quick Testing Guide

**Testing Time:** ~30-45 minutes  
**Priority:** Test critical paths first, then comprehensive scenarios

---

## 🚀 Pre-Test Setup

### 1. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd /Users/william/Usina/jinglero/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /Users/william/Usina/jinglero/frontend
npm run dev
```

### 2. Access Admin Portal
- Open browser: `http://localhost:5173/admin/login` (or your configured port)
- Log in with admin credentials
- Open DevTools Console (F12) to monitor for errors

---

## ⚡ PRIORITY TESTS (15 minutes)

These are the critical tests that must pass before considering the task complete.

### ✅ Test 1: "New" Button Works (2 min)
**What:** Verify the new "New" button appears and works on list pages

1. Navigate to `/admin/j` (Jingles list)
2. **Verify:** Green "Crear Jingle" button appears in header
3. Click the button
4. **Verify:** URL changes to `/admin/dashboard?create=j`
5. **Verify:** Form displays with Jingle fields

**Expected:** ✅ Button visible, navigation works, form appears

---

### ✅ Test 2: Simple Entity Creation (3 min)
**What:** Create an entity without relationship context

1. Navigate to `/admin/dashboard`
2. Select "Jingles" from dropdown
3. Click "Crear"
4. Fill in:
   - Title: "Quick Test Jingle"
   - Comment: "Testing Task 7.0"
5. Click "Crear"

**Expected:** 
- ✅ Entity created
- ✅ Navigated to `/admin/j/{newId}`
- ✅ Entity displays correctly
- ✅ No console errors

---

### ✅ Test 3: Entity Creation WITH Relationship (5 min)
**What:** Verify automatic relationship creation works

**Setup:** Note an existing Jingle ID (e.g., from the list above)

1. Navigate to `/admin/j/{existingJingleId}`
2. Click "Editar" button
3. Scroll to "Tematicas" section
4. In blank row, type "TestNewTematica"
5. Wait for "No results" message
6. **Verify:** Green "+" button appears with "Crear nueva entidad"
7. Click "+" button
8. **Verify:** URL is `/admin/dashboard?create=t&from=jingle&fromId={jingleId}&relType=tagged_with&searchText=TestNewTematica`
9. **Verify:** "Nombre" field is pre-filled with "TestNewTematica"
10. Add Description: "Test tematica"
11. Click "Crear"

**Expected:**
- ✅ Navigated back to `/admin/j/{jingleId}`
- ✅ Tematicas section automatically refreshes
- ✅ New "TestNewTematica" appears in list
- ✅ No console errors
- ✅ No page reload needed

---

### ✅ Test 4: Navigation State Refresh (3 min)
**What:** Verify fromEntityCreation state triggers refresh

1. From Test 3, click on the newly created "TestNewTematica"
2. **Verify:** Tematica detail page loads
3. **Verify:** Original Jingle appears in "Jingles" section
4. Click browser back button
5. **Verify:** Back on Jingle page
6. **Verify:** TestNewTematica still visible (refresh worked)

**Expected:** ✅ Bidirectional relationship verified

---

### ✅ Test 5: Pre-Population Works (2 min)
**What:** Verify searchText pre-populates fields

1. Navigate to: `/admin/dashboard?create=a&searchText=TestArtist`
2. **Verify:** "Nombre" field is pre-filled with "TestArtist"
3. Cancel or create the entity

**Expected:** ✅ Field pre-population works

---

## 📋 COMPREHENSIVE TESTS (20 minutes)

If priority tests pass, proceed with these comprehensive scenarios.

### Test 6: All Entity Types from List "New" Button (5 min)

Test each entity type's "New" button:

1. **Fabricas** (`/admin/f`) → "Crear Fábrica" button
2. **Jingles** (`/admin/j`) → "Crear Jingle" button
3. **Canciones** (`/admin/c`) → "Crear Cancion" button
4. **Artistas** (`/admin/a`) → "Crear Artista" button
5. **Temáticas** (`/admin/t`) → "Crear Tematica" button

**Expected:** ✅ All buttons work and navigate correctly

---

### Test 7: Relationship Direction - APPEARS_IN (5 min)

1. Create a Fabrica from a Jingle (via blank row)
2. Verify Fabrica appears in Jingle's "Fabrica" section
3. Navigate to the new Fabrica
4. Verify Jingle appears in Fabrica's "Jingles" section

**Expected:** ✅ Bidirectional relationship correct

---

### Test 8: Relationship Direction - VERSIONA (5 min)

1. Create a Cancion from a Jingle (via blank row)
2. Verify Cancion appears in Jingle's "Cancion" section
3. Navigate to the new Cancion
4. Verify Jingle appears in Cancion's "Jingles" section

**Expected:** ✅ Bidirectional relationship correct

---

### Test 9: Error Handling (3 min)

1. Navigate to `/admin/dashboard?create=f`
2. Leave "ID" field empty (required)
3. Fill only "Título": "Test Incomplete"
4. Click "Crear"

**Expected:** 
- ✅ Error message displays
- ✅ Form data preserved
- ✅ No navigation occurs

---

### Test 10: Multiple Consecutive Creations (2 min)

1. Create a Tematica
2. Navigate back to Dashboard
3. Create another Tematica
4. Verify both exist

**Expected:** ✅ No state pollution, both created successfully

---

## 🔍 QUICK REGRESSION CHECK (5 minutes)

Verify existing functionality still works:

1. **Search** → EntitySearchAutocomplete finds existing entities
2. **Edit Mode** → Can still edit entity metadata
3. **Manual Relationships** → Can create relationships without creation flow
4. **Delete** → Can still delete relationships

**Expected:** ✅ All existing features work

---

## ✅ SUCCESS CRITERIA

Task 7.0 is considered PASSING if:

- ✅ All 5 Priority Tests pass
- ✅ No console errors in any test
- ✅ Navigation and refresh work reliably
- ✅ "New" buttons appear on all list pages
- ✅ Relationship auto-creation works
- ✅ Pre-population works

---

## 🐛 If You Find Issues

Document issues in this format:

```
**Issue:** [Brief description]
**Test Case:** [Test number/name]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Console Errors:** [Any errors from console]
**Screenshots:** [If applicable]
```

---

## 📊 Test Results Template

```
PRIORITY TESTS:
[ ] Test 1: New Button Works
[ ] Test 2: Simple Entity Creation
[ ] Test 3: Entity Creation WITH Relationship
[ ] Test 4: Navigation State Refresh
[ ] Test 5: Pre-Population Works

COMPREHENSIVE TESTS:
[ ] Test 6: All Entity Types
[ ] Test 7: APPEARS_IN Direction
[ ] Test 8: VERSIONA Direction
[ ] Test 9: Error Handling
[ ] Test 10: Multiple Creations

REGRESSION CHECK:
[ ] Search works
[ ] Edit mode works
[ ] Manual relationships work
[ ] Delete works

OVERALL RESULT: [ ] PASS / [ ] FAIL
TESTED BY: ___________
DATE: ___________
```

---

## 🎯 Next Steps After Testing

**If ALL Tests Pass:**
1. Mark Task 7.0 as complete ✅
2. Document any minor observations
3. Move to Task 8.0

**If Issues Found:**
1. Document all issues
2. Fix critical issues
3. Re-test affected scenarios
4. Then proceed to Task 8.0

---

**Estimated Time:** 30-45 minutes total  
**Ready to start!** 🚀

