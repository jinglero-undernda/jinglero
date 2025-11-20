# Product Orchestrator - Quick Start Guide

## Purpose

This guide provides quick reference for common scenarios when using the Product Orchestrator playbook.

## Quick Reference

### Starting a New Session

**Scenario**: You're starting fresh and want to know what to work on.

**Process**:
1. Open `PLAYBOOK_00_PRODUCT_ORCHESTRATOR.md`
2. Ask: "What should I work on next?"
3. AI evaluates all 9 areas and presents prioritized options
4. Choose an option
5. AI guides you through the appropriate playbook

**Expected Output**: 3-5 prioritized options with rationale, effort estimates, and impact assessment.

---

### Working on a Specific Feature

**Scenario**: You have a feature in mind (from PRD, backlog, or your own idea).

**Process**:
1. Open `PLAYBOOK_00_PRODUCT_ORCHESTRATOR.md`
2. State: "I want to work on [feature name]"
3. AI identifies required documentation across areas
4. AI recommends starting point (usually UX Workflow or API Contract)
5. Approve and proceed

**Expected Output**: Clear path showing which areas need documentation, recommended starting point, and estimated effort.

---

### Responding to a Bug

**Scenario**: You've found a bug and want to fix it systematically.

**Process**:
1. Open `PLAYBOOK_00_PRODUCT_ORCHESTRATOR.md`
2. State: "There's a bug: [description]"
3. AI links bug to relevant areas and gap analysis
4. AI presents fix options (quick fix vs. comprehensive)
5. Choose approach
6. AI guides through appropriate playbooks

**Expected Output**: Bug linked to documentation gaps, prioritized fix options, clear path forward.

---

### After Completing Work

**Scenario**: You've finished a task and want to know what's next.

**Process**:
1. AI automatically identifies ripple effects
2. AI updates STATUS.md with current state
3. AI logs activity in activity-log.md
4. AI presents follow-up tasks
5. Choose to continue or defer follow-ups

**Expected Output**: Updated status, list of affected areas, follow-up tasks prioritized.

---

### Strategic Planning Session

**Scenario**: You want to plan work for the next sprint/month.

**Process**:
1. Open `PLAYBOOK_00_PRODUCT_ORCHESTRATOR.md`
2. Ask: "What's the strategic priority for the next [timeframe]?"
3. AI evaluates all areas, gaps, PRD alignment
4. AI presents roadmap with dependencies
5. Review and adjust priorities

**Expected Output**: High-level roadmap, prioritized work items, dependency map, effort estimates.

---

### Regular Health Check

**Scenario**: Monthly/weekly review of documentation system health.

**Process**:
1. Open `PLAYBOOK_00_PRODUCT_ORCHESTRATOR.md`
2. Ask: "Run a health check on all documentation areas"
3. AI evaluates completeness, validation status, gaps
4. AI updates STATUS.md
5. AI identifies areas needing attention

**Expected Output**: Health summary, areas needing validation, outdated documentation flagged.

---

## Common Workflows

### Workflow 1: Document → Validate → Fix

**Use when**: Starting documentation for a new area or feature.

1. **Document** (PLAYBOOK_01): Create baseline documentation
2. **Validate** (PLAYBOOK_02): Check against codebase
3. **Gap Analysis** (PLAYBOOK_03): Identify discrepancies
4. **Plan** (PLAYBOOK_04): Create refactoring plan
5. **Implement** (PLAYBOOK_05): Fix gaps (with approval)
6. **Update** (PLAYBOOK_06): Keep documentation current

**Orchestrator Role**: Guides you through sequence, identifies when to move to next step.

---

### Workflow 2: Bug → Gap → Fix

**Use when**: Bug relates to documentation gap.

1. **Identify Bug**: Report bug
2. **Link to Gap**: Orchestrator finds related gap
3. **Prioritize**: Determine if quick fix or comprehensive
4. **Fix**: Execute chosen approach
5. **Update Docs**: Ensure documentation reflects fix

**Orchestrator Role**: Links bug to gaps, presents fix options, tracks resolution.

---

### Workflow 3: PRD → Documentation → Implementation

**Use when**: New feature from PRD.

1. **Read PRD**: Extract requirements
2. **Map to Areas**: Identify which areas need documentation
3. **Document First**: Create documentation before coding
4. **Plan Implementation**: Use documentation to guide code
5. **Validate**: Ensure code matches documentation

**Orchestrator Role**: Maps PRD to areas, recommends documentation order, tracks completion.

---

## Status Documents

### STATUS.md (Read This First)

**Location**: `docs/orchestrator/STATUS.md`

**Purpose**: Quick reference for current state

**Contains**:
- Area completion percentages
- Current active work
- Next priorities
- Recent updates

**Update Frequency**: Every session

**Length**: Keep under 2 pages

---

### activity-log.md (Detailed History)

**Location**: `docs/orchestrator/activity-log.md`

**Purpose**: Detailed historical record

**Contains**:
- Timestamped entries
- Decisions made
- Analysis performed
- Files changed
- Rationale

**Update Frequency**: Every action

**Length**: Grows over time (append-only)

---

## Decision Points

### When to Use Orchestrator vs. Direct Playbook

**Use Orchestrator** when:
- ✅ Starting fresh, no specific task
- ✅ Need to prioritize multiple options
- ✅ Want to understand cross-area impacts
- ✅ Planning strategic work
- ✅ Need to track ripple effects

**Use Direct Playbook** when:
- ✅ You know exactly what to do
- ✅ Working within single area
- ✅ Following established workflow
- ✅ Quick update to existing documentation

---

### When to Update STATUS.md vs. activity-log.md

**Update STATUS.md** for:
- Current state changes
- New priorities
- Active work summary
- Next actions

**Update activity-log.md** for:
- Detailed analysis
- Decision rationale
- File changes
- Historical context

---

## Tips for Effective Use

1. **Start with STATUS.md**: Read it first to understand current state
2. **Be Specific**: The more context you provide, the better recommendations
3. **Review Options**: Always review multiple options before deciding
4. **Check Ripple Effects**: Ask about impacts on other areas
5. **Update Regularly**: Keep STATUS.md current after each session
6. **Use Log for Details**: activity-log.md is your detailed history

---

## Common Questions

**Q: How do I know which playbook to use?**
A: The Orchestrator will recommend the specific playbook based on your goal.

**Q: What if I disagree with the recommendation?**
A: Always present your alternative - the Orchestrator will adapt and help plan your approach.

**Q: How often should I run health checks?**
A: Weekly for active development, monthly for maintenance mode.

**Q: Can I skip documentation and go straight to code?**
A: The Orchestrator will warn you about risks, but you can override. However, documenting first reduces rework.

**Q: What if I need to work on something urgent?**
A: State the urgency - the Orchestrator will help you balance urgent work with systematic approach.

---

## Getting Help

- **Read the full playbook**: `PLAYBOOK_00_PRODUCT_ORCHESTRATOR.md`
- **Check STATUS.md**: Current state and priorities
- **Review activity-log.md**: Recent decisions and context
- **Ask the Orchestrator**: "Help me understand [situation]"

---

**Last Updated**: 2025-01-XX

