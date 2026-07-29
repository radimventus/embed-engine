# EPIC-BLD-50 — Runtime Manifest Engine Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-51)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Runtime Manifest Engine uzavírá integrační vrstvu deklarativním manifestem publikovaných Runtime capability. Nevytváří Runtime, nemění Registry a nepublikuje Runtime artefakty — pouze popisuje.

```
Registry → Manifest (declarative contract)
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `ed91d40` | `feat(builder): implement runtime integration registry` (EPIC-BLD-49) |

---

## RuntimeManifestEngine

| Method | Role |
| --- | --- |
| `initialize()` / `generate()` | Collect + generate Manifest Package |
| `collect()` | Normalize capability inputs |
| `publish()` / `dispose()` | Publish or archive manifest package |

---

## Models

- **RuntimeManifest** — id, version, capabilities, packages, registryVersion, generatedAt, metadata  
- **RuntimeCapabilityDescriptor** — id, name, version, package, dependencies, metadata  
- **RuntimeManifestPackage** — id, version, manifest, metadata (+ validation)

---

## RuntimeManifestStrategy

**RuntimeManifestStrategy** — `supports()` / `collect()` / `generate()`  

**BasicRuntimeManifestStrategy** — deterministické mapování capability refs → manifest

---

## RuntimeManifestValidator / Index

**RuntimeManifestValidator** — validate / validateManifest / validateCapabilities / validateIntegrity  

**RuntimeManifestIndex** — index / find / list / rebuild  

---

## Runtime Manifest Overview

Sekce Builderu `runtime-manifest` (nav **Runtime Manifest**):

- Registered Capabilities / Packages / Dependencies / Manifest Version / Validation  
- Generate Manifest / Validate / Publish / Dispose  
- `data-testid="runtime-manifest-overview"`  

---

## Events

| Event | When |
| --- | --- |
| `RuntimeManifestGenerated` | generate / initialize |
| `RuntimeManifestValidated` | validate |
| `RuntimeManifestPublished` | publish |

---

## API

`createRuntimeManifestApi(engine)`:

- `generateRuntimeManifest()`
- `previewRuntimeManifest()`
- `listRuntimeCapabilities()`
- `validateRuntimeManifest()`

(+ `publishRuntimeManifest` for Published event)

---

## Screenshot

`apps/builder-studio/docs/bld-50-runtime-manifest-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (239) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| Engine methods | + `publish()` | Event RuntimeManifestPublished |
| RuntimeManifestPackage | + validation, timestamps | Overview Validation + lifecycle |
| Demo bez Registry | 3 demo capabilities | Overview použitelný standalone |
| Default dependencies by packageType | BasicStrategy defaults | Deterministické Dependencies bez AI |

---

## Architektonická kontrola — checklist

- [x] Nevytváří / nespouští Runtime  
- [x] Neprovádí Recovery / nemění Registry  
- [x] Nepoužívá AI  
- [x] Pouze deklarativní popis  
- [ ] Architecture review PASS (čeká)

---

## Pipeline po PASS

```
Capability → Package → Hub → Registry → Manifest → Consumers
```
