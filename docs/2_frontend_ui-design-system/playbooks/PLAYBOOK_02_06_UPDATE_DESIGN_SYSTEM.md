# Playbook 06: Update Design System

## Purpose

This playbook provides step-by-step instructions for updating existing design system documentation when design changes or code changes occur. Use this to maintain sync between documentation and implementation.

## When to Use This Playbook

- When design changes (new design specifications)
- When code changes (refactoring, bug fixes, new features)
- When design system documentation is outdated
- During iterative design process
- After validation finds discrepancies

## Prerequisites

- Existing design system document
- Understanding of what changed (design or code)
- Access to codebase (if code changed)

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

### Step 1: Understand the Change

**Your task:**
1. Determine what changed:
   - Design change (new design specifications)
   - Code change (implementation changed)
   - Both (design and code changed together)

2. Understand the scope:
   - What specific parts changed?
   - What stays the same?
   - What's the impact?

**Change analysis:**
```markdown
## Change Analysis

**Type**: Design Change | Code Change | Both
**Scope**: [What changed]
**Impact**: [What's affected]
**Rationale**: [Why changed]
```

### Step 2: Identify Affected Sections

**For design changes:**

1. **Update Design Intent section:**
   - Design goals
   - Visual specifications
   - Usage guidelines

2. **Update Token Values:**
   - Color values
   - Typography values
   - Spacing values

3. **Update Component Specifications:**
   - Component styles
   - Component variants
   - Component states

**For code changes:**

1. **Update Implementation section:**
   - CSS file locations
   - Token values
   - Component styles

2. **Update code references:**
   - File paths
   - Line numbers
   - CSS variable names

3. **Update Design Intent (if needed):**
   - Only if code change affects design intent

**Affected sections checklist:**
```
Affected Sections:
- [ ] Design Intent (if design changed)
- [ ] Token Values (if tokens changed)
- [ ] Component Specifications (if components changed)
- [ ] Implementation (if code changed)
- [ ] Code References (if code changed)
- [ ] Validation Checklist (always update)
```

### Step 3: Update Design System Document

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
   - Update CSS variable names

3. **Verify references:**
   - Check each reference exists
   - Verify code matches description
   - Fix any broken references

**Code reference update checklist:**
```
Code References:
- [ ] All file paths updated
- [ ] All line numbers updated
- [ ] All CSS variable names updated
- [ ] All references verified
- [ ] No broken references
```

### Step 5: Update Validation Checklist

**Always update validation checklist:**

1. **Add new validation items:**
   - If new tokens added
   - If new components added
   - If new patterns added

2. **Update existing items:**
   - If values changed
   - If implementation changed

3. **Remove obsolete items:**
   - If tokens removed
   - If components removed

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

### Step 7: Update Design System Status

**Update status based on change type:**

- **Design change (not yet implemented)**: `draft`
- **Code change (design system updated to match)**: `current_implementation`
- **Both changed together**: `draft` or `implemented` (depending on state)

**Status update:**
```markdown
## Metadata

- **Status**: [new status]
- **Last Updated**: [current date]
- **Last Validated**: [if validated, update date]
- **Version**: [increment version]
```

### Step 8: Validate Updated Design System

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
Design System Update Validation:
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
# Design System Update Summary

**Date**: [YYYY-MM-DD]
**Update Type**: Design Change | Code Change | Both
**Version**: [old version] → [new version]

## Changes Made

### Design Tokens
- [Change 1]: [Description]
- [Change 2]: [Description]

### Component Specifications
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

1. **Updated design system document**
2. **Updated validation checklist**
3. **Update summary**
4. **Validation report** (if code exists, use PLAYBOOK_02)

## Quality Criteria

**Good design system update:**
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

**For design change:**
```
Update the design system to reflect new color palette.
Primary color changed to #1a73e8, secondary to #5f6368.
Update the Design Tokens section and code references.
```

**For code change:**
```
Update the design system to reflect code changes in variables.css.
The spacing scale was refactored to use rem units instead of px.
Update Implementation and code references.
```

## Next Steps

After updating:
1. **Validate design system** → Use PLAYBOOK_02 (if code exists)
2. **Review changes** → Get stakeholder approval (if design change)
3. **Implement changes** → Use PLAYBOOK_05 (if design change not yet implemented)

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Implementation (use after updating)
- PLAYBOOK_05: Implement Refactor (use if design change needs implementation)
- PLAYBOOK_01: Document Design Intent (for major updates that require new documentation)

