# Playbook 07: Workflow Audit

## Purpose

This playbook provides step-by-step instructions for auditing all workflows to check for accuracy, drift, and maintenance needs. Use this for regular maintenance and comprehensive reviews.

## When to Use This Playbook

- Monthly maintenance audits
- Quarterly comprehensive reviews
- Before major releases
- When sync issues are suspected across multiple workflows
- After significant codebase changes

## Prerequisites

- All workflow documents exist
- Access to codebase
- Understanding of all workflows

## Instructions for AI Assistant

### Step 1: Inventory All Workflows

**Your task:**
1. List all workflow documents
2. Read workflow metadata
3. Check workflow status
4. Identify last validation date

**Create workflow inventory:**
```markdown
## Workflow Inventory

| ID | Name | Status | Last Updated | Last Validated | Version |
|----|------|--------|--------------|----------------|---------|
| WORKFLOW_001 | [Name] | [Status] | [Date] | [Date] | [Version] |
| WORKFLOW_002 | [Name] | [Status] | [Date] | [Date] | [Version] |
```

### Step 2: Check Workflow Health

**For each workflow, check:**

1. **Documentation Health:**
   - Is documentation complete?
   - Are all sections present?
   - Are code references present?
   - Is validation checklist present?

2. **Sync Health:**
   - When was it last validated?
   - Are there known discrepancies?
   - Has code changed since last validation?

3. **Status Health:**
   - Is status appropriate?
   - Should status be updated?
   - Is workflow deprecated but still referenced?

**Health checklist:**
```
Workflow Health:
- [ ] Documentation complete
- [ ] Code references present
- [ ] Recently validated (< 3 months)
- [ ] Status appropriate
- [ ] No known discrepancies
```

### Step 3: Validate All Workflows

**For each workflow:**

1. **Run validation** (use PLAYBOOK_02):
   - Check code references
   - Verify state management
   - Verify API integration
   - Verify component behavior

2. **Document results:**
   - Note discrepancies
   - Note missing references
   - Note outdated information

**Validation summary:**
```markdown
## Validation Summary

### WORKFLOW_001: [Name]
- **Status**: Validated | Discrepancies Found | Needs Review
- **Issues**: [List issues]
- **Priority**: [Priority if issues found]

### WORKFLOW_002: [Name]
- **Status**: Validated | Discrepancies Found | Needs Review
- **Issues**: [List issues]
- **Priority**: [Priority if issues found]
```

### Step 4: Check for Drift

**Identify workflows with drift:**

1. **Code Drift:**
   - Code changed but workflow not updated
   - Code references broken
   - Implementation differs from documentation

2. **UX Drift:**
   - User experience changed but workflow not updated
   - New features not documented
   - Removed features still documented

3. **Documentation Drift:**
   - Workflow updated but code not updated
   - Aspirational documentation not implemented

**Drift analysis:**
```markdown
## Drift Analysis

### Code Drift (Code changed, docs not updated)
- WORKFLOW_XXX: [Description of drift]

### UX Drift (UX changed, docs not updated)
- WORKFLOW_XXX: [Description of drift]

### Documentation Drift (Docs changed, code not updated)
- WORKFLOW_XXX: [Description of drift]
```

### Step 5: Check Dependencies

**Check workflow dependencies:**

1. **Workflow Dependencies:**
   - Which workflows depend on others?
   - Are dependencies documented?
   - Are dependencies still valid?

2. **Code Dependencies:**
   - Which code depends on workflows?
   - Are code references to workflows accurate?
   - Are workflows referenced in code comments?

**Dependency check:**
```markdown
## Dependency Analysis

### Workflow Dependencies
- WORKFLOW_001 depends on: [List]
- WORKFLOW_002 depends on: [List]

### Code Dependencies
- WORKFLOW_001 referenced in: [List files]
- WORKFLOW_002 referenced in: [List files]
```

### Step 6: Identify Maintenance Needs

**For each workflow, identify:**

1. **Immediate Needs:**
   - Critical discrepancies
   - Broken references
   - Missing documentation

2. **Short-term Needs:**
   - Updates needed
   - Validation needed
   - Status updates needed

3. **Long-term Needs:**
   - Refactoring opportunities
   - Enhancement opportunities
   - Deprecation candidates

**Maintenance needs:**
```markdown
## Maintenance Needs

### Immediate (Fix Now)
- WORKFLOW_XXX: [Need]
- WORKFLOW_YYY: [Need]

### Short-term (Fix This Month)
- WORKFLOW_XXX: [Need]
- WORKFLOW_YYY: [Need]

### Long-term (Fix This Quarter)
- WORKFLOW_XXX: [Need]
- WORKFLOW_YYY: [Need]
```

### Step 7: Generate Audit Report

**Create comprehensive audit report:**

```markdown
# Workflow Audit Report

**Date**: [YYYY-MM-DD]
**Auditor**: AI Assistant
**Scope**: All workflows

## Executive Summary

- **Total Workflows**: [number]
- **Validated**: [number]
- **Discrepancies Found**: [number]
- **Needs Update**: [number]
- **Deprecated**: [number]

## Workflow Health Summary

### Healthy Workflows ✅
- WORKFLOW_XXX: [Brief status]
- WORKFLOW_YYY: [Brief status]

### Workflows Needing Attention ⚠️
- WORKFLOW_XXX: [Issue]
- WORKFLOW_YYY: [Issue]

### Workflows with Critical Issues ❌
- WORKFLOW_XXX: [Critical issue]
- WORKFLOW_YYY: [Critical issue]

## Detailed Findings

### WORKFLOW_001: [Name]

**Status**: [Status]
**Last Updated**: [Date]
**Last Validated**: [Date]

**Health Check**:
- Documentation: [Complete | Incomplete]
- Code References: [All Valid | Some Invalid | Missing]
- Validation: [Up to Date | Out of Date | Never Validated]

**Issues Found**:
1. [Issue 1]
2. [Issue 2]

**Recommendations**:
1. [Recommendation 1]
2. [Recommendation 2]

**Priority**: [P0 | P1 | P2 | P3]

---

[Repeat for each workflow]

## Drift Analysis

### Code Drift
[Summary of code drift issues]

### UX Drift
[Summary of UX drift issues]

### Documentation Drift
[Summary of documentation drift issues]

## Dependency Analysis

### Workflow Dependencies
[Summary of workflow dependencies]

### Code Dependencies
[Summary of code dependencies]

## Maintenance Plan

### Immediate Actions (This Week)
1. [Action 1]
2. [Action 2]

### Short-term Actions (This Month)
1. [Action 1]
2. [Action 2]

### Long-term Actions (This Quarter)
1. [Action 1]
2. [Action 2]

## Recommendations

### Process Improvements
1. [Recommendation 1]
2. [Recommendation 2]

### Documentation Improvements
1. [Recommendation 1]
2. [Recommendation 2]

### Code Improvements
1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps

1. [ ] Review audit report
2. [ ] Prioritize maintenance tasks
3. [ ] Create maintenance tasks
4. [ ] Begin addressing critical issues
```

### Step 8: Create Maintenance Tasks

**For each maintenance need, create task:**

```markdown
## Maintenance Tasks

### Task 1: [Task Name]
- **Workflow**: WORKFLOW_XXX
- **Priority**: [P0 | P1 | P2 | P3]
- **Type**: Update | Validate | Refactor
- **Description**: [Description]
- **Effort**: [Small | Medium | Large]

[Repeat for each task]
```

## Output Deliverables

1. **Workflow Inventory** (list of all workflows)
2. **Audit Report** (comprehensive findings)
3. **Maintenance Plan** (prioritized actions)
4. **Maintenance Tasks** (actionable tasks)

## Quality Criteria

**Good audit:**
- ✅ All workflows checked
- ✅ All issues identified
- ✅ Clear priorities assigned
- ✅ Actionable recommendations
- ✅ Maintenance plan created

**Red flags:**
- ❌ Workflows missed
- ❌ Issues not identified
- ❌ Vague recommendations
- ❌ No maintenance plan
- ❌ No priorities assigned

## Example Prompts for User

```
Perform a comprehensive audit of all workflows.
Check for accuracy, drift, and maintenance needs.
Generate an audit report with prioritized recommendations.
```

## Next Steps

After audit:
1. **Review audit report** → Get stakeholder approval
2. **Prioritize maintenance** → Create maintenance plan
3. **Begin maintenance** → Use appropriate playbooks (PLAYBOOK_01, 02, 06)

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Workflow (use for each workflow)
- PLAYBOOK_01: Document Workflow (use for missing/outdated workflows)
- PLAYBOOK_06: Update Workflow (use for updates needed)

