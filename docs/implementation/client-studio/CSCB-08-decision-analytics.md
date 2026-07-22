# CSCB-08 — Decision Analytics

| Field | Value |
| --- | --- |
| **Capability** | CSCB-08 — Decision Analytics |
| **Status** | **DONE** |
| **Date** | 2026-07-22 |
| **Commits** | `feat(client-studio): implement decision analytics` · schema hardening |

---

## Implementation summary

Decision Analytics is a **passive observational layer**. It records structured events for product improvement and never mutates Runtime, personalizes the session, or scores leads.

```text
Decision Journey
        │
        ▼
User Behaviour + Runtime DecisionEvents
        │
        ▼
Analytics Events (collector)
        │
        ▼
Analytics Adapter (transport only)
        │
        ▼
External Analytics (GA4 / PostHog / Mixpanel / API)
```

---

## Event taxonomy

| Family | Types |
| --- | --- |
| Lifecycle | `journey.started`, `journey.resumed`, `journey.completed`, `journey.abandoned` |
| Surfaces | `surface.entered`, `surface.exited` (+ dwellMs) |
| Runtime | `runtime.signal` (canonical `DecisionEvent` type + payload) |
| Decision presentation | `terminal.viewed`, `story.viewed` |
| AI (metadata only) | `ai.session.opened`, `ai.interaction`, `ai.session.ended` |
| Commercial | `conversion.started`, `conversion.form.opened`, `conversion.consent.accepted`, `conversion.completed`, `conversion.cancelled` |

Surfaces: `hero`, `property-explorer`, `walkthrough`, `priority-experience`, `decision-terminal`, `ai-advisor`, `audit-lead-capture`.

---

## Analytics schema (envelope)

Every event includes:

| Field | Meaning |
| --- | --- |
| `sessionId` | Analytics session id |
| `decisionSessionId` | Runtime journey id (`objectId:createdAt`) |
| `type` | Event type |
| `at` | Timestamp (ms) |
| `surfaceId` | Current / related Experience Surface (nullable) |
| `runtimeContextRef` | Optional `{ terminalId, storyId, activeRoomId, objectId }` — **not** a state dump |

---

## Exported payload examples

```json
{
  "type": "journey.started",
  "sessionId": "analytics-m1abc",
  "decisionSessionId": "decision-session:pending",
  "at": 1721660000000,
  "surfaceId": null,
  "runtimeContextRef": null
}
```

```json
{
  "type": "runtime.signal",
  "sessionId": "analytics-m1abc",
  "decisionSessionId": "house-modern-01:1",
  "at": 1721660001200,
  "surfaceId": "walkthrough",
  "runtimeContextRef": {
    "terminalId": "terminal:…",
    "storyId": "story:…",
    "activeRoomId": "room-living",
    "objectId": "house-modern-01"
  },
  "runtimeEventType": "RoomSelected",
  "payload": { "roomId": "room-living", "floor": "0" }
}
```

```json
{
  "type": "ai.interaction",
  "sessionId": "analytics-m1abc",
  "decisionSessionId": "house-modern-01:1",
  "at": 1721660005400,
  "surfaceId": "ai-advisor",
  "runtimeContextRef": { "terminalId": "…", "storyId": "…", "activeRoomId": "…", "objectId": "…" },
  "questionCategory": "why-recommendation",
  "responseGenerated": true,
  "clarificationRequested": false,
  "conversationLength": 4
}
```

Prompt / response **bodies are never stored**.

---

## Adapter interface

```ts
type AnalyticsExportAdapter = {
  name: string
  exportEvent(event: AnalyticsEvent): void
  flush?(): void
}
```

Built-ins: `memory`, `console`, `composite`.  
Production destinations (GA4, PostHog, Mixpanel, internal API) implement the same interface — transport only.

---

## Modules

| Path | Role |
| --- | --- |
| `analytics/types.ts` | Schema + taxonomy |
| `analytics/createCollector.ts` | Passive collector |
| `analytics/exportAdapter.ts` | Export boundary + metrics |
| `analytics/DecisionAnalyticsProvider.tsx` | Context + lifecycle (resume/abandon) |
| `analytics/JourneySurfaceObserver.tsx` | Surface dwell |
| Provider `dispatch` wrap | `observeDispatch` after success |

---

## Acceptance checklist

- [x] Lifecycle events (started / resumed / completed / abandoned)  
- [x] Experience Surface events + dwell  
- [x] Runtime interaction events (canonical DecisionEvents)  
- [x] AI metadata only  
- [x] Commercial funnel events  
- [x] Export adapter interface  
- [x] Runtime behaviour unchanged  

---

## Validation

| Check | Result |
| --- | --- |
| Typecheck | **PASS** |
| Tests | **PASS** — 52/52 |

---

## Follow-up

- Production warehouse / GA4 adapter (ops / CSCB-09)  
- Next: **CSCB-09 — Production Readiness**
