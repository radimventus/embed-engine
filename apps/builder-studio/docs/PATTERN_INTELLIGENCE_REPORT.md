# EPIC-BLD-25 — Pattern Intelligence Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Pattern Intelligence Engine čte Learning Records (z Learning Records Package), identifikuje ověřené opakující se vzory s evidencí a publikuje Pattern Catalog. Nevytváří heuristiky, doporučení ani AI výstupy. Nemění Learning Records, Package, Analytics ani Runtime.

```
Learning Records Package
        │
        ▼
Pattern Intelligence Engine
        │
        ▼
Pattern Catalog
```

Začátek Knowledge Intelligence Layer: Learning Records → **Pattern Catalog** (bez heuristik).

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `ce5c4b8` | Learning Package Manager (už dříve) |
| `54e0185` | `feat(builder): implement pattern extraction engine` (skutečný předchozí necommitnutý EPIC) |

Poznámka: prompt žádal Learning Package Manager commit — ten už existoval (`ce5c4b8`). Commitnut byl Pattern Extraction (BLD-24) dle Commit Strategy.

---

## PatternIntelligenceEngine

| Method | Role |
| --- | --- |
| `initialize()` | Derive catalog id from package id |
| `extract()` | Matcher → PatternCatalog + PatternDetected |
| `merge()` | Merge duplicate type+sources groups |
| `validate()` | Validator + Validated status |
| `publish()` | Require valid → Published catalog v1.0.0 |
| `dispose()` | Disposed status |

---

## Models

- **IntelligencePattern** — id, name, description, type, confidence, occurrences, sources, evidence, createdAt, metadata  
  *(TypeScript name avoids clash with BLD-15 `Pattern` / BLD-24 `ExtractedPattern`)*  
- **PatternEvidence** — recordId, snapshotId, weight, timestamp, metadata  
- **PatternCatalog** — id, version, patterns, createdAt, updatedAt, metadata, validation  

---

## PatternMatcher / PatternValidator / PatternIndex

**BasicPatternMatcher** — deterministic: source-frequency, multi-record, pipeline-derived (+ evidence)

**PatternIntelligenceValidator** — validate / validateEvidence / validateConfidence  

**PatternIntelligenceIndex** — index / find / list / rebuild  

*(Namespaced vs BLD-24 Pattern Extraction validators/index.)*

---

## Pattern Overview

Sekce Builderu `pattern-intelligence` (nav **Patterns**):

- Catalog / Patterns / Evidence / Confidence / Index / Validation  
- Extract / Merge / Validate / Publish Catalog / Dispose  
- `data-testid="pattern-intelligence-overview"`  

BLD-24 Overview zůstává jako nav **Extraction** (Pattern Collection).

---

## Events

| Event | When |
| --- | --- |
| `PatternDetected` | extract |
| `PatternMerged` | merge |
| `PatternValidated` | validate / publish blocked |
| `PatternPublished` | publish success |

---

## API

`createPatternIntelligenceApi(engine)`:

- `extractPatterns()`
- `publishPatterns()`
- `previewPatterns()`
- `listPatterns()`
- `validatePatterns()`

---

## Screenshot

`apps/builder-studio/docs/bld-25-pattern-intelligence-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (110) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| `Pattern` type name | `IntelligencePattern` | Clash s BLD-15 / BLD-24 |
| `PatternValidator` / `PatternIndex` | `PatternIntelligenceValidator` / `PatternIntelligenceIndex` | Clash s BLD-24 exports |
| PatternCatalog fields | + `updatedAt`, + `validation` | Diagnostics |
| Nav **Patterns** | BLD-24 přejmenován na **Extraction** | Obě sekce potřebují UI |

---

## Architektonická kontrola — checklist

- [x] Nemění Learning Records / Package / Analytics / Runtime  
- [x] Nevytváří heuristiky / doporučení  
- [x] Nepoužívá AI / ML / scoring / personalization  
- [x] Každý pattern má PatternEvidence  
- [x] Publikovaný výstup = Pattern Catalog  
- [ ] Architecture review PASS (čeká)

---

## Doporučené pořadí (po PASS)

1. Heuristic Engine (z Pattern Catalog)  
2. Knowledge Synthesis Engine  
3. AI Decision Gateway  

Princip: žádná vyšší vrstva nesmí přeskočit nižší — AI až nad standardizovanou znalostí.
