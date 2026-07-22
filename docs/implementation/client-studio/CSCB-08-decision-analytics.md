# CSCB-08 — Decision Analytics

| Field | Value |
| --- | --- |
| **Capability** | CSCB-08 — Decision Analytics |
| **Status** | **DONE** |
| **Date** | 2026-07-22 |
| **Commit** | `feat(client-studio): implement decision analytics` |

---

## Implementation summary

Decision Analytics is a **passive observational layer** over the Decision Journey.

It records structured events for product improvement and never:

- mutates Runtime,
- personalizes the session,
- scores leads,
- feeds conclusions back into Interpretation.

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
Export Adapter (memory / console / composite)
        │
        ▼
External Analysis (out of Client Studio)
```

---

## Event model

| Type | Source |
| --- | --- |
| `journey.started` / `journey.completed` | Analytics session lifecycle |
| `surface.entered` / `surface.exited` | IntersectionObserver on `PILOT_SECTION_IDS` |
| `runtime.signal` | Successful `dispatch` → canonical `DecisionEvent` |
| `terminal.viewed` | First successful dispatch (Terminal present) |
| `ai.session.opened` | AI Advisor mount |
| `ai.interaction` | Metadata only (category, length, flags) — **no** prompt/response body |
| `conversion.started` / `conversion.completed` | Commercial CTA + mailto success |

---

## Modules

| Path | Role |
| --- | --- |
| `analytics/types.ts` | Event + metrics types |
| `analytics/createCollector.ts` | Passive collector |
| `analytics/exportAdapter.ts` | Export interface + memory/console/composite |
| `analytics/DecisionAnalyticsProvider.tsx` | React context |
| `analytics/JourneySurfaceObserver.tsx` | Surface enter/exit |
| `DecisionSessionRuntimeProvider.tsx` | Passive `observeDispatch` after success |
| `ClientStudioPage.tsx` | Mount Analytics provider + observer |

---

## Export boundary

```ts
type AnalyticsExportAdapter = {
  name: string
  exportEvent(event: AnalyticsEvent): void
  flush?(): void
}
```

Default: in-memory sink (+ console in Vite `import.meta.env.DEV`).

Destinations (DB, warehouse, dashboards) are **outside** Client Studio — plug a new adapter.

---

## Session metrics

`deriveSessionMetrics` / `collector.getMetrics()` exposes:

- duration,
- surface enter counts + dwell ms,
- runtime signal counts,
- terminal / AI / conversion counters,
- journey completion flag.

---

## Acceptance checklist

- [x] Canonical events emitted  
- [x] Journey metrics captured  
- [x] Runtime semantics unchanged  
- [x] Pipeline passive (no feedback loop)  
- [x] Export interface documented  

---

## Validation

| Check | Result |
| --- | --- |
| Typecheck | **PASS** |
| Tests | **PASS** — 51/51 |

---

## Follow-up

- Wire production warehouse adapter (ops / CSCB-09)  
- Optional ADR if non-React hosts need Runtime-level subscribe  
- Next: **CSCB-09 — Production Readiness**
