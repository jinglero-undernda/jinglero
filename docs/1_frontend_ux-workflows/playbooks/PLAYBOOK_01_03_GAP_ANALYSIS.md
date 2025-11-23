# Playbook 03: Gap Analysis

## Purpose

This playbook provides step-by-step instructions for analyzing gaps between documented workflows and code implementation. Use this to identify discrepancies across UX, UI, and technical layers, and prioritize them for refactoring.

## When to Use This Playbook

- After validating workflows (PLAYBOOK_02) with discrepancies found
- Before planning refactoring (PLAYBOOK_04)
- During Phase 2 of the refactoring process
- When code and documentation have drifted
- Regular maintenance (quarterly gap analysis)

## Prerequisites

- Workflow document exists
- Validation report exists (from PLAYBOOK_02)
- Understanding of desired state vs. current state

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

### Step 1: Review Validation Results

**Your task:**
1. Read the validation report (from PLAYBOOK_02)
2. Categorize discrepancies by layer:
   - UX Layer (user experience, flow)
   - UI Layer (visual states, components)
   - Technical Layer (API, state management, code)

3. Identify severity:
   - **Critical**: Breaks functionality or user experience
   - **High**: Significant UX/UI issues
   - **Medium**: Minor discrepancies, technical debt
   - **Low**: Cosmetic or documentation only

### Step 2: Analyze UX Layer Gaps

**Compare workflow UX to actual user experience:**

1. **User Flow Analysis:**
   - Does actual flow match documented flow?
   - Are there missing steps?
   - Are there extra steps not documented?

2. **User Actions:**
   - Do documented actions match actual UI?
   - Are there actions available but not documented?
   - Are there documented actions not available?

3. **System Responses:**
   - Do actual responses match documented responses?
   - Are there missing responses?
   - Are there undocumented responses?

**Gap categories:**
- Missing features (documented but not implemented)
- Extra features (implemented but not documented)
- Different behavior (implemented differently than documented)

### Step 3: Analyze UI Layer Gaps

**Compare workflow UI states to actual component states:**

1. **Visual States:**
   - Do documented visual states exist?
   - Are there visual states not documented?
   - Do visual transitions match?

2. **Component Behavior:**
   - Do components behave as documented?
   - Are there component behaviors not documented?
   - Do component props match workflow requirements?

3. **User Feedback:**
   - Do loading states match?
   - Do error states match?
   - Do success states match?

**Gap categories:**
- Missing UI states
- Extra UI states
- Different UI behavior

### Step 4: Analyze Technical Layer Gaps

**Compare workflow technical details to actual code:**

1. **State Management:**
   - Do state variables match?
   - Do state transitions match?
   - Are there state variables not documented?
   - Are there documented variables that don't exist?

2. **API Integration:**
   - Do API endpoints match?
   - Do request/response formats match?
   - Are there API calls not documented?
   - Are there documented calls that don't exist?

3. **Component Structure:**
   - Do component files match?
   - Do component responsibilities match?
   - Are there components not documented?
   - Are there documented components that don't exist?

**Gap categories:**
- Missing implementation (documented but not in code)
- Extra implementation (in code but not documented)
- Different implementation (code differs from documentation)

### Step 5: Cross-Layer Impact Analysis

**Analyze how gaps in one layer affect others:**

1. **UX → UI Impact:**
   - If UX flow differs, how does it affect UI states?
   - If user actions differ, how does it affect components?

2. **UI → Technical Impact:**
   - If UI states differ, how does it affect state management?
   - If components differ, how does it affect code structure?

3. **Technical → UX Impact:**
   - If API differs, how does it affect user experience?
   - If state management differs, how does it affect flow?

**Create impact matrix:**
```
Gap → Affects UX → Affects UI → Affects Technical
[Gap description] → [UX impact] → [UI impact] → [Technical impact]
```

### Step 6: Prioritize Gaps

**For each gap, assign priority:**

**Priority Factors:**
- **Severity**: Critical, High, Medium, Low
- **User Impact**: High (affects many users), Medium, Low
- **Technical Debt**: High (accumulating), Medium, Low
- **Dependencies**: Blocks other work, Depends on other work, Independent
- **Effort**: Large, Medium, Small

**Priority Matrix:**
```
Priority = f(Severity, User Impact, Technical Debt, Dependencies, Effort)
```

**Categories:**
- **P0 - Critical**: Must fix immediately (breaks functionality)
- **P1 - High**: Fix in next sprint (significant UX issues)
- **P2 - Medium**: Fix in next quarter (minor issues, technical debt)
- **P3 - Low**: Fix when convenient (cosmetic, documentation)

### Step 7: Generate Gap Analysis Report

**Create comprehensive gap analysis:**

```markdown
# WORKFLOW_XXX: [Name] - Gap Analysis Report

**Date**: [YYYY-MM-DD]
**Analyst**: AI Assistant
**Workflow Version**: [version]

## Executive Summary

- **Total Gaps Identified**: [number]
- **Critical Gaps**: [number]
- **High Priority Gaps**: [number]
- **Medium Priority Gaps**: [number]
- **Low Priority Gaps**: [number]

## Gap Summary by Layer

### UX Layer
- **Missing Features**: [count]
- **Extra Features**: [count]
- **Different Behavior**: [count]

### UI Layer
- **Missing States**: [count]
- **Extra States**: [count]
- **Different Behavior**: [count]

### Technical Layer
- **Missing Implementation**: [count]
- **Extra Implementation**: [count]
- **Different Implementation**: [count]

## Detailed Gap Analysis

### Gap 1: [Gap Name]

**Layer**: UX | UI | Technical
**Severity**: Critical | High | Medium | Low
**Priority**: P0 | P1 | P2 | P3

**Description**:
[Detailed description of the gap]

**Current State**:
[What currently exists]

**Desired State**:
[What should exist per workflow]

**Impact**:
- UX Impact: [description]
- UI Impact: [description]
- Technical Impact: [description]

**Root Cause**:
[Why this gap exists]

**Recommendation**:
[How to fix this gap]

**Effort Estimate**: [Small | Medium | Large]
**Dependencies**: [List dependencies]

**Code References**:
- Current: `file.tsx:line`
- Should be: `file.tsx:line` (or new implementation)

---

[Repeat for each gap]

## Prioritized Gap List

### P0 - Critical (Fix Immediately)
1. [Gap name] - [Brief description]
2. [etc.]

### P1 - High (Fix in Next Sprint)
1. [Gap name] - [Brief description]
2. [etc.]

### P2 - Medium (Fix in Next Quarter)
1. [Gap name] - [Brief description]
2. [etc.]

### P3 - Low (Fix When Convenient)
1. [Gap name] - [Brief description]
2. [etc.]

## Recommendations

### Immediate Actions
1. [Action 1]
2. [Action 2]

### Short-term Actions (Next Sprint)
1. [Action 1]
2. [Action 2]

### Long-term Actions (Next Quarter)
1. [Action 1]
2. [Action 2]

## Refactoring Roadmap

[High-level plan for addressing gaps]

## Next Steps

1. [ ] Review gap analysis with stakeholders
2. [ ] Prioritize gaps (if not done)
3. [ ] Create refactoring tasks (use PLAYBOOK_04)
4. [ ] Begin addressing P0 gaps
```

### Step 8: Create Gap Tracking

**Create a tracking document or update workflow:**

```markdown
## Gap Tracking

| Gap ID | Description | Layer | Priority | Status | Assigned | Notes |
|--------|-------------|-------|----------|--------|----------|-------|
| GAP-001 | [Description] | UX | P0 | Open | - | - |
| GAP-002 | [Description] | UI | P1 | Open | - | - |
```

## Output Deliverables

1. **Gap Analysis Report** (comprehensive document)
2. **Prioritized Gap List** (actionable list)
3. **Gap Tracking** (ongoing tracking)

## Quality Criteria

**Good gap analysis:**
- ✅ All discrepancies categorized
- ✅ Impact analyzed across layers
- ✅ Clear priorities assigned
- ✅ Actionable recommendations
- ✅ Effort estimates provided

**Red flags:**
- ❌ Gaps not categorized
- ❌ No priority assigned
- ❌ Vague recommendations
- ❌ No impact analysis
- ❌ Missing effort estimates

## Example Prompts for User

```
Perform gap analysis for WORKFLOW_001_entity-edit-mode.md.
Compare the documented workflow to the actual codebase implementation.
Identify gaps across UX, UI, and technical layers.
Prioritize gaps and create a refactoring roadmap.
```

## Next Steps

After gap analysis:
1. **Review with stakeholders** → Get approval on priorities
2. **Create refactoring plan** → Use PLAYBOOK_04
3. **Begin addressing gaps** → Use PLAYBOOK_05

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Workflow (use before this)
- PLAYBOOK_04: Plan Refactor (use after this)
- PLAYBOOK_05: Implement Refactor (use to fix gaps)

