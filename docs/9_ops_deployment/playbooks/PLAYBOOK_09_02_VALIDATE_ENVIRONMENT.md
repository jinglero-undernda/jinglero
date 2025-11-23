# Playbook 02: Validate Environment

## Purpose

This playbook provides step-by-step instructions for validating deployment process documentation against actual environments and infrastructure. Use this to check for sync issues, verify accuracy, and identify discrepancies between documented processes and actual deployment.

## When to Use This Playbook

- After documenting deployment processes (PLAYBOOK_01)
- After code changes that might affect deployment
- Before planning improvements (to establish baseline)
- Regular maintenance (monthly audits)
- When sync issues are suspected

## Prerequisites

- Deployment process document exists
- Access to codebase
- Deployment process document has code references
- Understanding of deployment implementation

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

### Step 1: Read Deployment Process Document

**Your task:**
1. Read the complete deployment process documentation
2. Extract all technical details:
   - Deployment processes
   - Environment configurations
   - Infrastructure definitions
   - File paths and line numbers

**Create a checklist:**
```
Extracted from Deployment Processes:
- Processes: [list]
- Environments: [list]
- Infrastructure: [list]
- CI/CD: [list]
```

### Step 2: Validate Code References

**For each code reference in the processes:**

1. **Check file exists:**
   - Use `read_file` to verify file exists
   - Check if line numbers are reasonable

2. **Verify code matches description:**
   - Read the referenced code
   - Compare to process description
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

### Step 3: Validate Environment Configuration

**For each environment, check configuration:**

1. **Find environment configuration:**
   - Locate environment configuration files
   - Find environment variable definitions
   - Check environment setup scripts

2. **Verify environment matches processes:**
   - Do environment configurations match documented configurations?
   - Do environment variables match documented variables?
   - Do environment setups match documented setups?

3. **Check environment validation:**
   - Verify environment validation works
   - Check environment setup works
   - Verify environment configuration is correct

**Validation checklist:**
```
Environment Configuration:
- [ ] Environment configuration exists
- [ ] Environment variables match processes
- [ ] Environment setup matches processes
- [ ] Environment validation works
```

### Step 4: Validate Infrastructure

**For each infrastructure component, check implementation:**

1. **Find infrastructure code:**
   - Locate infrastructure as code files
   - Find infrastructure provisioning code
   - Check infrastructure management code

2. **Verify infrastructure matches processes:**
   - Do infrastructure definitions match documented definitions?
   - Do provisioning processes match documented processes?
   - Do management processes match documented processes?

3. **Check infrastructure validation:**
   - Verify infrastructure provisioning works
   - Check infrastructure management works
   - Verify infrastructure matches documentation

**Validation checklist:**
```
Infrastructure:
- [ ] Infrastructure code exists
- [ ] Infrastructure definitions match processes
- [ ] Provisioning matches processes
- [ ] Infrastructure validation works
```

### Step 5: Validate CI/CD Pipelines

**For each CI/CD pipeline, check implementation:**

1. **Find CI/CD configuration:**
   - Locate CI/CD configuration files
   - Find pipeline workflow definitions
   - Check pipeline automation code

2. **Verify pipelines match processes:**
   - Do pipeline workflows match documented workflows?
   - Do pipeline automations match documented automations?
   - Do pipeline configurations match documented configurations?

3. **Check pipeline functionality:**
   - Verify pipelines work correctly
   - Check pipeline automation works
   - Verify pipeline configurations are correct

**Validation checklist:**
```
CI/CD Pipelines:
- [ ] CI/CD configuration exists
- [ ] Pipeline workflows match processes
- [ ] Pipeline automation matches processes
- [ ] Pipelines work correctly
```

### Step 6: Validate Deployment Processes

**For each deployment process, check execution:**

1. **Find deployment code:**
   - Locate deployment scripts
   - Find deployment automation code
   - Check deployment validation code

2. **Verify processes match documentation:**
   - Do deployment steps match documented steps?
   - Do deployment automations match documented automations?
   - Do deployment validations match documented validations?

3. **Check deployment functionality:**
   - Verify deployment processes work
   - Check deployment automation works
   - Verify deployment validation works

**Validation checklist:**
```
Deployment Processes:
- [ ] Deployment code exists
- [ ] Deployment steps match processes
- [ ] Deployment automation matches processes
- [ ] Deployment processes work correctly
```

### Step 7: Validate Against Requirements

**For each process, check requirements:**

1. **Find requirements:**
   - Locate deployment requirements
   - Find environment requirements
   - Check infrastructure requirements

2. **Verify processes meet requirements:**
   - Do deployment processes meet requirements?
   - Do environments meet requirements?
   - Are there missing requirements?

3. **Check gaps:**
   - Identify missing deployment processes
   - Identify processes not meeting requirements
   - Identify requirements not covered

**Validation checklist:**
```
Requirements:
- [ ] Deployment processes meet requirements
- [ ] Environments meet requirements
- [ ] No missing requirements
```

### Step 8: Generate Validation Report

**Create validation report:**

```markdown
# Deployment Process Validation Report

**Date**: [YYYY-MM-DD]
**Validator**: AI Assistant
**Deployment Process Version**: [version]

## Summary

- **Status**: [validated | discrepancies_found | needs_review]
- **Total Checks**: [number]
- **Passed**: [number]
- **Failed**: [number]
- **Warnings**: [number]

## Code References

### Validated ✅
- `file.ts:line` - [description] - ✅ Matches
- [list all validated references]

### Discrepancies ❌
- `file.ts:line` - [description] - ❌ [discrepancy details]
- [list all discrepancies]

## Environment Configuration

### Validated ✅
- [Environment] - ✅ Matches processes
- [list validated environments]

### Discrepancies ❌
- [Environment] - ❌ [discrepancy details]
- [list discrepancies]

## Infrastructure

### Validated ✅
- [Component] - ✅ Matches processes
- [list validated components]

### Discrepancies ❌
- [Component] - ❌ [discrepancy details]
- [list discrepancies]

## CI/CD Pipelines

### Validated ✅
- [Pipeline] - ✅ Matches processes
- [list validated pipelines]

### Discrepancies ❌
- [Pipeline] - ❌ [discrepancy details]
- [list discrepancies]

## Deployment Processes

### Validated ✅
- [Process] - ✅ Matches documentation
- [list validated processes]

### Discrepancies ❌
- [Process] - ❌ [discrepancy details]
- [list discrepancies]

## Requirements

### Validated ✅
- [Requirement] - ✅ Met
- [list validated requirements]

### Discrepancies ❌
- [Requirement] - ❌ [discrepancy details]
- [list discrepancies]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps

- [ ] Update processes with corrections
- [ ] Fix code discrepancies (if process is source of truth)
- [ ] Update code references if code moved
- [ ] Re-validate after fixes
```

### Step 9: Update Process Status

**Based on validation results:**

- **All validated** → Update status to `validated`
- **Discrepancies found** → Keep status as `current_implementation` or `draft`
- **Major discrepancies** → Mark for improvement

**Update process metadata:**
```markdown
- **Status**: validated | current_implementation | needs_improvement
- **Last Validated**: [YYYY-MM-DD]
```

## Output Deliverables

1. **Validation Report** (comprehensive document)
2. **Updated Process Status** (in main process document)

## Quality Criteria

**Good validation:**
- ✅ All code references checked
- ✅ All environments validated
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
Validate the deployment process documentation against actual environments.
Check all processes, environments, infrastructure, and CI/CD pipelines.
Verify implementation matches processes,
and environments match documented configuration.
Generate a validation report.
```

## Next Steps

After validation:
1. **If validated** → Mark as `validated`, proceed to gap analysis if needed
2. **If discrepancies** → Use PLAYBOOK_06 to update processes, or PLAYBOOK_04 to plan improvements
3. **If major issues** → Use PLAYBOOK_03 for gap analysis

---

**Related Playbooks:**
- PLAYBOOK_01: Document Process (use before this)
- PLAYBOOK_03: Gap Analysis (use if discrepancies found)
- PLAYBOOK_06: Update Process (use to fix discrepancies)

