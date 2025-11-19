# Deployment & Infrastructure Playbooks

## Purpose

This directory contains AI-ready instruction documents ("playbooks") for systematically working with deployment and infrastructure documentation. Each playbook provides clear, actionable instructions that can be used as context in a new AI agent session to quickly position intent and execute specific tasks.

## Quick Start

**To use a playbook in a new AI session:**

1. Open the relevant playbook document
2. Copy the entire playbook content
3. Paste it as context in your AI agent window
4. Add your specific request (e.g., "Document the current deployment process")
5. The AI will follow the structured instructions

## Available Playbooks

### Core Deployment Operations

1. **[PLAYBOOK_01_DOCUMENT_PROCESS.md](./PLAYBOOK_01_DOCUMENT_PROCESS.md)**
   - Document deployment processes from existing code/config
   - Document new deployment process specifications
   - Create complete deployment process documentation

2. **[PLAYBOOK_02_VALIDATE_ENVIRONMENT.md](./PLAYBOOK_02_VALIDATE_ENVIRONMENT.md)**
   - Validate deployment processes against actual environments
   - Check for sync issues between processes and implementation
   - Generate validation reports

3. **[PLAYBOOK_03_GAP_ANALYSIS.md](./PLAYBOOK_03_GAP_ANALYSIS.md)**
   - Analyze gaps between documented processes and actual deployment
   - Identify discrepancies across processes, environments, and infrastructure
   - Prioritize gaps for improvement

### Improvement Operations

4. **[PLAYBOOK_04_PLAN_IMPROVEMENTS.md](./PLAYBOOK_04_PLAN_IMPROVEMENTS.md)**
   - Plan incremental deployment improvements based on gap analysis
   - Create improvement tasks with clear scope
   - Assess risks and dependencies

5. **[PLAYBOOK_05_IMPLEMENT_INFRASTRUCTURE.md](./PLAYBOOK_05_IMPLEMENT_INFRASTRUCTURE.md)**
   - Execute infrastructure implementation following documented processes
   - Maintain sync between infrastructure and documentation
   - Validate implementation

### Maintenance Operations

6. **[PLAYBOOK_06_UPDATE_PROCESS.md](./PLAYBOOK_06_UPDATE_PROCESS.md)**
   - Update existing deployment process documentation
   - Handle process changes and code changes
   - Maintain cross-layer consistency

7. **[PLAYBOOK_07_DEPLOYMENT_AUDIT.md](./PLAYBOOK_07_DEPLOYMENT_AUDIT.md)**
   - Audit all deployment elements for accuracy
   - Check for drift between docs and implementation
   - Generate maintenance reports

## Deployment Status Definitions

When working with playbooks, deployment elements use these status values:

- **draft**: Initial documentation, not yet validated
- **current_implementation**: Documents existing deployment as-is
- **validated**: Validated against requirements, meets deployment goals
- **implemented**: Deployment updated to match requirements (may include improvements)
- **deprecated**: Deployment process replaced or no longer applicable

## Process Phases

The playbooks support the phased approach from `complete-refactor-analysis.md`:

1. **Phase 1: Baseline Documentation** → Use PLAYBOOK_01, then PLAYBOOK_02
2. **Phase 2: Gap Analysis** → Use PLAYBOOK_03, then PLAYBOOK_04
3. **Phase 3: Refactoring** → Use PLAYBOOK_05, then PLAYBOOK_02
4. **Phase 4: Iterative Enhancement** → Use PLAYBOOK_06, then PLAYBOOK_02

## Best Practices

1. **Always validate after documentation** - Use PLAYBOOK_02 after PLAYBOOK_01
2. **Document before implementing** - Use PLAYBOOK_01 before PLAYBOOK_05
3. **Plan before implementing** - Use PLAYBOOK_04 before PLAYBOOK_05
4. **Update processes with code changes** - Use PLAYBOOK_06 when code changes
5. **Regular audits** - Use PLAYBOOK_07 monthly

## Related Documentation

- `../README.md` - Deployment documentation overview
- `../../ux-workflows/playbooks/` - UX workflow playbooks (reference for structure)
- `../../../complete-refactor-analysis.md` - Strategic analysis and approach

---

**Last Updated:** 2025-01-XX

