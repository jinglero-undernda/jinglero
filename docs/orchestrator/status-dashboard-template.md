# Status Dashboard Template

## Purpose

This template provides a structured format for updating the live STATUS.md document. Use this as a reference when creating status summaries.

## Template Structure

```markdown
# Documentation System Status

**Last Updated**: YYYY-MM-DD HH:MM  
**Current Focus**: [Brief description of active work]

## Quick Summary

[2-3 sentences describing overall system health and current priorities]

## Area Status

### 1. UX Workflows
**Status**: [✅ Complete | 🚧 In Progress | 📝 Needs Work | ⏳ Planned]  
**Completeness**: XX%  
**Last Validated**: YYYY-MM-DD  
**Current State**: [1-2 sentences about status, recent work, or blockers]  
**Next Action**: [What should happen next - 1 sentence]

### 2. UI Design System
**Status**: [✅ Complete | 🚧 In Progress | 📝 Needs Work | ⏳ Planned]  
**Completeness**: XX%  
**Last Validated**: YYYY-MM-DD  
**Current State**: [1-2 sentences]  
**Next Action**: [1 sentence]

### 3. System Architecture
[Repeat structure...]

### 4. Database Schema
[Repeat structure...]

### 5. API Design & Contracts
[Repeat structure...]

### 6. Testing Strategy
[Repeat structure...]

### 7. Performance & Monitoring
[Repeat structure...]

### 8. Security & Compliance
[Repeat structure...]

### 9. Deployment & Infrastructure
[Repeat structure...]

## Active Work

**Current Task**: [What's being worked on now - 1-2 sentences]  
**Playbook**: [Which playbook is being used]  
**Expected Completion**: [Timeline or date]  
**Blockers**: [Any blockers - or "None"]

## Next Priorities

1. **[Priority 1]**: [Why it's a priority - 1 sentence]
2. **[Priority 2]**: [Why it's a priority - 1 sentence]
3. **[Priority 3]**: [Why it's a priority - 1 sentence]

## Dependencies

**Active Dependencies**: [Areas that are blocking or being blocked - brief list]  
**Ripple Effects**: [Recent changes that affect other areas - brief list]

## Follow-Up Tasks

- [ ] [Task 1] - [Area affected]
- [ ] [Task 2] - [Area affected]
- [ ] [Task 3] - [Area affected]

## Recent Changes

**Last Session** (YYYY-MM-DD):
- [Change 1 - brief description]
- [Change 2 - brief description]
- [Change 3 - brief description]

**See activity-log.md for detailed history**
```

## Usage Guidelines

### Keep It Concise

- **Area Status**: 1-2 sentences maximum per area
- **Current State**: Focus on what matters now
- **Next Action**: One clear sentence
- **Priorities**: 3-5 items maximum
- **Recent Changes**: 3-5 items maximum

### Update Frequency

- **Every Session**: Update "Active Work" and "Recent Changes"
- **Weekly**: Review and update all area statuses
- **Monthly**: Comprehensive review of all sections

### What Goes Where

**STATUS.md (this template)**:
- Current state
- Active work
- Next priorities
- Recent changes summary

**activity-log.md**:
- Detailed analysis
- Decision rationale
- File-by-file changes
- Historical context
- Full gap analysis results

### Status Indicators

- ✅ **Complete**: All playbooks available, documentation current
- 🚧 **In Progress**: Active work happening
- 📝 **Needs Work**: Documentation incomplete or outdated
- ⏳ **Planned**: Work planned but not started

### Completeness Calculation

For each area, calculate:
- **Workflows/Components Documented**: Count documented items
- **Total Items**: Count all items (documented + identified gaps)
- **Percentage**: (Documented / Total) × 100

Example:
- UX Workflows: 3 documented, 7 total = 43% complete

---

## Example Status Entry

```markdown
### 1. UX Workflows
**Status**: 🚧 In Progress  
**Completeness**: 43% (3/7 workflows documented)  
**Last Validated**: 2025-01-15  
**Current State**: Three core workflows documented (entity edit, navigation, authentication). Four workflows identified but not yet documented (search, entity creation, bulk operations, error handling).  
**Next Action**: Document search workflow (PLAYBOOK_01) to enable validation and testing.
```

---

## Tips

1. **Be Specific**: "3/7 workflows documented" is better than "some workflows documented"
2. **Focus on Now**: What's the current state, not the history
3. **Action-Oriented**: "Next Action" should be clear and actionable
4. **Link Details**: Reference activity-log.md for detailed information
5. **Update Regularly**: Stale status is worse than no status

---

**Related Documents**:
- [`STATUS.md`](./STATUS.md) - Live status document (use this template)
- [`activity-log.md`](./activity-log.md) - Detailed activity log
- [`../PLAYBOOK_00_PRODUCT_ORCHESTRATOR.md`](../PLAYBOOK_00_PRODUCT_ORCHESTRATOR.md) - Full playbook

