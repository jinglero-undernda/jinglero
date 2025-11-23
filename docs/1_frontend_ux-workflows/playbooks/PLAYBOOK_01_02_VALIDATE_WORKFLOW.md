# Playbook 02: Validate Workflow

## Purpose

This playbook provides step-by-step instructions for validating workflow documentation against the codebase. Use this to check for sync issues, verify accuracy, and identify discrepancies.

## When to Use This Playbook

- After documenting a workflow (PLAYBOOK_01)
- After code changes that might affect workflows
- Before refactoring (to establish baseline)
- Regular maintenance (monthly audits)
- When sync issues are suspected

## Prerequisites

- Workflow document exists
- Access to codebase
- Workflow document has code references

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

### Step 1: Read Workflow Document

**Your task:**
1. Read the complete workflow document
2. Extract all technical details:
   - State variables
   - API endpoints
   - Component names
   - Function names
   - File paths and line numbers

**Create a checklist:**
```
Extracted from WORKFLOW_XXX:
- State variables: [list]
- API endpoints: [list]
- Components: [list]
- Functions: [list]
```

### Step 2: Validate Code References

**For each code reference in the workflow:**

1. **Check file exists:**
   - Use `read_file` to verify file exists
   - Check if line numbers are reasonable

2. **Verify code matches description:**
   - Read the referenced code
   - Compare to workflow description
   - Note any discrepancies

3. **Check for moved code:**
   - If file/line doesn't match, search for the code
   - Update reference if code moved

**Validation checklist:**
```
Code References:
- [ ] File exists
- [ ] Line numbers accurate
- [ ] Code matches description
- [ ] No moved/deleted code
```

### Step 3: Validate State Management

**For each state variable:**

1. **Find definition:**
   ```typescript
   // Search for: const [variableName, setVariableName] = useState
   ```

2. **Verify usage:**
   - Check all places variable is used
   - Verify state transitions match workflow
   - Check initial state matches workflow

3. **Check state coordination:**
   - Verify derived states (e.g., `hasUnsavedChanges = metadataHasChanges || relationshipHasChanges`)
   - Check state updates match workflow steps

**Validation checklist:**
```
State Management:
- [ ] All state variables exist
- [ ] Initial states match workflow
- [ ] State transitions match workflow
- [ ] State coordination correct
```

### Step 4: Validate API Integration

**For each API endpoint:**

1. **Find API definition:**
   - Check API client file
   - Verify endpoint exists
   - Check method (GET, POST, PUT, DELETE)

2. **Verify usage:**
   - Find where endpoint is called
   - Check request/response handling
   - Verify error handling matches workflow

3. **Check data flow:**
   - Verify request payload matches workflow
   - Check response handling matches workflow
   - Verify error scenarios match edge cases

**Validation checklist:**
```
API Integration:
- [ ] All endpoints exist
- [ ] Methods correct (GET/POST/PUT/DELETE)
- [ ] Request payloads match workflow
- [ ] Response handling matches workflow
- [ ] Error handling matches edge cases
```

### Step 5: Validate Component Behavior

**For each component:**

1. **Find component file:**
   - Verify component exists
   - Check props interface

2. **Verify props match workflow:**
   - Check required props
   - Verify callback props
   - Check prop types

3. **Verify behavior:**
   - Check component logic matches workflow steps
   - Verify UI states match workflow
   - Check event handlers match user actions

**Validation checklist:**
```
Component Behavior:
- [ ] All components exist
- [ ] Props match workflow requirements
- [ ] Callbacks match workflow actions
- [ ] UI states match workflow states
- [ ] Event handlers match user actions
```

### Step 6: Validate Workflow Steps

**For each workflow step:**

1. **Trace the flow:**
   - User action → Component handler → State update → API call → UI update
   - Verify each step matches code

2. **Check edge cases:**
   - Verify error handling code exists
   - Check alternative paths exist
   - Verify boundary conditions handled

3. **Check navigation:**
   - Verify navigation paths exist
   - Check route definitions
   - Verify navigation blocking works

**Validation checklist:**
```
Workflow Steps:
- [ ] Step 1: [description] - [pass/fail]
- [ ] Step 2: [description] - [pass/fail]
- [ ] Edge case 1: [description] - [pass/fail]
- [ ] Edge case 2: [description] - [pass/fail]
```

### Step 7: Generate Validation Report

**Create validation report:**

```markdown
# WORKFLOW_XXX: [Name] - Validation Report

**Date**: [YYYY-MM-DD]
**Validator**: AI Assistant
**Workflow Version**: [version]

## Summary

- **Status**: [validated | discrepancies_found | needs_review]
- **Total Checks**: [number]
- **Passed**: [number]
- **Failed**: [number]
- **Warnings**: [number]

## Code References

### Validated ✅
- `file.tsx:line` - [description] - ✅ Matches
- [list all validated references]

### Discrepancies ❌
- `file.tsx:line` - [description] - ❌ [discrepancy details]
- [list all discrepancies]

### Needs Update ⚠️
- `file.tsx:line` - [description] - ⚠️ [what needs update]
- [list all items needing update]

## State Management

### Validated ✅
- `variableName` - ✅ Exists, matches workflow
- [list validated state variables]

### Discrepancies ❌
- `variableName` - ❌ [discrepancy details]
- [list discrepancies]

## API Integration

### Validated ✅
- `METHOD /api/path` - ✅ Exists, matches workflow
- [list validated endpoints]

### Discrepancies ❌
- `METHOD /api/path` - ❌ [discrepancy details]
- [list discrepancies]

## Component Behavior

### Validated ✅
- `ComponentName` - ✅ Props and behavior match
- [list validated components]

### Discrepancies ❌
- `ComponentName` - ❌ [discrepancy details]
- [list discrepancies]

## Workflow Steps

### Validated ✅
- Step 1: [description] - ✅ Matches code
- [list validated steps]

### Discrepancies ❌
- Step 2: [description] - ❌ [discrepancy details]
- [list discrepancies]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]
3. [etc.]

## Next Steps

- [ ] Update workflow document with corrections
- [ ] Fix code discrepancies (if workflow is source of truth)
- [ ] Update code references if code moved
- [ ] Re-validate after fixes
```

### Step 8: Create/Update Validation Checklist

**Create or update `WORKFLOW_XXX_name_validation.md`:**

```markdown
# WORKFLOW_XXX: [Name] - Validation Checklist

**Last Validated**: [YYYY-MM-DD]
**Validation Status**: [validated | discrepancies_found]

## 1. Code References

- [ ] All file paths exist
- [ ] All line numbers accurate
- [ ] Code matches descriptions
- [ ] No moved/deleted code

## 2. State Management

- [ ] All state variables exist
- [ ] Initial states match workflow
- [ ] State transitions match workflow
- [ ] State coordination correct

## 3. API Integration

- [ ] All endpoints exist
- [ ] Methods correct
- [ ] Request/response handling matches
- [ ] Error handling matches edge cases

## 4. Component Behavior

- [ ] All components exist
- [ ] Props match workflow
- [ ] Callbacks match actions
- [ ] UI states match workflow

## 5. Workflow Steps

[Copy from workflow document, add checkboxes]

## 6. Edge Cases

[Copy from workflow document, add checkboxes]

## Validation Results

[Link to validation report or paste summary]
```

### Step 9: Update Workflow Status

**Based on validation results:**

- **All validated** → Update status to `validated`
- **Discrepancies found** → Keep status as `current_implementation` or `draft`
- **Major discrepancies** → Mark for refactoring

**Update workflow metadata:**
```markdown
- **Status**: validated | current_implementation | needs_refactoring
- **Last Validated**: [YYYY-MM-DD]
```

## Output Deliverables

1. **Validation Report** (can be in workflow document or separate file)
2. **Updated Validation Checklist** (`WORKFLOW_XXX_name_validation.md`)
3. **Updated Workflow Status** (in main workflow document)

## Quality Criteria

**Good validation:**
- ✅ All code references checked
- ✅ All discrepancies documented
- ✅ Clear recommendations provided
- ✅ Actionable next steps

**Red flags:**
- ❌ Missing code references not checked
- ❌ Vague discrepancy descriptions
- ❌ No recommendations
- ❌ Unclear next steps

## Example Prompts for User

```
Validate WORKFLOW_001_entity-edit-mode.md against the codebase.
Check all code references, state management, API calls, and component behavior.
Generate a validation report.
```

## Next Steps

After validation:
1. **If validated** → Mark as `validated`, proceed to gap analysis if needed
2. **If discrepancies** → Use PLAYBOOK_06 to update workflow, or PLAYBOOK_04 to plan refactoring
3. **If major issues** → Use PLAYBOOK_03 for gap analysis

---

**Related Playbooks:**
- PLAYBOOK_01: Document Workflow (use before this)
- PLAYBOOK_03: Gap Analysis (use if discrepancies found)
- PLAYBOOK_06: Update Workflow (use to fix discrepancies)

