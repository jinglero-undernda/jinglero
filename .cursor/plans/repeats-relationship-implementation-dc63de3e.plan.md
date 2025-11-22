<!-- dc63de3e-d272-43d3-9b12-148392df13da ca4ac056-f31f-4c69-9be3-0527bb1618d8 -->
# REPEATS Relationship Documentation Plan

## Overview

Document a new `REPEATS` relationship type (Jingle-REPEATS-Jingle) following the documentation-first approach. This feature spans multiple areas and requires documentation before implementation.

## Documentation-First Approach

Following PLAYBOOK_00 (Product Orchestrator) principles, we will:

1. **Document the specification first** using appropriate playbooks
2. **Validate the documentation** against requirements
3. **Plan implementation** based on documented specifications
4. **Implement** following documented design

## Primary Playbook: Database Schema Documentation

**Use: `docs/4_backend_database-schema/playbooks/PLAYBOOK_01_DOCUMENT_SCHEMA.md`**

This is the foundation playbook since REPEATS is a new relationship type. We'll document:

- Relationship definition (Jingle → Jingle, self-referential)
- Relationship properties (status, createdAt, extensible)
- Direction rules and validation logic
- Transitive normalization behavior
- Traversal logic for finding initial instances
- Cardinality constraints

**Deliverable**: Updated `docs/4_backend_database-schema/schema/relationships.md` with complete REPEATS specification

## Secondary Playbooks (Sequential)

### 1. API Contracts Documentation

**Use: `docs/5_backend_api-contracts/playbooks/PLAYBOOK_01_DOCUMENT_CONTRACTS.md`**

After schema documentation, document:

- Admin API endpoints for REPEATS CRUD operations
- Public API queries for REPEATS relationships
- Validation rules in API layer
- Error handling for REPEATS operations

**Deliverable**: Updated `docs/5_backend_api-contracts/contracts/admin-api.md` with REPEATS endpoints

### 2. UI Design System Documentation (Optional)

**Use: `docs/2_frontend_ui-design-system/playbooks/PLAYBOOK_01_DOCUMENT_DESIGN_INTENT.md`**

If UI changes are significant, document:

- RelatedEntities component updates
- Relationship display patterns
- Sorting behavior (fabricaDate, ineditos last)
- Position in relationship list (between Jinglero and Tematicas)

**Deliverable**: Design intent documentation (if needed)

## Documentation Scope

### A. Database Schema (Primary)

**Document in `schema/relationships.md`:**

1. **Relationship Definition:**

- Type: REPEATS
- Start Node: Jingle
- End Node: Jingle
- Direction: Directed (Latest → Earliest, or Inedito → Published)
- Cardinality: Many-to-Many (one Jingle can repeat multiple others, but only to initial instances)

2. **Properties:**

- `status`: string (enum: DRAFT, CONFIRMED) - Default: DRAFT
- `createdAt`: datetime - Timestamp when relationship was created
- Extensible for future properties

3. **Direction Validation Rules:**

- If both Jingles have `fabricaDate` (published): Latest (newer date) → REPEATS → Earliest (older date)
- If one Jingle is Inedito (no APPEARS_IN, no fabricaDate): Inedito → REPEATS → Published
- If both Inedito: Inedito → REPEATS → Inedito (based on createdAt or other criteria)
- Auto-correction on create/update

4. **Transitive Normalization:**

- Rule: If J3-REPEATS-J1 AND J1-REPEATS-J2 exist, normalize to J3-REPEATS-J2
- Action: Delete intermediate relationship (J3-REPEATS-J1) OR update target and set status to DRAFT
- Trigger: On relationship create/update, prevent concurrent inbound/outbound REPEATS

5. **Traversal Logic:**

- Find "initial repeat": Traverse REPEATS chain to find original (no inbound REPEATS)
- Find "other instances": 2-step bidirectional query to find all repeats in chain
- Used for: UI display, validation, data consistency

6. **Constraints:**

- Cannot have both inbound AND outbound REPEATS concurrently (triggers normalization)
- Multiple outbound REPEATS allowed (one Jingle can repeat multiple others)
- All outbound REPEATS must point to initial instances (after normalization)

### B. API Contracts (Secondary)

**Document in `contracts/admin-api.md`:**

1. **Relationship CRUD Endpoints:**

- `GET /api/admin/relationships/repeats` - List REPEATS relationships
- `POST /api/admin/relationships/repeats` - Create REPEATS relationship (with direction validation)
- `PUT /api/admin/relationships/repeats` - Update REPEATS relationship (with direction validation)
- `DELETE /api/admin/relationships/repeats` - Delete REPEATS relationship

2. **Validation Behavior:**

- Direction auto-correction on create/update
- Transitive normalization triggered on create/update
- Error responses for invalid operations

3. **Public API:**

- Include REPEATS in relationship queries
- Traversal endpoints (if needed)

### C. UI Design (If Needed)

**Document design intent:**

- RelatedEntities component: Display REPEATS between Jinglero and Tematicas
- Sorting: fabricaDate ascending, ineditos at bottom
- Display: Show original instance first (from traversal), then other instances
- Blank row: Show for creating new REPEATS relationships

## Documentation Process

### Step 1: Document Schema (Primary)

1. Use PLAYBOOK_01_DOCUMENT_SCHEMA.md
2. Work with user to define complete REPEATS specification
3. Document in `schema/relationships.md` following existing pattern
4. Include all validation rules, constraints, and behaviors

### Step 2: Validate Schema Documentation

1. Use PLAYBOOK_02_VALIDATE_REQUIREMENTS.md (Area 4)
2. Validate REPEATS specification against requirements
3. Check for consistency with existing relationships
4. Identify any gaps or ambiguities

### Step 3: Document API Contracts

1. Use PLAYBOOK_01_DOCUMENT_CONTRACTS.md (Area 5)
2. Document REPEATS endpoints based on schema specification
3. Document validation behavior in API layer
4. Document error handling

### Step 4: Document UI Design (If Needed)

1. Use PLAYBOOK_01_DOCUMENT_DESIGN_INTENT.md (Area 2)
2. Document RelatedEntities updates
3. Document sorting and display behavior

### Step 5: Review and Refine

1. Review all documentation for completeness
2. Ensure consistency across areas
3. Identify any remaining questions or ambiguities
4. Prepare for implementation planning (PLAYBOOK_04)

## Key Questions to Resolve During Documentation

1. **Transitive Normalization Details:**

- Exact algorithm for detecting chains
- Preference: delete intermediate vs. update target
- Handling of multiple normalization scenarios

2. **Inedito Handling:**

- Sorting criteria when both Jingles are Inedito
- Behavior when creating REPEATS between two Ineditos

3. **Traversal Logic:**

- Exact query patterns for finding initial instance
- Performance considerations for long chains
- Caching strategy (if any)

4. **UI Display:**

- Exact label for relationship section
- Visual treatment (if different from other relationships)
- Interaction patterns for creating REPEATS

## Next Steps After Documentation

1. **Validate Documentation** (PLAYBOOK_02 for each area)
2. **Gap Analysis** (PLAYBOOK_03) - Identify implementation gaps
3. **Plan Implementation** (PLAYBOOK_04) - Create implementation plan
4. **Implement** (PLAYBOOK_05) - Execute implementation following documented spec

## Success Criteria

**Documentation is complete when:**

- ✅ REPEATS relationship fully specified in schema documentation
- ✅ All validation rules documented
- ✅ All constraints documented
- ✅ API contracts documented
- ✅ UI design documented (if applicable)
- ✅ All code references prepared (for future implementation)
- ✅ Documentation reviewed and validated