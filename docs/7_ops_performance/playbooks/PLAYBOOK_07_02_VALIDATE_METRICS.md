# Playbook 02: Validate Metrics

## Purpose

This playbook provides step-by-step instructions for validating performance target documentation against actual metrics and monitoring implementation. Use this to check for sync issues, verify accuracy, and identify discrepancies between documented targets and actual performance.

## When to Use This Playbook

- After documenting performance targets (PLAYBOOK_01)
- After code changes that might affect performance
- Before planning optimizations (to establish baseline)
- Regular maintenance (monthly audits)
- When sync issues are suspected

## Prerequisites

- Performance target document exists
- Access to codebase
- Performance target document has code references
- Understanding of monitoring implementation

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

### Step 1: Read Performance Target Document

**Your task:**
1. Read the complete performance target documentation
2. Extract all technical details:
   - Performance targets
   - Target values
   - Measurement methods
   - File paths and line numbers

**Create a checklist:**
```
Extracted from Performance Targets:
- Targets: [list]
- Target values: [list]
- Measurement methods: [list]
- Monitoring: [list]
```

### Step 2: Validate Code References

**For each code reference in the targets:**

1. **Check file exists:**
   - Use `read_file` to verify file exists
   - Check if line numbers are reasonable

2. **Verify code matches description:**
   - Read the referenced code
   - Compare to target description
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

### Step 3: Validate Performance Metrics

**For each target, check metrics:**

1. **Find metric collection:**
   - Locate metric collection code
   - Find monitoring implementation
   - Check metric storage

2. **Verify metrics match targets:**
   - Compare actual metrics to target values
   - Check measurement methods match
   - Verify metric definitions match

3. **Check metric tracking:**
   - Verify metrics are tracked
   - Check metric collection works
   - Verify metric reporting works

**Validation checklist:**
```
Performance Metrics:
- [ ] Metrics are collected
- [ ] Metrics match target definitions
- [ ] Measurement methods match
- [ ] Metric tracking works
```

### Step 4: Validate Monitoring Implementation

**For each target, check monitoring:**

1. **Find monitoring code:**
   - Locate monitoring implementation
   - Find alerting configuration
   - Check dashboard configuration

2. **Verify monitoring matches targets:**
   - Do monitoring tools match documented tools?
   - Do alerting rules match documented rules?
   - Do dashboards match documented dashboards?

3. **Check monitoring functionality:**
   - Verify monitoring works
   - Check alerting works
   - Verify dashboards work

**Validation checklist:**
```
Monitoring Implementation:
- [ ] Monitoring tools implemented
- [ ] Alerting rules configured
- [ ] Dashboards configured
- [ ] Monitoring works correctly
```

### Step 5: Validate Target Achievement

**For each target, check achievement:**

1. **Find performance measurements:**
   - Locate performance test results
   - Find performance benchmarks
   - Check performance reports

2. **Verify targets are met:**
   - Compare actual performance to targets
   - Check if targets are achievable
   - Identify targets not met

3. **Check target validation:**
   - Verify targets are validated
   - Check validation methods work
   - Verify validation results

**Validation checklist:**
```
Target Achievement:
- [ ] Targets are measurable
- [ ] Performance measurements exist
- [ ] Targets are validated
- [ ] Validation methods work
```

### Step 6: Validate Against Requirements

**For each target, check requirements:**

1. **Find requirements:**
   - Locate performance requirements
   - Find user requirements
   - Check business requirements

2. **Verify targets meet requirements:**
   - Do targets meet user requirements?
   - Do targets meet business requirements?
   - Are there missing requirements?

3. **Check gaps:**
   - Identify missing targets
   - Identify targets not meeting requirements
   - Identify requirements not covered

**Validation checklist:**
```
Requirements:
- [ ] Targets meet user requirements
- [ ] Targets meet business requirements
- [ ] No missing requirements
```

### Step 7: Generate Validation Report

**Create validation report:**

```markdown
# Performance Target Validation Report

**Date**: [YYYY-MM-DD]
**Validator**: AI Assistant
**Performance Target Version**: [version]

## Summary

- **Status**: [validated | discrepancies_found | needs_review]
- **Total Checks**: [number]
- **Passed**: [number]
- **Failed**: [number]
- **Warnings**: [number]

## Code References

### Validated ✅
- `file.ts:line` - [description] - ✅ Matches
- [list all validated references]

### Discrepancies ❌
- `file.ts:line` - [description] - ❌ [discrepancy details]
- [list all discrepancies]

## Performance Metrics

### Validated ✅
- [Target] - ✅ Metrics: [actual] / Target: [target] - ✅ Met
- [list validated targets]

### Discrepancies ❌
- [Target] - ❌ Metrics: [actual] / Target: [target] - ❌ [gap details]
- [list discrepancies]

## Monitoring Implementation

### Validated ✅
- [Target] - ✅ Monitoring implemented
- [list validated targets]

### Discrepancies ❌
- [Target] - ❌ [discrepancy details]
- [list discrepancies]

## Target Achievement

### Validated ✅
- [Target] - ✅ Target met
- [list validated targets]

### Discrepancies ❌
- [Target] - ❌ Target not met - [gap details]
- [list discrepancies]

## Requirements

### Validated ✅
- [Requirement] - ✅ Met by targets
- [list validated requirements]

### Discrepancies ❌
- [Requirement] - ❌ [discrepancy details]
- [list discrepancies]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps

- [ ] Update targets with corrections
- [ ] Fix code discrepancies (if target is source of truth)
- [ ] Update code references if code moved
- [ ] Re-validate after fixes
```

### Step 8: Update Target Status

**Based on validation results:**

- **All validated** → Update status to `validated`
- **Discrepancies found** → Keep status as `current_implementation` or `draft`
- **Major discrepancies** → Mark for optimization

**Update target metadata:**
```markdown
- **Status**: validated | current_implementation | needs_optimization
- **Last Validated**: [YYYY-MM-DD]
```

## Output Deliverables

1. **Validation Report** (comprehensive document)
2. **Updated Target Status** (in main target document)

## Quality Criteria

**Good validation:**
- ✅ All code references checked
- ✅ All metrics validated
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
Validate the performance target documentation against actual metrics.
Check all targets, metrics, and monitoring implementation.
Verify metrics match targets,
and monitoring matches documented strategy.
Generate a validation report.
```

## Next Steps

After validation:
1. **If validated** → Mark as `validated`, proceed to gap analysis if needed
2. **If discrepancies** → Use PLAYBOOK_06 to update targets, or PLAYBOOK_04 to plan optimization
3. **If major issues** → Use PLAYBOOK_03 for gap analysis

---

**Related Playbooks:**
- PLAYBOOK_01: Document Targets (use before this)
- PLAYBOOK_03: Gap Analysis (use if discrepancies found)
- PLAYBOOK_06: Update Targets (use to fix discrepancies)

