# Task 0002: API Refactoring - Consolidate to Neo4j-Only Architecture

## Overview

Refactor the current dual data source architecture (Neo4j + YAML) into a unified Neo4j-based system with separate Public and Admin APIs. This will eliminate data inconsistency issues and provide a more robust, scalable solution with schema discoverability.

## Current State Analysis

- **Neo4j API** (`/api/videos`): Full CRUD operations, not mounted in server
- **YAML API** (`/api/admin`, `/api/seed`): Currently mounted, read-only seed operations
- **Search API** (`/api/search`): Already using Neo4j effectively
- **Frontend**: Admin interface uses YAML APIs, navigation pages use placeholder data

## Target Architecture

- **Public API** (`/api/public`): Read-only endpoints for navigation frontend
- **Admin API** (`/api/admin`): Full CRUD + schema management for admin interface
- **Unified Neo4j Backend**: Single data source with schema introspection
- **Schema Discoverability**: Dynamic schema management capabilities

## Implementation Plan

### Phase 1: Data Migration and Schema Setup

1. **Migrate seed.yaml data to Neo4j**

   - Create migration script to import all entities from seed.yaml
   - Import all relationships with proper constraints
   - Validate data integrity after migration
   - Create backup of original seed.yaml

2. **Enhance Neo4j schema setup**
   - Add schema introspection functions to setup.ts
   - Create utility functions for dynamic schema management
   - Add schema validation endpoints
   - Implement constraint/index discovery

### Phase 2: Public API Development

3. **Create Public API router** (`/api/public`)

   - Implement read-only endpoints for all entity types
   - Add relationship traversal capabilities
   - Create schema introspection endpoints
   - Implement optimized queries for performance
   - Add proper error handling and validation

4. **Public API endpoints structure**
   ```
   GET /api/public/entities/:type          # List entities
   GET /api/public/entities/:type/:id      # Get single entity
   GET /api/public/relationships/:type     # List relationships
   GET /api/public/schema                  # Schema introspection
   GET /api/public/search                  # Global search
   ```

### Phase 3: Admin API Refactoring

5. **Refactor Admin API to use Neo4j**

   - Replace YAML operations with Neo4j queries
   - Implement full CRUD operations
   - Add relationship management with constraints
   - Create schema management endpoints
   - Add audit logging for all changes

6. **Admin API endpoints structure**

   ```
   # Entity Management
   GET /api/admin/entities/:type           # List entities
   GET /api/admin/entities/:type/:id       # Get single entity
   POST /api/admin/entities/:type          # Create entity
   PUT /api/admin/entities/:type/:id       # Update entity
   DELETE /api/admin/entities/:type/:id   # Delete entity

   # Relationship Management
   GET /api/admin/relationships/:type     # List relationships
   POST /api/admin/relationships/:type      # Create relationship
   DELETE /api/admin/relationships/:type    # Delete relationship

   # Schema Management
   GET /api/admin/schema                   # Get current schema
   POST /api/admin/schema/properties       # Add property to entity
   POST /api/admin/schema/relationships    # Create new relationship type
   GET /api/admin/schema/constraints       # List constraints
   POST /api/admin/schema/constraints      # Create constraint
   DELETE /api/admin/schema/constraints/:name # Delete constraint
   ```

### Phase 4: Frontend Integration

7. **Update navigation frontend**

   - Replace placeholder data with Public API calls
   - Implement proper error handling
   - Add loading states and error boundaries
   - Update type definitions to match Neo4j schema

8. **Update admin frontend**
   - Replace YAML API calls with Admin API calls
   - Implement schema discovery interface
   - Add dynamic property/relationship management
   - Update relationship management components

### Phase 5: Server Configuration and Testing

9. **Update server configuration**

   - Mount Public API router
   - Update Admin API router
   - Remove YAML dependencies
   - Add proper middleware and error handling
   - Implement authentication/authorization

10. **Comprehensive testing**
    - Unit tests for all API endpoints
    - Integration tests for data migration
    - Frontend integration tests
    - Performance testing for queries
    - Schema management testing

### Phase 6: Cleanup and Documentation

11. **Remove deprecated code**

    - Delete seed.yaml file
    - Remove YAML-related imports and functions
    - Clean up unused dependencies
    - Update documentation

12. **Documentation and deployment**
    - Update API documentation
    - Create migration guide
    - Update deployment scripts
    - Add monitoring and logging

## Technical Implementation Details

### Schema Introspection Implementation

```typescript
// Schema introspection functions
async function getSchemaInfo() {
  const labels = await db.executeQuery("CALL db.labels()");
  const relationshipTypes = await db.executeQuery(
    "CALL db.relationshipTypes()"
  );
  const propertyKeys = await db.executeQuery("CALL db.propertyKeys()");
  const constraints = await db.executeQuery("SHOW CONSTRAINTS");
  const indexes = await db.executeQuery("SHOW INDEXES");

  return { labels, relationshipTypes, propertyKeys, constraints, indexes };
}
```

### Dynamic Schema Management

```typescript
// Add property to entity type
async function addPropertyToEntity(
  entityType: string,
  propertyName: string,
  propertyType: string
) {
  // Validate property type
  // Create constraint if needed
  // Update schema documentation
}

// Create new relationship type
async function createRelationshipType(
  relType: string,
  startLabel: string,
  endLabel: string
) {
  // Validate relationship type
  // Create constraints if needed
  // Update schema documentation
}
```

### Data Migration Strategy

```typescript
// Migration script structure
async function migrateSeedData() {
  // 1. Read seed.yaml
  // 2. Create all entities in Neo4j
  // 3. Create all relationships
  // 4. Validate data integrity
  // 5. Create backup
}
```

## Risk Mitigation

- **Data Loss Prevention**: Create comprehensive backups before migration
- **Rollback Strategy**: Maintain ability to revert to YAML system
- **Performance Monitoring**: Monitor query performance during transition
- **Gradual Migration**: Implement feature flags for gradual rollout

## Success Criteria

- [ ] All data successfully migrated from YAML to Neo4j
- [ ] Public API provides read-only access to all entities and relationships
- [ ] Admin API provides full CRUD operations with schema management
- [ ] Frontend navigation pages use real data from Public API
- [ ] Admin interface uses Admin API for all operations
- [ ] Schema introspection and dynamic management working
- [ ] No YAML dependencies remaining
- [ ] All tests passing
- [ ] Performance meets or exceeds current system

## Dependencies

- Neo4j database connection and client
- Existing type definitions
- Current frontend components
- Test infrastructure

## Estimated Timeline

- **Phase 1**: 2-3 days (Data migration and schema setup)
- **Phase 2**: 3-4 days (Public API development)
- **Phase 3**: 4-5 days (Admin API refactoring)
- **Phase 4**: 3-4 days (Frontend integration)
- **Phase 5**: 2-3 days (Server configuration and testing)
- **Phase 6**: 1-2 days (Cleanup and documentation)

**Total Estimated Time**: 15-21 days

## Next Steps

1. Review and approve this plan
2. Set up development environment
3. Begin with Phase 1: Data migration
4. Implement iterative testing throughout each phase
5. Regular progress reviews and adjustments as needed
