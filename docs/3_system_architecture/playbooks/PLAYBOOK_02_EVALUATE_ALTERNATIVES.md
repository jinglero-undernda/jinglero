# Playbook 02: Evaluate Alternatives

## Purpose

This playbook provides step-by-step instructions for evaluating architectural alternatives, comparing different approaches for data handling, state management, caching, and performance optimization. Use this to make informed architectural decisions.

## When to Use This Playbook

- After documenting current architecture (PLAYBOOK_01)
- When considering architectural changes
- Before planning optimizations (PLAYBOOK_04)
- When evaluating new patterns or technologies
- Regular maintenance (quarterly evaluations)

## Prerequisites

- Current architecture documented (or understanding of current state)
- Alternatives to evaluate identified
- Understanding of requirements (performance, cost, UX)

## Instructions for AI Assistant

### Step 1: Understand the Evaluation Task

**User will provide:**
- Alternatives to evaluate (e.g., "client-side vs server-side caching")
- Evaluation criteria (performance, cost, UX, complexity)
- Context and constraints

**Your task:**
- Understand what alternatives to compare
- Identify evaluation criteria
- Understand current architecture context

### Step 2: Identify Alternatives

**For each alternative:**

1. **Alternative Description:**
   - What is this alternative?
   - How does it work?
   - What are its key characteristics?

2. **Implementation Requirements:**
   - What changes are needed?
   - What dependencies exist?
   - What risks are involved?

3. **Context:**
   - When is this alternative appropriate?
   - What constraints apply?
   - What assumptions are made?

### Step 3: Evaluate Performance Impact

**For each alternative, evaluate performance:**

1. **Query Performance:**
   - How does it affect database queries?
   - What is the query complexity?
   - What are the performance characteristics?

2. **Response Time:**
   - How does it affect API response times?
   - What is the latency impact?
   - What are the response time characteristics?

3. **Throughput:**
   - How does it affect system throughput?
   - What is the scalability impact?
   - What are the throughput characteristics?

**Evaluation template:**
```markdown
## Performance Evaluation: [Alternative Name]

### Query Performance
- **Impact**: [Positive | Negative | Neutral]
- **Details**: [Description]
- **Metrics**: [If available]

### Response Time
- **Impact**: [Positive | Negative | Neutral]
- **Details**: [Description]
- **Metrics**: [If available]

### Throughput
- **Impact**: [Positive | Negative | Neutral]
- **Details**: [Description]
- **Metrics**: [If available]
```

### Step 4: Evaluate Cost Impact

**For each alternative, evaluate cost:**

1. **Infrastructure Costs:**
   - How does it affect infrastructure costs?
   - What are the cost implications?
   - What are the cost characteristics?

2. **Development Costs:**
   - How does it affect development costs?
   - What is the implementation complexity?
   - What are the maintenance costs?

3. **Operational Costs:**
   - How does it affect operational costs?
   - What is the operational complexity?
   - What are the ongoing costs?

**Evaluation template:**
```markdown
## Cost Evaluation: [Alternative Name]

### Infrastructure Costs
- **Impact**: [Increase | Decrease | Neutral]
- **Details**: [Description]
- **Estimate**: [If available]

### Development Costs
- **Impact**: [Increase | Decrease | Neutral]
- **Details**: [Description]
- **Estimate**: [If available]

### Operational Costs
- **Impact**: [Increase | Decrease | Neutral]
- **Details**: [Description]
- **Estimate**: [If available]
```

### Step 5: Evaluate UX Impact

**For each alternative, evaluate UX:**

1. **User Experience:**
   - How does it affect user experience?
   - What is the UX impact?
   - What are the UX characteristics?

2. **User Interface:**
   - How does it affect user interface?
   - What is the UI impact?
   - What are the UI characteristics?

3. **User Perception:**
   - How does it affect user perception?
   - What is the perception impact?
   - What are the perception characteristics?

**Evaluation template:**
```markdown
## UX Evaluation: [Alternative Name]

### User Experience
- **Impact**: [Positive | Negative | Neutral]
- **Details**: [Description]

### User Interface
- **Impact**: [Positive | Negative | Neutral]
- **Details**: [Description]

### User Perception
- **Impact**: [Positive | Negative | Neutral]
- **Details**: [Description]
```

### Step 6: Evaluate Complexity Impact

**For each alternative, evaluate complexity:**

1. **Implementation Complexity:**
   - How complex is it to implement?
   - What is the implementation effort?
   - What are the implementation risks?

2. **Maintenance Complexity:**
   - How complex is it to maintain?
   - What is the maintenance effort?
   - What are the maintenance risks?

3. **Operational Complexity:**
   - How complex is it to operate?
   - What is the operational effort?
   - What are the operational risks?

**Evaluation template:**
```markdown
## Complexity Evaluation: [Alternative Name]

### Implementation Complexity
- **Level**: [Low | Medium | High]
- **Details**: [Description]
- **Effort**: [Estimate]

### Maintenance Complexity
- **Level**: [Low | Medium | High]
- **Details**: [Description]
- **Effort**: [Estimate]

### Operational Complexity
- **Level**: [Low | Medium | High]
- **Details**: [Description]
- **Effort**: [Estimate]
```

### Step 7: Compare Alternatives

**Create comparison matrix:**

```markdown
## Alternative Comparison

| Criterion | Alternative 1 | Alternative 2 | Alternative 3 |
|-----------|---------------|---------------|---------------|
| Performance | [Rating] | [Rating] | [Rating] |
| Cost | [Rating] | [Rating] | [Rating] |
| UX | [Rating] | [Rating] | [Rating] |
| Complexity | [Rating] | [Rating] | [Rating] |
| Overall | [Rating] | [Rating] | [Rating] |
```

### Step 8: Generate Evaluation Report

**Create comprehensive evaluation report:**

```markdown
# Architecture Alternative Evaluation Report

**Date**: [YYYY-MM-DD]
**Evaluator**: AI Assistant
**Context**: [Evaluation context]

## Executive Summary

- **Alternatives Evaluated**: [number]
- **Recommended Alternative**: [Alternative name]
- **Key Findings**: [Summary]

## Alternatives Evaluated

### Alternative 1: [Name]

**Description**: [Description]

**Performance Impact**:
- Query Performance: [Impact]
- Response Time: [Impact]
- Throughput: [Impact]

**Cost Impact**:
- Infrastructure: [Impact]
- Development: [Impact]
- Operational: [Impact]

**UX Impact**:
- User Experience: [Impact]
- User Interface: [Impact]
- User Perception: [Impact]

**Complexity Impact**:
- Implementation: [Level]
- Maintenance: [Level]
- Operational: [Level]

**Pros**:
- [Pro 1]
- [Pro 2]

**Cons**:
- [Con 1]
- [Con 2]

**Recommendation**: [Recommendation]

---

[Repeat for each alternative]

## Comparison Matrix

[Comparison matrix from Step 7]

## Recommendations

### Primary Recommendation
[Recommended alternative with rationale]

### Alternative Recommendations
[Other viable alternatives with rationale]

## Next Steps

1. [ ] Review evaluation with stakeholders
2. [ ] Get approval on recommendation
3. [ ] Use PLAYBOOK_03 for tradeoff analysis
4. [ ] Use PLAYBOOK_04 to plan implementation
```

## Output Deliverables

1. **Evaluation Report** (comprehensive document)
2. **Comparison Matrix** (side-by-side comparison)
3. **Recommendations** (actionable recommendations)

## Quality Criteria

**Good evaluation:**
- ✅ All alternatives evaluated
- ✅ All criteria considered
- ✅ Clear comparison provided
- ✅ Actionable recommendations
- ✅ Rationale provided

**Red flags:**
- ❌ Alternatives not fully evaluated
- ❌ Missing criteria
- ❌ Vague comparisons
- ❌ No recommendations
- ❌ Missing rationale

## Example Prompts for User

```
Evaluate alternatives for API response caching.
Compare client-side caching vs server-side caching vs hybrid approach.
Consider performance, cost, UX, and complexity impacts.
Generate an evaluation report with recommendations.
```

## Next Steps

After evaluation:
1. **Review evaluation** → Get stakeholder approval
2. **Analyze tradeoffs** → Use PLAYBOOK_03
3. **Plan implementation** → Use PLAYBOOK_04

---

**Related Playbooks:**
- PLAYBOOK_01: Document Current Architecture (use before this)
- PLAYBOOK_03: Analyze Tradeoffs (use after this)
- PLAYBOOK_04: Plan Optimization (use to plan implementation)

