# Playbook 06: Update Process

## Purpose

This playbook provides step-by-step instructions for updating existing deployment process documentation when process changes or code changes occur. Use this to maintain sync between documentation and implementation.

## When to Use This Playbook

- When process changes (new processes, process updates)
- When code changes (deployment improvements, infrastructure changes)
- When deployment process documentation is outdated
- During iterative design process
- After validation finds discrepancies

## Prerequisites

- Existing deployment process document
- Understanding of what changed (process or code)
- Access to codebase (if code changed)

## Instructions for AI Assistant

### Step 1: Understand the Change

**Your task:**
1. Determine what changed:
   - Process change (new processes, process updates)
   - Code change (deployment implementation changed)
   - Both (process and code changed together)

2. Understand the scope:
   - What specific parts changed?
   - What stays the same?
   - What's the impact?

**Change analysis:**
```markdown
## Change Analysis

**Type**: Process Change | Code Change | Both
**Scope**: [What changed]
**Impact**: [What's affected]
**Rationale**: [Why changed]
```

### Step 2: Identify Affected Sections

**For process changes:**

1. **Update Deployment Processes:**
   - New processes
   - Modified processes
   - Removed processes

2. **Update Environment Configuration:**
   - New environments
   - Modified environment configurations
   - Removed environments

3. **Update Infrastructure:**
   - New infrastructure components
   - Modified infrastructure definitions
   - Removed infrastructure

**For code changes:**

1. **Update Implementation:**
   - Deployment code locations
   - Infrastructure code locations
   - CI/CD code locations

2. **Update code references:**
   - File paths
   - Line numbers
   - Function/class names

3. **Update Processes (if needed):**
   - Only if code change affects process definition

**Affected sections checklist:**
```
Affected Sections:
- [ ] Deployment Processes (if processes changed)
- [ ] Environment Configuration (if environments changed)
- [ ] Infrastructure (if infrastructure changed)
- [ ] CI/CD Pipelines (if pipelines changed)
- [ ] Implementation (if code changed)
- [ ] Code References (if code changed)
- [ ] Validation Checklist (always update)
```

### Step 3: Update Process Document

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
   - If new processes added
   - If new environments added
   - If new infrastructure added

2. **Update existing items:**
   - If processes changed
   - If environments changed
   - If infrastructure changed

3. **Remove obsolete items:**
   - If processes removed
   - If environments removed
   - If infrastructure removed

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

### Step 7: Update Process Status

**Update status based on change type:**

- **Process change (not yet implemented)**: `draft`
- **Code change (process updated to match)**: `current_implementation`
- **Both changed together**: `draft` or `implemented` (depending on state)

**Status update:**
```markdown
## Metadata

- **Status**: [new status]
- **Last Updated**: [current date]
- **Last Validated**: [if validated, update date]
- **Version**: [increment version]
```

### Step 8: Validate Updated Processes

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
Process Update Validation:
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
# Deployment Process Update Summary

**Date**: [YYYY-MM-DD]
**Update Type**: Process Change | Code Change | Both
**Version**: [old version] → [new version]

## Changes Made

### Deployment Processes
- [Change 1]: [Description]
- [Change 2]: [Description]

### Environment Configuration
- [Change 1]: [Description]
- [Change 2]: [Description]

### Infrastructure
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

1. **Updated process document**
2. **Updated validation checklist**
3. **Update summary**
4. **Validation report** (if code exists, use PLAYBOOK_02)

## Quality Criteria

**Good process update:**
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

**For process change:**
```
Update the deployment processes to reflect new CI/CD pipeline.
Use GitHub Actions for automated deployment.
Update the CI/CD Pipelines section and code references.
```

**For code change:**
```
Update the deployment processes to reflect code changes in infrastructure.
Terraform configuration now implemented.
Update Infrastructure and code references.
```

## Next Steps

After updating:
1. **Validate processes** → Use PLAYBOOK_02 (if code exists)
2. **Review changes** → Get stakeholder approval (if process change)
3. **Implement changes** → Use PLAYBOOK_05 (if process change not yet implemented)

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Environment (use after updating)
- PLAYBOOK_05: Implement Infrastructure (use if process change needs implementation)
- PLAYBOOK_01: Document Process (for major updates that require new documentation)

