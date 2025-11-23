# Playbook 01: Document Targets

## Purpose

This playbook provides step-by-step instructions for documenting performance targets, either from existing code/requirements or from performance specifications. Use this playbook when you need to create or update performance target documentation.

## When to Use This Playbook

- Documenting existing performance targets from code/requirements
- Documenting new performance target specifications
- Creating baseline documentation for Phase 1
- Updating performance target documentation with new details

## Prerequisites

- Access to codebase
- Understanding of what to document (targets, metrics, monitoring)
- Knowledge of performance requirements

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

### Step 1: Understand the Task

**User will provide:**
- What to document (API performance, database performance, frontend performance)
- Whether documenting existing targets or new specifications
- Specific performance areas to focus on

**Your task:**
- Understand the scope (targets, metrics, monitoring, or full performance)
- Identify if this is existing performance or new design
- Determine what files to examine

### Step 2: Gather Information

**For Existing Performance:**

1. **Search codebase** for relevant information:
   ```
   - Search for performance requirements (PRD, tasks)
   - Find performance-related code comments
   - Locate monitoring code
   - Find performance test results
   ```

2. **Read key files:**
   - Requirements documents (e.g., `tasks/0001-prd-clip-platform-mvp.md`)
   - Performance-related code
   - Monitoring configuration
   - Performance test results

3. **Extract performance information:**
   - Performance targets
   - Current performance metrics
   - Monitoring strategies
   - Optimization opportunities

**For New Performance Specifications:**

1. **Clarify requirements:**
   - Ask user for performance specifications
   - Identify performance targets
   - Understand monitoring needs
   - Clarify optimization constraints

2. **Map to existing patterns:**
   - Check existing performance patterns
   - Identify reusable patterns
   - Note technical constraints
   - Consider consistency with existing targets

### Step 3: Document Performance Targets

**Document each performance target:**

1. **Target Definition:**
   - Target metric name
   - Target value
   - Measurement method
   - Success criteria

2. **Target Context:**
   - Where this target applies
   - Why this target is important
   - What depends on this target

3. **Target Validation:**
   - How to measure
   - How to validate
   - How to monitor

**Document in `metrics/{area}.md`:**

```markdown
# Performance Targets: [Area Name]

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Last Validated**: [date or "not yet validated"]
- **Code Reference**: `file.ts:line-range`

## Overview
[Purpose and usage of these performance targets]

## Performance Targets

### [Target Name]

**Metric**: [Metric name]
**Target Value**: [Target value with units]
**Current Value**: [Current value with units]
**Measurement Method**: [How to measure]
**Code Reference**: `file.ts:line`

**Context**:
[Where this target applies and why it's important]

**Validation**:
[How to validate this target is met]

**Monitoring**:
[How to monitor this target]

---

[Repeat for each target]
```

### Step 4: Document Performance Metrics

**Document metric specifications:**

1. **Metric Definitions:**
   - Metric names
   - Metric types
   - Metric units
   - Metric calculation methods

2. **Current Metrics:**
   - Current metric values
   - Baseline measurements
   - Metric trends

3. **Metric Tracking:**
   - How metrics are tracked
   - Where metrics are stored
   - How metrics are reported

**Document in metrics document:**

```markdown
## Performance Metrics

### [Metric Name]

**Type**: [Type: Response Time | Throughput | Resource Usage | etc.]
**Unit**: [Unit: ms | req/s | MB | etc.]
**Definition**: [What this metric measures]
**Calculation**: [How this metric is calculated]
**Code Reference**: `file.ts:line`

**Current Value**: [Current value]
**Baseline**: [Baseline value]
**Trend**: [Trend description]

**Tracking**:
[How this metric is tracked]
```

### Step 5: Document Monitoring Strategy

**Document monitoring specifications:**

1. **Monitoring Tools:**
   - Tool names
   - Tool configuration
   - Tool usage patterns

2. **Alerting Rules:**
   - Alert conditions
   - Alert thresholds
   - Alert actions

3. **Dashboards:**
   - Dashboard configurations
   - Dashboard metrics
   - Dashboard usage

**Document in metrics document:**

```markdown
## Monitoring Strategy

### Monitoring Tools

#### [Tool Name]
- **Purpose**: [What this tool monitors]
- **Configuration**: `file.config.ts`
- **Usage**: [How used]

### Alerting Rules

#### [Alert Name]
- **Condition**: [When alert triggers]
- **Threshold**: [Alert threshold]
- **Action**: [What happens when alert triggers]

### Dashboards

#### [Dashboard Name]
- **Purpose**: [What this dashboard shows]
- **Metrics**: [List metrics shown]
- **Location**: [Where dashboard is accessed]
```

### Step 6: Document Optimization Opportunities

**Document optimization areas:**

1. **Current Performance:**
   - Current performance characteristics
   - Performance bottlenecks
   - Performance issues

2. **Optimization Opportunities:**
   - Potential optimizations
   - Optimization impact
   - Optimization effort

3. **Cost Analysis:**
   - Cost considerations
   - Cost tradeoffs
   - Cost optimization opportunities

**Document in metrics document:**

```markdown
## Optimization Opportunities

### Current Performance

#### [Area Name]
- **Current State**: [Description]
- **Bottlenecks**: [List bottlenecks]
- **Issues**: [List issues]

### Optimization Opportunities

#### [Opportunity Name]
- **Description**: [What can be optimized]
- **Impact**: [Expected impact]
- **Effort**: [Effort required]
- **Cost**: [Cost implications]

### Cost Analysis

#### [Cost Area]
- **Current Cost**: [Current cost]
- **Optimization Impact**: [How optimization affects cost]
- **Cost Tradeoffs**: [Cost tradeoffs]
```

### Step 7: Add Code References

**Critical:** Every performance element must have a code reference:

- Targets: `file.ts:line-number` or requirements document
- Metrics: `file.ts:line-number`
- Monitoring: `file.ts:line-number`

**How to find references:**
- Use `grep` to find performance-related code
- Use `codebase_search` to understand patterns
- Read requirements documents for targets

### Step 8: Create Performance Summary

**Create or update performance overview:**

```markdown
# Performance Overview

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Version**: 1.0

## Performance Targets
[List targets with status]

## Current Metrics
[Summary of current metrics]

## Monitoring
[Summary of monitoring strategy]

## Optimization
[Summary of optimization opportunities]
```

### Step 9: Review and Refine

**Checklist:**
- [ ] All performance targets documented
- [ ] All metrics documented
- [ ] All monitoring strategies documented
- [ ] All code references accurate
- [ ] Optimization opportunities documented
- [ ] Performance summary created
- [ ] Documentation is complete and logical

## Output Deliverables

1. **Performance target documentation** (`metrics/{area}.md`)
2. **Performance metrics documentation**
3. **Monitoring strategy documentation**
4. **Optimization opportunities documentation**
5. **Performance overview** (summary document)
6. **Updated README.md** with performance status

## Quality Criteria

**Good performance documentation:**
- ✅ All targets documented with values and measurement methods
- ✅ All metrics documented with definitions
- ✅ All monitoring strategies documented
- ✅ All code references accurate
- ✅ Optimization opportunities documented
- ✅ Clear and readable

**Red flags:**
- ❌ Missing code references
- ❌ Vague target descriptions
- ❌ Missing measurement methods
- ❌ Incomplete target definitions
- ❌ Performance doesn't match code

## Example Prompts for User

**For existing performance:**
```
Document the current performance targets.
Check tasks/0001-prd-clip-platform-mvp.md for performance requirements,
and analyze current performance characteristics.
```

**For new performance:**
```
Document new performance targets for API endpoints.
Target: API response time < 200ms for 95th percentile.
Update the API performance targets documentation.
```

## Next Steps

After documenting:
1. **Validate the targets** using PLAYBOOK_02
2. **Create validation checklist** (part of PLAYBOOK_02)
3. **Update target status** based on validation results

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Metrics (use after this)
- PLAYBOOK_06: Update Targets (for updates)

