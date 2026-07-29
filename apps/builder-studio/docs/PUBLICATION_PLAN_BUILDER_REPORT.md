# EPIC-BLD-63 — Publication Plan Builder Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-64)  
**App:** `@embed-engine/builder-studio`

---

## Verdict

Publication Plan Builder vytváří deterministický publikační plán nad `Artifact Dependency Registry`. Nic nepublikuje, nic nespouští a nemění artefakty. Pouze vypočítá reprodukovatelné pořadí kroků a publikuje plán jako artefakt.

```text
Artifact Version Manager
    ↓
Artifact Dependency Registry
    ↓
Publication Plan Builder
    ↓
Publication Executor (future)
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `93f2ba9` | `feat(builder): implement artifact dependency registry` (EPIC-BLD-62) |

---

## PublicationPlanBuilder

| Method | Role |
| --- | --- |
| `initialize()` | Create plan package |
| `build()` | Build deterministic plan |
| `validate()` | Validate order / dependencies / integrity |
| `publish()` | Publish plan artifact |
| `dispose()` | Archive package |

---

## Models

- **PublicationPlan** — rootArtifactId, steps, dependencies, status, metadata  
- **PublicationPlanStep** — artifactId, order, operation, status  
- **PublicationPlanPackage** — package carrying the plan artifact

---

## Strategy / Validator / Index

- **PublicationPlanStrategy** — `supports()` / `build()` / `validate()`  
- **BasicPublicationPlanStrategy** — deterministic post-order dependency traversal  
- **PublicationPlanValidator** — `validate()` / `validateOrder()` / `validateDependencies()` / `validateIntegrity()`  
- **PublicationPlanIndex** — index / find / list / rebuild

---

## Publication Plan Overview

Sekce Builderu `publication-plan` (nav **Publication Plan**):

- Root Artifact / Steps / Dependencies / Validation / Status  
- Build / Validate / Publish / Dispose  
- `data-testid="publication-plan-overview"`

---

## Events

| Event | When |
| --- | --- |
| `PublicationPlanBuilt` | build |
| `PublicationPlanValidated` | validate success |
| `PublicationPlanPublished` | publish |
| `PublicationPlanInvalidated` | validate failure |

---

## API

`createPublicationPlanApi(builder)`:

- `buildPublicationPlan()`
- `publishPublicationPlan()`
- `listPublicationPlans()`
- `findPublicationPlan()`
- `validatePublicationPlan()`

---

## Screenshot

`apps/builder-studio/docs/bld-63-publication-plan-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| publish() | publikuje plán jako lokální artefakt, neprovádí publikaci | drží scope čistě plánovací |
| operation | leaf dependency defaultuje na `VERIFY` | čitelnější diagnostická projekce |
| fallback plan | demo dependency chain i bez registru | overview funguje standalone |

---

## Architektonická kontrola — checklist

- [x] Nic nepublikuje reálně  
- [x] Nemění artefakty ani závislosti  
- [x] Nespouští Runtime / bez AI  
- [x] Deterministické a reprodukovatelné chování  
- [x] Pouze vytvoření publikačního plánu  
- [ ] Architecture review PASS (čeká)
