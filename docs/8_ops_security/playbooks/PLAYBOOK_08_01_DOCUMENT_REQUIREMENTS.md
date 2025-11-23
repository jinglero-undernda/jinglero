# Playbook 01: Document Requirements

## Purpose

This playbook provides step-by-step instructions for documenting security requirements, either from existing code/requirements or from security specifications. Use this playbook when you need to create or update security requirement documentation.

## When to Use This Playbook

- Documenting existing security requirements from code/requirements
- Documenting new security requirement specifications
- Creating baseline documentation for Phase 1
- Updating security requirement documentation with new details

## Prerequisites

- Access to codebase
- Understanding of what to document (authentication, authorization, data protection)
- Knowledge of security-related file locations

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

### Step 1: Understand the Task

**User will provide:**
- What to document (authentication, authorization, data protection, compliance)
- Whether documenting existing security or new specifications
- Specific security areas to focus on

**Your task:**
- Understand the scope (requirements, authentication, authorization, or full security)
- Identify if this is existing security or new design
- Determine what files to examine

### Step 2: Gather Information

**For Existing Security:**

1. **Search codebase** for relevant information:
   ```
   - Search for authentication code (auth.ts, middleware)
   - Find authorization code
   - Locate data protection code
   - Find security-related configuration
   ```

2. **Read key files:**
   - Authentication code (e.g., `backend/src/server/middleware/auth.ts`)
   - Authorization code
   - Security configuration
   - Security-related requirements documents

3. **Extract security information:**
   - Security requirements
   - Authentication methods
   - Authorization rules
   - Data protection measures

**For New Security Specifications:**

1. **Clarify requirements:**
   - Ask user for security specifications
   - Identify security requirements
   - Understand threat models
   - Clarify compliance requirements

2. **Map to existing patterns:**
   - Check existing security patterns
   - Identify reusable patterns
   - Note technical constraints
   - Consider consistency with existing security

### Step 3: Document Security Requirements

**Document each security requirement:**

1. **Requirement Definition:**
   - Requirement name
   - Requirement description
   - Security goal
   - Threat model

2. **Requirement Context:**
   - Where this requirement applies
   - Why this requirement is important
   - What depends on this requirement

3. **Requirement Validation:**
   - How to validate
   - How to test
   - How to monitor

**Document in `requirements/{area}.md`:**

```markdown
# Security Requirements: [Area Name]

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Last Validated**: [date or "not yet validated"]
- **Code Reference**: `file.ts:line-range`

## Overview
[Purpose and usage of these security requirements]

## Security Requirements

### [Requirement Name]

**Description**: [Requirement description]
**Security Goal**: [What security goal this addresses]
**Threat Model**: [What threats this addresses]
**Code Reference**: `file.ts:line`

**Context**:
[Where this requirement applies and why it's important]

**Validation**:
[How to validate this requirement is met]

**Monitoring**:
[How to monitor this requirement]

---

[Repeat for each requirement]
```

### Step 4: Document Authentication

**Document authentication specifications:**

1. **Authentication Methods:**
   - Authentication method names
   - Authentication flows
   - Token management
   - Session handling

2. **Authentication Implementation:**
   - Current authentication implementation
   - Authentication patterns
   - Authentication configuration

3. **Authentication Security:**
   - Security measures
   - Threat mitigation
   - Best practices

**Document in requirements document:**

```markdown
## Authentication

### [Authentication Method]

**Type**: [Type: JWT | Session | OAuth | etc.]
**Flow**: [Authentication flow description]
**Code Reference**: `file.ts:line`

**Implementation**:
[How this authentication is implemented]

**Security Measures**:
[List security measures]

**Threat Mitigation**:
[How threats are mitigated]
```

### Step 5: Document Authorization

**Document authorization specifications:**

1. **Authorization Rules:**
   - Access control rules
   - Role-based access
   - Permission models

2. **Authorization Implementation:**
   - Current authorization implementation
   - Authorization patterns
   - Authorization configuration

3. **Authorization Security:**
   - Security measures
   - Threat mitigation
   - Best practices

**Document in requirements document:**

```markdown
## Authorization

### [Authorization Rule]

**Type**: [Type: Role-based | Permission-based | Attribute-based]
**Rule**: [Authorization rule description]
**Code Reference**: `file.ts:line`

**Implementation**:
[How this authorization is implemented]

**Security Measures**:
[List security measures]

**Threat Mitigation**:
[How threats are mitigated]
```

### Step 6: Document Data Protection

**Document data protection specifications:**

1. **Data Protection Measures:**
   - Encryption methods
   - Data privacy measures
   - Data handling procedures

2. **Data Protection Implementation:**
   - Current data protection implementation
   - Data protection patterns
   - Data protection configuration

3. **Data Protection Security:**
   - Security measures
   - Threat mitigation
   - Best practices

**Document in requirements document:**

```markdown
## Data Protection

### [Protection Measure]

**Type**: [Type: Encryption | Privacy | Handling]
**Measure**: [Protection measure description]
**Code Reference**: `file.ts:line`

**Implementation**:
[How this protection is implemented]

**Security Measures**:
[List security measures]

**Threat Mitigation**:
[How threats are mitigated]
```

### Step 7: Document Compliance

**Document compliance specifications:**

1. **Compliance Requirements:**
   - Compliance standards
   - Compliance rules
   - Compliance validation

2. **Compliance Implementation:**
   - Current compliance implementation
   - Compliance patterns
   - Compliance configuration

3. **Compliance Security:**
   - Security measures
   - Compliance validation
   - Best practices

**Document in requirements document:**

```markdown
## Compliance

### [Compliance Standard]

**Standard**: [Compliance standard name]
**Requirements**: [Compliance requirements]
**Code Reference**: `file.ts:line`

**Implementation**:
[How compliance is implemented]

**Validation**:
[How compliance is validated]

**Reporting**:
[How compliance is reported]
```

### Step 8: Add Code References

**Critical:** Every security element must have a code reference:

- Requirements: `file.ts:line-number` or requirements document
- Authentication: `file.ts:line-number`
- Authorization: `file.ts:line-number`
- Data Protection: `file.ts:line-number`

**How to find references:**
- Use `grep` to find security-related code
- Use `codebase_search` to understand patterns
- Read security code to get exact line numbers

### Step 9: Create Security Summary

**Create or update security overview:**

```markdown
# Security Overview

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Version**: 1.0

## Security Requirements
[List requirements with status]

## Authentication
[Summary of authentication]

## Authorization
[Summary of authorization]

## Data Protection
[Summary of data protection]

## Compliance
[Summary of compliance]
```

### Step 10: Review and Refine

**Checklist:**
- [ ] All security requirements documented
- [ ] All authentication methods documented
- [ ] All authorization rules documented
- [ ] All data protection measures documented
- [ ] All code references accurate
- [ ] Security summary created
- [ ] Documentation is complete and logical

## Output Deliverables

1. **Security requirement documentation** (`requirements/{area}.md`)
2. **Authentication documentation**
3. **Authorization documentation**
4. **Data protection documentation**
5. **Compliance documentation**
6. **Security overview** (summary document)
7. **Updated README.md** with security status

## Quality Criteria

**Good security documentation:**
- ✅ All requirements documented with goals and threat models
- ✅ All authentication methods documented
- ✅ All authorization rules documented
- ✅ All code references accurate
- ✅ Data protection measures documented
- ✅ Clear and readable

**Red flags:**
- ❌ Missing code references
- ❌ Vague requirement descriptions
- ❌ Missing threat models
- ❌ Incomplete requirement definitions
- ❌ Security doesn't match code

## Example Prompts for User

**For existing security:**
```
Document the current security requirements.
Check backend/src/server/middleware/auth.ts for authentication,
and analyze security requirements and implementation.
```

**For new security:**
```
Document new security requirements for user authentication.
Use JWT tokens, implement role-based access control.
Update the authentication requirements documentation.
```

## Next Steps

After documenting:
1. **Validate the requirements** using PLAYBOOK_02
2. **Create validation checklist** (part of PLAYBOOK_02)
3. **Update requirement status** based on validation results

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Implementation (use after this)
- PLAYBOOK_06: Update Requirements (for updates)

