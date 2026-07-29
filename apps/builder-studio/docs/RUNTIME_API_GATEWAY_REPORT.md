# EPIC-BLD-51 — Runtime API Gateway Report

**Status:** Ready for architecture review  
**Commit:** deferred (Commit Strategy — wait for PASS / start of BLD-52)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Runtime API Gateway zavádí veřejnou hranici Runtime. Směruje požadavky na publikované capability bez business logiky, Decision nebo AI.

```
External Consumers → Gateway → Manifest → Registry → Hub → Capabilities
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `a0c8c49` | `feat(builder): implement runtime manifest engine` (EPIC-BLD-50) |

---

## RuntimeApiGateway

| Method | Role |
| --- | --- |
| `initialize()` | Create API Package + route registry |
| `resolve()` | Match capability.operation → route |
| `invoke()` | Passthrough routing acknowledgment (`Routed`) |
| `publish()` / `dispose()` | Publish or archive API package |

---

## Models

- **RuntimeApiRoute** — id, capability, operation, version, handler, metadata  
- **RuntimeApiRegistry** — id, routes, generatedAt, metadata  
- **RuntimeApiPackage** — id, version, registry, metadata (+ validation)

---

## RuntimeApiStrategy

**RuntimeApiStrategy** — `supports()` / `resolve()` / `invoke()`  

**BasicRuntimeApiStrategy** — deterministické route matching + passthrough (žádná business exekuce)

---

## RuntimeApiValidator / Index

**RuntimeApiValidator** — validate / validateRoutes / validateRegistry / validateIntegrity  

**RuntimeApiIndex** — index / find / list / rebuild  

---

## Runtime API Overview

Sekce Builderu `runtime-api` (nav **Runtime API**):

- Registered Routes / Capability / Version / Handler / Validation / Published API  
- Register Routes / Validate / Publish API / Dispose  
- `data-testid="runtime-api-overview"`  

---

## Events

| Event | When |
| --- | --- |
| `RuntimeRouteRegistered` | register |
| `RuntimeRouteResolved` | resolve / invoke |
| `RuntimeApiValidated` | validate |
| `RuntimeApiPublished` | publish |

---

## API

`createRuntimeApiGatewayApi(gateway)`:

- `registerRuntimeRoute()`
- `resolveRuntimeRoute()`
- `invokeRuntimeOperation()`
- `listRuntimeRoutes()`
- `validateRuntimeApi()`

---

## Screenshot

`apps/builder-studio/docs/bld-51-runtime-api-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (244) |
| build | pass |

---

## Odchylky od specifikace

| Spec | Implementace | Důvod |
| --- | --- | --- |
| RuntimeApiPackage | + validation, timestamps | Overview Validation + lifecycle |
| `invoke()` result | `RuntimeApiInvocationResult` status `Routed` | Žádná business exekuce — pouze routing ack |
| Demo bez Manifest | 3 demo routes | Overview použitelný standalone |
| Manifest → routes | preferuje Manifest capabilities | Gateway neobchází Manifest |

---

## Architektonická kontrola — checklist

- [x] Neobsahuje business logiku / nevytváří Runtime objekty  
- [x] Neprovádí Decision / nemění Runtime stav  
- [x] Neobchází Manifest ani Registry  
- [x] Nepoužívá AI  
- [ ] Architecture review PASS (čeká)

---

## Pipeline po PASS

```
External Consumers → Runtime API Gateway → Manifest → Registry → Hub → Capabilities
```
