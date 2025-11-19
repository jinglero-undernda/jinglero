# Playbook 03: Gap Analysis

## Purpose

This playbook provides step-by-step instructions for analyzing gaps between documented design system and actual implementation. Use this to identify discrepancies across design tokens, components, and visual patterns, and prioritize them for refactoring.

## When to Use This Playbook

- After validating design system (PLAYBOOK_02) with discrepancies found
- Before planning refactoring (PLAYBOOK_04)
- During Phase 2 of the refactoring process
- When code and documentation have drifted
- Regular maintenance (quarterly gap analysis)

## Prerequisites

- Design system document exists
- Validation report exists (from PLAYBOOK_02)
- Understanding of desired state vs. current state

## Instructions for AI Assistant

### Step 1: Review Validation Results

**Your task:**
1. Read the validation report (from PLAYBOOK_02)
2. Categorize discrepancies by layer:
   - Design Token Layer (colors, typography, spacing)
   - Component Layer (button styles, card styles, etc.)
   - Visual Pattern Layer (layout patterns, consistency)

3. Identify severity:
   - **Critical**: Breaks visual consistency or user experience
   - **High**: Significant design inconsistencies
   - **Medium**: Minor discrepancies, technical debt
   - **Low**: Cosmetic or documentation only

### Step 2: Analyze Design Token Gaps

**Compare documented tokens to actual CSS:**

1. **Token Existence:**
   - Are documented tokens in CSS?
   - Are there CSS tokens not documented?
   - Are there documented tokens not in CSS?

2. **Token Values:**
   - Do token values match documentation?
   - Are there value mismatches?
   - Are there unused tokens?

3. **Token Usage:**
   - Is token usage consistent?
   - Are tokens used according to guidelines?
   - Are there violations of usage rules?

**Gap categories:**
- Missing tokens (documented but not in CSS)
- Extra tokens (in CSS but not documented)
- Value mismatches (different values)
- Usage violations (not used according to guidelines)

### Step 3: Analyze Component Style Gaps

**Compare documented components to actual styles:**

1. **Component Existence:**
   - Are documented components styled?
   - Are there styled components not documented?
   - Are there documented components not styled?

2. **Style Specifications:**
   - Do styles match specifications?
   - Are there missing variants?
   - Are there missing states?

3. **Component Usage:**
   - Are components used correctly?
   - Are there style overrides?
   - Are there inconsistencies?

**Gap categories:**
- Missing styles (documented but not implemented)
- Extra styles (implemented but not documented)
- Style mismatches (different styles)
- Usage inconsistencies

### Step 4: Analyze Visual Pattern Gaps

**Compare documented patterns to actual implementation:**

1. **Pattern Implementation:**
   - Are patterns implemented?
   - Are there patterns not documented?
   - Are there documented patterns not implemented?

2. **Pattern Consistency:**
   - Is pattern usage consistent?
   - Are there pattern violations?
   - Are there inconsistencies?

**Gap categories:**
- Missing patterns (documented but not implemented)
- Extra patterns (implemented but not documented)
- Pattern inconsistencies

### Step 5: Cross-Layer Impact Analysis

**Analyze how gaps in one layer affect others:**

1. **Token → Component Impact:**
   - If tokens differ, how does it affect components?
   - If token usage differs, how does it affect consistency?

2. **Component → Pattern Impact:**
   - If components differ, how does it affect patterns?
   - If component usage differs, how does it affect consistency?

**Create impact matrix:**
```
Gap → Affects Tokens → Affects Components → Affects Patterns
[Gap description] → [Token impact] → [Component impact] → [Pattern impact]
```

### Step 6: Prioritize Gaps

**For each gap, assign priority:**

**Priority Factors:**
- **Severity**: Critical, High, Medium, Low
- **User Impact**: High (affects many users), Medium, Low
- **Visual Impact**: High (obvious inconsistencies), Medium, Low
- **Dependencies**: Blocks other work, Depends on other work, Independent
- **Effort**: Large, Medium, Small

**Categories:**
- **P0 - Critical**: Must fix immediately (breaks consistency)
- **P1 - High**: Fix in next sprint (significant inconsistencies)
- **P2 - Medium**: Fix in next quarter (minor issues, technical debt)
- **P3 - Low**: Fix when convenient (cosmetic, documentation)

### Step 7: Generate Gap Analysis Report

**Create comprehensive gap analysis:**

```markdown
# Design System Gap Analysis Report

**Date**: [YYYY-MM-DD]
**Analyst**: AI Assistant
**Design System Version**: [version]

## Executive Summary

- **Total Gaps Identified**: [number]
- **Critical Gaps**: [number]
- **High Priority Gaps**: [number]
- **Medium Priority Gaps**: [number]
- **Low Priority Gaps**: [number]

## Gap Summary by Layer

### Design Token Layer
- **Missing Tokens**: [count]
- **Extra Tokens**: [count]
- **Value Mismatches**: [count]
- **Usage Violations**: [count]

### Component Layer
- **Missing Styles**: [count]
- **Extra Styles**: [count]
- **Style Mismatches**: [count]
- **Usage Inconsistencies**: [count]

### Visual Pattern Layer
- **Missing Patterns**: [count]
- **Extra Patterns**: [count]
- **Pattern Inconsistencies**: [count]

## Detailed Gap Analysis

### Gap 1: [Gap Name]

**Layer**: Design Token | Component | Visual Pattern
**Severity**: Critical | High | Medium | Low
**Priority**: P0 | P1 | P2 | P3

**Description**: [Detailed description]

**Current State**: [What currently exists]

**Desired State**: [What should exist per design system]

**Impact**: [Visual impact, user impact, consistency impact]

**Root Cause**: [Why this gap exists]

**Recommendation**: [How to fix]

**Effort Estimate**: [Small | Medium | Large]
**Dependencies**: [List dependencies]

**Code References**:
- Current: `file.css:line`
- Should be: `file.css:line` (or new implementation)

---

[Repeat for each gap]

## Prioritized Gap List

### P0 - Critical (Fix Immediately)
1. [Gap name] - [Brief description]

### P1 - High (Fix in Next Sprint)
1. [Gap name] - [Brief description]

### P2 - Medium (Fix in Next Quarter)
1. [Gap name] - [Brief description]

### P3 - Low (Fix When Convenient)
1. [Gap name] - [Brief description]

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
Perform gap analysis for the design system.
Compare the documented design system to the actual CSS implementation.
Identify gaps across design tokens, components, and visual patterns.
Prioritize gaps and create a refactoring roadmap.
```

## Next Steps

After gap analysis:
1. **Review with stakeholders** → Get approval on priorities
2. **Create refactoring plan** → Use PLAYBOOK_04
3. **Begin addressing gaps** → Use PLAYBOOK_05

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Implementation (use before this)
- PLAYBOOK_04: Plan Refactor (use after this)
- PLAYBOOK_05: Implement Refactor (use to fix gaps)

