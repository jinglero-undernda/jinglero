# Database Schema Playbooks

## Purpose

This directory contains AI-ready instruction documents ("playbooks") for systematically working with database schema documentation. Each playbook provides clear, actionable instructions that can be used as context in a new AI agent session to quickly position intent and execute specific tasks.

## Quick Start

**To use a playbook in a new AI session:**

1. Open the relevant playbook document
2. Copy the entire playbook content
3. Paste it as context in your AI agent window
4. Add your specific request (e.g., "Document the current Neo4j schema")
5. The AI will follow the structured instructions

## Available Playbooks

### Core Schema Operations

1. **[PLAYBOOK_01_DOCUMENT_SCHEMA.md](./PLAYBOOK_01_DOCUMENT_SCHEMA.md)**

   - Document schema from existing database/code
   - Document new schema specifications
   - Create complete schema documentation

2. **[PLAYBOOK_02_VALIDATE_REQUIREMENTS.md](./PLAYBOOK_02_VALIDATE_REQUIREMENTS.md)**

   - Validate schema documentation against requirements
   - Check for sync issues between schema and requirements
   - Generate validation reports

3. **[PLAYBOOK_03_GAP_ANALYSIS.md](./PLAYBOOK_03_GAP_ANALYSIS.md)**
   - Analyze gaps between documented schema and requirements
   - Identify discrepancies across frontend, backend, and database layers
   - Prioritize gaps for refactoring

### Refactoring Operations

4. **[PLAYBOOK_04_PLAN_MIGRATION.md](./PLAYBOOK_04_PLAN_MIGRATION.md)**

   - Plan incremental migrations based on gap analysis
   - Create migration tasks with clear scope
   - Assess risks and dependencies

5. **[PLAYBOOK_05_IMPLEMENT_MIGRATION.md](./PLAYBOOK_05_IMPLEMENT_MIGRATION.md)**
   - Execute migrations following documented schema
   - Maintain sync between database and documentation
   - Validate implementation

### Maintenance Operations

6. **[PLAYBOOK_06_UPDATE_SCHEMA.md](./PLAYBOOK_06_UPDATE_SCHEMA.md)**

   - Update existing schema documentation
   - Handle schema changes and code changes
   - Maintain cross-layer consistency

7. **[PLAYBOOK_07_SCHEMA_AUDIT.md](./PLAYBOOK_07_SCHEMA_AUDIT.md)**
   - Audit all schema elements for accuracy
   - Check for drift between docs and database
   - Generate maintenance reports

## Schema Status Definitions

When working with playbooks, schema elements use these status values:

- **draft**: Initial documentation, not yet validated
- **current_implementation**: Documents existing database as-is
- **validated**: Validated against database, matches current implementation
- **implemented**: Database updated to match schema (may include improvements)
- **deprecated**: Schema element replaced or no longer applicable

## Process Phases

The playbooks support the phased approach from `complete-refactor-analysis.md`:

1. **Phase 1: Baseline Documentation** → Use PLAYBOOK_01, then PLAYBOOK_02
2. **Phase 2: Gap Analysis** → Use PLAYBOOK_03, then PLAYBOOK_04
3. **Phase 3: Refactoring** → Use PLAYBOOK_05, then PLAYBOOK_02
4. **Phase 4: Iterative Enhancement** → Use PLAYBOOK_06, then PLAYBOOK_02

## Best Practices

1. **Always validate after documentation** - Use PLAYBOOK_02 after PLAYBOOK_01
2. **Document before refactoring** - Use PLAYBOOK_01 before PLAYBOOK_05
3. **Plan before implementing** - Use PLAYBOOK_04 before PLAYBOOK_05
4. **Update schema with code changes** - Use PLAYBOOK_06 when code changes
5. **Regular audits** - Use PLAYBOOK_07 monthly

## Related Documentation

- `../README.md` - Schema documentation overview
- `../../1_frontend_ux-workflows/playbooks/` - UX workflow playbooks (reference for structure)
- `../../../complete-refactor-analysis.md` - Strategic analysis and approach

---

**Last Updated:** 2025-01-XX
