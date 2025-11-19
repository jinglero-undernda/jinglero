# Playbook 01: Document Current Architecture

## Purpose

This playbook provides step-by-step instructions for documenting system architecture, either from existing code or from architecture specifications. Use this playbook when you need to create or update architecture documentation.

## When to Use This Playbook

- Documenting existing architecture from code
- Documenting new architecture specifications
- Creating baseline documentation for Phase 1
- Updating architecture documentation with new details

## Prerequisites

- Access to codebase
- Understanding of what to document (data flow, state management, caching)
- Knowledge of codebase structure

## Instructions for AI Assistant

### Step 1: Understand the Task

**User will provide:**
- What to document (data flow, state management, caching, performance patterns)
- Whether documenting existing architecture or new specifications
- Specific areas to focus on

**Your task:**
- Understand the scope (data flow, state management, caching, or full architecture)
- Identify if this is existing architecture or new design
- Determine what files to examine

### Step 2: Gather Information

**For Existing Architecture:**

1. **Search codebase** for relevant patterns:
   ```
   - Search for state management patterns (React hooks, context)
   - Find API architecture (routers, endpoints)
   - Locate caching implementations
   - Find data flow patterns
   ```

2. **Read key files:**
   - Frontend state management files
   - Backend API files
   - Database query files
   - Configuration files

3. **Extract architecture information:**
   - Data flow patterns
   - State management patterns
   - Caching strategies
   - Performance patterns
   - Scalability considerations

**For New Architecture Specifications:**

1. **Clarify requirements:**
   - Ask user for architecture specifications
   - Identify performance requirements
   - Understand scalability needs
   - Clarify cost constraints

2. **Map to existing patterns:**
   - Check existing architecture patterns
   - Identify reusable patterns
   - Note technical constraints
   - Consider consistency with existing architecture

### Step 3: Document Data Flow

**Document how data flows through the system:**

1. **Frontend to Backend:**
   - API call patterns
   - Request/response flow
   - Error handling

2. **Backend to Database:**
   - Query patterns
   - Data transformation
   - Caching layers

3. **Data Flow Diagrams:**
   - Create flow diagrams (Mermaid or text)
   - Document data transformations
   - Note caching points

**Document in architecture document:**

```markdown
# Data Flow Architecture

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Code Reference**: `file.ts:line-range`

## Overview
[Purpose and usage of this data flow pattern]

## Frontend to Backend Flow

### API Calls
- **Pattern**: [Description]
- **Endpoints**: [List]
- **Code Reference**: `file.ts:line`

### Request/Response Flow
[Description of request/response flow]

## Backend to Database Flow

### Query Patterns
- **Pattern**: [Description]
- **Queries**: [List]
- **Code Reference**: `file.ts:line`

### Data Transformation
[Description of data transformations]

## Caching Points
[Where caching occurs in the flow]

## Data Flow Diagram

\`\`\`mermaid
[Flow diagram]
\`\`\`

## Implementation
[Where data flow is implemented]

## Change History
[Track changes]
```

### Step 4: Document State Management

**Document state management patterns:**

1. **Frontend State:**
   - React state patterns
   - Context usage
   - State management libraries
   - State synchronization

2. **Backend State:**
   - Session management
   - Server-side state
   - State persistence

3. **State Patterns:**
   - State update patterns
   - State sharing patterns
   - State synchronization patterns

**Document in architecture document:**

```markdown
# State Management Architecture

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Code Reference**: `file.tsx:line-range`

## Overview
[Purpose and usage of state management]

## Frontend State

### React State Patterns
- **Pattern**: [Description]
- **Usage**: [Where used]
- **Code Reference**: `file.tsx:line`

### Context Usage
- **Context**: [Description]
- **Usage**: [Where used]
- **Code Reference**: `file.tsx:line`

## Backend State

### Session Management
[Description of session management]

### Server-Side State
[Description of server-side state]

## State Patterns
[Description of state patterns]

## Implementation
[Where state management is implemented]

## Change History
[Track changes]
```

### Step 5: Document Caching Strategies

**Document caching patterns:**

1. **Client-Side Caching:**
   - Request caching
   - Component-level caching
   - Cache invalidation

2. **Server-Side Caching:**
   - API response caching
   - Database query caching
   - Cache invalidation

3. **Caching Patterns:**
   - Cache key strategies
   - Cache expiration
   - Cache invalidation strategies

**Document in architecture document:**

```markdown
# Caching Architecture

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Code Reference**: `file.ts:line-range`

## Overview
[Purpose and usage of caching]

## Client-Side Caching

### Request Caching
- **Pattern**: [Description]
- **Implementation**: [How implemented]
- **Code Reference**: `file.ts:line`

### Cache Invalidation
[Description of cache invalidation]

## Server-Side Caching

### API Response Caching
[Description of API response caching]

### Database Query Caching
[Description of database query caching]

## Caching Patterns
[Description of caching patterns]

## Implementation
[Where caching is implemented]

## Change History
[Track changes]
```

### Step 6: Document Performance Patterns

**Document performance optimization patterns:**

1. **Query Optimization:**
   - Database query patterns
   - Query performance
   - Index usage

2. **Data Loading:**
   - Lazy loading patterns
   - Pagination strategies
   - Data prefetching

3. **Rendering Optimization:**
   - Component optimization
   - Rendering patterns
   - Performance metrics

**Document in architecture document:**

```markdown
# Performance Architecture

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Code Reference**: `file.ts:line-range`

## Overview
[Purpose and usage of performance patterns]

## Query Optimization

### Database Query Patterns
- **Pattern**: [Description]
- **Performance**: [Metrics]
- **Code Reference**: `file.ts:line`

## Data Loading

### Lazy Loading
[Description of lazy loading patterns]

### Pagination
[Description of pagination strategies]

## Rendering Optimization

### Component Optimization
[Description of component optimization]

## Performance Metrics
[Documented performance metrics]

## Implementation
[Where performance patterns are implemented]

## Change History
[Track changes]
```

### Step 7: Document Scalability Considerations

**Document scalability patterns:**

1. **Cost Optimization:**
   - Cost considerations
   - Cost tradeoffs
   - Cost optimization strategies

2. **Performance Tradeoffs:**
   - Performance vs. cost
   - Performance vs. complexity
   - Performance vs. UX

3. **UX/UI Tradeoffs:**
   - UX vs. performance
   - UX vs. cost
   - UX vs. complexity

**Document in architecture document:**

```markdown
# Scalability Architecture

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]

## Overview
[Purpose and usage of scalability patterns]

## Cost Optimization

### Cost Considerations
[Description of cost considerations]

### Cost Tradeoffs
[Description of cost tradeoffs]

## Performance Tradeoffs

### Performance vs. Cost
[Analysis of performance vs. cost tradeoffs]

### Performance vs. Complexity
[Analysis of performance vs. complexity tradeoffs]

## UX/UI Tradeoffs

### UX vs. Performance
[Analysis of UX vs. performance tradeoffs]

### UX vs. Cost
[Analysis of UX vs. cost tradeoffs]

## Implementation
[Where scalability patterns are implemented]

## Change History
[Track changes]
```

### Step 8: Add Code References

**Critical:** Every architecture element must have a code reference:

- Data flow: `file.ts:line-number`
- State management: `file.tsx:line-number`
- Caching: `file.ts:line-number`
- Performance patterns: `file.ts:line-number`

**How to find references:**
- Use `grep` to find implementations
- Use `codebase_search` to understand patterns
- Read code files to get exact line numbers

### Step 9: Create Architecture Summary

**Create or update architecture overview:**

```markdown
# Architecture Overview

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Version**: 1.0

## Data Flow
[Summary of data flow patterns]

## State Management
[Summary of state management patterns]

## Caching
[Summary of caching strategies]

## Performance
[Summary of performance patterns]

## Scalability
[Summary of scalability considerations]
```

### Step 10: Review and Refine

**Checklist:**
- [ ] All data flow patterns documented
- [ ] All state management patterns documented
- [ ] All caching strategies documented
- [ ] All performance patterns documented
- [ ] All scalability considerations documented
- [ ] All code references accurate
- [ ] Architecture summary created
- [ ] Documentation is complete and logical

## Output Deliverables

1. **Data flow documentation**
2. **State management documentation**
3. **Caching documentation**
4. **Performance documentation**
5. **Scalability documentation**
6. **Architecture overview** (summary document)
7. **Updated README.md** with architecture status

## Quality Criteria

**Good architecture documentation:**
- ✅ All patterns documented with code references
- ✅ Data flow clearly described
- ✅ State management patterns clear
- ✅ Caching strategies documented
- ✅ Performance patterns documented
- ✅ Scalability considerations documented
- ✅ Clear and readable

**Red flags:**
- ❌ Missing code references
- ❌ Vague descriptions
- ❌ Missing patterns
- ❌ Incomplete architecture definitions
- ❌ Architecture doesn't match code

## Example Prompts for User

**For existing architecture:**
```
Document the current system architecture.
Check frontend/src for state management patterns,
backend/src for API architecture,
and analyze data flow from frontend to database.
```

**For new architecture:**
```
Document a new caching strategy for API responses.
Implement client-side request caching with 5-minute TTL.
Update the caching architecture documentation.
```

## Next Steps

After documenting:
1. **Evaluate alternatives** using PLAYBOOK_02 (if needed)
2. **Create validation checklist** (part of PLAYBOOK_02)
3. **Update architecture status** based on validation results

---

**Related Playbooks:**
- PLAYBOOK_02: Evaluate Alternatives (use after this if needed)
- PLAYBOOK_06: Update Architecture (for updates)

