# Performance & Monitoring Playbooks

## Purpose

This directory contains AI-ready instruction documents ("playbooks") for systematically working with performance and monitoring documentation. Each playbook provides clear, actionable instructions that can be used as context in a new AI agent session to quickly position intent and execute specific tasks.

## Quick Start

**To use a playbook in a new AI session:**

1. Open the relevant playbook document
2. Copy the entire playbook content
3. Paste it as context in your AI agent window
4. Add your specific request (e.g., "Document the current performance targets")
5. The AI will follow the structured instructions

## Available Playbooks

### Core Performance Operations

1. **[PLAYBOOK_07_01_DOCUMENT_TARGETS.md](./PLAYBOOK_07_01_DOCUMENT_TARGETS.md)**
   - Document performance targets from existing code/requirements
   - Document new performance target specifications
   - Create complete performance target documentation

2. **[PLAYBOOK_07_02_VALIDATE_METRICS.md](./PLAYBOOK_07_02_VALIDATE_METRICS.md)**
   - Validate performance targets against actual metrics
   - Check for sync issues between targets and implementation
   - Generate validation reports

3. **[PLAYBOOK_07_03_GAP_ANALYSIS.md](./PLAYBOOK_07_03_GAP_ANALYSIS.md)**
   - Analyze gaps between documented targets and actual performance
   - Identify discrepancies across targets, metrics, and monitoring
   - Prioritize gaps for optimization

### Optimization Operations

4. **[PLAYBOOK_07_04_PLAN_OPTIMIZATION.md](./PLAYBOOK_07_04_PLAN_OPTIMIZATION.md)**
   - Plan incremental optimizations based on gap analysis
   - Create optimization tasks with clear scope
   - Assess risks and dependencies

5. **[PLAYBOOK_07_05_IMPLEMENT_MONITORING.md](./PLAYBOOK_07_05_IMPLEMENT_MONITORING.md)**
   - Execute monitoring implementation following documented targets
   - Maintain sync between monitoring and documentation
   - Validate implementation

### Maintenance Operations

6. **[PLAYBOOK_07_06_UPDATE_TARGETS.md](./PLAYBOOK_07_06_UPDATE_TARGETS.md)**
   - Update existing performance target documentation
   - Handle target changes and code changes
   - Maintain cross-layer consistency

7. **[PLAYBOOK_07_07_PERFORMANCE_AUDIT.md](./PLAYBOOK_07_07_PERFORMANCE_AUDIT.md)**
   - Audit all performance elements for accuracy
   - Check for drift between docs and implementation
   - Generate maintenance reports

## Performance Status Definitions

When working with playbooks, performance elements use these status values:

- **draft**: Initial documentation, not yet validated
- **current_implementation**: Documents existing performance as-is
- **validated**: Validated against targets, meets performance goals
- **implemented**: Performance updated to match targets (may include improvements)
- **deprecated**: Performance target replaced or no longer applicable

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
4. **Update targets with code changes** - Use PLAYBOOK_06 when code changes
5. **Regular audits** - Use PLAYBOOK_07 monthly

## Related Documentation

- `../README.md` - Performance documentation overview
- `../../1_frontend_ux-workflows/playbooks/` - UX workflow playbooks (reference for structure)
- `../../../complete-refactor-analysis.md` - Strategic analysis and approach

---

**Last Updated:** 2025-01-XX

