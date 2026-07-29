# EPIC-BLD-62 — Artifact Dependency Registry Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-63)  
**App:** `@embed-engine/builder-studio`

---

## Verdict

Artifact Dependency Registry zavádí formální model vazeb mezi platformními artefakty. Registry pouze eviduje a validuje dependency graph, nevytváří artefakty, nic nedeployuje a neřeší automatické dependency resolution.

```text
Artifact Version Manager
    ↓
Artifact Dependency Registry
    ↓
Client Studio / Manager Studio / Sales Studio / Decision Runtime
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `9023380` | `feat(builder): implement artifact version manager` (EPIC-BLD-61) |

---

## ArtifactDependencyRegistry

| Method | Role |
| --- | --- |
| `initialize()` | Create dependency package |
| `register()` | Register dependency edge |
| `remove()` | Mark dependency removed |
| `find()` | Find relations for artifact |
| `list()` | List dependency packages |
| `dispose()` | Archive package |

---

## Models

- **ArtifactDependency** — sourceArtifactId, targetArtifactId, dependencyType, status, metadata  
- **ArtifactDependencyPackage** — dependency edge set package  
- **ArtifactDependencyType** — `REQUIRES` / `OPTIONAL` / `DERIVED_FROM` / `REFERENCES`

---

## Strategy / Validator / Index

- **ArtifactDependencyStrategy** — `supports()` / `register()` / `validate()`  
- **BasicArtifactDependencyStrategy** — deterministic dependency metadata creation  
- **ArtifactDependencyValidator** — `validate()` / `validateGraph()` / `validateCycles()` / `validateIntegrity()`  
- **ArtifactDependencyIndex** — index / find / list / rebuild

---

## Artifact Dependencies Overview

Sekce Builderu `artifact-dependencies` (nav **Artifact Dependencies**):

- Source / Target / Dependency Type / Status  
- Register / Remove / Validate / Dispose  
- `data-testid="artifact-dependencies-overview"`

---

## Events

| Event | When |
| --- | --- |
| `ArtifactDependencyRegistered` | register |
| `ArtifactDependencyRemoved` | remove |
| `ArtifactDependencyValidated` | validate |
| `ArtifactDependencyIndexed` | index rebuild/store |

---

## API

`createArtifactDependencyApi(registry)`:

- `registerArtifactDependency()`
- `removeArtifactDependency()`
- `listArtifactDependencies()`
- `findArtifactDependency()`
- `validateArtifactDependencies()`

---

## Screenshot

`apps/builder-studio/docs/bld-62-artifact-dependencies-overview-screenshot.png`

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
| remove() | soft-remove přes `status: Removed` | lepší diagnostická stopa v overview |
| validate() | warning na graph issues, error na cycles/integrity | čitelnější gate nad dependency grafem |
| demo wiring | bootstrap -> client publication fallback | overview je použitelný standalone |

---

## Architektonická kontrola — checklist

- [x] Nevytváří artefakty  
- [x] Nemění artefakty / neřeší deployment  
- [x] Nespouští Runtime / bez AI  
- [x] Bez migrací / bez automatického řešení závislostí  
- [x] Pouze evidence a validace závislostí  
- [ ] Architecture review PASS (čeká)
