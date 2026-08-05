# PT-VR-01A — Dokončení obnovy Office Studio

**Status:** Build PASS · Ready for Visual / UX / Product Review · **Commit:** hold until PASS  
**Depends on:** PT-VR-01  
**Date:** 2026-08-05  

**Branch note:** Closes Office fix lane (A). Further energy → data architecture (B) unless a deal-blocking regression appears.

## Fixes

| ID | Change |
| --- | --- |
| VR-001 | PE mode keeps `PlatformShell` header + breadcrumb; `hideStudioSwitcher` (align Manager/Sales) |
| VR-002 | Persist last `activeCaseId` (`conis.office.workspaceRecovery.v1`); boot → last case (or first) + **Inbox** |
| VR-003 | Select Project still syncs Detail · Workflow · Conversation · Timeline · Inbox · CJ (R-001) |
| VR-004 | Partner Commercial Journey remains isolated left-nav preview |

## Behaviour

```text
Open Office
  → restore last case (else first available)
  → open Inbox
  → salesperson continues work

Select Project
  → full context switch (R-001 → Detail)
  → never empty (no “vyberte projekt”)
```

## Out of scope

CJ content · data layer · Builder · Runtime · new screens.

## Validation

```bash
pnpm --filter @embed-engine/office-studio typecheck
pnpm --filter @embed-engine/office-studio test
pnpm --filter @embed-engine/office-studio build
```

After Visual + Product Review **PASS**:

```text
fix(office): finalize workspace restoration
```

Then push working branch.
