# Playbook 06: Update Workflow

## Purpose

This playbook provides step-by-step instructions for updating existing workflow documentation when UX changes or code changes occur. Use this to maintain sync between documentation and implementation.

## When to Use This Playbook

- When UX changes (user requests new behavior)
- When code changes (refactoring, bug fixes, new features)
- When workflow documentation is outdated
- During iterative design process
- After validation finds discrepancies

## Prerequisites

- Existing workflow document
- Understanding of what changed (UX or code)
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
   - UX change (user wants different behavior)
   - Code change (implementation changed)
   - Both (UX and code changed together)

2. Understand the scope:
   - What specific parts changed?
   - What stays the same?
   - What's the impact?

**Change analysis:**
```markdown
## Change Analysis

**Type**: UX Change | Code Change | Both
**Scope**: [What changed]
**Impact**: [What's affected]
**Rationale**: [Why changed]
```

### Step 2: Identify Affected Sections

**For UX changes:**

1. **Update UX Flow section:**
   - User actions
   - System responses
   - Flow steps

2. **Update UI State section:**
   - Visual states
   - State variables (if UX change affects state)

3. **Update Technical Implementation:**
   - Only if UX change requires technical changes

**For code changes:**

1. **Update Technical Implementation:**
   - API endpoints
   - State management
   - Component behavior

2. **Update code references:**
   - File paths
   - Line numbers
   - Function names

3. **Update UX Flow (if needed):**
   - Only if code change affects user experience

**Affected sections checklist:**
```
Affected Sections:
- [ ] User Intent (rarely changes)
- [ ] UX Flow (if UX changed)
- [ ] UI State (if UX/UI changed)
- [ ] Technical Implementation (if code changed)
- [ ] Code References (if code changed)
- [ ] Validation Checklist (always update)
```

### Step 3: Update Workflow Document

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
   - Update function/component names

3. **Verify references:**
   - Check each reference exists
   - Verify code matches description
   - Fix any broken references

**Code reference update checklist:**
```
Code References:
- [ ] All file paths updated
- [ ] All line numbers updated
- [ ] All function names updated
- [ ] All references verified
- [ ] No broken references
```

### Step 5: Update Validation Checklist

**Always update validation checklist:**

1. **Add new validation items:**
   - If new features added
   - If new states added
   - If new API calls added

2. **Update existing items:**
   - If behavior changed
   - If implementation changed

3. **Remove obsolete items:**
   - If features removed
   - If states removed

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

### Step 7: Update Workflow Status

**Update status based on change type:**

- **UX change (not yet implemented)**: `draft`
- **Code change (workflow updated to match)**: `current_implementation`
- **Both changed together**: `draft` or `implemented` (depending on state)

**Status update:**
```markdown
## Metadata

- **Status**: [new status]
- **Last Updated**: [current date]
- **Last Validated**: [if validated, update date]
- **Version**: [increment version]
```

### Step 8: Validate Updated Workflow

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
Workflow Update Validation:
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
# Workflow Update Summary: WORKFLOW_XXX

**Date**: [YYYY-MM-DD]
**Update Type**: UX Change | Code Change | Both
**Version**: [old version] → [new version]

## Changes Made

### UX Flow
- [Change 1]: [Description]
- [Change 2]: [Description]

### UI State
- [Change 1]: [Description]
- [Change 2]: [Description]

### Technical Implementation
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

1. **Updated workflow document**
2. **Updated validation checklist**
3. **Update summary**
4. **Validation report** (if code exists, use PLAYBOOK_02)

## Quality Criteria

**Good workflow update:**
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

**For UX change:**
```
Update WORKFLOW_001 to reflect new UX: auto-save on blur instead of manual save.
Update the UX Flow and UI State sections, and update Technical Implementation if needed.
```

**For code change:**
```
Update WORKFLOW_001 to reflect code changes in AdminEntityAnalyze.tsx.
The state management was refactored to use useReducer instead of useState.
Update Technical Implementation and code references.
```

## Next Steps

After updating:
1. **Validate workflow** → Use PLAYBOOK_02 (if code exists)
2. **Review changes** → Get stakeholder approval (if UX change)
3. **Implement changes** → Use PLAYBOOK_05 (if UX change not yet implemented)

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Workflow (use after updating)
- PLAYBOOK_05: Implement Refactor (use if UX change needs implementation)
- PLAYBOOK_01: Document Workflow (for major updates that require new workflow)

