# EPIC-BLD-52 — Runtime Compatibility Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-53)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Runtime Compatibility Manager rozhoduje o kompatibilitě verzí Runtime / Manifest / API. Neprovádí migrace a nemění artefakty — pouze deterministické vyhodnocení.

```
Gateway → Compatibility Manager → Manifest → Registry → Hub → Capabilities
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `26548ac` | `feat(builder): implement runtime api gateway` (EPIC-BLD-51) |

---

## RuntimeCompatibilityManager

| Method | Role |
| --- | --- |
| `initialize()` | Create Compatibility Package + Matrix |
| `register()` | Evidence CompatibilityRule |
| `evaluate()` | Deterministic source→target evaluation |
| `publish()` / `dispose()` | Publish or archive package |

---

## Models

- **RuntimeCompatibilityMatrix** — runtime/manifest/api versions, consumers, rules  
- **CompatibilityRule** — sourceVersion, targetVersion, status, reason  
- **RuntimeCompatibilityPackage** — id, version, matrix, metadata (+ validation)

---

## RuntimeCompatibilityStrategy

**RuntimeCompatibilityStrategy** — `supports()` / `evaluate()` / `publish()`  

**BasicRuntimeCompatibilityStrategy** — explicit rule match, else major-version heuristic

---

## RuntimeCompatibilityValidator / Index

**RuntimeCompatibilityValidator** — validate / validateMatrix / validateRules / validateIntegrity  

**RuntimeCompatibilityIndex** — index / find / list / rebuild  

---

## Runtime Compatibility Overview

Sekce Builderu `runtime-compatibility` (nav **Runtime Compatibility**):

- Runtime / Manifest / API Version / Compatibility Matrix / Rules / Validation  
- Register Matrix / Evaluate / Validate / Publish / Dispose  
- `data-testid="runtime-compatibility-overview"`  

---

## Events

| Event | When |
| --- | --- |
| `CompatibilityRegistered` | register |
| `CompatibilityEvaluated` | evaluate |
| `CompatibilityValidated` | validate |
| `CompatibilityPublished` | publish |

---

## API

`createRuntimeCompatibilityApi(manager)`:

- `evaluateCompatibility()`
- `publishCompatibility()`
- `listCompatibilityRules()`
- `findCompatibility()`
- `validateCompatibility()`

---

## Screenshot

`apps/builder-studio/docs/bld-52-runtime-compatibility-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (249) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| RuntimeCompatibilityPackage | + validation, timestamps | Overview Validation + lifecycle |
| Fallback without rule | major-version heuristic | Deterministické evaluate i bez explicit rule |
| Demo matrix | includes Compatible + Incompatible rules | Overview ukazuje Rules + overallStatus |

---

## Architektonická kontrola — checklist

- [x] Nemění Runtime / Manifest / API  
- [x] Neprovádí migrace / upgrady / rollback  
- [x] Nepoužívá AI  
- [x] Pouze deterministické vyhodnocení  
- [ ] Architecture review PASS (čeká)

---

## Pipeline po PASS

```
External Consumers → Gateway → Compatibility Manager → Manifest → Registry → Hub
```
