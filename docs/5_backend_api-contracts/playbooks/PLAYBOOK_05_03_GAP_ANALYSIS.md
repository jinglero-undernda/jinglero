# Playbook 03: Gap Analysis

## Purpose

This playbook provides step-by-step instructions for analyzing gaps between documented API contracts and actual usage in frontend and backend code. Use this to identify discrepancies across contracts, frontend, and backend layers, and prioritize them for versioning.

## When to Use This Playbook

- After validating contracts (PLAYBOOK_02) with discrepancies found
- Before planning versioning (PLAYBOOK_04)
- During Phase 2 of the refactoring process
- When code and documentation have drifted
- Regular maintenance (quarterly gap analysis)

## Prerequisites

- API contract document exists
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
   - Contract Layer (endpoints, request/response formats, validation)
   - Frontend Layer (API calls, request/response handling, error handling)
   - Backend Layer (route handlers, validation, response formatting)

3. Identify severity:
   - **Critical**: Breaks functionality or API compatibility
   - **High**: Significant API/contract issues
   - **Medium**: Minor discrepancies, technical debt
   - **Low**: Cosmetic or documentation only

### Step 2: Analyze Contract Layer Gaps

**Compare documented contracts to actual API:**

1. **Endpoint Analysis:**
   - Are documented endpoints in code?
   - Are there endpoints not documented?
   - Are there documented endpoints not in code?

2. **Request/Response Format Analysis:**
   - Do formats match documentation?
   - Are there format mismatches?
   - Are there missing formats?

3. **Validation Analysis:**
   - Do validation rules match documentation?
   - Are there validation mismatches?
   - Are there missing validations?

**Gap categories:**
- Missing contracts (documented but not in code)
- Extra endpoints (in code but not documented)
- Format mismatches (different formats)
- Validation mismatches (different validation)

### Step 3: Analyze Frontend Layer Gaps

**Compare contracts to frontend usage:**

1. **API Call Analysis:**
   - Do API calls match contracts?
   - Are there API calls not in contracts?
   - Are there contract endpoints not used?

2. **Request Format Analysis:**
   - Do request formats match contracts?
   - Are there format mismatches?
   - Are there missing request fields?

3. **Response Handling Analysis:**
   - Does response handling match contracts?
   - Are there handling mismatches?
   - Are there missing response fields?

**Gap categories:**
- Missing usage (contracts not used by frontend)
- Extra usage (frontend uses endpoints not in contracts)
- Format mismatches (frontend formats differ from contracts)

### Step 4: Analyze Backend Layer Gaps

**Compare contracts to backend implementation:**

1. **Route Handler Analysis:**
   - Do route handlers match contracts?
   - Are there handlers not in contracts?
   - Are there contract endpoints not implemented?

2. **Validation Analysis:**
   - Does validation match contracts?
   - Are there validation mismatches?
   - Are there missing validations?

3. **Response Format Analysis:**
   - Do response formats match contracts?
   - Are there format mismatches?
   - Are there missing response fields?

**Gap categories:**
- Missing implementation (contracts not implemented)
- Extra implementation (backend has endpoints not in contracts)
- Format mismatches (backend formats differ from contracts)

### Step 5: Cross-Layer Impact Analysis

**Analyze how gaps in one layer affect others:**

1. **Contract → Frontend Impact:**
   - If contracts differ, how does it affect frontend?
   - If formats differ, how does it affect components?

2. **Contract → Backend Impact:**
   - If contracts differ, how does it affect backend?
   - If formats differ, how does it affect API?

3. **Frontend ↔ Backend Impact:**
   - If frontend/backend needs differ, how does it affect contracts?
   - If API usage differs, how does it affect contracts?

**Create impact matrix:**
```
Gap → Affects Contracts → Affects Frontend → Affects Backend
[Gap description] → [Contract impact] → [Frontend impact] → [Backend impact]
```

### Step 6: Prioritize Gaps

**For each gap, assign priority:**

**Priority Factors:**
- **Severity**: Critical, High, Medium, Low
- **User Impact**: High (affects many users), Medium, Low
- **API Compatibility**: High (breaks compatibility), Medium, Low
- **Dependencies**: Blocks other work, Depends on other work, Independent
- **Effort**: Large, Medium, Small

**Categories:**
- **P0 - Critical**: Must fix immediately (breaks functionality)
- **P1 - High**: Fix in next sprint (significant issues)
- **P2 - Medium**: Fix in next quarter (minor issues, technical debt)
- **P3 - Low**: Fix when convenient (cosmetic, documentation)

### Step 7: Generate Gap Analysis Report

**Create comprehensive gap analysis:**

```markdown
# API Contract Gap Analysis Report

**Date**: [YYYY-MM-DD]
**Analyst**: AI Assistant
**API Contract Version**: [version]

## Executive Summary

- **Total Gaps Identified**: [number]
- **Critical Gaps**: [number]
- **High Priority Gaps**: [number]
- **Medium Priority Gaps**: [number]
- **Low Priority Gaps**: [number]

## Gap Summary by Layer

### Contract Layer
- **Missing Contracts**: [count]
- **Extra Endpoints**: [count]
- **Format Mismatches**: [count]
- **Validation Mismatches**: [count]

### Frontend Layer
- **Missing Usage**: [count]
- **Extra Usage**: [count]
- **Format Mismatches**: [count]

### Backend Layer
- **Missing Implementation**: [count]
- **Extra Implementation**: [count]
- **Format Mismatches**: [count]

## Detailed Gap Analysis

### Gap 1: [Gap Name]

**Layer**: Contract | Frontend | Backend
**Severity**: Critical | High | Medium | Low
**Priority**: P0 | P1 | P2 | P3

**Description**: [Detailed description]

**Current State**: [What currently exists]

**Desired State**: [What should exist per contracts]

**Impact**:
- Contract Impact: [description]
- Frontend Impact: [description]
- Backend Impact: [description]

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

## Versioning Roadmap

[High-level plan for addressing gaps]

## Next Steps

1. [ ] Review gap analysis with stakeholders
2. [ ] Prioritize gaps (if not done)
3. [ ] Create versioning tasks (use PLAYBOOK_04)
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
Perform gap analysis for the API contracts.
Compare the documented contracts to frontend and backend usage.
Identify gaps across contracts, frontend, and backend layers.
Prioritize gaps and create a versioning roadmap.
```

## Next Steps

After gap analysis:
1. **Review with stakeholders** → Get approval on priorities
2. **Create versioning plan** → Use PLAYBOOK_04
3. **Begin addressing gaps** → Use PLAYBOOK_05

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Usage (use before this)
- PLAYBOOK_04: Plan Versioning (use after this)
- PLAYBOOK_05: Implement Versioning (use to fix gaps)

