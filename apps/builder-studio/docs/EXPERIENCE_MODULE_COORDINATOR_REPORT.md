# EPIC-BLD-33 — Experience Module Coordinator Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-34)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Experience Module Coordinator řídí životní cyklus modulů Experience během Decision Session (Hero → Market Pulse → House Navigator → Priority → FAQ → AI Advisor → Lead Capture). Nevytváří Knowledge, Story, AI Context, Personalization ani business logiku modulů — pouze koordinuje jejich lifecycle.

```
Decision Orchestrator
        │
Experience Module Coordinator
        │
Experience Modules
```

Odděluje rozhodovací tok od prezentačního toku modulů.

---

## Commit před zahájením

Prompt požadoval commit Decision Orchestrator. Ten byl již v historii (`f20aeed`). Uncommitted byl EPIC-BLD-32:

| Commit | Obsah |
| --- | --- |
| `839fc49` | `feat(builder): implement experience runtime orchestrator` (EPIC-BLD-32) |

---

## ExperienceModuleCoordinator

| Method | Role |
| --- | --- |
| `initialize()` | Seed module executions as Pending |
| `activateModule()` | Set one Active module |
| `deactivateModule()` | Deactivate Active module |
| `transition()` | Complete current → next Pending |
| `complete()` | Mark all Completed + Published |
| `dispose()` | Disposed status |

---

## Models

- **ExperienceModuleExecution** — id, sessionId, moduleId, status, startedAt, completedAt, metadata  
- **ModuleTransition** — fromModule, toModule, reason, timestamp, metadata (auditovatelná)  
- **ExperienceModulePackage** — id, version, modules, transitions, metadata (+ validation)

---

## ModuleExecutionStrategy / Validator / Index

**ModuleExecutionStrategy** — `supports()` / `nextModule()` / `transition()`  

**BasicModuleExecutionStrategy** — deterministická sekvence ObjectModuleId  

**ModuleExecutionValidator** — validate / validateTransitions / validateState / validateSequence  

**ModuleExecutionIndex** — index / find / list / rebuild  

---

## Experience Modules Overview

Sekce Builderu `experience-modules` (nav **Modules**):

- Active Module / Completed Modules / Pending Modules / Transition History / Validation / Events  
- Initialize / Activate / Transition / Complete / Validate / Dispose  
- `data-testid="experience-modules-overview"`  
- Pouze diagnostická projekce  

---

## Events

| Event | When |
| --- | --- |
| `ModuleActivated` | activate / transition to next |
| `ModuleTransitioned` | activate (swap) / deactivate / transition |
| `ModuleCompleted` | complete / sequence end |
| `ModuleValidated` | validate |

---

## API

`createExperienceModuleCoordinatorApi(coordinator)`:

- `activateModule()`
- `transitionModule()`
- `completeModule()`
- `listModules()`
- `validateModules()`

---

## Screenshot

`apps/builder-studio/docs/bld-33-experience-modules-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (150) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| ExperienceModulePackage.modules | + `transitions[]` on package | Overview Transition History |
| Package | + `validation`, timestamps | Overview Validation surface |
| Demo module sequence fallback | without Experience modules | Overview usable standalone |
| Commit body „decision orchestrator“ | commitnuto BLD-32 (`839fc49`) | Orchestrator již bylo commitnuto dříve |

---

## Architektonická kontrola — checklist

- [x] Nemění Knowledge / AI Context / Personalization / Story  
- [x] Neobsahuje logiku modulů / nepoužívá AI  
- [x] Pouze koordinace lifecycle modulů  
- [x] Publikovaný stav = ExperienceModulePackage  
- [ ] Architecture review PASS (čeká)

---

## Pipeline po PASS

```
Decision Orchestrator
        │
Experience Module Coordinator
        │
Experience Modules
        │
Hero / Priority / Navigator / FAQ / AI Advisor / Lead Capture
```
