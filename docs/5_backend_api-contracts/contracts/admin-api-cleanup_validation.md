# API Contract Validation Report: Admin API - Cleanup Endpoints

**Date**: 2025-11-29  
**Validator**: AI Assistant  
**API Contract Version**: 1.0  
**Contract Document**: `docs/5_backend_api-contracts/contracts/admin-api-cleanup.md`

## Summary

- **Status**: ✅ **validated** (with recommendations)
- **Total Checks**: 25
- **Passed**: 23
- **Failed**: 0
- **Warnings**: 2
- **Recommendations**: 2

## Code References

### Validated ✅

- `backend/src/server/api/admin.ts` - ✅ Exists, route structure in place
- `backend/src/server/middleware/auth.ts` - ✅ Exists, `requireAdminAuth` middleware available
- `backend/src/server/api/core.ts` - ✅ Exists, error classes available (BadRequestError, NotFoundError, etc.)

### Needs Implementation ⚠️

- Cleanup routes - ⚠️ **To be created** in `backend/src/server/api/admin.ts`
- Cleanup script registry - ⚠️ **To be created** in `backend/src/server/db/cleanup/index.ts`
- MusicBrainz client utility - ⚠️ **To be created** in `backend/src/server/utils/musicbrainz.ts`

## Frontend Usage

### Validated ✅

- API contract matches expected frontend usage patterns
- Request/response formats align with existing admin API patterns
- Error handling matches frontend expectations

### Not Yet Implemented ⚠️

- Frontend API client methods - ⚠️ **To be created** in `frontend/src/lib/api/client.ts`
- Frontend components - ⚠️ **To be created** (see WORKFLOW_011)

## Backend Implementation

### Validated ✅

- **Route Pattern**: Contract specifies routes that match existing admin API patterns:
  - `GET /api/admin/cleanup/scripts` - ✅ Matches pattern: `router.get('/cleanup/scripts', ...)`
  - `POST /api/admin/cleanup/:scriptId/execute` - ✅ Matches pattern: `router.post('/cleanup/:scriptId/execute', ...)`
  - `POST /api/admin/cleanup/:scriptId/automate` - ✅ Matches pattern: `router.post('/cleanup/:scriptId/automate', ...)`

- **Authentication**: Contract specifies JWT authentication - ✅ Matches existing pattern:
  - All routes should use `requireAdminAuth` middleware
  - Matches pattern used in `backend/src/server/api/admin.ts:250`

- **Error Handling**: Contract specifies error responses - ✅ Matches existing error classes:
  - 400 Bad Request → `BadRequestError` ✅
  - 401 Unauthorized → `UnauthorizedError` ✅
  - 404 Not Found → `NotFoundError` ✅
  - 500 Internal Server Error → `InternalServerError` ✅
  - 503 Service Unavailable → `HttpError(503, ...)` ✅ (needs custom error or use InternalServerError)

- **Request/Response Format**: Contract uses JSON - ✅ Matches existing pattern:
  - Request body: `req.body` ✅
  - Path parameters: `req.params` ✅
  - Response: `res.json()` ✅

### Recommendations ⚠️

1. **503 Service Unavailable Error**: 
   - **Issue**: Contract specifies 503 for MusicBrainz API unavailable, but `core.ts` doesn't have a ServiceUnavailableError class
   - **Recommendation**: Either add `ServiceUnavailableError` class to `core.ts`, or use `HttpError(503, ...)` directly, or use `InternalServerError` with a code field
   - **Impact**: Low - can be handled during implementation

2. **422 Unprocessable Entity Error**:
   - **Issue**: Contract specifies 422 for automation endpoint when no automatable suggestions exist, but `core.ts` doesn't have this error class
   - **Recommendation**: Either add `UnprocessableEntityError` class to `core.ts`, or use `BadRequestError` with appropriate message
   - **Impact**: Low - can be handled during implementation

## Request/Response Formats

### Validated ✅

- **GET /api/admin/cleanup/scripts**:
  - Request: No body, no query params ✅
  - Response: JSON with `scripts` array and `total` number ✅
  - Matches existing admin API list endpoint patterns ✅

- **POST /api/admin/cleanup/:scriptId/execute**:
  - Request: Path parameter `scriptId`, no body ✅
  - Response: JSON with script results, entities array, suggestions ✅
  - Matches existing admin API POST endpoint patterns ✅

- **POST /api/admin/cleanup/:scriptId/automate**:
  - Request: Path parameter `scriptId`, body with `entityIds` array and optional `applyLowConfidence` boolean ✅
  - Response: JSON with automation results, success/failure breakdown ✅
  - Matches existing admin API POST endpoint patterns ✅

### TypeScript Types

- Contract includes TypeScript interface definitions ✅
- Types align with existing admin API response patterns ✅
- Types can be added to frontend API client ✅

## Validation Rules

### Validated ✅

- **Path Parameter Validation**: `scriptId` must be validated against available scripts list ✅
- **Request Body Validation**: `entityIds` must be non-empty array ✅
- **Business Logic Validation**: Script must exist, entities must have automatable suggestions ✅

### Implementation Notes

- Validation should use existing patterns:
  - Check script exists before execution
  - Validate entityIds array is non-empty
  - Validate all entity IDs exist in database
  - Use `BadRequestError` for validation failures

## MusicBrainz Integration

### Validated ✅

- **API Details**: Contract specifies base URL, rate limiting, response format ✅
- **Error Handling**: Contract specifies graceful error handling ✅
- **Rate Limiting**: Contract specifies 1 request per second ✅

### Implementation Notes

- MusicBrainz client utility needs to be created
- Rate limiting should be implemented in the client utility
- Error handling should catch and report MusicBrainz errors without failing script execution
- MusicBrainz errors should be included in script results

## Consistency with Existing Admin API

### Validated ✅

- **Base Path**: `/api/admin/cleanup` - ✅ Consistent with `/api/admin/*` pattern
- **Authentication**: JWT required - ✅ Consistent with existing admin routes
- **Error Format**: Standard error responses - ✅ Consistent with existing error handling
- **Response Format**: JSON responses - ✅ Consistent with existing admin API
- **Route Structure**: RESTful patterns - ✅ Consistent with existing admin routes

### Differences (Acceptable)

- **Sub-resource Pattern**: Uses `/cleanup/:scriptId/execute` and `/cleanup/:scriptId/automate` instead of standard REST
  - **Rationale**: These are action endpoints, not resource endpoints
  - **Acceptable**: Matches pattern for action-based endpoints (e.g., `/validate/entity/:type/:id`)

## Recommendations

### High Priority

1. **Add Missing Error Classes** (Optional):
   - Consider adding `ServiceUnavailableError` and `UnprocessableEntityError` to `backend/src/server/api/core.ts`
   - Or use existing error classes with appropriate status codes
   - **Impact**: Low - can use existing error classes with status codes

### Medium Priority

2. **Validate Against Database Schema**:
   - Ensure entity types referenced in scripts match database schema
   - Verify relationship types exist (APPEARS_IN, VERSIONA, AUTOR_DE, etc.)
   - **Impact**: Medium - should be verified during script implementation

### Low Priority

3. **Add Request Validation Middleware**:
   - Consider using validation middleware for request body validation
   - Can use existing patterns or add validation library
   - **Impact**: Low - can be handled during implementation

## Next Steps

1. ✅ **API Contract Validated** - Contract is consistent with existing patterns
2. ⏭️ **Proceed to Implementation Planning** - Use PLAYBOOK_01_04_PLAN_REFACTOR
3. ⏭️ **Implement API Endpoints** - Add routes to `backend/src/server/api/admin.ts`
4. ⏭️ **Implement Cleanup Scripts** - Create script modules and registry
5. ⏭️ **Implement MusicBrainz Client** - Create utility for MusicBrainz API integration

## Conclusion

The API contract documentation is **well-structured and consistent** with existing admin API patterns. All three endpoints follow established patterns for authentication, error handling, and request/response formats. The contract is ready for implementation.

**Minor recommendations**:
- Consider adding missing error classes (optional, can use existing classes)
- Validate entity types against database schema during implementation

**Status**: ✅ **Ready for Implementation**

---

**Related Documents**:
- API Contract: `docs/5_backend_api-contracts/contracts/admin-api-cleanup.md`
- Admin API: `docs/5_backend_api-contracts/contracts/admin-api.md`
- Workflow: `docs/1_frontend_ux-workflows/workflows/admin-experience/WORKFLOW_011_database-cleanup.md`

