# API Design & Contracts Documentation

## Purpose

This directory contains documentation for API contracts, including endpoint specifications, request/response formats, validation rules, and versioning strategies. The documentation serves as:

1. **API Specifications**: Define API contracts, endpoints, and data formats
2. **Implementation Guides**: Reference for developers implementing API clients
3. **Validation Criteria**: Check that API usage matches contracts
4. **Change Management**: Historical record of API decisions and versioning

## Documentation Structure

### API Contract Components

The API contract documentation covers:

1. **Endpoints**: Public API and Admin API endpoints
2. **Request/Response Formats**: Request bodies, response shapes, error formats
3. **Validation Rules**: Parameter validation, data validation, constraint validation
4. **Versioning**: API versioning strategy, backward compatibility, migration paths

### File Naming Convention

- `contracts/{api-name}.md` - API contract documentation (e.g., `contracts/public-api.md`)
- Contract specifications documented in playbook outputs
- API audits documented in playbook outputs

### API Contract Document Structure

Each API contract document should include:

1. **Metadata**

   - Document name and API version
   - Status (draft | current_implementation | validated | implemented | deprecated)
   - Last updated date
   - Related endpoints/files
   - Dependencies on other API contracts

2. **Endpoint Specifications**

   - Endpoint paths and methods
   - Request parameters
   - Request body formats
   - Response formats
   - Error responses

3. **Validation Rules**

   - Parameter validation
   - Data validation
   - Constraint validation

4. **Implementation Notes**

   - Code file locations
   - Usage patterns
   - Example requests/responses

5. **Validation Checklist**

   - Contract checks
   - Usage checks
   - Version checks

## API Contract Lifecycle

1. **draft**: Initial API contract specification, open for review
2. **current_implementation**: Documents existing API as-is
3. **validated**: Validated against code, matches current implementation
4. **implemented**: API updated to match contract (may include improvements)
5. **deprecated**: API endpoint replaced or no longer applicable

## Integration with Development Process

### Before Implementation

- Review relevant API contract documentation
- Identify API endpoints needed
- Plan implementation to match contract specifications

### During Implementation

- Reference API contract in code comments
- Use contract definitions from API files
- Follow contract patterns

### After Implementation

- Validate API against contract
- Update API status to "Implemented"
- Document any deviations and rationale

### Code Validation

API contract documents can be used to validate code by:

1. **Contract Compliance**: Verify code matches API contract definitions
2. **Request/Response Usage**: Check request/response usage matches contract
3. **Validation Rules**: Ensure validation rules are followed
4. **Version Compliance**: Verify versioning rules are followed

## Current API Contract Status

| Category              | Status                 | Last Updated | Notes                                    |
| --------------------- | ---------------------- | ------------ | ---------------------------------------- |
| Public API            | current_implementation | -            | Read-only endpoints documented           |
| Admin API             | current_implementation | -            | CRUD endpoints documented                |
| Request/Response      | current_implementation | -            | Formats documented in code               |
| Validation Rules      | current_implementation | -            | Validation in route handlers            |
| Versioning            | current_implementation | -            | Versioning strategy pending              |

## Best Practices

1. **Follow API Contracts**: Always follow documented contracts
2. **Maintain Consistency**: Use consistent request/response formats
3. **Document Changes**: Update API contracts when making changes
4. **Validate Regularly**: Check that implementation matches contracts
5. **Version Control**: Track changes to API contracts over time
6. **Review Regularly**: Update API contracts as product evolves
7. **Validate Against Code**: Regularly check that code matches documented contracts

## Tools

- **OpenAPI/Swagger**: API specification format
- **Markdown**: For documentation
- **Git**: For version control and change tracking

## Related Documentation

- `../../backend/API_REFACTORING_SUMMARY.md` - API architecture summary
- `../../backend/src/server/api/openapi.yaml` - OpenAPI specification
- `../../complete-refactor-analysis.md` - Strategic analysis and approach
- `playbooks/` - AI-ready playbooks for working with API contracts

## Playbooks

See [`playbooks/README.md`](./playbooks/README.md) for available playbooks to:

- Document API contracts
- Validate usage
- Analyze gaps
- Plan versioning
- Implement versioning
- Update contracts
- Audit contracts

---

**Last Updated:** 2025-01-XX

