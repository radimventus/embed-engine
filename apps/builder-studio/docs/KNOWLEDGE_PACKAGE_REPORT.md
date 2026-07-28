# EPIC-BLD-11 — Knowledge Package Report

**Status:** Ready for architecture review  
**Commit:** deferred to start of EPIC-BLD-12 (on PASS)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Knowledge Package je autorský model strukturovaných znalostí o objektu. Není AI, není Decision Engine, není inference. Je součástí Object Package vedle Experience.

```
Project → Object Package → Experience
                        → Knowledge Package
                              ├── Facts
                              ├── Entities
                              ├── Relationships
                              ├── FAQ
                              └── Documents
```

---

## Knowledge Package model

`KnowledgePackage`

| Field | Role |
| --- | --- |
| `knowledgeId` | Canonical id (`knowledge-${objectId}`) |
| `objectId` | Link to Object Package |
| `version` | Authoring semver |
| `facts[]` | Structured facts |
| `entities[]` | Named entities |
| `relationships[]` | Explicit author links |
| `documents[]` | Document registry |
| `faqs[]` | FAQ repository |
| `metadata` | title, description, status |
| `timestamps` | createdAt / updatedAt |

`ObjectPackage.knowledgePackage` attaches the package (asset field `knowledge` remains CollectedAssetRef[] for files).

---

## Knowledge Service

`createKnowledgeService()`:

| Method | Role |
| --- | --- |
| `createKnowledge` | Create + seed (Harmony demo content) |
| `loadKnowledge` / `loadKnowledgeByObject` | Read |
| `updateKnowledge` / `saveKnowledge` / `archiveKnowledge` | Lifecycle |
| `addFact` / `addEntity` / `addRelationship` / `addFaq` | Authoring |
| `registerDocument` / `syncDocumentsFromProject` | Document registry |
| `getEvents` / `getHistory` | Session history |

---

## Fact / Entity / Relationship

- **Fact** — title, value, category, source, tags  
- **Entity** — type, label, aliases, metadata  
- **Relationship** — from, to, relation, confidence (data only, no inference)

---

## FAQ Repository

`FaqEntry` owned by Knowledge Package. Experience FAQ module only displays later — Knowledge is source of truth.

---

## Document Registry

`KnowledgeDocument` with `assetRef` — no OCR, no parsing. Synced from Active Project knowledge assets (pdf/docx/xlsx).

---

## Knowledge Overview

Workspace section **Knowledge** (`knowledge-package`):

- Facts / Entities / Relationships / FAQ / Documents
- session history
- quick-add actions (mock authoring)

Asset uploads remain under **Soubory** (`knowledge` section).

---

## Events

| Event | When |
| --- | --- |
| `KnowledgeCreated` | create |
| `FactAdded` | add fact |
| `EntityAdded` | add entity |
| `RelationshipAdded` | add relationship |
| `FaqAdded` | add FAQ |
| `DocumentRegistered` | register / sync document |

Session-only (max 40). No persistence.

---

## Knowledge API

`createKnowledgeApi(service)`:

- `loadKnowledge()`
- `saveKnowledge()`
- `updateKnowledge()`

---

## Screenshot

`apps/builder-studio/docs/bld-11-knowledge-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (49) |
| build | pass |

### New tests
- seeded Knowledge Package + events
- fact / entity / relationship / FAQ / document authoring
- document sync from Active Project
- Knowledge API + archive

---

## Deviations

1. Field name `knowledgePackage` on ObjectPackage (not `knowledge`) — `knowledge` already means asset refs from BLD-02/08.
2. Nav: Knowledge Package = **Knowledge**; asset files = **Soubory** (formerly Znalosti).
3. Relationships store `id` for session stability (spec listed from/to/relation/confidence).
4. Overview is primarily read + quick-add stubs — full editors deferred.
5. Harmony seeds demo facts/entities/FAQ; other projects start sparse.

---

## Out of scope (confirmed)

- AI / embeddings
- Decision Engine
- Inference
- OCR / document parsing
- Persistence
- Build/Publish mutation of Knowledge

---

## Next

Await architecture review. On PASS: commit at start of **EPIC-BLD-12 – Decision Knowledge**.
