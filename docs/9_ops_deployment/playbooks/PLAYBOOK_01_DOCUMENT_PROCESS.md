# Playbook 01: Document Process

## Purpose

This playbook provides step-by-step instructions for documenting deployment processes, either from existing code/config or from deployment specifications. Use this playbook when you need to create or update deployment process documentation.

## When to Use This Playbook

- Documenting existing deployment processes from code/config
- Documenting new deployment process specifications
- Creating baseline documentation for Phase 1
- Updating deployment process documentation with new details

## Prerequisites

- Access to codebase
- Understanding of what to document (deployment steps, environments, infrastructure)
- Knowledge of deployment-related file locations

## Instructions for AI Assistant

### Step 1: Understand the Task

**User will provide:**
- What to document (deployment steps, environment config, infrastructure, CI/CD)
- Whether documenting existing deployment or new specifications
- Specific deployment areas to focus on

**Your task:**
- Understand the scope (processes, environments, infrastructure, or full deployment)
- Identify if this is existing deployment or new design
- Determine what files to examine

### Step 2: Gather Information

**For Existing Deployment:**

1. **Search codebase** for relevant information:
   ```
   - Search for deployment scripts
   - Find CI/CD configuration files
   - Locate environment configuration
   - Find infrastructure as code files
   ```

2. **Read key files:**
   - Deployment scripts
   - CI/CD configuration (e.g., `.github/workflows/`, `.gitlab-ci.yml`)
   - Environment configuration files
   - Infrastructure as code files (e.g., `terraform/`, `docker-compose.yml`)

3. **Extract deployment information:**
   - Deployment processes
   - Environment configurations
   - Infrastructure definitions
   - CI/CD workflows

**For New Deployment Specifications:**

1. **Clarify requirements:**
   - Ask user for deployment specifications
   - Identify deployment requirements
   - Understand environment needs
   - Clarify infrastructure constraints

2. **Map to existing patterns:**
   - Check existing deployment patterns
   - Identify reusable patterns
   - Note technical constraints
   - Consider consistency with existing deployment

### Step 3: Document Deployment Processes

**Document each deployment process:**

1. **Process Definition:**
   - Process name
   - Process description
   - Deployment steps
   - Deployment automation

2. **Process Context:**
   - Where this process applies
   - Why this process is important
   - What depends on this process

3. **Process Validation:**
   - How to validate
   - How to test
   - How to monitor

**Document in `infrastructure/{area}.md`:**

```markdown
# Deployment Process: [Area Name]

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Last Validated**: [date or "not yet validated"]
- **Code Reference**: `file.ts:line-range`

## Overview
[Purpose and usage of this deployment process]

## Deployment Process

### [Process Name]

**Description**: [Process description]
**Steps**: [List of deployment steps]
**Automation**: [How process is automated]
**Code Reference**: `file.ts:line`

**Context**:
[Where this process applies and why it's important]

**Validation**:
[How to validate this process works]

**Monitoring**:
[How to monitor this process]

---

[Repeat for each process]
```

### Step 4: Document Environment Configuration

**Document environment specifications:**

1. **Environment Definitions:**
   - Environment names
   - Environment purposes
   - Environment variables
   - Environment setup

2. **Environment Configuration:**
   - Current environment configuration
   - Environment patterns
   - Environment validation

3. **Environment Security:**
   - Security measures
   - Access control
   - Best practices

**Document in infrastructure document:**

```markdown
## Environment Configuration

### [Environment Name]

**Purpose**: [What this environment is for]
**Variables**: [List environment variables]
**Code Reference**: `file.env:line`

**Configuration**:
[How this environment is configured]

**Security Measures**:
[List security measures]

**Validation**:
[How to validate environment configuration]
```

### Step 5: Document Infrastructure

**Document infrastructure specifications:**

1. **Infrastructure Definitions:**
   - Infrastructure components
   - Infrastructure provisioning
   - Infrastructure management

2. **Infrastructure Implementation:**
   - Current infrastructure implementation
   - Infrastructure patterns
   - Infrastructure configuration

3. **Infrastructure Security:**
   - Security measures
   - Access control
   - Best practices

**Document in infrastructure document:**

```markdown
## Infrastructure

### [Infrastructure Component]

**Type**: [Type: Server | Database | Network | etc.]
**Definition**: [Infrastructure definition]
**Code Reference**: `file.tf:line`

**Provisioning**:
[How this infrastructure is provisioned]

**Management**:
[How this infrastructure is managed]

**Security Measures**:
[List security measures]
```

### Step 6: Document CI/CD Pipelines

**Document CI/CD specifications:**

1. **Pipeline Definitions:**
   - Pipeline names
   - Pipeline workflows
   - Pipeline automation

2. **Pipeline Implementation:**
   - Current pipeline implementation
   - Pipeline patterns
   - Pipeline configuration

3. **Pipeline Security:**
   - Security measures
   - Access control
   - Best practices

**Document in infrastructure document:**

```markdown
## CI/CD Pipelines

### [Pipeline Name]

**Purpose**: [What this pipeline does]
**Workflow**: [Pipeline workflow description]
**Code Reference**: `file.yml:line`

**Implementation**:
[How this pipeline is implemented]

**Automation**:
[How this pipeline is automated]

**Security Measures**:
[List security measures]
```

### Step 7: Add Code References

**Critical:** Every deployment element must have a code reference:

- Processes: `file.ts:line-number` or config file
- Environments: `file.env:line-number`
- Infrastructure: `file.tf:line-number` or config file
- CI/CD: `file.yml:line-number`

**How to find references:**
- Use `grep` to find deployment-related code
- Use `codebase_search` to understand patterns
- Read deployment code to get exact line numbers

### Step 8: Create Deployment Summary

**Create or update deployment overview:**

```markdown
# Deployment Overview

## Status
- **Status**: current_implementation | draft
- **Last Updated**: [YYYY-MM-DD]
- **Version**: 1.0

## Deployment Processes
[List processes with status]

## Environment Configuration
[Summary of environments]

## Infrastructure
[Summary of infrastructure]

## CI/CD Pipelines
[Summary of CI/CD pipelines]
```

### Step 9: Review and Refine

**Checklist:**
- [ ] All deployment processes documented
- [ ] All environment configurations documented
- [ ] All infrastructure documented
- [ ] All CI/CD pipelines documented
- [ ] All code references accurate
- [ ] Deployment summary created
- [ ] Documentation is complete and logical

## Output Deliverables

1. **Deployment process documentation** (`infrastructure/{area}.md`)
2. **Environment configuration documentation**
3. **Infrastructure documentation**
4. **CI/CD pipeline documentation**
5. **Deployment overview** (summary document)
6. **Updated README.md** with deployment status

## Quality Criteria

**Good deployment documentation:**
- ✅ All processes documented with steps and automation
- ✅ All environments documented with variables
- ✅ All infrastructure documented with definitions
- ✅ All code references accurate
- ✅ CI/CD pipelines documented
- ✅ Clear and readable

**Red flags:**
- ❌ Missing code references
- ❌ Vague process descriptions
- ❌ Missing deployment steps
- ❌ Incomplete process definitions
- ❌ Deployment doesn't match code

## Example Prompts for User

**For existing deployment:**
```
Document the current deployment process.
Check for deployment scripts, CI/CD configuration,
and analyze deployment workflows.
```

**For new deployment:**
```
Document a new deployment process for production.
Use Docker containers, deploy to cloud provider.
Update the deployment process documentation.
```

## Next Steps

After documenting:
1. **Validate the processes** using PLAYBOOK_02
2. **Create validation checklist** (part of PLAYBOOK_02)
3. **Update process status** based on validation results

---

**Related Playbooks:**
- PLAYBOOK_02: Validate Environment (use after this)
- PLAYBOOK_06: Update Process (for updates)

