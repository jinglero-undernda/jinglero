# Playbook 05: Implement Infrastructure

## Purpose

This playbook provides step-by-step instructions for implementing infrastructure while maintaining sync between infrastructure code and deployment process documentation. Use this to execute infrastructure implementation following documented processes.

## When to Use This Playbook

- After improvement plan created (PLAYBOOK_04)
- When implementing specific infrastructure tasks
- When updating infrastructure to match deployment processes
- During Phase 3 improvement work

## Prerequisites

- Improvement plan exists
- Task definition clear
- Deployment process documentation available
- Understanding of current and desired state

## Instructions for AI Assistant

### Step 1: Review Task and Processes

**Your task:**
1. Read the improvement task definition
2. Read the relevant deployment process documentation
3. Understand current state vs. desired state
4. Identify all files and infrastructure changes involved

**Create implementation checklist:**
```
Task: [Task name]
Deployment Area: [Process | Environment | Infrastructure | CI/CD]
Files to create/modify:
- file1.tf: [changes needed]
- file2.yml: [changes needed]

Infrastructure changes:
- [Change 1]
- [Change 2]

Current state: [description]
Desired state: [description]
```

### Step 2: Plan Implementation Steps

**Break down the task into steps:**

1. **Preparation:**
   - Create feature branch (if using Git)
   - Review current infrastructure
   - Understand dependencies

2. **Implementation:**
   - Step 1: [Specific change]
   - Step 2: [Specific change]
   - Step 3: [Specific change]

3. **Validation:**
   - Test infrastructure
   - Verify against processes
   - Check for deployment improvements

4. **Documentation:**
   - Update processes if needed
   - Update code comments
   - Update infrastructure documentation

**Implementation plan:**
```markdown
## Implementation Plan: [Task Name]

### Step 1: [Action]
- File: `file.tf`
- Change: [Description]
- Validation: [How to verify]

### Step 2: [Action]
- File: `file.yml`
- Change: [Description]
- Validation: [How to verify]

[Continue for all steps]
```

### Step 3: Implement Infrastructure Changes

**For each implementation step:**

1. **Read current code:**
   - Understand existing infrastructure implementation
   - Identify what needs to change
   - Check for dependencies

2. **Make changes:**
   - Follow deployment process documentation
   - Reference processes in code comments
   - Maintain code quality standards
   - Follow infrastructure patterns

3. **Verify changes:**
   - Check syntax/compilation
   - Verify logic matches processes
   - Check for obvious errors

**Code comment template:**
```hcl
# Deployment Process: [Process Name]
# Implements: [What this implements]
# Environment: [Environment name]
# Reference: [Process doc]
```

### Step 4: Maintain Documentation Sync

**While implementing, keep documentation in sync:**

1. **If code changes reveal process issues:**
   - Note the issue
   - Decide: Update process or change code
   - Document decision

2. **If implementation differs from processes:**
   - Document why
   - Update processes if needed
   - Or adjust implementation to match processes

3. **Update code references:**
   - Update line numbers if code moved
   - Update file paths if files moved
   - Verify all references accurate

**Sync checklist:**
```
Documentation Sync:
- [ ] Processes still accurate
- [ ] Code references updated
- [ ] Implementation matches processes
- [ ] Deviations documented
```

### Step 5: Test Infrastructure

**Test against processes and functionality:**

1. **Infrastructure Testing:**
   - Test infrastructure provisioning
   - Test infrastructure management
   - Test environment configuration
   - Test deployment processes

2. **Functional Testing:**
   - Verify deployment works
   - Check for regressions
   - Verify infrastructure improvements

3. **Code Validation:**
   - Run linter
   - Run type checker
   - Run tests (if available)

4. **Process Validation:**
   - Verify infrastructure matches processes
   - Verify deployment matches processes
   - Verify deployment goals met

**Testing checklist:**
```
Testing:
- [ ] Infrastructure works correctly
- [ ] Provisioning works correctly
- [ ] Management works correctly
- [ ] Deployment processes work correctly
- [ ] Deployment goals met
- [ ] No deployment regressions
- [ ] Code quality checks pass
- [ ] Matches process documentation
```

### Step 6: Update Deployment Process Documentation

**If processes need updates:**

1. **Update process document:**
   - Update process definitions
   - Update infrastructure definitions
   - Update code references
   - Add change history entry

2. **Update validation checklist:**
   - Mark validated items
   - Add new validation items if needed
   - Update validation status

**Process update template:**
```markdown
## Change History

| Version | Date       | Change                      | Author | Rationale      |
| ------- | ---------- | --------------------------- | ------ | -------------- |
| 1.1     | YYYY-MM-DD | [Change description]        | -      | [Rationale]    |
```

### Step 7: Validate Against Processes

**Use PLAYBOOK_02 to validate:**

1. **Run validation:**
   - Check all code references
   - Verify deployment processes
   - Verify infrastructure matches processes
   - Verify deployment goals met

2. **Fix any discrepancies:**
   - Update code if process is source of truth
   - Update process if code is source of truth
   - Document decision

3. **Update validation status:**
   - Mark process as `validated` or `implemented`
   - Update validation date

### Step 8: Create Implementation Summary

**Document what was done:**

```markdown
# Infrastructure Implementation Summary: [Task Name]

**Date**: [YYYY-MM-DD]
**Task ID**: TASK-XXX
**Deployment Area**: [Process | Environment | Infrastructure | CI/CD]
**Status**: Complete | In Progress | Blocked

## Changes Made

### Files Created/Modified
- `file1.tf`: [Changes made]
- `file2.yml`: [Changes made]

### Infrastructure Changes
- [Change 1]: [Description]
- [Change 2]: [Description]

### Process Updates
- [Update 1]: [Description]
- [Update 2]: [Description]

## Testing Results

### Infrastructure Testing
- ✅ Provisioning: [Result]
- ✅ Management: [Result]
- ✅ Environment: [Result]
- ✅ Deployment: [Result]

### Functional Testing
- ✅ Deployment: [Result]
- ✅ No regressions: [Result]

### Code Quality
- ✅ Linter: Pass
- ✅ Type checker: Pass
- ✅ Tests: [Result]

### Process Validation
- ✅ Infrastructure: Matches processes
- ✅ Deployment: Matches processes
- ✅ Deployment Goals: Met

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

1. **Implemented infrastructure changes**
2. **Updated deployment process documentation** (if needed)
3. **Implementation summary**
4. **Updated task tracking**
5. **Validation report** (from PLAYBOOK_02)

## Quality Criteria

**Good implementation:**
- ✅ Infrastructure matches processes
- ✅ Deployment goals met
- ✅ Documentation updated
- ✅ No deployment regressions
- ✅ Code quality maintained

**Red flags:**
- ❌ Infrastructure doesn't match processes
- ❌ Deployment goals not met
- ❌ Deployment regressions introduced
- ❌ Documentation not updated
- ❌ Code quality degraded

## Example Prompts for User

```
Implement TASK-001: Add CI/CD pipeline for production deployment.
Follow the deployment process documentation and maintain sync.
Test infrastructure and update processes if needed.
```

## Next Steps

After implementation:
1. **Validate processes** → Use PLAYBOOK_02
2. **Update task tracking** → Mark as complete
3. **Move to next task** → Continue with next task in plan

---

**Related Playbooks:**
- PLAYBOOK_04: Plan Improvements (use before this)
- PLAYBOOK_02: Validate Environment (use after this)
- PLAYBOOK_06: Update Process (use if processes need updates)

