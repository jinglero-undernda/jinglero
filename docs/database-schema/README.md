# Database Schema Documentation

## Purpose

This directory contains documentation for the Neo4j database schema, including node types, relationship types, properties, constraints, and data flow patterns. The documentation serves as:

1. **Schema Specifications**: Define node types, relationships, properties, and constraints
2. **Implementation Guides**: Reference for developers working with the database
3. **Validation Criteria**: Check that schema matches requirements
4. **Change Management**: Historical record of schema decisions and migrations

## Documentation Structure

### Schema Components

The database schema documentation covers:

1. **Node Types**: Usuario, Jingle, Artista, Cancion, Fabrica, Tematica
2. **Relationship Types**: APPEARS_IN, JINGLERO_DE, AUTOR_DE, VERSIONA, TAGGED_WITH, SOY_YO, REACCIONA_A
3. **Properties**: Node properties, relationship properties
4. **Constraints**: Uniqueness constraints, indexes
5. **Data Patterns**: Redundant properties, auto-sync behavior, order management

### File Naming Convention

- `schema/nodes.md` - Node type documentation
- `schema/relationships.md` - Relationship type documentation
- `schema/properties.md` - Property specifications
- Schema audits documented in playbook outputs

### Schema Document Structure

Each schema document should include:

1. **Metadata**

   - Document name and category
   - Status (draft | current_implementation | validated | implemented | deprecated)
   - Last updated date
   - Related files/components
   - Dependencies on other schema elements

2. **Schema Specification**

   - Node/relationship definition
   - Property definitions
   - Constraint definitions
   - Index definitions

3. **Implementation Notes**

   - Schema file locations
   - Migration file locations
   - Usage patterns

4. **Validation Checklist**
   - Schema checks
   - Data integrity checks
   - Usage checks

## Schema Lifecycle

1. **draft**: Initial schema specification, open for review
2. **current_implementation**: Documents existing schema as-is
3. **validated**: Validated against database, matches current implementation
4. **implemented**: Database updated to match schema (may include improvements)
5. **deprecated**: Schema element replaced or no longer applicable

## Integration with Development Process

### Before Implementation

- Review relevant schema documentation
- Identify schema elements needed
- Plan implementation to match schema specifications

### During Implementation

- Reference schema in code comments
- Use schema definitions from schema files
- Follow schema patterns

### After Implementation

- Validate schema against database
- Update schema status to "Implemented"
- Document any deviations and rationale

### Code Validation

Schema documents can be used to validate code by:

1. **Schema Compliance**: Verify code matches schema definitions
2. **Property Usage**: Check property usage matches schema
3. **Relationship Usage**: Verify relationship usage matches schema
4. **Data Integrity**: Ensure data integrity rules are followed

## Current Schema Status

| Category             | Status                 | Last Updated | Notes                                       |
| -------------------- | ---------------------- | ------------ | ------------------------------------------- |
| Nodes                | current_implementation | -            | 6 node types defined in `schema.ts`         |
| Relationships        | current_implementation | -            | 7 relationship types defined in `schema.ts` |
| Properties           | current_implementation | -            | Properties documented in `schema.ts`        |
| Constraints          | current_implementation | -            | Constraints defined in setup                |
| Redundant Properties | current_implementation | -            | Auto-sync behavior documented               |

## Best Practices

1. **Follow Schema**: Always follow documented schema
2. **Maintain Consistency**: Use consistent property names and types
3. **Document Changes**: Update schema when making changes
4. **Validate Regularly**: Check that database matches schema
5. **Version Control**: Track changes to schema over time
6. **Review Regularly**: Update schema as product evolves
7. **Validate Against Database**: Regularly check that database matches documented schema

## Tools

- **Neo4j**: Graph database
- **Cypher**: Query language
- **Markdown**: For documentation
- **Git**: For version control and change tracking

## Related Documentation

- `../../backend/src/server/db/schema/schema.ts` - Current schema definition
- `../../backend/src/server/db/schema/setup.ts` - Schema setup and constraints
- `../../complete-refactor-analysis.md` - Strategic analysis and approach
- `playbooks/` - AI-ready playbooks for working with schema

## Playbooks

See [`playbooks/README.md`](./playbooks/README.md) for available playbooks to:

- Document schema
- Validate requirements
- Analyze gaps
- Plan migrations
- Implement migrations
- Update schema
- Audit schema

---

**Last Updated:** 2025-01-XX
