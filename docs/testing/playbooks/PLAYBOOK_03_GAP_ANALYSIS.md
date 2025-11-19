# Playbook 03: Gap Analysis

## Purpose

This playbook provides step-by-step instructions for analyzing gaps between documented testing strategy and actual test implementation and coverage requirements. Use this to identify discrepancies across test types, coverage, and requirements, and prioritize them for improvement.

## When to Use This Playbook

- After validating strategy (PLAYBOOK_02) with discrepancies found
- Before planning improvements (PLAYBOOK_04)
- During Phase 2 of the refactoring process
- When code and documentation have drifted
- Regular maintenance (quarterly gap analysis)

## Prerequisites

- Testing strategy document exists
- Validation report exists (from PLAYBOOK_02)
- Understanding of desired state vs. current state

## Instructions for AI Assistant

### Step 1: Review Validation Results

**Your task:**
1. Read the validation report (from PLAYBOOK_02)
2. Categorize discrepancies by layer:
   - Strategy Layer (test types, coverage goals, patterns)
   - Implementation Layer (test files, test patterns, test quality)
   - Coverage Layer (coverage metrics, coverage gaps)

3. Identify severity:
   - **Critical**: Breaks test coverage or quality
   - **High**: Significant test/coverage issues
   - **Medium**: Minor discrepancies, technical debt
   - **Low**: Cosmetic or documentation only

### Step 2: Analyze Strategy Layer Gaps

**Compare documented strategy to actual strategy:**

1. **Test Type Analysis:**
   - Are documented test types implemented?
   - Are there test types not documented?
   - Are there documented test types not implemented?

2. **Coverage Goal Analysis:**
   - Do coverage goals match actual coverage?
   - Are there coverage goal mismatches?
   - Are there missing coverage goals?

3. **Pattern Analysis:**
   - Do test patterns match documentation?
   - Are there pattern mismatches?
   - Are there missing patterns?

**Gap categories:**
- Missing strategy elements (documented but not implemented)
- Extra test types (implemented but not documented)
- Strategy mismatches (different approaches)

### Step 3: Analyze Implementation Layer Gaps

**Compare strategy to test implementation:**

1. **Test File Analysis:**
   - Do test files match strategy?
   - Are there test files not in strategy?
   - Are there strategy test types not implemented?

2. **Test Pattern Analysis:**
   - Do test patterns match strategy?
   - Are there pattern mismatches?
   - Are there missing patterns?

3. **Test Quality Analysis:**
   - Does test quality match strategy?
   - Are there quality mismatches?
   - Are there quality gaps?

**Gap categories:**
- Missing implementation (strategy not implemented)
- Extra implementation (tests exist but not in strategy)
- Pattern mismatches (implementation differs from strategy)

### Step 4: Analyze Coverage Layer Gaps

**Compare strategy to coverage requirements:**

1. **Coverage Goal Analysis:**
   - Do coverage goals meet requirements?
   - Are there coverage gaps?
   - Are there missing coverage goals?

2. **Coverage Metric Analysis:**
   - Do coverage metrics match goals?
   - Are there metric mismatches?
   - Are there missing metrics?

3. **Coverage Area Analysis:**
   - Do coverage areas match requirements?
   - Are there area gaps?
   - Are there missing areas?

**Gap categories:**
- Missing coverage (requirements not met)
- Coverage gaps (actual coverage below goals)
- Metric mismatches (metrics differ from goals)

### Step 5: Cross-Layer Impact Analysis

**Analyze how gaps in one layer affect others:**

1. **Strategy → Implementation Impact:**
   - If strategy differs, how does it affect implementation?
   - If patterns differ, how does it affect test quality?

2. **Strategy → Coverage Impact:**
   - If strategy differs, how does it affect coverage?
   - If goals differ, how does it affect coverage?

3. **Implementation ↔ Coverage Impact:**
   - If implementation/coverage needs differ, how does it affect strategy?
   - If test quality differs, how does it affect coverage?

**Create impact matrix:**
```
Gap → Affects Strategy → Affects Implementation → Affects Coverage
[Gap description] → [Strategy impact] → [Implementation impact] → [Coverage impact]
```

### Step 6: Prioritize Gaps

**For each gap, assign priority:**

**Priority Factors:**
- **Severity**: Critical, High, Medium, Low
- **User Impact**: High (affects many users), Medium, Low
- **Coverage Impact**: High (affects coverage significantly), Medium, Low
- **Dependencies**: Blocks other work, Depends on other work, Independent
- **Effort**: Large, Medium, Small

**Categories:**
- **P0 - Critical**: Must fix immediately (breaks coverage)
- **P1 - High**: Fix in next sprint (significant issues)
- **P2 - Medium**: Fix in next quarter (minor issues, technical debt)
- **P3 - Low**: Fix when convenient (cosmetic, documentation)

### Step 7: Generate Gap Analysis Report

**Create comprehensive gap analysis:**

```markdown
# Testing Strategy Gap Analysis Report

**Date**: [YYYY-MM-DD]
**Analyst**: AI Assistant
**Testing Strategy Version**: [version]

## Executive Summary

- **Total Gaps Identified**: [number]
- **Critical Gaps**: [number]
- **High Priority Gaps**: [number]
- **Medium Priority Gaps**: [number]
- **Low Priority Gaps**: [number]

## Gap Summary by Layer

### Strategy Layer
- **Missing Elements**: [count]
- **Extra Elements**: [count]
- **Strategy Mismatches**: [count]

### Implementation Layer
- **Missing Implementation**: [count]
- **Extra Implementation**: [count]
- **Pattern Mismatches**: [count]

### Coverage Layer
- **Missing Coverage**: [count]
- **Coverage Gaps**: [count]
- **Metric Mismatches**: [count]

## Detailed Gap Analysis

### Gap 1: [Gap Name]

**Layer**: Strategy | Implementation | Coverage
**Severity**: Critical | High | Medium | Low
**Priority**: P0 | P1 | P2 | P3

**Description**: [Detailed description]

**Current State**: [What currently exists]

**Desired State**: [What should exist per strategy/requirements]

**Impact**:
- Strategy Impact: [description]
- Implementation Impact: [description]
- Coverage Impact: [description]

**Root Cause**: [Why this gap exists]

**Recommendation**: [How to fix this gap]

**Effort Estimate**: [Small | Medium | Large]
**Dependencies**: [List dependencies]

**Code References**:
- Current: `file.test.ts:line`
- Should be: `file.test.ts:line` (or new implementation)

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

## Improvement Roadmap

[High-level plan for addressing gaps]

## Next Steps

1. [ ] Review gap analysis with stakeholders
2. [ ] Prioritize gaps (if not done)
3. [ ] Create improvement tasks (use PLAYBOOK_04)
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
Perform gap analysis for the testing strategy.
Compare the documented strategy to test implementation and coverage requirements.
Identify gaps across strategy, implementation, and coverage layers.
Prioritize gaps and create an improvement roadmap.
```

## Next Steps

After gap analysis:
1. **Review with stakeholders** → Get approval on priorities
2. **Create improvement plan** → Use PLAYBOOK_04
3. **Begin addressing gaps** → Use PLAYBOOK_05

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Coverage (use before this)
- PLAYBOOK_04: Plan Improvements (use after this)
- PLAYBOOK_05: Implement Tests (use to fix gaps)

