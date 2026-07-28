# EPIC-BLD-08 — Object Package Report

**Status:** Ready for architecture review  
**Commit:** not created (awaiting approval)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Object Package is the authoring model of an object — not a Build or Publish artifact. Project remains the lifecycle container; Object Package is its content. UI talks only through application services.

```
Project → Object Package → Validation → Build → Publish → Runtime
```

---

## Object Package model

`ObjectPackage`

| Field | Role |
| --- | --- |
| `objectId` | Canonical id (`object-${projectId}`) |
| `projectId` | Link to lifecycle Project |
| `metadata` | name, objectType, location, status, description, tags |
| `media` / `layouts` / `knowledge` | Content refs synced from Active Project assets |
| `modules` | Assigned module ids |
| `tags` | Top-level tags (mirrors metadata.tags) |
| `version` | Semver authoring version |
| `timestamps` | createdAt / updatedAt |

---

## Object Service

`createObjectService()` — application layer:

| Method | Role |
| --- | --- |
| `createObject` | Create authoring package |
| `loadObject` / `loadObjectByProject` | Read |
| `updateObject` | Metadata patch |
| `saveObject` | Explicit save + version bump |
| `duplicateObject` | Session copy |
| `archiveObject` | Status → Archived |
| `assignModule` / `unassignModule` / `setModules` | Module assignment |
| `syncContentFromProject` | Refresh media/layout/knowledge refs |
| `getEvents` / `getHistory` | Session history |

---

## Object API

Public facade `createObjectApi(service)`:

- `loadObject(objectId)`
- `saveObject(objectId)`
- `duplicateObject(objectId)`

---

## Metadata Editor

UI fields (via `ObjectService.updateObject`):

- název
- typ objektu (`house` | `apartment` | `land` | `commercial`)
- lokalita
- stav (`Draft` | `Active` | `Archived`)
- popis
- štítky

---

## Module Registry

Catalog only — no module configuration:

- Hero
- Market Pulse
- House Navigator
- Priority
- FAQ
- AI Advisor
- Lead Capture

Default assignment: Hero, House Navigator, Priority, FAQ.

---

## Module Assignment

`ObjectPackage.modules[]` toggled from Overview against the registry. No per-module config.

---

## Object Overview

New Workspace section **Overview** (default):

- metadata editor
- media / layout / knowledge counts
- module assignment
- validation Quality Gate + readiness summary
- session history

---

## Events & History

| Event | When |
| --- | --- |
| `ObjectCreated` | create / duplicate |
| `ObjectUpdated` | save / update / modules |
| `ModuleAssigned` | assign / unassign / set |
| `MetadataChanged` | metadata update |

Session-only history (max 30). No persistence.

---

## Screenshot

`apps/builder-studio/docs/bld-08-object-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (41) |
| build | pass |

### New tests
- Module Registry catalog
- create / update / assign / archive flow + events
- content sync from Active Project assets
- Object API load / save / duplicate

---

## Deviations

1. Media / layouts / knowledge in Object Package are **refs synced** from Active Project assets (BLD-02), not a separate upload store — Object Package remains the authoring aggregate.
2. `duplicateObject` creates an additional session ObjectPackage; Project stays 1:1 with canonical `object-${projectId}` (Overview keeps the primary).
3. Metadata edits version-bump on each `updateObject` call (keystroke-level in UI) — acceptable for session authoring without persistence.
4. Validation / readiness on Overview are **read-only displays** of BLD-06/07 services; Object Package does not own validation logic.

---

## Out of scope (confirmed)

- Runtime logic
- Build logic
- Publish
- Persistence
- Module configuration

---

## Next

Await architecture review. On PASS: commit **EPIC-BLD-08 – Object Package Management**.
