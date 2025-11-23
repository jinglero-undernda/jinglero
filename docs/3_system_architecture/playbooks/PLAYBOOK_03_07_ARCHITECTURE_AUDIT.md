# Playbook 07: Architecture Audit

## Purpose

This playbook provides step-by-step instructions for auditing all architecture elements to check for accuracy, drift, and maintenance needs. Use this for regular maintenance and comprehensive reviews.

## When to Use This Playbook

- Monthly maintenance audits
- Quarterly comprehensive reviews
- Before major releases
- When sync issues are suspected across multiple elements
- After significant codebase changes

## Prerequisites

- All architecture documents exist
- Access to codebase
- Understanding of all architecture elements

## Instructions for AI Assistant

### Step 0: Confirm Date with User

**Before generating any documentation:**
1. **Always confirm the current date with the user** before adding any date fields
2. **Ask the user**: "What is the current date? (YYYY-MM-DD format)"
3. **Use the confirmed date** for all date fields in the documentation:
   - Change History tables
   - "Last Updated" fields
   - Workflow status tables
   - Implementation summaries
   - Any other date fields

**Never assume or guess the date.**

### Step 1: Inventory All Architecture Elements

**Your task:**
1. List all architecture documents
2. Read architecture metadata
3. Check element status
4. Identify last validation date

**Create architecture inventory:**
```markdown
## Architecture Inventory

| Category | Element | Status | Last Updated | Last Validated | Version |
|----------|---------|--------|--------------|----------------|---------|
| Data Flow | API Flow | [Status] | [Date] | [Date] | [Version] |
| State Management | React State | [Status] | [Date] | [Date] | [Version] |
| Caching | Request Cache | [Status] | [Date] | [Date] | [Version] |
```

### Step 2: Check Architecture Health

**For each architecture element, check:**

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
   - Is element deprecated but still referenced?

**Health checklist:**
```
Architecture Health:
- [ ] Documentation complete
- [ ] Code references present
- [ ] Recently validated (< 3 months)
- [ ] Status appropriate
- [ ] No known discrepancies
```

### Step 3: Validate All Elements

**For each architecture element:**

1. **Run validation** (use PLAYBOOK_02):
   - Check code references
   - Verify architecture patterns
   - Verify performance targets
   - Verify cost targets

2. **Document results:**
   - Note discrepancies
   - Note missing references
   - Note outdated information

**Validation summary:**
```markdown
## Validation Summary

### Data Flow
- **Status**: Validated | Discrepancies Found | Needs Review
- **Issues**: [List issues]
- **Priority**: [Priority if issues found]

### State Management
- **Status**: Validated | Discrepancies Found | Needs Review
- **Issues**: [List issues]
- **Priority**: [Priority if issues found]
```

### Step 4: Check for Drift

**Identify elements with drift:**

1. **Code Drift:**
   - Code changed but architecture not updated
   - Code references broken
   - Implementation differs from documentation

2. **Architecture Drift:**
   - Architecture updated but code not updated
   - New patterns not implemented
   - Removed patterns still in code

3. **Documentation Drift:**
   - Architecture updated but documentation not updated
   - Aspirational documentation not implemented

**Drift analysis:**
```markdown
## Drift Analysis

### Code Drift (Code changed, docs not updated)
- Element: [Description of drift]

### Architecture Drift (Architecture changed, code not updated)
- Element: [Description of drift]

### Documentation Drift (Docs changed, architecture not updated)
- Element: [Description of drift]
```

### Step 5: Check Dependencies

**Check architecture dependencies:**

1. **Element Dependencies:**
   - Which elements depend on others?
   - Are dependencies documented?
   - Are dependencies still valid?

2. **Code Dependencies:**
   - Which code depends on architecture?
   - Are code references to architecture accurate?
   - Are architecture elements referenced in code comments?

**Dependency check:**
```markdown
## Dependency Analysis

### Element Dependencies
- Caching depends on: [List]
- State Management depends on: [List]

### Code Dependencies
- Data Flow referenced in: [List files]
- Caching referenced in: [List files]
```

### Step 6: Identify Maintenance Needs

**For each element, identify:**

1. **Immediate Needs:**
   - Critical discrepancies
   - Broken references
   - Missing documentation

2. **Short-term Needs:**
   - Updates needed
   - Validation needed
   - Status updates needed

3. **Long-term Needs:**
   - Optimization opportunities
   - Enhancement opportunities
   - Deprecation candidates

**Maintenance needs:**
```markdown
## Maintenance Needs

### Immediate (Fix Now)
- Element: [Need]
- Element: [Need]

### Short-term (Fix This Month)
- Element: [Need]
- Element: [Need]

### Long-term (Fix This Quarter)
- Element: [Need]
- Element: [Need]
```

### Step 7: Generate Audit Report

**Create comprehensive audit report:**

```markdown
# Architecture Audit Report

**Date**: [YYYY-MM-DD]
**Auditor**: AI Assistant
**Scope**: All architecture elements

## Executive Summary

- **Total Elements**: [number]
- **Validated**: [number]
- **Discrepancies Found**: [number]
- **Needs Update**: [number]
- **Deprecated**: [number]

## Architecture Health Summary

### Healthy Elements ✅
- Element: [Brief status]
- Element: [Brief status]

### Elements Needing Attention ⚠️
- Element: [Issue]
- Element: [Issue]

### Elements with Critical Issues ❌
- Element: [Critical issue]
- Element: [Critical issue]

## Detailed Findings

### Data Flow

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

[Repeat for each element]

## Drift Analysis

### Code Drift
[Summary of code drift issues]

### Architecture Drift
[Summary of architecture drift issues]

### Documentation Drift
[Summary of documentation drift issues]

## Dependency Analysis

### Element Dependencies
[Summary of element dependencies]

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
- **Element**: [Element name]
- **Priority**: [P0 | P1 | P2 | P3]
- **Type**: Update | Validate | Optimize
- **Description**: [Description]
- **Effort**: [Small | Medium | Large]

[Repeat for each task]
```

## Output Deliverables

1. **Architecture Inventory** (list of all elements)
2. **Audit Report** (comprehensive findings)
3. **Maintenance Plan** (prioritized actions)
4. **Maintenance Tasks** (actionable tasks)

## Quality Criteria

**Good audit:**
- ✅ All elements checked
- ✅ All issues identified
- ✅ Clear priorities assigned
- ✅ Actionable recommendations
- ✅ Maintenance plan created

**Red flags:**
- ❌ Elements missed
- ❌ Issues not identified
- ❌ Vague recommendations
- ❌ No maintenance plan
- ❌ No priorities assigned

## Example Prompts for User

```
Perform a comprehensive audit of all architecture elements.
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
- PLAYBOOK_02: Evaluate Alternatives (use for each element)
- PLAYBOOK_01: Document Current Architecture (use for missing/outdated elements)
- PLAYBOOK_06: Update Architecture (use for updates needed)

