# EPIC-BLD-09 — Experience Composer Report

**Status:** Ready for architecture review  
**Commit:** not created (awaiting approval)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Experience Composer skládá strukturu Experience (scény, pořadí, přiřazení modulů). Neurčuje význam — interpretaci provádí Runtime. Experience je součástí Object Package.

```
Project → Object Package → Experience → Scenes → Modules → Validation → Build → Publish → Runtime
```

---

## Experience model

`Experience`

| Field | Role |
| --- | --- |
| `experienceId` | Canonical id (`experience-${objectId}`) |
| `objectId` | Link to Object Package |
| `scenes[]` | Ordered logical parts |
| `modules[]` | Union of placed modules |
| `navigation` | scenes / defaultScene / order |
| `metadata` | title, description |
| `version` | Authoring semver |

`ObjectPackage.experience` holds the attached Experience (or `null` before compose).

---

## Scene model

`Scene`

| Field | Role |
| --- | --- |
| `sceneId` | Identity |
| `title` | Author label |
| `order` | Sequence index |
| `modules[]` | Placed module ids |
| `settings.notes` | Placeholder only (no module config) |

---

## ExperienceComposerService

`createExperienceComposerService()` — orchestration only:

| Method | Role |
| --- | --- |
| `createExperience` | Seed scenes from blueprint filtered by Object modules |
| `loadExperience` / `loadExperienceByObject` | Read |
| `updateExperience` | Metadata |
| `addScene` / `removeScene` / `moveScene` / `updateScene` | Scene editor ops |
| `assignModule` / `unassignModule` | Placement |
| `validateStructure` | Structural checks only |
| `getEvents` / `getHistory` | Session history |

---

## Composer API

`createExperienceComposerApi(service)`:

- `createExperience()`
- `loadExperience()`
- `updateExperience()`

---

## Scene Editor

UI: add / rename / reorder (↑↓) / remove (min 1 scene).

---

## Module Placement

Assign modules into the selected scene from Object Package module palette:

Hero, Market Pulse, House Navigator, Priority, FAQ, AI Advisor, Lead Capture  

**No module configuration** in this epic.

---

## Navigation model

`ExperienceNavigation { scenes, defaultScene, order }`

Maintained automatically when scenes change.

---

## Experience Overview

Workspace section **Experience**:

- scene list + editor
- module placement
- navigation order
- structure validation
- composer session history

---

## Events

| Event | When |
| --- | --- |
| `ExperienceCreated` | create |
| `SceneAdded` | add scene |
| `SceneRemoved` | remove scene |
| `ModuleAssigned` | assign / unassign |
| `SceneMoved` | reorder |

Session-only (max 40). No persistence.

---

## Screenshot

`apps/builder-studio/docs/bld-09-experience-composer-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (45) |
| build | pass |

### New tests
- create Experience + navigation
- scene CRUD + module assignment + events
- Composer API + structure validation
- reject removing last scene

---

## Deviations

1. Default Experience seeds 4 blueprint scenes (Úvod / Prohlídka / Rozhodování / Kontakt), filtered by Object Package `modules[]` — empty scenes after filter are dropped.
2. `Experience.modules` is derived from scene placements (union), not a separate authoring list.
3. `Scene.settings` only has `notes` placeholder — no Hero/Priority/FAQ config (deferred to later EPICs).
4. Structure validation is Composer-local; it does not replace BLD-07 Quality Gate.

---

## Out of scope (confirmed)

- Runtime logic / interpretation
- Module configuration
- Build
- Publish
- Persistence

---

## Next

Await architecture review. On PASS: commit **EPIC-BLD-09 – Experience Composer**.
