# Playbook 06: Update Strategy

## Purpose

This playbook provides step-by-step instructions for updating existing testing strategy documentation when strategy changes or code changes occur. Use this to maintain sync between documentation and implementation.

## When to Use This Playbook

- When strategy changes (new test types, coverage goals, patterns)
- When code changes (new tests, test refactoring, coverage changes)
- When testing strategy documentation is outdated
- During iterative design process
- After validation finds discrepancies

## Prerequisites

- Existing testing strategy document
- Understanding of what changed (strategy or code)
- Access to codebase (if code changed)

## Instructions for AI Assistant

### Step 1: Understand the Change

**Your task:**
1. Determine what changed:
   - Strategy change (new test types, coverage goals, patterns)
   - Code change (test implementation changed)
   - Both (strategy and code changed together)

2. Understand the scope:
   - What specific parts changed?
   - What stays the same?
   - What's the impact?

**Change analysis:**
```markdown
## Change Analysis

**Type**: Strategy Change | Code Change | Both
**Scope**: [What changed]
**Impact**: [What's affected]
**Rationale**: [Why changed]
```

### Step 2: Identify Affected Sections

**For strategy changes:**

1. **Update Test Types:**
   - New test types
   - Modified test types
   - Removed test types

2. **Update Coverage Goals:**
   - New coverage goals
   - Modified coverage goals
   - Removed coverage goals

3. **Update Test Patterns:**
   - New test patterns
   - Modified test patterns
   - Removed test patterns

**For code changes:**

1. **Update Implementation:**
   - Test file locations
   - Test pattern implementations
   - Test code usage

2. **Update code references:**
   - File paths
   - Line numbers
   - Test/pattern names

3. **Update Strategy (if needed):**
   - Only if code change affects strategy definition

**Affected sections checklist:**
```
Affected Sections:
- [ ] Test Types (if test types changed)
- [ ] Coverage Goals (if coverage changed)
- [ ] Test Patterns (if patterns changed)
- [ ] Implementation (if code changed)
- [ ] Code References (if code changed)
- [ ] Validation Checklist (always update)
```

### Step 3: Update Strategy Document

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
   - Update test/pattern names

3. **Verify references:**
   - Check each reference exists
   - Verify code matches description
   - Fix any broken references

**Code reference update checklist:**
```
Code References:
- [ ] All file paths updated
- [ ] All line numbers updated
- [ ] All test/pattern names updated
- [ ] All references verified
- [ ] No broken references
```

### Step 5: Update Validation Checklist

**Always update validation checklist:**

1. **Add new validation items:**
   - If new test types added
   - If new patterns added
   - If new coverage goals set

2. **Update existing items:**
   - If test types changed
   - If patterns changed
   - If coverage goals changed

3. **Remove obsolete items:**
   - If test types removed
   - If patterns removed
   - If coverage goals removed

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

### Step 7: Update Strategy Status

**Update status based on change type:**

- **Strategy change (not yet implemented)**: `draft`
- **Code change (strategy updated to match)**: `current_implementation`
- **Both changed together**: `draft` or `implemented` (depending on state)

**Status update:**
```markdown
## Metadata

- **Status**: [new status]
- **Last Updated**: [current date]
- **Last Validated**: [if validated, update date]
- **Version**: [increment version]
```

### Step 8: Validate Updated Strategy

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
Strategy Update Validation:
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
# Testing Strategy Update Summary

**Date**: [YYYY-MM-DD]
**Update Type**: Strategy Change | Code Change | Both
**Version**: [old version] → [new version]

## Changes Made

### Test Types
- [Change 1]: [Description]
- [Change 2]: [Description]

### Coverage Goals
- [Change 1]: [Description]
- [Change 2]: [Description]

### Test Patterns
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

1. **Updated strategy document**
2. **Updated validation checklist**
3. **Update summary**
4. **Validation report** (if code exists, use PLAYBOOK_02)

## Quality Criteria

**Good strategy update:**
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

**For strategy change:**
```
Update the testing strategy to reflect new E2E test approach.
Use Playwright for browser testing,
target 80% coverage for critical user flows.
Update the Test Types section and code references.
```

**For code change:**
```
Update the testing strategy to reflect new test files.
Unit tests added for RelatedEntities component.
Update Test Types and code references.
```

## Next Steps

After updating:
1. **Validate strategy** → Use PLAYBOOK_02 (if code exists)
2. **Review changes** → Get stakeholder approval (if strategy change)
3. **Implement changes** → Use PLAYBOOK_05 (if strategy change not yet implemented)

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Coverage (use after updating)
- PLAYBOOK_05: Implement Tests (use if strategy change needs implementation)
- PLAYBOOK_01: Document Strategy (for major updates that require new documentation)

