# EPIC-BLD-45 — Runtime Recovery Coordinator Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-46)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Runtime Recovery Coordinator uzavírá recovery subsystem. Zakládá **Recovery Session**, sleduje průběh referencovaných Recovery Execution a publikuje **Recovery Summary**. Nevytváří Plan / Sequence / Execution a nevykonává kroky.

```
Recovery Execution → Recovery Session → Recovery Summary
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `192fc71` | `feat(builder): implement runtime recovery executor` (EPIC-BLD-44) |

Poznámka: Prompt BLD-45 obsahoval copy-paste commit body Orchestrator (již `197ee94`). Commitnut byl skutečný předchozí EPIC — Recovery Executor.

---

## RuntimeRecoveryCoordinator

| Method | Role |
| --- | --- |
| `initialize()` | Create CREATED Recovery Session package |
| `startRecovery()` | Mark RUNNING and coordinate refs |
| `trackProgress()` | Update execution refs / progress |
| `completeRecovery()` | Finalize session + Recovery Summary |
| `publish()` / `dispose()` | Publish or archive package |

---

## Models

- **RecoverySession** — id, runtimeExecutionId, status, executions, startedAt, completedAt, metadata  
- **RecoverySummary** — id, sessionId, completedExecutions, failedExecutions, duration, finalStatus, metadata  
- **RuntimeRecoverySummaryPackage** — id, version, session, summary, metadata (+ validation)

Statuses: `CREATED` | `RUNNING` | `COMPLETED` | `FAILED` | `CANCELLED`

---

## RecoveryCoordinationStrategy

**RecoveryCoordinationStrategy** — `supports()` / `coordinate()` / `finalize()`  

**BasicRecoveryCoordinationStrategy** — deterministická agregace execution refs → session state / summary

---

## RuntimeRecoveryCoordinatorValidator / Index

**RuntimeRecoveryCoordinatorValidator** — validate / validateSession / validateSummary / validateIntegrity  

**RuntimeRecoveryCoordinatorIndex** — index / find / list / rebuild  

---

## Recovery Coordinator Overview

Sekce Builderu `runtime-recovery-coordinator` (nav **Recovery Coordinator**):

- Recovery Session / Current Status / Executions / Progress / Final Summary / Validation / Events  
- Start Session / Complete / Validate / Publish / Dispose  
- `data-testid="recovery-coordinator-overview"`  
- Pouze diagnostická projekce  

---

## Events

| Event | When |
| --- | --- |
| `RecoverySessionStarted` | startRecovery |
| `RecoveryProgressUpdated` | startRecovery / trackProgress |
| `RecoveryCompleted` | completeRecovery |
| `RecoverySummaryPublished` | publish |

---

## API

`createRuntimeRecoveryCoordinatorApi(coordinator)`:

- `startRecoverySession()`
- `completeRecoverySession()`
- `publishRecoverySummary()`
- `listRecoverySessions()`
- `validateRecoverySession()`

---

## Screenshot

`apps/builder-studio/docs/bld-45-recovery-coordinator-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (214) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| RuntimeRecoverySummaryPackage | + `session` field, validation | Overview Session/Status + Validation |
| Execution refs | lightweight `{executionId,status,sequenceId}` | Coordinator never owns Execution objects |
| Demo bez Executor | COMPLETED demo execution ref | Overview použitelný standalone |
| Prompt commit body | Executor committed místo Orchestrator | Orchestrator již `197ee94` |

---

## Architektonická kontrola — checklist

- [x] Nevytváří Plan / Sequence / Execution  
- [x] Nevykonává Recovery kroky / nemění Runtime / nepoužívá AI  
- [x] Koordinuje pouze Recovery Session lifecycle  
- [x] Uzavírá recovery subsystem  
- [ ] Architecture review PASS (čeká)

---

## Pipeline po PASS

```
Runtime Resilience → Recovery Plan
        │
Runtime Recovery Orchestrator → Recovery Sequence
        │
Runtime Recovery Executor → Recovery Execution
        │
Runtime Recovery Coordinator → Recovery Summary
```
