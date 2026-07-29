# EPIC-BLD-53 — Runtime Contract Manager Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-54)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Runtime Contract Manager spravuje veřejné Runtime kontrakty. Neroutuje API, nemění Runtime a neimplementuje business logiku — pouze registraci, verzování, validaci a publikaci kontraktů.

```
Gateway → Contracts → Compatibility → Manifest → Registry → Hub → Capabilities
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `8022f9c` | `feat(builder): implement runtime compatibility manager` (EPIC-BLD-52) |

---

## RuntimeContractManager

| Method | Role |
| --- | --- |
| `initialize()` | Create Contract Package |
| `register()` | Register RuntimeContract + operations |
| `publish()` / `validate()` / `dispose()` | Lifecycle |
| `deprecate()` | Mark contract Deprecated |

---

## Models

- **RuntimeContract** — id, name, version, capability, operations, dependencies, metadata  
- **RuntimeOperationContract** — id, operation, request, response, errors, metadata  
- **RuntimeContractPackage** — id, version, contracts, metadata (+ validation)

---

## RuntimeContractStrategy

**RuntimeContractStrategy** — `supports()` / `register()` / `publish()`  

**BasicRuntimeContractStrategy** — deterministické mapování input → contract descriptors

---

## RuntimeContractValidator / Index

**RuntimeContractValidator** — validate / validateContract / validateOperations / validateIntegrity  

**RuntimeContractIndex** — index / find / list / rebuild  

---

## Runtime Contracts Overview

Sekce Builderu `runtime-contracts` (nav **Runtime Contracts**):

- Contracts / Capability / Version / Operations / Compatibility / Validation  
- Register Contracts / Validate / Publish / Dispose  
- `data-testid="runtime-contracts-overview"`  

---

## Events

| Event | When |
| --- | --- |
| `RuntimeContractRegistered` | register |
| `RuntimeContractValidated` | validate |
| `RuntimeContractPublished` | publish |
| `RuntimeContractDeprecated` | deprecate |

---

## API

`createRuntimeContractApi(manager)`:

- `registerRuntimeContract()`
- `publishRuntimeContract()`
- `listRuntimeContracts()`
- `findRuntimeContract()`
- `validateRuntimeContract()`

---

## Screenshot

`apps/builder-studio/docs/bld-53-runtime-contracts-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (254) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| RuntimeContractPackage | + validation, timestamps | Overview Validation + lifecycle |
| `deprecate()` | mimo core list, ale event vyžaduje | Event RuntimeContractDeprecated |
| Demo bez Manifest | 3 demo contracts | Overview použitelný standalone |
| Manifest → contracts | preferuje Manifest capabilities | Contracts navazují na Manifest |

---

## Architektonická kontrola — checklist

- [x] Nemění Runtime / neroutuje API  
- [x] Neimplementuje business logiku / nevytváří Runtime objekty  
- [x] Nepoužívá AI / bez OpenAPI/SDK/codegen  
- [x] Pouze správa kontraktů  
- [ ] Architecture review PASS (čeká)

---

## Pipeline po PASS

```
Capability → Package → Integration → Registry → Manifest → Compatibility → Contracts → API Gateway
```
