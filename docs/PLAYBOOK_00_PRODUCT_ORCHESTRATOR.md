# Playbook 00: Product Orchestrator

## Purpose

This meta-playbook provides a systematic approach to evaluating documentation status across all nine areas, identifying next logical priorities, and orchestrating product development. It acts as a single entry point for navigating the documentation system and planning work based on current state, gaps, and strategic goals.

## When to Use This Playbook

- Starting a new development session and need to identify priorities
- Completed work in one area and need to determine ripple effects
- Planning a development sprint or milestone
- Evaluating overall product readiness
- Creating a roadmap based on documentation gaps
- Regular strategic reviews (weekly/monthly)

## Prerequisites

- Access to all documentation areas (1-9)
- Understanding of current product goals (PRD/backlog if available)
- Product owner or technical lead involvement for decision-making

## Instructions for AI Assistant

### Step 0: Confirm Date with User

**Before generating any documentation:**
1. **Always confirm the current date with the user** before adding any date fields
2. **Ask the user**: "What is the current date? (YYYY-MM-DD format)"
3. **Use the confirmed date** for all date fields in the documentation:
   - Change History tables
   - "Last Updated" fields
   - Status tables
   - Activity logs
   - Any other date fields

**Never assume or guess the date.**

### Step 1: System Health Assessment

**Your task:**

1. **Scan all nine areas** and evaluate documentation status:
   - Area 1: UX Workflows
   - Area 2: UI Design System
   - Area 3: System Architecture
   - Area 4: Database Schema
   - Area 5: API Design & Contracts
   - Area 6: Testing Strategy
   - Area 7: Performance & Monitoring
   - Area 8: Security & Compliance
   - Area 9: Deployment & Infrastructure

2. **For each area, check:**
   - Documentation completeness (% of workflows/components documented)
   - Last validation date
   - Known gaps from gap analysis reports
   - Audit status
   - Related bug reports in `0_debug-logs/`

3. **Create a concise status summary** (see Status Dashboard Template):
   - Use the template in `docs/orchestrator/status-dashboard-template.md`
   - Keep summary to 2-3 sentences per area
   - Update the live status document: `docs/orchestrator/STATUS.md`
   - Log detailed findings in: `docs/orchestrator/activity-log.md`

### Step 2: Identify Documentation Gaps

**Your task:**

1. **Check for missing documentation:**
   - Undocumented workflows
   - Missing design specifications
   - Undocumented API endpoints
   - Missing test coverage documentation

2. **Review validation reports** from each area's PLAYBOOK_02

3. **Review gap analysis reports** from each area's PLAYBOOK_03

4. **Categorize gaps by urgency:**
   - **Blockers**: Must document before development can proceed
   - **Critical**: Needed for current work, risk of errors without it
   - **Important**: Should document soon, technical debt accumulating
   - **Nice-to-have**: Can defer, low immediate impact

5. **Update STATUS.md** with gap summary (1-2 sentences)
6. **Log detailed gap analysis** in activity-log.md

### Step 3: Analyze Cross-Area Dependencies

**Your task:**

1. **Map relationships between areas** (see main README for relationship diagram)

2. **Identify ripple effects:**
   - If Area X has gaps, which other areas are affected?
   - If we change Area Y, which areas need updates?

3. **Create dependency summary** (keep brief):
   - Document in STATUS.md as "Dependencies" section
   - Log detailed analysis in activity-log.md

### Step 4: Consult Product Requirements

**Your task:**

1. **Check for PRD documents** in:
   - `/docs/` directory
   - `/tasks/` directory
   - `docs_SUPERSEDED/backlog.md` (historical reference)

2. **Extract current priorities:**
   - What features are planned?
   - What bugs need fixing?
   - What technical debt is acknowledged?

3. **Map PRD requirements to documentation areas:**
   - Feature X requires: UX Workflow, API Contract, Testing
   - Bug Y relates to: Database Schema, System Architecture

4. **Update STATUS.md** with PRD alignment (1-2 sentences)
5. **Log detailed mapping** in activity-log.md

### Step 5: Present Options to User

**CRITICAL: Always involve the user in decision-making**

**Your task:**

Present 3-5 prioritized options with clear rationale:

```markdown
## Recommended Next Actions

### Option 1: [Action Name] (RECOMMENDED)
**Rationale**: [Why this should be done first - 1-2 sentences]
**Effort**: [Small | Medium | Large] ([X] hours/days)
**Impact**: [High | Medium | Low]
**Playbook**: Use PLAYBOOK_XX in Area Y
**Deliverable**: [What will be created]

**Pros**: [Benefit 1], [Benefit 2]
**Cons**: [Drawback 1]

### Option 2: [Alternative Action]
...
```

**Present and ask:**
- "Which option would you like to pursue? (1, 2, 3, or describe alternative)"
- "Do you have specific goals or constraints I should consider?"
- "Should I provide more detail on any option before deciding?"

### Step 6: Execute Chosen Path (With User Approval)

**CRITICAL: Never edit code without explicit user consent**

**Your task:**

1. **After user chooses an option:**
   - Confirm understanding: "To confirm, I will [action]. Is this correct?"
   - If code changes are needed: "This will require code edits. Should I proceed with implementation or just plan the changes?"

2. **Guide through appropriate playbook:**
   - Open the relevant playbook (e.g., PLAYBOOK_01 for Area X)
   - Follow the playbook instructions
   - Create deliverables as specified

3. **Checkpoint with user:**
   - After each major step: "I've completed [step]. Would you like to review before I continue?"
   - Before any code changes: "I'm ready to implement [change]. Please confirm approval."

4. **Update STATUS.md** with current work (1-2 sentences)
5. **Log activity** in activity-log.md with timestamp

### Step 7: Identify Ripple Effects

**After completing primary work:**

1. **Analyze what else needs updating:**
   - Which areas are affected by this change?
   - What documentation needs updating?
   - What validation is needed?

2. **Create follow-up task list** (keep concise):
   - Update STATUS.md "Follow-up" section (bullet list)
   - Log detailed task breakdown in activity-log.md

3. **Present to user:**
   - "This change affects [N] other areas. Here's what should be updated..."
   - "Would you like to address these now, or shall I track them for later?"

### Step 8: Update Project Status

**Your task:**

1. **Update live status document** (`docs/orchestrator/STATUS.md`):
   - Update area completion percentages
   - Update last validation dates
   - Add current work summary (1-2 sentences)
   - Update "Next Actions" section

2. **Log detailed activity** in `docs/orchestrator/activity-log.md`:
   - Timestamp
   - What was done
   - Decisions made
   - Files changed
   - Follow-up items

3. **Keep STATUS.md concise** - detailed information belongs in activity-log.md

## Live Document Approach

### STATUS.md (Live Document)
- **Purpose**: Quick reference, current state at a glance
- **Format**: Short paragraphs, bullet lists, status indicators
- **Update Frequency**: Every session
- **Length**: Keep under 2 pages
- **Content**: Current state, active work, next priorities

### activity-log.md (Detailed Log)
- **Purpose**: Historical record, detailed tracking
- **Format**: Chronological entries with timestamps
- **Update Frequency**: Every action
- **Length**: Grows over time (append-only)
- **Content**: Detailed decisions, analysis, changes, rationale

### Status Dashboard Template
- **Purpose**: Structured format for status updates
- **Location**: `docs/orchestrator/status-dashboard-template.md`
- **Usage**: Reference when updating STATUS.md

## Modes of Operation

The Product Orchestrator can operate in different modes based on user needs:

### Mode A: Strategic Planning
- Evaluate all areas
- Identify high-level priorities
- Create multi-sprint roadmap
- No code changes, pure planning

### Mode B: Single Task Execution
- User has specific task in mind
- Identify relevant area and playbook
- Execute with user approval
- Handle ripple effects

### Mode C: Gap-Driven Development
- Start from gap analysis reports
- Prioritize gaps systematically
- Plan and execute refactoring
- Track progress against gaps

### Mode D: Feature Development
- Start from PRD or feature request
- Determine what documentation is needed
- Create documentation first
- Guide implementation planning

### Mode E: Maintenance & Audit
- Regular health checks
- Run audits across all areas
- Update outdated documentation
- Preventive maintenance

## Decision Framework

When evaluating priorities, consider:

1. **Business Value**
   - Does this enable new features?
   - Does this fix user-facing issues?
   - Does this reduce operational risk?

2. **Technical Debt**
   - How much debt accumulates if deferred?
   - Is this blocking other work?
   - What's the cost of delay?

3. **Dependencies**
   - What depends on this?
   - What does this depend on?
   - Can this be done in parallel?

4. **Effort vs. Impact**
   - Quick wins (low effort, high impact)
   - Strategic investments (high effort, high impact)
   - Avoid low effort, low impact work unless maintenance

5. **Risk**
   - What breaks if we don't do this?
   - What could break if we do this wrong?
   - Can we mitigate risks?

## User Interaction Principles

**ALWAYS:**
- ✅ Present options, never assume
- ✅ Explain rationale for recommendations
- ✅ Ask for approval before code changes
- ✅ Checkpoint after major steps
- ✅ Provide context and tradeoffs
- ✅ Respect user's technical expertise
- ✅ Offer alternative approaches
- ✅ Keep summaries concise, log details separately

**NEVER:**
- ❌ Edit code without explicit consent
- ❌ Make architectural decisions alone
- ❌ Assume user priorities
- ❌ Skip validation steps
- ❌ Make breaking changes without discussion
- ❌ Proceed with high-risk actions without approval
- ❌ Create lengthy status reports (use live document + log)

## Example Sessions

### Example 1: New Session, No Specific Goal

```
User: "What should I work on next?"

AI: [Runs Step 1-4, updates STATUS.md, logs in activity-log.md]

"**Current Status** (see STATUS.md for details):
- UX Workflows: 3/7 documented (43%) - 4 workflows need documentation
- UI Design System: Tokens complete, components need specs
- Testing: 15 critical test gaps identified

**Top Recommendation**: Document remaining UX workflows (blocks validation, enables testing). 
Effort: ~2-3 hours per workflow. Should I start with the highest-priority workflow?"
```

### Example 2: User Has Specific Feature

```
User: "I want to add a bulk entity deletion feature"

AI: "**Required Documentation**:
1. UX Workflow (bulk deletion flow)
2. API Contract (bulk delete endpoint)
3. Testing (bulk operation scenarios)

**Recommended Start**: Document UX workflow first (PLAYBOOK_01, UX Workflows). 
This establishes requirements for API and testing. Estimated 1-2 hours.

Should I proceed with documenting the UX workflow?"
```

### Example 3: Responding to Bug

```
User: "There's a bug with entity relationships not saving"

AI: "**Analysis**: This relates to WORKFLOW_001 (Entity Edit Mode). 
Gap analysis shows GAP-003: 'Relationship state management inconsistent' (P1 priority).

**Options**:
1. Quick fix + update validation (2-3 hours) - RECOMMENDED
2. Comprehensive refactor with full gap analysis (4-6 hours)

Which approach fits your timeline?"
```

## Integration with Existing Tools

### PRD Integration
- Check `/tasks/[NNNN]-prd-*.md` files
- Extract requirements and map to areas
- Guide documentation creation from PRDs
- Log PRD references in activity-log.md

### Backlog Integration
- Reference `docs_SUPERSEDED/backlog.md`
- Prioritize based on backlog items
- Track completion against backlog
- Update STATUS.md with backlog alignment

### Bug Tracking Integration
- Reference `docs/0_debug-logs/BUG_*.md` files
- Link bugs to documentation gaps
- Track resolution through playbooks
- Log bug-related work in activity-log.md

## Output Deliverables

After each Product Orchestrator session:

1. **STATUS.md** - Updated live document (concise, current state)
2. **activity-log.md** - Detailed log entry (timestamped, append-only)
3. **Priority List** - Recommended next actions (presented to user)
4. **Decision Record** - What was chosen and why (in activity-log.md)
5. **Task List** - Follow-up actions needed (in STATUS.md)

## Quality Criteria

**Good orchestration:**
- ✅ Clear priorities with rationale
- ✅ User involved in all decisions
- ✅ Cross-area impacts identified
- ✅ Realistic effort estimates
- ✅ Clear next steps
- ✅ Documentation stays in sync
- ✅ STATUS.md concise and current
- ✅ activity-log.md detailed and complete

**Red flags:**
- ❌ Making decisions without user input
- ❌ Jumping to code without documentation
- ❌ Ignoring cross-area dependencies
- ❌ No validation after changes
- ❌ Unclear priorities
- ❌ STATUS.md too lengthy
- ❌ Missing activity-log entries

## Related Playbooks

This orchestrator playbook uses all other playbooks:
- References all PLAYBOOK_01 (Documentation) playbooks
- Triggers PLAYBOOK_02 (Validation) after changes
- Uses PLAYBOOK_03 (Gap Analysis) for priority setting
- Guides PLAYBOOK_04 (Planning) before implementation
- Oversees PLAYBOOK_05 (Implementation) execution
- Ensures PLAYBOOK_06 (Updates) for ripple effects
- Schedules PLAYBOOK_07 (Audits) for maintenance

---

**Related Documents:**
- [`orchestrator/STATUS.md`](./orchestrator/STATUS.md) - Live status document
- [`orchestrator/activity-log.md`](./orchestrator/activity-log.md) - Detailed activity log
- [`orchestrator/status-dashboard-template.md`](./orchestrator/status-dashboard-template.md) - Status update template
- [`orchestrator/QUICK_START.md`](./orchestrator/QUICK_START.md) - Quick reference guide

