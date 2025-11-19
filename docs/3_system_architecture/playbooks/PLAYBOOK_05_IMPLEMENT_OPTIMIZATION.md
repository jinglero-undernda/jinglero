# Playbook 05: Implement Optimization

## Purpose

This playbook provides step-by-step instructions for implementing architecture optimizations while maintaining sync between code and architecture documentation. Use this to execute optimizations following documented architecture.

## When to Use This Playbook

- After optimization plan created (PLAYBOOK_04)
- When implementing specific optimization tasks
- When updating architecture to match optimization goals
- During Phase 3 optimization work

## Prerequisites

- Optimization plan exists
- Task definition clear
- Architecture documentation available
- Understanding of current and desired state

## Instructions for AI Assistant

### Step 1: Review Task and Architecture

**Your task:**
1. Read the optimization task definition
2. Read the relevant architecture documentation
3. Understand current state vs. desired state
4. Identify all files and changes involved

**Create implementation checklist:**
```
Task: [Task name]
Architecture Area: [Data Flow | State Management | Caching | Performance | Scalability]
Files to modify:
- file1.ts: [changes needed]
- file2.tsx: [changes needed]

Current state: [description]
Desired state: [description]
```

### Step 2: Plan Implementation Steps

**Break down the task into steps:**

1. **Preparation:**
   - Create feature branch (if using Git)
   - Review current architecture
   - Understand dependencies

2. **Implementation:**
   - Step 1: [Specific change]
   - Step 2: [Specific change]
   - Step 3: [Specific change]

3. **Validation:**
   - Test optimization
   - Verify against architecture
   - Check for performance improvements

4. **Documentation:**
   - Update architecture if needed
   - Update code comments
   - Update optimization documentation

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

### Step 3: Implement Architecture Changes

**For each implementation step:**

1. **Read current code:**
   - Understand existing architecture
   - Identify what needs to change
   - Check for dependencies

2. **Make changes:**
   - Follow architecture documentation
   - Reference architecture in code comments
   - Maintain code quality standards

3. **Verify changes:**
   - Check syntax/compilation
   - Verify logic matches architecture
   - Check for obvious errors

**Code comment template:**
```typescript
// Architecture: [Pattern Name]
// Implements: [What this implements]
// Optimization: [Optimization goal]
// Reference: [Architecture doc]
```

### Step 4: Maintain Documentation Sync

**While implementing, keep documentation in sync:**

1. **If code changes reveal architecture issues:**
   - Note the issue
   - Decide: Update architecture or change code
   - Document decision

2. **If implementation differs from architecture:**
   - Document why
   - Update architecture if needed
   - Or adjust implementation to match architecture

3. **Update code references:**
   - Update line numbers if code moved
   - Update file paths if files moved
   - Verify all references accurate

**Sync checklist:**
```
Documentation Sync:
- [ ] Architecture still accurate
- [ ] Code references updated
- [ ] Implementation matches architecture
- [ ] Deviations documented
```

### Step 5: Test Optimization

**Test against architecture and goals:**

1. **Performance Testing:**
   - Measure performance improvements
   - Verify performance targets met
   - Check for regressions

2. **Code Validation:**
   - Run linter
   - Run type checker
   - Run tests (if available)

3. **Architecture Validation:**
   - Verify architecture matches documentation
   - Verify patterns match architecture
   - Verify optimization goals met

**Testing checklist:**
```
Testing:
- [ ] Performance improvements measured
- [ ] Performance targets met
- [ ] No performance regressions
- [ ] Code quality checks pass
- [ ] Matches architecture documentation
```

### Step 6: Update Architecture Documentation

**If architecture needs updates:**

1. **Update architecture document:**
   - Update patterns
   - Update data flow
   - Update code references
   - Add change history entry

2. **Update validation checklist:**
   - Mark validated items
   - Add new validation items if needed
   - Update validation status

**Architecture update template:**
```markdown
## Change History

| Version | Date       | Change                      | Author | Rationale      |
| ------- | ---------- | --------------------------- | ------ | -------------- |
| 1.1     | YYYY-MM-DD | [Change description]        | -      | [Rationale]    |
```

### Step 7: Validate Against Architecture

**Use PLAYBOOK_02 to validate:**

1. **Run validation:**
   - Check all code references
   - Verify architecture patterns
   - Verify optimization goals met
   - Verify performance targets met

2. **Fix any discrepancies:**
   - Update code if architecture is source of truth
   - Update architecture if code is source of truth
   - Document decision

3. **Update validation status:**
   - Mark architecture as `validated` or `implemented`
   - Update validation date

### Step 8: Create Implementation Summary

**Document what was done:**

```markdown
# Optimization Implementation Summary: [Task Name]

**Date**: [YYYY-MM-DD]
**Task ID**: TASK-XXX
**Architecture Area**: [Data Flow | State Management | Caching | Performance | Scalability]
**Status**: Complete | In Progress | Blocked

## Changes Made

### Files Modified
- `file1.ts`: [Changes made]
- `file2.tsx`: [Changes made]

### Architecture Changes
- [Change 1]: [Description]
- [Change 2]: [Description]

### Documentation Updates
- [Update 1]: [Description]
- [Update 2]: [Description]

## Testing Results

### Performance Testing
- ✅ Performance improvement: [Result]
- ✅ Performance targets: [Result]
- ✅ No regressions: [Result]

### Code Quality
- ✅ Linter: Pass
- ✅ Type checker: Pass
- ✅ Tests: [Result]

### Architecture Validation
- ✅ Architecture: Matches documentation
- ✅ Patterns: Match architecture
- ✅ Optimization goals: Met

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

1. **Implemented architecture changes**
2. **Updated architecture documentation** (if needed)
3. **Implementation summary**
4. **Updated task tracking**
5. **Validation report** (from PLAYBOOK_02)

## Quality Criteria

**Good implementation:**
- ✅ Architecture matches documentation
- ✅ Performance targets met
- ✅ Cost targets met
- ✅ Documentation updated
- ✅ No regressions
- ✅ Code quality maintained

**Red flags:**
- ❌ Architecture doesn't match documentation
- ❌ Performance targets not met
- ❌ Regressions introduced
- ❌ Documentation not updated
- ❌ Code quality degraded

## Example Prompts for User

```
Implement TASK-001: Add client-side request caching.
Follow the architecture documentation and maintain sync.
Test performance improvements and update architecture if needed.
```

## Next Steps

After implementation:
1. **Validate architecture** → Use PLAYBOOK_02
2. **Update task tracking** → Mark as complete
3. **Move to next task** → Continue with next task in plan

---

**Related Playbooks:**
- PLAYBOOK_04: Plan Optimization (use before this)
- PLAYBOOK_02: Evaluate Alternatives (use after this)
- PLAYBOOK_06: Update Architecture (use if architecture needs updates)

