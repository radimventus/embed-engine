# EPIC-BLD-49 — Runtime Integration Registry Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-50)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Runtime Integration Registry završuje integrační vrstvu. Eviduje publikované Runtime Package z Integration Hub a poskytuje lookup / verzování. Nevytváří Package a neprovádí agregaci.

```
Integration Hub → Registry (evidence / lookup only)
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `8ef0b36` | `feat(builder): implement runtime integration hub` (EPIC-BLD-48) |

---

## RuntimeIntegrationRegistry

| Method | Role |
| --- | --- |
| `initialize()` | Create Registry Package + empty Catalog |
| `register()` | Evidence published package as Entry (update on re-register) |
| `find()` / `list()` | Lookup entries |
| `publish()` / `dispose()` | Publish or archive registry package |

---

## Models

- **RuntimeRegistryEntry** — id, packageId, packageType, version, source, registeredAt, metadata  
- **RuntimeRegistryCatalog** — id, entries, createdAt, metadata  
- **RuntimeRegistryPackage** — id, version, catalog, metadata (+ validation)

---

## RuntimeRegistryStrategy

**RuntimeRegistryStrategy** — `supports()` / `register()` / `lookup()`  

**BasicRuntimeRegistryStrategy** — deterministická evidence publikovaných refs

---

## RuntimeRegistryValidator / Index

**RuntimeRegistryValidator** — validate / validateEntries / validateCatalog / validateIntegrity  

**RuntimeRegistryIndex** — index / find / list / rebuild  

---

## Runtime Registry Overview

Sekce Builderu `runtime-registry` (nav **Runtime Registry**):

- Registered Packages / Package Types / Versions / Sources / Registration Time / Validation  
- Register Packages / Validate / Publish Registry / Dispose  
- `data-testid="runtime-registry-overview"`  
- Pouze projekce evidence  

---

## Events

| Event | When |
| --- | --- |
| `RuntimePackageRegistered` | first register |
| `RuntimePackageUpdated` | re-register same package |
| `RuntimeRegistryValidated` | validate |
| `RuntimeRegistryPublished` | publish |

---

## API

`createRuntimeRegistryApi(registry)`:

- `registerRuntimePackage()`
- `findRuntimePackage()`
- `listRuntimePackages()`
- `publishRuntimeRegistry()`
- `validateRuntimeRegistry()`

---

## Screenshot

`apps/builder-studio/docs/bld-49-runtime-registry-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (234) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| RuntimeRegistryPackage | + validation, timestamps | Overview Validation + lifecycle |
| `publish()` on registry service | API `publishRuntimeRegistry` | Spec event RuntimeRegistryPublished |
| Demo bez Hub katalogu | 3 demo entries | Overview použitelný standalone |
| Hub records → Registry | preferuje Integration Hub katalog | Tok Hub → Registry |

---

## Architektonická kontrola — checklist

- [x] Nemění Runtime / nevytváří Package  
- [x] Neprovádí agregaci / nespouští Runtime  
- [x] Nepoužívá AI  
- [x] Lokální deterministický registry  
- [ ] Architecture review PASS (čeká)

---

## Pipeline po PASS

```
Runtime Capability → Package → Integration Hub → Registry → Consumers
```
