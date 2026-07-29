# EPIC-BLD-34 — Experience State Manager Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-35)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Experience State Manager je SSOT pro runtime stav Experience (session / module / move / checkpoints / restore). Nevytváří Knowledge, Story, AI Context, Personalization ani business logiku modulů — pouze spravuje stav běhu.

```
Decision Orchestrator
        │
Experience Module Coordinator
        │
Experience State Manager
        │
Experience Modules
```

Doplňuje Execution Layer o auditovatelnou správu a obnovu stavu.

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `f92f87f` | `feat(builder): implement experience module coordinator` (EPIC-BLD-33) |

---

## ExperienceStateManager

| Method | Role |
| --- | --- |
| `initialize()` | Derive package id from session id |
| `createState()` | Create Active ExperienceStatePackage |
| `updateState()` | Patch module / move / execution refs |
| `checkpoint()` | Persist auditable snapshot |
| `restore()` | Restore from checkpoint |
| `complete()` | Completed + Published package |
| `dispose()` | Disposed status |

---

## Models

- **ExperienceState** — id, sessionId, executionId, activeModule, activeMove, status, checkpointId, timestamps, metadata  
- **ExperienceCheckpoint** — id, stateId, timestamp, snapshot, reason, metadata  
- **ExperienceStatePackage** — id, version, state, checkpoints, metadata (+ validation)

---

## StatePersistenceStrategy / Validator / Index

**StatePersistenceStrategy** — `supports()` / `save()` / `restore()`  

**BasicStatePersistenceStrategy** — in-memory, bez DB  

**ExperienceStateValidator** — validate / validateCheckpoint / validateExecution / validateConsistency  

**ExperienceStateIndex** — index / find / list / rebuild  

---

## Experience State Overview

Sekce Builderu `experience-state` (nav **State**):

- Active State / Active Module / Active Move / Last Checkpoint / Restore Status / Validation / Events  
- Create State / Update / Checkpoint / Restore / Complete / Validate / Dispose  
- `data-testid="experience-state-overview"`  
- Pouze diagnostická projekce  

---

## Events

| Event | When |
| --- | --- |
| `ExperienceStateCreated` | createState |
| `ExperienceStateUpdated` | updateState / complete |
| `CheckpointCreated` | checkpoint |
| `ExperienceStateRestored` | restore |
| `ExperienceStateValidated` | validate |

---

## API

`createExperienceStateApi(manager)`:

- `createState()`
- `updateState()`
- `checkpoint()`
- `restoreState()`
- `listStates()`
- `validateState()`

---

## Screenshot

`apps/builder-studio/docs/bld-34-experience-state-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (155) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| ExperienceStatePackage | + `checkpoints[]`, validation, timestamps | Overview Last Checkpoint + Validation |
| Persistence.list() | extra helper on strategy | Index/list diagnostics |
| Demo Session fallback | without prior Session | Overview usable standalone |

---

## Architektonická kontrola — checklist

- [x] Nemění Knowledge / AI Context / Personalization / Story  
- [x] Neřídí průchod Experience / neobsahuje logiku modulů  
- [x] Pouze správa runtime stavu + checkpoint/restore  
- [x] Publikovaný stav = ExperienceStatePackage  
- [ ] Architecture review PASS (čeká)

---

## Pipeline po PASS

```
Knowledge Layer
        │
AI Gateway
        │
Personalization
        │
Decision Orchestrator
        │
Experience Module Coordinator
        │
Experience State Manager
        │
Experience Modules
```
