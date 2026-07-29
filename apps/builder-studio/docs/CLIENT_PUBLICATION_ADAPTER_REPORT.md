# EPIC-BLD-58 — Client Publication Adapter Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-59)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Client Publication Adapter čte Platform Publication Catalog, načítá Builder publication artifact, převádí jej na Client Publication Model a publikuje jednotný vstup pro Client Studio. Nemění Runtime, Platform Publication Catalog ani publication object a nepoužívá AI.

```text
Builder Studio
    ↓
Platform Publication Catalog
    ↓
Client Publication Adapter
    ↓
Client Publication Model
    ↓
Client Studio
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `7f73e24` | `feat(builder): implement platform publication catalog` (EPIC-BLD-57) |

---

## ClientPublicationAdapter

| Method | Role |
| --- | --- |
| `initialize()` | Create adapter package |
| `load()` | Load publication artifact |
| `transform()` | Convert Builder artifact to ClientPublicationModel |
| `publish()` | Mark ClientPublicationModel as published |
| `dispose()` | Archive adapter package |

---

## Models

- **ClientPublicationModel** — id, publicationId, objectId, version, assets, metadata  
- **ClientPublicationPackage** — id, version, publicationModel, metadata (+ validation)

---

## ClientPublicationStrategy

**ClientPublicationStrategy** — `supports()` / `transform()` / `publish()`  

**BasicClientPublicationStrategy** — deterministické mapování katalogového vstupu na Client Publication Model bez znalosti interní struktury Client Studia

---

## ClientPublicationValidator / Index

**ClientPublicationValidator** — validate / validatePublication / validateAssets / validateIntegrity  

**ClientPublicationIndex** — index / find / list / rebuild  

---

## Client Publication Overview

Sekce Builderu `client-publication` (nav **Client Publication**):

- Publication / Object / Version / Status / Validation  
- Load / Transform / Validate / Publish / Dispose  
- `data-testid="client-publication-overview"`

---

## Events

| Event | When |
| --- | --- |
| `ClientPublicationLoaded` | load |
| `ClientPublicationTransformed` | transform |
| `ClientPublicationPublished` | publish |
| `ClientPublicationValidated` | validate |

---

## API

`createClientPublicationApi(adapter)`:

- `loadClientPublication()`
- `publishClientPublication()`
- `listClientPublications()`
- `findClientPublication()`
- `validateClientPublication()`

---

## Screenshot

`apps/builder-studio/docs/bld-58-client-publication-overview-screenshot.png`

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
| ClientPublicationPackage | + validation, timestamps | Overview Validation + lifecycle |
| load + transform | oddělené kroky | Diagnostická projekce adapter lifecycle |
| Client Studio input | neutrální `assets[]` + metadata | Adapter nesmí znát interní strukturu Client Studia |
| Demo bez Platform Catalog | fallback demo publication | Overview použitelný standalone |

---

## Architektonická kontrola — checklist

- [x] Nezná interní strukturu Client Studia  
- [x] Negeneruje Experience / nemění Runtime  
- [x] Nemění Platform Publication Catalog  
- [x] Nepoužívá AI / bez renderingu / bez deployment  
- [ ] Architecture review PASS (čeká)
