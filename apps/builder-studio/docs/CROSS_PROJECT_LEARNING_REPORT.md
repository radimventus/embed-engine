# EPIC-BLD-15 — Cross-Project Learning Report

**Status:** Ready for architecture review  
**Commit:** deferred to start of EPIC-BLD-16 (on PASS)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Learning Package je **platformová** capability pro bezpečné učení z anonymizovaných poznatků. Není součástí Object Package ani AI Context. Žádné ML, AI, sync ani sdílení mezi firmami.

```
Platform Knowledge
        │
        ▼
Learning Package
    ├── Observations
    ├── Patterns
    └── Heuristics
```

---

## LearningPackage

| Field | Role |
| --- | --- |
| `id` | `learning-platform` |
| `version` | Authoring semver |
| `observations[]` | Anonymized observations |
| `patterns[]` | Data-only patterns |
| `heuristics[]` | Author heuristics |
| `metadata` | title, description, status |
| `timestamps` | createdAt / updatedAt |

Standalone — not on Object Package.

---

## Observation / Pattern / Heuristic

- **Observation** — origin, category, payload, confidence, `anonymized: true`
- **Pattern** — description, observation ids, confidence, status (Candidate/Active/Retired) — **no detection**
- **Heuristic** — title, description, scope, weight (Energy-first, FAQ-before-form, …)

---

## LearningOrigin

Catalog: Platform / Company / Object / Session — **původ poznatku**, ne Knowledge Layer.

---

## Learning Registry

Sections: Observations / Patterns / Heuristics.

---

## Learning Overview

Sekce Builderu `learning` (nav **Learning**):

- Origins, Observations, Patterns, Heuristics
- session historie
- `data-testid="learning-overview"`

---

## Learning Events

| Event | When |
| --- | --- |
| `ObservationRegistered` | register observation |
| `PatternRegistered` | register pattern |
| `HeuristicRegistered` | register heuristic |

---

## Learning API

`createLearningApi(service)`:

- `loadLearning()`
- `saveLearning()`
- `listPatterns()`

---

## Screenshot

`apps/builder-studio/docs/bld-15-learning-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (66) |
| build | pass |

### New tests
- Learning Origin + Registry catalog
- seeded LearningPackage + anonymized observations
- register observation / pattern / heuristic + events
- API load / save / listPatterns

---

## Odchylky od specifikace

| Spec | Implementace | Note |
| --- | --- | --- |
| Observation.metadata | + `anonymized: true` | Enforces safety rule in the model |
| LearningService | + register* authoring methods | Needed for Overview; still no ML/detection |
| Seed content | demo observations/patterns/heuristics | Builder preview parity with prior epics |

**Not implemented (by design):** AI, ML, analytics, Runtime, sync, federation, company data sharing, Decision Engine, automatic learning.

---

## Target architecture after BLD-15

```
Project → Object Package → Experience / Knowledge / Decision
                → Knowledge Layers → AI Context Builder

Platform → Learning Package → Observations / Patterns / Heuristics
```

---

Čeká na architektonickou kontrolu. Commit za EPIC-BLD-15 vznikne na začátku EPIC-BLD-16 při PASS.
