# Quick Start Guide: Using Database Schema Playbooks

## How to Use These Playbooks

### In a New AI Agent Session

1. **Open the relevant playbook** (e.g., `PLAYBOOK_01_DOCUMENT_SCHEMA.md`)
2. **Copy the entire playbook content**
3. **Paste as context** in your AI agent window
4. **Add your specific request** (e.g., "Document the current Neo4j schema from schema.ts")
5. **The AI will follow the structured instructions**

### Example Session

```
[You paste PLAYBOOK_01_DOCUMENT_SCHEMA.md]

[You add]: "Document the current database schema.
Check backend/src/server/db/schema/schema.ts for schema definitions,
and backend/src/server/db/schema/setup.ts for constraints."

[AI follows playbook instructions and documents the schema]
```

## Common Workflows

### Document Current Schema

1. Use **PLAYBOOK_01_DOCUMENT_SCHEMA.md**
2. Specify files to check (e.g., `schema.ts`, `setup.ts`)
3. AI will create complete schema documentation

### Validate Schema Against Requirements

1. Use **PLAYBOOK_02_VALIDATE_REQUIREMENTS.md**
2. Specify schema element to validate (e.g., "node types")
3. AI will validate against frontend/backend requirements and generate report

### Find Gaps Between Schema and Requirements

1. Use **PLAYBOOK_03_GAP_ANALYSIS.md**
2. Specify schema area to analyze (e.g., "node properties")
3. AI will identify gaps across frontend, backend, and database layers

### Plan Schema Migration

1. Use **PLAYBOOK_04_PLAN_MIGRATION.md**
2. Provide gap analysis or list of issues
3. AI will create migration plan with tasks and priorities

### Implement Schema Migration

1. Use **PLAYBOOK_05_IMPLEMENT_MIGRATION.md**
2. Specify task to implement
3. AI will implement while maintaining doc sync

### Update Schema After Changes

1. Use **PLAYBOOK_06_UPDATE_SCHEMA.md**
2. Describe what changed (schema or code)
3. AI will update schema documentation

### Audit All Schema Elements

1. Use **PLAYBOOK_07_SCHEMA_AUDIT.md**
2. AI will check all schema elements for accuracy and drift

## Phase-Based Usage

### Phase 1: Baseline Documentation

**Goal**: Document existing schema

**Playbooks**:

1. **PLAYBOOK_01** - Document nodes, relationships, properties
2. **PLAYBOOK_02** - Validate documentation

**Process**:

```
For each schema area:
  1. Use PLAYBOOK_01 to document
  2. Use PLAYBOOK_02 to validate
  3. Fix discrepancies
  4. Mark as "validated"
```

### Phase 2: Gap Analysis

**Goal**: Identify gaps between schema and requirements

**Playbooks**:

1. **PLAYBOOK_02** - Validate schema (if not done)
2. **PLAYBOOK_03** - Analyze gaps

**Process**:

```
1. Use PLAYBOOK_02 to validate all schema elements
2. Use PLAYBOOK_03 to analyze gaps
3. Prioritize gaps
4. Create migration plan (PLAYBOOK_04)
```

### Phase 3: Refactoring

**Goal**: Align database with schema

**Playbooks**:

1. **PLAYBOOK_04** - Plan migration
2. **PLAYBOOK_05** - Implement migration
3. **PLAYBOOK_02** - Validate after implementation

**Process**:

```
1. Use PLAYBOOK_04 to create migration plan
2. For each task:
   a. Use PLAYBOOK_05 to implement
   b. Use PLAYBOOK_02 to validate
   c. Update schema if needed (PLAYBOOK_06)
```

### Phase 4: Iterative Enhancement

**Goal**: Continuously improve schema

**Playbooks**:

1. **PLAYBOOK_06** - Update schema
2. **PLAYBOOK_02** - Validate updates
3. **PLAYBOOK_07** - Regular audits

**Process**:

```
When schema or code changes:
  1. Use PLAYBOOK_06 to update schema
  2. Use PLAYBOOK_02 to validate
  3. Use PLAYBOOK_05 to implement (if schema change)
  4. Use PLAYBOOK_07 monthly for audits
```

## Quick Reference Table

| Task                  | Playbook    | Input               | Output                     |
| --------------------- | ----------- | ------------------- | -------------------------- |
| Document schema       | PLAYBOOK_01 | Schema files        | Complete schema doc        |
| Validate requirements | PLAYBOOK_02 | Schema doc          | Validation report          |
| Find gaps             | PLAYBOOK_03 | Schema + validation | Gap analysis report        |
| Plan migration        | PLAYBOOK_04 | Gap analysis        | Migration plan             |
| Implement migration   | PLAYBOOK_05 | Migration task      | Database changes + updates |
| Update schema         | PLAYBOOK_06 | Change description  | Updated schema             |
| Audit all             | PLAYBOOK_07 | (none)              | Audit report               |

## Tips

1. **Always validate after documenting** - Use PLAYBOOK_02 after PLAYBOOK_01
2. **Document before refactoring** - Use PLAYBOOK_01 before PLAYBOOK_05
3. **Plan before implementing** - Use PLAYBOOK_04 before PLAYBOOK_05
4. **Update schema with code changes** - Use PLAYBOOK_06 when code changes
5. **Regular audits** - Use PLAYBOOK_07 monthly

## Getting Help

- See **README.md** for overview
- See individual playbooks for detailed instructions
- See **../../ux-workflows/playbooks/** for reference examples

---

**Last Updated:** 2025-01-XX
