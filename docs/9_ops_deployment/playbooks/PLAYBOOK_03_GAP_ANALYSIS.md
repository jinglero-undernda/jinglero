# Playbook 03: Gap Analysis

## Purpose

This playbook provides step-by-step instructions for analyzing gaps between documented deployment processes and actual deployment implementation and requirements. Use this to identify discrepancies across processes, environments, and infrastructure, and prioritize them for improvement.

## When to Use This Playbook

- After validating processes (PLAYBOOK_02) with discrepancies found
- Before planning improvements (PLAYBOOK_04)
- During Phase 2 of the refactoring process
- When code and documentation have drifted
- Regular maintenance (quarterly gap analysis)

## Prerequisites

- Deployment process document exists
- Validation report exists (from PLAYBOOK_02)
- Understanding of desired state vs. current state

## Instructions for AI Assistant

### Step 1: Review Validation Results

**Your task:**
1. Read the validation report (from PLAYBOOK_02)
2. Categorize discrepancies by layer:
   - Process Layer (deployment processes, deployment steps)
   - Environment Layer (environment configurations, environment variables)
   - Infrastructure Layer (infrastructure definitions, infrastructure provisioning)

3. Identify severity:
   - **Critical**: Breaks deployment or environment
   - **High**: Significant deployment issues
   - **Medium**: Minor discrepancies, deployment improvements
   - **Low**: Cosmetic or documentation only

### Step 2: Analyze Process Layer Gaps

**Compare documented processes to actual processes:**

1. **Process Analysis:**
   - Are documented processes implemented?
   - Are there processes not documented?
   - Are there documented processes not implemented?

2. **Deployment Step Analysis:**
   - Do deployment steps match documentation?
   - Are there step mismatches?
   - Are there missing steps?

3. **Automation Analysis:**
   - Do automation processes match documentation?
   - Are there automation mismatches?
   - Are there missing automations?

**Gap categories:**
- Missing processes (documented but not implemented)
- Extra processes (implemented but not documented)
- Process mismatches (different approaches)
- Step gaps (steps not followed)

### Step 3: Analyze Environment Layer Gaps

**Compare processes to environment configuration:**

1. **Environment Configuration Analysis:**
   - Do environment configurations match processes?
   - Are there configuration mismatches?
   - Are there missing configurations?

2. **Environment Variable Analysis:**
   - Do environment variables match processes?
   - Are there variable mismatches?
   - Are there missing variables?

3. **Environment Setup Analysis:**
   - Do environment setups match processes?
   - Are there setup mismatches?
   - Are there missing setups?

**Gap categories:**
- Missing configuration (processes not configured)
- Extra configuration (configured but not in processes)
- Configuration mismatches (configuration differs from processes)

### Step 4: Analyze Infrastructure Layer Gaps

**Compare processes to infrastructure:**

1. **Infrastructure Definition Analysis:**
   - Do infrastructure definitions match processes?
   - Are there definition mismatches?
   - Are there missing definitions?

2. **Provisioning Analysis:**
   - Do provisioning processes match processes?
   - Are there provisioning mismatches?
   - Are there missing provisioning?

3. **Management Analysis:**
   - Do management processes match processes?
   - Are there management mismatches?
   - Are there missing management?

**Gap categories:**
- Missing infrastructure (processes not provisioned)
- Extra infrastructure (provisioned but not in processes)
- Infrastructure mismatches (infrastructure differs from processes)

### Step 5: Cross-Layer Impact Analysis

**Analyze how gaps in one layer affect others:**

1. **Process → Environment Impact:**
   - If processes differ, how does it affect environments?
   - If deployment steps differ, how does it affect environment setup?

2. **Process → Infrastructure Impact:**
   - If processes differ, how does it affect infrastructure?
   - If deployment steps differ, how does it affect provisioning?

3. **Environment ↔ Infrastructure Impact:**
   - If environment/infrastructure needs differ, how does it affect processes?
   - If configuration differs, how does it affect infrastructure?

**Create impact matrix:**
```
Gap → Affects Processes → Affects Environments → Affects Infrastructure
[Gap description] → [Process impact] → [Environment impact] → [Infrastructure impact]
```

### Step 6: Prioritize Gaps

**For each gap, assign priority:**

**Priority Factors:**
- **Severity**: Critical, High, Medium, Low
- **Deployment Impact**: High (affects deployment significantly), Medium, Low
- **Environment Impact**: High (affects environments significantly), Medium, Low
- **Dependencies**: Blocks other work, Depends on other work, Independent
- **Effort**: Large, Medium, Small

**Categories:**
- **P0 - Critical**: Must fix immediately (breaks deployment)
- **P1 - High**: Fix in next sprint (significant issues)
- **P2 - Medium**: Fix in next quarter (minor issues, deployment improvements)
- **P3 - Low**: Fix when convenient (cosmetic, documentation)

### Step 7: Generate Gap Analysis Report

**Create comprehensive gap analysis:**

```markdown
# Deployment Gap Analysis Report

**Date**: [YYYY-MM-DD]
**Analyst**: AI Assistant
**Deployment Process Version**: [version]

## Executive Summary

- **Total Gaps Identified**: [number]
- **Critical Gaps**: [number]
- **High Priority Gaps**: [number]
- **Medium Priority Gaps**: [number]
- **Low Priority Gaps**: [number]

## Gap Summary by Layer

### Process Layer
- **Missing Processes**: [count]
- **Extra Processes**: [count]
- **Process Mismatches**: [count]
- **Step Gaps**: [count]

### Environment Layer
- **Missing Configuration**: [count]
- **Extra Configuration**: [count]
- **Configuration Mismatches**: [count]

### Infrastructure Layer
- **Missing Infrastructure**: [count]
- **Extra Infrastructure**: [count]
- **Infrastructure Mismatches**: [count]

## Detailed Gap Analysis

### Gap 1: [Gap Name]

**Layer**: Process | Environment | Infrastructure
**Severity**: Critical | High | Medium | Low
**Priority**: P0 | P1 | P2 | P3

**Description**: [Detailed description]

**Current State**: [What currently exists]

**Desired State**: [What should exist per processes/requirements]

**Impact**:
- Process Impact: [description]
- Environment Impact: [description]
- Infrastructure Impact: [description]

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
Perform gap analysis for the deployment processes.
Compare the documented processes to actual deployment and requirements.
Identify gaps across processes, environments, and infrastructure layers.
Prioritize gaps and create an improvement roadmap.
```

## Next Steps

After gap analysis:
1. **Review with stakeholders** → Get approval on priorities
2. **Create improvement plan** → Use PLAYBOOK_04
3. **Begin addressing gaps** → Use PLAYBOOK_05

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Environment (use before this)
- PLAYBOOK_04: Plan Improvements (use after this)
- PLAYBOOK_05: Implement Infrastructure (use to fix gaps)

