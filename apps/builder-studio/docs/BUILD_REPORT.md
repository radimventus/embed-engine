# EPIC-BLD-03 — Build Report

**Status:** Ready for architecture review  
**Commit:** not created (awaiting approval)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Build Pipeline prepares an in-memory deterministic `ProjectPackage` + `ProjectManifest` from the Active Project. Validation reports errors/warnings but does not stop packaging. No Publish, no Runtime interpretation, no disk/ZIP export.

---

## BuildService

`createBuildService()` in `src/services/build/build-service.ts`

| API | Role |
| --- | --- |
| `buildProject(projectId)` | Full pipeline + history |
| `validateProject(projectId)` | Errors / warnings only |
| `collectAssets(projectId)` | Metadata collector |
| `generateManifest(projectId)` | Manifest factory |
| `packageProject(projectId)` | Package structure |
| `getLatestBuild` / `getBuildHistory` | Session history (max 10) |

Pipeline order inside `buildProject`:

Load Project → Collect Assets → Validate → Generate Manifest → Package → BuildResult → History

UI never builds directly — only `session.buildProject()` → BuildService.

---

## Manifest

`ProjectManifest` fields:

- `projectId`, `manifestId`, `version`, `buildTime`
- `assets` (hero / photographs / video)
- `layouts` (svg / floorplan / csvRooms / csvImages)
- `knowledge`
- `metadata`

No Runtime fields.

Sample: `apps/builder-studio/docs/sample-manifest.harmony-124.json`

---

## Asset Collector

`collectAssets()` gathers metadata refs only for:

Hero, Fotografie, Video, SVG, Floorplan, CSV Rooms, CSV Images, Knowledge (pdf/docx/xlsx)

No file copying.

---

## Validation

Checks (errors do **not** abort Build):

- Hero exists
- At least one layout resource
- Metadata title / partner present
- manifestId present

Warnings: empty photographs / video / knowledge / svg, Error-state categories.

`success = errors.length === 0`  
`package.publishable = success` (blocks future Publish without deleting package)

---

## Package Model

```
ProjectPackage
 ├── packageId / projectId / createdAt / publishable
 ├── manifest
 ├── assets
 ├── layouts
 └── knowledge
```

In-memory only. No ZIP. No export.

---

## Build Panel

Publish Panel extended with Build section:

- last Build status
- warning / error counts
- build time
- manifest version
- publishable flag
- error list
- **Spustit Build**
- session Build History (latest entries)

Publish / Embed actions remain disabled.

---

## Build History

In-memory session list, capped at **10** builds. No persistence.

---

## Screenshot

`apps/builder-studio/docs/bld-03-build-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (16) |
| build | pass |

### New tests (`build-service.test.ts`)
- deterministic harmony-124 package + sample manifest write
- family-98 builds with errors (package still produced, not publishable)
- history capped at 10
- helper API surface without UI

---

## Deviations

1. **IMP-04** says failing validation stops Build / no package — EPIC text says **do not stop Build**; package is always produced, `publishable: false` when errors exist.
2. No `runtime.bundle` / on-disk `package/` tree — in-memory model only (no export).
3. Version bumps per successful history entry (`1.0.0` → `1.0.1` …), not git/semver source.
4. Readiness % in the panel update heuristically from build statistics after Build; Publish stays Idle until BLD-04.

---

## Out of scope (confirmed)

- Publish Pipeline
- Runtime interpretation
- Upload / GitHub Pages
- ZIP / disk export

---

## Next

Await architecture review. On PASS: commit **EPIC-BLD-03 – Build Pipeline**, then **EPIC-BLD-04 – Publish Pipeline** consumes `buildProject(projectId)` + `ProjectPackage`.
