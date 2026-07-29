# EPIC-BLD-61 — Artifact Version Manager Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-62)  
**App:** `@embed-engine/builder-studio`

---

## Verdict

Artifact Version Manager zavádí jednotnou správu verzí napříč platformními artefakty. Neeviduje Git historii, nemění obsah artefaktů a neprovádí migrace. Je pouze centrálním registrem verzí a jejich lifecycle stavu.

```text
Publication Pipeline
    ↓
Artifact Version Manager
    ↓
Client Studio / Manager Studio / Sales Studio / Decision Runtime
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `1c408be` | `feat(builder): implement runtime session bootstrap` (EPIC-BLD-60) |

---

## ArtifactVersionManager

| Method | Role |
| --- | --- |
| `initialize()` | Create version package |
| `register()` | Register artifact version metadata |
| `activate()` | Mark active version |
| `deprecate()` | Mark deprecated version |
| `list()` | List managed packages |
| `dispose()` | Archive package |

---

## Models

- **ArtifactVersion** — artifactId, version, status, createdAt, metadata  
- **ArtifactVersionPackage** — package with version records  
- **ArtifactVersionStatus** — `ACTIVE` / `SUPPORTED` / `DEPRECATED` / `ARCHIVED`

---

## Strategy / Validator / Index

- **ArtifactVersionStrategy** — `supports()` / `register()` / `activate()`  
- **BasicArtifactVersionStrategy** — deterministic version lifecycle metadata  
- **ArtifactVersionValidator** — `validate()` / `validateVersion()` / `validateLifecycle()` / `validateIntegrity()`  
- **ArtifactVersionIndex** — index / find / list / rebuild

---

## Artifact Versions Overview

Sekce Builderu `artifact-versions` (nav **Artifact Versions**):

- Artifact / Current Version / Status / Created / Active  
- Register / Activate / Deprecate / Validate / Dispose  
- `data-testid="artifact-versions-overview"`

---

## Events

| Event | When |
| --- | --- |
| `ArtifactVersionRegistered` | register |
| `ArtifactVersionActivated` | activate |
| `ArtifactVersionDeprecated` | deprecate |
| `ArtifactVersionValidated` | validate |

---

## API

`createArtifactVersionApi(manager)`:

- `registerArtifactVersion()`
- `activateArtifactVersion()`
- `listArtifactVersions()`
- `findArtifactVersion()`
- `validateArtifactVersion()`

---

## Screenshot

`apps/builder-studio/docs/bld-61-artifact-versions-overview-screenshot.png`

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
| Aktivní verze | `status` + `metadata.active` | snadná diagnostická projekce v UI |
| ARCHIVED | stav podporovaný modelem, ale neautomatizovaný workflow | scope EPICu je metadata registry only |
| Demo input | bootstrap-first fallback | nové overview funguje i standalone |

---

## Architektonická kontrola — checklist

- [x] Nemění artefakty  
- [x] Neprovádí migrace / rollback / diff  
- [x] Nespouští Runtime / negeneruje Experience  
- [x] Bez Git integrace / deploymentu / AI  
- [x] Pouze centrální správa metadat verzí  
- [ ] Architecture review PASS (čeká)
