# EPIC-BLD-04 — Publish Report

**Status:** Ready for architecture review  
**Commit:** not created (awaiting approval)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Publish Pipeline is a separate distribution layer that consumes an existing `ProjectPackage` only. It never rebuilds, never reads Project, never interprets Runtime, never writes to disk / GitHub / cloud.

```
Project → Build Pipeline → ProjectPackage → Publish Pipeline → PublishedPackage
```

---

## PublishService

`createPublishService()` in `src/services/publish/publish-service.ts`

| API | Role |
| --- | --- |
| `publishPackage(packageId)` | Public Publish API |
| `validatePackage(packageId)` | Errors / warnings |
| `createPublishManifest(packageId)` | `publish.json` model |
| `prepareDistribution(packageId)` | In-memory distribution tree |
| `createPublishResult(packageId)` | Alias → publishPackage |
| `getLatestPublish` / `getPublishHistory` | Session history (max 10) |
| `getPublishedPackage(packageId)` | Last successful published model |

Package lookup uses `BuildService.getPackage(packageId)` — Publish never calls Build internals.

---

## PublishedPackage

```
PublishedPackage
 ├── packageId
 ├── version
 ├── manifest              (from ProjectPackage, unchanged)
 ├── publishManifest
 ├── runtimeEntry          (mock pointer string)
 ├── assets
 ├── metadata
 ├── publishedAt
 └── distribution
```

No ZIP. No file copy. Package content is not mutated.

---

## Publish Manifest (`publish.json`)

Fields:

- `packageId`
- `version`
- `buildVersion`
- `manifestVersion`
- `publishTime`
- `checksum` (deterministic mock)
- `runtimeVersion` (mock)

Sample: `apps/builder-studio/docs/sample-publish.harmony-124.json`

---

## Distribution Model

In-memory only:

```
distribution/
  manifest.json
  publish.json
  assets/
  layouts/
  knowledge/
```

Paths are recorded as strings; nothing is written to disk.

---

## Validation

Errors (Publish fails — no PublishedPackage):

- package missing
- manifest / version / packageId missing
- assets empty
- `publishable === false` (unsuccessful Build)
- runtimeEntry unresolvable (missing projectId)

Warnings do not block Publish (empty SVG / knowledge).

---

## Publish History

Session-only records: time, version, result, warning/error counts. Cap 10.

---

## Publish Panel

Shows:

- last Publish result
- Package Version
- Build Version
- Publish Time
- Validation / warnings
- Publish History
- **Publikovat změny** enabled only after successful publishable Build

No real upload / deploy.

---

## DeploymentTarget

Interface + catalog only:

- GitHub Pages
- S3
- Local
- Cloud Storage

`listDeploymentTargets()` — no adapters.

---

## Samples

- `apps/builder-studio/docs/sample-publish.harmony-124.json`
- `apps/builder-studio/docs/sample-published-package.harmony-124.json`
- Screenshot: `apps/builder-studio/docs/bld-04-publish-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (21) |
| build | pass |

### New tests (`publish-service.test.ts`)
- publish from existing package
- fail on non-publishable build package
- fail on missing packageId
- session history + version bump
- deployment target catalog

---

## Deviations

1. **IMP-05** Upload / Activate / Rollback against real environments — out of scope; only in-memory PublishedPackage.
2. `runtimeEntry` is a mock URI string for future Runtime Integration (IMP-06), not Runtime init.
3. Publish button stays disabled until a successful Build exists in the session (package source).
4. No physical `publish.json` file on disk except sample artifacts written by tests into `docs/` for review.

---

## Out of scope (confirmed)

- Build logic inside Publish
- Project access from Publish
- Runtime interpretation
- GitHub Pages / S3 / Cloudinary / any API deploy
- Disk export / ZIP

---

## Next

Await architecture review. On PASS: commit **EPIC-BLD-04 – Publish Pipeline**. Future deploy adapters consume `PublishedPackage` only.
