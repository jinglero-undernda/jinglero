# System Architecture Playbooks

## Purpose

This directory contains AI-ready instruction documents ("playbooks") for systematically working with system architecture documentation. Each playbook provides clear, actionable instructions that can be used as context in a new AI agent session to quickly position intent and execute specific tasks.

## Quick Start

**To use a playbook in a new AI session:**

1. Open the relevant playbook document
2. Copy the entire playbook content
3. Paste it as context in your AI agent window
4. Add your specific request (e.g., "Document the current data flow architecture")
5. The AI will follow the structured instructions

## Available Playbooks

### Core Architecture Operations

1. **[PLAYBOOK_03_01_DOCUMENT_CURRENT.md](./PLAYBOOK_03_01_DOCUMENT_CURRENT.md)**
   - Document current architecture from existing code
   - Document new architecture specifications
   - Create complete architecture documentation

2. **[PLAYBOOK_03_02_EVALUATE_ALTERNATIVES.md](./PLAYBOOK_03_02_EVALUATE_ALTERNATIVES.md)**
   - Evaluate architectural alternatives
   - Compare approaches for data handling
   - Generate evaluation reports

3. **[PLAYBOOK_03_03_ANALYZE_TRADEOFFS.md](./PLAYBOOK_03_03_ANALYZE_TRADEOFFS.md)**
   - Analyze tradeoffs between alternatives
   - Evaluate performance/cost/UX impacts
   - Prioritize optimization opportunities

### Optimization Operations

4. **[PLAYBOOK_03_04_PLAN_OPTIMIZATION.md](./PLAYBOOK_03_04_PLAN_OPTIMIZATION.md)**
   - Plan incremental optimizations based on tradeoff analysis
   - Create optimization tasks with clear scope
   - Assess risks and dependencies

5. **[PLAYBOOK_03_05_IMPLEMENT_OPTIMIZATION.md](./PLAYBOOK_03_05_IMPLEMENT_OPTIMIZATION.md)**
   - Execute optimizations following documented architecture
   - Maintain sync between code and documentation
   - Validate implementation

### Maintenance Operations

6. **[PLAYBOOK_03_06_UPDATE_ARCHITECTURE.md](./PLAYBOOK_03_06_UPDATE_ARCHITECTURE.md)**
   - Update existing architecture documentation
   - Handle architecture changes and code changes
   - Maintain cross-layer consistency

7. **[PLAYBOOK_03_07_ARCHITECTURE_AUDIT.md](./PLAYBOOK_03_07_ARCHITECTURE_AUDIT.md)**
   - Audit all architecture elements for accuracy
   - Check for drift between docs and code
   - Generate maintenance reports

## Architecture Status Definitions

When working with playbooks, architecture elements use these status values:

- **draft**: Initial documentation, not yet validated
- **current_implementation**: Documents existing architecture as-is
- **validated**: Validated against requirements, meets performance/cost goals
- **implemented**: Architecture updated to match specifications (may include improvements)
- **deprecated**: Architecture pattern replaced or no longer applicable

## Process Phases

The playbooks support the phased approach from `complete-refactor-analysis.md`:

1. **Phase 1: Baseline Documentation** → Use PLAYBOOK_01, then PLAYBOOK_02
2. **Phase 2: Gap Analysis** → Use PLAYBOOK_03, then PLAYBOOK_04
3. **Phase 3: Refactoring** → Use PLAYBOOK_05, then PLAYBOOK_02
4. **Phase 4: Iterative Enhancement** → Use PLAYBOOK_06, then PLAYBOOK_02

## Best Practices

1. **Always validate after documentation** - Use PLAYBOOK_02 after PLAYBOOK_01
2. **Document before optimizing** - Use PLAYBOOK_01 before PLAYBOOK_05
3. **Plan before implementing** - Use PLAYBOOK_04 before PLAYBOOK_05
4. **Update architecture with code changes** - Use PLAYBOOK_06 when code changes
5. **Regular audits** - Use PLAYBOOK_07 monthly

## Related Documentation

- `../README.md` - Architecture documentation overview
- `../../1_frontend_ux-workflows/playbooks/` - UX workflow playbooks (reference for structure)
- `../../../complete-refactor-analysis.md` - Strategic analysis and approach

---

**Last Updated:** 2025-01-XX

