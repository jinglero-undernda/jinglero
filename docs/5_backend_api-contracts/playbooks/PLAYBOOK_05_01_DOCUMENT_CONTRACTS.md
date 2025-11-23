# Playbook 01: Document Contracts

## Purpose

This playbook provides step-by-step instructions for documenting API contracts, either from existing code or from API specifications. Use this playbook when you need to create or update API contract documentation.

## When to Use This Playbook

- Documenting existing API contracts from code
- Documenting new API contract specifications
- Creating baseline documentation for Phase 1
- Updating API contract documentation with new details

## Prerequisites

- Access to codebase
- Understanding of what to document (endpoints, request/response formats)
- Knowledge of API file locations

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
- What to document (endpoints, request/response formats, validation rules)
- Whether documenting existing API or new specifications
- Specific APIs to document (Public API, Admin API, etc.)

**Your task:**
- Understand the scope (endpoints, formats, validation, or full API)
- Identify if this is existing API or new design
- Determine what files to examine

### Step 2: Gather Information

**For Existing API:**

1. **Search codebase** for relevant files:
   ```
   - Search for API route files (public.ts, admin.ts)
   - Find OpenAPI/Swagger specifications
   - Locate validation code
   - Find type definitions
   ```

2. **Read key files:**
   - API route files (e.g., `backend/src/server/api/public.ts`)
   - OpenAPI specification (e.g., `backend/src/server/api/openapi.yaml`)
   - Type definition files
   - Validation files

3. **Extract API information:**
   - Endpoint paths and methods
   - Request parameters
   - Request body formats
   - Response formats
   - Error responses
   - Validation rules

**For New API Specifications:**

1. **Clarify requirements:**
   - Ask user for API specifications
   - Identify endpoint requirements
   - Understand data requirements
   - Clarify validation requirements

2. **Map to existing patterns:**
   - Check existing API patterns
   - Identify reusable patterns
   - Note technical constraints
   - Consider consistency with existing APIs

### Step 3: Document Endpoints

**For each endpoint:**

1. **Endpoint Definition:**
   - HTTP method (GET, POST, PUT, PATCH, DELETE)
   - Endpoint path
   - Path parameters
   - Query parameters
   - Request body (if applicable)

2. **Response Format:**
   - Success response format
   - Error response format
   - Status codes

3. **Validation:**
   - Parameter validation rules
   - Data validation rules
   - Constraint validation

**Document in `contracts/{api-name}.md`:**

```markdown
# API Contract: [API Name]

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Last Validated**: [date or "not yet validated"]
- **Version**: [version]
- **Code Reference**: `file.ts:line-range`

## Overview
[Purpose and usage of this API]

## Endpoints

### [Endpoint Name]

**Method**: [GET | POST | PUT | PATCH | DELETE]
**Path**: `/api/[path]`
**Code Reference**: `file.ts:line`

#### Path Parameters
- `[param]`: [Type] - [Description]

#### Query Parameters
- `[param]`: [Type] - [Description] (optional/required)

#### Request Body
\`\`\`json
{
  "field1": "type",
  "field2": "type"
}
\`\`\`

#### Success Response (200)
\`\`\`json
{
  "data": {},
  "meta": {}
}
\`\`\`

#### Error Responses
- **400**: Bad Request - [Description]
- **404**: Not Found - [Description]
- **500**: Internal Server Error - [Description]

#### Validation Rules
- [Rule 1]
- [Rule 2]

#### Example Request
\`\`\`bash
curl -X [METHOD] /api/[path] \\
  -H "Content-Type: application/json" \\
  -d '{"field": "value"}'
\`\`\`

#### Example Response
\`\`\`json
{
  "data": {}
}
\`\`\`

---

[Repeat for each endpoint]
```

### Step 4: Document Request/Response Formats

**Document data formats:**

1. **Request Formats:**
   - Request body schemas
   - Parameter formats
   - Content types

2. **Response Formats:**
   - Response body schemas
   - Error formats
   - Metadata formats

3. **Type Definitions:**
   - TypeScript types
   - JSON schemas
   - Validation schemas

**Document in contract:**

```markdown
## Request/Response Formats

### Request Body Schema

\`\`\`typescript
interface RequestBody {
  field1: string;
  field2?: number;
}
\`\`\`

### Response Body Schema

\`\`\`typescript
interface ResponseBody {
  data: Entity;
  meta?: Metadata;
}
\`\`\`

### Error Response Schema

\`\`\`typescript
interface ErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, any>;
}
\`\`\`
```

### Step 5: Document Validation Rules

**Document validation specifications:**

1. **Parameter Validation:**
   - Required vs. optional parameters
   - Parameter types and constraints
   - Parameter formats

2. **Data Validation:**
   - Field validation rules
   - Data type validation
   - Constraint validation

3. **Business Logic Validation:**
   - Business rule validation
   - Relationship validation
   - State validation

**Document in contract:**

```markdown
## Validation Rules

### Parameter Validation

#### [Parameter Name]
- **Type**: [type]
- **Required**: [Yes | No]
- **Constraints**: [constraints]
- **Validation**: [validation rules]

### Data Validation

#### [Field Name]
- **Type**: [type]
- **Required**: [Yes | No]
- **Constraints**: [constraints]
- **Validation**: [validation rules]

### Business Logic Validation
- [Rule 1]
- [Rule 2]
```

### Step 6: Document Versioning

**Document versioning strategy:**

1. **Versioning Approach:**
   - Versioning strategy (URL, header, etc.)
   - Version format
   - Backward compatibility

2. **Version History:**
   - Version changes
   - Migration paths
   - Deprecation notices

**Document in contract:**

```markdown
## Versioning

### Versioning Strategy
[Description of versioning approach]

### Current Version
[Current API version]

### Version History
| Version | Date       | Changes                      |
| ------- | ---------- | ---------------------------- |
| 1.0     | YYYY-MM-DD | Initial version              |
| 1.1     | YYYY-MM-DD | [Changes]                    |

### Backward Compatibility
[Backward compatibility policy]

### Migration Paths
[Migration guidance for version changes]
```

### Step 7: Add Code References

**Critical:** Every API element must have a code reference:

- Endpoints: `file.ts:line-number`
- Validation: `file.ts:line-number`
- Types: `file.ts:line-number`

**How to find references:**
- Use `grep` to find route definitions
- Use `codebase_search` to understand usage
- Read API files to get exact line numbers

### Step 8: Create API Contract Summary

**Create or update API overview:**

```markdown
# API Contracts Overview

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Version**: 1.0

## APIs Documented
- Public API: [Status]
- Admin API: [Status]

## Endpoint Summary
[List endpoints with status]

## Versioning
[Versioning strategy summary]
```

### Step 9: Review and Refine

**Checklist:**
- [ ] All endpoints documented
- [ ] All request/response formats documented
- [ ] All validation rules documented
- [ ] All code references accurate
- [ ] Versioning documented
- [ ] API summary created
- [ ] Documentation is complete and logical

## Output Deliverables

1. **Endpoint documentation** (`contracts/{api-name}.md`)
2. **Request/response format documentation**
3. **Validation rules documentation**
4. **Versioning documentation**
5. **API overview** (summary document)
6. **Updated README.md** with API contract status

## Quality Criteria

**Good API contract documentation:**
- ✅ All endpoints documented with request/response formats
- ✅ All validation rules documented
- ✅ All code references accurate
- ✅ Versioning documented
- ✅ Clear and readable
- ✅ Examples provided

**Red flags:**
- ❌ Missing code references
- ❌ Vague descriptions
- ❌ Missing validation rules
- ❌ Incomplete endpoint definitions
- ❌ API doesn't match code

## Example Prompts for User

**For existing API:**
```
Document the current API contracts.
Check backend/src/server/api for API routes,
and document all Public API and Admin API endpoints.
```

**For new API:**
```
Document a new API endpoint for creating entities.
POST /api/admin/:type with request body validation.
Update the Admin API contract documentation.
```

## Next Steps

After documenting:
1. **Validate the contracts** using PLAYBOOK_02
2. **Create validation checklist** (part of PLAYBOOK_02)
3. **Update contract status** based on validation results

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Usage (use after this)
- PLAYBOOK_06: Update Contracts (for updates)

