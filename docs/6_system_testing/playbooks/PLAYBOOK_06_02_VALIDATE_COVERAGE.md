# Playbook 02: Validate Coverage

## Purpose

This playbook provides step-by-step instructions for validating testing strategy documentation against coverage requirements and actual test implementation. Use this to check for sync issues, verify accuracy, and identify discrepancies between documented strategy and actual coverage.

## When to Use This Playbook

- After documenting testing strategy (PLAYBOOK_01)
- After code changes that might affect test coverage
- Before planning improvements (to establish baseline)
- Regular maintenance (monthly audits)
- When sync issues are suspected

## Prerequisites

- Testing strategy document exists
- Access to codebase
- Testing strategy document has code references
- Understanding of coverage requirements

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

### Step 1: Read Testing Strategy Document

**Your task:**
1. Read the complete testing strategy documentation
2. Extract all technical details:
   - Test types and patterns
   - Coverage goals
   - Test file locations
   - File paths and line numbers

**Create a checklist:**
```
Extracted from Testing Strategy:
- Test types: [list]
- Coverage goals: [list]
- Test patterns: [list]
- Test files: [list]
```

### Step 2: Validate Code References

**For each code reference in the strategy:**

1. **Check file exists:**
   - Use `read_file` to verify file exists
   - Check if line numbers are reasonable

2. **Verify code matches description:**
   - Read the referenced code
   - Compare to strategy description
   - Note any discrepancies

3. **Check for moved code:**
   - If file/line doesn't match, search for the code
   - Update reference if code moved

**Validation checklist:**
```
Code References:
- [ ] File exists
- [ ] Line numbers accurate
- [ ] Code matches description
- [ ] No moved/deleted code
```

### Step 3: Validate Test Coverage

**For each test type, check coverage:**

1. **Find coverage reports:**
   - Locate coverage report files
   - Find coverage configuration
   - Check coverage metrics

2. **Verify coverage matches goals:**
   - Compare actual coverage to documented goals
   - Check coverage by area
   - Identify coverage gaps

3. **Check coverage tracking:**
   - Verify coverage tools configured
   - Check coverage reports generated
   - Verify coverage thresholds set

**Validation checklist:**
```
Test Coverage:
- [ ] Coverage reports exist
- [ ] Coverage matches goals
- [ ] Coverage by area documented
- [ ] Coverage gaps identified
```

### Step 4: Validate Test Implementation

**For each test type, check implementation:**

1. **Find test files:**
   - Locate test files for each type
   - Find test configuration
   - Check test execution

2. **Verify tests match strategy:**
   - Do test patterns match documented patterns?
   - Do test tools match documented tools?
   - Do test approaches match documented approaches?

3. **Check test quality:**
   - Verify test maintainability
   - Check test patterns followed
   - Verify test best practices

**Validation checklist:**
```
Test Implementation:
- [ ] Test files exist
- [ ] Test patterns match strategy
- [ ] Test tools match strategy
- [ ] Test quality maintained
```

### Step 5: Validate Test Execution

**For each test type, check execution:**

1. **Find test commands:**
   - Locate test scripts
   - Find test configuration
   - Check test execution workflows

2. **Verify execution matches strategy:**
   - Do test commands match documented workflows?
   - Do test environments match documented environments?
   - Do test reports match documented reports?

3. **Check CI/CD integration:**
   - Verify CI/CD configuration
   - Check test automation
   - Verify test reporting

**Validation checklist:**
```
Test Execution:
- [ ] Test commands work
- [ ] Test execution matches strategy
- [ ] CI/CD integration configured
- [ ] Test reporting works
```

### Step 6: Validate Against Requirements

**For each test type, check requirements:**

1. **Find requirements:**
   - Locate testing requirements
   - Find coverage requirements
   - Check quality requirements

2. **Verify strategy meets requirements:**
   - Do coverage goals meet requirements?
   - Do test types meet requirements?
   - Do test patterns meet requirements?

3. **Check gaps:**
   - Identify missing test types
   - Identify coverage gaps
   - Identify quality gaps

**Validation checklist:**
```
Requirements:
- [ ] Coverage goals meet requirements
- [ ] Test types meet requirements
- [ ] Test patterns meet requirements
- [ ] No missing requirements
```

### Step 7: Generate Validation Report

**Create validation report:**

```markdown
# Testing Strategy Validation Report

**Date**: [YYYY-MM-DD]
**Validator**: AI Assistant
**Testing Strategy Version**: [version]

## Summary

- **Status**: [validated | discrepancies_found | needs_review]
- **Total Checks**: [number]
- **Passed**: [number]
- **Failed**: [number]
- **Warnings**: [number]

## Code References

### Validated ✅
- `file.test.ts:line` - [description] - ✅ Matches
- [list all validated references]

### Discrepancies ❌
- `file.test.ts:line` - [description] - ❌ [discrepancy details]
- [list all discrepancies]

## Test Coverage

### Validated ✅
- [Test Type] - ✅ Coverage: [actual]% / Goal: [goal]%
- [list validated test types]

### Discrepancies ❌
- [Test Type] - ❌ Coverage: [actual]% / Goal: [goal]% - [gap details]
- [list discrepancies]

## Test Implementation

### Validated ✅
- [Test Type] - ✅ Matches strategy
- [list validated test types]

### Discrepancies ❌
- [Test Type] - ❌ [discrepancy details]
- [list discrepancies]

## Test Execution

### Validated ✅
- [Test Type] - ✅ Execution matches strategy
- [list validated test types]

### Discrepancies ❌
- [Test Type] - ❌ [discrepancy details]
- [list discrepancies]

## Requirements

### Validated ✅
- [Requirement] - ✅ Met
- [list validated requirements]

### Discrepancies ❌
- [Requirement] - ❌ [discrepancy details]
- [list discrepancies]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps

- [ ] Update strategy with corrections
- [ ] Fix code discrepancies (if strategy is source of truth)
- [ ] Update code references if code moved
- [ ] Re-validate after fixes
```

### Step 8: Update Strategy Status

**Based on validation results:**

- **All validated** → Update status to `validated`
- **Discrepancies found** → Keep status as `current_implementation` or `draft`
- **Major discrepancies** → Mark for improvement

**Update strategy metadata:**
```markdown
- **Status**: validated | current_implementation | needs_improvement
- **Last Validated**: [YYYY-MM-DD]
```

## Output Deliverables

1. **Validation Report** (comprehensive document)
2. **Updated Strategy Status** (in main strategy document)

## Quality Criteria

**Good validation:**
- ✅ All code references checked
- ✅ All coverage validated
- ✅ All discrepancies documented
- ✅ Clear recommendations provided
- ✅ Actionable next steps

**Red flags:**
- ❌ Missing code references not checked
- ❌ Vague discrepancy descriptions
- ❌ No recommendations
- ❌ Unclear next steps

## Example Prompts for User

```
Validate the testing strategy documentation against coverage requirements.
Check all test types, coverage goals, and test implementation.
Verify coverage reports match documented goals,
and test patterns match documented strategy.
Generate a validation report.
```

## Next Steps

After validation:
1. **If validated** → Mark as `validated`, proceed to gap analysis if needed
2. **If discrepancies** → Use PLAYBOOK_06 to update strategy, or PLAYBOOK_04 to plan improvements
3. **If major issues** → Use PLAYBOOK_03 for gap analysis

---

**Related Playbooks:**
- PLAYBOOK_01: Document Strategy (use before this)
- PLAYBOOK_03: Gap Analysis (use if discrepancies found)
- PLAYBOOK_06: Update Strategy (use to fix discrepancies)

