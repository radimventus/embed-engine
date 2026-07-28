# EPIC-BLD-05 — Runtime Preview Report

**Status:** Ready for architecture review  
**Commit:** not created (awaiting approval)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Runtime Preview orchestrates loading of an existing `PublishedPackage` through a stable `RuntimeAdapter` interface. Builder does not implement Runtime interpretation. Pipeline boundary preserved:

```
Project → Build → ProjectPackage → Publish → PublishedPackage → RuntimeAdapter → (future Embed Runtime)
```

---

## RuntimePreviewService

`createRuntimePreviewService()` in `src/services/preview/runtime-preview-service.ts`

| API | Role |
| --- | --- |
| `openPreview(packageId)` | Public Preview API → `RuntimeSession` |
| `closePreview()` | Unload via adapter |
| `refreshPreview()` | Reload same PublishedPackage |
| `getPreviewState()` | Snapshot (state / session / version) |
| `getActiveSession()` | Current session |
| `getPreviewHistory()` | Session events (max 20) |

Source of package: `getPublishedPackage(packageId)` only — never Project, never Build rebuild.

---

## RuntimeSession

```
RuntimeSession
 ├── sessionId
 ├── packageId
 ├── previewState
 ├── startedAt
 ├── refreshedAt
 ├── runtimeVersion
 └── errorMessage
```

In-memory only.

---

## Preview State

`Idle → Preparing → Loading → Ready | Error`

---

## RuntimeAdapter

Interface only (stable integration contract):

- `loadPackage()`
- `unload()`
- `reload()`
- `getStatus()`

`createStubRuntimeAdapter()` is a non-interpreting status stub for orchestration/tests — **not** Embed Runtime and not bound to a concrete Runtime implementation.

---

## Preview Events

Session history records:

- `PreviewOpened`
- `PreviewClosed`
- `PreviewReloaded`
- `PreviewFailed`

---

## Preview Panel

Right panel section **Runtime Preview**:

- Preview Status
- Runtime Version
- Loaded Package
- Session
- Open Preview / Refresh / Close
- Preview History

Open Preview enabled only after successful Publish (`PublishedPackage` exists).

---

## Screenshot

`apps/builder-studio/docs/bld-05-preview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (26) |
| build | pass |

### New tests (`runtime-preview-service.test.ts`)
- open from PublishedPackage
- refresh + close
- missing package → Error / PreviewFailed
- adapter failure without interpretation
- history cap 20

---

## Deviations

1. No live Embed Runtime host/iframe — Preview is orchestration + stub adapter status (per “Builder nesmí Runtime implementovat”).
2. Stub adapter exists for runnable tests/UI; the **contract** remains `RuntimeAdapter` so a real Embed Runtime adapter can replace it later without Builder Studio changes.
3. Preparing/Loading are transitional within `openPreview` / `refreshPreview` (synchronous stub); UI may briefly not observe intermediate frames.

---

## Out of scope (confirmed)

- Runtime interpretation / Decision Experience execution
- Duplicate Runtime business logic
- Project access from Preview
- Persistence

---

## Next

Await architecture review. On PASS: commit **EPIC-BLD-05 – Runtime Preview & Experience Integration**.
