# EPIC-BLD-16 — Decision Engine Report

**Status:** Ready for architecture review  
**Commit:** deferred to start of EPIC-BLD-17 (on PASS)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Decision Engine Foundation sjednocuje vstupy (Knowledge, Decision Knowledge, Experience, Learning) do `DecisionModel` a strukturálního `DecisionGraph`. Nic nevyhodnocuje — žádný Runtime, AI, Story ani rule evaluation.

```
Knowledge
Decision Knowledge
Experience
Learning
        │
        ▼
Decision Engine
        │
        ▼
Decision Model → Decision Graph
```

---

## DecisionEngine

| Method | Role |
| --- | --- |
| `createDecisionModel` | Assemble model + graph |
| `loadDecisionModel` | Read |
| `validateDecisionModel` | Structural validation only |
| `dispose` | Mark Disposed |
| `previewDecisionGraph` | Graph preview |

---

## DecisionModel

`id`, `objectId`, `knowledge`, `decisionKnowledge`, `experience`, `learning`, `graph`, `metadata`, `validation`, `timestamps`

---

## DecisionInputResolver

`resolveKnowledge` / `resolveDecisionKnowledge` / `resolveExperience` / `resolveLearning` / `resolveAll` — načítá odkazy, nevyhodnocuje.

---

## DecisionGraph + Nodes

- **Graph:** `nodes[]`, `edges[]`, metadata  
- **Nodes:** KnowledgeNode, PriorityNode, RuleNode, SignalNode, ExperienceNode  

Bez algoritmů — pouze struktura.

---

## Decision Overview

Sekce Builderu `decision-engine` (nav **Engine**):

- Inputs / Nodes / Graph / Validation
- Build / Validate / Dispose
- `data-testid="decision-engine-overview"`

---

## Events

| Event | When |
| --- | --- |
| `DecisionModelCreated` | create |
| `DecisionGraphBuilt` | graph assembly |
| `DecisionModelValidated` | validate |

---

## API

`createDecisionEngineApi(engine)`:

- `buildDecisionModel()`
- `validateDecision()`
- `previewDecisionGraph()`

---

## Screenshot

`apps/builder-studio/docs/bld-16-decision-engine-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (71) |
| build | pass |

### New tests
- Input resolver (no evaluation)
- structural graph node types
- create + DecisionModelCreated / DecisionGraphBuilt
- validate + dispose
- API build / validate / preview

---

## Odchylky od specifikace

| Spec | Implementace | Note |
| --- | --- | --- |
| DecisionModel fields | + `graph`, `validation`, `timestamps` | Needed for Overview + validate lifecycle |
| Nav label | **Engine** (id `decision-engine`) | Avoid clash with Decision Knowledge tab |
| Graph edges | structural informs/feeds/contains links | Structure only — not evaluation semantics |

**Not implemented (by design):** Decision Story, Strategy Runner, Rule Engine, Runtime, AI, personalization, Behavior Engine, visitor session.

---

## Next path

- BLD-17 Rule Evaluation Engine  
- BLD-18 Decision Story Composer  
- BLD-19 Runtime Decision Engine  
- BLD-20 AI Decision Gateway  

---

Čeká na architektonickou kontrolu. Commit za EPIC-BLD-16 vznikne na začátku EPIC-BLD-17 při PASS.
