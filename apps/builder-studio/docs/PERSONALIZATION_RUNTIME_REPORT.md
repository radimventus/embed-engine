# EPIC-BLD-30 — Personalization Runtime Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-31)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Personalization Runtime Engine projekcí AI Context Package + Runtime Session + Priority / Behavior / Decision Profile vytváří Personalized Decision Context a publikuje Personalized Context Package. Nemění Knowledge Base / AI Context / Runtime Session, nevolá LLM a nevytváří nové znalosti.

```
AI Context Package
        │
Personalization Runtime Engine
        │
Personalized Context Package
```

Uzavírá první generaci Decision Delivery Layer před Decision Runtime.

---

## Commit před zahájením

Prompt požadoval commit AI Decision Gateway. Ten byl již v historii (`6ba6f1f`). Uncommitted byl EPIC-BLD-29:

| Commit | Obsah |
| --- | --- |
| `eea6bb2` | `feat(builder): implement personalization engine` (EPIC-BLD-29) |

---

## PersonalizationRuntimeEngine

| Method | Role |
| --- | --- |
| `initialize()` | Derive package id from session id |
| `project()` | Projector → Personalized Context Package |
| `rank()` | Re-apply ranking from last input |
| `validate()` | Validator + Validated status |
| `publish()` | Require valid → Published package |
| `dispose()` | Disposed status |

---

## Models

- **PersonalizedDecisionContext** — id, sessionId, priorityProfile, behaviorProfile, knowledgeEntries, ranking, confidence, metadata, createdAt  
- **PersonalizationProjection** — knowledgeEntryId, reason, weight, priority, metadata (auditovatelná)  
- **PersonalizedContextPackage** — id, version, context, createdAt, updatedAt, metadata (+ validation)

---

## PersonalizationProjector / Validator / Index

**PersonalizationProjector** — `supports()` / `project()`  

**BasicPersonalizationProjector** — deterministická pravidla (priority boost, behavior bias, confidence aggregation)

**PersonalizationRuntimeValidator** — validate / validateRanking / validateConfidence / validateReferences  

**PersonalizationRuntimeIndex** — index / find / list / rebuild  

---

## Runtime Overview

Sekce Builderu `personalization-runtime` (nav **Pers. Runtime**):

- Context Packages / Ranking / Priority Projection / Behavior Projection / Confidence / Index / Validation / Events  
- Project Context / Rank / Validate / Publish Package / Dispose  
- `data-testid="personalization-runtime-overview"`  
- Pouze diagnostická projekce  

---

## Events

| Event | When |
| --- | --- |
| `PersonalizedContextCreated` | project / rank |
| `PersonalizedContextValidated` | validate / publish blocked |
| `PersonalizedContextPublished` | publish success |
| `PersonalizedContextIndexed` | index write after mutate |

---

## API

`createPersonalizationRuntimeApi(engine)`:

- `projectDecisionContext()`
- `publishDecisionContext()`
- `previewDecisionContext()`
- `listDecisionContexts()`
- `validateDecisionContext()`

---

## Screenshot

`apps/builder-studio/docs/bld-30-personalization-runtime-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (135) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| Package metadata.status | + `validation` na package | Overview Validation surface |
| Demo AI Context / Session fallback | without prior Gateway/Session | Overview usable standalone |
| Commit body „AI Decision Gateway“ | commitnuto BLD-29 (`eea6bb2`) | Gateway již bylo commitnuto dříve |

---

## Architektonická kontrola — checklist

- [x] Nemění Knowledge Base / AI Context / Runtime Session  
- [x] Nevolá LLM / nevytváří Knowledge / recommendations  
- [x] Deterministická projekce pro Runtime Session  
- [x] Publikovaný výstup = Personalized Context Package  
- [ ] Architecture review PASS (čeká)

---

## Pipeline po PASS

```
Knowledge Base
        │
AI Decision Gateway
        │
AI Context Package
        │
Personalization Runtime Engine
        │
Personalized Context Package
        │
Decision Runtime
```
