# Playbook 02: Validate Implementation

## Purpose

This playbook provides step-by-step instructions for validating security requirement documentation against actual security implementation. Use this to check for sync issues, verify accuracy, and identify discrepancies between documented requirements and actual security.

## When to Use This Playbook

- After documenting security requirements (PLAYBOOK_01)
- After code changes that might affect security
- Before planning improvements (to establish baseline)
- Regular maintenance (monthly audits)
- When sync issues are suspected

## Prerequisites

- Security requirement document exists
- Access to codebase
- Security requirement document has code references
- Understanding of security implementation

## Instructions for AI Assistant

### Step 1: Read Security Requirement Document

**Your task:**
1. Read the complete security requirement documentation
2. Extract all technical details:
   - Security requirements
   - Authentication methods
   - Authorization rules
   - File paths and line numbers

**Create a checklist:**
```
Extracted from Security Requirements:
- Requirements: [list]
- Authentication: [list]
- Authorization: [list]
- Data Protection: [list]
```

### Step 2: Validate Code References

**For each code reference in the requirements:**

1. **Check file exists:**
   - Use `read_file` to verify file exists
   - Check if line numbers are reasonable

2. **Verify code matches description:**
   - Read the referenced code
   - Compare to requirement description
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

### Step 3: Validate Authentication Implementation

**For each authentication method, check implementation:**

1. **Find authentication code:**
   - Locate authentication implementation
   - Find token management code
   - Check session handling

2. **Verify authentication matches requirements:**
   - Do authentication methods match documented methods?
   - Do token management patterns match documented patterns?
   - Do session handling patterns match documented patterns?

3. **Check authentication security:**
   - Verify security measures are implemented
   - Check threat mitigation is in place
   - Verify best practices are followed

**Validation checklist:**
```
Authentication Implementation:
- [ ] Authentication code exists
- [ ] Authentication methods match requirements
- [ ] Token management matches requirements
- [ ] Session handling matches requirements
- [ ] Security measures implemented
```

### Step 4: Validate Authorization Implementation

**For each authorization rule, check implementation:**

1. **Find authorization code:**
   - Locate authorization implementation
   - Find access control code
   - Check permission checking code

2. **Verify authorization matches requirements:**
   - Do authorization rules match documented rules?
   - Do access control patterns match documented patterns?
   - Do permission models match documented models?

3. **Check authorization security:**
   - Verify security measures are implemented
   - Check threat mitigation is in place
   - Verify best practices are followed

**Validation checklist:**
```
Authorization Implementation:
- [ ] Authorization code exists
- [ ] Authorization rules match requirements
- [ ] Access control matches requirements
- [ ] Permission models match requirements
- [ ] Security measures implemented
```

### Step 5: Validate Data Protection Implementation

**For each data protection measure, check implementation:**

1. **Find data protection code:**
   - Locate encryption code
   - Find data privacy code
   - Check data handling code

2. **Verify data protection matches requirements:**
   - Do protection measures match documented measures?
   - Do encryption patterns match documented patterns?
   - Do privacy measures match documented measures?

3. **Check data protection security:**
   - Verify security measures are implemented
   - Check threat mitigation is in place
   - Verify best practices are followed

**Validation checklist:**
```
Data Protection Implementation:
- [ ] Data protection code exists
- [ ] Protection measures match requirements
- [ ] Encryption matches requirements
- [ ] Privacy measures match requirements
- [ ] Security measures implemented
```

### Step 6: Validate Compliance Implementation

**For each compliance requirement, check implementation:**

1. **Find compliance code:**
   - Locate compliance implementation
   - Find compliance validation code
   - Check compliance reporting code

2. **Verify compliance matches requirements:**
   - Do compliance standards match documented standards?
   - Do compliance rules match documented rules?
   - Do compliance patterns match documented patterns?

3. **Check compliance validation:**
   - Verify compliance is validated
   - Check compliance reporting works
   - Verify compliance requirements are met

**Validation checklist:**
```
Compliance Implementation:
- [ ] Compliance code exists
- [ ] Compliance standards match requirements
- [ ] Compliance rules match requirements
- [ ] Compliance validation works
```

### Step 7: Validate Against Requirements

**For each requirement, check requirements:**

1. **Find requirements:**
   - Locate security requirements
   - Find threat models
   - Check security goals

2. **Verify implementation meets requirements:**
   - Do security measures meet requirements?
   - Do threat mitigations meet requirements?
   - Are there missing requirements?

3. **Check gaps:**
   - Identify missing security measures
   - Identify requirements not met
   - Identify requirements not covered

**Validation checklist:**
```
Requirements:
- [ ] Security measures meet requirements
- [ ] Threat mitigations meet requirements
- [ ] No missing requirements
```

### Step 8: Generate Validation Report

**Create validation report:**

```markdown
# Security Requirement Validation Report

**Date**: [YYYY-MM-DD]
**Validator**: AI Assistant
**Security Requirement Version**: [version]

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

## Authentication Implementation

### Validated ✅
- [Method] - ✅ Matches requirements
- [list validated methods]

### Discrepancies ❌
- [Method] - ❌ [discrepancy details]
- [list discrepancies]

## Authorization Implementation

### Validated ✅
- [Rule] - ✅ Matches requirements
- [list validated rules]

### Discrepancies ❌
- [Rule] - ❌ [discrepancy details]
- [list discrepancies]

## Data Protection Implementation

### Validated ✅
- [Measure] - ✅ Matches requirements
- [list validated measures]

### Discrepancies ❌
- [Measure] - ❌ [discrepancy details]
- [list discrepancies]

## Requirements

### Validated ✅
- [Requirement] - ✅ Met
- [list validated requirements]

### Discrepancies ❌
- [Requirement] - ❌ [discrepancy details]
- [list discrepancies]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps

- [ ] Update requirements with corrections
- [ ] Fix code discrepancies (if requirement is source of truth)
- [ ] Update code references if code moved
- [ ] Re-validate after fixes
```

### Step 9: Update Requirement Status

**Based on validation results:**

- **All validated** → Update status to `validated`
- **Discrepancies found** → Keep status as `current_implementation` or `draft`
- **Major discrepancies** → Mark for improvement

**Update requirement metadata:**
```markdown
- **Status**: validated | current_implementation | needs_improvement
- **Last Validated**: [YYYY-MM-DD]
```

## Output Deliverables

1. **Validation Report** (comprehensive document)
2. **Updated Requirement Status** (in main requirement document)

## Quality Criteria

**Good validation:**
- ✅ All code references checked
- ✅ All security measures validated
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
Validate the security requirement documentation against actual implementation.
Check all requirements, authentication, authorization, and data protection.
Verify implementation matches requirements,
and security measures match documented strategy.
Generate a validation report.
```

## Next Steps

After validation:
1. **If validated** → Mark as `validated`, proceed to gap analysis if needed
2. **If discrepancies** → Use PLAYBOOK_06 to update requirements, or PLAYBOOK_04 to plan improvements
3. **If major issues** → Use PLAYBOOK_03 for gap analysis

---

**Related Playbooks:**
- PLAYBOOK_01: Document Requirements (use before this)
- PLAYBOOK_03: Gap Analysis (use if discrepancies found)
- PLAYBOOK_06: Update Requirements (use to fix discrepancies)

