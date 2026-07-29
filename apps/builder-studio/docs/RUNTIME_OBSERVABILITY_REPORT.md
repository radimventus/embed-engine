# EPIC-BLD-36 — Runtime Observability Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-37)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Runtime Observability Engine zahajuje **Production Layer**. Poskytuje read-only diagnostiku běžící Experience (timeline, health, metrics, sessions, validation). Nevytváří Knowledge, Story, Personalization ani Runtime State a neřídí orchestraci.

```
Decision Orchestrator
        │
Experience Runtime
        │
Experience Modules
        │
Experience State
        │
────────────────────
Runtime Observability
```

Observability je příčně napojená vrstva — konzumuje události, nic neřídí.

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `3b0540a` | `feat(builder): implement experience state manager` (EPIC-BLD-35 alignment) |

Prompt požadoval commit Experience State Manager; BLD-34 bylo již `2ea3f1c`, uncommitted BLD-35 alignment commitnuto jako `3b0540a`.

---

## RuntimeObservabilityEngine

| Method | Role |
| --- | --- |
| `initialize()` / `collect()` | Collect runtime event sources → package |
| `aggregate()` | Recalculate metrics from timeline |
| `analyze()` | Validate package |
| `publish()` | Publish diagnostic package (valid only) |
| `dispose()` | Archive package status |

---

## Models

- **RuntimeObservation** — id, sessionId, executionId, moduleId, event, timestamp, metadata  
- **RuntimeTimeline** — id, sessionId, events, startedAt, updatedAt, metadata  
- **RuntimeObservabilityPackage** — id, version, timeline, metrics, metadata (+ validation)

---

## ObservationCollector

**ObservationCollector** — `supports()` / `collect()`  

**BasicObservationCollector** — maps source events to observations (sorted), read-only  

---

## RuntimeObservabilityValidator / Index

**RuntimeObservabilityValidator** — validate / validateTimeline / validateMetrics / validateIntegrity  

**RuntimeObservabilityIndex** — index / find / list / rebuild  

---

## Observability Overview

Sekce Builderu `observability` (nav **Observability**):

- Runtime Timeline / Runtime Health / Runtime Metrics / Active Sessions / Validation / Events  
- Collect Runtime / Validate / Publish / Dispose  
- `data-testid="observability-overview"`  
- Pouze diagnostická projekce  

Collect čte existující session event histories (experience-runtime / modules / state / decision-orchestrator); při prázdné historii použije demo fallback — nikdy nevolá mutující API.

---

## Events

| Event | When |
| --- | --- |
| `RuntimeObserved` | collect / initialize |
| `TimelineUpdated` | collect / initialize |
| `MetricsCalculated` | collect / aggregate |
| `ObservabilityPublished` | publish |
| `ObservabilityValidated` | analyze / validate |

---

## API

`createRuntimeObservabilityApi(engine)`:

- `collectRuntime()`
- `publishObservability()`
- `previewObservability()`
- `listObservations()`
- `validateObservability()`

---

## Screenshot

`apps/builder-studio/docs/bld-36-observability-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (161) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| RuntimeObservabilityPackage | + validation, timestamps, status | Overview Validation + Publish/Dispose |
| RuntimeMetrics | structured health/counts | Overview Health / Metrics |
| initialize vs collect | both build the same package | Spec lists both; collect is the primary API surface |
| No OTel / Prometheus / Grafana / AI | not implemented | Explicit exclusion |

---

## Architektonická kontrola — checklist

- [x] Nikdy nemění Runtime / State / Knowledge  
- [x] Neovlivňuje orchestraci  
- [x] Nepoužívá AI  
- [x] Čistě pasivní / read-only  
- [x] Production Layer oddělena od Execution Layer  
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
Execution Layer
        │
Production Layer
        │
Runtime Observability
```
