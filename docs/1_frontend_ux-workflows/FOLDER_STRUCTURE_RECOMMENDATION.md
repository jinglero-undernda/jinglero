# Folder Structure Recommendation

## Question: Archive Current Docs and Start Fresh?

**Recommendation: Keep existing docs, but organize better.**

## Rationale

### Why Not Archive

1. **Existing docs have value:**

   - `WORKFLOW_001` is comprehensive and well-structured
   - `IMPLEMENTATION_GUIDE.md` provides good foundation
   - Historical context is valuable

2. **No need to start fresh:**

   - Current structure is sound
   - Can be improved incrementally
   - Starting fresh wastes existing work

3. **Better approach:**
   - Organize existing docs
   - Add new structure alongside
   - Migrate incrementally if needed

## Recommended Structure

### Option 1: Flat Structure (Current - Good for Small Scale)

```
docs/
├── 1_frontend_ux-workflows/
│   ├── README.md                          # Overview and index
│   ├── IMPLEMENTATION_GUIDE.md            # General guide (keep)
│   ├── playbooks/                         # AI-ready playbooks
│   │   └── ...
│   ├── WORKFLOW_001_entity-edit-mode.md
│   ├── WORKFLOW_001_entity-edit-mode_diagram.md
│   ├── WORKFLOW_001_entity-edit-mode_validation.md
│   └── ...
```

**Use when:**

- Small number of workflows (< 10)
- Simple navigation needs
- Quick access to all workflows

### Option 2: Categorized Structure (Recommended for Larger Scale)

```
docs/
├── 1_frontend_ux-workflows/
│   ├── README.md                          # Overview and index
│   ├── IMPLEMENTATION_GUIDE.md            # General guide (keep)
│   ├── playbooks/                         # AI-ready playbooks
│   │   └── ...
│   ├── workflows/                         # Organized by experience category
│   │   ├── guest-experience/
│   │   │   ├── WORKFLOW_005_landing-page/
│   │   │   │   ├── WORKFLOW_005_landing-page.md
│   │   │   │   ├── WORKFLOW_005_landing-page_diagram.md
│   │   │   │   └── WORKFLOW_005_landing-page_validation.md
│   │   │   ├── WORKFLOW_006_search-discovery/
│   │   │   │   └── ...
│   │   │   ├── WORKFLOW_007_fabrica-viewing/
│   │   │   │   └── ...
│   │   │   └── WORKFLOW_008_entity-inspection/
│   │   │       └── ...
│   │   ├── admin-experience/
│   │   │   ├── WORKFLOW_001_entity-edit-mode/
│   │   │   │   ├── WORKFLOW_001_entity-edit-mode.md
│   │   │   │   ├── WORKFLOW_001_entity-edit-mode_diagram.md
│   │   │   │   └── WORKFLOW_001_entity-edit-mode_validation.md
│   │   │   ├── WORKFLOW_002_entity-creation/
│   │   │   │   └── ...
│   │   │   └── WORKFLOW_003_relationship-management/
│   │   │       └── ...
│   │   ├── authentication/
│   │   │   └── WORKFLOW_009_admin-authentication/
│   │   │       └── ...
│   │   └── navigation/
│   │       └── WORKFLOW_004_navigation-unsaved-changes/
│   │           └── ...
│   └── archive/                            # OPTIONAL: Old structure
│       └── (move old files here if reorganizing)
```

**Use when:**

- 10+ workflows
- Need to organize by user experience type
- Multiple team members working on different areas
- Want clear separation between guest and admin workflows

**Benefits:**

- Clear organization by user experience category
- Easy to find workflows by user type
- Scales well as workflow count grows
- Supports parallel work on different experience areas

## Migration Plan

### Option A: Migrate to Categorized Structure

If you want to organize by user experience categories:

#### Step 1: Create Category Directories

- Create `workflows/` directory
- Create subdirectories: `guest-experience/`, `admin-experience/`, `authentication/`, `navigation/`
- Create workflow subdirectories within each category

#### Step 2: Move Files by Category

- **Admin Experience**: Move `WORKFLOW_001_*.md`, `WORKFLOW_002_*.md`, `WORKFLOW_003_*.md` to `workflows/admin-experience/`
- **Navigation**: Move `WORKFLOW_004_*.md` to `workflows/navigation/`
- **Guest Experience**: New workflows go to `workflows/guest-experience/`
- **Authentication**: New workflows go to `workflows/authentication/`

#### Step 3: Update References

- Update links in README.md
- Update links in IMPLEMENTATION_GUIDE.md
- Update links in playbooks
- Update workflow metadata to reflect new paths

#### Step 4: Test

- Verify all links work
- Check that documentation is accessible
- Ensure cross-references between workflows still work

### Option B: Migrate to Flat Workflows Directory

If you want simple organization without categories:

#### Step 1: Create Workflows Directory

- Create `workflows/` directory
- Create subdirectories for each workflow

#### Step 2: Move Files

- Move `WORKFLOW_001_*.md` files to `workflows/WORKFLOW_001_entity-edit-mode/`
- Repeat for each workflow
- Update references in README

#### Step 3: Update References

- Update links in README.md
- Update links in IMPLEMENTATION_GUIDE.md
- Update links in playbooks

#### Step 4: Test

- Verify all links work
- Check that documentation is accessible

## Current Structure (Keep As-Is)

**Current structure is fine:**

- Flat structure works for small number of workflows
- Easy to find files
- No need to reorganize yet

**When to reorganize:**

- When you have 10+ workflows
- When structure becomes hard to navigate
- When you want better organization by user experience type
- When you need to separate guest and admin workflows clearly

## Recommendation

**For now: Keep current structure, add playbooks.**

1. **Keep existing docs** where they are
2. **Add playbooks directory** (already done)
3. **Continue using current structure** for workflows
4. **Reorganize later** if needed (when you have more workflows)

**Benefits:**

- No disruption to existing work
- Can start using playbooks immediately
- Can reorganize incrementally later
- Preserves existing documentation

## Choosing a Structure

### Start with Flat Structure

- Begin with flat structure (current approach)
- Add workflows in root directory
- Easy to start, no migration needed

### Migrate When Needed

- Migrate to categorized structure when you have:
  - 10+ workflows
  - Multiple user experience types (guest, admin, auth)
  - Need for clear organization by user type
  - Team members working on different areas

### Incremental Migration

- You can migrate incrementally:
  1. Keep existing workflows in current location
  2. Create `workflows/` directory
  3. Create category subdirectories
  4. Move new workflows to appropriate categories
  5. Gradually move existing workflows when convenient

### Cross-References

- Workflows can reference each other regardless of structure
- Use workflow IDs in cross-references (e.g., "See WORKFLOW_001")
- Paths in cross-references will update when migrating

## Final Recommendation

**Start with flat structure, migrate to categorized when needed.**

- ✅ No need to archive
- ✅ Flat structure works well for current workflow count
- ✅ Playbooks add value without disruption
- ✅ Can migrate to categorized structure incrementally
- ✅ Categorized structure ready when you need it

**Action:**

1. Use playbooks as-is (already created)
2. Continue documenting workflows in current location (flat structure)
3. As you add guest experience, authentication workflows, consider migrating to categorized structure
4. Use categorized structure when you have 10+ workflows or need clear separation by user type

**Migration Strategy:**

- Keep existing admin workflows in current location
- Create `workflows/` with category subdirectories when ready
- Move new workflows to appropriate categories
- Gradually migrate existing workflows when convenient

---

**Last Updated:** 2025-01-XX
