# EPIC-BLD-28 — AI Decision Gateway Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-29)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

AI Decision Gateway je jediné oficiální rozhraní pro přípravu AI Contextu z Knowledge Base. Čte pouze Knowledge Base, filtruje a validuje, publikuje AI Context Package. Nemění Knowledge Base / Runtime, nevolá LLM a negeneruje znalosti ani odpovědi.

```
Knowledge Base
        │
        ▼
AI Decision Gateway
        │
        ▼
AI Context Package
```

Hranice mezi deterministickou Knowledge pipeline a budoucí AI spotřebou.

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `1bf6994` | `feat(builder): implement knowledge synthesis engine` (EPIC-BLD-27) |

---

## AIDecisionGateway

| Method | Role |
| --- | --- |
| `initialize()` | Derive package id from knowledge-base id |
| `buildContext()` | Builder → AI Context Package |
| `filter()` | Re-apply size/confidence filters |
| `validate()` | Validator + Validated status |
| `publish()` | Require valid → Published package v1.0.0 |
| `dispose()` | Disposed status |

---

## Models

- **GatewayAIContext** — id, knowledgeEntries, references, confidence, metadata, createdAt  
  *(TypeScript name avoids clash with BLD-13 AI Context)*  
- **GatewayAIContextReference** — knowledgeEntryId, relationship, weight, metadata  
- **GatewayAIContextPackage** — id, version, context, createdAt, updatedAt, metadata, validation  

---

## AIContextBuilder / Validator / Index

**BasicAIContextBuilder** — confidence filter, title dedupe, maxEntries cap, audit refs (`includes` / `filtered-from`)  

**GatewayAIContextValidator** — validate / validateReferences / validateConfidence / validateSize  

**GatewayAIContextIndex** — index / find / list / rebuild  

---

## AI Gateway Overview

Sekce Builderu `ai-decision-gateway` (nav **AI Gateway**):

- Context Packages / Knowledge Entries / References / Confidence / Index / Validation  
- Build / Filter / Validate / Publish Package / Dispose  
- `data-testid="ai-decision-gateway-overview"`  

Odděleno od BLD-13 **AI Context** (object/experience/knowledge/decision fragments).

---

## Events

| Event | When |
| --- | --- |
| `AIContextBuilt` | build / filter |
| `AIContextValidated` | validate / publish blocked |
| `AIContextPublished` | publish success |
| `AIContextIndexed` | index write after mutate |

---

## API

`createAIDecisionGatewayApi(gateway)`:

- `buildAIContext()`
- `publishAIContext()`
- `previewAIContext()`
- `listAIContexts()`
- `validateAIContext()`

---

## Screenshot

`apps/builder-studio/docs/bld-28-ai-decision-gateway-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (125) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| `AIContext` / `AIContextPackage` | `GatewayAIContext` / `GatewayAIContextPackage` | Clash s BLD-13 |
| `AIContextBuilder` / Validator / Index | `GatewayAI*` namespaced exports | Clash s BLD-13 builder |
| Demo KB entries fallback | without prior Synthesize | Overview usable standalone |

---

## Architektonická kontrola — checklist

- [x] Nemění Knowledge Base / Heuristics / Patterns / Learning / Runtime  
- [x] Nevolá LLM / negeneruje odpovědi / Knowledge  
- [x] Validní reference + žádné duplicitní includes  
- [x] Deterministický výstup  
- [ ] Architecture review PASS (čeká)

---

## Doporučené pořadí (po PASS)

1. EPIC-BLD-29 – Personalization Engine  

Princip CONIS: AI nikdy nevytváří znalosti — pouze spotřebovává Knowledge Base přes řízený Gateway.
