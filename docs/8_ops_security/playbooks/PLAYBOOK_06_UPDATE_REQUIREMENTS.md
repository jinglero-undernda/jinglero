# Playbook 06: Update Requirements

## Purpose

This playbook provides step-by-step instructions for updating existing security requirement documentation when requirement changes or code changes occur. Use this to maintain sync between documentation and implementation.

## When to Use This Playbook

- When requirement changes (new requirements, requirement updates)
- When code changes (security improvements, security changes)
- When security requirement documentation is outdated
- During iterative design process
- After validation finds discrepancies

## Prerequisites

- Existing security requirement document
- Understanding of what changed (requirement or code)
- Access to codebase (if code changed)

## Instructions for AI Assistant

### Step 1: Understand the Change

**Your task:**
1. Determine what changed:
   - Requirement change (new requirements, requirement updates)
   - Code change (security implementation changed)
   - Both (requirement and code changed together)

2. Understand the scope:
   - What specific parts changed?
   - What stays the same?
   - What's the impact?

**Change analysis:**
```markdown
## Change Analysis

**Type**: Requirement Change | Code Change | Both
**Scope**: [What changed]
**Impact**: [What's affected]
**Rationale**: [Why changed]
```

### Step 2: Identify Affected Sections

**For requirement changes:**

1. **Update Security Requirements:**
   - New requirements
   - Modified requirements
   - Removed requirements

2. **Update Authentication:**
   - New authentication methods
   - Modified authentication methods
   - Removed authentication methods

3. **Update Authorization:**
   - New authorization rules
   - Modified authorization rules
   - Removed authorization rules

**For code changes:**

1. **Update Implementation:**
   - Security code locations
   - Authentication code locations
   - Authorization code locations

2. **Update code references:**
   - File paths
   - Line numbers
   - Function/class names

3. **Update Requirements (if needed):**
   - Only if code change affects requirement definition

**Affected sections checklist:**
```
Affected Sections:
- [ ] Security Requirements (if requirements changed)
- [ ] Authentication (if authentication changed)
- [ ] Authorization (if authorization changed)
- [ ] Data Protection (if data protection changed)
- [ ] Implementation (if code changed)
- [ ] Code References (if code changed)
- [ ] Validation Checklist (always update)
```

### Step 3: Update Requirement Document

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
   - Update function/class names

3. **Verify references:**
   - Check each reference exists
   - Verify code matches description
   - Fix any broken references

**Code reference update checklist:**
```
Code References:
- [ ] All file paths updated
- [ ] All line numbers updated
- [ ] All function/class names updated
- [ ] All references verified
- [ ] No broken references
```

### Step 5: Update Validation Checklist

**Always update validation checklist:**

1. **Add new validation items:**
   - If new requirements added
   - If new authentication methods added
   - If new authorization rules added

2. **Update existing items:**
   - If requirements changed
   - If authentication changed
   - If authorization changed

3. **Remove obsolete items:**
   - If requirements removed
   - If authentication methods removed
   - If authorization rules removed

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

### Step 7: Update Requirement Status

**Update status based on change type:**

- **Requirement change (not yet implemented)**: `draft`
- **Code change (requirement updated to match)**: `current_implementation`
- **Both changed together**: `draft` or `implemented` (depending on state)

**Status update:**
```markdown
## Metadata

- **Status**: [new status]
- **Last Updated**: [current date]
- **Last Validated**: [if validated, update date]
- **Version**: [increment version]
```

### Step 8: Validate Updated Requirements

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
Requirement Update Validation:
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
# Security Requirement Update Summary

**Date**: [YYYY-MM-DD]
**Update Type**: Requirement Change | Code Change | Both
**Version**: [old version] → [new version]

## Changes Made

### Security Requirements
- [Change 1]: [Description]
- [Change 2]: [Description]

### Authentication
- [Change 1]: [Description]
- [Change 2]: [Description]

### Authorization
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

1. **Updated requirement document**
2. **Updated validation checklist**
3. **Update summary**
4. **Validation report** (if code exists, use PLAYBOOK_02)

## Quality Criteria

**Good requirement update:**
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

**For requirement change:**
```
Update the security requirements to reflect new authentication method.
Use OAuth 2.0 for user authentication.
Update the Authentication section and code references.
```

**For code change:**
```
Update the security requirements to reflect code changes in authorization.
Role-based authorization now implemented.
Update Authorization and code references.
```

## Next Steps

After updating:
1. **Validate requirements** → Use PLAYBOOK_02 (if code exists)
2. **Review changes** → Get stakeholder approval (if requirement change)
3. **Implement changes** → Use PLAYBOOK_05 (if requirement change not yet implemented)

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Implementation (use after updating)
- PLAYBOOK_05: Implement Security (use if requirement change needs implementation)
- PLAYBOOK_01: Document Requirements (for major updates that require new documentation)

