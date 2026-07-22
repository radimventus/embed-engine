# MSCB-01 — Application Foundation

| Field | Value |
| --- | --- |
| **Capability** | MSCB-01 — Application Foundation |
| **Status** | **DONE** |
| **Date** | 2026-07-22 |
| **Commit** | `feat(manager-studio): implement application foundation` |
| **App** | `@embed-engine/manager-studio` |

---

## Implementation summary

Created Manager Studio as a new monorepo application: Operations Terminal shell on the certified Decision Session Runtime.

```text
Knowledge
    ↓
Runtime (certified)
    ↓
Operations Projection
    ↓
Manager Studio (AppShell + surfaces)
```

No Runtime package / API changes. No Client Studio imports.

---

## Delivered modules

**App scaffold**

- `apps/manager-studio/` — Vite + React + Tailwind + design tokens
- Dev `4175` / Preview `4176` (distinct from Client Studio)

**Foundation**

- `ErrorBoundary`, `AppShell`, `Workspace`
- `RuntimeBootstrapGate`, `StudioLoading`, `scrollToSection`, `useActiveSection`
- `DecisionSessionRuntimeProvider` — Context transport only (`operations` + `dispatch`)
- `projectOperationsOverview` — pure projection from Experience + Session

**Operations IA surfaces (foundation)**

| Surface | Section id |
| --- | --- |
| Live Overview | `live-overview` |
| Timeline | `timeline` |
| Active Journeys | `active-journeys` |
| Attention Queue | `attention-queue` |
| Operational Insights | `operational-insights` |
| Actions | `actions` |

Insights and Actions are explicit placeholders for later capabilities.

---

## Runtime interaction

| Concern | Behaviour |
| --- | --- |
| Bootstrap | Sole `createDecisionSessionRuntime` in Provider |
| Clock | Injected `createSystemClock()` (ED-DA-06) |
| Projection | `projectOperationsOverview` — no Interpretation exposure |
| Semantics | None composed in shell |
| Client Studio | No coupling |

---

## Validation

| Check | Result |
| --- | --- |
| Typecheck | **PASS** |
| Tests | **PASS** — 6/6 |
| Production build | **PASS** |
| Runtime API | Unchanged |

---

## Acceptance checklist

- [x] Single Runtime bootstrap
- [x] Single AppShell
- [x] Operations navigation consistent with Terminal IA
- [x] Loading + Error Boundary unified
- [x] Operations projection only (no invented semantics)
- [x] No Runtime API change
- [x] Independent from Client Studio app modules

---

## Follow-up

- MSCB-02 — Live Activity & Timeline depth
- Multi-session Journey Monitor (requires session registry — not Gen 1 foundation)
