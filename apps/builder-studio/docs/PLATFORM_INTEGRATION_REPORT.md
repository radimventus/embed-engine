# EPIC-BLD-06 — Platform Integration Report

**Status:** Ready for architecture review  
**Commit:** not created (awaiting approval)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Builder Studio now orchestrates the full project lifecycle as the platform entry gate. Lifecycle status changes only through application services. No Git, no cloud, no persistence.

```
Project → Workspace → Build → ProjectPackage → Publish → PublishedPackage → Runtime
```

Lifecycle only steers passage through this flow.

---

## Lifecycle Service

`createLifecycleService()`

| API | Role |
| --- | --- |
| `createProject` | Draft + `ProjectCreated` |
| `changeStatus` | Validated transitions only |
| `archive` / `restore` | Archived ↔ Draft |
| `duplicate` | New Draft copy |
| `delete` | Remove registry + manifest |
| `syncBuildVersion` / `syncPublishVersion` / `syncRuntimeVersion` | Version + status sync |

States: `Draft → ReadyForBuild → Built → ReadyForPublish → Published → Archived`

---

## Builder Project Manifest (SSOT)

`BuilderProjectManifest`:

- projectId, projectType, version, status, owner
- createdAt, updatedAt
- buildVersion, publishVersion, runtimeVersion

**Naming note:** Package content manifest remains `ProjectManifest` (BLD-03). Platform identity/lifecycle SSOT is `BuilderProjectManifest` to avoid collision.

---

## Readiness Service

`createReadinessService().evaluate()`

Returns overall + media/layout/knowledge/build/publish percents, errors, warnings, recommendations. Builder-only — no Runtime interpretation.

---

## Version Management

`VersionInfo { project, build, publish, runtime }` — model only, no Git.

---

## Dashboard

`ProjectDashboard` in Workspace Header:

- lifecycle status
- Build / Publish / Runtime versions
- last updated
- readiness breakdown
- session timeline

---

## Timeline + Event Bus

In-memory `PlatformEventBus`:

- ProjectCreated
- BuildFinished
- PublishFinished
- PreviewOpened
- ProjectArchived

Timeline derived via `toTimelineEntries()` — session only.

---

## Gateway interfaces

Contracts only (no implementations):

- `RuntimeGateway`
- `PublishGateway`
- `StorageGateway`

---

## Screenshot

`apps/builder-studio/docs/bld-06-dashboard-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (33) |
| build | pass |

### New tests (`lifecycle-service.test.ts`)
- create + ProjectCreated
- build/publish orchestration → Published
- archive/restore
- duplicate
- readiness evaluation
- timeline labels
- invalid transition rejection

---

## Deviations

1. Platform project SSOT named `BuilderProjectManifest` (not `ProjectManifest`) to preserve BLD-03 package manifest type.
2. Seeded Harmony starts as `Published` in registry; first successful Build in-session moves it through Built → ReadyForPublish → Published again via services.
3. No UI controls for archive/duplicate/delete yet — APIs exist on LifecycleService for next epics.
4. Gateways are pure TypeScript contracts — intentionally unimplemented.

---

## Out of scope (confirmed)

- Git integration
- Cloud / storage / deploy adapters
- Persistence
- Editor feature expansion

---

## Next

Await architecture review. On PASS: commit **EPIC-BLD-06 – Project Lifecycle & Platform Integration**.
