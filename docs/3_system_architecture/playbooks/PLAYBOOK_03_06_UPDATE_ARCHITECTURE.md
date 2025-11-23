# Playbook 06: Update Architecture

## Purpose

This playbook provides step-by-step instructions for updating existing architecture documentation when architecture changes or code changes occur. Use this to maintain sync between documentation and implementation.

## When to Use This Playbook

- When architecture changes (new patterns, optimizations)
- When code changes (refactoring, bug fixes, new features)
- When architecture documentation is outdated
- During iterative design process
- After validation finds discrepancies

## Prerequisites

- Existing architecture document
- Understanding of what changed (architecture or code)
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
   - Architecture change (new patterns, optimizations)
   - Code change (implementation changed)
   - Both (architecture and code changed together)

2. Understand the scope:
   - What specific parts changed?
   - What stays the same?
   - What's the impact?

**Change analysis:**
```markdown
## Change Analysis

**Type**: Architecture Change | Code Change | Both
**Scope**: [What changed]
**Impact**: [What's affected]
**Rationale**: [Why changed]
```

### Step 2: Identify Affected Sections

**For architecture changes:**

1. **Update Data Flow:**
   - New data flow patterns
   - Modified data flow
   - Removed data flow patterns

2. **Update State Management:**
   - New state patterns
   - Modified state patterns
   - Removed state patterns

3. **Update Caching:**
   - New caching strategies
   - Modified caching strategies
   - Removed caching strategies

4. **Update Performance:**
   - New performance patterns
   - Modified performance patterns
   - Removed performance patterns

**For code changes:**

1. **Update Implementation:**
   - Architecture file locations
   - Pattern implementations
   - Code usage

2. **Update code references:**
   - File paths
   - Line numbers
   - Function/pattern names

3. **Update Architecture (if needed):**
   - Only if code change affects architecture definition

**Affected sections checklist:**
```
Affected Sections:
- [ ] Data Flow (if data flow changed)
- [ ] State Management (if state management changed)
- [ ] Caching (if caching changed)
- [ ] Performance (if performance patterns changed)
- [ ] Implementation (if code changed)
- [ ] Code References (if code changed)
- [ ] Validation Checklist (always update)
```

### Step 3: Update Architecture Document

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
   - Update function/pattern names

3. **Verify references:**
   - Check each reference exists
   - Verify code matches description
   - Fix any broken references

**Code reference update checklist:**
```
Code References:
- [ ] All file paths updated
- [ ] All line numbers updated
- [ ] All function/pattern names updated
- [ ] All references verified
- [ ] No broken references
```

### Step 5: Update Validation Checklist

**Always update validation checklist:**

1. **Add new validation items:**
   - If new patterns added
   - If new optimizations added
   - If new performance targets set

2. **Update existing items:**
   - If patterns changed
   - If implementation changed

3. **Remove obsolete items:**
   - If patterns removed
   - If optimizations removed

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

### Step 7: Update Architecture Status

**Update status based on change type:**

- **Architecture change (not yet implemented)**: `draft`
- **Code change (architecture updated to match)**: `current_implementation`
- **Both changed together**: `draft` or `implemented` (depending on state)

**Status update:**
```markdown
## Metadata

- **Status**: [new status]
- **Last Updated**: [current date]
- **Last Validated**: [if validated, update date]
- **Version**: [increment version]
```

### Step 8: Validate Updated Architecture

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
Architecture Update Validation:
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
# Architecture Update Summary

**Date**: [YYYY-MM-DD]
**Update Type**: Architecture Change | Code Change | Both
**Version**: [old version] → [new version]

## Changes Made

### Data Flow
- [Change 1]: [Description]
- [Change 2]: [Description]

### State Management
- [Change 1]: [Description]
- [Change 2]: [Description]

### Caching
- [Change 1]: [Description]
- [Change 2]: [Description]

### Performance
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

1. **Updated architecture document**
2. **Updated validation checklist**
3. **Update summary**
4. **Validation report** (if code exists, use PLAYBOOK_02)

## Quality Criteria

**Good architecture update:**
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

**For architecture change:**
```
Update the architecture to reflect new caching strategy.
Client-side request caching with 5-minute TTL.
Update the Caching section and code references.
```

**For code change:**
```
Update the architecture to reflect code changes in state management.
React context now used for global state.
Update State Management and code references.
```

## Next Steps

After updating:
1. **Validate architecture** → Use PLAYBOOK_02 (if code exists)
2. **Review changes** → Get stakeholder approval (if architecture change)
3. **Implement changes** → Use PLAYBOOK_05 (if architecture change not yet implemented)

---

**Related Playbooks:**
- PLAYBOOK_02: Evaluate Alternatives (use after updating)
- PLAYBOOK_05: Implement Optimization (use if architecture change needs implementation)
- PLAYBOOK_01: Document Current Architecture (for major updates that require new documentation)

