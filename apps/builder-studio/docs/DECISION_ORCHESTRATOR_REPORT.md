# EPIC-BLD-31 — Decision Orchestrator Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-32)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Decision Orchestrator řídí průchod Decision Experience. Koordinuje Runtime Session, Personalization Package, Behavior Engine, Decision Story a Experience Runtime. Nevytváří Knowledge, AI Context ani Personalization — pouze orchestruje.

```
Decision Story
        │
Behavior Engine
        │
Personalization Package
        │
Decision Orchestrator
        │
Decision Execution
```

Začátek druhé generace Builder Studio — Execution Layer.

---

## Commit před zahájením

Prompt požadoval commit Personalization Engine. Ten byl již v historii (`eea6bb2`). Uncommitted byl EPIC-BLD-30:

| Commit | Obsah |
| --- | --- |
| `356ed6d` | `feat(builder): implement personalization runtime engine` (EPIC-BLD-30) |

---

## DecisionOrchestrator

| Method | Role |
| --- | --- |
| `initialize()` | Derive package id from session id |
| `start()` | Strategy → Decision Execution Package (Boot) |
| `advance()` | Next story move / auto-complete on last |
| `transition()` | Explicit Transition stage + next move |
| `complete()` | Force Completed + Published package |
| `dispose()` | Disposed status |

---

## Models

- **DecisionExecution** — id, sessionId, storyId, currentMove, state, stages, startedAt, completedAt, metadata  
- **DecisionStage** — id, type (Boot/Active/Transition/Complete), status, timestamps, metadata  
- **DecisionExecutionPackage** — id, version, execution, metadata (+ validation)

---

## DecisionFlowStrategy / Validator / Index

**DecisionFlowStrategy** — `supports()` / `next()` / `transition()`  

**BasicDecisionFlowStrategy** — sekvenční story moves, deterministické  

**DecisionExecutionValidator** — validate / validateState / validateTransitions / validateConsistency  

**DecisionExecutionIndex** — index / find / list / rebuild  

---

## Decision Runtime Overview

Sekce Builderu `decision-orchestrator` (nav **Orchestrator**):

- Executions / Current Stage / Current Move / Runtime State / Validation / Events  
- Start Execution / Advance / Transition / Complete / Validate / Dispose  
- `data-testid="decision-orchestrator-overview"`  
- Pouze diagnostická projekce  

Poznámka: existující sekce `decision-runtime` (BLD-16 RuntimeModel) zůstává jako **Runtime**. Nová orchestrace má nav **Orchestrator**, Overview eyebrow **Decision Runtime**.

---

## Events

| Event | When |
| --- | --- |
| `DecisionExecutionStarted` | start |
| `DecisionStageChanged` | start / advance / transition / complete |
| `DecisionExecutionCompleted` | advance-to-end / transition-to-end / complete |
| `DecisionExecutionValidated` | validate |

---

## API

`createDecisionOrchestratorApi(orchestrator)`:

- `startExecution()`
- `advanceExecution()`
- `completeExecution()`
- `listExecutions()`
- `validateExecution()`

---

## Screenshot

`apps/builder-studio/docs/bld-31-decision-orchestrator-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (140) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| Overview sekce „Decision Runtime“ | section id `decision-orchestrator`, nav **Orchestrator** | Konflikt s existující BLD-16 sekcí `decision-runtime` (nav **Runtime**) |
| DecisionExecution fields | + `stages[]` | Overview Current Stage + Transition audit |
| Package | + `validation`, `createdAt`, `updatedAt` | Overview Validation surface |
| Demo Story / Session fallback | without prior Story/Session | Overview usable standalone |
| Commit body „personalization engine“ | commitnuto BLD-30 (`356ed6d`) | Engine již bylo commitnuto dříve |

---

## Architektonická kontrola — checklist

- [x] Nemění Knowledge Base / AI Context / Personalization  
- [x] Negeneruje Decision Story / nevytváří Knowledge  
- [x] Pouze řídí průchod Decision Experience  
- [x] Publikovaný stav = DecisionExecutionPackage  
- [ ] Architecture review PASS (čeká)

---

## Pipeline po PASS

```
Knowledge Base
        │
AI Decision Gateway
        │
Personalization Package
        │
Decision Orchestrator
        │
Decision Runtime
        │
Experience Runtime
```
