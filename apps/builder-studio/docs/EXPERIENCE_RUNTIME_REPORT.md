# EPIC-BLD-32 — Experience Runtime Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-33)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Experience Runtime Orchestrator řídí průchod Experience podle připravených artefaktů (Session, Personalized Context, Story, Moves, Behavior, Modules). Nevytváří Knowledge, AI Context, Personalization ani Decision Story — pouze orchestruje jejich běh.

```
Decision Story
        │
Behavior Engine
        │
Personalized Context Package
        │
Experience Runtime Orchestrator
        │
Runtime Execution
```

Druhá generace Builder Studio — Execution Layer.

---

## Commit před zahájením

Prompt požadoval commit Personalization Runtime Engine. Ten byl již v historii (`356ed6d`). Uncommitted byl EPIC-BLD-31:

| Commit | Obsah |
| --- | --- |
| `f20aeed` | `feat(builder): implement decision orchestrator` (EPIC-BLD-31) |

---

## ExperienceRuntimeOrchestrator

| Method | Role |
| --- | --- |
| `initialize()` | Derive package id from session id |
| `start()` | Boot → first move + RuntimeExecutionPackage |
| `next()` | Advance story move / auto-complete on last |
| `previous()` | Step back one move |
| `jump()` | Jump to explicit move id |
| `complete()` | Force Completed + Published package |
| `dispose()` | Disposed status |

---

## Models

- **RuntimeExecution** — id, sessionId, storyId, currentStage, currentMove, status, transitions, startedAt, completedAt, metadata  
- **RuntimeTransition** — from, to, reason, timestamp, metadata (auditovatelná)  
- **RuntimeExecutionPackage** — id, version, execution, metadata (+ validation)

---

## RuntimeStrategy / Validator / Index

**RuntimeStrategy** — `supports()` / `transition()` / `resolveNext()`  

**BasicRuntimeStrategy** — deterministické next / previous / jump  

**RuntimeValidator** — validate / validateTransitions / validateStory / validateState  

**RuntimeIndex** — index / find / list / rebuild  

---

## Runtime Overview

Sekce Builderu `experience-runtime` (nav **Exp. Runtime**):

- Executions / Current Story / Current Move / Current Stage / Transition History / Validation / Events  
- Start Runtime / Previous / Next / Jump / Complete / Validate / Dispose  
- `data-testid="experience-runtime-overview"`  
- Pouze diagnostická projekce  

Poznámka: existující sekce `decision-runtime` (BLD-16) zůstává jako **Runtime**. Nová Experience orchestrace má nav **Exp. Runtime**, Overview eyebrow **Runtime**.

---

## Events

| Event | When |
| --- | --- |
| `RuntimeStarted` | start |
| `RuntimeTransitioned` | start / next / previous / jump / complete |
| `RuntimeCompleted` | next-to-end / complete |
| `RuntimeValidated` | validate |

---

## API

`createExperienceRuntimeApi(orchestrator)`:

- `startRuntime()`
- `nextMove()`
- `previousMove()`
- `jumpToMove()`
- `completeRuntime()`
- `listRuntimeExecutions()`
- `validateRuntime()`

---

## Screenshot

`apps/builder-studio/docs/bld-32-experience-runtime-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (145) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| Overview sekce „Runtime“ | section id `experience-runtime`, nav **Exp. Runtime** | Konflikt s existující BLD-16 sekcí `decision-runtime` (nav **Runtime**) |
| Validation type | `ExperienceRuntimeValidation` | Odlišení od Decision Runtime validation surfaces |
| Package | + `validation`, `createdAt`, `updatedAt` | Overview Validation surface |
| Demo Story / Session fallback | without prior Story/Session | Overview usable standalone |
| Commit body „personalization runtime“ | commitnuto BLD-31 (`f20aeed`) | Runtime engine již bylo commitnuto dříve |

---

## Architektonická kontrola — checklist

- [x] Nemění Knowledge Base / AI Context / Personalized Context  
- [x] Nevytváří Decision Story / nepoužívá AI / neinterpretuje  
- [x] Pouze řídí průchod Experience  
- [x] Publikovaný stav = RuntimeExecutionPackage  
- [ ] Architecture review PASS (čeká)

---

## Pipeline po PASS

```
Knowledge Base
        │
AI Decision Gateway
        │
Personalized Context Package
        │
Experience Runtime Orchestrator
        │
Decision Runtime
        │
Experience Modules
```
