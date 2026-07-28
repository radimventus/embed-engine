# EPIC-BLD-13 — AI Context Report

**Status:** Ready for architecture review  
**Commit:** deferred to start of EPIC-BLD-14 (on PASS)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

AI Context Builder skládá dočasný `AIContextPackage` z Object / Experience / Knowledge / Decision vrstev. Není LLM, není chat, nejsou prompty. AI nikdy nečte autorské balíčky přímo.

```
Object Package
  ├── Experience
  ├── Knowledge
  └── Decision Knowledge
          │
          ▼
   AI Context Builder  ← jediná oprávněná skládací komponenta
          │
          ▼
   AI Context Package  ← session only, bez persistence
```

---

## AIContextPackage

| Field | Role |
| --- | --- |
| `id` | `ai-context-${objectId}` |
| `version` | Authoring semver (bumps on refresh) |
| `objectContext` | Object fragment or null |
| `experienceContext` | Experience fragment or null |
| `knowledgeContext` | Knowledge fragment or null |
| `decisionContext` | Decision fragment or null |
| `fragments[]` | Sorted/deduped collection |
| `metadata` | title, description, objectId, projectId, status |
| `timestamps` | createdAt / updatedAt |

Dočasný — nepřipojuje se k Object Package, nepersistuje se.

---

## AIContextBuilderService

| Method | Role |
| --- | --- |
| `build()` | Collect sources → compose → ContextBuilt |
| `refresh()` | Rebuild from current layers → ContextRefreshed |
| `clear()` | Empty fragments → ContextCleared |
| `preview()` / `getCurrent()` | Read current package |

Žádné volání AI.

---

## Context Sources / Fragments / Composer

Sources: `ObjectContextSource`, `ExperienceContextSource`, `KnowledgeContextSource`, `DecisionContextSource` — každý vrací pouze `ContextFragment` (id, type, priority, payload, metadata).

`ContextComposer`: `merge()` / `sort()` / `deduplicate()` / `compose()` — bez token optimalizace, bez promptů.

---

## Context Preview

Sekce Builderu `ai-context` (nav **AI Context**):

- Object / Experience / Knowledge / Decision fragmenty
- výsledný Context Package (JSON preview)
- Build / Refresh / Clear
- `data-testid="ai-context-preview"`

---

## Context Events

| Event | When |
| --- | --- |
| `ContextBuilt` | build |
| `ContextRefreshed` | refresh |
| `ContextCleared` | clear |

Session-only (max 40).

---

## AI Context API

`createAIContextApi(service)`:

- `buildContext()`
- `previewContext()`
- `refreshContext()`

---

## Screenshot

`apps/builder-studio/docs/bld-13-ai-context-preview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (58) |
| build | pass |

### New tests
- sources return typed fragments
- composer merge / sort / deduplicate
- build + four contexts + ContextBuilt
- refresh / preview / clear + events
- API build / preview / refresh

---

## Odchylky od specifikace

| Spec | Implementace | Note |
| --- | --- | --- |
| AIContextPackage fields | + `fragments[]` | Explicit composed collection for preview/API |
| metadata | + objectId, projectId, status | Traceability + Empty/Built/Cleared UI |
| Build input | slim DTOs, not full packages | Enforces „AI never reads packages directly“ at the builder boundary |
| clear API | on service (not public API) | Public API stays build/preview/refresh as specified |

**Not implemented (by design):** Prompt Builder, LLM Gateway, providers, chat, streaming, tokenizer, RAG, embeddings, Runtime.

---

## Platform principle

```
Data → Knowledge → Decision Knowledge → AI Context → LLM
```

Budoucí providery (OpenAI / Claude / Gemini / vlastní) komunikují výhradně přes `AIContextPackage`.

---

Čeká na architektonickou kontrolu. Commit za EPIC-BLD-13 vznikne na začátku EPIC-BLD-14 při PASS.
