# EPIC-BLD-12 — Decision Knowledge Report

**Status:** Ready for architecture review  
**Commit:** deferred to start of EPIC-BLD-13 (on PASS)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Decision Knowledge je autorský model **interpretace** znalostí při rozhodování. Není Knowledge Package, není AI, není Runtime, není evaluace Rules ani skládání Decision Story.

```
Project → Object Package
            ├── Experience Package
            ├── Knowledge Package        ← Co o objektu víme?
            └── Decision Knowledge       ← Jak to interpretovat při rozhodování?
                    ├── Rules
                    ├── Signals
                    ├── Priorities
                    └── Strategies
```

---

## DecisionKnowledgePackage

`DecisionKnowledgePackage` — součást Object Package (`ObjectPackage.decisionKnowledge`).

| Field | Role |
| --- | --- |
| `id` | Canonical id (`decision-${objectId}`) |
| `objectId` | Link to Object Package |
| `version` | Authoring semver |
| `decisionRules[]` | Data-only rules |
| `decisionSignals[]` | Signal definitions |
| `priorities[]` | Registered PriorityIds |
| `strategies[]` | Author strategies (not Runtime) |
| `metadata` | title, description, status |
| `timestamps` | createdAt / updatedAt |

---

## DecisionKnowledgeService

`createDecisionKnowledgeService()`:

| Method | Role |
| --- | --- |
| `create` / `load` / `loadByObject` | Lifecycle read/create |
| `update` / `save` / `archive` | Authoring lifecycle |
| `addRule` / `addSignal` / `addStrategy` | Author mutations |
| `registerPriority` / `unregisterPriority` | Priority registration |
| `getEvents` / `getHistory` | Session history |

Harmony demo object je seednut Rules / Signals / Strategies. Žádná evaluace.

---

## Rule / Signal / Strategy models

- **DecisionRule** — condition, outcome, priority, weight, metadata (data only)
- **DecisionSignal** — source (`priority` \| `faq` \| `navigation` \| `ai` \| `form`), type, importance, tags
- **DecisionStrategy** — title, description, targetSignals[] — **not** Runtime Strategy / Decision Story

---

## Priority Registry

Katalog (10): Energy, Layout, Privacy, Investment, Quality, Design, Maintenance, Flexibility, OperatingCosts, Land.

Pouze katalog — bez evaluation.

---

## Decision Overview

Sekce Builderu `decision` (nav **Decision**):

- Rules / Signals / Priorities / Strategies přehled
- session historie eventů
- `data-testid="decision-overview"`

---

## Decision Events

| Event | When |
| --- | --- |
| `RuleAdded` | add rule |
| `SignalAdded` | add signal |
| `StrategyAdded` | add strategy |
| `PriorityRegistered` | register priority (incl. seed) |

Session-only (max 40). No persistence.

---

## Decision API

`createDecisionKnowledgeApi(service)`:

- `loadDecisionKnowledge()`
- `saveDecisionKnowledge()`
- `updateDecisionKnowledge()`

---

## Screenshot

`apps/builder-studio/docs/bld-12-decision-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (53) |
| build | pass |

### New tests
- seeded Decision Knowledge Package + PriorityRegistered events
- rule / signal / strategy / priority authoring + events
- Decision API load/save/update + archive
- Priority Registry catalog (10)

---

## Odchylky od specifikace

| Spec | Implementace | Note |
| --- | --- | --- |
| DecisionKnowledgePackage fields | + `objectId` | Needed for Object Package linkage (same pattern as Knowledge) |
| DecisionSignal | + `label` | Overview display without inventing UI copy from id |
| DecisionKnowledgeService | + `addRule` / `addSignal` / `addStrategy` / `registerPriority` | Needed for Overview authoring actions; still no evaluation |
| unregisterPriority | present | UI toggle; no dedicated event (only PriorityRegistered) |

**Not implemented (by design):** Decision Engine, rule evaluation, Behavior Packs, Decision Story, Interpretation Engine, AI orchestration, Runtime execution.

---

## Layer separation

| Layer | Question |
| --- | --- |
| Knowledge Package | Co o objektu víme? |
| Decision Knowledge | Jak máme tyto znalosti interpretovat při rozhodování? |
| AI Context (BLD-13+) | Jaké informace má AI dostat pro relaci/dotaz? |

---

Čeká na architektonickou kontrolu. Commit za EPIC-BLD-12 vznikne na začátku EPIC-BLD-13 při PASS.
