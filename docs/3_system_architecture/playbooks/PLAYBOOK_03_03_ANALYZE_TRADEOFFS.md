# Playbook 03: Analyze Tradeoffs

## Purpose

This playbook provides step-by-step instructions for analyzing tradeoffs between architectural alternatives, evaluating performance/cost/UX impacts, and prioritizing optimization opportunities. Use this to make informed decisions about architectural changes.

## When to Use This Playbook

- After evaluating alternatives (PLAYBOOK_02)
- Before planning optimizations (PLAYBOOK_04)
- When analyzing optimization opportunities
- During Phase 2 of the refactoring process
- Regular maintenance (quarterly tradeoff analysis)

## Prerequisites

- Alternatives evaluated (from PLAYBOOK_02) or alternatives to analyze
- Understanding of requirements (performance, cost, UX)
- Current architecture documented

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

### Step 1: Review Alternatives

**Your task:**
1. Read the evaluation report (from PLAYBOOK_02) or identify alternatives
2. Understand each alternative's characteristics
3. Identify tradeoff dimensions (performance, cost, UX, complexity)

### Step 2: Analyze Performance vs. Cost Tradeoffs

**For each alternative, analyze performance/cost tradeoff:**

1. **Performance Benefits:**
   - What performance improvements?
   - What are the performance gains?
   - What are the performance costs?

2. **Cost Implications:**
   - What cost increases?
   - What are the cost savings?
   - What are the cost tradeoffs?

3. **Tradeoff Analysis:**
   - Is performance gain worth cost increase?
   - What is the cost per performance unit?
   - What is the break-even point?

**Tradeoff template:**
```markdown
## Performance vs. Cost: [Alternative Name]

### Performance Benefits
- [Benefit 1]: [Description]
- [Benefit 2]: [Description]

### Cost Implications
- [Cost 1]: [Description]
- [Cost 2]: [Description]

### Tradeoff Analysis
- **Cost per Performance Unit**: [Calculation]
- **Break-even Point**: [When it pays off]
- **Recommendation**: [Is it worth it?]
```

### Step 3: Analyze Performance vs. UX Tradeoffs

**For each alternative, analyze performance/UX tradeoff:**

1. **Performance Impact on UX:**
   - How does performance affect UX?
   - What UX improvements from performance?
   - What UX costs from performance?

2. **UX Impact on Performance:**
   - How does UX affect performance?
   - What performance costs from UX?
   - What performance benefits from UX?

3. **Tradeoff Analysis:**
   - Is UX improvement worth performance cost?
   - What is the optimal balance?
   - What are the user expectations?

**Tradeoff template:**
```markdown
## Performance vs. UX: [Alternative Name]

### Performance Impact on UX
- [Impact 1]: [Description]
- [Impact 2]: [Description]

### UX Impact on Performance
- [Impact 1]: [Description]
- [Impact 2]: [Description]

### Tradeoff Analysis
- **Optimal Balance**: [Description]
- **User Expectations**: [What users expect]
- **Recommendation**: [Optimal approach]
```

### Step 4: Analyze Cost vs. UX Tradeoffs

**For each alternative, analyze cost/UX tradeoff:**

1. **Cost Impact on UX:**
   - How does cost affect UX?
   - What UX improvements from cost?
   - What UX costs from cost savings?

2. **UX Impact on Cost:**
   - How does UX affect cost?
   - What cost increases from UX?
   - What cost savings from UX?

3. **Tradeoff Analysis:**
   - Is UX improvement worth cost increase?
   - What is the cost per UX unit?
   - What is the ROI?

**Tradeoff template:**
```markdown
## Cost vs. UX: [Alternative Name]

### Cost Impact on UX
- [Impact 1]: [Description]
- [Impact 2]: [Description]

### UX Impact on Cost
- [Impact 1]: [Description]
- [Impact 2]: [Description]

### Tradeoff Analysis
- **Cost per UX Unit**: [Calculation]
- **ROI**: [Return on investment]
- **Recommendation**: [Is it worth it?]
```

### Step 5: Analyze Complexity Tradeoffs

**For each alternative, analyze complexity tradeoffs:**

1. **Complexity Impact:**
   - How does complexity affect other dimensions?
   - What are the complexity costs?
   - What are the complexity benefits?

2. **Tradeoff Analysis:**
   - Is complexity increase worth benefits?
   - What is the complexity ROI?
   - What are the maintenance implications?

### Step 6: Prioritize Optimization Opportunities

**For each tradeoff, assign priority:**

**Priority Factors:**
- **Impact**: High (significant improvement), Medium, Low
- **Effort**: Small, Medium, Large
- **ROI**: High (high return), Medium, Low
- **Risk**: Low (low risk), Medium, High
- **Dependencies**: Blocks other work, Depends on other work, Independent

**Categories:**
- **P0 - Critical**: Must optimize immediately (high impact, high ROI)
- **P1 - High**: Optimize in next sprint (high impact, good ROI)
- **P2 - Medium**: Optimize in next quarter (medium impact, acceptable ROI)
- **P3 - Low**: Optimize when convenient (low impact, low ROI)

### Step 7: Generate Tradeoff Analysis Report

**Create comprehensive tradeoff analysis:**

```markdown
# Architecture Tradeoff Analysis Report

**Date**: [YYYY-MM-DD]
**Analyst**: AI Assistant
**Context**: [Analysis context]

## Executive Summary

- **Alternatives Analyzed**: [number]
- **Tradeoffs Identified**: [number]
- **Optimization Opportunities**: [number]
- **Recommended Priorities**: [Summary]

## Tradeoff Analysis

### Tradeoff 1: [Tradeoff Name]

**Alternatives**: [List alternatives]

**Performance vs. Cost**:
- [Analysis]

**Performance vs. UX**:
- [Analysis]

**Cost vs. UX**:
- [Analysis]

**Complexity**:
- [Analysis]

**Recommendation**: [Recommended approach]

**Priority**: [P0 | P1 | P2 | P3]

---

[Repeat for each tradeoff]

## Prioritized Optimization Opportunities

### P0 - Critical (Optimize Immediately)
1. [Opportunity name] - [Brief description]
   - **Impact**: [High | Medium | Low]
   - **Effort**: [Small | Medium | Large]
   - **ROI**: [High | Medium | Low]

### P1 - High (Optimize in Next Sprint)
1. [Opportunity name] - [Brief description]

### P2 - Medium (Optimize in Next Quarter)
1. [Opportunity name] - [Brief description]

### P3 - Low (Optimize When Convenient)
1. [Opportunity name] - [Brief description]

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

[High-level plan for addressing opportunities]

## Next Steps

1. [ ] Review tradeoff analysis with stakeholders
2. [ ] Prioritize opportunities (if not done)
3. [ ] Create optimization tasks (use PLAYBOOK_04)
4. [ ] Begin addressing P0 opportunities
```

## Output Deliverables

1. **Tradeoff Analysis Report** (comprehensive document)
2. **Prioritized Optimization Opportunities** (actionable list)
3. **Optimization Roadmap** (high-level plan)

## Quality Criteria

**Good tradeoff analysis:**
- ✅ All tradeoffs analyzed
- ✅ All dimensions considered
- ✅ Clear priorities assigned
- ✅ Actionable recommendations
- ✅ ROI calculations provided

**Red flags:**
- ❌ Tradeoffs not fully analyzed
- ❌ Missing dimensions
- ❌ Vague priorities
- ❌ No recommendations
- ❌ Missing ROI calculations

## Example Prompts for User

```
Analyze tradeoffs for caching strategies.
Compare performance, cost, UX, and complexity impacts.
Prioritize optimization opportunities and create a roadmap.
```

## Next Steps

After tradeoff analysis:
1. **Review with stakeholders** → Get approval on priorities
2. **Create optimization plan** → Use PLAYBOOK_04
3. **Begin addressing opportunities** → Use PLAYBOOK_05

---

**Related Playbooks:**
- PLAYBOOK_02: Evaluate Alternatives (use before this)
- PLAYBOOK_04: Plan Optimization (use after this)
- PLAYBOOK_05: Implement Optimization (use to implement opportunities)

