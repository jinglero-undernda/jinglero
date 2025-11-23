# Playbook 02: Validate Usage

## Purpose

This playbook provides step-by-step instructions for validating API contract documentation against actual usage in frontend and backend code. Use this to check for sync issues, verify accuracy, and identify discrepancies between documented contracts and actual implementation.

## When to Use This Playbook

- After documenting API contracts (PLAYBOOK_01)
- After code changes that might affect API usage
- Before refactoring (to establish baseline)
- Regular maintenance (monthly audits)
- When sync issues are suspected

## Prerequisites

- API contract document exists
- Access to codebase
- API contract document has code references
- Understanding of frontend and backend usage

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

### Step 1: Read API Contract Document

**Your task:**
1. Read the complete API contract documentation
2. Extract all technical details:
   - Endpoint paths and methods
   - Request/response formats
   - Validation rules
   - File paths and line numbers

**Create a checklist:**
```
Extracted from API Contracts:
- Endpoints: [list]
- Request formats: [list]
- Response formats: [list]
- Validation rules: [list]
```

### Step 2: Validate Code References

**For each code reference in the contract:**

1. **Check file exists:**
   - Use `read_file` to verify file exists
   - Check if line numbers are reasonable

2. **Verify code matches description:**
   - Read the referenced code
   - Compare to contract description
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

### Step 3: Validate Against Frontend Usage

**For each endpoint, check frontend usage:**

1. **Find frontend API calls:**
   - Search for API calls in frontend code
   - Find fetch/axios calls
   - Locate API client code

2. **Verify frontend usage matches contract:**
   - Do API calls match documented endpoints?
   - Do request formats match contract?
   - Do response handlers match contract?
   - Are validation rules followed?

3. **Check data flow:**
   - Verify API request format matches contract
   - Check API response handling matches contract
   - Verify error handling matches contract

**Validation checklist:**
```
Frontend Usage:
- [ ] All API calls match contracts
- [ ] Request formats match contracts
- [ ] Response handling matches contracts
- [ ] Error handling matches contracts
- [ ] No contract violations
```

### Step 4: Validate Against Backend Implementation

**For each endpoint, check backend implementation:**

1. **Find backend route handlers:**
   - Search for route definitions
   - Find request handlers
   - Locate validation code

2. **Verify backend matches contract:**
   - Do route handlers match documented endpoints?
   - Do request handlers match contract?
   - Do response formats match contract?
   - Are validation rules implemented?

3. **Check implementation:**
   - Verify route paths match contract
   - Check request validation matches contract
   - Verify response format matches contract
   - Check error responses match contract

**Validation checklist:**
```
Backend Implementation:
- [ ] All routes match contracts
- [ ] Request validation matches contracts
- [ ] Response formats match contracts
- [ ] Error responses match contracts
- [ ] No contract violations
```

### Step 5: Validate Request/Response Formats

**For each endpoint, validate formats:**

1. **Request Format Validation:**
   - Check request body schemas match contract
   - Verify parameter formats match contract
   - Check content types match contract

2. **Response Format Validation:**
   - Check response body schemas match contract
   - Verify error formats match contract
   - Check metadata formats match contract

3. **Type Validation:**
   - Verify TypeScript types match contract
   - Check JSON schemas match contract
   - Verify validation schemas match contract

**Validation checklist:**
```
Request/Response Formats:
- [ ] Request formats match contracts
- [ ] Response formats match contracts
- [ ] Type definitions match contracts
- [ ] Validation schemas match contracts
```

### Step 6: Validate Validation Rules

**For each endpoint, validate validation:**

1. **Parameter Validation:**
   - Check parameter validation matches contract
   - Verify required/optional matches contract
   - Check parameter types match contract

2. **Data Validation:**
   - Check data validation matches contract
   - Verify field validation matches contract
   - Check constraint validation matches contract

3. **Business Logic Validation:**
   - Check business rules match contract
   - Verify relationship validation matches contract
   - Check state validation matches contract

**Validation checklist:**
```
Validation Rules:
- [ ] Parameter validation matches contracts
- [ ] Data validation matches contracts
- [ ] Business logic validation matches contracts
```

### Step 7: Generate Validation Report

**Create validation report:**

```markdown
# API Contract Validation Report

**Date**: [YYYY-MM-DD]
**Validator**: AI Assistant
**API Contract Version**: [version]

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

## Frontend Usage

### Validated ✅
- [Endpoint] - ✅ Matches contract
- [list validated endpoints]

### Discrepancies ❌
- [Endpoint] - ❌ [discrepancy details]
- [list discrepancies]

## Backend Implementation

### Validated ✅
- [Endpoint] - ✅ Matches contract
- [list validated endpoints]

### Discrepancies ❌
- [Endpoint] - ❌ [discrepancy details]
- [list discrepancies]

## Request/Response Formats

### Validated ✅
- [Format] - ✅ Matches contract
- [list validated formats]

### Discrepancies ❌
- [Format] - ❌ [discrepancy details]
- [list discrepancies]

## Validation Rules

### Validated ✅
- [Rule] - ✅ Matches contract
- [list validated rules]

### Discrepancies ❌
- [Rule] - ❌ [discrepancy details]
- [list discrepancies]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps

- [ ] Update contracts with corrections
- [ ] Fix code discrepancies (if contract is source of truth)
- [ ] Update code references if code moved
- [ ] Re-validate after fixes
```

### Step 8: Update Contract Status

**Based on validation results:**

- **All validated** → Update status to `validated`
- **Discrepancies found** → Keep status as `current_implementation` or `draft`
- **Major discrepancies** → Mark for refactoring

**Update contract metadata:**
```markdown
- **Status**: validated | current_implementation | needs_refactoring
- **Last Validated**: [YYYY-MM-DD]
```

## Output Deliverables

1. **Validation Report** (comprehensive document)
2. **Updated Contract Status** (in main contract document)

## Quality Criteria

**Good validation:**
- ✅ All code references checked
- ✅ All usage validated
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
Validate the API contract documentation against frontend and backend usage.
Check all endpoints, request/response formats, and validation rules.
Verify frontend API calls match contracts,
and backend implementation matches contracts.
Generate a validation report.
```

## Next Steps

After validation:
1. **If validated** → Mark as `validated`, proceed to gap analysis if needed
2. **If discrepancies** → Use PLAYBOOK_06 to update contracts, or PLAYBOOK_04 to plan versioning
3. **If major issues** → Use PLAYBOOK_03 for gap analysis

---

**Related Playbooks:**
- PLAYBOOK_01: Document Contracts (use before this)
- PLAYBOOK_03: Gap Analysis (use if discrepancies found)
- PLAYBOOK_06: Update Contracts (use to fix discrepancies)

