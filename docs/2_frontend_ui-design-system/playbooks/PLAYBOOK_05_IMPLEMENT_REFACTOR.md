# Playbook 05: Implement Refactor

## Purpose

This playbook provides step-by-step instructions for implementing refactoring tasks while maintaining sync between code and design system documentation. Use this to execute refactoring following documented design system.

## When to Use This Playbook

- After refactoring plan created (PLAYBOOK_04)
- When implementing specific refactoring tasks
- When updating code to match design system documentation
- During Phase 3 refactoring work

## Prerequisites

- Refactoring plan exists
- Task definition clear
- Design system documentation available
- Understanding of current and desired state

## Instructions for AI Assistant

### Step 1: Review Task and Design System

**Your task:**
1. Read the refactoring task definition
2. Read the relevant design system documentation
3. Understand current state vs. desired state
4. Identify all files and components involved

**Create implementation checklist:**
```
Task: [Task name]
Design System Area: [Tokens | Components | Patterns]
Files to modify:
- file1.css: [changes needed]
- file2.tsx: [changes needed]

Current state: [description]
Desired state: [description]
```

### Step 2: Plan Implementation Steps

**Break down the task into steps:**

1. **Preparation:**
   - Create feature branch (if using Git)
   - Review current code
   - Understand dependencies

2. **Implementation:**
   - Step 1: [Specific change]
   - Step 2: [Specific change]
   - Step 3: [Specific change]

3. **Validation:**
   - Test changes visually
   - Verify against design system
   - Check for regressions

4. **Documentation:**
   - Update design system if needed
   - Update code comments
   - Update validation checklist

**Implementation plan:**
```markdown
## Implementation Plan: [Task Name]

### Step 1: [Action]
- File: `file.css`
- Change: [Description]
- Validation: [How to verify]

### Step 2: [Action]
- File: `file.css`
- Change: [Description]
- Validation: [How to verify]

[Continue for all steps]
```

### Step 3: Implement Changes

**For each implementation step:**

1. **Read current code:**
   - Understand existing implementation
   - Identify what needs to change
   - Check for dependencies

2. **Make changes:**
   - Follow design system documentation
   - Reference design system in code comments
   - Maintain code quality standards

3. **Verify changes:**
   - Check syntax/compilation
   - Verify logic matches design system
   - Check for obvious errors

**Code comment template:**
```css
/* Design System: [Token/Component Name]
 * Implements: [What this implements]
 * Token: [Design token used]
 * Reference: [Design system doc]
 */
```

### Step 4: Maintain Documentation Sync

**While implementing, keep documentation in sync:**

1. **If code changes reveal design system issues:**
   - Note the issue
   - Decide: Update design system or change code
   - Document decision

2. **If implementation differs from design system:**
   - Document why
   - Update design system if needed
   - Or adjust implementation to match design system

3. **Update code references:**
   - Update line numbers if code moved
   - Update file paths if files moved
   - Verify all references accurate

**Sync checklist:**
```
Documentation Sync:
- [ ] Design system still accurate
- [ ] Code references updated
- [ ] Implementation matches design system
- [ ] Deviations documented
```

### Step 5: Test Implementation

**Test against design system:**

1. **Visual Testing:**
   - Check visual appearance matches design
   - Test all variants
   - Test all states
   - Test responsive behavior

2. **Code Validation:**
   - Run linter
   - Run type checker
   - Run tests (if available)

3. **Design System Validation:**
   - Verify tokens match design system
   - Verify components match specifications
   - Verify patterns match documentation

**Testing checklist:**
```
Testing:
- [ ] Visual appearance matches design
- [ ] All variants work
- [ ] All states work
- [ ] No visual regressions
- [ ] Code quality checks pass
- [ ] Matches design system
```

### Step 6: Update Design System Documentation

**If design system needs updates:**

1. **Update design system document:**
   - Update token values
   - Update component specifications
   - Update code references
   - Add change history entry

2. **Update validation checklist:**
   - Mark validated items
   - Add new validation items if needed
   - Update validation status

**Design system update template:**
```markdown
## Change History

| Version | Date       | Change                      | Author | Rationale      |
| ------- | ---------- | --------------------------- | ------ | -------------- |
| 1.1     | YYYY-MM-DD | [Change description]        | -      | [Rationale]    |
```

### Step 7: Validate Against Design System

**Use PLAYBOOK_02 to validate:**

1. **Run validation:**
   - Check all code references
   - Verify design tokens
   - Verify component styles
   - Verify visual patterns

2. **Fix any discrepancies:**
   - Update code if design system is source of truth
   - Update design system if code is source of truth
   - Document decision

3. **Update validation status:**
   - Mark design system as `validated` or `implemented`
   - Update validation date

### Step 8: Create Implementation Summary

**Document what was done:**

```markdown
# Implementation Summary: [Task Name]

**Date**: [YYYY-MM-DD]
**Task ID**: TASK-XXX
**Design System Area**: [Tokens | Components | Patterns]
**Status**: Complete | In Progress | Blocked

## Changes Made

### Files Modified
- `file1.css`: [Changes made]
- `file2.tsx`: [Changes made]

### Code Changes
- [Change 1]: [Description]
- [Change 2]: [Description]

### Documentation Updates
- [Update 1]: [Description]
- [Update 2]: [Description]

## Testing Results

### Visual Testing
- ✅ Appearance: [Result]
- ✅ Variants: [Result]
- ✅ States: [Result]
- ✅ Responsive: [Result]

### Code Quality
- ✅ Linter: Pass
- ✅ Type checker: Pass
- ✅ Tests: [Result]

### Design System Validation
- ✅ Tokens: Matches design system
- ✅ Components: Matches design system
- ✅ Patterns: Matches design system

## Issues Encountered

### Issue 1: [Description]
- **Resolution**: [How resolved]
- **Impact**: [Impact on implementation]

## Deviations from Plan

### Deviation 1: [Description]
- **Reason**: [Why deviated]
- **Impact**: [Impact on outcome]

## Next Steps

- [ ] [Next action]
- [ ] [Next action]

## Acceptance Criteria Status

- [ ] [Criterion 1]: [Status]
- [ ] [Criterion 2]: [Status]
- [ ] [Criterion 3]: [Status]
```

### Step 9: Update Task Tracking

**Update task status:**

```markdown
## Task Status Update

**Task ID**: TASK-XXX
**Status**: Complete | In Progress | Blocked
**Progress**: [X%]
**Notes**: [Any notes]
**Next Steps**: [What's next]
```

## Output Deliverables

1. **Implemented code changes**
2. **Updated design system documentation** (if needed)
3. **Implementation summary**
4. **Updated task tracking**
5. **Validation report** (from PLAYBOOK_02)

## Quality Criteria

**Good implementation:**
- ✅ Code matches design system
- ✅ Visual appearance verified
- ✅ Documentation updated
- ✅ No regressions
- ✅ Code quality maintained

**Red flags:**
- ❌ Code doesn't match design system
- ❌ Visual regressions
- ❌ Documentation not updated
- ❌ Code quality degraded

## Example Prompts for User

```
Implement TASK-001: Update color tokens to match design system.
Follow the design system documentation and maintain sync.
Test visually and update design system if needed.
```

## Next Steps

After implementation:
1. **Validate design system** → Use PLAYBOOK_02
2. **Update task tracking** → Mark as complete
3. **Move to next task** → Continue with next task in plan

---

**Related Playbooks:**
- PLAYBOOK_04: Plan Refactor (use before this)
- PLAYBOOK_02: Validate Implementation (use after this)
- PLAYBOOK_06: Update Design System (use if design system needs updates)

