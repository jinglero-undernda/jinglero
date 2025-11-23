# Playbook 07: Testing Audit

## Purpose

This playbook provides step-by-step instructions for auditing all testing elements to check for accuracy, drift, and maintenance needs. Use this for regular maintenance and comprehensive reviews.

## When to Use This Playbook

- Monthly maintenance audits
- Quarterly comprehensive reviews
- Before major releases
- When sync issues are suspected across multiple elements
- After significant codebase changes

## Prerequisites

- All testing strategy documents exist
- Access to codebase
- Understanding of all testing elements

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

### Step 1: Inventory All Testing Elements

**Your task:**
1. List all testing strategy documents
2. Read testing metadata
3. Check element status
4. Identify last validation date

**Create testing inventory:**
```markdown
## Testing Inventory

| Category | Element | Status | Last Updated | Last Validated | Version |
|----------|---------|--------|--------------|----------------|---------|
| Test Types | Unit Tests | [Status] | [Date] | [Date] | [Version] |
| Test Types | Integration Tests | [Status] | [Date] | [Date] | [Version] |
| Coverage | Unit Coverage | [Status] | [Date] | [Date] | [Version] |
```

### Step 2: Check Testing Health

**For each testing element, check:**

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
Testing Health:
- [ ] Documentation complete
- [ ] Code references present
- [ ] Recently validated (< 3 months)
- [ ] Status appropriate
- [ ] No known discrepancies
```

### Step 3: Validate All Elements

**For each testing element:**

1. **Run validation** (use PLAYBOOK_02):
   - Check code references
   - Verify test patterns
   - Verify coverage goals
   - Verify test quality

2. **Document results:**
   - Note discrepancies
   - Note missing references
   - Note outdated information

**Validation summary:**
```markdown
## Validation Summary

### Unit Tests
- **Status**: Validated | Discrepancies Found | Needs Review
- **Issues**: [List issues]
- **Priority**: [Priority if issues found]

### Coverage Goals
- **Status**: Validated | Discrepancies Found | Needs Review
- **Issues**: [List issues]
- **Priority**: [Priority if issues found]
```

### Step 4: Check for Drift

**Identify elements with drift:**

1. **Code Drift:**
   - Code changed but strategy not updated
   - Code references broken
   - Implementation differs from documentation

2. **Strategy Drift:**
   - Strategy updated but code not updated
   - New test types not implemented
   - Removed test types still in code

3. **Documentation Drift:**
   - Strategy updated but documentation not updated
   - Aspirational documentation not implemented

**Drift analysis:**
```markdown
## Drift Analysis

### Code Drift (Code changed, docs not updated)
- Element: [Description of drift]

### Strategy Drift (Strategy changed, code not updated)
- Element: [Description of drift]

### Documentation Drift (Docs changed, strategy not updated)
- Element: [Description of drift]
```

### Step 5: Check Dependencies

**Check testing dependencies:**

1. **Element Dependencies:**
   - Which elements depend on others?
   - Are dependencies documented?
   - Are dependencies still valid?

2. **Code Dependencies:**
   - Which code depends on testing?
   - Are code references to testing accurate?
   - Are testing elements referenced in code comments?

**Dependency check:**
```markdown
## Dependency Analysis

### Element Dependencies
- Integration Tests depend on: [List]
- E2E Tests depend on: [List]

### Code Dependencies
- Unit Tests referenced in: [List files]
- Coverage goals referenced in: [List files]
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
   - Improvement opportunities
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
# Testing Strategy Audit Report

**Date**: [YYYY-MM-DD]
**Auditor**: AI Assistant
**Scope**: All testing elements

## Executive Summary

- **Total Elements**: [number]
- **Validated**: [number]
- **Discrepancies Found**: [number]
- **Needs Update**: [number]
- **Deprecated**: [number]

## Testing Health Summary

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

### Unit Tests

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

### Strategy Drift
[Summary of strategy drift issues]

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
- **Type**: Update | Validate | Improve
- **Description**: [Description]
- **Effort**: [Small | Medium | Large]

[Repeat for each task]
```

## Output Deliverables

1. **Testing Inventory** (list of all elements)
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
Perform a comprehensive audit of all testing elements.
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
- PLAYBOOK_02: Validate Coverage (use for each element)
- PLAYBOOK_01: Document Strategy (use for missing/outdated elements)
- PLAYBOOK_06: Update Strategy (use for updates needed)

