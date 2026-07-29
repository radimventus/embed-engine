# EPIC-BLD-60 — Runtime Session Bootstrap Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-61)  
**App:** `@embed-engine/builder-studio`

---

## Verdict

Runtime Session Bootstrap uzavírá Builder část pipeline vytvořením deterministického bootstrap balíčku pro Runtime. Nespouští Runtime, negeneruje Experience, nevykonává Decision a nepoužívá AI. Pouze připravuje vstup.

```text
Publication Pipeline
    ↓
Published Object
    ↓
Client Publication Adapter
    ↓
Publication Readiness
    ↓
Runtime Session Bootstrap
    ↓
Decision Runtime
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `3b71520` | `feat(builder): implement publication readiness validator` (EPIC-BLD-59) |

---

## RuntimeSessionBootstrap

| Method | Role |
| --- | --- |
| `initialize()` | Create bootstrap package |
| `build()` | Prepare Runtime Session Input |
| `validate()` | Validate bootstrap package |
| `publish()` | Publish deterministic bootstrap |
| `dispose()` | Archive package |

---

## Models

- **RuntimeSessionModel** — publicationId, objectId, runtimeVersion, bootstrapVersion, metadata  
- **RuntimeBootstrapPackage** — id, version, runtimeSession, metadata  
- **RuntimeBootstrapValidation** — deterministic readiness of bootstrap payload

---

## Strategy / Validator / Index

- **RuntimeBootstrapStrategy** — `supports()` / `build()` / `publish()`  
- **BasicRuntimeBootstrapStrategy** — deterministic session input construction  
- **RuntimeBootstrapValidator** — `validate()` / `validateSession()` / `validateMetadata()` / `validateIntegrity()`  
- **RuntimeBootstrapIndex** — index / find / list / rebuild

---

## Runtime Bootstrap Overview

Sekce Builderu `runtime-bootstrap` (nav **Runtime Bootstrap**):

- Session / Publication / Runtime Version / Bootstrap Version / Validation  
- Build / Validate / Publish / Dispose  
- `data-testid="runtime-bootstrap-overview"`

---

## Events

| Event | When |
| --- | --- |
| `RuntimeBootstrapCreated` | build |
| `RuntimeBootstrapValidated` | validate success |
| `RuntimeBootstrapPublished` | publish |
| `RuntimeBootstrapFailed` | validate failure |

---

## API

`createRuntimeBootstrapApi(bootstrap)`:

- `buildRuntimeBootstrap()`
- `publishRuntimeBootstrap()`
- `listRuntimeBootstraps()`
- `findRuntimeBootstrap()`
- `validateRuntimeBootstrap()`

---

## Screenshot

`apps/builder-studio/docs/bld-60-runtime-bootstrap-overview-screenshot.png`

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
| Runtime Session Metadata | součást `RuntimeSessionModel.metadata` | menší, konzistentní model s předchozími EPICy |
| Failed event | emituje se při nevalidním bootstrapu | přímá diagnostická projekce |
| Demo fallback | lze buildnout bez readiness package | overview použitelný standalone |

---

## Architektonická kontrola — checklist

- [x] Nespouští Runtime  
- [x] Negeneruje Experience / nevykonává Decision  
- [x] Neupravuje Published Object  
- [x] Bez deploymentu / synchronizace / AI  
- [x] Vytváří pouze deterministický bootstrap balíček  
- [ ] Architecture review PASS (čeká)
