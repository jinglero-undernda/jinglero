# Playbook 02: Validate Requirements

## Purpose

This playbook provides step-by-step instructions for validating schema documentation against frontend and backend requirements. Use this to check for sync issues, verify accuracy, and identify discrepancies between documented schema and actual requirements.

## When to Use This Playbook

- After documenting schema (PLAYBOOK_01)
- After code changes that might affect schema requirements
- Before refactoring (to establish baseline)
- Regular maintenance (monthly audits)
- When sync issues are suspected

## Prerequisites

- Schema document exists
- Access to codebase
- Schema document has code references
- Understanding of frontend and backend requirements

## Instructions for AI Assistant

### Step 1: Read Schema Document

**Your task:**
1. Read the complete schema documentation
2. Extract all technical details:
   - Node types
   - Relationship types
   - Property definitions
   - Constraints
   - File paths and line numbers

**Create a checklist:**
```
Extracted from Schema:
- Node types: [list]
- Relationship types: [list]
- Properties: [list]
- Constraints: [list]
```

### Step 2: Validate Code References

**For each code reference in the schema:**

1. **Check file exists:**
   - Use `read_file` to verify file exists
   - Check if line numbers are reasonable

2. **Verify code matches description:**
   - Read the referenced code
   - Compare to schema description
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

### Step 3: Validate Against Frontend Requirements

**For each schema element, check frontend usage:**

1. **Find frontend usage:**
   - Search for API calls that use schema elements
   - Find TypeScript types that reference schema
   - Locate component code that uses schema data

2. **Verify frontend needs:**
   - Do frontend components need all documented properties?
   - Are there frontend needs not in schema?
   - Do property types match frontend expectations?

3. **Check data flow:**
   - Verify API responses match schema
   - Check frontend data handling matches schema
   - Verify frontend queries match schema

**Validation checklist:**
```
Frontend Requirements:
- [ ] All frontend needs covered by schema
- [ ] Property types match frontend expectations
- [ ] API responses match schema
- [ ] Frontend queries match schema
- [ ] No missing properties needed by frontend
```

### Step 4: Validate Against Backend Requirements

**For each schema element, check backend usage:**

1. **Find backend usage:**
   - Search for backend code that uses schema
   - Find API endpoints that use schema
   - Locate database queries that use schema

2. **Verify backend needs:**
   - Do backend endpoints need all documented properties?
   - Are there backend needs not in schema?
   - Do property types match backend expectations?

3. **Check data flow:**
   - Verify database queries match schema
   - Check backend data handling matches schema
   - Verify API requests match schema

**Validation checklist:**
```
Backend Requirements:
- [ ] All backend needs covered by schema
- [ ] Property types match backend expectations
- [ ] Database queries match schema
- [ ] Backend data handling matches schema
- [ ] No missing properties needed by backend
```

### Step 5: Validate Database Implementation

**For each schema element, check database:**

1. **Find database implementation:**
   - Check if node types exist in database
   - Check if relationship types exist
   - Verify constraints are applied
   - Verify indexes exist

2. **Verify schema matches database:**
   - Compare documented schema to actual database
   - Check property types match
   - Verify constraints match
   - Check indexes match

3. **Check data integrity:**
   - Verify redundant properties are maintained
   - Check auto-sync behavior works
   - Verify system-managed properties work

**Validation checklist:**
```
Database Implementation:
- [ ] Node types exist in database
- [ ] Relationship types exist
- [ ] Constraints applied
- [ ] Indexes exist
- [ ] Schema matches database
- [ ] Data integrity maintained
```

### Step 6: Validate Type Definitions

**For each schema element, check TypeScript types:**

1. **Find type definitions:**
   - Locate TypeScript type files
   - Find type definitions for schema elements
   - Check type usage

2. **Verify types match schema:**
   - Compare TypeScript types to schema
   - Check property types match
   - Verify optional/required matches
   - Check relationship types match

**Validation checklist:**
```
Type Definitions:
- [ ] TypeScript types exist for all schema elements
- [ ] Property types match schema
- [ ] Optional/required matches schema
- [ ] Relationship types match schema
```

### Step 7: Generate Validation Report

**Create validation report:**

```markdown
# Schema Validation Report

**Date**: [YYYY-MM-DD]
**Validator**: AI Assistant
**Schema Version**: [version]

## Summary

- **Status**: [validated | discrepancies_found | needs_review]
- **Total Checks**: [number]
- **Passed**: [number]
- **Failed**: [number]
- **Warnings**: [number]

## Code References

### Validated ✅
- `file.ts:line` - [description] - ✅ Matches
- [list all validated references]

### Discrepancies ❌
- `file.ts:line` - [description] - ❌ [discrepancy details]
- [list all discrepancies]

## Frontend Requirements

### Validated ✅
- [Requirement] - ✅ Covered by schema
- [list validated requirements]

### Discrepancies ❌
- [Requirement] - ❌ [discrepancy details]
- [list discrepancies]

## Backend Requirements

### Validated ✅
- [Requirement] - ✅ Covered by schema
- [list validated requirements]

### Discrepancies ❌
- [Requirement] - ❌ [discrepancy details]
- [list discrepancies]

## Database Implementation

### Validated ✅
- [Element] - ✅ Matches schema
- [list validated elements]

### Discrepancies ❌
- [Element] - ❌ [discrepancy details]
- [list discrepancies]

## Type Definitions

### Validated ✅
- [Type] - ✅ Matches schema
- [list validated types]

### Discrepancies ❌
- [Type] - ❌ [discrepancy details]
- [list discrepancies]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps

- [ ] Update schema with corrections
- [ ] Fix code discrepancies (if schema is source of truth)
- [ ] Update code references if code moved
- [ ] Re-validate after fixes
```

### Step 8: Update Schema Status

**Based on validation results:**

- **All validated** → Update status to `validated`
- **Discrepancies found** → Keep status as `current_implementation` or `draft`
- **Major discrepancies** → Mark for refactoring

**Update schema metadata:**
```markdown
- **Status**: validated | current_implementation | needs_refactoring
- **Last Validated**: [YYYY-MM-DD]
```

## Output Deliverables

1. **Validation Report** (comprehensive document)
2. **Updated Schema Status** (in main schema document)

## Quality Criteria

**Good validation:**
- ✅ All code references checked
- ✅ All requirements validated
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
Validate the schema documentation against frontend and backend requirements.
Check all node types, relationship types, and properties.
Verify frontend TypeScript types match schema,
and backend API usage matches schema.
Generate a validation report.
```

## Next Steps

After validation:
1. **If validated** → Mark as `validated`, proceed to gap analysis if needed
2. **If discrepancies** → Use PLAYBOOK_06 to update schema, or PLAYBOOK_04 to plan migration
3. **If major issues** → Use PLAYBOOK_03 for gap analysis

---

**Related Playbooks:**
- PLAYBOOK_01: Document Schema (use before this)
- PLAYBOOK_03: Gap Analysis (use if discrepancies found)
- PLAYBOOK_06: Update Schema (use to fix discrepancies)

