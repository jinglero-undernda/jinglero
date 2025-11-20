# UI Design System Playbooks

## Purpose

This directory contains AI-ready instruction documents ("playbooks") for systematically working with UI Design System documentation. Each playbook provides clear, actionable instructions that can be used as context in a new AI agent session to quickly position intent and execute specific tasks.

## Quick Start

**To use a playbook in a new AI session:**

1. Open the relevant playbook document
2. Copy the entire playbook content
3. Paste it as context in your AI agent window
4. Add your specific request (e.g., "Document the current color palette")
5. The AI will follow the structured instructions

## Available Playbooks

### Core Design System Operations

1. **[PLAYBOOK_01_DOCUMENT_DESIGN_INTENT.md](./PLAYBOOK_01_DOCUMENT_DESIGN_INTENT.md)**
   - Document design intent from existing code
   - Document new design specifications
   - Create complete design system documentation

2. **[PLAYBOOK_02_VALIDATE_IMPLEMENTATION.md](./PLAYBOOK_02_VALIDATE_IMPLEMENTATION.md)**
   - Validate design system documentation against codebase
   - Check for sync issues between design and implementation
   - Generate validation reports

3. **[PLAYBOOK_03_GAP_ANALYSIS.md](./PLAYBOOK_03_GAP_ANALYSIS.md)**
   - Analyze gaps between documented design and implementation
   - Identify discrepancies across design tokens, components, and styles
   - Prioritize gaps for refactoring

### Refactoring Operations

4. **[PLAYBOOK_04_PLAN_REFACTOR.md](./PLAYBOOK_04_PLAN_REFACTOR.md)**
   - Plan incremental refactoring based on gap analysis
   - Create refactoring tasks with clear scope
   - Assess risks and dependencies

5. **[PLAYBOOK_05_IMPLEMENT_REFACTOR.md](./PLAYBOOK_05_IMPLEMENT_REFACTOR.md)**
   - Execute refactoring following documented design system
   - Maintain sync between code and documentation
   - Validate implementation

### Maintenance Operations

6. **[PLAYBOOK_06_UPDATE_DESIGN_SYSTEM.md](./PLAYBOOK_06_UPDATE_DESIGN_SYSTEM.md)**
   - Update existing design system documentation
   - Handle design changes and code changes
   - Maintain cross-layer consistency

7. **[PLAYBOOK_07_DESIGN_SYSTEM_AUDIT.md](./PLAYBOOK_07_DESIGN_SYSTEM_AUDIT.md)**
   - Audit all design system elements for accuracy
   - Check for drift between docs and code
   - Generate maintenance reports

## Design System Status Definitions

When working with playbooks, design system elements use these status values:

- **draft**: Initial documentation, not yet validated
- **current_implementation**: Documents existing code as-is
- **validated**: Validated against code, matches current implementation
- **implemented**: Code updated to match design system (may include improvements)
- **deprecated**: Design element replaced or no longer applicable

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
4. **Update design system with code changes** - Use PLAYBOOK_06 when code changes
5. **Regular audits** - Use PLAYBOOK_07 monthly

## Related Documentation

- `../README.md` - Design system documentation overview
- `../../1_frontend_ux-workflows/playbooks/` - UX workflow playbooks (reference for structure)
- `../../../complete-refactor-analysis.md` - Strategic analysis and approach

---

**Last Updated:** 2025-11-19

