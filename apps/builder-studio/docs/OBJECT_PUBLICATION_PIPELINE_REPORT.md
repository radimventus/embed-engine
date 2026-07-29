# EPIC-BLD-55 — Object Publication Pipeline Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-56)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Object Publication Pipeline převádí Builder Object na lokální publikovatelný artefakt. Nevytváří Client Experience, nemění Runtime / Contracts / Compatibility, nepublikuje do externích služeb a nepoužívá AI.

```
Builder Object
        │
        ▼
Object Publication Pipeline
        │
        ▼
PublicationObjectPackage (+ Publication Manifest)
        │
        ▼
Published Object (local)
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `72743b4` | `feat(builder): implement runtime extension framework` (EPIC-BLD-54) |

---

## ObjectPublicationPipeline

| Method | Role |
| --- | --- |
| `initialize()` | Create Publication Package |
| `build()` | Assemble PublicationObjectPackage + Manifest |
| `validate()` / `publish()` / `dispose()` | Lifecycle |

---

## Models

- **PublicationObjectPackage** (epic ObjectPackage) — id, objectId, version, manifest, assets, metadata, checksum  
- **PublicationManifest** — id, objectVersion, runtimeVersion, contractVersion, compatibilityVersion, generatedAt  
- **PublicationPackage** — id, version, objectPackage, metadata (+ validation)

---

## PublicationStrategy

**PublicationStrategy** — `supports()` / `build()` / `publish()`  

**BasicPublicationStrategy** — deterministické sestavení Object Package + checksum

---

## PublicationValidator / Index

**PublicationValidator** — validate / validateManifest / validateAssets / validateIntegrity  

**PublicationIndex** — index / find / list / rebuild  

---

## Object Publication Overview

Sekce Builderu `object-publication` (nav **Object Publication**):

- Object / Version / Publication Status / Runtime Version / Manifest / Validation  
- Build Publication / Validate / Publish Object / Dispose  
- `data-testid="object-publication-overview"`  

---

## Events

| Event | When |
| --- | --- |
| `ObjectPublicationCreated` | initialize / build |
| `ObjectPublicationValidated` | validate (valid) |
| `ObjectPublicationPublished` | publish |
| `ObjectPublicationFailed` | validate/build/publish failure |

---

## API

`createObjectPublicationApi(pipeline)`:

- `buildObjectPublication()`
- `publishObject()`
- `listPublishedObjects()`
- `findPublishedObject()`
- `validatePublication()`

---

## Screenshot

`apps/builder-studio/docs/bld-55-object-publication-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (265) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| ObjectPackage | `PublicationObjectPackage` | Kolize s BLD-08 authoring `ObjectPackage` |
| PublicationPackage | + validation, timestamps, status | Overview Validation + lifecycle |
| Demo bez Object | fallback Demo House | Overview použitelný standalone |
| Active Object → build | preferuje session `objectPackage` | Pipeline navazuje na Builder Object |
| Publish | pouze lokální status Published | Bez CDN / cloud / remote deploy |

---

## Architektonická kontrola — checklist

- [x] Nevytváří Client Experience / nemění Runtime  
- [x] Neupravuje Contracts / Compatibility  
- [x] Nepublikuje do externích služeb / nepoužívá AI  
- [x] Bez deployment / CDN / sync / import-export  
- [x] Pouze lokální publikační pipeline  
- [ ] Architecture review PASS (čeká)

---

## Pipeline po PASS

```
Builder Object → Object Publication → Published Object → Client / Manager / Sales Studio
```
