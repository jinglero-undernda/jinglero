<!-- a582dd3e-8537-42f0-8a9a-4a9bc56d9933 22c930cc-4f53-403c-9add-9bf65c950e5e -->
# Versioning Plan: Volumetrics Endpoint Implementation

**Date Created**: 2025-11-27

**Planner**: AI Assistant

**Target Completion**: TBD

## Overview

- **Total Tasks**: 4
- **Estimated Effort**: Small-Medium (10-15 hours)
- **Priority Breakdown**:
  - P0: 1 task (endpoint implementation)
  - P1: 2 tasks (frontend migrations)
  - P2: 1 task (versioning documentation)

## Phase 1: Critical Implementation (P0)

**Goal**: Implement the volumetrics endpoint to replace inefficient frontend pattern

**Tasks**:

1. **TASK-001: Implement GET /api/public/volumetrics Endpoint** - Small-Medium (4-6 hours) - No dependencies

**Timeline**: Immediate

## Phase 2: Frontend Migration (P1)

**Goal**: Update frontend components to use new endpoint

**Tasks**:

1. **TASK-002: Migrate VolumetricIndicators Component** - Small (2-3 hours) - Depends on TASK-001
2. **TASK-002a: Migrate Admin Dashboard** - Small (1-2 hours) - Depends on TASK-001

**Timeline**: After Phase 1 completion

## Phase 3: Documentation & Versioning (P2)

**Goal**: Establish versioning patterns and update documentation

**Tasks**:

1. **TASK-003: Update Versioning Documentation** - Small (1-2 hours) - Can run parallel with Phase 2

**Timeline**: Can run in parallel with Phase 2

## Task Dependency Graph

```
TASK-001 (Implement Endpoint)
    ↓
TASK-002 (VolumetricIndicators Migration)
TASK-002a (Admin Dashboard Migration) [can run parallel with TASK-002]
    ↓
TASK-003 (Versioning Docs) [can run parallel]
```

## Detailed Task Definitions

### TASK-001: Implement GET /api/public/volumetrics Endpoint

**Gap ID**: N/A (New endpoint, not a gap)

**Priority**: P0

**API Area**: Statistics Endpoints

#### Description

Implement the volumetrics endpoint in the Public API that returns entity counts in a single optimized response. This endpoint will replace the inefficient frontend pattern of making multiple separate API calls with `limit=10000` to count entities.

#### Scope

**In Scope:**

- Implement endpoint handler in `backend/src/server/api/public.ts`
- Create optimized Cypher query to count all entities in single query
- Return response with 8 count fields: `fabricas`, `jingles`, `canciones`, `usuarios`, `tematicas`, `artistas`, `jingleros`, `proveedores`
- Add error handling for database query failures
- Update code reference in contract documentation

**Out of Scope:**

- Versioning strategy implementation (deferred to TASK-003)
- Frontend changes (deferred to TASK-002 and TASK-002a)
- Caching layer (future enhancement)
- Rate limiting (future enhancement)

#### Current State

- Endpoint documented in `docs/5_backend_api-contracts/contracts/public-api.md` (lines 60-154)
- Frontend uses inefficient pattern: 7 API calls with `limit=10000` in `frontend/src/components/sections/VolumetricIndicators.tsx` (lines 35-44)
- Admin Dashboard makes 6 separate API calls in `frontend/src/pages/admin/AdminDashboard.tsx` (lines 155-163)
- No backend implementation exists

#### Desired State

- Endpoint implemented at `GET /api/public/volumetrics`
- Returns JSON response with 8 count fields: `fabricas`, `jingles`, `canciones`, `usuarios`, `tematicas`, `artistas`, `jingleros`, `proveedores`
- Single optimized Cypher query executes all counts
- Response time < 500ms for typical database size
- Code reference updated in contract documentation

#### Versioning Steps

1. Add route handler to `backend/src/server/api/public.ts` before health check endpoint (around line 1143)
2. Implement Cypher query with all 8 counts (see query below)
3. Add error handling matching existing Public API patterns
4. Test endpoint with actual database
5. Update code reference in contract documentation

#### Cypher Query

The endpoint should use a single Cypher query:

```cypher
MATCH (f:Fabrica)
WITH count(f) AS fabricas
MATCH (j:Jingle)
WITH fabricas, count(j) AS jingles
MATCH (c:Cancion)
WITH fabricas, jingles, count(c) AS canciones
MATCH (u:Usuario)
WITH fabricas, jingles, canciones, count(u) AS usuarios
MATCH (t:Tematica)
WITH fabricas, jingles, canciones, usuarios, count(t) AS tematicas
MATCH (a:Artista)
WITH fabricas, jingles, canciones, usuarios, tematicas, count(a) AS artistas
OPTIONAL MATCH (jinglero:Artista)-[:JINGLERO_DE]->(:Jingle)
OPTIONAL MATCH (proveedor:Artista)-[:AUTOR_DE]->(:Cancion)
RETURN
  fabricas,
  jingles,
  canciones,
  usuarios,
  tematicas,
  artistas,
  count(DISTINCT jinglero) AS jingleros,
  count(DISTINCT proveedor) AS proveedores
```

#### Files to Modify

- `backend/src/server/api/public.ts`: Add volumetrics endpoint handler (new route, ~30-50 lines)
- `docs/5_backend_api-contracts/contracts/public-api.md`: Update code reference from "to be implemented" to actual line numbers, update response format to include `tematicas` and `artistas`

#### API Changes

- **New Endpoint**: `GET /api/public/volumetrics`
- **Response Format**: JSON object with 8 integer fields: `fabricas`, `jingles`, `canciones`, `usuarios`, `tematicas`, `artistas`, `jingleros`, `proveedores`
- **No Breaking Changes**: This is a new endpoint, no existing clients affected

#### Dependencies

- **Blocks**: TASK-002, TASK-002a (frontend migrations)
- **Blocked by**: None
- **Can run parallel with**: TASK-003 (documentation)

#### Risks

**Technical Risks:**

- **Risk**: Cypher query performance with large datasets
  - **Probability**: Medium
  - **Impact**: Medium
  - **Mitigation**: Use `count()` aggregation, test with production-like data, add query optimization if needed

- **Risk**: Query complexity causing Neo4j timeout
  - **Probability**: Low
  - **Impact**: High
  - **Mitigation**: Use single query with proper aggregation, test with large datasets, consider query optimization

**Compatibility Risks:**

- **Risk**: Response format mismatch with frontend expectations
  - **Probability**: Low
  - **Impact**: Medium
  - **Mitigation**: Follow documented contract exactly, test with frontend integration

**Timeline Risks:**

- **Risk**: Query optimization taking longer than estimated
  - **Probability**: Low
  - **Impact**: Low
  - **Mitigation**: Start with documented query pattern, optimize only if needed

#### Acceptance Criteria

- [ ] Endpoint returns correct counts for all 8 fields
- [ ] Response format matches documented contract exactly
- [ ] Query executes in < 500ms for typical database
- [ ] Error handling returns 500 with proper error message
- [ ] Code reference updated in contract documentation
- [ ] Endpoint tested with actual database data

#### Validation

- [ ] API matches contracts (response format verified)
- [ ] Backward compatibility maintained (new endpoint, no breaking changes)
- [ ] All tests pass (if tests added)
- [ ] Contracts validated (code reference accurate)

#### Effort Estimate

- **API Implementation**: 3-4 hours
- **Testing & Validation**: 1-2 hours
- **Documentation Update**: 0.5 hours
- **Total**: 4-6 hours (Small-Medium)

**Estimated**: Small-Medium

**Confidence**: High

**Notes**: Query pattern is documented, implementation is straightforward. Added `tematicas` and `artistas` to support both VolumetricIndicators and Admin Dashboard.

---

### TASK-002: Migrate VolumetricIndicators Component

**Gap ID**: N/A (Frontend optimization)

**Priority**: P1

**API Area**: Frontend Integration

#### Description

Update the `VolumetricIndicators` component to use the new volumetrics endpoint instead of making 7 separate API calls with high limits.

#### Scope

**In Scope:**

- Replace 7 API calls with single volumetrics endpoint call
- Update error handling for new endpoint
- Maintain existing component behavior and UI
- Remove unused relationship fetching logic

**Out of Scope:**

- Component UI/UX changes
- Additional features or enhancements
- Caching implementation (future enhancement)

#### Current State

- Component makes 7 parallel API calls: `/fabricas?limit=10000`, `/jingles?limit=10000`, `/canciones?limit=10000`, `/artistas?limit=10000`, `/tematicas?limit=10000`, `/relationships/autor_de?limit=10000`, `/relationships/jinglero_de?limit=10000`
- Counts arrays on frontend
- Extracts unique artist IDs from relationships to count Proveedores and Jingleros
- Located in `frontend/src/components/sections/VolumetricIndicators.tsx` (lines 27-76)
- Component interface already includes `tematicas` field (line 12)

#### Desired State

- Component makes single API call to `/volumetrics`
- Receives pre-calculated counts directly (including `tematicas`, `jingleros`, `proveedores`)
- No frontend counting or relationship processing needed
- Same UI/UX behavior maintained
- Improved performance (1 request vs 7 requests)

#### Versioning Steps

1. Update `fetchCounts` function to call `/volumetrics` endpoint
2. Remove relationship fetching logic
3. Remove array counting logic
4. Update error handling if needed
5. Test component with new endpoint
6. Verify UI displays correctly

#### Files to Modify

- `frontend/src/components/sections/VolumetricIndicators.tsx`: Replace API calls (lines 27-76, simplify to ~15-20 lines)

#### API Changes

- **Removed Usage**: 7 existing endpoints (still available, just not used by this component)
- **New Usage**: `/api/public/volumetrics` endpoint
- **No Breaking Changes**: Old endpoints remain available for other uses

#### Dependencies

- **Blocks**: None
- **Blocked by**: TASK-001 (endpoint must be implemented first)
- **Can run parallel with**: TASK-002a (Admin Dashboard migration), TASK-003 (documentation)

#### Risks

**Technical Risks:**

- **Risk**: Response format mismatch
  - **Probability**: Low
  - **Impact**: Medium
  - **Mitigation**: Follow documented contract, test integration

- **Risk**: Component behavior changes unintentionally
  - **Probability**: Low
  - **Impact**: Medium
  - **Mitigation**: Maintain same state structure, test UI rendering

**Compatibility Risks:**

- **Risk**: Frontend breaks if endpoint unavailable
  - **Probability**: Low
  - **Impact**: High
  - **Mitigation**: Proper error handling, graceful degradation

**Timeline Risks:**

- **Risk**: Integration issues requiring debugging
  - **Probability**: Low
  - **Impact**: Low
  - **Mitigation**: Simple change, well-documented endpoint

#### Acceptance Criteria

- [ ] Component makes single API call to `/volumetrics`
- [ ] All 6 counts display correctly in UI (fabricas, jingles, canciones, proveedores, jingleros, tematicas)
- [ ] Error handling works correctly
- [ ] Loading states work correctly
- [ ] Component performance improved (fewer requests)
- [ ] No UI/UX regressions

#### Validation

- [ ] Frontend matches API contract usage
- [ ] Component behavior unchanged (UI/UX)
- [ ] Error handling appropriate
- [ ] Performance improved

#### Effort Estimate

- **Code Changes**: 1-2 hours
- **Testing**: 0.5-1 hour
- **Total**: 2-3 hours (Small)

**Estimated**: Small

**Confidence**: High

**Notes**: Straightforward refactoring, well-defined endpoint. Component already expects `tematicas` field.

---

### TASK-002a: Migrate Admin Dashboard

**Gap ID**: N/A (Frontend optimization)

**Priority**: P1

**API Area**: Frontend Integration

#### Description

Update the `AdminDashboard` component to use the new volumetrics endpoint instead of making 6 separate API calls to count entities.

#### Scope

**In Scope:**

- Replace 6 API calls with single volumetrics endpoint call
- Update error handling for new endpoint
- Maintain existing component behavior and UI
- Map response fields correctly (endpoint provides `artistas` directly)

**Out of Scope:**

- Component UI/UX changes
- Additional features or enhancements
- Caching implementation (future enhancement)

#### Current State

- Component makes 6 parallel API calls using `adminApi.get()`: `/fabricas`, `/jingles`, `/canciones`, `/artistas`, `/tematicas`, `/usuarios`
- Counts arrays on frontend (uses `entities.length`)
- Located in `frontend/src/pages/admin/AdminDashboard.tsx` (lines 139-178)
- Component interface includes: `fabricas`, `jingles`, `canciones`, `artistas`, `tematicas`, `usuarios` (lines 89-96)

#### Desired State

- Component makes single API call to `/api/public/volumetrics`
- Receives pre-calculated counts directly
- No frontend counting needed
- Same UI/UX behavior maintained
- Improved performance (1 request vs 6 requests)
- Uses `publicApi` instead of `adminApi` for this endpoint (public endpoint, no auth needed)

#### Versioning Steps

1. Update `loadCounts` function to call `/api/public/volumetrics` endpoint using `publicApi`
2. Remove array counting logic (`entities.length`)
3. Map response fields: endpoint provides all needed fields (`fabricas`, `jingles`, `canciones`, `artistas`, `tematicas`, `usuarios`)
4. Update error handling if needed
5. Test component with new endpoint
6. Verify UI displays correctly

#### Files to Modify

- `frontend/src/pages/admin/AdminDashboard.tsx`: Replace API calls (lines 139-178, simplify to ~15-20 lines)
- Import `publicApi` from `../../lib/api/client` if not already imported

#### API Changes

- **Removed Usage**: 6 existing admin endpoints for counting (still available, just not used by this component for counting)
- **New Usage**: `/api/public/volumetrics` endpoint
- **No Breaking Changes**: Old endpoints remain available for other uses

#### Dependencies

- **Blocks**: None
- **Blocked by**: TASK-001 (endpoint must be implemented first)
- **Can run parallel with**: TASK-002 (VolumetricIndicators migration), TASK-003 (documentation)

#### Risks

**Technical Risks:**

- **Risk**: Response format mismatch
  - **Probability**: Low
  - **Impact**: Medium
  - **Mitigation**: Follow documented contract, test integration

- **Risk**: Component behavior changes unintentionally
  - **Probability**: Low
  - **Impact**: Medium
  - **Mitigation**: Maintain same state structure, test UI rendering

**Compatibility Risks:**

- **Risk**: Frontend breaks if endpoint unavailable
  - **Probability**: Low
  - **Impact**: High
  - **Mitigation**: Proper error handling, graceful degradation

**Timeline Risks:**

- **Risk**: Integration issues requiring debugging
  - **Probability**: Low
  - **Impact**: Low
  - **Mitigation**: Simple change, well-documented endpoint

#### Acceptance Criteria

- [ ] Component makes single API call to `/api/public/volumetrics`
- [ ] All 6 counts display correctly in UI (fabricas, jingles, canciones, artistas, tematicas, usuarios)
- [ ] Error handling works correctly
- [ ] Loading states work correctly
- [ ] Component performance improved (fewer requests)
- [ ] No UI/UX regressions

#### Validation

- [ ] Frontend matches API contract usage
- [ ] Component behavior unchanged (UI/UX)
- [ ] Error handling appropriate
- [ ] Performance improved

#### Effort Estimate

- **Code Changes**: 0.5-1 hour
- **Testing**: 0.5-1 hour
- **Total**: 1-2 hours (Small)

**Estimated**: Small

**Confidence**: High

**Notes**: Straightforward refactoring, well-defined endpoint. Admin Dashboard needs `artistas` which is now provided directly by the endpoint.

---

### TASK-003: Update Versioning Documentation

**Gap ID**: N/A (Documentation)

**Priority**: P2

**API Area**: Versioning Strategy

#### Description

Update API contract documentation to reflect the new volumetrics endpoint implementation with all 8 fields (including `tematicas` and `artistas`) and establish versioning patterns for future API changes.

#### Scope

**In Scope:**

- Update code reference in volumetrics endpoint documentation
- Update response format to include `tematicas` and `artistas` fields
- Update Cypher query example to include `tematicas` and `artistas`
- Update version history in Public API contract
- Update API Contracts Overview endpoint count
- Document versioning approach for this endpoint

**Out of Scope:**

- Implementing versioning strategy in code (future work)
- Creating comprehensive versioning framework (future work)
- Updating other API contracts (not needed)

#### Current State

- Volumetrics endpoint documented with code reference: "to be implemented"
- Response format shows 6 fields (missing `tematicas` and `artistas`)
- Cypher query example shows 6 fields (missing `tematicas` and `artistas`)
- Version history shows 1.0 from 2025-11-19
- API Contracts Overview shows 28 endpoints (includes volumetrics as documented)

#### Desired State

- Code reference updated to actual line numbers
- Response format updated to show all 8 fields: `fabricas`, `jingles`, `canciones`, `usuarios`, `tematicas`, `artistas`, `jingleros`, `proveedores`
- Cypher query example updated to include `tematicas` and `artistas`
- Change history updated with implementation date
- Documentation reflects implemented state
- Versioning patterns documented for future reference

#### Versioning Steps

1. Update code reference in `docs/5_backend_api-contracts/contracts/public-api.md` (line 64)
2. Update response format examples (lines 72-80, 104-112) to include `tematicas` and `artistas`
3. Update response fields documentation (lines 83-90) to include `tematicas` and `artistas`
4. Update Cypher query example (lines 126-144) to include `tematicas` and `artistas` counts
5. Update "Last Updated" date to implementation date
6. Add entry to Change History section
7. Update version history table if needed
8. Update API Contracts Overview if endpoint count changes

#### Files to Modify

- `docs/5_backend_api-contracts/contracts/public-api.md`: Update code reference, response format, Cypher query, change history
- `docs/5_backend_api-contracts/API_CONTRACTS_OVERVIEW.md`: Update if needed

#### API Changes

- **Documentation Only**: No API changes
- **Versioning**: Document approach for future changes

#### Dependencies

- **Blocks**: None
- **Blocked by**: TASK-001 (need actual line numbers)
- **Can run parallel with**: TASK-002, TASK-002a (frontend migrations)

#### Risks

**Technical Risks:**

- **Risk**: Code reference becomes inaccurate if code changes
  - **Probability**: Low
  - **Impact**: Low
  - **Mitigation**: Update when code changes, use playbook for maintenance

**Timeline Risks:**

- **Risk**: Documentation takes longer than estimated
  - **Probability**: Low
  - **Impact**: Low
  - **Mitigation**: Straightforward updates

#### Acceptance Criteria

- [ ] Code reference updated to actual line numbers
- [ ] Response format updated to include all 8 fields
- [ ] Cypher query example updated to include `tematicas` and `artistas`
- [ ] Change history updated with implementation date
- [ ] Version information accurate
- [ ] Documentation reflects implemented state

#### Validation

- [ ] Code references accurate
- [ ] Documentation matches implementation
- [ ] Version history complete
- [ ] Response format examples match actual endpoint

#### Effort Estimate

- **Documentation Updates**: 0.5-1 hour
- **Review**: 0.5 hour
- **Total**: 1-2 hours (Small)

**Estimated**: Small

**Confidence**: High

**Notes**: Simple documentation updates. Need to add `tematicas` and `artistas` to all relevant sections.

---

## Risk Mitigation Plan

### High Risk Tasks

None identified - all tasks are low to medium risk.

### Medium Risk Tasks

- **TASK-001**: Query performance risk mitigated by using optimized Cypher query with aggregation
- **TASK-002**: Integration risk mitigated by following documented contract exactly
- **TASK-002a**: Integration risk mitigated by following documented contract exactly

## Success Criteria

- [ ] All P0 tasks completed (TASK-001)
- [ ] All P1 tasks completed (TASK-002, TASK-002a)
- [ ] All P2 tasks completed (TASK-003)
- [ ] API validated (endpoint matches contract with all 8 fields)
- [ ] Backward compatibility maintained (new endpoint, no breaking changes)
- [ ] Frontend performance improved (1 request vs 7 requests for VolumetricIndicators, 1 request vs 6 for Admin Dashboard)
- [ ] Documentation updated and accurate (includes `tematicas` and `artistas`)

## Next Steps

1. [ ] Review plan with stakeholders
2. [ ] Get approval on priorities
3. [ ] Begin Phase 1 (TASK-001: Implement endpoint)
4. [ ] Use PLAYBOOK_05_05 for implementation guidance
5. [ ] Validate implementation using PLAYBOOK_05_02

## Versioning Strategy Notes

### Current Approach

- **New Endpoint**: Implemented as part of v1.0 (no versioning needed for new endpoints)
- **Future Changes**: When breaking changes are needed, consider URL-based versioning (e.g., `/api/v2/public/volumetrics`)
- **Backward Compatibility**: Maintained by keeping old endpoints available (frontend migration is optimization, not requirement)

### Future Considerations

- If volumetrics endpoint needs breaking changes:
  - Option 1: Add new versioned endpoint (`/api/v2/public/volumetrics`)
  - Option 2: Add query parameters for version selection
  - Option 3: Use header-based versioning
- Document versioning decision in API Contracts Overview when first breaking change occurs

---

**Related Documentation:**

- API Contract: `docs/5_backend_api-contracts/contracts/public-api.md`
- Implementation: `backend/src/server/api/public.ts`
- Frontend Components: 
  - `frontend/src/components/sections/VolumetricIndicators.tsx`
  - `frontend/src/pages/admin/AdminDashboard.tsx`
- Playbooks: `docs/5_backend_api-contracts/playbooks/`

### To-dos

- [ ] Implement GET /api/public/volumetrics endpoint in backend/src/server/api/public.ts with Cypher query returning 8 fields: fabricas, jingles, canciones, usuarios, tematicas, artistas, jingleros, proveedores
- [ ] Migrate VolumetricIndicators component to use /api/public/volumetrics endpoint instead of 7 separate API calls
- [ ] Migrate Admin Dashboard to use /api/public/volumetrics endpoint instead of 6 separate API calls
- [ ] Update API contract documentation to include tematicas and artistas in response format, update Cypher query example, and update code references