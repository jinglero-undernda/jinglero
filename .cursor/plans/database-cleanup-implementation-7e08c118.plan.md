<!-- 7e08c118-a590-4e9a-8519-9bee741261e3 342bc178-743f-42fd-aca7-774af75476b3 -->
# Database Cleanup Feature Implementation Plan

## Overview

This plan implements the database cleanup and validation feature documented in WORKFLOW_011. The feature provides a centralized admin interface for executing 11 cleanup scripts that identify and resolve data quality issues across the knowledge graph.

**Current State:**

- ✅ WORKFLOW_011 documented (draft, not implemented)
- ✅ API contracts documented (draft, not validated)
- ✅ UI component specs documented (draft, to be created)
- ✅ Backend admin API exists at `backend/src/server/api/admin.ts`
- ⚠️ No cleanup endpoints implemented
- ⚠️ No cleanup scripts implemented
- ⚠️ No frontend components implemented

**Target State:**

- All 11 cleanup scripts implemented and functional
- Three API endpoints operational (GET scripts, POST execute, POST automate)
- Four frontend components created and integrated
- Full workflow validated and tested

## Phase 1: Validation & Planning (Recommended First)

### Step 1: Validate API Contracts

**Playbook**: `docs/5_backend_api-contracts/playbooks/PLAYBOOK_05_02_VALIDATE_USAGE.md`

**Purpose**: Verify API contract documentation is complete and consistent with existing admin API patterns

**Tasks**:

1. Read API contract: `docs/5_backend_api-contracts/contracts/admin-api-cleanup.md`
2. Review existing admin API patterns in `backend/src/server/api/admin.ts`
3. Validate request/response formats match existing admin API patterns
4. Check MusicBrainz integration details are complete
5. Verify error handling documentation matches existing patterns
6. Check authentication requirements (JWT middleware)
7. Generate validation report
8. Update contract status if validated

**Files to Review**:

- `docs/5_backend_api-contracts/contracts/admin-api-cleanup.md`
- `backend/src/server/api/admin.ts` (existing patterns)
- `backend/src/server/middleware/auth.ts` (authentication)

**Deliverable**: API contract validation report

**Effort**: Small (1-2 hours)

**Impact**: High — ensures API design is sound before implementation

---

### Step 2: Plan Implementation

**Playbook**: `docs/1_frontend_ux-workflows/playbooks/PLAYBOOK_01_04_PLAN_REFACTOR.md`

**Purpose**: Create an implementation plan with tasks, priorities, and dependencies

**Tasks**:

1. Review WORKFLOW_011 and gap analysis
2. Break down implementation into specific tasks
3. Prioritize tasks (backend API → cleanup scripts → frontend components)
4. Identify dependencies:

   - API endpoints must exist before frontend
   - At least one script needed for proof of concept
   - MusicBrainz client utility needed for scripts 5, 6, 8, 9, 10

5. Create task breakdown with estimates
6. Document implementation sequence
7. Assess risks for each phase
8. Create task tracking document

**Files to Review**:

- `docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup.md`
- `docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup_validation.md`

**Deliverable**: Implementation plan document with task breakdown

**Effort**: Medium (2-3 hours)

**Impact**: High — provides clear roadmap

---

## Phase 2: Backend Implementation (Foundation)

### Step 3: Implement Backend API Endpoints

**Playbook**: Direct implementation (follow existing admin API patterns)

**Purpose**: Implement the three cleanup API endpoints

**Tasks**:

1. Add cleanup routes to `backend/src/server/api/admin.ts`
2. Implement `GET /api/admin/cleanup/scripts`:

   - Return list of 11 scripts with metadata
   - Include script ID, name, description, entityType, category, automatable, estimatedDuration, usesMusicBrainz

3. Implement `POST /api/admin/cleanup/:scriptId/execute`:

   - Validate scriptId exists
   - Call appropriate cleanup script function
   - Return results with entities, suggestions, execution time
   - Handle MusicBrainz errors gracefully

4. Implement `POST /api/admin/cleanup/:scriptId/automate`:

   - Validate scriptId and entityIds
   - Apply automated fixes for specified entities
   - Return automation results with success/failure breakdown

5. Add error handling for invalid scriptId, authentication failures
6. Add request validation middleware
7. Test endpoints with mock script functions

**Files to Create/Modify**:

- `backend/src/server/api/admin.ts` (add cleanup routes)
- `backend/src/server/db/cleanup/index.ts` (script registry - to be created)

**Dependencies**: None (can start immediately)

**Effort**: Large (8-16 hours)

**Impact**: High — required for frontend

**Note**: Implement with placeholder script functions first, then connect real scripts in Step 4

---

### Step 4: Implement Cleanup Scripts

**Playbook**: Direct implementation (follow architecture docs)

**Purpose**: Implement all 11 cleanup scripts

**Tasks**:

1. Create `backend/src/server/db/cleanup/` directory structure
2. Create MusicBrainz client utility:

   - `backend/src/server/utils/musicbrainz.ts`
   - Implement search by title/artist
   - Implement lookup by MusicBrainz ID
   - Handle rate limiting (1 req/sec)
   - Handle errors gracefully

3. Implement script registry system:

   - `backend/src/server/db/cleanup/index.ts` (registry)
   - Register all 11 scripts with metadata

4. Implement each cleanup script module:

   - Script 1: Find Fabricas where not all Jingles are listed
   - Script 2: Find Fabricas with duplicate timestamps
   - Script 3: Find Jingles with timestamp 00:00:00
   - Script 4: Find Jingles without Cancion relationship
   - Script 5: Find Cancion without MusicBrainz id (uses MusicBrainz)
   - Script 6: Fill missing Cancion details from MusicBrainz id (uses MusicBrainz)
   - Script 7: Find Cancion without Autor asociado
   - Script 8: Suggest Autor from MusicBrainz, auto-generate Artista (uses MusicBrainz)
   - Script 9: Find Artista without MusicBrainz id (uses MusicBrainz)
   - Script 10: Fill missing Autor details from MusicBrainz id (uses MusicBrainz)
   - Script 11: Refresh all redundant properties and empty booleans

5. Each script should:

   - Return standardized result format
   - Include entity details, issues, suggestions
   - Mark suggestions as automatable or not
   - Include MusicBrainz confidence scores where applicable

6. Test each script individually
7. Connect scripts to API endpoints from Step 3

**Files to Create**:

- `backend/src/server/db/cleanup/index.ts` (registry)
- `backend/src/server/db/cleanup/scripts/` (directory for script modules)
- `backend/src/server/db/cleanup/scripts/fabricas.ts`
- `backend/src/server/db/cleanup/scripts/jingles.ts`
- `backend/src/server/db/cleanup/scripts/canciones.ts`
- `backend/src/server/db/cleanup/scripts/artistas.ts`
- `backend/src/server/db/cleanup/scripts/general.ts`
- `backend/src/server/utils/musicbrainz.ts` (MusicBrainz client)

**Files to Review**:

- `docs/4_backend_database-schema/` (entity and relationship definitions)
- `backend/src/server/db/index.ts` (Neo4j client patterns)

**Dependencies**: Step 3 (API endpoints must exist)

**Effort**: Large (16-24 hours)

**Impact**: High — core functionality

**Recommended Approach**: Implement one script end-to-end first (e.g., Script 3 - Find Jingles with zero timestamp), then replicate the pattern for others

---

## Phase 3: Frontend Implementation

### Step 5: Implement Frontend Components

**Playbook**: `docs/2_frontend_ui-design-system/playbooks/PLAYBOOK_02_05_IMPLEMENT_REFACTOR.md`

**Purpose**: Implement the four UI components

**Tasks**:

1. Create `DatabaseCleanupPage.tsx`:

   - Main page component at `frontend/src/pages/admin/DatabaseCleanupPage.tsx`
   - Fetch available scripts on mount
   - Manage state: scripts, runningScripts, results, showResultsModal, selectedScript
   - Render CleanupScriptSection components grouped by entity type
   - Handle script execution
   - Display CleanupResultsModal when results available

2. Create `CleanupScriptSection.tsx`:

   - Component at `frontend/src/components/admin/CleanupScriptSection.tsx`
   - Groups scripts by entity type/category
   - Renders CleanupScriptButton components

3. Create `CleanupScriptButton.tsx`:

   - Component at `frontend/src/components/admin/CleanupScriptButton.tsx`
   - Displays script name, description, entity type badge
   - Shows loading state during execution
   - Handles click to execute script

4. Create `CleanupResultsModal.tsx`:

   - Component at `frontend/src/components/admin/CleanupResultsModal.tsx`
   - Displays script execution results
   - Shows summary statistics
   - Lists affected entities with links to view/edit
   - Shows suggested fixes with "Automate" button
   - Handles automation workflow

5. Add API client methods to `adminApi`:

   - `getCleanupScripts()` - GET /api/admin/cleanup/scripts
   - `executeCleanupScript(scriptId)` - POST /api/admin/cleanup/:scriptId/execute
   - `automateCleanupFixes(scriptId, entityIds, applyLowConfidence)` - POST /api/admin/cleanup/:scriptId/automate

6. Add route to `AdminPage.tsx`:

   - Add `/admin/cleanup` route pointing to DatabaseCleanupPage

7. Add navigation link to `AdminDashboard.tsx`:

   - Add "Limpieza en la Base de Datos" link/button

**Files to Create**:

- `frontend/src/pages/admin/DatabaseCleanupPage.tsx`
- `frontend/src/components/admin/CleanupScriptSection.tsx`
- `frontend/src/components/admin/CleanupScriptButton.tsx`
- `frontend/src/components/admin/CleanupResultsModal.tsx`

**Files to Modify**:

- `frontend/src/pages/AdminPage.tsx` (add route)
- `frontend/src/pages/admin/AdminDashboard.tsx` (add navigation link)
- `frontend/src/lib/api/client.ts` (add adminApi methods)

**Files to Review**:

- `docs/2_frontend_ui-design-system/03_components/composite/database-cleanup-page.md`
- `docs/2_frontend_ui-design-system/03_components/composite/cleanup-script-button.md`
- `docs/2_frontend_ui-design-system/03_components/composite/cleanup-results-modal.md`
- `docs/2_frontend_ui-design-system/03_components/composite/cleanup-script-section.md`
- `frontend/src/pages/admin/AdminEntityAnalyze.tsx` (for entity link patterns)

**Dependencies**: Step 3 (API endpoints must exist)

**Effort**: Large (12-16 hours)

**Impact**: High — user-facing functionality

---

## Phase 4: Integration & Validation

### Step 6: Validate Workflow Implementation

**Playbook**: `docs/1_frontend_ux-workflows/playbooks/PLAYBOOK_01_02_VALIDATE_WORKFLOW.md`

**Purpose**: Validate that implementation matches WORKFLOW_011

**Tasks**:

1. Review all workflow steps (Steps 1-8)
2. Check all workflow steps are implemented:

   - Step 1: Access Database Cleanup Page ✅
   - Step 2: View Available Cleanup Scripts ✅
   - Step 3: Execute Cleanup Script ✅
   - Step 4: Script Execution Completes ✅
   - Step 5: Review Results in Modal ✅
   - Step 6: Navigate to Affected Entity ✅
   - Step 7: Automate Suggested Fixes ✅
   - Step 8: Close Results Modal ✅

3. Verify state management matches workflow specification
4. Test all edge cases:

   - Script execution error
   - No results found
   - Large result set
   - Long-running script
   - Multiple scripts running simultaneously
   - Automation fails partially

5. Update validation checklist
6. Update workflow status to "validated"

**Files to Review**:

- `docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup.md`
- `docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup_validation.md`

**Dependencies**: Steps 3, 4, 5 (all implementation complete)

**Effort**: Medium (3-4 hours)

**Impact**: High — ensures quality

---

### Step 7: Validate API Implementation

**Playbook**: `docs/5_backend_api-contracts/playbooks/PLAYBOOK_05_02_VALIDATE_USAGE.md`

**Purpose**: Verify API implementation matches contracts

**Tasks**:

1. Test all three endpoints:

   - GET /api/admin/cleanup/scripts
   - POST /api/admin/cleanup/:scriptId/execute
   - POST /api/admin/cleanup/:scriptId/automate

2. Verify request/response formats match contract
3. Test MusicBrainz integration:

   - Test scripts that use MusicBrainz (5, 6, 8, 9, 10)
   - Verify rate limiting works
   - Test error handling when MusicBrainz unavailable

4. Test error handling:

   - Invalid scriptId
   - Authentication failures
   - Script execution failures
   - MusicBrainz API failures

5. Update API contract status to "validated"

**Files to Review**:

- `docs/5_backend_api-contracts/contracts/admin-api-cleanup.md`
- `backend/src/server/api/admin.ts` (cleanup routes)

**Dependencies**: Step 3 (API implementation)

**Effort**: Medium (2-3 hours)

**Impact**: Medium — ensures API quality

---

### Step 8: Validate UI Components

**Playbook**: `docs/2_frontend_ui-design-system/playbooks/PLAYBOOK_02_02_VALIDATE_IMPLEMENTATION.md`

**Purpose**: Verify components match design documentation

**Tasks**:

1. Check component props match documentation
2. Verify visual design matches specs:

   - DatabaseCleanupPage layout
   - CleanupScriptSection grouping
   - CleanupScriptButton styling and states
   - CleanupResultsModal layout and content

3. Test all state variations:

   - Default state
   - Script running state
   - Results displayed state
   - Automation in progress state

4. Test interaction states:

   - Button hover
   - Button active/loading
   - Button disabled
   - Modal open/close

5. Update component documentation status

**Files to Review**:

- `docs/2_frontend_ui-design-system/03_components/composite/database-cleanup-page.md`
- `docs/2_frontend_ui-design-system/03_components/composite/cleanup-script-button.md`
- `docs/2_frontend_ui-design-system/03_components/composite/cleanup-results-modal.md`
- `docs/2_frontend_ui-design-system/03_components/composite/cleanup-script-section.md`

**Dependencies**: Step 5 (component implementation)

**Effort**: Medium (2-3 hours)

**Impact**: Medium — ensures UI quality

---

## Task Dependency Graph

```
Step 1: Validate API Contracts
  ↓
Step 2: Plan Implementation
  ↓
Step 3: Implement Backend API Endpoints
  ↓
Step 4: Implement Cleanup Scripts (depends on Step 3)
  ↓
Step 5: Implement Frontend Components (depends on Step 3)
  ↓
Step 6: Validate Workflow (depends on Steps 3, 4, 5)
  ↓
Step 7: Validate API Implementation (depends on Step 3)
  ↓
Step 8: Validate UI Components (depends on Step 5)
```

**Note**: Steps 4 and 5 can be done in parallel after Step 3 is complete. Steps 6, 7, and 8 can be done in parallel after their dependencies are met.

## Risk Mitigation

### High Risk Areas

1. **MusicBrainz Integration**:

   - Risk: API rate limiting, timeouts, unreliable service
   - Mitigation: Implement robust error handling, rate limiting (1 req/sec), graceful degradation

2. **Large Result Sets**:

   - Risk: Performance issues with hundreds/thousands of entities
   - Mitigation: Implement pagination in results modal, limit initial result display

3. **Long-Running Scripts**:

   - Risk: User experience degradation, timeouts
   - Mitigation: Show progress indicators, implement timeout handling, allow cancellation

4. **Database Performance**:

   - Risk: Cleanup scripts may be slow on large datasets
   - Mitigation: Optimize Cypher queries, add indexes if needed, test on production-like data

## Success Criteria

- [ ] All 11 cleanup scripts implemented and functional
- [ ] All three API endpoints operational and tested
- [ ] All four frontend components created and integrated
- [ ] Workflow validation complete (Step 6)
- [ ] API validation complete (Step 7)
- [ ] UI component validation complete (Step 8)
- [ ] All edge cases handled
- [ ] MusicBrainz integration working with error handling
- [ ] Navigation integrated into Admin Dashboard
- [ ] Documentation updated with implementation status

## Estimated Total Effort

- Phase 1 (Validation & Planning): 3-5 hours
- Phase 2 (Backend Implementation): 24-40 hours
- Phase 3 (Frontend Implementation): 12-16 hours
- Phase 4 (Integration & Validation): 7-10 hours

**Total**: 46-71 hours (approximately 6-9 working days)

## Next Steps

1. Confirm current date with user (for documentation dates)
2. Begin with Phase 1, Step 1: Validate API Contracts
3. Proceed through phases sequentially, respecting dependencies
4. Update STATUS.md and activity-log.md after each phase

### To-dos

- [ ] Validate API contracts against existing admin API patterns (Step 1)
- [ ] Create detailed implementation plan with task breakdown (Step 2)
- [ ] Implement three cleanup API endpoints in admin.ts (Step 3)
- [ ] Implement all 11 cleanup scripts and MusicBrainz client (Step 4)
- [ ] Create four frontend components and integrate into admin pages (Step 5)
- [ ] Validate workflow implementation matches WORKFLOW_011 (Step 6)
- [ ] Validate API implementation matches contracts (Step 7)
- [ ] Validate UI components match design documentation (Step 8)