# EPIC-BLD-24 — Pattern Extraction Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Pattern Extraction Engine identifikuje opakující se vzory z Learning Package (reference na Learning Records). Vytváří a ukládá Pattern Collection — nevytváří heuristiky, doporučení ani AI výstupy. Nemění Learning Package, Analytics ani Runtime.

```
Learning Package
        │
        ▼
Pattern Extraction
        │
        ▼
Pattern Collection
```

První interpretační vrstva nad Learning: data → **patterny** (bez významu / heuristik).

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `ce5c4b8` | `feat(builder): implement learning package manager` (EPIC-BLD-23) |

---

## PatternExtractionEngine

| Method | Role |
| --- | --- |
| `initialize()` | Derive collection id from package id |
| `extract()` | Run extractor → PatternCollection |
| `validate()` | PatternValidator + Validated status |
| `publish()` | Require valid → Published / v1.0.0 |
| `dispose()` | Disposed status |

---

## Models

- **ExtractedPattern** — id, name, description, sourceRecords, confidence, createdAt, metadata  
  *(TypeScript name avoids clash with BLD-15 `Pattern`; product surface is still Pattern)*  
- **PatternCollection** — id, patterns, version, createdAt, updatedAt, metadata, validation  
  *(extra `updatedAt` for diagnostics)*  

---

## PatternValidator / PatternExtractor

**PatternValidator** — validate / validateConfidence / validateSources  

**PatternExtractor** — supports / extract  

**BasicPatternExtractor** — deterministic rules only:

1. Repeated source (≥2 records same source)
2. Multi-record package (≥3 records)
3. Pipeline-derived records (source/note token)
4. Sparse fallback (low confidence) when no stronger match

---

## PatternIndex

index / find / list / rebuild  

---

## Pattern Overview

Sekce Builderu `pattern-extraction` (nav **Patterns**):

- Collections / Patterns / Confidence / Sources / Index / Validation  
- Extract / Validate / Publish / Dispose  
- `data-testid="pattern-extraction-overview"`  

Pouze diagnostika. Bez AI / scoring UI.

---

## Events

| Event | When |
| --- | --- |
| `PatternExtracted` | extract |
| `PatternValidated` | validate / publish blocked |
| `PatternPublished` | publish success |
| `PatternIndexed` | index write after mutate |

---

## API

`createPatternExtractionApi(engine)`:

- `extractPatterns()`
- `previewPatterns()`
- `listPatterns()`
- `validatePatterns()`

---

## Screenshot

`apps/builder-studio/docs/bld-24-pattern-extraction-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (105) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| `Pattern` type name | `ExtractedPattern` | Clash s BLD-15 `Pattern` |
| PatternCollection fields | + `updatedAt`, + `validation` | Diagnostics / validate surface |
| Extract without Package | Demo records fallback | Overview usable without prior Package steps |

---

## Architektonická kontrola — checklist

- [x] Pattern Engine nemění Learning Package  
- [x] Nemění Analytics / Runtime  
- [x] Nevytváří heuristiky / doporučení  
- [x] Nepoužívá AI / ML  
- [x] Pouze identifikace opakujících se vzorů  
- [ ] Architecture review PASS (čeká)

---

## Doporučené pořadí (po PASS)

1. EPIC-BLD-25 – Heuristic Engine (z Pattern Collection)  
2. EPIC-BLD-26 – Knowledge Synthesis Engine  
3. EPIC-BLD-27 – AI Decision Gateway  

*(Poznámka: v promptu byla čísla Heuristic=24 / Synthesis=25 — aktuální číslo Pattern Extraction je BLD-24; následné EPICy posunout o +1.)*
