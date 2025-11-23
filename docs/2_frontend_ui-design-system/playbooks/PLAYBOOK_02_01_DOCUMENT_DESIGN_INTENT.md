# Playbook 01: Document Design Intent

## Purpose

This playbook provides step-by-step instructions for documenting design intent, either from existing CSS/component code or from design specifications. Use this playbook when you need to create or update design system documentation.

## When to Use This Playbook

- Documenting existing design tokens from CSS files
- Documenting component styles from existing code
- Creating baseline documentation for Phase 1
- Documenting new design specifications
- Updating design system documentation with new details

## Prerequisites

- Access to codebase
- Understanding of what to document (design tokens, components, etc.)
- Knowledge of CSS file locations

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
- What to document (design tokens, components, visual patterns)
- Whether documenting existing code or new design
- Specific files to check (e.g., `variables.css`, component CSS files)

**Your task:**
- Understand the scope (design tokens, components, or full design system)
- Identify if this is existing code or new design
- Determine what files to examine

### Step 2: Gather Information

**For Existing Code:**

1. **Search codebase** for relevant files:
   ```
   - Search for CSS variable files (variables.css, theme files)
   - Find component CSS files
   - Locate style definitions
   - Find design token usage
   ```

2. **Read key files:**
   - Design token files (e.g., `frontend/src/styles/theme/variables.css`)
   - Component CSS files (e.g., `frontend/src/styles/components/`)
   - Global styles
   - Component TypeScript files (for style usage)

3. **Extract design information:**
   - Design token values (colors, typography, spacing)
   - Component style patterns
   - Visual patterns and conventions
   - Usage examples

**For New Design Specifications:**

1. **Clarify requirements:**
   - Ask user for design specifications
   - Identify design goals
   - Understand visual requirements
   - Clarify technical constraints

2. **Map to existing patterns:**
   - Check existing design tokens
   - Identify reusable patterns
   - Note technical constraints
   - Consider consistency with existing design

### Step 3: Document Design Tokens

**For each design token category:**

1. **Colors:**
   - Primary, secondary, accent colors
   - Neutral colors
   - Semantic colors (success, error, warning)
   - Color usage guidelines

2. **Typography:**
   - Font families
   - Font sizes (scale)
   - Line heights
   - Font weights
   - Typography usage guidelines

3. **Spacing:**
   - Spacing scale (xs, sm, md, lg, xl)
   - Spacing usage guidelines
   - Layout spacing patterns

4. **Other Tokens:**
   - Border radius
   - Shadows
   - Transitions
   - Z-index layers

**Document in `tokens/{category}.md`:**

```markdown
# Design Tokens: [Category]

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Last Validated**: [date or "not yet validated"]
- **Code Reference**: `file.css:line-range`

## Overview
[Purpose and usage of this token category]

## Token Values

### [Token Name]
- **Value**: [actual value]
- **CSS Variable**: `--variable-name`
- **Usage**: [when to use]
- **Code Reference**: `file.css:line`

[Repeat for each token]

## Usage Guidelines
[How to use these tokens]

## Implementation
[Where and how tokens are implemented]

## Change History
[Track changes]
```

### Step 4: Document Component Styles

**For each component category:**

1. **Buttons:**
   - Button variants (primary, secondary, etc.)
   - Button states (default, hover, active, disabled)
   - Button sizes
   - Button styles

2. **Cards:**
   - Card variants
   - Card layouts
   - Card styles

3. **Forms:**
   - Input styles
   - Label styles
   - Error states
   - Validation styles

4. **Other Components:**
   - Badges, links, modals, etc.

**Document component specifications:**

```markdown
# Component: [Component Name]

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Code Reference**: `file.css:line-range`

## Overview
[Component purpose and usage]

## Variants
[Different variants of the component]

## States
[Different states (default, hover, active, disabled, etc.)]

## Styles
[Detailed style specifications]

## Usage Guidelines
[How to use this component]

## Implementation
[Where component styles are defined]

## Code Reference
[Link to component files]
```

### Step 5: Document Visual Patterns

**Document visual patterns:**

1. **Layout Patterns:**
   - Grid systems
   - Container patterns
   - Responsive breakpoints

2. **Visual Hierarchy:**
   - Typography hierarchy
   - Color hierarchy
   - Spacing hierarchy

3. **Consistency Rules:**
   - Design token usage rules
   - Component usage rules
   - Visual consistency guidelines

### Step 6: Add Code References

**Critical:** Every design element must have a code reference:

- Design tokens: `file.css:line-number`
- Component styles: `file.css:line-range`
- Usage examples: `file.tsx:line-range`

**How to find references:**
- Use `grep` to find CSS variable definitions
- Use `codebase_search` to understand usage
- Read CSS files to get exact line numbers

### Step 7: Create Design System Summary

**Create or update design system overview:**

```markdown
# Design System Overview

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Version**: 1.0

## Design Tokens
- Colors: [Status] - See `tokens/colors.md`
- Typography: [Status] - See `tokens/typography.md`
- Spacing: [Status] - See `tokens/spacing.md`

## Components
[List documented components with status]

## Visual Patterns
[List documented patterns with status]
```

### Step 8: Review and Refine

**Checklist:**
- [ ] All design tokens documented
- [ ] All component styles documented
- [ ] All code references accurate
- [ ] Usage guidelines included
- [ ] Visual patterns documented
- [ ] Design system summary created
- [ ] Documentation is complete and logical

## Output Deliverables

1. **Design token documentation** (`tokens/{category}.md` files)
2. **Component style documentation** (component specification files)
3. **Design system overview** (summary document)
4. **Updated README.md** with design system status

## Quality Criteria

**Good design system documentation:**
- ✅ All design tokens documented with values
- ✅ All code references accurate
- ✅ Usage guidelines clear
- ✅ Component styles complete
- ✅ Visual patterns documented
- ✅ Clear and readable

**Red flags:**
- ❌ Missing code references
- ❌ Vague descriptions
- ❌ Missing usage guidelines
- ❌ Incomplete token documentation
- ❌ Design values don't match code

## Example Prompts for User

**For existing code:**
```
Document the current design system.
Check frontend/src/styles/theme/variables.css for design tokens,
and frontend/src/styles/components/ for component styles.
```

**For new design:**
```
Document a new color palette for the design system.
Primary color: #1a73e8, Secondary: #5f6368,
with semantic colors for success, error, and warning.
```

## Next Steps

After documenting:
1. **Validate the design system** using PLAYBOOK_02
2. **Create validation checklist** (part of PLAYBOOK_02)
3. **Update design system status** based on validation results

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Implementation (use after this)
- PLAYBOOK_06: Update Design System (for updates)

