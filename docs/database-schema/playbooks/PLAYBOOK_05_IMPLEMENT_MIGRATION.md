# Playbook 05: Implement Migration

## Purpose

This playbook provides step-by-step instructions for implementing schema migrations while maintaining sync between database and schema documentation. Use this to execute migrations following documented schema.

## When to Use This Playbook

- After migration plan created (PLAYBOOK_04)
- When implementing specific migration tasks
- When updating database to match schema documentation
- During Phase 3 refactoring work

## Prerequisites

- Migration plan exists
- Task definition clear
- Schema documentation available
- Understanding of current and desired state

## Instructions for AI Assistant

### Step 1: Review Task and Schema

**Your task:**
1. Read the migration task definition
2. Read the relevant schema documentation
3. Understand current state vs. desired state
4. Identify all files and database changes involved

**Create implementation checklist:**
```
Task: [Task name]
Schema Area: [Nodes | Relationships | Properties | Constraints]
Files to modify:
- file1.ts: [changes needed]
- file2.ts: [changes needed]

Database changes:
- [Change 1]
- [Change 2]

Current state: [description]
Desired state: [description]
```

### Step 2: Plan Implementation Steps

**Break down the task into steps:**

1. **Preparation:**
   - Create feature branch (if using Git)
   - Backup database (if needed)
   - Review current schema
   - Understand dependencies

2. **Implementation:**
   - Step 1: [Specific change]
   - Step 2: [Specific change]
   - Step 3: [Specific change]

3. **Validation:**
   - Test migration
   - Verify against schema
   - Check for data integrity issues

4. **Documentation:**
   - Update schema if needed
   - Update code comments
   - Update migration documentation

**Implementation plan:**
```markdown
## Implementation Plan: [Task Name]

### Step 1: [Action]
- File: `file.ts`
- Database: [Change]
- Validation: [How to verify]

### Step 2: [Action]
- File: `file.ts`
- Database: [Change]
- Validation: [How to verify]

[Continue for all steps]
```

### Step 3: Implement Schema Changes

**For each implementation step:**

1. **Read current code:**
   - Understand existing schema definition
   - Identify what needs to change
   - Check for dependencies

2. **Make changes:**
   - Follow schema documentation
   - Reference schema in code comments
   - Maintain code quality standards

3. **Verify changes:**
   - Check syntax/compilation
   - Verify logic matches schema
   - Check for obvious errors

**Code comment template:**
```typescript
// Schema: [Node/Relationship Name]
// Implements: [What this implements]
// Property: [Property name]
// Reference: [Schema doc]
```

### Step 4: Implement Database Migration

**For database changes:**

1. **Create migration script:**
   - Write Cypher queries for changes
   - Include rollback queries
   - Test migration on sample data

2. **Execute migration:**
   - Run migration script
   - Verify migration success
   - Check for errors

3. **Verify data integrity:**
   - Check data after migration
   - Verify constraints
   - Verify indexes
   - Check redundant properties

**Migration script template:**
```cypher
// Migration: [Description]
// Date: [YYYY-MM-DD]
// Task: TASK-XXX

// Forward migration
[Cyper queries]

// Rollback (if needed)
[Rollback queries]
```

### Step 5: Maintain Documentation Sync

**While implementing, keep documentation in sync:**

1. **If code changes reveal schema issues:**
   - Note the issue
   - Decide: Update schema or change code
   - Document decision

2. **If implementation differs from schema:**
   - Document why
   - Update schema if needed
   - Or adjust implementation to match schema

3. **Update code references:**
   - Update line numbers if code moved
   - Update file paths if files moved
   - Verify all references accurate

**Sync checklist:**
```
Documentation Sync:
- [ ] Schema still accurate
- [ ] Code references updated
- [ ] Implementation matches schema
- [ ] Deviations documented
```

### Step 6: Test Migration

**Test against schema:**

1. **Database Testing:**
   - Verify schema changes applied
   - Check data integrity
   - Test queries
   - Verify constraints

2. **Code Validation:**
   - Run linter
   - Run type checker
   - Run tests (if available)

3. **Schema Validation:**
   - Verify schema matches documentation
   - Verify types match schema
   - Verify API matches schema

**Testing checklist:**
```
Testing:
- [ ] Schema changes applied
- [ ] Data integrity maintained
- [ ] Queries work correctly
- [ ] No data loss
- [ ] Code quality checks pass
- [ ] Matches schema documentation
```

### Step 7: Update Schema Documentation

**If schema needs updates:**

1. **Update schema document:**
   - Update node/relationship definitions
   - Update property definitions
   - Update code references
   - Add change history entry

2. **Update validation checklist:**
   - Mark validated items
   - Add new validation items if needed
   - Update validation status

**Schema update template:**
```markdown
## Change History

| Version | Date       | Change                      | Author | Rationale      |
| ------- | ---------- | --------------------------- | ------ | -------------- |
| 1.1     | YYYY-MM-DD | [Change description]        | -      | [Rationale]    |
```

### Step 8: Validate Against Schema

**Use PLAYBOOK_02 to validate:**

1. **Run validation:**
   - Check all code references
   - Verify schema elements
   - Verify database matches schema
   - Verify types match schema

2. **Fix any discrepancies:**
   - Update code if schema is source of truth
   - Update schema if code is source of truth
   - Document decision

3. **Update validation status:**
   - Mark schema as `validated` or `implemented`
   - Update validation date

### Step 9: Create Implementation Summary

**Document what was done:**

```markdown
# Migration Implementation Summary: [Task Name]

**Date**: [YYYY-MM-DD]
**Task ID**: TASK-XXX
**Schema Area**: [Nodes | Relationships | Properties | Constraints]
**Status**: Complete | In Progress | Blocked

## Changes Made

### Files Modified
- `file1.ts`: [Changes made]
- `file2.ts`: [Changes made]

### Database Changes
- [Change 1]: [Description]
- [Change 2]: [Description]

### Schema Updates
- [Update 1]: [Description]
- [Update 2]: [Description]

## Testing Results

### Database Testing
- ✅ Schema changes: [Result]
- ✅ Data integrity: [Result]
- ✅ Queries: [Result]
- ✅ Constraints: [Result]

### Code Quality
- ✅ Linter: Pass
- ✅ Type checker: Pass
- ✅ Tests: [Result]

### Schema Validation
- ✅ Schema: Matches documentation
- ✅ Types: Match schema
- ✅ API: Matches schema

## Issues Encountered

### Issue 1: [Description]
- **Resolution**: [How resolved]
- **Impact**: [Impact on implementation]

## Deviations from Plan

### Deviation 1: [Description]
- **Reason**: [Why deviated]
- **Impact**: [Impact on outcome]

## Next Steps

- [ ] [Next action]
- [ ] [Next action]

## Acceptance Criteria Status

- [ ] [Criterion 1]: [Status]
- [ ] [Criterion 2]: [Status]
- [ ] [Criterion 3]: [Status]
```

### Step 10: Update Task Tracking

**Update task status:**

```markdown
## Task Status Update

**Task ID**: TASK-XXX
**Status**: Complete | In Progress | Blocked
**Progress**: [X%]
**Notes**: [Any notes]
**Next Steps**: [What's next]
```

## Output Deliverables

1. **Implemented schema changes**
2. **Database migration executed**
3. **Updated schema documentation** (if needed)
4. **Implementation summary**
5. **Updated task tracking**
6. **Validation report** (from PLAYBOOK_02)

## Quality Criteria

**Good implementation:**
- ✅ Schema matches documentation
- ✅ Database migration successful
- ✅ Data integrity maintained
- ✅ Documentation updated
- ✅ No data loss
- ✅ Code quality maintained

**Red flags:**
- ❌ Schema doesn't match documentation
- ❌ Migration failed
- ❌ Data loss occurred
- ❌ Documentation not updated
- ❌ Code quality degraded

## Example Prompts for User

```
Implement TASK-001: Add new property to Jingle node.
Follow the schema documentation and maintain sync.
Test migration and update schema if needed.
```

## Next Steps

After implementation:
1. **Validate schema** → Use PLAYBOOK_02
2. **Update task tracking** → Mark as complete
3. **Move to next task** → Continue with next task in plan

---

**Related Playbooks:**
- PLAYBOOK_04: Plan Migration (use before this)
- PLAYBOOK_02: Validate Requirements (use after this)
- PLAYBOOK_06: Update Schema (use if schema needs updates)

