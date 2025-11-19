# Architecture Decision Records (ADRs)

## Purpose

This directory contains Architecture Decision Records (ADRs) documenting significant architectural decisions, their context, alternatives considered, and rationale.

## ADR Format

Each ADR should follow this structure:

```markdown
# ADR-XXX: [Decision Title]

## Status

**Status**: [Proposed | Accepted | Deprecated | Superseded]
**Date**: [YYYY-MM-DD]
**Deciders**: [Who made the decision]

## Context

[What is the issue we're addressing?]

## Decision

[What is the change we're proposing or have agreed to?]

## Consequences

### Positive
- [Positive consequence 1]
- [Positive consequence 2]

### Negative
- [Negative consequence 1]
- [Negative consequence 2]

## Alternatives Considered

### Alternative 1: [Name]
- **Pros**: [List]
- **Cons**: [List]
- **Why not chosen**: [Reason]

### Alternative 2: [Name]
- **Pros**: [List]
- **Cons**: [List]
- **Why not chosen**: [Reason]

## Related Decisions

- [Link to related ADRs]

## Notes

[Any additional notes or considerations]
```

## ADR Naming Convention

- `ADR-001-{short-title}.md` - Sequential numbering with descriptive title
- Example: `ADR-001-neo4j-only-architecture.md`

## When to Create an ADR

Create an ADR when:
- Making a significant architectural decision
- Choosing between major alternatives
- Establishing new patterns or conventions
- Deprecating existing patterns

## Status Definitions

- **Proposed**: Decision is being considered
- **Accepted**: Decision has been made and implemented
- **Deprecated**: Decision is being phased out
- **Superseded**: Decision has been replaced by a newer ADR

---

**Related Playbooks**: See `../playbooks/PLAYBOOK_01_DOCUMENT_CURRENT.md` for documenting architecture decisions.

