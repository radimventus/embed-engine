# ADR-017 — Experience Delivery Implementation Contract

**Status:** Accepted  
**Date:** 2026-07-23  
**Title:** Delivery implementations MUST obey a shared Launch / Event / boundary contract  
**Depends on:** [ADR-016](./ADR-016-experience-delivery-layer.md), [ADR-015](./ADR-015-experience-modes-builder.md), [ADR-014](./ADR-014-experience-launcher.md), [ADR-001](./ADR-001-runtime-architecture.md), [EDL-01](../platform/Experience-Delivery-Layer.md), [EDIC-01](../platform/Experience-Delivery-Implementation-Contract.md)  
**SSOT detail:** [Experience Delivery Implementation Contract (EDIC-01)](../platform/Experience-Delivery-Implementation-Contract.md)  
**Companion sequencing:** [LRI-01 — Launcher Runtime Integration Specification](../platform/Launcher-Runtime-Integration-Specification.md)

**SSOT for:** Binding implementation contract among Builder, Delivery, Client Studio, and Runtime for Launch/Close and lifecycle events  
**Not SSOT for:** TypeScript APIs, framework choice, Runtime algorithms

---

## Context

ELA-01 / EMB-01 / EDL-01 and ADR-014…016 define architecture. Implementers still need an unambiguous contract for:

- what a Launch Request contains,
- what events Delivery emits,
- what Builder may publish,
- what Runtime may receive,
- what Client Studio may assume,

without inventing TypeScript or React specifics prematurely.

---

## Decision

1. Adopt **EDIC-01** as the binding **Experience Delivery Implementation Contract**.
2. Delivery MUST expose architectural operations: Launch, Close, GetState, Subscribe (events).
3. Launch Request MUST separate **Experience Configuration**, **Launch Context**, and **Runtime Bootstrap** groups as defined in EDIC-01.
4. Delivery MUST emit the standard lifecycle events (LaunchRequested → … → ReturnedToHost).
5. Builder MUST only supply declarative `ExperiencePresentationConfig` (and related publish metadata) — never Delivery mechanics.
6. Runtime MUST remain unaware of Mode/Host presentation; Launch Context is opaque/non-Interpretive at the Session boundary.
7. Client Studio MUST consume mount/runtime/viewport readiness and MUST NOT own Delivery.
8. Architectural error handling for launch / bootstrap / reveal / close failures follows EDIC-01.
9. Ordered Launcher Mode integration (bootstrap / Reveal / Close / acceptance scenario) follows **LRI-01**.

---

## Consequences

### Positive

- Clear handoff for implementation PTs.
- Prevents Builder/Delivery/Runtime responsibility bleed.
- Enables multiple Delivery backends (web, native) under one contract.

### Negative / follow-up

- First web implementation must map `Embed.mount` onto Launch/Close + events.
- Event analytics wiring is a separate PT.
- Reveal failure policy (degrade vs force Close) may need product confirmation per Mode.

### Rejected alternatives

| Alternative | Why rejected |
| --- | --- |
| Start coding from EDL-01 alone | Too many ambiguous message shapes |
| Freeze TypeScript interfaces in this ADR | Premature; contract is architectural |
| Let Studio bootstrap Runtime when Host-launched | Breaks Delivery boundary (EDL-01) |

---

## Compliance

Implementations MUST follow [EDIC-01](../platform/Experience-Delivery-Implementation-Contract.md).  
Launcher Mode integration sequencing MUST follow [LRI-01](../platform/Launcher-Runtime-Integration-Specification.md).

This ADR is **Accepted** as part of the Implementation Specification Freeze (with EDIC-01 / LRI-01). Implementation may begin from these contracts without further architectural decisions on Launch/Close/Events boundaries.

---

## Notes for implementation PTs

Recommended order after acceptance:

1. Map web Embed entry points to Launch/Close + events.
2. Wire PresentationChrome + Landing Anchor Reveal (LRI-01).
3. Attach Launch Context as opaque Session envelope.
4. Add Host adapter tests for lifecycle events (not domain tests).
5. Validate against LRI-01 Partner Website acceptance scenario.
