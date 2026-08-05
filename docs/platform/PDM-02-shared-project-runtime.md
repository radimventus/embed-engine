# PT-PDM-02 — Shared Project Runtime

**Status:** Approved — Architecture · Product · Regression Review **PASS** · **PDM-02 Completed**  
**Date:** 2026-08-05  
**Depends on:** [PLATFORM-DATA-CONSTITUTION-v1.0](./PLATFORM-DATA-CONSTITUTION-v1.0.md) (**PDM-01 Completed**)

## Delivered

| Item | Location |
| --- | --- |
| Shared Project Runtime | `packages/platform-access/src/project/` |
| Project Repository (Builder write / all read) | `projectRepository.ts` · `upsertBuilderProject` |
| `openProject(projectId)` | `projectRuntime.ts` |
| Builder sole author sync | `workspaceRegistry.ts` → `syncBuilderWorkspaceHouse` |
| Office Select Project | published Shared Projects via `listOfficeSelectProjects()` |
| Client package load | `resolveActiveProjectView` → `ensureBuilderPackageBootstrapped(packagePublicRoot)` |
| Manager project bind | `projectId` from Shared Runtime (HP Runtime still `REFERENCE_HOUSE_PACKAGE` — **PDM-03**) |
| Sales project list | `listPublishedProjects()` |
| Legacy demo case ids | aliases → `villa-168` / `harmony-124` / `family-98` |

## Constitution alignment (PDM-01 PASS)

- Builder = sole Projekt author  
- Office Select Project binds to published Projekt ids — ops overlays only  
- Office owns **obchodní proces**, not nabídka content  
- Client / Manager / Sales consume the same Shared Project Runtime  

## Regression guard

- Commercial Journey screens / isolated surface unchanged  
- Office Working Terminal chrome unchanged  
- Builder UX unchanged (sync is side-effect of existing create/update)  
- Runtime API / Decision Session unchanged  
- Manager still boots `REFERENCE_HOUSE_PACKAGE` for HP Runtime  

## Review gates

| Gate | Status |
| --- | --- |
| Build PASS | ✅ |
| Runtime Validation PASS | ✅ |
| Cross-Studio Validation PASS | ✅ |
| Product Review PASS | ✅ |

Committed as:

```text
refactor(platform): introduce shared project runtime
```

**Next:** [PDM-03 — Studio Integration](./PDM-03-studio-integration.md) — full Shared Project Runtime for remaining studios; retire Manager `REFERENCE_HOUSE_PACKAGE` / demo binds.
