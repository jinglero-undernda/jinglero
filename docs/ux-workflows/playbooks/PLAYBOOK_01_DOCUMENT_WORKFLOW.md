# Playbook 01: Document Workflow

## Purpose

This playbook provides step-by-step instructions for documenting a UX workflow, either from existing code or from a UX description. Use this playbook when you need to create or update workflow documentation.

## When to Use This Playbook

- Documenting an existing workflow from code
- Documenting a new workflow from UX description
- Creating baseline documentation for Phase 1
- Updating workflow documentation with new details

## Prerequisites

- Access to codebase
- Understanding of the workflow to document
- Workflow ID assigned (check `../README.md` for next available ID)

## Instructions for AI Assistant

### Step 1: Understand the Task

**User will provide:**
- Workflow name/description
- Whether documenting existing code or new UX
- Any specific components/files to focus on

**Your task:**
- Understand the workflow scope
- Identify if this is existing code or new design
- Determine workflow type (User Journey, Interaction Pattern, State Machine, etc.)

### Step 2: Gather Information

**For Existing Code Workflows:**

1. **Search codebase** for relevant components:
   ```
   - Search for main component files
   - Find related components
   - Identify API calls
   - Locate state management
   ```

2. **Read key files:**
   - Main component file(s)
   - Related components
   - API client files
   - State management files
   - Route definitions

3. **Trace the flow:**
   - User action → Component response → State change → API call → UI update
   - Document all steps in sequence

**For New UX Workflows:**

1. **Clarify requirements:**
   - Ask user for detailed UX description
   - Identify user goals
   - Understand edge cases
   - Clarify technical constraints

2. **Map to existing patterns:**
   - Check if similar workflows exist
   - Identify reusable components
   - Find similar API patterns
   - Note technical constraints

### Step 3: Create Workflow Document

**File Structure:**
- Main document: `WORKFLOW_XXX_name.md`
- Diagram: `WORKFLOW_XXX_name_diagram.md` (optional, create if complex)
- Validation: `WORKFLOW_XXX_name_validation.md` (create in separate step)

**Document Template:**

```markdown
# WORKFLOW_XXX: [Name]

## Metadata

- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Last Validated**: [not yet validated]
- **Code Reference**: [file:line-range] (for existing code)
- **Version**: 1.0
- **Workflow Type**: [User Journey | Interaction Pattern | State Machine | Error Flow | Navigation Flow]

## User Intent

[High-level goal - what user wants to accomplish]

## Overview

- **Purpose**: [What this workflow does]
- **User Context**: [Who uses this, when, why]
- **Success Criteria**: [How we know it works]
- **Related Components**: [List component files]
- **Dependencies**: [Other workflows this depends on]

## UX Flow

### Step 1: [Initial Action]

**User Action**: [What user does]

**System Response**: [What system does]

**UI State**:
- [State variable]: [value]
- Visual: [what user sees]

**Data Changes**: [What data changes]

**Code Reference**: `file.tsx:line-range`

### Step 2: [Next Action]

[... repeat for each step ...]

## Edge Cases

### Edge Case 1: [Scenario]

**Trigger**: [What causes this]

**Expected Behavior**: [What should happen]

**Code Reference**: `file.tsx:line-range`

[... more edge cases ...]

## Technical Implementation

### State Management

**State Variables**:
- `variableName` (type): [description] - `file.tsx:line`
- [list all state variables with code references]

**State Transitions**:
- [State A] → [Action] → [State B]
- [document all transitions]

### API Integration

**Endpoints Used**:
- `METHOD /api/path` - [purpose] - `file.ts:line`
- [list all API calls with code references]

**Data Flow**:
1. [Step 1]
2. [Step 2]
3. [etc.]

### Components

**Component Responsibilities**:
- `ComponentName.tsx`: [responsibility] - `file.tsx:line-range`
- [list all components with responsibilities]

## Validation Checklist

[See PLAYBOOK_02 for validation - create placeholder here]

## Related Workflows

- WORKFLOW_XXX: [Related workflow name]
- [list related workflows]

## Change History

| Version | Date       | Change                      | Author | Rationale      |
| ------- | ---------- | --------------------------- | ------ | -------------- |
| 1.0     | YYYY-MM-DD | Initial documentation       | -      | Baseline       |
```

### Step 4: Create Mermaid Diagram (if needed)

**For complex workflows, create a diagram file:**

```markdown
# WORKFLOW_XXX: [Name] - Flow Diagram

## State Diagram

\`\`\`mermaid
stateDiagram-v2
    [State1] --> [State2]: [Action]
    [State2] --> [State3]: [Action]
    ...
\`\`\`

## Flowchart

\`\`\`mermaid
flowchart TD
    Start([User Action]) --> Step1[System Response]
    Step1 --> Step2[Next Step]
    ...
\`\`\`
```

### Step 5: Add Code References

**Critical:** Every technical detail must have a code reference:

- State variables: `file.tsx:line-number`
- API calls: `file.ts:line-number`
- Components: `file.tsx:line-range`
- Functions: `file.tsx:line-range`

**How to find references:**
- Use `grep` to find definitions
- Use `codebase_search` to understand usage
- Read files to get exact line numbers

### Step 6: Review and Refine

**Checklist:**
- [ ] All user actions documented
- [ ] All system responses documented
- [ ] All state variables referenced
- [ ] All API calls referenced
- [ ] All components referenced
- [ ] Edge cases documented
- [ ] Code references accurate
- [ ] Flow is complete and logical

### Step 7: Update README

**Update `../README.md` workflow table:**

```markdown
| WORKFLOW_XXX | [Name] | current_implementation | YYYY-MM-DD |
```

## Output Deliverables

1. **Main workflow document** (`WORKFLOW_XXX_name.md`)
2. **Diagram document** (`WORKFLOW_XXX_name_diagram.md`) - if created
3. **Updated README.md** with new workflow entry

## Quality Criteria

**Good workflow documentation:**
- ✅ Complete flow from start to end
- ✅ All code references accurate
- ✅ Edge cases documented
- ✅ Technical details match code
- ✅ Clear and readable

**Red flags:**
- ❌ Missing code references
- ❌ Vague descriptions
- ❌ Missing edge cases
- ❌ Incomplete flow
- ❌ Technical details don't match code

## Example Prompts for User

**For existing code:**
```
Document the entity creation workflow. 
The main component is AdminDashboard.tsx, 
and it uses EntityForm.tsx for the form.
```

**For new UX:**
```
Document a new workflow for bulk entity operations.
Users should be able to select multiple entities 
and perform actions like delete or update.
```

## Next Steps

After documenting:
1. **Validate the workflow** using PLAYBOOK_02
2. **Create validation checklist** (part of PLAYBOOK_02)
3. **Update workflow status** based on validation results

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Workflow (use after this)
- PLAYBOOK_06: Update Workflow (for updates)

