# Debug Logs

This directory contains debug logs for the project.

## Instructions

In previous sessions we have addressed individual bugs in the UX/UI or backend. Some bug resolution is proving difficult, and in some instances a resolved bug has regressed. This file is a record of the bugs found and the resolution attempts, to help us navigate the codebase and resolve the bugs.

- I will provide in-context description of the bugs I am finding, and you will need to create a line reference in this index and a dedicated file for the bug.

- Your first task will be to read the index of bugs in this page and ask me if this bug is similar to others documented in this log. This will give an initial indication of possible root causes and resolution strategies.

- The dedicated file will contain the following sections:
  - **Description**: A brief description of the bug.
  - **Expected behavior**: A description of the expected behavior of the product.
  - **Observed behavior**: A description of the actual behavior of the product.
  - **Reproduction steps**: A list of steps to reproduce the bug.
  - **Root cause**: As part of the debugging process, you will need to identify the root cause of the bug and document it - so that we can investigate unintended similar effects on the product. This will also allow for efficient investigation for scenarios where a previously resolved bug has regressed.
  - **Resolution**: The approach taken to resolve the bug.
  - **Related Files**: A list of the files related to the bug. IMPORTANT: include specific search strings to allow for efficient navigation to the code area affected by the bug.
  - **Related Code**: SHORT reference to the code affected by the bug.

If the provided information or your codebase investigation is not sufficient to populate the sections, you will need to ask me for more information (in particular for the expected and observed behavior).

## Workflow Overview - Bug creation

1. Capture the new bug description and confirm whether it resembles any entry already listed here (prevents duplicate investigations).
2. Allocate the next `BUG_XXXX.md` file using the template, populate initial metadata, and copy over the reporter’s context (description + repro steps).
3. Investigate and keep the bug file in sync with discoveries (root cause hypotheses, environment details, related files).
4. When deploying a fix, reference the bug ID in the git commit message so the code history links back to the log.
5. Update the bug entry’s status, resolution notes, and last-updated timestamp once validated; leave breadcrumbs for any follow-up checks.

## Workflow Overview - Bug revision

In some cases, we observe regressions of bugs that were previously resolved. In these cases, we will need to revisit the bug and update the resolution notes.

1. Identify if the described bug is similar to any entry already listed here (prevents duplicate investigations).
2. Based on the root cause documentation, check the relevant code-base to identify if the current scenario is similar to the previous one.
3. Report back to the user with an assessment of the findings, to confirm if it is a new bug or a regression of the previous one.
4. Based on the response from the user:
   4.1 If it is a regression of a previously resolved bug, check the dependencies with other bugs to identify if there is a chain of regressions. This will require re-opening the old bug and do a deeper investigation.
   4.2 If it is a new bug, create a new bug entry and follow the workflow for bug creation.

## Bug Entry Metadata & Context

- `Status`: `open | in progress | resolved` – quickly shows whether more work is needed.
- `Last Updated`: the date of the most recent note; helps spot stale investigations.
- `Category`: e.g., `frontend`, `auth`, `billing`, `infra` – enables filtering when the list grows.
- `Severity`: e.g., `blocker`, `high`, `medium`, `low` – clarifies priority.
- `Environment`: browser, OS, API env, feature flags, etc.
- `Repro Steps`: numbered steps capturing the exact flow that reveals the bug.
- `Related Commits`: list of commit hashes/PR links, ideally with messages like `BUG_0001: ...`.

## Files syntax

- `debugLogs_INDEX.md`: This file.
- `BUG_XXXX.md`: Debug notes for BUG_XXXX [replace with progressively increasing numbers].
- `BUG_TEMPLATE.md`: Canonical structure to copy when starting a new bug entry.

## BUGS FOUND

[x] BUG_0001: Fabrica metadata editor hides empty configured fields (see `BUG_0001.md`)
[ ] BUG_0002: Admin edit mode marks relationships dirty on expand (see `BUG_0002.md`)
[x] BUG_0003: Admin page fetching wrong entity type on navigation (see `BUG_0003.md`)
[x] BUG_0004: Admin page incorrectly identifies entity type from new ID format (see `BUG_0004.md`)
[x] BUG_0005: RelatedEntities false positive mismatch warning on page reload (see `BUG_0005.md`)
[x] BUG_0006: Relationship creation creates wrong direction for versiona, entity not visible after creation (see `BUG_0006.md`)
[x] BUG_0007: Audit all existing relationships to validate correct direction (see `BUG_0007.md`)
[ ] BUG_0008: APPEARS_IN order update script throws error causing relationship creation/update to fail (see `BUG_0008.md`)
[ ] BUG_0009: RelatedEntities uses wrong entity ID when mismatch detected, causing "Jingle not found" error (see `BUG_0009.md`)
[ ] BUG_0010: Timestamps show 00:00:00 in Admin interface after bulk upload - Root cause: API returns HH:MM:SS string but frontend expects seconds number (see `BUG_0010.md`)
