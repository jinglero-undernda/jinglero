# Playbook 06: Update Schema

## Purpose

This playbook provides step-by-step instructions for updating existing schema documentation when schema changes or code changes occur. Use this to maintain sync between documentation and implementation.

## When to Use This Playbook

- When schema changes (new node types, relationships, properties)
- When code changes (refactoring, bug fixes, new features)
- When schema documentation is outdated
- During iterative design process
- After validation finds discrepancies

## Prerequisites

- Existing schema document
- Understanding of what changed (schema or code)
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
   - Schema change (new node types, relationships, properties)
   - Code change (implementation changed)
   - Both (schema and code changed together)

2. Understand the scope:
   - What specific parts changed?
   - What stays the same?
   - What's the impact?

**Change analysis:**
```markdown
## Change Analysis

**Type**: Schema Change | Code Change | Both
**Scope**: [What changed]
**Impact**: [What's affected]
**Rationale**: [Why changed]
```

### Step 2: Identify Affected Sections

**For schema changes:**

1. **Update Node Types:**
   - New node types
   - Modified node properties
   - Removed node types

2. **Update Relationship Types:**
   - New relationship types
   - Modified relationship properties
   - Removed relationship types

3. **Update Properties:**
   - New properties
   - Modified property types
   - Removed properties

**For code changes:**

1. **Update Implementation:**
   - Schema file locations
   - Type definitions
   - API usage

2. **Update code references:**
   - File paths
   - Line numbers
   - Function names

3. **Update Schema (if needed):**
   - Only if code change affects schema definition

**Affected sections checklist:**
```
Affected Sections:
- [ ] Node Types (if nodes changed)
- [ ] Relationship Types (if relationships changed)
- [ ] Properties (if properties changed)
- [ ] Implementation (if code changed)
- [ ] Code References (if code changed)
- [ ] Validation Checklist (always update)
```

### Step 3: Update Schema Document

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
   - Update function/type names

3. **Verify references:**
   - Check each reference exists
   - Verify code matches description
   - Fix any broken references

**Code reference update checklist:**
```
Code References:
- [ ] All file paths updated
- [ ] All line numbers updated
- [ ] All function/type names updated
- [ ] All references verified
- [ ] No broken references
```

### Step 5: Update Validation Checklist

**Always update validation checklist:**

1. **Add new validation items:**
   - If new node types added
   - If new relationships added
   - If new properties added

2. **Update existing items:**
   - If definitions changed
   - If implementation changed

3. **Remove obsolete items:**
   - If node types removed
   - If relationships removed
   - If properties removed

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

### Step 7: Update Schema Status

**Update status based on change type:**

- **Schema change (not yet implemented)**: `draft`
- **Code change (schema updated to match)**: `current_implementation`
- **Both changed together**: `draft` or `implemented` (depending on state)

**Status update:**
```markdown
## Metadata

- **Status**: [new status]
- **Last Updated**: [current date]
- **Last Validated**: [if validated, update date]
- **Version**: [increment version]
```

### Step 8: Validate Updated Schema

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
Schema Update Validation:
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
# Schema Update Summary

**Date**: [YYYY-MM-DD]
**Update Type**: Schema Change | Code Change | Both
**Version**: [old version] → [new version]

## Changes Made

### Node Types
- [Change 1]: [Description]
- [Change 2]: [Description]

### Relationship Types
- [Change 1]: [Description]
- [Change 2]: [Description]

### Properties
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

1. **Updated schema document**
2. **Updated validation checklist**
3. **Update summary**
4. **Validation report** (if code exists, use PLAYBOOK_02)

## Quality Criteria

**Good schema update:**
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

**For schema change:**
```
Update the schema to reflect new node type "Event".
Add properties: id (string), name (string), date (datetime).
Update the Node Types section and code references.
```

**For code change:**
```
Update the schema to reflect code changes in schema.ts.
The Jingle node now has a new property "duration" (number).
Update Properties and code references.
```

## Next Steps

After updating:
1. **Validate schema** → Use PLAYBOOK_02 (if code exists)
2. **Review changes** → Get stakeholder approval (if schema change)
3. **Implement changes** → Use PLAYBOOK_05 (if schema change not yet implemented)

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Requirements (use after updating)
- PLAYBOOK_05: Implement Migration (use if schema change needs implementation)
- PLAYBOOK_01: Document Schema (for major updates that require new documentation)

