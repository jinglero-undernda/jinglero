# Playbook 06: Update Contracts

## Purpose

This playbook provides step-by-step instructions for updating existing API contract documentation when contract changes or code changes occur. Use this to maintain sync between documentation and implementation.

## When to Use This Playbook

- When contract changes (new endpoints, format changes)
- When code changes (refactoring, bug fixes, new features)
- When contract documentation is outdated
- During iterative design process
- After validation finds discrepancies

## Prerequisites

- Existing API contract document
- Understanding of what changed (contract or code)
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
   - Contract change (new endpoints, format changes)
   - Code change (implementation changed)
   - Both (contract and code changed together)

2. Understand the scope:
   - What specific parts changed?
   - What stays the same?
   - What's the impact?

**Change analysis:**
```markdown
## Change Analysis

**Type**: Contract Change | Code Change | Both
**Scope**: [What changed]
**Impact**: [What's affected]
**Rationale**: [Why changed]
```

### Step 2: Identify Affected Sections

**For contract changes:**

1. **Update Endpoints:**
   - New endpoints
   - Modified endpoints
   - Removed endpoints

2. **Update Request/Response Formats:**
   - New formats
   - Modified formats
   - Removed formats

3. **Update Validation:**
   - New validation rules
   - Modified validation rules
   - Removed validation rules

**For code changes:**

1. **Update Implementation:**
   - API file locations
   - Route handler locations
   - Validation code locations

2. **Update code references:**
   - File paths
   - Line numbers
   - Function/endpoint names

3. **Update Contracts (if needed):**
   - Only if code change affects contract definition

**Affected sections checklist:**
```
Affected Sections:
- [ ] Endpoints (if endpoints changed)
- [ ] Request/Response Formats (if formats changed)
- [ ] Validation Rules (if validation changed)
- [ ] Implementation (if code changed)
- [ ] Code References (if code changed)
- [ ] Validation Checklist (always update)
```

### Step 3: Update Contract Document

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
   - Update function/endpoint names

3. **Verify references:**
   - Check each reference exists
   - Verify code matches description
   - Fix any broken references

**Code reference update checklist:**
```
Code References:
- [ ] All file paths updated
- [ ] All line numbers updated
- [ ] All function/endpoint names updated
- [ ] All references verified
- [ ] No broken references
```

### Step 5: Update Validation Checklist

**Always update validation checklist:**

1. **Add new validation items:**
   - If new endpoints added
   - If new formats added
   - If new validation rules added

2. **Update existing items:**
   - If endpoints changed
   - If formats changed
   - If validation changed

3. **Remove obsolete items:**
   - If endpoints removed
   - If formats removed
   - If validation removed

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

### Step 7: Update Contract Status

**Update status based on change type:**

- **Contract change (not yet implemented)**: `draft`
- **Code change (contract updated to match)**: `current_implementation`
- **Both changed together**: `draft` or `implemented` (depending on state)

**Status update:**
```markdown
## Metadata

- **Status**: [new status]
- **Last Updated**: [current date]
- **Last Validated**: [if validated, update date]
- **Version**: [increment version]
```

### Step 8: Validate Updated Contracts

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
Contract Update Validation:
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
# API Contract Update Summary

**Date**: [YYYY-MM-DD]
**Update Type**: Contract Change | Code Change | Both
**Version**: [old version] → [new version]

## Changes Made

### Endpoints
- [Change 1]: [Description]
- [Change 2]: [Description]

### Request/Response Formats
- [Change 1]: [Description]
- [Change 2]: [Description]

### Validation Rules
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

1. **Updated contract document**
2. **Updated validation checklist**
3. **Update summary**
4. **Validation report** (if code exists, use PLAYBOOK_02)

## Quality Criteria

**Good contract update:**
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

**For contract change:**
```
Update the API contracts to reflect new endpoint.
POST /api/admin/:type with new request body format.
Update the Endpoints section and code references.
```

**For code change:**
```
Update the API contracts to reflect code changes in public.ts.
The GET /api/public/entities/:type endpoint now supports filtering.
Update Endpoints and code references.
```

## Next Steps

After updating:
1. **Validate contracts** → Use PLAYBOOK_02 (if code exists)
2. **Review changes** → Get stakeholder approval (if contract change)
3. **Implement changes** → Use PLAYBOOK_05 (if contract change not yet implemented)

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Usage (use after updating)
- PLAYBOOK_05: Implement Versioning (use if contract change needs implementation)
- PLAYBOOK_01: Document Contracts (for major updates that require new documentation)

