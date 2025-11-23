# Quick Start Guide: Using System Architecture Playbooks

## How to Use These Playbooks

### In a New AI Agent Session

1. **Open the relevant playbook** (e.g., `PLAYBOOK_03_01_DOCUMENT_CURRENT.md`)
2. **Copy the entire playbook content**
3. **Paste as context** in your AI agent window
4. **Add your specific request** (e.g., "Document the current data flow architecture")
5. **The AI will follow the structured instructions**

### Example Session

```
[You paste PLAYBOOK_03_01_DOCUMENT_CURRENT.md]

[You add]: "Document the current system architecture.
Check frontend/src for state management patterns,
backend/src for API architecture,
and analyze data flow from frontend to database."

[AI follows playbook instructions and documents the architecture]
```

## Common Workflows

### Document Current Architecture

1. Use **PLAYBOOK_03_01_DOCUMENT_CURRENT.md**
2. Specify areas to document (e.g., data flow, state management, caching)
3. AI will create complete architecture documentation

### Evaluate Architectural Alternatives

1. Use **PLAYBOOK_03_02_EVALUATE_ALTERNATIVES.md**
2. Specify alternatives to evaluate (e.g., "Compare client-side vs server-side caching")
3. AI will evaluate and generate comparison report

### Analyze Tradeoffs

1. Use **PLAYBOOK_03_03_ANALYZE_TRADEOFFS.md**
2. Specify alternatives to analyze (e.g., "Analyze caching strategy tradeoffs")
3. AI will analyze performance, cost, and UX impacts

### Plan Architecture Optimization

1. Use **PLAYBOOK_03_04_PLAN_OPTIMIZATION.md**
2. Provide tradeoff analysis or list of optimization opportunities
3. AI will create optimization plan with tasks and priorities

### Implement Architecture Optimization

1. Use **PLAYBOOK_03_05_IMPLEMENT_OPTIMIZATION.md**
2. Specify task to implement
3. AI will implement while maintaining doc sync

### Update Architecture After Changes

1. Use **PLAYBOOK_03_06_UPDATE_ARCHITECTURE.md**
2. Describe what changed (architecture or code)
3. AI will update architecture documentation

### Audit All Architecture Elements

1. Use **PLAYBOOK_03_07_ARCHITECTURE_AUDIT.md**
2. AI will check all architecture elements for accuracy and drift

## Phase-Based Usage

### Phase 1: Baseline Documentation

**Goal**: Document existing architecture

**Playbooks**:

1. **PLAYBOOK_01** - Document data flow, state management, caching
2. **PLAYBOOK_02** - Evaluate alternatives (if needed)

**Process**:

```
For each architecture area:
  1. Use PLAYBOOK_01 to document
  2. Use PLAYBOOK_02 to evaluate alternatives (if needed)
  3. Mark as "validated"
```

### Phase 2: Tradeoff Analysis

**Goal**: Identify optimization opportunities

**Playbooks**:

1. **PLAYBOOK_02** - Evaluate alternatives (if not done)
2. **PLAYBOOK_03** - Analyze tradeoffs

**Process**:

```
1. Use PLAYBOOK_02 to evaluate alternatives
2. Use PLAYBOOK_03 to analyze tradeoffs
3. Prioritize optimization opportunities
4. Create optimization plan (PLAYBOOK_04)
```

### Phase 3: Optimization

**Goal**: Optimize architecture

**Playbooks**:

1. **PLAYBOOK_04** - Plan optimization
2. **PLAYBOOK_05** - Implement optimization
3. **PLAYBOOK_02** - Validate after implementation

**Process**:

```
1. Use PLAYBOOK_04 to create optimization plan
2. For each task:
   a. Use PLAYBOOK_05 to implement
   b. Use PLAYBOOK_02 to validate
   c. Update architecture if needed (PLAYBOOK_06)
```

### Phase 4: Iterative Enhancement

**Goal**: Continuously improve architecture

**Playbooks**:

1. **PLAYBOOK_06** - Update architecture
2. **PLAYBOOK_02** - Validate updates
3. **PLAYBOOK_07** - Regular audits

**Process**:

```
When architecture or code changes:
  1. Use PLAYBOOK_06 to update architecture
  2. Use PLAYBOOK_02 to validate
  3. Use PLAYBOOK_05 to implement (if architecture change)
  4. Use PLAYBOOK_07 monthly for audits
```

## Quick Reference Table

| Task                      | Playbook    | Input                    | Output                    |
| ------------------------- | ----------- | ------------------------ | ------------------------- |
| Document architecture     | PLAYBOOK_01 | Code files               | Complete architecture doc |
| Evaluate alternatives     | PLAYBOOK_02 | Alternatives to compare  | Evaluation report         |
| Analyze tradeoffs         | PLAYBOOK_03 | Alternatives            | Tradeoff analysis report  |
| Plan optimization         | PLAYBOOK_04 | Tradeoff analysis        | Optimization plan         |
| Implement optimization    | PLAYBOOK_05 | Optimization task        | Code changes + updates    |
| Update architecture       | PLAYBOOK_06 | Change description       | Updated architecture      |
| Audit all                | PLAYBOOK_07 | (none)                   | Audit report              |

## Tips

1. **Always validate after documenting** - Use PLAYBOOK_02 after PLAYBOOK_01
2. **Document before optimizing** - Use PLAYBOOK_01 before PLAYBOOK_05
3. **Plan before implementing** - Use PLAYBOOK_04 before PLAYBOOK_05
4. **Update architecture with code changes** - Use PLAYBOOK_06 when code changes
5. **Regular audits** - Use PLAYBOOK_07 monthly

## Getting Help

- See **README.md** for overview
- See individual playbooks for detailed instructions
- See **../../1_frontend_ux-workflows/playbooks/** for reference examples

---

**Last Updated:** 2025-01-XX

