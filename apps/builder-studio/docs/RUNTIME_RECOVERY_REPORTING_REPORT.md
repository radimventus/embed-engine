# EPIC-BLD-46 — Runtime Recovery Reporting Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-47)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Runtime Recovery Reporting Engine uzavírá recovery subsystem finálním **Recovery Report**. Agreguje Recovery Session / Execution refs a publikuje neměnitelný report. Neřídí, nekoordinuje ani nevykonává Recovery.

```
Recovery Session → Recovery Report (final artifact)
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `56ea80f` | `feat(builder): implement runtime recovery coordinator` (EPIC-BLD-45) |

Poznámka: Prompt BLD-46 obsahoval copy-paste commit body Executor (již `192fc71`). Commitnut byl skutečný předchozí EPIC — Recovery Coordinator.

---

## RuntimeRecoveryReportingEngine

| Method | Role |
| --- | --- |
| `initialize()` / `generate()` | Collect inputs → Recovery Report package |
| `collect()` | Normalize aggregation input |
| `publish()` | Publish report package |
| `dispose()` | Archive package |

---

## Models

- **RecoveryReport** — id, runtimeExecutionId, sessionId, summary, executions, duration, finalStatus, createdAt, metadata  
- **RecoveryReportItem** — id, executionId, status, duration, description, metadata  
- **RuntimeRecoveryReportPackage** — id, version, report, metadata (+ validation)

Final status: `COMPLETED` | `FAILED` | `PARTIAL` | `UNKNOWN`

---

## RecoveryReportingStrategy

**RecoveryReportingStrategy** — `supports()` / `collect()` / `generate()`  

**BasicRecoveryReportingStrategy** — deterministická agregace session/execution refs → report

---

## RuntimeRecoveryReportingValidator / Index

**RuntimeRecoveryReportingValidator** — validate / validateReport / validateItems / validateIntegrity  

**RuntimeRecoveryReportingIndex** — index / find / list / rebuild  

---

## Recovery Reporting Overview

Sekce Builderu `runtime-recovery-reporting` (nav **Recovery Reporting**):

- Recovery Session / Executions / Final Status / Duration / Generated Report / Validation / Events  
- Generate Report / Validate / Publish / Dispose  
- `data-testid="recovery-reporting-overview"`  
- Pouze diagnostická projekce  

---

## Events

| Event | When |
| --- | --- |
| `RecoveryReportGenerated` | generate / initialize |
| `RecoveryReportIndexed` | package indexed |
| `RecoveryReportValidated` | validate |
| `RecoveryReportPublished` | publish |

---

## API

`createRuntimeRecoveryReportingApi(engine)`:

- `generateRecoveryReport()`
- `publishRecoveryReport()`
- `previewRecoveryReport()`
- `listRecoveryReports()`
- `validateRecoveryReport()`

---

## Screenshot

`apps/builder-studio/docs/bld-46-recovery-reporting-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (219) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| RuntimeRecoveryReportPackage | + validation, timestamps | Overview Validation + lifecycle |
| RecoveryReport.summary | string narrative | Spec lists summary; implemented as text summary |
| Demo bez Coordinator | COMPLETED demo execution item | Overview použitelný standalone |
| Prompt commit body | Coordinator committed místo Executor | Executor již `192fc71` |

---

## Architektonická kontrola — checklist

- [x] Neprovádí / nekoordinuje Recovery  
- [x] Nemění Runtime / nevytváří nové Recovery artefakty / nepoužívá AI  
- [x] Jediný účel = finální Recovery Report  
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
Runtime Recovery Coordinator → Recovery Session
        │
Runtime Recovery Reporting → Recovery Report
```
