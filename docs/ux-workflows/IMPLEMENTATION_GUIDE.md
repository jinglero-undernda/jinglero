# UX Workflows - Implementation Guide

## Overview

This guide explains how to use the UX workflow documentation in the development process, and how AI assistants can help validate code against documented workflows.

## Best Practices for UX Workflow Documentation

### 1. **Document Before Implementation**

Workflows should be documented **before** coding begins. This ensures:

- Clear requirements and expectations
- Alignment between design and implementation
- Testable acceptance criteria
- Reduced rework

**Process**:

1. Identify user need or feature
2. Design workflow (user journey, interactions, states)
3. Document workflow using templates
4. Review and approve workflow
5. Implement code to match workflow
6. Validate implementation against workflow

### 2. **Keep Workflows Focused**

Each workflow should cover a **single, cohesive user experience**:

- ✅ Good: "Entity Edit Mode" - one complete interaction pattern
- ❌ Bad: "Admin Portal" - too broad, multiple patterns

**Guidelines**:

- One workflow = one user goal
- Workflows can reference other workflows
- Keep workflows at similar levels of abstraction

### 3. **Use Visual Diagrams**

Mermaid diagrams make workflows easier to understand:

- Visual representation of flow
- Clear decision points
- Easy to spot missing paths
- Can be rendered in most Markdown viewers

**Tools**:

- Mermaid for flowcharts and state diagrams
- Consider BPMN for complex business processes
- Use consistent styling across diagrams

### 4. **Document Edge Cases**

Don't just document the "happy path":

- Error scenarios
- Alternative user paths
- Boundary conditions
- Error recovery flows

**Example**:

- Happy path: User saves changes successfully
- Edge case: Network error during save → show error, preserve changes, allow retry

### 5. **Link to Code**

Workflows should reference specific code:

- Component names and files
- Function names
- State variables
- API endpoints

**Benefits**:

- Easy to find relevant code
- Code reviews can check against workflow
- Changes to code can trigger workflow review

### 6. **Version Control**

Workflows are living documents:

- Track changes in Git
- Use status indicators (draft, approved, deprecated)
- Document why workflows change
- Link workflow changes to code changes

### 7. **Regular Validation**

Periodically validate code against workflows:

- Code review checklist
- Automated tests based on workflows
- Manual testing against workflow steps
- Update workflows when code diverges (with rationale)

---

## Using Workflows in Development

### Before Coding

1. **Find Relevant Workflows**

   - Check `docs/ux-workflows/README.md` for workflow index
   - Identify workflows related to your feature
   - Review workflow documents and diagrams

2. **Understand the Flow**

   - Read the detailed steps
   - Review edge cases
   - Check related workflows
   - Understand state transitions

3. **Plan Implementation**
   - Identify components needed
   - Plan state management
   - Identify API calls
   - Plan error handling

### During Coding

1. **Reference the Workflow**

   - Keep workflow document open
   - Reference workflow ID in code comments
   - Link PR description to workflow

2. **Follow the Flow**

   - Implement steps in order
   - Match state transitions
   - Handle edge cases
   - Follow error paths

3. **Document Deviations**
   - If implementation differs, document why
   - Update workflow if needed (with approval)
   - Note technical constraints

### After Coding

1. **Validate Implementation**

   - Use validation checklist
   - Test all workflow steps
   - Test edge cases
   - Verify error handling

2. **Update Workflow Status**

   - Mark workflow as "Implemented"
   - Add implementation notes
   - Link to code changes

3. **Code Review**
   - Reviewers check against workflow
   - Verify state management
   - Check component behavior
   - Validate API integration

---

## AI-Assisted Code Validation

### How AI Can Validate Code Against Workflows

AI assistants (like me) can:

1. **Read Workflow Documents**

   - Parse workflow specifications
   - Understand state machines
   - Identify expected behaviors

2. **Analyze Code**

   - Search codebase for relevant components
   - Read component implementations
   - Understand state management
   - Trace data flows

3. **Compare and Validate**

   - Check state transitions match workflow
   - Verify component props/callbacks match workflow steps
   - Validate API calls align with workflow
   - Check error handling matches edge cases
   - Verify navigation flows match documented paths

4. **Generate Validation Reports**
   - Create checklists
   - Identify discrepancies
   - Suggest fixes
   - Document findings

### Example Validation Process

**Prompt to AI**:

```
Please validate that the code implementation matches WORKFLOW_001_entity-edit-mode.md.
Check:
1. State management matches workflow states
2. Component behavior matches workflow steps
3. Edge cases are handled
4. Navigation flows match documented paths
```

**AI Response**:

- Analysis of code against workflow
- Checklist of validated items
- List of discrepancies found
- Suggestions for fixes

### Validation Checklist Template

When asking AI to validate, use this structure:

```
Validate WORKFLOW_XXX against codebase:

1. State Management
   - [ ] State variables match workflow states
   - [ ] State transitions match workflow flow
   - [ ] Initial state matches workflow start

2. Component Behavior
   - [ ] Component props match workflow requirements
   - [ ] Callbacks match workflow actions
   - [ ] UI states match workflow states

3. Workflow Steps
   - [ ] Step 1: [description] - [pass/fail]
   - [ ] Step 2: [description] - [pass/fail]
   - ...

4. Edge Cases
   - [ ] Edge case 1: [description] - [pass/fail]
   - [ ] Edge case 2: [description] - [pass/fail]
   - ...

5. API Integration
   - [ ] API calls match workflow requirements
   - [ ] Error handling matches edge cases
   - [ ] Data flow matches workflow

6. Navigation
   - [ ] Navigation paths match workflow
   - [ ] Navigation blocking works correctly
   - [ ] Return navigation works
```

---

## Workflow Documentation Structure

### Directory Layout

```
docs/ux-workflows/
├── README.md                          # Overview and index
├── IMPLEMENTATION_GUIDE.md            # This file
├── WORKFLOW_001_entity-edit-mode.md   # Main workflow document
├── WORKFLOW_001_entity-edit-mode_diagram.md  # Mermaid diagram
├── WORKFLOW_001_entity-edit-mode_validation.md  # Validation checklist
├── WORKFLOW_002_entity-creation.md   # Next workflow
└── ...
```

### Workflow Document Structure

Each workflow has three files:

1. **Main Document** (`WORKFLOW_XXX_name.md`):

   - Complete workflow specification
   - Detailed steps
   - Edge cases
   - Implementation notes
   - Validation checklist

2. **Diagram** (`WORKFLOW_XXX_name_diagram.md`):

   - Mermaid flowchart
   - Visual representation
   - State definitions

3. **Validation** (`WORKFLOW_XXX_name_validation.md`):
   - Code validation checklist
   - Component behavior checks
   - Test scenarios
   - Acceptance criteria

---

## Integration with Development Process

### Task Planning

When creating tasks:

1. Reference workflow ID in task description
2. Link to workflow document
3. Include workflow steps in acceptance criteria
4. Reference validation checklist

**Example Task**:

```
Task: Implement entity edit mode
Workflow: WORKFLOW_001
Acceptance Criteria:
- [ ] All steps in WORKFLOW_001 implemented
- [ ] Validation checklist passed
- [ ] Edge cases handled
```

### Code Comments

Reference workflows in code:

```typescript
// WORKFLOW_001: Step 2 - Enter Edit Mode
// When user clicks "Editar", set isEditing = true
// and ensure hasUnsavedChanges = false (CLEAN STATE)
const handleEditClick = () => {
  setIsEditing(true);
  setMetadataHasChanges(false);
  setRelationshipHasChanges(false);
};
```

### Pull Requests

In PR descriptions:

- Link to workflow document
- Reference workflow steps implemented
- Note any deviations from workflow
- Include validation results

**Example PR Description**:

```
Implements WORKFLOW_001: Entity Edit Mode

Changes:
- Added edit mode state management
- Implemented change tracking
- Added navigation warnings
- Handled all edge cases from workflow

Validation:
- [x] State management matches workflow
- [x] All workflow steps implemented
- [x] Edge cases handled
- [x] Tests pass

Deviations:
- None
```

### Testing

Create tests based on workflows:

- Unit tests for state transitions
- Integration tests for workflow steps
- E2E tests for complete flows
- Edge case tests

**Example Test**:

```typescript
describe("WORKFLOW_001: Entity Edit Mode", () => {
  it("Step 2: Enter Edit Mode - CLEAN STATE", () => {
    // Test that entering edit mode sets hasUnsavedChanges = false
  });

  it("Step 3a: Make Changes - Activates Guardar", () => {
    // Test that changes activate Guardar button
  });

  // ... more tests for each workflow step
});
```

---

## Benefits of This Approach

1. **Clear Requirements**: Workflows provide unambiguous specifications
2. **Consistent Implementation**: Code matches documented behavior
3. **Easier Testing**: Tests based on workflow steps
4. **Better Code Reviews**: Reviewers can check against workflows
5. **Documentation**: Workflows serve as living documentation
6. **Change Management**: Track how UX evolves over time
7. **AI Validation**: AI can systematically validate code against workflows

---

## Next Steps

1. **Document Existing Workflows**: Identify key user flows and document them
2. **Create Validation Checklists**: For each workflow, create detailed validation
3. **Integrate into Process**: Use workflows in task planning, coding, and reviews
4. **Regular Validation**: Periodically validate code against workflows
5. **Update Workflows**: Keep workflows current as product evolves

---

## Questions?

If you have questions about:

- How to document a workflow
- How to validate code against workflows
- How to integrate workflows into your process

Refer to the workflow documents or ask for assistance!
