# EPIC-BLD-47 — Runtime Operations Dashboard Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-48)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Runtime Operations Dashboard uzavírá první generaci Builder Studio jednotnou provozní projekcí. Nic nevyhodnocuje a nic nevytváří — pouze agreguje již publikované statusy Production Layer capability.

```
Published artifacts → Operations Snapshot (projection only)
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `e517fe0` | `feat(builder): implement runtime recovery reporting engine` (EPIC-BLD-46) |

---

## RuntimeOperationsDashboard

| Method | Role |
| --- | --- |
| `initialize()` / `refresh()` | Collect + aggregate → Operations Package |
| `collect()` | Normalize published status inputs |
| `publish()` / `dispose()` | Publish or archive projection package |

---

## Models

- **OperationsSnapshot** — id, runtimeExecutionId, policy/governance/health/audit/enforcement/recovery statuses, createdAt, metadata  
- **RuntimeOperationsPackage** — id, version, snapshot, metadata (+ validation)

---

## DashboardAggregationStrategy

**DashboardAggregationStrategy** — `supports()` / `collect()` / `aggregate()`  

**BasicDashboardAggregationStrategy** — deterministické mapování publikovaných statusů → snapshot

---

## RuntimeOperationsValidator / Index

**RuntimeOperationsValidator** — validate / validateSnapshot / validateAggregation / validateIntegrity  

**RuntimeOperationsIndex** — index / find / list / rebuild  

---

## Operations Overview

Sekce Builderu `runtime-operations` (nav **Operations**):

- Runtime Status / Policy / Governance / Health / Audit / Enforcement / Recovery / Last Report / Validation / Events  
- Collect Operations / Validate / Publish / Dispose  
- `data-testid="operations-overview"`  
- Pouze agregace již publikovaných dat  

---

## Events

| Event | When |
| --- | --- |
| `OperationsCollected` | refresh / initialize |
| `OperationsAggregated` | refresh / initialize |
| `OperationsValidated` | validate |
| `OperationsPublished` | publish |

---

## API

`createRuntimeOperationsApi(dashboard)`:

- `collectOperations()`
- `publishOperations()`
- `previewOperations()`
- `listSnapshots()`
- `validateOperations()`

---

## Screenshot

`apps/builder-studio/docs/bld-47-operations-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (224) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| RuntimeOperationsPackage | + validation, timestamps | Overview Validation + lifecycle |
| metadata.observabilityStatus / lastReport* | extended snapshot metadata | Overview Last Report + Observability projection |
| Demo bez prior packages | statuses default to `Unknown` | Overview použitelný standalone |

---

## Architektonická kontrola — checklist

- [x] Nemění Runtime / nevyhodnocuje Policy / nevytváří Governance  
- [x] Nevykonává Recovery / nepoužívá AI  
- [x] Pouze agregace existujících artefaktů  
- [x] Uzavírá první generaci Builder Studio provozního pohledu  
- [ ] Architecture review PASS (čeká)

---

## Pipeline po PASS

```
Production Layer
        │
Runtime Operations Dashboard  ← projection only
        │
Runtime Policy … Recovery Reporting
```
