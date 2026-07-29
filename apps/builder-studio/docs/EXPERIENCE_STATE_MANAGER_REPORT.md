# EPIC-BLD-35 — Experience State Manager Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-36)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Experience State Manager je SSOT pro runtime stav Experience (Session / Runtime Execution / Module Execution / currentState / checkpoint / restore). Nevytváří Knowledge, Story, AI Context, Personalization, business logiku modulů ani orchestraci — pouze spravuje stav.

```
Decision Orchestrator
        │
Experience Runtime Orchestrator
        │
Experience Module Coordinator
        │
Experience State Manager
        │
Experience Modules
```

Uzavírá základní Execution Layer.

---

## Commit před zahájením

Prompt požadoval commit Experience Module Coordinator. Ten byl již v historii (`f92f87f`). Uncommitted byl EPIC-BLD-34:

| Commit | Obsah |
| --- | --- |
| `2ea3f1c` | `feat(builder): implement experience state manager` (EPIC-BLD-34) |

BLD-35 sjednocuje model a API na finální Execution-Layer kontrakt.

---

## ExperienceStateManager

| Method | Role |
| --- | --- |
| `initialize()` | Derive package id from session id |
| `createState()` | Create Active ExperienceStatePackage |
| `updateState()` | Patch runtime / module / currentState refs |
| `createCheckpoint()` | Persist auditable snapshot |
| `restore()` | Restore from checkpoint |
| `complete()` | Completed + Published package |
| `dispose()` | Disposed status |

---

## Models

- **ExperienceState** — id, sessionId, runtimeExecutionId, moduleExecutionId, currentState, checkpointId, status, timestamps, metadata  
- **ExperienceCheckpoint** — id, experienceStateId, snapshot, reason, createdAt, metadata  
- **ExperienceStatePackage** — id, version, state, checkpoints, metadata (+ validation)

---

## StatePersistenceStrategy / Validator / Index

**StatePersistenceStrategy** — `supports()` / `save()` / `restore()`  

**BasicStatePersistenceStrategy** — in-memory, bez DB / cloud / sync  

**ExperienceStateValidator** — validate / validateCheckpoint / validateExecution / validateConsistency  

**ExperienceStateIndex** — index / find / list / rebuild  

---

## Experience State Overview

Sekce Builderu `experience-state` (nav **State**):

- Active Session / Active Runtime / Active Module / Current State / Last Checkpoint / Validation / Events  
- Create State / Update / Checkpoint / Restore / Complete / Validate / Dispose  
- `data-testid="experience-state-overview"`  
- Pouze diagnostická projekce  

---

## Events

| Event | When |
| --- | --- |
| `ExperienceStateCreated` | createState |
| `ExperienceStateUpdated` | updateState / complete |
| `CheckpointCreated` | createCheckpoint |
| `ExperienceStateRestored` | restore |
| `ExperienceStateValidated` | validate |

---

## API

`createExperienceStateApi(manager)`:

- `createState()`
- `updateState()`
- `createCheckpoint()`
- `restoreState()`
- `listStates()`
- `validateState()`

---

## Screenshot

`apps/builder-studio/docs/bld-35-experience-state-overview-screenshot.png`

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
| metadata.activeModule / activeMove | diagnostic labels beside moduleExecutionId | Overview Active Module surface |
| Commit body „module coordinator“ | commitnuto BLD-34 (`2ea3f1c`) | Coordinator již bylo commitnuto dříve |
| BLD-34 vs BLD-35 | BLD-35 přejmenovává pole na runtimeExecutionId / moduleExecutionId / currentState / createCheckpoint | Spec alignment Closing Execution Layer |

---

## Architektonická kontrola — checklist

- [x] Nemění Knowledge / AI Context / Personalization / Story  
- [x] Neřídí Runtime / moduly / nepoužívá AI  
- [x] SSOT pro runtime stav + checkpoint/restore  
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
Experience Runtime Orchestrator
        │
Experience Module Coordinator
        │
Experience State Manager
        │
Experience Modules
```
