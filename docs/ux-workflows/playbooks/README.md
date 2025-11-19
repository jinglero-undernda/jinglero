# UX Workflow Playbooks

## Purpose

This directory contains AI-ready instruction documents ("playbooks") for systematically working with UX workflow documentation. Each playbook provides clear, actionable instructions that can be used as context in a new AI agent session to quickly position intent and execute specific tasks.

## Quick Start

**To use a playbook in a new AI session:**

1. Open the relevant playbook document
2. Copy the entire playbook content
3. Paste it as context in your AI agent window
4. Add your specific request (e.g., "Document the entity creation workflow")
5. The AI will follow the structured instructions

## Available Playbooks

### Core Workflow Operations

1. **[PLAYBOOK_01_DOCUMENT_WORKFLOW.md](./PLAYBOOK_01_DOCUMENT_WORKFLOW.md)**

   - Document an existing workflow from code
   - Document a new workflow from UX description
   - Create complete workflow documentation with all layers

2. **[PLAYBOOK_02_VALIDATE_WORKFLOW.md](./PLAYBOOK_02_VALIDATE_WORKFLOW.md)**

   - Validate workflow documentation against codebase
   - Check for sync issues across layers
   - Generate validation reports

3. **[PLAYBOOK_03_GAP_ANALYSIS.md](./PLAYBOOK_03_GAP_ANALYSIS.md)**
   - Analyze gaps between documented workflows and code
   - Identify discrepancies across UX, UI, and technical layers
   - Prioritize gaps for refactoring

### Refactoring Operations

4. **[PLAYBOOK_04_PLAN_REFACTOR.md](./PLAYBOOK_04_PLAN_REFACTOR.md)**

   - Plan incremental refactoring based on gap analysis
   - Create refactoring tasks with clear scope
   - Assess risks and dependencies

5. **[PLAYBOOK_05_IMPLEMENT_REFACTOR.md](./PLAYBOOK_05_IMPLEMENT_REFACTOR.md)**
   - Execute refactoring following documented workflows
   - Maintain sync between code and documentation
   - Validate implementation

### Maintenance Operations

6. **[PLAYBOOK_06_UPDATE_WORKFLOW.md](./PLAYBOOK_06_UPDATE_WORKFLOW.md)**

   - Update existing workflow documentation
   - Handle UX changes and code changes
   - Maintain cross-layer consistency

7. **[PLAYBOOK_07_WORKFLOW_AUDIT.md](./PLAYBOOK_07_WORKFLOW_AUDIT.md)**
   - Audit all workflows for accuracy
   - Check for drift between docs and code
   - Generate maintenance reports

## Workflow Status Definitions

When working with playbooks, workflows use these status values:

- **draft**: Initial documentation, not yet validated
- **current_implementation**: Documents existing code as-is
- **validated**: Validated against code, matches current implementation
- **implemented**: Code updated to match workflow (may include improvements)
- **deprecated**: Workflow replaced or no longer applicable

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
4. **Update workflows with code changes** - Use PLAYBOOK_06 when code changes
5. **Regular audits** - Use PLAYBOOK_07 monthly

## Related Documentation

- `../IMPLEMENTATION_GUIDE.md` - General implementation guidance
- `../README.md` - Workflow documentation overview
- `../../complete-refactor-analysis.md` - Strategic analysis and approach

---

**Last Updated:** 2025-01-XX
