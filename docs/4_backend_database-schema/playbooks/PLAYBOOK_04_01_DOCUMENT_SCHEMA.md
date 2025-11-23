# Playbook 01: Document Schema

## Purpose

This playbook provides step-by-step instructions for documenting database schema, either from existing database/code or from schema specifications. Use this playbook when you need to create or update schema documentation.

## When to Use This Playbook

- Documenting existing schema from code/database
- Documenting new schema specifications
- Creating baseline documentation for Phase 1
- Updating schema documentation with new details

## Prerequisites

- Access to codebase
- Understanding of what to document (nodes, relationships, properties)
- Knowledge of schema file locations

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

- What to document (nodes, relationships, properties, constraints)
- Whether documenting existing schema or new specifications
- Specific files to check (e.g., `schema.ts`, `setup.ts`)

**Your task:**

- Understand the scope (nodes, relationships, properties, or full schema)
- Identify if this is existing schema or new design
- Determine what files to examine

### Step 2: Gather Information

**For Existing Schema:**

1. **Search codebase** for relevant files:

   ```
   - Search for schema definition files (schema.ts)
   - Find constraint definitions (setup.ts)
   - Locate migration files
   - Find type definitions
   ```

2. **Read key files:**

   - Schema definition file (e.g., `backend/src/server/db/schema/schema.ts`)
   - Schema setup file (e.g., `backend/src/server/db/schema/setup.ts`)
   - Type definition files
   - Migration files (if any)

3. **Extract schema information:**
   - Node types and labels
   - Relationship types
   - Property definitions
   - Constraints and indexes
   - Redundant properties
   - Auto-sync behavior

**For New Schema Specifications:**

1. **Clarify requirements:**

   - Ask user for schema specifications
   - Identify data requirements
   - Understand relationship requirements
   - Clarify technical constraints

2. **Map to existing patterns:**
   - Check existing schema patterns
   - Identify reusable patterns
   - Note technical constraints
   - Consider consistency with existing schema

### Step 3: Document Node Types

**For each node type:**

1. **Node Definition:**

   - Node label
   - Node properties
   - Property types
   - Required vs. optional properties
   - Default values

2. **Constraints:**

   - Uniqueness constraints
   - Indexes
   - Other constraints

3. **Usage Patterns:**
   - How node is created
   - How node is queried
   - Common query patterns

**Document in `schema/nodes.md`:**

```markdown
# Node Type: [Node Name]

## Status

- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Last Validated**: [date or "not yet validated"]
- **Code Reference**: `file.ts:line-range`

## Overview

[Purpose and usage of this node type]

## Properties

### [Property Name]

- **Type**: [type]
- **Required**: [Yes | No]
- **Default**: [default value if any]
- **Description**: [description]
- **Code Reference**: `file.ts:line`

[Repeat for each property]

## Constraints

### Uniqueness

- [Constraint description]

### Indexes

- [Index description]

## Usage Patterns

[How this node type is used]

## Implementation

[Where node type is defined]

## Change History

[Track changes]
```

### Step 4: Document Relationship Types

**For each relationship type:**

1. **Relationship Definition:**

   - Relationship type name
   - Start node type
   - End node type
   - Direction
   - Relationship properties

2. **Properties:**

   - Property definitions
   - Property types
   - Required vs. optional

3. **Usage Patterns:**
   - How relationship is created
   - How relationship is queried
   - Common query patterns

**Document in `schema/relationships.md`:**

```markdown
# Relationship Type: [Relationship Name]

## Status

- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Code Reference**: `file.ts:line-range`

## Overview

[Purpose and usage of this relationship type]

## Definition

- **Type**: [Relationship name]
- **Start Node**: [Node type]
- **End Node**: [Node type]
- **Direction**: [Direction]

## Properties

### [Property Name]

- **Type**: [type]
- **Required**: [Yes | No]
- **Default**: [default value if any]
- **Description**: [description]
- **Code Reference**: `file.ts:line`

[Repeat for each property]

## Usage Patterns

[How this relationship is used]

## Implementation

[Where relationship is defined]

## Change History

[Track changes]
```

### Step 5: Document Properties

**Document property specifications:**

1. **Node Properties:**

   - Property definitions by node type
   - Property types and constraints
   - Property usage

2. **Relationship Properties:**

   - Property definitions by relationship type
   - Property types and constraints
   - Property usage

3. **Redundant Properties:**
   - Which properties are redundant
   - Auto-sync behavior
   - Maintenance rules

**Document in `schema/properties.md`:**

```markdown
# Property Specifications

## Status

- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]

## Node Properties

### [Node Type] Properties

[List properties for this node type]

## Relationship Properties

### [Relationship Type] Properties

[List properties for this relationship type]

## Redundant Properties

### [Entity Type] Redundant Properties

- [Property]: [Source relationship]
- [Auto-sync behavior]

## Property Types

[Document property type specifications]

## Change History

[Track changes]
```

### Step 6: Document Constraints and Indexes

**Document constraints:**

1. **Uniqueness Constraints:**

   - Which properties have uniqueness constraints
   - Constraint definitions

2. **Indexes:**

   - Which properties are indexed
   - Index definitions
   - Index purposes

3. **Other Constraints:**
   - Any other constraints
   - Constraint purposes

### Step 7: Document Data Patterns

**Document special data patterns:**

1. **Redundant Properties:**

   - Which properties are redundant
   - Source relationships
   - Auto-sync behavior
   - Maintenance rules

2. **System-Managed Properties:**

   - Which properties are system-managed
   - How they're calculated
   - Maintenance rules

3. **Data Flow:**
   - How data flows through relationships
   - How redundant properties are maintained

### Step 8: Add Code References

**Critical:** Every schema element must have a code reference:

- Node types: `file.ts:line-number`
- Relationship types: `file.ts:line-number`
- Properties: `file.ts:line-number`
- Constraints: `file.ts:line-number`

**How to find references:**

- Use `grep` to find definitions
- Use `codebase_search` to understand usage
- Read schema files to get exact line numbers

### Step 9: Create Schema Summary

**Create or update schema overview:**

```markdown
# Schema Overview

## Status

- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Version**: 1.0

## Node Types

[List node types with status]

## Relationship Types

[List relationship types with status]

## Constraints

[List constraints with status]

## Data Patterns

[List data patterns with status]
```

### Step 10: Review and Refine

**Checklist:**

- [ ] All node types documented
- [ ] All relationship types documented
- [ ] All properties documented
- [ ] All constraints documented
- [ ] All code references accurate
- [ ] Data patterns documented
- [ ] Schema summary created
- [ ] Documentation is complete and logical

## Output Deliverables

1. **Node type documentation** (`schema/nodes.md`)
2. **Relationship type documentation** (`schema/relationships.md`)
3. **Property documentation** (`schema/properties.md`)
4. **Schema overview** (summary document)
5. **Updated README.md** with schema status

## Quality Criteria

**Good schema documentation:**

- ✅ All node types documented with properties
- ✅ All relationship types documented with properties
- ✅ All code references accurate
- ✅ Constraints documented
- ✅ Data patterns documented
- ✅ Clear and readable

**Red flags:**

- ❌ Missing code references
- ❌ Vague descriptions
- ❌ Missing properties
- ❌ Incomplete node/relationship definitions
- ❌ Schema doesn't match code

## Example Prompts for User

**For existing schema:**

```
Document the current database schema.
Check backend/src/server/db/schema/schema.ts for schema definitions,
and backend/src/server/db/schema/setup.ts for constraints.
```

**For new schema:**

```
Document a new node type for "Event" with properties:
id (string, unique), name (string), date (datetime),
and relationships to Artista and Fabrica.
```

## Next Steps

After documenting:

1. **Validate the schema** using PLAYBOOK_02
2. **Create validation checklist** (part of PLAYBOOK_02)
3. **Update schema status** based on validation results

---

**Related Playbooks:**

- PLAYBOOK_02: Validate Requirements (use after this)
- PLAYBOOK_06: Update Schema (for updates)
