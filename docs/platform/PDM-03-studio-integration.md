# PDM-03 — Studio Integration

**Status:** In progress (kickoff after PDM-02 Completed)  
**Depends on:** [PLATFORM-DATA-CONSTITUTION-v1.0](./PLATFORM-DATA-CONSTITUTION-v1.0.md) · [PDM-02](./PDM-02-shared-project-runtime.md)  
**Reference:** [Studio Integration Architecture](./08_STUDIO_INTEGRATION_ARCHITECTURE_v1.0.md)

## Goal

Finish Studio Integration onto Shared Project Runtime: every Studio loads the **same published Projekt** (identity + content binding), and retire remaining reference / demo project binds.

## Carry-over from PDM-02 Product Review

> Manager binds `projectId` from Shared Runtime (HP Runtime still `REFERENCE_HOUSE_PACKAGE`).

PDM-02 correctly left Runtime/HP unchanged. **PDM-03** rebinds Manager (and any remaining surfaces) so House Package content also comes from the Shared Project’s `packageRoot` / `objectId` — same as Client.

## Scope (draft)

1. **Manager** — load HP via Shared Project Runtime (drop production path dependency on `REFERENCE_HOUSE_PACKAGE`).  
2. **Client / Embed** — ensure session / Workspace Context `projectId` always drives package public root (no silent fallback to a different package).  
3. **Office ops overlays** — keep commercial overlays keyed by `projectId`; no second project registry.  
4. **Sales fixtures** — label or wire `SALES_CLIENTS` to Shared Project ids (DUP-08).  
5. **Quarantine** — remove remaining demo identity paths from production UX (DUP-05 · DUP-13 as applicable).

## Out of scope

- New commercial features · Partner Repository · full backend replacement · UI redesign unrelated to project bind.

## Exit criteria

- Manager Decision Session uses the same project-bound House Package as Client for the active `projectId`.  
- No Studio presents a parallel project list outside Shared Project Repository.  
- Constitution §1–§3 unchanged.

## Commit (when Product Review PASS)

```text
refactor(platform): complete studio project integration
```
