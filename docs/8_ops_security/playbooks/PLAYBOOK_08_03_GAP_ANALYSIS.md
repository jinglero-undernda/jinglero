# Playbook 03: Gap Analysis

## Purpose

This playbook provides step-by-step instructions for analyzing gaps between documented security requirements and actual security implementation and compliance requirements. Use this to identify discrepancies across requirements, implementation, and compliance, and prioritize them for improvement.

## When to Use This Playbook

- After validating requirements (PLAYBOOK_02) with discrepancies found
- Before planning improvements (PLAYBOOK_04)
- During Phase 2 of the refactoring process
- When code and documentation have drifted
- Regular maintenance (quarterly gap analysis)

## Prerequisites

- Security requirement document exists
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
   - Requirement Layer (security requirements, security goals)
   - Implementation Layer (authentication, authorization, data protection)
   - Compliance Layer (compliance standards, compliance rules)

3. Identify severity:
   - **Critical**: Breaks security or compliance
   - **High**: Significant security issues
   - **Medium**: Minor discrepancies, security improvements
   - **Low**: Cosmetic or documentation only

### Step 2: Analyze Requirement Layer Gaps

**Compare documented requirements to actual requirements:**

1. **Requirement Analysis:**
   - Are documented requirements in code/standards?
   - Are there requirements not documented?
   - Are there documented requirements not in code/standards?

2. **Security Goal Analysis:**
   - Do security goals match requirements?
   - Are there goal mismatches?
   - Are there missing security goals?

3. **Threat Model Analysis:**
   - Do threat models match requirements?
   - Are there threat model mismatches?
   - Are there missing threat models?

**Gap categories:**
- Missing requirements (documented but not in code/standards)
- Extra requirements (in code/standards but not documented)
- Requirement mismatches (different approaches)
- Security goal gaps (goals not met)

### Step 3: Analyze Implementation Layer Gaps

**Compare requirements to security implementation:**

1. **Authentication Analysis:**
   - Do authentication methods match requirements?
   - Are there authentication mismatches?
   - Are there missing authentication methods?

2. **Authorization Analysis:**
   - Do authorization rules match requirements?
   - Are there authorization mismatches?
   - Are there missing authorization rules?

3. **Data Protection Analysis:**
   - Do protection measures match requirements?
   - Are there protection mismatches?
   - Are there missing protection measures?

**Gap categories:**
- Missing implementation (requirements not implemented)
- Extra implementation (security exists but not in requirements)
- Implementation mismatches (implementation differs from requirements)

### Step 4: Analyze Compliance Layer Gaps

**Compare requirements to compliance:**

1. **Compliance Standard Analysis:**
   - Do compliance standards match requirements?
   - Are there standard mismatches?
   - Are there missing standards?

2. **Compliance Rule Analysis:**
   - Do compliance rules match requirements?
   - Are there rule mismatches?
   - Are there missing rules?

3. **Compliance Validation Analysis:**
   - Is compliance validated?
   - Are there validation gaps?
   - Are there missing validation?

**Gap categories:**
- Missing compliance (requirements not compliant)
- Compliance gaps (compliance not met)
- Validation gaps (compliance not validated)

### Step 5: Cross-Layer Impact Analysis

**Analyze how gaps in one layer affect others:**

1. **Requirement → Implementation Impact:**
   - If requirements differ, how does it affect implementation?
   - If security goals differ, how does it affect security?

2. **Requirement → Compliance Impact:**
   - If requirements differ, how does it affect compliance?
   - If security goals differ, how does it affect compliance?

3. **Implementation ↔ Compliance Impact:**
   - If implementation/compliance needs differ, how does it affect requirements?
   - If security measures differ, how does it affect compliance?

**Create impact matrix:**
```
Gap → Affects Requirements → Affects Implementation → Affects Compliance
[Gap description] → [Requirement impact] → [Implementation impact] → [Compliance impact]
```

### Step 6: Prioritize Gaps

**For each gap, assign priority:**

**Priority Factors:**
- **Severity**: Critical, High, Medium, Low
- **Security Impact**: High (affects security significantly), Medium, Low
- **Compliance Impact**: High (affects compliance significantly), Medium, Low
- **Dependencies**: Blocks other work, Depends on other work, Independent
- **Effort**: Large, Medium, Small

**Categories:**
- **P0 - Critical**: Must fix immediately (breaks security/compliance)
- **P1 - High**: Fix in next sprint (significant issues)
- **P2 - Medium**: Fix in next quarter (minor issues, security improvements)
- **P3 - Low**: Fix when convenient (cosmetic, documentation)

### Step 7: Generate Gap Analysis Report

**Create comprehensive gap analysis:**

```markdown
# Security Gap Analysis Report

**Date**: [YYYY-MM-DD]
**Analyst**: AI Assistant
**Security Requirement Version**: [version]

## Executive Summary

- **Total Gaps Identified**: [number]
- **Critical Gaps**: [number]
- **High Priority Gaps**: [number]
- **Medium Priority Gaps**: [number]
- **Low Priority Gaps**: [number]

## Gap Summary by Layer

### Requirement Layer
- **Missing Requirements**: [count]
- **Extra Requirements**: [count]
- **Requirement Mismatches**: [count]
- **Security Goal Gaps**: [count]

### Implementation Layer
- **Missing Implementation**: [count]
- **Extra Implementation**: [count]
- **Implementation Mismatches**: [count]

### Compliance Layer
- **Missing Compliance**: [count]
- **Compliance Gaps**: [count]
- **Validation Gaps**: [count]

## Detailed Gap Analysis

### Gap 1: [Gap Name]

**Layer**: Requirement | Implementation | Compliance
**Severity**: Critical | High | Medium | Low
**Priority**: P0 | P1 | P2 | P3

**Description**: [Detailed description]

**Current State**: [What currently exists]

**Desired State**: [What should exist per requirements/compliance]

**Impact**:
- Requirement Impact: [description]
- Implementation Impact: [description]
- Compliance Impact: [description]

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
Perform gap analysis for the security requirements.
Compare the documented requirements to actual implementation and compliance.
Identify gaps across requirements, implementation, and compliance layers.
Prioritize gaps and create an improvement roadmap.
```

## Next Steps

After gap analysis:
1. **Review with stakeholders** → Get approval on priorities
2. **Create improvement plan** → Use PLAYBOOK_04
3. **Begin addressing gaps** → Use PLAYBOOK_05

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Implementation (use before this)
- PLAYBOOK_04: Plan Improvements (use after this)
- PLAYBOOK_05: Implement Security (use to fix gaps)

