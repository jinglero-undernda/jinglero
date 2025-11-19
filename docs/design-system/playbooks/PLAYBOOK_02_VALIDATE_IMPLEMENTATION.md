# Playbook 02: Validate Implementation

## Purpose

This playbook provides step-by-step instructions for validating design system documentation against the codebase. Use this to check for sync issues, verify accuracy, and identify discrepancies between documented design intent and actual implementation.

## When to Use This Playbook

- After documenting design system (PLAYBOOK_01)
- After code changes that might affect design system
- Before refactoring (to establish baseline)
- Regular maintenance (monthly audits)
- When sync issues are suspected

## Prerequisites

- Design system document exists
- Access to codebase
- Design system document has code references

## Instructions for AI Assistant

### Step 1: Read Design System Document

**Your task:**
1. Read the complete design system documentation
2. Extract all technical details:
   - Design token values
   - CSS variable names
   - Component style specifications
   - File paths and line numbers

**Create a checklist:**
```
Extracted from Design System:
- Design tokens: [list]
- CSS variables: [list]
- Components: [list]
- CSS files: [list]
```

### Step 2: Validate Code References

**For each code reference in the design system:**

1. **Check file exists:**
   - Use `read_file` to verify file exists
   - Check if line numbers are reasonable

2. **Verify code matches description:**
   - Read the referenced code
   - Compare to design system description
   - Note any discrepancies

3. **Check for moved code:**
   - If file/line doesn't match, search for the code
   - Update reference if code moved

**Validation checklist:**
```
Code References:
- [ ] File exists
- [ ] Line numbers accurate
- [ ] Code matches description
- [ ] No moved/deleted code
```

### Step 3: Validate Design Tokens

**For each design token:**

1. **Find CSS variable definition:**
   ```css
   /* Search for: --token-name: value; */
   ```

2. **Verify token value:**
   - Check actual value in CSS
   - Compare to documented value
   - Verify token is used correctly

3. **Check token usage:**
   - Find all places token is used
   - Verify usage matches guidelines
   - Check for inconsistent usage

**Validation checklist:**
```
Design Tokens:
- [ ] All tokens exist in CSS
- [ ] Token values match documentation
- [ ] Token usage matches guidelines
- [ ] No unused tokens
```

### Step 4: Validate Component Styles

**For each component style:**

1. **Find component CSS:**
   - Locate component CSS file
   - Find style definitions
   - Check for all variants and states

2. **Verify styles match specification:**
   - Compare CSS to documented styles
   - Check all variants exist
   - Verify all states are styled

3. **Check component usage:**
   - Find component usage in code
   - Verify styles are applied correctly
   - Check for style overrides

**Validation checklist:**
```
Component Styles:
- [ ] All components have styles
- [ ] Styles match specifications
- [ ] All variants exist
- [ ] All states are styled
- [ ] Usage matches guidelines
```

### Step 5: Validate Visual Patterns

**For each visual pattern:**

1. **Find pattern implementation:**
   - Locate pattern in code
   - Check pattern usage
   - Verify consistency

2. **Verify pattern matches documentation:**
   - Compare implementation to documentation
   - Check pattern usage guidelines
   - Verify consistency rules

**Validation checklist:**
```
Visual Patterns:
- [ ] Patterns are implemented
- [ ] Implementation matches documentation
- [ ] Usage matches guidelines
- [ ] Consistency maintained
```

### Step 6: Generate Validation Report

**Create validation report:**

```markdown
# Design System Validation Report

**Date**: [YYYY-MM-DD]
**Validator**: AI Assistant
**Design System Version**: [version]

## Summary

- **Status**: [validated | discrepancies_found | needs_review]
- **Total Checks**: [number]
- **Passed**: [number]
- **Failed**: [number]
- **Warnings**: [number]

## Design Tokens

### Validated ✅
- `--token-name` - ✅ Matches documentation
- [list all validated tokens]

### Discrepancies ❌
- `--token-name` - ❌ [discrepancy details]
- [list all discrepancies]

## Component Styles

### Validated ✅
- `ComponentName` - ✅ Matches specification
- [list validated components]

### Discrepancies ❌
- `ComponentName` - ❌ [discrepancy details]
- [list discrepancies]

## Visual Patterns

### Validated ✅
- Pattern Name - ✅ Matches documentation
- [list validated patterns]

### Discrepancies ❌
- Pattern Name - ❌ [discrepancy details]
- [list discrepancies]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps

- [ ] Update design system with corrections
- [ ] Fix code discrepancies (if design system is source of truth)
- [ ] Update code references if code moved
- [ ] Re-validate after fixes
```

### Step 7: Update Design System Status

**Based on validation results:**

- **All validated** → Update status to `validated`
- **Discrepancies found** → Keep status as `current_implementation` or `draft`
- **Major discrepancies** → Mark for refactoring

**Update design system metadata:**
```markdown
- **Status**: validated | current_implementation | needs_refactoring
- **Last Validated**: [YYYY-MM-DD]
```

## Output Deliverables

1. **Validation Report** (can be in design system document or separate file)
2. **Updated Design System Status** (in main design system document)

## Quality Criteria

**Good validation:**
- ✅ All code references checked
- ✅ All discrepancies documented
- ✅ Clear recommendations provided
- ✅ Actionable next steps

**Red flags:**
- ❌ Missing code references not checked
- ❌ Vague discrepancy descriptions
- ❌ No recommendations
- ❌ Unclear next steps

## Example Prompts for User

```
Validate the design system documentation against the codebase.
Check all design tokens in variables.css,
component styles in components/,
and verify all code references are accurate.
Generate a validation report.
```

## Next Steps

After validation:
1. **If validated** → Mark as `validated`, proceed to gap analysis if needed
2. **If discrepancies** → Use PLAYBOOK_06 to update design system, or PLAYBOOK_04 to plan refactoring
3. **If major issues** → Use PLAYBOOK_03 for gap analysis

---

**Related Playbooks:**
- PLAYBOOK_01: Document Design Intent (use before this)
- PLAYBOOK_03: Gap Analysis (use if discrepancies found)
- PLAYBOOK_06: Update Design System (use to fix discrepancies)

