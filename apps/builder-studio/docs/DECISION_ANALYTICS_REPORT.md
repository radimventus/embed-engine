# EPIC-BLD-21 — Decision Analytics Report

**Status:** Ready for architecture review  
**Commit:** deferred to start of EPIC-BLD-22 (on PASS)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Decision Analytics Engine sbírá průběh Runtime Session / Behavior do `AnalyticsSession` + `AnalyticsSnapshot`. Neoptimalizuje, nepersonalizuje, neučí se a nepoužívá AI.

```
Decision Story
        │
        ▼
Runtime Session
        │
        ▼
Behavior Engine
        │
        ▼
Decision Analytics
        │
        ▼
Analytics Snapshot
```

Uzavírá první kompletní cyklus: Knowledge → Decision → Story → Runtime → Behavior → Analytics.

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `39d0485` | `feat(builder): implement behavior engine foundation` (EPIC-BLD-20) |

Poznámka: commit už existoval z předchozího běhu (body obsahovalo i BehaviorRule/BehaviorEvaluation). Nový commit se nevytvářel.

---

## DecisionAnalyticsEngine

| Method | Role |
| --- | --- |
| `initialize()` | Create AnalyticsSession |
| `record()` | Append AnalyticsEvent |
| `aggregate()` | Calculate AnalyticsMetric[] |
| `createSnapshot()` | Build AnalyticsSnapshot |
| `dispose()` | Drop session store |

---

## Models

- **AnalyticsSession** — id, runtimeSessionId, storyId, startedAt, completedAt, metadata  
- **AnalyticsEvent** — SessionStarted / SessionCompleted / MoveEntered / MoveExited / BehaviorEvaluated / BehaviorActionProposed / ValidationFailed / Timeout  
- **AnalyticsMetric** — completionRate, moveCount, averageMoveDuration, pauseCount, skippedMoves  
- **AnalyticsSnapshot** — session, events, metrics, summary, metadata (+ optional exportPayload)

---

## AnalyticsExporter / JsonAnalyticsExporter

Interface: `export()` / `serialize()`  
`JsonAnalyticsExporter` — JSON only.

---

## Analytics Overview

Sekce Builderu `analytics` (nav **Analytics**):

- Session / Events / Metrics / Snapshot / Export  
- Record Analytics / Aggregate / Export JSON / Dispose  
- `data-testid="analytics-overview"`  
- Diagnostika — žádné dashboardy

Vyžaduje Runtime Session (Session → Create/Start).

---

## Events

| Event | When |
| --- | --- |
| `AnalyticsCollected` | each `record()` |
| `MetricCalculated` | each metric in `aggregate()` |
| `SnapshotCreated` | `createSnapshot()` |
| `AnalyticsExported` | JSON export |

---

## API

`createDecisionAnalyticsApi(engine)`:

- `recordAnalytics()`
- `previewAnalytics()`
- `exportAnalytics()`
- `listAnalyticsEvents()`
- `listAnalyticsMetrics()`
- (+ `initializeAnalytics`, `createAnalyticsSnapshot` for Builder wiring)

---

## Screenshot

`apps/builder-studio/docs/bld-21-analytics-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (92) |
| build | pass |

### Tests
- JsonAnalyticsExporter serialize with `session`
- record → aggregate → createSnapshot → export + engine events
- API record / preview / export / listEvents / listMetrics / dispose

---

## Odchylky od specifikace

| Spec | Implementace | Note |
| --- | --- | --- |
| AnalyticsSnapshot | + `exportPayload`, `timestamps` | Overview export pane |
| API helpers | + initialize / createSnapshot | Needed for Builder diagnostic flow |
| Record button | initialize + record* + aggregate + snapshot | One diagnostic action |

**Not implemented (by design):** dashboardy, AI, ML, doporučení, automatická optimalizace, Personalization, Learning Pipeline.

---

Čeká na architektonickou kontrolu. Commit za EPIC-BLD-21 vznikne na začátku EPIC-BLD-22 při PASS.
