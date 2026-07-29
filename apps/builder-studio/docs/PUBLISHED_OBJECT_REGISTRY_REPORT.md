# EPIC-BLD-56 — Published Object Registry Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-57)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Published Object Registry eviduje publikované objekty jako lokální zdroj pravdy pro Client / Manager / Sales Studio. Nemění Object Package, negeneruje Experience, neprovádí Runtime Decision, deployment ani AI.

```
Object Publication Pipeline
        │
        ▼
Published Object Registry
        │
        ├─► Client Studio
        ├─► Manager Studio
        └─► Sales Studio
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `37dfde5` | `feat(builder): implement object publication pipeline` (EPIC-BLD-55) |

---

## PublishedObjectRegistry

| Method | Role |
| --- | --- |
| `initialize()` | Create registry package + catalog |
| `register()` | Register PublishedObject evidence |
| `archive()` / `find()` / `list()` / `dispose()` | Lifecycle + lookup |
| `validate()` | Attach validation |

---

## Models

- **PublishedObject** — id, objectId, version, publicationVersion, status, manifest, createdAt, metadata  
- **PublishedObjectCatalog** — id, objects, generatedAt, metadata  
- **PublishedObjectPackage** — id, version, catalog, metadata (+ validation)

---

## PublishedObjectStrategy

**PublishedObjectStrategy** — `supports()` / `register()` / `archive()`  

**BasicPublishedObjectStrategy** — deterministické mapování publication output → registry entry

---

## PublishedObjectValidator / Index

**PublishedObjectValidator** — validate / validateObject / validateManifest / validateIntegrity  

**PublishedObjectIndex** — index / find / list / rebuild  

---

## Published Objects Overview

Sekce Builderu `published-objects` (nav **Published Objects**):

- Published Objects / Version / Status / Publication Date / Manifest / Validation  
- Register / Archive / Validate / Dispose  
- `data-testid="published-objects-overview"`  

---

## Events

| Event | When |
| --- | --- |
| `PublishedObjectRegistered` | register |
| `PublishedObjectArchived` | archive |
| `PublishedObjectValidated` | validate |
| `PublishedObjectIndexed` | index update after register/archive |

---

## API

`createPublishedObjectApi(registry)`:

- `registerPublishedObject()`
- `archivePublishedObject()`
- `listPublishedObjects()`
- `findPublishedObject()`
- `validatePublishedObject()`

---

## Screenshot

`apps/builder-studio/docs/bld-56-published-objects-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (270) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| PublishedObjectPackage | + validation, timestamps | Overview Validation + lifecycle |
| Manifest field | `PublishedObjectManifestRef` snapshot | Registry neukládá/mutuje Object Package |
| Demo bez Publication | 2 demo objects | Overview použitelný standalone |
| Publication → register | preferuje Published PublicationPackage | End-to-end tok BLD-55 → BLD-56 |
| list/find API | na registry API (oddělené od BLD-55 API) | Stejné názvy metod, jiný typ |

---

## Architektonická kontrola — checklist

- [x] Nemění Object Package / nevytváří Runtime  
- [x] Negeneruje Experience / neprovádí deployment  
- [x] Nepoužívá AI / bez sync / CDN / cloud  
- [x] Pouze lokální evidence publikovaných objektů  
- [ ] Architecture review PASS (čeká)

---

## Pipeline po PASS

```
Builder Model → Object Publication → Published Object Registry → Studios
```
