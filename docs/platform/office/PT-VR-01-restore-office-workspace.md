# PT-VR-01 — Restore Office Studio · isolate Partner Commercial Journey

**Status:** Build PASS · Ready for Visual / UX / Product Review · **Commit:** hold until PASS  
**Depends on:** Commercial Journey v1.0 · PT-COM-02 (`43d80eb`)  
**Date:** 2026-08-05  

## Problem

PT-CJ-OS-01 placed partner Commercial Journey inside Working Terminal and replaced the Office operator workspace.

Commercial Journey = partner path.  
Office Studio = salesperson workspace.  
Preview must not replace Workspace.

## Fix

| Surface | Role |
| --- | --- |
| `/` Working Terminal | Restored tabs: Výpis · Detail · Inbox · Timeline · Workflow + ops Workflow navigator |
| Left nav last item **Partner Commercial Journey** | Isolated production preview of partner path |
| Select Project | Shared `activeCase` for both surfaces — no separate context |

## Path (preview)

```text
Vítejte → Pilotní program → Dokončit objednávku → Platba → CONIS Studio
```

## Regression guard

Unchanged content: CJ screens · Office Workflow catalog · Conversation · Timeline · Inbox · Detail · Select Project · Partner Registry.  
Changed: **placement only**.

## Validation

```bash
pnpm --filter @embed-engine/office-studio typecheck
pnpm --filter @embed-engine/office-studio test
pnpm --filter @embed-engine/office-studio build
```

After Visual Review + Product Review **PASS**:

```text
fix(office): restore workspace and isolate partner journey
```

Then push working branch.
