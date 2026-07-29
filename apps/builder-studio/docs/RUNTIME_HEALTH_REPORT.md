# EPIC-BLD-37 — Runtime Health Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-38)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Runtime Health & Diagnostics Engine rozšiřuje **Production Layer** o deterministickou diagnostiku zdraví Runtime. Vyhodnocuje Overall Health, Session / Module Health, State / Transition Consistency a Validation Summary. Nevytváří Runtime, State, Knowledge, AI ani Decision Story.

```
Execution Layer
        │
────────────────────────
Production Layer
        │
Observability
        │
Runtime Health
```

Health konzumuje data z Observability (a volitelně State), ale nic neřídí.

---

## Commit před zahájením

Prompt požadoval commit „refine experience state manager“. To bylo již v historii (`3b0540a`). Uncommitted byl EPIC-BLD-36:

| Commit | Obsah |
| --- | --- |
| `c17ed1a` | `feat(builder): implement runtime observability engine` (EPIC-BLD-36) |

---

## RuntimeHealthEngine

| Method | Role |
| --- | --- |
| `initialize()` / `inspect()` | Evaluate input → health package |
| `evaluate()` | Re-run deterministic evaluation |
| `summarize()` | overallHealth / score / warning+error counts |
| `publish()` | Publish diagnostic package (valid only) |
| `dispose()` | Archive package status |

---

## Models

- **RuntimeHealthReport** — id, sessionId, runtimeExecutionId, overallHealth, warnings, errors, findings, score, createdAt, metadata  
- **DiagnosticFinding** — id, severity, category, description, source, timestamp, metadata  
- **RuntimeHealthPackage** — id, version, report, metadata (+ validation)

---

## HealthEvaluationStrategy

**HealthEvaluationStrategy** — `supports()` / `evaluate()`  

**BasicHealthEvaluationStrategy** — deterministická pravidla (bez AI)

---

## RuntimeHealthValidator / Index

**RuntimeHealthValidator** — validate / validateReport / validateFindings / validateScore  

**RuntimeHealthIndex** — index / find / list / rebuild  

---

## Health Overview

Sekce Builderu `runtime-health` (nav **Health**):

- Overall Health / Runtime Score / Active Warnings / Active Errors / Validation / Findings Timeline / Events  
- Inspect Runtime / Validate / Publish / Dispose  
- `data-testid="health-overview"`  
- Pouze diagnostická projekce  

Inspect čte Observability metrics (s demo fallback), nikdy nevolá mutující Runtime/State API.

---

## Events

| Event | When |
| --- | --- |
| `RuntimeHealthCalculated` | inspect / initialize / evaluate |
| `DiagnosticFindingCreated` | each finding |
| `RuntimeHealthPublished` | publish |
| `RuntimeHealthValidated` | analyze / validate |

---

## API

`createRuntimeHealthApi(engine)`:

- `inspectRuntime()`
- `publishHealth()`
- `previewHealth()`
- `listHealthReports()`
- `validateHealth()`

---

## Screenshot

`apps/builder-studio/docs/bld-37-health-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (167) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| RuntimeHealthReport | + `findings[]` vedle warnings/errors | Findings Timeline Overview |
| RuntimeHealthPackage | + validation, timestamps, status | Overview Validation + Publish/Dispose |
| initialize vs inspect | both build the same package | Spec lists both; inspect is the primary API surface |
| No Prometheus / OTel / AI / self-healing | not implemented | Explicit exclusion |
| Commit body „refine experience state manager“ | commitnuto BLD-36 (`c17ed1a`) | State refine již bylo commitnuto dříve |

---

## Architektonická kontrola — checklist

- [x] Nikdy nemění Runtime / State / Knowledge  
- [x] Neovlivňuje Execution  
- [x] Nepoužívá AI  
- [x] Čistě diagnostický / read-only  
- [x] Využívá Observability data bez zásahu do Runtime  
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
────────────────────────
Production Layer
        │
Observability
        │
Runtime Health
```
