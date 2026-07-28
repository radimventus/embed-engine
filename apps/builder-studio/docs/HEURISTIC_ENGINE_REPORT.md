# EPIC-BLD-26 — Heuristic Engine Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Heuristic Engine čte Pattern Collection, odvozuje rozhodovací heuristiky s pravidly, validuje konzistenci a publikuje Heuristic Catalog. Nevytváří Knowledge Layer, nepoužívá AI a nemění Pattern Collection / Learning Package / Runtime.

```
Pattern Collection
        │
        ▼
Heuristic Engine
        │
        ▼
Heuristic Catalog
```

Druhá vrstva Knowledge Intelligence: Patterns → **Heuristics**.

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `54e0185` | Pattern Extraction Engine (už dříve) |
| `aebf539` | `feat(builder): implement pattern intelligence engine` (skutečný předchozí necommitnutý EPIC) |

Poznámka: prompt žádal Pattern Extraction commit — ten už existoval (`54e0185`). Commitnut byl Pattern Intelligence (BLD-25) dle Commit Strategy.

---

## HeuristicEngine

| Method | Role |
| --- | --- |
| `initialize()` | Derive catalog id from collection id |
| `derive()` | Deriver → HeuristicCatalog + HeuristicDerived |
| `validate()` | Validator + Validated status |
| `publish()` | Require valid → Published catalog v1.0.0 |
| `dispose()` | Disposed status |

---

## Models

- **DerivedHeuristic** — id, name, description, confidence, priority, sourcePatterns, rules, createdAt, metadata  
  *(TypeScript name avoids clash with BLD-15 `Heuristic`)*  
- **HeuristicRule** — id, condition, outcome, weight, metadata  
- **HeuristicCatalog** — id, version, heuristics, createdAt, updatedAt, metadata, validation  

---

## HeuristicDeriver / Validator / Index

**BasicHeuristicDeriver** — one heuristic per pattern (+ multi-source reinforcement rules) + aggregate when ≥2 patterns  

**HeuristicValidator** — validate / validateRules / validateConfidence  

**HeuristicIndex** — index / find / list / rebuild  

---

## Heuristic Overview

Sekce Builderu `heuristic-engine` (nav **Heuristics**):

- Catalog / Heuristics / Rules / Confidence / Index / Validation  
- Derive / Validate / Publish Catalog / Dispose  
- `data-testid="heuristic-engine-overview"`  

Odděleno od BLD-15 **Learning** (observations/patterns/heuristics).

---

## Events

| Event | When |
| --- | --- |
| `HeuristicDerived` | derive |
| `HeuristicValidated` | validate / publish blocked |
| `HeuristicPublished` | publish success |
| `HeuristicIndexed` | index write after mutate |

---

## API

`createHeuristicEngineApi(engine)`:

- `deriveHeuristics()`
- `publishHeuristics()`
- `previewHeuristics()`
- `listHeuristics()`
- `validateHeuristics()`

---

## Screenshot

`apps/builder-studio/docs/bld-26-heuristic-engine-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (115) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| `Heuristic` type name | `DerivedHeuristic` | Clash s BLD-15 |
| Heuristic fields | + `rules[]` | Link HeuristicRule as building blocks |
| HeuristicCatalog | + `validation` | Diagnostics / validate surface |
| Demo patterns fallback | without prior Extraction | Overview usable standalone |

---

## Architektonická kontrola — checklist

- [x] Nemění Pattern Collection / Learning Package / Runtime  
- [x] Nepoužívá AI / ML  
- [x] Nevytváří Knowledge Layer / recommendations / personalization  
- [x] Vstup = Pattern Collection (BLD-24)  
- [x] Výstup = Heuristic Catalog  
- [ ] Architecture review PASS (čeká)

---

## Doporučené pořadí (po PASS)

1. Knowledge Synthesis Engine (heuristiky → znalostní báze)  
2. AI Decision Gateway  
3. Personalization Engine  

Princip: Learning → Patterns → Heuristics → Knowledge → AI.
