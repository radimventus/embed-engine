# EPIC-BLD-14 — Knowledge Layers Report

**Status:** Ready for architecture review  
**Commit:** deferred to start of EPIC-BLD-15 (on PASS)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Multi-Layer Knowledge Architecture odděluje znalosti podle původu a rozsahu. Knowledge Package drží **reference**, ne kopie mezi vrstvami. Žádné AI, sync, federace ani cross-project learning.

```
Platform Knowledge
        │
Company Knowledge
        │
Object Knowledge
        │
Session Knowledge
        │
        ▼
AI Context Builder  (čte až přes připravený kontext)
```

---

## Knowledge Layer Registry

| id | scope | owner |
| --- | --- | --- |
| `platform` | platform | CONIS Platform |
| `company` | company | Company |
| `object` | object | Object Package |
| `session` | session | Session |

---

## Layer Models

- **PlatformKnowledge** — nikdy customer data  
- **CompanyKnowledge** — izolace na `companyId`  
- **ObjectKnowledge** — jeden `objectId`  
- **SessionKnowledge** — dočasný `sessionId`  

Pouze modely — žádný přenos dat mezi vrstvami.

---

## Knowledge References

`KnowledgePackage.references[]`:

| Field | Role |
| --- | --- |
| `id` | Reference id |
| `layer` | platform \| company \| object \| session |
| `targetId` | Layer model id |
| `type` | catalog \| policy \| fact \| … |

---

## Context Resolver

`KnowledgeContextResolver`:

- `resolvePlatform` / `resolveCompany` / `resolveObject` / `resolveSession` / `resolveLayer`

Vrací `ResolvedLayerReferences` (layer model + filtered refs). **Nevytváří AI Context.**

---

## Layer Overview

Sekce Builderu `knowledge-layers` (nav **Layers**):

- Registry tiles
- Layer Models
- Knowledge References
- Resolver výstup
- Session events
- `data-testid="knowledge-layers-overview"`

---

## Layer Events

| Event | When |
| --- | --- |
| `LayerRegistered` | ensureLayers |
| `LayerReferenceAdded` | attachReference |
| `LayerReferenceRemoved` | detachReference |

---

## Layer API

`createKnowledgeLayerApi(service, resolver)`:

- `loadLayer()`
- `listLayers()`
- `resolveLayer()`

---

## Screenshot

`apps/builder-studio/docs/bld-14-knowledge-layers-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (62) |
| build | pass |

### New tests
- Registry catalog (4 layers)
- ensureLayers + LayerRegistered
- attach/detach references without data copy
- Resolver + Layer API (no AI Context)

---

## Odchylky od specifikace

| Spec | Implementace | Note |
| --- | --- | --- |
| Layer models | + timestamps / metadata status | Lifecycle parity with other packages |
| KnowledgeLayerService | + ensureLayers / attachReference / detachReference | Needed for Overview authoring of refs |
| KnowledgePackage | + `references[]` | Spec requirement; empty by default |
| knowledgeService.upsertKnowledge | added | Persist reference updates into Knowledge Package store |

**Not implemented (by design):** AI, embeddings, sync, federation, cross-project learning, Decision Engine, Runtime.

---

## Proč tento EPIC

Připrava pro:

- **BLD-15** Cross-Project Learning (agregace bez sdílení zákaznických dat)
- **BLD-16** AI Knowledge Gateway (bezpečné poskytování kontextu modelům)

---

Čeká na architektonickou kontrolu. Commit za EPIC-BLD-14 vznikne na začátku EPIC-BLD-15 při PASS.
