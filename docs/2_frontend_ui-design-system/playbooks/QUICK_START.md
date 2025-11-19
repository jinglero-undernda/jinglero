# Quick Start Guide: Using Design System Playbooks

## How to Use These Playbooks

### In a New AI Agent Session

1. **Open the relevant playbook** (e.g., `PLAYBOOK_01_DOCUMENT_DESIGN_INTENT.md`)
2. **Copy the entire playbook content**
3. **Paste as context** in your AI agent window
4. **Add your specific request** (e.g., "Document the current color palette from variables.css")
5. **The AI will follow the structured instructions**

### Example Session

```
[You paste PLAYBOOK_01_DOCUMENT_DESIGN_INTENT.md]

[You add]: "Document the current design system. 
Check frontend/src/styles/theme/variables.css for design tokens,
and frontend/src/styles/components/ for component styles."

[AI follows playbook instructions and documents the design system]
```

## Common Workflows

### Document Current Design System

1. Use **PLAYBOOK_01_DOCUMENT_DESIGN_INTENT.md**
2. Specify files to check (e.g., `variables.css`, component CSS files)
3. AI will create complete design system documentation

### Validate Design System Implementation

1. Use **PLAYBOOK_02_VALIDATE_IMPLEMENTATION.md**
2. Specify design system element to validate (e.g., "color tokens")
3. AI will validate against codebase and generate report

### Find Gaps Between Design and Code

1. Use **PLAYBOOK_03_GAP_ANALYSIS.md**
2. Specify design system area to analyze (e.g., "component styles")
3. AI will identify gaps across design tokens, components, and styles

### Plan Design System Refactoring

1. Use **PLAYBOOK_04_PLAN_REFACTOR.md**
2. Provide gap analysis or list of issues
3. AI will create refactoring plan with tasks and priorities

### Implement Design System Refactoring

1. Use **PLAYBOOK_05_IMPLEMENT_REFACTOR.md**
2. Specify task to implement
3. AI will implement while maintaining doc sync

### Update Design System After Changes

1. Use **PLAYBOOK_06_UPDATE_DESIGN_SYSTEM.md**
2. Describe what changed (design or code)
3. AI will update design system documentation

### Audit All Design System Elements

1. Use **PLAYBOOK_07_DESIGN_SYSTEM_AUDIT.md**
2. AI will check all design system elements for accuracy and drift

## Phase-Based Usage

### Phase 1: Baseline Documentation

**Goal**: Document existing design system

**Playbooks**:
1. **PLAYBOOK_01** - Document design tokens and components
2. **PLAYBOOK_02** - Validate documentation

**Process**:
```
For each design system area:
  1. Use PLAYBOOK_01 to document
  2. Use PLAYBOOK_02 to validate
  3. Fix discrepancies
  4. Mark as "validated"
```

### Phase 2: Gap Analysis

**Goal**: Identify gaps between design and implementation

**Playbooks**:
1. **PLAYBOOK_02** - Validate design system (if not done)
2. **PLAYBOOK_03** - Analyze gaps

**Process**:
```
1. Use PLAYBOOK_02 to validate all design system elements
2. Use PLAYBOOK_03 to analyze gaps
3. Prioritize gaps
4. Create refactoring plan (PLAYBOOK_04)
```

### Phase 3: Refactoring

**Goal**: Align code with design system

**Playbooks**:
1. **PLAYBOOK_04** - Plan refactoring
2. **PLAYBOOK_05** - Implement refactoring
3. **PLAYBOOK_02** - Validate after implementation

**Process**:
```
1. Use PLAYBOOK_04 to create refactoring plan
2. For each task:
   a. Use PLAYBOOK_05 to implement
   b. Use PLAYBOOK_02 to validate
   c. Update design system if needed (PLAYBOOK_06)
```

### Phase 4: Iterative Enhancement

**Goal**: Continuously improve design system

**Playbooks**:
1. **PLAYBOOK_06** - Update design system
2. **PLAYBOOK_02** - Validate updates
3. **PLAYBOOK_07** - Regular audits

**Process**:
```
When design or code changes:
  1. Use PLAYBOOK_06 to update design system
  2. Use PLAYBOOK_02 to validate
  3. Use PLAYBOOK_05 to implement (if design change)
  4. Use PLAYBOOK_07 monthly for audits
```

## Quick Reference Table

| Task | Playbook | Input | Output |
|------|----------|-------|--------|
| Document design system | PLAYBOOK_01 | Design files/CSS | Complete design system doc |
| Validate implementation | PLAYBOOK_02 | Design system doc | Validation report |
| Find gaps | PLAYBOOK_03 | Design system + validation | Gap analysis report |
| Plan refactoring | PLAYBOOK_04 | Gap analysis | Refactoring plan |
| Implement refactor | PLAYBOOK_05 | Refactoring task | Code changes + updates |
| Update design system | PLAYBOOK_06 | Change description | Updated design system |
| Audit all | PLAYBOOK_07 | (none) | Audit report |

## Tips

1. **Always validate after documenting** - Use PLAYBOOK_02 after PLAYBOOK_01
2. **Document before refactoring** - Use PLAYBOOK_01 before PLAYBOOK_05
3. **Plan before implementing** - Use PLAYBOOK_04 before PLAYBOOK_05
4. **Update design system with code changes** - Use PLAYBOOK_06 when code changes
5. **Regular audits** - Use PLAYBOOK_07 monthly

## Getting Help

- See **README.md** for overview
- See individual playbooks for detailed instructions
- See **../../1_frontend_ux-workflows/playbooks/** for reference examples

---

**Last Updated:** 2025-01-XX

