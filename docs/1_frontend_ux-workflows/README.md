# UX Workflows Documentation

## Purpose

This directory contains user experience (UX) workflow documentation for the Jinglero platform. These documents serve as:

1. **Design Specifications**: Define expected user interactions and system behaviors
2. **Implementation Guides**: Reference for developers implementing features
3. **Validation Criteria**: Test cases for verifying correct implementation
4. **Change Management**: Historical record of UX decisions and evolutions

## Documentation Structure

### User Experience Categories

Workflows are organized by user experience type:

1. **Guest Experience**: Public-facing user journeys

   - Landing page experience
   - Search and discovery
   - Content viewing (Fabrica, Jingle, etc.)
   - Entity inspection pages

2. **Admin Experience**: Administrative workflows

   - Entity management (CRUD)
   - Relationship management
   - Data validation
   - Dashboard operations

3. **Authentication**: User authentication flows

   - Admin login
   - Session management
   - Protected route access

4. **Navigation**: Cross-experience navigation
   - Route transitions
   - Deep linking
   - Back navigation
   - Unsaved changes handling

### Workflow Types

We document different types of workflows:

1. **User Journeys**: Complete end-to-end user experiences (e.g., "Landing page to content discovery", "Creating a new jingle with relationships")
2. **Interaction Flows**: Specific interaction patterns (e.g., "Edit mode state management")
3. **State Machines**: Complex state transitions (e.g., "Entity edit mode lifecycle")
4. **Error Handling Flows**: Error scenarios and recovery paths
5. **Navigation Flows**: User navigation patterns and transitions

### File Naming Convention

- `WORKFLOW_<ID>_<name>.md` - Main workflow documents (e.g., `WORKFLOW_001_entity-edit-mode.md`)
- `WORKFLOW_<ID>_<name>_diagram.md` - Mermaid diagrams for workflows
- `WORKFLOW_<ID>_<name>_validation.md` - Code validation checklists

### Workflow Document Template

Each workflow document should include:

1. **Metadata**

   - Workflow ID and name
   - User Experience Category (Guest/Admin/Auth/Navigation)
   - Status (draft | approved | deprecated)
   - Last updated date
   - Related features/components
   - Dependencies on other workflows
   - Access Level (Public/Protected/Admin-only)

2. **Overview**

   - Purpose and scope
   - User persona/context (detailed persona description)
   - Success criteria

3. **Flow Diagram**

   - Mermaid flowchart or state diagram
   - Visual representation of the workflow

4. **Detailed Steps**

   - Step-by-step user actions
   - System responses
   - UI state changes
   - Data changes

5. **Edge Cases**

   - Error scenarios
   - Alternative paths
   - Boundary conditions

6. **Implementation Notes**

   - Key components involved
   - State management requirements
   - API calls and data flow
   - Technical constraints

7. **Validation Checklist**

   - Code review criteria
   - Test scenarios
   - Acceptance criteria

8. **Related Workflows**
   - Links to related workflow documents
   - Dependencies and interactions

## Workflow Lifecycle

1. **Draft**: Initial workflow design, open for review
2. **Approved**: Workflow approved for implementation
3. **Implemented**: Code matches workflow specification
4. **Validated**: Code reviewed and tested against workflow
5. **Deprecated**: Workflow replaced or no longer applicable

## Integration with Development Process

### Before Implementation

- Review relevant workflow documents
- Identify components and state management needs
- Plan implementation to match workflow specification

### During Implementation

- Reference workflow document in code comments
- Link PR descriptions to workflow IDs
- Update workflow document if implementation reveals issues

### After Implementation

- Validate code against workflow specification
- Update workflow status to "Implemented"
- Document any deviations and rationale

### Code Validation

Workflow documents can be used to validate code by:

1. **State Machine Validation**: Verify state transitions match documented flows
2. **Component Behavior**: Check component props and callbacks match workflow steps
3. **API Integration**: Verify API calls align with workflow data requirements
4. **Error Handling**: Ensure error paths match documented edge cases
5. **Navigation**: Verify navigation flows match documented paths

## Current Workflows

| ID           | Name                            | Category         | Status   | Last Updated |
| ------------ | ------------------------------- | ---------------- | -------- | ------------ |
| WORKFLOW_001 | Entity Edit Mode                | Admin Experience | approved | 2025-01-XX   |
| WORKFLOW_002 | Entity Creation                 | Admin Experience | draft    | -            |
| WORKFLOW_003 | Relationship Management         | Admin Experience | draft    | -            |
| WORKFLOW_004 | Navigation with Unsaved Changes | Navigation       | draft    | -            |
| WORKFLOW_005 | Landing Page                    | Guest Experience | planned  | -            |
| WORKFLOW_006 | Search and Discovery            | Guest Experience | planned  | -            |
| WORKFLOW_007 | Fabrica Viewing                 | Guest Experience | planned  | -            |
| WORKFLOW_008 | Entity Inspection               | Guest Experience | planned  | -            |
| WORKFLOW_009 | Admin Authentication            | Authentication   | planned  | -            |

## Organizing Workflows by Experience Type

Workflows can be organized in two ways:

1. **Flat Structure**: All workflows in a single directory (suitable for small number of workflows)
2. **Categorized Structure**: Workflows organized by experience category in subdirectories (recommended as workflow count grows)

See `FOLDER_STRUCTURE_RECOMMENDATION.md` for detailed organization options.

## Best Practices

1. **Keep Workflows Focused**: Each workflow should cover a single, cohesive user experience
2. **Categorize by Experience**: Assign workflows to appropriate user experience categories
3. **Use Visual Diagrams**: Mermaid diagrams make workflows easier to understand
4. **Document Edge Cases**: Don't just document the happy path
5. **Link to Code**: Reference specific components, functions, and files
6. **Version Control**: Track changes to workflows over time
7. **Review Regularly**: Update workflows as the product evolves
8. **Validate Against Code**: Regularly check that code matches documented workflows

## Tools

- **Mermaid**: For flowcharts and state diagrams
- **Markdown**: For documentation
- **Git**: For version control and change tracking

## Related Documentation

- `../adminRefactor/` - Detailed technical specifications
- `../0_debug-logs/` - Bug tracking and resolution
- `../admin-portal-specification.md` - Overall admin portal specification
