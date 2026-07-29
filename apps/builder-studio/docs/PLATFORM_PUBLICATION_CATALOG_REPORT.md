# EPIC-BLD-57 — Platform Publication Catalog Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-58)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Platform Publication Catalog je veřejná katalogová vrstva nad Published Object Registry. Nevytváří Object, nemění Registry, negeneruje Experience, neprovádí deployment a nepoužívá AI — pouze agreguje metadata a umožňuje filtrování pro Client / Manager / Sales Studio.

```
Published Object Registry
        │
        ▼
Platform Publication Catalog
        │
        ├─► Client Studio
        ├─► Manager Studio
        └─► Sales Studio
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `04178a0` | `feat(builder): implement published object registry` (EPIC-BLD-56) |

---

## PlatformPublicationCatalog

| Method | Role |
| --- | --- |
| `initialize()` | Create catalog package + snapshot |
| `register()` | Register PlatformPublicationEntry |
| `refresh()` / `find()` / `list()` / `dispose()` | Lifecycle + lookup |
| `validate()` | Attach validation |

---

## Models

- **PlatformPublicationEntry** — id, objectId, publicationVersion, status, category, visibility, metadata  
- **PlatformPublicationSnapshot** — id, entries, generatedAt, metadata  
- **PlatformPublicationPackage** — id, version, snapshot, metadata (+ validation)

---

## PlatformPublicationStrategy

**PlatformPublicationStrategy** — `supports()` / `register()` / `refresh()`  

**BasicPlatformPublicationStrategy** — deterministické mapování registry evidence → catalog entry

---

## PlatformPublicationValidator / Index

**PlatformPublicationValidator** — validate / validateEntry / validateSnapshot / validateIntegrity  

**PlatformPublicationIndex** — index / find / list / rebuild  

---

## Platform Publication Overview

Sekce Builderu `platform-publication` (nav **Platform Catalog**):

- Published Objects / Categories / Visibility / Version / Validation  
- Register Catalog / Refresh / Validate / Dispose  
- `data-testid="platform-publication-overview"`  

---

## Events

| Event | When |
| --- | --- |
| `PlatformPublicationRegistered` | register |
| `PlatformPublicationRefreshed` | refresh |
| `PlatformPublicationValidated` | validate |
| `PlatformPublicationIndexed` | index update after register/refresh |

---

## API

`createPlatformPublicationApi(catalog)`:

- `registerPlatformPublication()`
- `refreshPlatformPublication()`
- `listPlatformPublications()`
- `findPlatformPublication()`
- `validatePlatformPublication()`

---

## Screenshot

`apps/builder-studio/docs/bld-57-platform-publication-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (275) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| PlatformPublicationPackage | + validation, timestamps | Overview Validation + lifecycle |
| Overview nav label | **Platform Catalog** | kratší label v navigaci |
| Demo bez Registry | 2 demo entries | Overview použitelný standalone |
| Registry → catalog | preferuje non-Archived PublishedObjects | End-to-end tok BLD-56 → BLD-57 |
| refresh | Registered → Active | veřejná aktivace katalogové projekce |

---

## Architektonická kontrola — checklist

- [x] Nemění Published Object Registry / nevytváří Object  
- [x] Negeneruje Experience / neupravuje Runtime  
- [x] Bez deployment / CDN / marketplace / AI  
- [x] Pouze veřejná katalogová vrstva  
- [ ] Architecture review PASS (čeká)

---

## Pipeline po PASS

```
Authoring → Runtime → Publication Pipeline → Published Object Registry → Platform Publication Catalog → Studios
```
