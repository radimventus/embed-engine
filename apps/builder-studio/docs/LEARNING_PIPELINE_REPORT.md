# EPIC-BLD-22 — Learning Pipeline Report

**Status:** Ready for architecture review  
**Commit:** deferred to start of EPIC-BLD-23 (on PASS)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Learning Pipeline převádí Analytics Snapshot do standardizovaného `LearningRecord`. Validuje, anonymizuje a transformuje — neprovádí analýzy, nevytváří heuristiky, neupravuje Runtime a nepoužívá AI.

```
Decision Analytics
        │
        ▼
Learning Pipeline
        │
        ▼
Learning Record
```

Zahajuje Knowledge Feedback Layer. Oddělené od existujícího Learning Package (BLD-15).

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `65627ab` | `feat(builder): implement decision analytics engine` (EPIC-BLD-21) |

---

## LearningPipeline

| Method | Role |
| --- | --- |
| `initialize()` | Create pipeline store |
| `ingest()` | Accept Analytics Snapshot payload |
| `validate()` | Structural validation |
| `anonymize()` | Strip identifiers |
| `transform()` | Create LearningRecord |
| `dispose()` | Drop pipeline store |

---

## Models / Services

- **LearningRecord** — id, sourceSnapshotId, sessionId, timestamp, events, metrics, metadata  
- **LearningValidationResult** — valid, errors, warnings, metadata  
- **LearningAnonymizer** — anonymize / stripIdentifiers / validatePrivacy  
- **LearningTransformer** — transform / normalize / createRecord (+ validate)  
- **LearningImportReport** — processed / accepted / rejected / warnings  

---

## Learning Overview

Sekce Builderu `learning-pipeline` (nav **Pipeline**):

- Snapshot / Validation / Transformation / Record / Import Report / Export  
- Import Analytics / Validate / Anonymize / Transform / Dispose  
- `data-testid="learning-pipeline-overview"`  

Vyžaduje Analytics Snapshot (Analytics → Record Analytics).

Nav **Pipeline** je oddělený od existující sekce **Learning** (Learning Package).

---

## Events

| Event | When |
| --- | --- |
| `LearningImported` | ingest |
| `LearningValidated` | validate / ingest |
| `LearningAnonymized` | anonymize |
| `LearningRecordCreated` | transform |

---

## API

`createLearningPipelineApi(pipeline)`:

- `importAnalytics()`
- `previewLearningRecord()`
- `validateLearning()`
- `exportLearningRecord()`
- (+ `transformLearning` for Builder wiring)

---

## Screenshot

`apps/builder-studio/docs/bld-22-learning-pipeline-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (96) |
| build | pass |

### New tests
- LearningAnonymizer strips identifiers
- LearningTransformer validate + createRecord
- ingest → anonymize → transform + lifecycle events
- API import / preview / validate / export / dispose

---

## Odchylky od specifikace

| Spec | Implementace | Note |
| --- | --- | --- |
| Nav label | **Pipeline** | Avoid clash with Learning Package section |
| API | + `transformLearning` | Explicit transform step in Builder |
| Commit body AnalyticsContext | Implemented as AnalyticsSession (BLD-21) | Naming from final BLD-21 spec |

**Not implemented (by design):** AI, ML, doporučení, scoring, Pattern Engine, Heuristic Engine, Knowledge Merge, Personalization, zápis do Learning Package.

---

Čeká na architektonickou kontrolu. Commit za EPIC-BLD-22 vznikne na začátku EPIC-BLD-23 při PASS.
