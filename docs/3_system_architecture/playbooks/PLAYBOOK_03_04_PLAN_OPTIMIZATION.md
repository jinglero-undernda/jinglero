# Playbook 04: Plan Optimization

## Purpose

This playbook provides step-by-step instructions for planning incremental architecture optimizations based on tradeoff analysis. Use this to create optimization tasks with clear scope, assess risks, and identify dependencies.

## When to Use This Playbook

- After tradeoff analysis (PLAYBOOK_03)
- Before implementing optimizations (PLAYBOOK_05)
- When planning Phase 3 optimization work
- When prioritizing architecture improvements

## Prerequisites

- Tradeoff analysis report exists
- Prioritized optimization opportunities
- Understanding of codebase structure
- Access to architecture documentation

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

### Step 1: Review Tradeoff Analysis

**Your task:**

1. Read the tradeoff analysis report
2. Understand prioritized opportunities
3. Identify dependencies between opportunities
4. Group related opportunities

**Create opportunity groups:**

```
Group 1: Caching Optimizations
- OPP-001: Implement client-side request caching
- OPP-002: Add server-side response caching

Group 2: Query Optimizations
- OPP-003: Optimize database queries
- OPP-004: Add query result caching
```

### Step 2: Define Optimization Scope

**For each opportunity or opportunity group, define scope:**

1. **What needs to change:**
   - Architecture patterns to modify
   - Code files to update
   - Configuration changes needed
   - Documentation updates needed

2. **What should stay the same:**
   - Backward compatibility requirements
   - Existing functionality
   - User-facing behavior (unless UX improvement)

3. **Boundaries:**
   - What's in scope
   - What's out of scope
   - What's deferred

**Scope template:**

```markdown
## Optimization Scope: [Opportunity Name/Group]

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
   - What code depends on current architecture?
   - What code will be affected by changes?
   - What needs to be updated together?

2. **Architecture Dependencies:**
   - What other architecture elements depend on this?
   - What architecture elements will be affected?
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

**For each optimization task, assess risks:**

1. **Technical Risks:**
   - Risk of breaking existing functionality
   - Risk of performance degradation
   - Risk of introducing bugs
   - Risk of complexity increase

2. **Performance Risks:**
   - Risk of not meeting performance goals
   - Risk of performance regression
   - Risk of scalability issues

3. **Cost Risks:**
   - Risk of cost increase
   - Risk of not meeting cost goals
   - Risk of budget overrun

4. **Timeline Risks:**
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

### Performance Risks

- **Risk**: [Description]
  - **Probability**: High | Medium | Low
  - **Impact**: High | Medium | Low
  - **Mitigation**: [How to reduce risk]

### Cost Risks

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

### Step 5: Create Optimization Tasks

**For each opportunity or opportunity group, create a task:**

**Task template:**

```markdown
## Task: [Task Name]

**Opportunity ID**: OPP-XXX
**Priority**: P0 | P1 | P2 | P3
**Architecture Area**: [Data Flow | State Management | Caching | Performance | Scalability]

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

[What should exist after optimization]

### Implementation Steps

1. [Step 1]
2. [Step 2]
3. [Step 3]

### Files to Modify

- `file1.ts`: [What to change]
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

- [ ] Architecture matches documentation
- [ ] Performance targets met
- [ ] Cost targets met
- [ ] All tests pass
- [ ] Architecture validated (PLAYBOOK_02)

### Effort Estimate

- **Small**: 1-4 hours
- **Medium**: 4-16 hours
- **Large**: 16+ hours

**Estimated**: [Small | Medium | Large]
```

### Step 6: Create Optimization Plan

**Organize tasks into a plan:**

```markdown
# Optimization Plan: System Architecture

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

## Phase 1: Critical Optimizations (P0)

**Goal**: Optimize critical areas with high impact

**Tasks**:

1. [Task name] - [Effort] - [Dependencies]

**Timeline**: [Start date] - [End date]

## Phase 2: High Priority (P1)

**Goal**: Optimize high-impact areas

**Tasks**:

1. [Task name] - [Effort] - [Dependencies]

**Timeline**: [Start date] - [End date]

## Phase 3: Medium Priority (P2)

**Goal**: Address medium-impact optimizations

**Tasks**:

1. [Task name] - [Effort] - [Dependencies]

**Timeline**: [Start date] - [End date]

## Phase 4: Low Priority (P3)

**Goal**: Cosmetic optimizations and improvements

**Tasks**:

1. [Task name] - [Effort] - [Dependencies]

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
- [ ] Performance targets met
- [ ] Cost targets met
- [ ] Architecture validated (PLAYBOOK_02)

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

- Architecture changes: [hours]
- Code updates: [hours]
- Testing: [hours]
- Documentation: [hours]

**Total**: [hours] ([Small | Medium | Large])

**Confidence**: High | Medium | Low
**Notes**: [Any assumptions or uncertainties]
```

### Step 8: Create Task Tracking

**Create a tracking document:**

```markdown
## Optimization Task Tracking

| Task ID  | Description   | Priority | Status  | Assigned | Effort | Dependencies | Notes |
| -------- | ------------- | -------- | ------- | -------- | ------ | ------------ | ----- |
| TASK-001 | [Description] | P0       | Planned | -        | Small  | -            | -     |
| TASK-002 | [Description] | P1       | Planned | -        | Medium | TASK-001     | -     |
```

## Output Deliverables

1. **Optimization Plan** (comprehensive document)
2. **Individual Task Definitions** (detailed tasks)
3. **Task Tracking** (ongoing tracking)
4. **Risk Assessment** (risk mitigation strategies)

## Quality Criteria

**Good optimization plan:**
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
Create an optimization plan for system architecture based on the tradeoff analysis.
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
- PLAYBOOK_03: Analyze Tradeoffs (use before this)
- PLAYBOOK_05: Implement Optimization (use after this)
- PLAYBOOK_02: Evaluate Alternatives (use after implementation)

