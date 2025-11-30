# WORKFLOW_011: Database Cleanup and Validation - Validation Checklist

**Last Validated**: 2025-11-28  
**Validation Status**: draft - Feature not yet implemented  
**Workflow Version**: 1.0

## Summary

This workflow documents a new feature that has not yet been implemented. The validation identifies what exists in the codebase and what needs to be created.

**Status**: ⚠️ **Draft - Implementation Required**

- **Total Checks**: 25
- **Passed**: 2 (existing infrastructure)
- **Needs Implementation**: 23
- **Warnings**: 0

## 1. Code References

### Validated ✅
- `frontend/src/pages/AdminPage.tsx` - ✅ Exists, route structure in place
- `frontend/src/pages/admin/AdminEntityAnalyze.tsx` - ✅ Exists, can be used for Step 6 navigation

### Needs Implementation ⚠️
- `frontend/src/pages/admin/DatabaseCleanupPage.tsx` - ⚠️ **To be created** - Main cleanup page component
- `frontend/src/components/admin/CleanupScriptButton.tsx` - ⚠️ **To be created** - Script button component
- `frontend/src/components/admin/CleanupResultsModal.tsx` - ⚠️ **To be created** - Results modal component
- `frontend/src/components/admin/CleanupScriptSection.tsx` - ⚠️ **To be created** - Section grouping component
- `frontend/src/pages/AdminPage.tsx` - ⚠️ **Needs update** - Add `/admin/cleanup` route
- `frontend/src/pages/admin/AdminDashboard.tsx` - ⚠️ **Needs update** - Add navigation link to cleanup page

## 2. State Management

### Needs Implementation ⚠️
- `scripts` (array) - ⚠️ **To be implemented** in `DatabaseCleanupPage.tsx`
- `runningScripts` (Set<string>) - ⚠️ **To be implemented** in `DatabaseCleanupPage.tsx`
- `results` (object) - ⚠️ **To be implemented** in `DatabaseCleanupPage.tsx`
- `showResultsModal` (boolean) - ⚠️ **To be implemented** in `DatabaseCleanupPage.tsx`
- `selectedScript` (string | null) - ⚠️ **To be implemented** in `DatabaseCleanupPage.tsx`
- `automating` (boolean) - ⚠️ **To be implemented** in `CleanupResultsModal.tsx`
- `automationResults` (object) - ⚠️ **To be implemented** in `CleanupResultsModal.tsx`

**State Transitions**: 
- ⚠️ **To be implemented** - State transitions documented in workflow but not yet in code

## 3. API Integration

### Needs Implementation ⚠️
- `GET /api/admin/cleanup/scripts` - ⚠️ **To be created** - List available cleanup scripts
- `POST /api/admin/cleanup/:scriptId/execute` - ⚠️ **To be created** - Execute cleanup script
- `POST /api/admin/cleanup/:scriptId/automate` - ⚠️ **To be created** - Apply automated fixes

**API Client Methods**:
- `adminApi.getCleanupScripts()` - ⚠️ **To be added** to `frontend/src/lib/api/client.ts`
- `adminApi.executeCleanupScript(scriptId)` - ⚠️ **To be added** to `frontend/src/lib/api/client.ts`
- `adminApi.automateCleanupFixes(scriptId, entityIds)` - ⚠️ **To be added** to `frontend/src/lib/api/client.ts`

**Backend Endpoints**:
- ⚠️ **To be created** in `backend/src/server/api/admin.ts`
- ⚠️ **To be created** - Backend script implementations for all 11 cleanup scripts

## 4. Component Behavior

### Needs Implementation ⚠️
- `DatabaseCleanupPage` - ⚠️ **To be created** - Main page component
  - Props: None (page component)
  - Responsibilities: Script execution, results state management, modal control
- `CleanupScriptButton` - ⚠️ **To be created** - Individual script button
  - Props: `scriptId`, `scriptName`, `entityType`, `onClick`, `loading`, `disabled`
  - Responsibilities: Display script info, handle click, show loading state
- `CleanupResultsModal` - ⚠️ **To be created** - Results display modal
  - Props: `isOpen`, `results`, `onClose`, `onAutomate`, `onNavigateToEntity`
  - Responsibilities: Display results, handle automation, entity navigation
- `CleanupScriptSection` - ⚠️ **To be created** - Section grouping component
  - Props: `entityType`, `scripts`, `onScriptClick`
  - Responsibilities: Group scripts by entity type, render section header

### Validated ✅
- `AdminEntityAnalyze` - ✅ Exists - Can be used for Step 6 (navigate to affected entities)

## 5. Route Configuration

### Needs Implementation ⚠️
- Route `/admin/cleanup` - ⚠️ **To be added** to `frontend/src/pages/AdminPage.tsx`
  - Component: `DatabaseCleanupPage`
  - Protected: Yes (should use `ProtectedRoute`)
  - Position: Should be added before catch-all routes

### Needs Update ⚠️
- `AdminDashboard.tsx` - ⚠️ **Needs update** - Add navigation link/button to `/admin/cleanup`
  - Should be added to the "Navegación" section (around line 1177-1218)
  - Link text: "Limpieza en la Base de Datos"

## 6. Workflow Steps

### Step 1: Access Database Cleanup Page
- ⚠️ **Needs implementation** - Route and navigation link not yet created
- ✅ Route structure exists in `AdminPage.tsx` (can add new route)
- ⚠️ Navigation link missing from `AdminDashboard.tsx`

### Step 2: View Available Cleanup Scripts
- ⚠️ **Needs implementation** - `DatabaseCleanupPage` component not created
- ⚠️ Script catalog needs to be defined (workflow documents 11 scripts)

### Step 3: Execute Cleanup Script
- ⚠️ **Needs implementation** - Button component and click handler not created
- ⚠️ API endpoint not created
- ⚠️ Loading state management not implemented

### Step 4: Script Execution Completes
- ⚠️ **Needs implementation** - Results handling not implemented
- ⚠️ Modal component not created
- ⚠️ Results data structure needs to match workflow specification

### Step 5: Review Results in Modal
- ⚠️ **Needs implementation** - `CleanupResultsModal` component not created
- ⚠️ Results display UI not implemented
- ⚠️ Statistics display not implemented

### Step 6: Navigate to Affected Entity
- ✅ **Infrastructure exists** - `AdminEntityAnalyze` component exists
- ⚠️ **Needs implementation** - Entity link handler in modal not created
- ⚠️ Navigation logic in modal not implemented

### Step 7: Automate Suggested Fixes
- ⚠️ **Needs implementation** - Automation handler not created
- ⚠️ API endpoint not created
- ⚠️ Progress indicator not implemented
- ⚠️ Results update logic not implemented

### Step 8: Close Results Modal
- ⚠️ **Needs implementation** - Modal close handler not created
- ⚠️ State cleanup not implemented

## 7. Edge Cases

### Edge Case 1: Script Execution Error
- ⚠️ **Needs implementation** - Error handling not implemented
- ⚠️ Error display in modal/toast not created
- ⚠️ Retry logic not implemented

### Edge Case 2: No Results Found
- ⚠️ **Needs implementation** - Empty state handling not implemented
- ⚠️ Success message display not created

### Edge Case 3: Large Result Set
- ⚠️ **Needs implementation** - Pagination not implemented
- ⚠️ Filtering/searching not implemented
- ⚠️ Export functionality not implemented

### Edge Case 4: Long-Running Script
- ⚠️ **Needs implementation** - Progress indicator not implemented
- ⚠️ Cancellation logic not implemented
- ⚠️ Status updates not implemented

### Edge Case 5: Multiple Scripts Running Simultaneously
- ⚠️ **Needs implementation** - Concurrent execution handling not implemented
- ⚠️ Multiple loading states not managed
- ⚠️ Results modal stacking not implemented

### Edge Case 6: Automation Fails Partially
- ⚠️ **Needs implementation** - Partial success handling not implemented
- ⚠️ Individual retry logic not implemented
- ⚠️ Detailed error reporting not implemented

## 8. Cleanup Scripts Catalog

### Scripts Status
All 11 scripts documented in workflow need backend implementation:

**Fabricas Scripts** (2):
1. ⚠️ Find Fabricas where not all Jingles are listed - **Backend script needed**
2. ⚠️ Find Fabricas with two or more Jingles matching time-stamps - **Backend script needed**

**Jingles Scripts** (2):
3. ⚠️ Find Jingles with time-stamp 00:00:00 - **Backend script needed**
4. ⚠️ Find Jingles without a Cancion relationship - **Backend script needed**

**Canciones Scripts** (3):
5. ⚠️ Find Cancion without MusicBrainz id and suggest it from query - **Backend script needed**
6. ⚠️ Fill out missing Cancion details from MusicBrainz id - **Backend script needed**
7. ⚠️ Find a Cancion without an Autor asociado - **Backend script needed**

**Artistas Scripts** (3):
8. ⚠️ Suggest Autor based on MusicBrainz query, Auto-generate Artista entity if new is needed - **Backend script needed**
9. ⚠️ Find Artista without MusicBrainz id and backfill based on online research - **Backend script needed**
10. ⚠️ Fill out missing Autor details from MusicBrainz id - **Backend script needed**

**General Scripts** (1):
11. ⚠️ Refresh all redundant properties and all empty booleans - **Backend script needed**

## Validation Results Summary

### Infrastructure That Exists ✅
1. Admin route structure (`AdminPage.tsx`) - Can add new route
2. Protected route wrapper - Can use for cleanup page
3. AdminEntityAnalyze component - Can navigate to entities from results
4. AdminDashboard component - Can add navigation link
5. API client structure - Can add new methods
6. Toast notification system - Can use for errors/feedback

### What Needs to Be Created ⚠️

**Frontend Components** (4):
1. `DatabaseCleanupPage.tsx` - Main page
2. `CleanupScriptButton.tsx` - Script button
3. `CleanupResultsModal.tsx` - Results modal
4. `CleanupScriptSection.tsx` - Section grouping

**Frontend Updates** (2):
1. Add `/admin/cleanup` route to `AdminPage.tsx`
2. Add navigation link to `AdminDashboard.tsx`

**API Client Methods** (3):
1. `getCleanupScripts()` - List scripts
2. `executeCleanupScript(scriptId)` - Execute script
3. `automateCleanupFixes(scriptId, entityIds)` - Automate fixes

**Backend Endpoints** (3):
1. `GET /api/admin/cleanup/scripts` - List scripts
2. `POST /api/admin/cleanup/:scriptId/execute` - Execute script
3. `POST /api/admin/cleanup/:scriptId/automate` - Automate fixes

**Backend Scripts** (11):
1. All 11 cleanup scripts need backend implementation

## Recommendations

1. **Implementation Priority**:
   - Start with route and basic page structure
   - Implement one cleanup script end-to-end as proof of concept
   - Then implement remaining scripts following the pattern

2. **Backend Script Organization**:
   - Create a `backend/src/server/db/cleanup/` directory for cleanup scripts
   - Each script should be a separate module/function
   - Scripts should return standardized result format matching workflow spec

3. **API Design**:
   - Follow existing admin API patterns in `backend/src/server/api/admin.ts`
   - Use consistent error handling
   - Return results in format matching workflow specification

4. **Component Reuse**:
   - Consider reusing modal patterns from `UnsavedChangesModal.tsx`
   - Reuse button patterns from existing admin components
   - Follow design system patterns from `DesignSystemShowcase`

5. **Testing Strategy**:
   - Test each script individually
   - Test error scenarios
   - Test large result sets
   - Test automation flows

## Next Steps

1. **Update Workflow Status**: Keep as `draft` until implementation begins
2. **Create Implementation Plan**: Break down into tasks
3. **Start Implementation**: Begin with route and basic page structure
4. **Iterate**: Implement one script at a time, validate against workflow
5. **Re-validate**: After implementation, re-run validation to update status

## Related Files

- Workflow Document: `WORKFLOW_011_database-cleanup.md`
- Route File: `frontend/src/pages/AdminPage.tsx` (needs update)
- Dashboard: `frontend/src/pages/admin/AdminDashboard.tsx` (needs update)
- API Client: `frontend/src/lib/api/client.ts` (needs update)
- Admin API: `backend/src/server/api/admin.ts` (needs update)

---

**Validation Date**: 2025-11-28  
**Validator**: AI Assistant  
**Next Review**: After initial implementation

