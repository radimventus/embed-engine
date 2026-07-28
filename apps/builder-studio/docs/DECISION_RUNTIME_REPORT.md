# EPIC-BLD-16 — Decision Runtime Report

**Status:** Ready for architecture review  
**Commit:** deferred to start of EPIC-BLD-17 (on PASS)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Decision Runtime Foundation připravuje vykonatelnou reprezentaci z `DecisionModel`. Nic nevyhodnocuje, neinterpretuje, nepersistuje a nevytváří visitor session.

```
DecisionModel
        │
        ▼
Decision Runtime
        │
        ▼
Runtime Model → Runtime Graph + Runtime Context
```

---

## Commits před zahájením

| Commit | Obsah |
| --- | --- |
| `910ae4b` | Learning Foundation (už dříve) |
| `0f728aa` | Decision Engine Foundation (předchozí schválený EPIC před Runtime) |

Poznámka: prompt žádal znovu Learning commit — ten už existoval; commitnut byl Decision Engine jako skutečný předchozí EPIC.

---

## DecisionRuntime

| Method | Role |
| --- | --- |
| `createRuntime` | Project DecisionModel → RuntimeModel (Initialized) |
| `loadRuntime` | Read |
| `validateRuntime` | Structural validation → Ready |
| `dispose` | Disposed |
| `previewRuntime` | Preview |

---

## RuntimeModel / Context / Graph / State

- **RuntimeModel** — id, decisionModelId, status, graph, context, metadata  
- **RuntimeContext** — inputs, environment, configuration (`evaluateRules: false`, …)  
- **RuntimeGraph** — projected nodes/edges  
- **RuntimeState** — `Initialized` \| `Ready` \| `Disposed`

---

## Runtime Overview

Sekce Builderu `decision-runtime` (nav **Runtime**):

- State / Model / Context / Graph / Validation
- Create / Validate / Dispose
- `data-testid="decision-runtime-overview"`

Vyžaduje nejdřív Decision Model (Engine → Build Model).

---

## Events

| Event | When |
| --- | --- |
| `RuntimeCreated` | create |
| `RuntimeValidated` | validate |
| `RuntimeDisposed` | dispose |

---

## API

`createDecisionRuntimeApi(runtime)`:

- `createRuntime()`
- `loadRuntime()`
- `previewRuntime()`

---

## Screenshot

`apps/builder-studio/docs/bld-16-decision-runtime-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (74) |
| build | pass |

### New tests
- create → Initialized + projected graph
- validate → Ready + RuntimeValidated
- dispose → Disposed
- API create / load / preview

---

## Odchylky od specifikace

| Spec | Implementace | Note |
| --- | --- | --- |
| Epic number | Runtime navazuje na Decision Engine (`0f728aa`) | Oba byly v promptu jako BLD-16; Engine commitnut jako prior epic |
| RuntimeModel | + `validation`, `timestamps` | Lifecycle parity |
| Create flow | Depends on DecisionModel in session | Enforces DecisionModel → Runtime architecture |

**Not implemented (by design):** Rule Engine, Story, Behavior Engine, AI, Visitor Session, Analytics, evaluation.

---

## Next path

- BLD-17 Rule Evaluation Engine  
- BLD-18 Decision Story Composer  
- BLD-19 Runtime Session Engine  
- BLD-20 AI Decision Gateway  

---

Čeká na architektonickou kontrolu. Commit za tento EPIC vznikne na začátku dalšího EPIC při PASS.
