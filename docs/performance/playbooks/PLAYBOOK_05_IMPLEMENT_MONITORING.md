# Playbook 05: Implement Monitoring

## Purpose

This playbook provides step-by-step instructions for implementing performance monitoring while maintaining sync between monitoring code and performance target documentation. Use this to execute monitoring implementation following documented targets.

## When to Use This Playbook

- After optimization plan created (PLAYBOOK_04)
- When implementing specific monitoring tasks
- When updating monitoring to match performance targets
- During Phase 3 optimization work

## Prerequisites

- Optimization plan exists
- Task definition clear
- Performance target documentation available
- Understanding of current and desired state

## Instructions for AI Assistant

### Step 1: Review Task and Targets

**Your task:**
1. Read the optimization task definition
2. Read the relevant performance target documentation
3. Understand current state vs. desired state
4. Identify all files and monitoring changes involved

**Create implementation checklist:**
```
Task: [Task name]
Performance Area: [API | Database | Frontend | Monitoring | Optimization]
Files to create/modify:
- file1.ts: [changes needed]
- file2.ts: [changes needed]

Monitoring changes:
- [Change 1]
- [Change 2]

Current state: [description]
Desired state: [description]
```

### Step 2: Plan Implementation Steps

**Break down the task into steps:**

1. **Preparation:**
   - Create feature branch (if using Git)
   - Review current monitoring
   - Understand dependencies

2. **Implementation:**
   - Step 1: [Specific change]
   - Step 2: [Specific change]
   - Step 3: [Specific change]

3. **Validation:**
   - Test monitoring
   - Verify against targets
   - Check for performance improvements

4. **Documentation:**
   - Update targets if needed
   - Update code comments
   - Update monitoring documentation

**Implementation plan:**
```markdown
## Implementation Plan: [Task Name]

### Step 1: [Action]
- File: `file.ts`
- Change: [Description]
- Validation: [How to verify]

### Step 2: [Action]
- File: `file.ts`
- Change: [Description]
- Validation: [How to verify]

[Continue for all steps]
```

### Step 3: Implement Monitoring Changes

**For each implementation step:**

1. **Read current code:**
   - Understand existing monitoring implementation
   - Identify what needs to change
   - Check for dependencies

2. **Make changes:**
   - Follow performance target documentation
   - Reference targets in code comments
   - Maintain code quality standards
   - Follow monitoring patterns

3. **Verify changes:**
   - Check syntax/compilation
   - Verify logic matches targets
   - Check for obvious errors

**Code comment template:**
```typescript
// Performance Target: [Target Name]
// Implements: [What this implements]
// Metric: [Metric name]
// Reference: [Target doc]
```

### Step 4: Maintain Documentation Sync

**While implementing, keep documentation in sync:**

1. **If code changes reveal target issues:**
   - Note the issue
   - Decide: Update target or change code
   - Document decision

2. **If implementation differs from targets:**
   - Document why
   - Update targets if needed
   - Or adjust implementation to match targets

3. **Update code references:**
   - Update line numbers if code moved
   - Update file paths if files moved
   - Verify all references accurate

**Sync checklist:**
```
Documentation Sync:
- [ ] Targets still accurate
- [ ] Code references updated
- [ ] Implementation matches targets
- [ ] Deviations documented
```

### Step 5: Test Monitoring

**Test against targets and functionality:**

1. **Monitoring Testing:**
   - Verify monitoring works
   - Check metric collection
   - Test alerting
   - Verify dashboards

2. **Performance Testing:**
   - Measure performance improvements
   - Verify performance targets met
   - Check for regressions

3. **Code Validation:**
   - Run linter
   - Run type checker
   - Run tests (if available)

4. **Target Validation:**
   - Verify monitoring matches targets
   - Verify metrics match targets
   - Verify performance goals met

**Testing checklist:**
```
Testing:
- [ ] Monitoring works correctly
- [ ] Metrics collected correctly
- [ ] Alerting works correctly
- [ ] Dashboards work correctly
- [ ] Performance targets met
- [ ] No performance regressions
- [ ] Code quality checks pass
- [ ] Matches target documentation
```

### Step 6: Update Performance Target Documentation

**If targets need updates:**

1. **Update target document:**
   - Update target definitions
   - Update metric definitions
   - Update code references
   - Add change history entry

2. **Update validation checklist:**
   - Mark validated items
   - Add new validation items if needed
   - Update validation status

**Target update template:**
```markdown
## Change History

| Version | Date       | Change                      | Author | Rationale      |
| ------- | ---------- | --------------------------- | ------ | -------------- |
| 1.1     | YYYY-MM-DD | [Change description]        | -      | [Rationale]    |
```

### Step 7: Validate Against Targets

**Use PLAYBOOK_02 to validate:**

1. **Run validation:**
   - Check all code references
   - Verify performance targets
   - Verify metrics match targets
   - Verify monitoring matches targets

2. **Fix any discrepancies:**
   - Update code if target is source of truth
   - Update target if code is source of truth
   - Document decision

3. **Update validation status:**
   - Mark target as `validated` or `implemented`
   - Update validation date

### Step 8: Create Implementation Summary

**Document what was done:**

```markdown
# Monitoring Implementation Summary: [Task Name]

**Date**: [YYYY-MM-DD]
**Task ID**: TASK-XXX
**Performance Area**: [API | Database | Frontend | Monitoring | Optimization]
**Status**: Complete | In Progress | Blocked

## Changes Made

### Files Created/Modified
- `file1.ts`: [Changes made]
- `file2.ts`: [Changes made]

### Monitoring Changes
- [Change 1]: [Description]
- [Change 2]: [Description]

### Target Updates
- [Update 1]: [Description]
- [Update 2]: [Description]

## Testing Results

### Monitoring Testing
- ✅ Monitoring: [Result]
- ✅ Metrics: [Result]
- ✅ Alerting: [Result]
- ✅ Dashboards: [Result]

### Performance Testing
- ✅ Performance improvement: [Result]
- ✅ Performance targets: [Result]
- ✅ No regressions: [Result]

### Code Quality
- ✅ Linter: Pass
- ✅ Type checker: Pass
- ✅ Tests: [Result]

### Target Validation
- ✅ Monitoring: Matches targets
- ✅ Metrics: Match targets
- ✅ Performance: Goals met

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

1. **Implemented monitoring changes**
2. **Updated performance target documentation** (if needed)
3. **Implementation summary**
4. **Updated task tracking**
5. **Validation report** (from PLAYBOOK_02)

## Quality Criteria

**Good implementation:**
- ✅ Monitoring matches targets
- ✅ Performance targets met
- ✅ Documentation updated
- ✅ No regressions
- ✅ Code quality maintained

**Red flags:**
- ❌ Monitoring doesn't match targets
- ❌ Performance targets not met
- ❌ Regressions introduced
- ❌ Documentation not updated
- ❌ Code quality degraded

## Example Prompts for User

```
Implement TASK-001: Add API response time monitoring.
Follow the performance target documentation and maintain sync.
Test monitoring and update targets if needed.
```

## Next Steps

After implementation:
1. **Validate targets** → Use PLAYBOOK_02
2. **Update task tracking** → Mark as complete
3. **Move to next task** → Continue with next task in plan

---

**Related Playbooks:**
- PLAYBOOK_04: Plan Optimization (use before this)
- PLAYBOOK_02: Validate Metrics (use after this)
- PLAYBOOK_06: Update Targets (use if targets need updates)

