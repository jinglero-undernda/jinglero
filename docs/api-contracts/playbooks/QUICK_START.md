# Quick Start Guide: Using API Contracts Playbooks

## How to Use These Playbooks

### In a New AI Agent Session

1. **Open the relevant playbook** (e.g., `PLAYBOOK_01_DOCUMENT_CONTRACTS.md`)
2. **Copy the entire playbook content**
3. **Paste as context** in your AI agent window
4. **Add your specific request** (e.g., "Document the Public API contracts")
5. **The AI will follow the structured instructions**

### Example Session

```
[You paste PLAYBOOK_01_DOCUMENT_CONTRACTS.md]

[You add]: "Document the current API contracts.
Check backend/src/server/api for API routes,
and document all Public API and Admin API endpoints."

[AI follows playbook instructions and documents the contracts]
```

## Common Workflows

### Document Current API Contracts

1. Use **PLAYBOOK_01_DOCUMENT_CONTRACTS.md**
2. Specify APIs to document (e.g., Public API, Admin API)
3. AI will create complete API contract documentation

### Validate API Usage

1. Use **PLAYBOOK_02_VALIDATE_USAGE.md**
2. Specify API to validate (e.g., "Public API endpoints")
3. AI will validate against frontend/backend usage and generate report

### Find Gaps Between Contracts and Usage

1. Use **PLAYBOOK_03_GAP_ANALYSIS.md**
2. Specify API area to analyze (e.g., "Public API endpoints")
3. AI will identify gaps across frontend, backend, and API layers

### Plan API Versioning

1. Use **PLAYBOOK_04_PLAN_VERSIONING.md**
2. Provide gap analysis or list of versioning needs
3. AI will create versioning plan with tasks and priorities

### Implement API Versioning

1. Use **PLAYBOOK_05_IMPLEMENT_VERSIONING.md**
2. Specify task to implement
3. AI will implement while maintaining doc sync

### Update API Contracts After Changes

1. Use **PLAYBOOK_06_UPDATE_CONTRACTS.md**
2. Describe what changed (contracts or code)
3. AI will update API contract documentation

### Audit All API Contracts

1. Use **PLAYBOOK_07_API_AUDIT.md**
2. AI will check all API contracts for accuracy and drift

## Phase-Based Usage

### Phase 1: Baseline Documentation

**Goal**: Document existing API contracts

**Playbooks**:

1. **PLAYBOOK_01** - Document endpoints, request/response formats
2. **PLAYBOOK_02** - Validate documentation

**Process**:

```
For each API area:
  1. Use PLAYBOOK_01 to document
  2. Use PLAYBOOK_02 to validate
  3. Fix discrepancies
  4. Mark as "validated"
```

### Phase 2: Gap Analysis

**Goal**: Identify gaps between contracts and usage

**Playbooks**:

1. **PLAYBOOK_02** - Validate contracts (if not done)
2. **PLAYBOOK_03** - Analyze gaps

**Process**:

```
1. Use PLAYBOOK_02 to validate all API contracts
2. Use PLAYBOOK_03 to analyze gaps
3. Prioritize gaps
4. Create versioning plan (PLAYBOOK_04)
```

### Phase 3: Versioning

**Goal**: Align API with contracts

**Playbooks**:

1. **PLAYBOOK_04** - Plan versioning
2. **PLAYBOOK_05** - Implement versioning
3. **PLAYBOOK_02** - Validate after implementation

**Process**:

```
1. Use PLAYBOOK_04 to create versioning plan
2. For each task:
   a. Use PLAYBOOK_05 to implement
   b. Use PLAYBOOK_02 to validate
   c. Update contracts if needed (PLAYBOOK_06)
```

### Phase 4: Iterative Enhancement

**Goal**: Continuously improve API contracts

**Playbooks**:

1. **PLAYBOOK_06** - Update contracts
2. **PLAYBOOK_02** - Validate updates
3. **PLAYBOOK_07** - Regular audits

**Process**:

```
When API contracts or code changes:
  1. Use PLAYBOOK_06 to update contracts
  2. Use PLAYBOOK_02 to validate
  3. Use PLAYBOOK_05 to implement (if contract change)
  4. Use PLAYBOOK_07 monthly for audits
```

## Quick Reference Table

| Task                  | Playbook    | Input               | Output                    |
| --------------------- | ----------- | ------------------- | ------------------------- |
| Document contracts    | PLAYBOOK_01 | API files           | Complete contract doc     |
| Validate usage        | PLAYBOOK_02 | Contract doc        | Validation report          |
| Find gaps             | PLAYBOOK_03 | Contracts + usage   | Gap analysis report        |
| Plan versioning       | PLAYBOOK_04 | Gap analysis        | Versioning plan            |
| Implement versioning  | PLAYBOOK_05 | Versioning task     | API changes + updates      |
| Update contracts      | PLAYBOOK_06 | Change description  | Updated contracts          |
| Audit all             | PLAYBOOK_07 | (none)              | Audit report               |

## Tips

1. **Always validate after documenting** - Use PLAYBOOK_02 after PLAYBOOK_01
2. **Document before versioning** - Use PLAYBOOK_01 before PLAYBOOK_05
3. **Plan before implementing** - Use PLAYBOOK_04 before PLAYBOOK_05
4. **Update contracts with code changes** - Use PLAYBOOK_06 when code changes
5. **Regular audits** - Use PLAYBOOK_07 monthly

## Getting Help

- See **README.md** for overview
- See individual playbooks for detailed instructions
- See **../../ux-workflows/playbooks/** for reference examples

---

**Last Updated:** 2025-01-XX

