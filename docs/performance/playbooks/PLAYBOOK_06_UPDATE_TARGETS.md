# Playbook 06: Update Targets

## Purpose

This playbook provides step-by-step instructions for updating existing performance target documentation when target changes or code changes occur. Use this to maintain sync between documentation and implementation.

## When to Use This Playbook

- When target changes (new targets, target value changes)
- When code changes (performance improvements, monitoring changes)
- When performance target documentation is outdated
- During iterative design process
- After validation finds discrepancies

## Prerequisites

- Existing performance target document
- Understanding of what changed (target or code)
- Access to codebase (if code changed)

## Instructions for AI Assistant

### Step 1: Understand the Change

**Your task:**
1. Determine what changed:
   - Target change (new targets, target value changes)
   - Code change (performance implementation changed)
   - Both (target and code changed together)

2. Understand the scope:
   - What specific parts changed?
   - What stays the same?
   - What's the impact?

**Change analysis:**
```markdown
## Change Analysis

**Type**: Target Change | Code Change | Both
**Scope**: [What changed]
**Impact**: [What's affected]
**Rationale**: [Why changed]
```

### Step 2: Identify Affected Sections

**For target changes:**

1. **Update Performance Targets:**
   - New targets
   - Modified target values
   - Removed targets

2. **Update Metrics:**
   - New metrics
   - Modified metric definitions
   - Removed metrics

3. **Update Monitoring:**
   - New monitoring requirements
   - Modified monitoring strategies
   - Removed monitoring

**For code changes:**

1. **Update Implementation:**
   - Monitoring code locations
   - Metric collection locations
   - Performance code locations

2. **Update code references:**
   - File paths
   - Line numbers
   - Function/metric names

3. **Update Targets (if needed):**
   - Only if code change affects target definition

**Affected sections checklist:**
```
Affected Sections:
- [ ] Performance Targets (if targets changed)
- [ ] Metrics (if metrics changed)
- [ ] Monitoring (if monitoring changed)
- [ ] Implementation (if code changed)
- [ ] Code References (if code changed)
- [ ] Validation Checklist (always update)
```

### Step 3: Update Target Document

**For each affected section:**

1. **Read current content:**
   - Understand what's documented
   - Identify what needs to change

2. **Update content:**
   - Make changes to match new state
   - Maintain consistency with other sections
   - Keep code references accurate

3. **Verify cross-references:**
   - Check references to other sections
   - Update if needed
   - Maintain consistency

**Update template:**
```markdown
## [Section Name]

### Before (if documenting change):
[Old content]

### After:
[New content]

### Rationale:
[Why changed]
```

### Step 4: Update Code References

**If code changed:**

1. **Find new code locations:**
   - Search for moved code
   - Find new file paths
   - Get new line numbers

2. **Update all references:**
   - Update file paths
   - Update line numbers
   - Update function/metric names

3. **Verify references:**
   - Check each reference exists
   - Verify code matches description
   - Fix any broken references

**Code reference update checklist:**
```
Code References:
- [ ] All file paths updated
- [ ] All line numbers updated
- [ ] All function/metric names updated
- [ ] All references verified
- [ ] No broken references
```

### Step 5: Update Validation Checklist

**Always update validation checklist:**

1. **Add new validation items:**
   - If new targets added
   - If new metrics added
   - If new monitoring added

2. **Update existing items:**
   - If targets changed
   - If metrics changed
   - If monitoring changed

3. **Remove obsolete items:**
   - If targets removed
   - If metrics removed
   - If monitoring removed

**Validation checklist update:**
```markdown
## Validation Checklist Updates

### Added:
- [ ] New validation item 1
- [ ] New validation item 2

### Updated:
- [ ] Updated validation item 1
- [ ] Updated validation item 2

### Removed:
- [ ] Obsolete validation item 1
```

### Step 6: Update Change History

**Document the change:**

```markdown
## Change History

| Version | Date       | Change                      | Author | Rationale      |
| ------- | ---------- | --------------------------- | ------ | -------------- |
| 1.1     | YYYY-MM-DD | [Change description]        | -      | [Rationale]    |
```

**Change description should include:**
- What changed (brief)
- Why changed (rationale)
- Impact (what's affected)

### Step 7: Update Target Status

**Update status based on change type:**

- **Target change (not yet implemented)**: `draft`
- **Code change (target updated to match)**: `current_implementation`
- **Both changed together**: `draft` or `implemented` (depending on state)

**Status update:**
```markdown
## Metadata

- **Status**: [new status]
- **Last Updated**: [current date]
- **Last Validated**: [if validated, update date]
- **Version**: [increment version]
```

### Step 8: Validate Updated Targets

**After updating, validate:**

1. **Internal consistency:**
   - All sections consistent
   - Cross-references accurate
   - No contradictions

2. **Code consistency (if code exists):**
   - Use PLAYBOOK_02 to validate
   - Check all references
   - Verify implementation matches

**Validation checklist:**
```
Target Update Validation:
- [ ] All sections updated
- [ ] Cross-references accurate
- [ ] Code references accurate (if code exists)
- [ ] No contradictions
- [ ] Change history updated
- [ ] Status updated
```

### Step 9: Create Update Summary

**Document what was updated:**

```markdown
# Performance Target Update Summary

**Date**: [YYYY-MM-DD]
**Update Type**: Target Change | Code Change | Both
**Version**: [old version] → [new version]

## Changes Made

### Performance Targets
- [Change 1]: [Description]
- [Change 2]: [Description]

### Metrics
- [Change 1]: [Description]
- [Change 2]: [Description]

### Monitoring
- [Change 1]: [Description]
- [Change 2]: [Description]

### Implementation
- [Change 1]: [Description]
- [Change 2]: [Description]

### Code References
- [Change 1]: [Description]
- [Change 2]: [Description]

## Rationale

[Why these changes were made]

## Impact

- **Affected Sections**: [List]
- **Breaking Changes**: [Yes/No - if yes, describe]
- **Migration Needed**: [Yes/No - if yes, describe]

## Next Steps

- [ ] [Next action]
- [ ] [Next action]
```

## Output Deliverables

1. **Updated target document**
2. **Updated validation checklist**
3. **Update summary**
4. **Validation report** (if code exists, use PLAYBOOK_02)

## Quality Criteria

**Good target update:**
- ✅ All affected sections updated
- ✅ Code references accurate
- ✅ Change history documented
- ✅ Status updated
- ✅ No contradictions

**Red flags:**
- ❌ Incomplete updates
- ❌ Broken code references
- ❌ Missing change history
- ❌ Contradictions between sections
- ❌ Status not updated

## Example Prompts for User

**For target change:**
```
Update the performance targets to reflect new API response time target.
Target: API response time < 200ms for 95th percentile.
Update the Performance Targets section and code references.
```

**For code change:**
```
Update the performance targets to reflect code changes in monitoring.
API response time monitoring now implemented.
Update Monitoring and code references.
```

## Next Steps

After updating:
1. **Validate targets** → Use PLAYBOOK_02 (if code exists)
2. **Review changes** → Get stakeholder approval (if target change)
3. **Implement changes** → Use PLAYBOOK_05 (if target change not yet implemented)

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Metrics (use after updating)
- PLAYBOOK_05: Implement Monitoring (use if target change needs implementation)
- PLAYBOOK_01: Document Targets (for major updates that require new documentation)

