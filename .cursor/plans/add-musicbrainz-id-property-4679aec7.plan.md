<!-- 4679aec7-2741-4c42-8719-4cb2ad1a359c 87e7bf94-062f-452c-8bc4-ee3b7e62a75c -->
# Plan: Add musicBrainzId Property to Artista and Cancion

## Overview

Add an optional `musicBrainzId` property to both Artista and Cancion nodes to enable linking to MusicBrainz external data source. This requires sequential documentation and implementation across database schema, API contracts, and frontend admin UI.

## Sequential Steps

### Phase 1: Database Schema Documentation

**Playbook**: `docs/4_backend_database-schema/playbooks/PLAYBOOK_04_01_DOCUMENT_SCHEMA.md`

1. **Update schema documentation** (`docs/4_backend_database-schema/schema/nodes.md`):

- Add `musicBrainzId` property to Artista node documentation
- Add `musicBrainzId` property to Cancion node documentation
- Document as optional string field
- Add code references to schema files
- Update "Last Updated" date (confirm with user)

2. **Update properties documentation** (`docs/4_backend_database-schema/schema/properties.md`):

- Document `musicBrainzId` for both node types
- Note it's optional and used for external data linking

**Files to update**:

- `docs/4_backend_database-schema/schema/nodes.md` (Artista and Cancion sections)
- `docs/4_backend_database-schema/schema/properties.md`

### Phase 2: API Contract Documentation

**Playbook**: `docs/5_backend_api-contracts/playbooks/PLAYBOOK_05_01_DOCUMENT_CONTRACTS.md`

1. **Update Admin API contract** (`docs/5_backend_api-contracts/contracts/admin-api.md`):

- Document that `musicBrainzId` is accepted in POST/PUT/PATCH requests for `artistas` and `canciones`
- Document that `musicBrainzId` is returned in GET responses
- Update request/response examples to include the field

2. **Update Public API contract** (`docs/5_backend_api-contracts/contracts/public-api.md`):

- Document that `musicBrainzId` is returned in GET responses for `artistas` and `canciones`
- Update response examples

**Files to update**:

- `docs/5_backend_api-contracts/contracts/admin-api.md`
- `docs/5_backend_api-contracts/contracts/public-api.md`

### Phase 3: API Implementation

**Playbook**: `docs/5_backend_api-contracts/playbooks/PLAYBOOK_05_05_IMPLEMENT_VERSIONING.md`

1. **Update backend TypeScript types** (`backend/src/server/db/types.ts`):

- Add `musicBrainzId?: string;` to `Artista` interface
- Add `musicBrainzId?: string;` to `Cancion` interface

2. **Update schema definition** (`backend/src/server/db/schema/schema.ts`):

- Add `musicBrainzId: string (optional)` to Artista properties comment
- Add `musicBrainzId: string (optional)` to Cancion properties comment

3. **Verify API handlers**:

- Admin API generic handlers should automatically support the new field (no code changes needed if using generic CRUD)
- Public API handlers should automatically return the new field (no code changes needed if using generic queries)
- Test that the field is accepted and returned correctly

**Files to update**:

- `backend/src/server/db/types.ts` (Artista and Cancion interfaces)
- `backend/src/server/db/schema/schema.ts` (schema comments)

### Phase 4: Frontend Type Definitions

1. **Update frontend TypeScript types** (`frontend/src/types/index.ts`):

- Add `musicBrainzId?: string;` to `Artista` interface
- Add `musicBrainzId?: string;` to `Cancion` interface

**Files to update**:

- `frontend/src/types/index.ts` (Artista and Cancion interfaces)

### Phase 5: Frontend Admin UI Documentation

**Playbook**: `docs/2_frontend_ui-design-system/playbooks/PLAYBOOK_02_01_DOCUMENT_DESIGN_INTENT.md`

1. **Document field in admin UI specification**:

- Note that `musicBrainzId` will appear in EntityMetadataEditor
- Document field display order (should be added to FIELD_ORDER configuration)
- Document that it's a text input field (not textarea, not dropdown)

**Files to update**:

- Create or update relevant UI documentation in `docs/2_frontend_ui-design-system/`

### Phase 6: Frontend Admin UI Implementation

**Playbook**: `docs/2_frontend_ui-design-system/playbooks/PLAYBOOK_02_05_IMPLEMENT_REFACTOR.md`

1. **Update field configuration** (`frontend/src/lib/config/fieldConfigs.ts`):

- Add `musicBrainzId` to `FIELD_ORDER.artista` array (suggested position: after `bio` or before social handles)
- Add `musicBrainzId` to `FIELD_ORDER.cancion` array (suggested position: after `lyrics` or at end)

2. **Verify EntityMetadataEditor**:

- No code changes needed - `EntityMetadataEditor` automatically handles new fields based on FIELD_ORDER
- Field will appear as a text input (since it's a string, not boolean, and not in TEXTAREA_FIELDS)

**Files to update**:

- `frontend/src/lib/config/fieldConfigs.ts` (FIELD_ORDER for artista and cancion)

## Validation Steps

After each phase:

1. **Database**: Verify schema documentation matches code
2. **API**: Test that field is accepted in POST/PUT and returned in GET
3. **Frontend**: Verify field appears in admin UI and can be edited

## Notes

- The `musicBrainzId` field is optional, so existing entities won't break
- No database migration needed (Neo4j is schema-less, new properties can be added dynamically)
- Generic API handlers should automatically support the new field
- EntityMetadataEditor will automatically display the field based on FIELD_ORDER configuration
- No validation rules needed initially (can be added later if MusicBrainz ID format validation is required)

## Dependencies

- Phase 1 must complete before Phase 3 (documentation before implementation)
- Phase 2 must complete before Phase 3 (API contract before implementation)
- Phase 3 must complete before Phase 4 (backend types before frontend types)
- Phase 4 must complete before Phase 6 (frontend types before UI implementation)
- Phase 5 can run in parallel with Phase 4 (UI documentation independent)

### To-dos

- [ ] Document musicBrainzId property in database schema documentation (nodes.md and properties.md) for Artista and Cancion
- [ ] Document musicBrainzId in API contracts (admin-api.md and public-api.md) for artistas and canciones endpoints
- [ ] Add musicBrainzId to backend TypeScript types (types.ts) and update schema.ts comments for Artista and Cancion
- [ ] Add musicBrainzId to frontend TypeScript types (types/index.ts) for Artista and Cancion interfaces
- [ ] Document musicBrainzId field in frontend UI design system documentation
- [ ] Add musicBrainzId to FIELD_ORDER configuration in fieldConfigs.ts for artista and cancion entity types