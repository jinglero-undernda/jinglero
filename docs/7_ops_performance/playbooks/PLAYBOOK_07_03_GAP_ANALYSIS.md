# Playbook 03: Gap Analysis

## Purpose

This playbook provides step-by-step instructions for analyzing gaps between documented performance targets and actual performance metrics and requirements. Use this to identify discrepancies across targets, metrics, and monitoring, and prioritize them for optimization.

## When to Use This Playbook

- After validating targets (PLAYBOOK_02) with discrepancies found
- Before planning optimization (PLAYBOOK_04)
- During Phase 2 of the refactoring process
- When code and documentation have drifted
- Regular maintenance (quarterly gap analysis)

## Prerequisites

- Performance target document exists
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
   - Target Layer (performance targets, target values)
   - Metrics Layer (metric definitions, metric tracking)
   - Monitoring Layer (monitoring tools, alerting, dashboards)

3. Identify severity:
   - **Critical**: Breaks performance or user experience
   - **High**: Significant performance issues
   - **Medium**: Minor discrepancies, optimization opportunities
   - **Low**: Cosmetic or documentation only

### Step 2: Analyze Target Layer Gaps

**Compare documented targets to actual targets:**

1. **Target Analysis:**
   - Are documented targets in requirements?
   - Are there targets not documented?
   - Are there documented targets not in requirements?

2. **Target Value Analysis:**
   - Do target values match requirements?
   - Are there value mismatches?
   - Are there missing target values?

3. **Target Achievement Analysis:**
   - Do targets match actual performance?
   - Are there achievement gaps?
   - Are there unrealistic targets?

**Gap categories:**
- Missing targets (documented but not in requirements)
- Extra targets (in requirements but not documented)
- Target mismatches (different values)
- Achievement gaps (targets not met)

### Step 3: Analyze Metrics Layer Gaps

**Compare targets to metrics:**

1. **Metric Definition Analysis:**
   - Do metric definitions match targets?
   - Are there definition mismatches?
   - Are there missing metrics?

2. **Metric Tracking Analysis:**
   - Are metrics tracked?
   - Is metric tracking accurate?
   - Are there tracking gaps?

3. **Metric Value Analysis:**
   - Do metric values match targets?
   - Are there value gaps?
   - Are there missing values?

**Gap categories:**
- Missing metrics (targets not tracked)
- Extra metrics (tracked but not in targets)
- Metric mismatches (definitions differ from targets)
- Tracking gaps (metrics not tracked)

### Step 4: Analyze Monitoring Layer Gaps

**Compare targets to monitoring:**

1. **Monitoring Tool Analysis:**
   - Are monitoring tools implemented?
   - Do tools match documented tools?
   - Are there tool mismatches?

2. **Alerting Analysis:**
   - Are alerting rules configured?
   - Do rules match documented rules?
   - Are there alerting gaps?

3. **Dashboard Analysis:**
   - Are dashboards configured?
   - Do dashboards match documented dashboards?
   - Are there dashboard gaps?

**Gap categories:**
- Missing monitoring (targets not monitored)
- Extra monitoring (monitored but not in targets)
- Monitoring mismatches (implementation differs from documentation)

### Step 5: Cross-Layer Impact Analysis

**Analyze how gaps in one layer affect others:**

1. **Target → Metrics Impact:**
   - If targets differ, how does it affect metrics?
   - If target values differ, how does it affect metric tracking?

2. **Target → Monitoring Impact:**
   - If targets differ, how does it affect monitoring?
   - If target values differ, how does it affect alerting?

3. **Metrics ↔ Monitoring Impact:**
   - If metrics/monitoring needs differ, how does it affect targets?
   - If metric tracking differs, how does it affect monitoring?

**Create impact matrix:**
```
Gap → Affects Targets → Affects Metrics → Affects Monitoring
[Gap description] → [Target impact] → [Metrics impact] → [Monitoring impact]
```

### Step 6: Prioritize Gaps

**For each gap, assign priority:**

**Priority Factors:**
- **Severity**: Critical, High, Medium, Low
- **User Impact**: High (affects many users), Medium, Low
- **Performance Impact**: High (affects performance significantly), Medium, Low
- **Dependencies**: Blocks other work, Depends on other work, Independent
- **Effort**: Large, Medium, Small

**Categories:**
- **P0 - Critical**: Must fix immediately (breaks performance)
- **P1 - High**: Fix in next sprint (significant issues)
- **P2 - Medium**: Fix in next quarter (minor issues, optimization opportunities)
- **P3 - Low**: Fix when convenient (cosmetic, documentation)

### Step 7: Generate Gap Analysis Report

**Create comprehensive gap analysis:**

```markdown
# Performance Gap Analysis Report

**Date**: [YYYY-MM-DD]
**Analyst**: AI Assistant
**Performance Target Version**: [version]

## Executive Summary

- **Total Gaps Identified**: [number]
- **Critical Gaps**: [number]
- **High Priority Gaps**: [number]
- **Medium Priority Gaps**: [number]
- **Low Priority Gaps**: [number]

## Gap Summary by Layer

### Target Layer
- **Missing Targets**: [count]
- **Extra Targets**: [count]
- **Target Mismatches**: [count]
- **Achievement Gaps**: [count]

### Metrics Layer
- **Missing Metrics**: [count]
- **Extra Metrics**: [count]
- **Metric Mismatches**: [count]
- **Tracking Gaps**: [count]

### Monitoring Layer
- **Missing Monitoring**: [count]
- **Extra Monitoring**: [count]
- **Monitoring Mismatches**: [count]

## Detailed Gap Analysis

### Gap 1: [Gap Name]

**Layer**: Target | Metrics | Monitoring
**Severity**: Critical | High | Medium | Low
**Priority**: P0 | P1 | P2 | P3

**Description**: [Detailed description]

**Current State**: [What currently exists]

**Desired State**: [What should exist per targets/requirements]

**Impact**:
- Target Impact: [description]
- Metrics Impact: [description]
- Monitoring Impact: [description]

**Root Cause**: [Why this gap exists]

**Recommendation**: [How to fix this gap]

**Effort Estimate**: [Small | Medium | Large]
**Dependencies**: [List dependencies]

**Code References**:
- Current: `file.ts:line`
- Should be: `file.ts:line` (or new implementation)

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

## Optimization Roadmap

[High-level plan for addressing gaps]

## Next Steps

1. [ ] Review gap analysis with stakeholders
2. [ ] Prioritize gaps (if not done)
3. [ ] Create optimization tasks (use PLAYBOOK_04)
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
Perform gap analysis for the performance targets.
Compare the documented targets to actual metrics and monitoring.
Identify gaps across targets, metrics, and monitoring layers.
Prioritize gaps and create an optimization roadmap.
```

## Next Steps

After gap analysis:
1. **Review with stakeholders** → Get approval on priorities
2. **Create optimization plan** → Use PLAYBOOK_04
3. **Begin addressing gaps** → Use PLAYBOOK_05

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Metrics (use before this)
- PLAYBOOK_04: Plan Optimization (use after this)
- PLAYBOOK_05: Implement Monitoring (use to fix gaps)

