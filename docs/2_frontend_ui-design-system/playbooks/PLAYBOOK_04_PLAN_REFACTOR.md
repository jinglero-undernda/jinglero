# Playbook 04: Plan Refactor

## Purpose

This playbook provides step-by-step instructions for planning incremental refactoring based on gap analysis. Use this to create refactoring tasks with clear scope, assess risks, and identify dependencies for design system improvements.

## When to Use This Playbook

- After gap analysis (PLAYBOOK_03)
- Before implementing refactoring (PLAYBOOK_05)
- When planning Phase 3 refactoring work
- When prioritizing design system improvements

## Prerequisites

- Gap analysis report exists
- Prioritized gap list
- Understanding of codebase structure
- Access to design system documentation

## Instructions for AI Assistant

### Step 1: Review Gap Analysis

**Your task:**

1. Read the gap analysis report
2. Understand prioritized gaps
3. Identify dependencies between gaps
4. Group related gaps

**Create gap groups:**

```
Group 1: Design Token Gaps
- GAP-001: Missing color token
- GAP-002: Incorrect token value

Group 2: Component Style Gaps
- GAP-003: Missing component variant
- GAP-004: Inconsistent styling
```

### Step 2: Define Refactoring Scope

**For each gap or gap group, define scope:**

1. **What needs to change:**
   - CSS files to modify
   - Design tokens to update
   - Components to refactor
   - Documentation to update

2. **What should stay the same:**
   - Backward compatibility requirements
   - Existing visual appearance (if not changing design)
   - User-facing behavior

3. **Boundaries:**
   - What's in scope
   - What's out of scope
   - What's deferred

**Scope template:**

```markdown
## Refactoring Scope: [Gap Name/Group]

### In Scope

- [Change 1]
- [Change 2]

### Out of Scope

- [Not changing 1]
- [Not changing 2]

### Deferred

- [Future change 1]
- [Future change 2]
```

### Step 3: Assess Dependencies

**Identify dependencies:**

1. **Code Dependencies:**
   - What CSS depends on current implementation?
   - What components will be affected?
   - What needs to be updated together?

2. **Design System Dependencies:**
   - What other design elements depend on this?
   - What design elements will be affected?
   - What needs to be updated together?

3. **Task Dependencies:**
   - What tasks must be done before this?
   - What tasks can be done in parallel?
   - What tasks depend on this?

**Dependency graph:**

```
Task A → Task B → Task C
Task D → Task E
Task F (independent)
```

### Step 4: Assess Risks

**For each refactoring task, assess risks:**

1. **Technical Risks:**
   - Risk of breaking visual appearance
   - Risk of introducing inconsistencies
   - Risk of performance degradation
   - Risk of complexity increase

2. **Visual Risks:**
   - Risk of changing visual appearance unintentionally
   - Risk of confusing users
   - Risk of losing design consistency

3. **Timeline Risks:**
   - Risk of taking longer than estimated
   - Risk of blocking other work
   - Risk of scope creep

**Risk assessment template:**

```markdown
## Risk Assessment: [Task Name]

### Technical Risks

- **Risk**: [Description]
  - **Probability**: High | Medium | Low
  - **Impact**: High | Medium | Low
  - **Mitigation**: [How to reduce risk]

### Visual Risks

- **Risk**: [Description]
  - **Probability**: High | Medium | Low
  - **Impact**: High | Medium | Low
  - **Mitigation**: [How to reduce risk]

### Timeline Risks

- **Risk**: [Description]
  - **Probability**: High | Medium | Low
  - **Impact**: High | Medium | Low
  - **Mitigation**: [How to reduce risk]
```

### Step 5: Create Refactoring Tasks

**For each gap or gap group, create a task:**

**Task template:**

```markdown
## Task: [Task Name]

**Gap ID**: GAP-XXX
**Priority**: P0 | P1 | P2 | P3
**Design System Area**: [Tokens | Components | Patterns]

### Description

[What needs to be done]

### Scope

**In Scope:**

- [Item 1]
- [Item 2]

**Out of Scope:**

- [Item 1]
- [Item 2]

### Current State

[What currently exists]

### Desired State

[What should exist after refactoring]

### Implementation Steps

1. [Step 1]
2. [Step 2]
3. [Step 3]

### Files to Modify

- `file1.css`: [What to change]
- `file2.tsx`: [What to change]

### Dependencies

- **Blocks**: [Tasks that depend on this]
- **Blocked by**: [Tasks this depends on]
- **Can run parallel with**: [Tasks that can run in parallel]

### Risks

[Copy from risk assessment]

### Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

### Validation

- [ ] Code matches design system
- [ ] Visual appearance verified
- [ ] Manual testing completed
- [ ] Design system validated (PLAYBOOK_02)

### Effort Estimate

- **Small**: 1-4 hours
- **Medium**: 4-16 hours
- **Large**: 16+ hours

**Estimated**: [Small | Medium | Large]
```

### Step 6: Create Refactoring Plan

**Organize tasks into a plan:**

```markdown
# Refactoring Plan: Design System

**Date Created**: [YYYY-MM-DD]
**Planner**: AI Assistant
**Target Completion**: [Date]

## Overview

- **Total Tasks**: [number]
- **Estimated Effort**: [hours/days]
- **Priority Breakdown**:
  - P0: [count] tasks
  - P1: [count] tasks
  - P2: [count] tasks
  - P3: [count] tasks

## Phase 1: Critical Fixes (P0)

**Goal**: Fix critical gaps that break consistency

**Tasks**:

1. [Task name] - [Effort] - [Dependencies]
2. [Task name] - [Effort] - [Dependencies]

**Timeline**: [Start date] - [End date]

## Phase 2: High Priority (P1)

**Goal**: Fix significant design inconsistencies

**Tasks**:

1. [Task name] - [Effort] - [Dependencies]
2. [Task name] - [Effort] - [Dependencies]

**Timeline**: [Start date] - [End date]

## Phase 3: Medium Priority (P2)

**Goal**: Address technical debt and minor issues

**Tasks**:

1. [Task name] - [Effort] - [Dependencies]
2. [Task name] - [Effort] - [Dependencies]

**Timeline**: [Start date] - [End date]

## Phase 4: Low Priority (P3)

**Goal**: Cosmetic fixes and documentation

**Tasks**:

1. [Task name] - [Effort] - [Dependencies]
2. [Task name] - [Effort] - [Dependencies]

**Timeline**: [Start date] - [End date]

## Task Dependency Graph

[Visual or text representation of dependencies]

## Risk Mitigation Plan

### High Risk Tasks
- [Task name]: [Mitigation strategy]

### Medium Risk Tasks
- [Task name]: [Mitigation strategy]

## Success Criteria

- [ ] All P0 tasks completed
- [ ] All P1 tasks completed
- [ ] Design system validated (PLAYBOOK_02)
- [ ] No visual regressions introduced
- [ ] Code matches design system documentation

## Next Steps

1. [ ] Review plan with stakeholders
2. [ ] Get approval on priorities
3. [ ] Begin Phase 1 (P0 tasks)
4. [ ] Use PLAYBOOK_05 for implementation
```

### Step 7: Estimate Effort

**For each task, estimate effort:**

**Factors to consider:**
- Complexity of changes
- Number of files to modify
- Testing requirements
- Documentation updates
- Risk level

**Effort categories:**
- **Small**: 1-4 hours (simple changes, few files)
- **Medium**: 4-16 hours (moderate changes, multiple files)
- **Large**: 16+ hours (complex changes, many files, high risk)

**Estimation template:**

```markdown
## Effort Estimate: [Task Name]

**Breakdown**:

- Code changes: [hours]
- Testing: [hours]
- Documentation: [hours]
- Review: [hours]

**Total**: [hours] ([Small | Medium | Large])

**Confidence**: High | Medium | Low
**Notes**: [Any assumptions or uncertainties]
```

### Step 8: Create Task Tracking

**Create a tracking document:**

```markdown
## Refactoring Task Tracking

| Task ID  | Description   | Priority | Status  | Assigned | Effort | Dependencies | Notes |
| -------- | ------------- | -------- | ------- | -------- | ------ | ------------ | ----- |
| TASK-001 | [Description] | P0       | Planned | -        | Small  | -            | -     |
| TASK-002 | [Description] | P1       | Planned | -        | Medium | TASK-001     | -     |
```

## Output Deliverables

1. **Refactoring Plan** (comprehensive document)
2. **Individual Task Definitions** (detailed tasks)
3. **Task Tracking** (ongoing tracking)
4. **Risk Assessment** (risk mitigation strategies)

## Quality Criteria

**Good refactoring plan:**
- ✅ Clear scope for each task
- ✅ Dependencies identified
- ✅ Risks assessed and mitigated
- ✅ Realistic effort estimates
- ✅ Actionable tasks

**Red flags:**
- ❌ Vague task descriptions
- ❌ Missing dependencies
- ❌ Unrealistic estimates
- ❌ No risk assessment
- ❌ Unclear scope

## Example Prompts for User

```
Create a refactoring plan for the design system based on the gap analysis.
Prioritize tasks, assess risks, and create a phased implementation plan.
Include effort estimates and dependencies.
```

## Next Steps

After planning:
1. **Review plan** → Get stakeholder approval
2. **Begin implementation** → Use PLAYBOOK_05
3. **Track progress** → Update task tracking regularly

---

**Related Playbooks:**
- PLAYBOOK_03: Gap Analysis (use before this)
- PLAYBOOK_05: Implement Refactor (use after this)
- PLAYBOOK_02: Validate Implementation (use after implementation)

