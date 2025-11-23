# Playbook 03: Gap Analysis

## Purpose

This playbook provides step-by-step instructions for analyzing gaps between documented schema and frontend/backend requirements. Use this to identify discrepancies across schema, frontend, and backend layers, and prioritize them for refactoring.

## When to Use This Playbook

- After validating schema (PLAYBOOK_02) with discrepancies found
- Before planning migration (PLAYBOOK_04)
- During Phase 2 of the refactoring process
- When code and documentation have drifted
- Regular maintenance (quarterly gap analysis)

## Prerequisites

- Schema document exists
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
   - Schema Layer (node types, relationships, properties)
   - Frontend Layer (TypeScript types, API usage, component needs)
   - Backend Layer (API endpoints, database queries, data handling)

3. Identify severity:
   - **Critical**: Breaks functionality or data integrity
   - **High**: Significant data/model issues
   - **Medium**: Minor discrepancies, technical debt
   - **Low**: Cosmetic or documentation only

### Step 2: Analyze Schema Layer Gaps

**Compare documented schema to actual schema:**

1. **Node Type Analysis:**
   - Are documented node types in database?
   - Are there node types not documented?
   - Are there documented node types not in database?

2. **Relationship Type Analysis:**
   - Are documented relationship types in database?
   - Are there relationship types not documented?
   - Are there documented relationship types not in database?

3. **Property Analysis:**
   - Are documented properties in schema?
   - Are there properties not documented?
   - Are there documented properties not in schema?

**Gap categories:**
- Missing schema elements (documented but not in database)
- Extra schema elements (in database but not documented)
- Schema mismatches (different definitions)

### Step 3: Analyze Frontend Layer Gaps

**Compare schema to frontend needs:**

1. **Type Definitions:**
   - Do TypeScript types match schema?
   - Are there type mismatches?
   - Are there missing types?

2. **API Usage:**
   - Do API calls match schema?
   - Are there API needs not in schema?
   - Are there schema elements not used by frontend?

3. **Component Needs:**
   - Do components need all schema properties?
   - Are there component needs not in schema?
   - Are there schema properties not used by components?

**Gap categories:**
- Missing properties (frontend needs but not in schema)
- Extra properties (in schema but not used by frontend)
- Type mismatches (TypeScript types differ from schema)

### Step 4: Analyze Backend Layer Gaps

**Compare schema to backend needs:**

1. **API Endpoints:**
   - Do API endpoints match schema?
   - Are there API needs not in schema?
   - Are there schema elements not exposed by API?

2. **Database Queries:**
   - Do queries match schema?
   - Are there query needs not in schema?
   - Are there schema elements not queried?

3. **Data Handling:**
   - Does data handling match schema?
   - Are there data handling needs not in schema?
   - Are there schema elements not handled?

**Gap categories:**
- Missing properties (backend needs but not in schema)
- Extra properties (in schema but not used by backend)
- Implementation mismatches (backend differs from schema)

### Step 5: Cross-Layer Impact Analysis

**Analyze how gaps in one layer affect others:**

1. **Schema → Frontend Impact:**
   - If schema differs, how does it affect frontend?
   - If properties differ, how does it affect components?

2. **Schema → Backend Impact:**
   - If schema differs, how does it affect backend?
   - If properties differ, how does it affect API?

3. **Frontend ↔ Backend Impact:**
   - If frontend/backend needs differ, how does it affect schema?
   - If API contracts differ, how does it affect schema?

**Create impact matrix:**
```
Gap → Affects Schema → Affects Frontend → Affects Backend
[Gap description] → [Schema impact] → [Frontend impact] → [Backend impact]
```

### Step 6: Prioritize Gaps

**For each gap, assign priority:**

**Priority Factors:**
- **Severity**: Critical, High, Medium, Low
- **User Impact**: High (affects many users), Medium, Low
- **Data Integrity**: High (affects data quality), Medium, Low
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
# Schema Gap Analysis Report

**Date**: [YYYY-MM-DD]
**Analyst**: AI Assistant
**Schema Version**: [version]

## Executive Summary

- **Total Gaps Identified**: [number]
- **Critical Gaps**: [number]
- **High Priority Gaps**: [number]
- **Medium Priority Gaps**: [number]
- **Low Priority Gaps**: [number]

## Gap Summary by Layer

### Schema Layer
- **Missing Elements**: [count]
- **Extra Elements**: [count]
- **Schema Mismatches**: [count]

### Frontend Layer
- **Missing Properties**: [count]
- **Extra Properties**: [count]
- **Type Mismatches**: [count]

### Backend Layer
- **Missing Properties**: [count]
- **Extra Properties**: [count]
- **Implementation Mismatches**: [count]

## Detailed Gap Analysis

### Gap 1: [Gap Name]

**Layer**: Schema | Frontend | Backend
**Severity**: Critical | High | Medium | Low
**Priority**: P0 | P1 | P2 | P3

**Description**: [Detailed description]

**Current State**: [What currently exists]

**Desired State**: [What should exist per schema/requirements]

**Impact**:
- Schema Impact: [description]
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

## Migration Roadmap

[High-level plan for addressing gaps]

## Next Steps

1. [ ] Review gap analysis with stakeholders
2. [ ] Prioritize gaps (if not done)
3. [ ] Create migration tasks (use PLAYBOOK_04)
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
Perform gap analysis for the database schema.
Compare the documented schema to frontend and backend requirements.
Identify gaps across schema, frontend, and backend layers.
Prioritize gaps and create a migration roadmap.
```

## Next Steps

After gap analysis:
1. **Review with stakeholders** → Get approval on priorities
2. **Create migration plan** → Use PLAYBOOK_04
3. **Begin addressing gaps** → Use PLAYBOOK_05

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Requirements (use before this)
- PLAYBOOK_04: Plan Migration (use after this)
- PLAYBOOK_05: Implement Migration (use to fix gaps)

