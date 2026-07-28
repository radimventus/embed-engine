# EPIC-BLD-29 — Personalization Engine Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-30)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Personalization Engine čte AI Context Package a Runtime Decision Session, aplikuje deterministická personalizační pravidla a publikuje Personalization Package. Nemění Knowledge Base / AI Context / Runtime, nevolá LLM a nevytváří nové znalosti.

```
AI Context Package
        │
Personalization Engine
        │
Personalization Package
```

Uzavírá první generaci Decision Intelligence Pipeline.

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `6ba6f1f` | `feat(builder): implement ai decision gateway` (EPIC-BLD-28) |

---

## PersonalizationEngine

| Method | Role |
| --- | --- |
| `initialize()` | Derive package id from session id |
| `personalize()` | Strategy → Personalization Package |
| `rank()` | Re-apply ranking from last input |
| `validate()` | Validator + Validated status |
| `publish()` | Require valid → Published package v1.0.0 |
| `dispose()` | Disposed status |

---

## Models

- **PersonalizedContext** — id, sessionId, priorityProfile, knowledgeEntries, ranking, confidence, createdAt, metadata  
- **PersonalizationRule** — id, condition, adjustment, weight, metadata  
- **PersonalizationPackage** — id, version, context, rules, createdAt, updatedAt, metadata, validation  

---

## PersonalizationStrategy / Validator / Index

**BasicPersonalizationStrategy** — priority profile boost, session scoping, move-progress bias, completed-session stabilize  

**PersonalizationValidator** — validate / validateRules / validateRanking / validateConfidence  

**PersonalizationIndex** — index / find / list / rebuild  

---

## Personalization Overview

Sekce Builderu `personalization-engine` (nav **Personalization**):

- Personalization Packages / Personalized Contexts / Ranking / Rules / Confidence / Index / Validation  
- Personalize / Rank / Validate / Publish Package / Dispose  
- `data-testid="personalization-engine-overview"`  

---

## Events

| Event | When |
| --- | --- |
| `PersonalizationCreated` | personalize / rank |
| `PersonalizationValidated` | validate / publish blocked |
| `PersonalizationPublished` | publish success |
| `PersonalizationIndexed` | index write after mutate |

---

## API

`createPersonalizationEngineApi(engine)`:

- `personalize()`
- `publishPersonalization()`
- `previewPersonalization()`
- `listPersonalizations()`
- `validatePersonalization()`

---

## Screenshot

`apps/builder-studio/docs/bld-29-personalization-engine-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (130) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| PersonalizationPackage fields | + `rules[]`, + `validation` | Overview Rules + validate surface |
| Demo AI Context / Session fallback | without prior Gateway/Session | Overview usable standalone |

---

## Architektonická kontrola — checklist

- [x] Nemění Knowledge Base / AI Context / Runtime Session  
- [x] Nevolá LLM / nevytváří Knowledge / recommendations  
- [x] Deterministická projekce pro Decision Session  
- [x] Publikovaný výstup = Personalization Package  
- [ ] Architecture review PASS (čeká)

---

## Pipeline po PASS

```
Learning → Patterns → Heuristics → Knowledge Base
  → AI Decision Gateway → Personalization Engine
  → Personalization Package
```
