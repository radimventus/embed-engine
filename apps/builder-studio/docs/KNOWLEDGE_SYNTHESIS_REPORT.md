# EPIC-BLD-27 — Knowledge Synthesis Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-28)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Knowledge Synthesis Engine čte Heuristic Catalog, konsoliduje heuristiky do Knowledge Entry objektů s dohledatelnými referencemi a publikuje Knowledge Base. Nepoužívá AI, neprovádí runtime inferenci ani personalizaci a nemění Heuristic Catalog / Pattern / Learning / Runtime.

```
Heuristic Catalog
        │
        ▼
Knowledge Synthesis Engine
        │
        ▼
Knowledge Base
```

První kanonická znalostní báze Knowledge Intelligence pipeline.

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `060ae4d` | `feat(builder): implement heuristic engine` (EPIC-BLD-26) |

---

## KnowledgeSynthesisEngine

| Method | Role |
| --- | --- |
| `initialize()` | Derive knowledge-base id from catalog id |
| `synthesize()` | Synthesizer → Knowledge Base + KnowledgeSynthesized |
| `merge()` | Deduplicate by title groups |
| `validate()` | Validator + Validated status |
| `publish()` | Require valid → Published base v1.0.0 |
| `dispose()` | Disposed status |

---

## Models

- **KnowledgeEntry** — id, title, description, confidence, sourceHeuristics, references, createdAt, metadata  
- **SynthesizedKnowledgeReference** — heuristicId, relationship, weight, metadata  
  *(TypeScript name avoids clash with BLD Knowledge Layers `KnowledgeReference`)*  
- **SynthesizedKnowledgeBase** — id, version, entries, createdAt, updatedAt, metadata, validation  
  *(TypeScript name clarifies vs generic “Knowledge Base”; product surface remains Knowledge Base)*  

---

## KnowledgeSynthesizer / Validator / Index

**BasicKnowledgeSynthesizer** — one entry per heuristic + catalog summary (≥2)  

**KnowledgeSynthesisValidator** — validate / validateConsistency / validateReferences / validateConfidence  

**KnowledgeSynthesisIndex** — index / find / list / rebuild  

---

## Knowledge Overview

Sekce Builderu `knowledge-synthesis` (nav **Base** — existing **Knowledge** = knowledge-package):

- Knowledge Base / Entries / References / Confidence / Index / Validation  
- Synthesize / Merge / Validate / Publish Base / Dispose  
- `data-testid="knowledge-synthesis-overview"`  
- Eyebrow title: **Knowledge**

---

## Events

| Event | When |
| --- | --- |
| `KnowledgeSynthesized` | synthesize |
| `KnowledgeMerged` | merge |
| `KnowledgeValidated` | validate / publish blocked |
| `KnowledgePublished` | publish success |

---

## API

`createKnowledgeSynthesisApi(engine)`:

- `synthesizeKnowledge()`
- `publishKnowledge()`
- `previewKnowledge()`
- `listKnowledge()`
- `validateKnowledge()`

---

## Screenshot

`apps/builder-studio/docs/bld-27-knowledge-synthesis-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (120) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| `KnowledgeReference` | `SynthesizedKnowledgeReference` | Clash s Knowledge Layers |
| `KnowledgeBase` type | `SynthesizedKnowledgeBase` | Clarity vs package/layers naming |
| Nav **Knowledge** | Nav **Base** (eyebrow Knowledge) | Existing Knowledge section |
| Demo heuristics fallback | without prior Derive | Overview usable standalone |

---

## Architektonická kontrola — checklist

- [x] Nemění Heuristic Catalog / Pattern Intelligence / Learning / Runtime  
- [x] Nepoužívá AI / LLM / personalization / runtime inference  
- [x] Každý entry má references zpět k heuristikám  
- [x] Publikovaný výstup = Knowledge Base  
- [ ] Architecture review PASS (čeká)

---

## Doporučené pořadí (po PASS)

1. EPIC-BLD-28 – AI Decision Gateway (AI jako konzument Knowledge Base)  
2. EPIC-BLD-29 – Personalization Engine  

Princip: AI nevytváří znalosti — pouze konzumuje publikovanou Knowledge Base.
