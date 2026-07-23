# ADR-018 — Experience Contract Governance

**Status:** Accepted  
**Date:** 2026-07-23  
**Title:** Experience Delivery contracts evolve under explicit versioning, compatibility, and deprecation governance  
**Depends on:** [ADR-014](./ADR-014-experience-launcher.md), [ADR-015](./ADR-015-experience-modes-builder.md), [ADR-016](./ADR-016-experience-delivery-layer.md), [ADR-017](./ADR-017-experience-delivery-implementation-contract.md), [ECG-01](../platform/Experience-Contract-Governance.md)  
**SSOT detail:** [Experience Contract Governance (ECG-01)](../platform/Experience-Contract-Governance.md)

**SSOT for:** Decision to govern Experience contract evolution (versioning, compatibility, stability, deprecation, ADR gates) and Viewport Ownership Contract  
**Not SSOT for:** Runtime algorithms, Delivery implementation, new architectural layers

---

## Context

ELA-01 / EMB-01 / EDL-01 and EDIC-01 define Experience Delivery architecture and implementation contracts. Implementation will require contract growth (optional fields, events, Host metadata).

Without governance, additive work risks:

- silent breaking changes for partner Hosts and Builder publish payloads,
- reinterpretation of Stable fields (Launch Context, Landing Anchor, Modes),
- responsibility bleed across Runtime / Delivery / Studio (including browser viewport),
- removals without deprecation.

Governance must manage evolution **without** amending ADR-014…017 architecture decisions and **without** changing Runtime or Delivery roles.

---

## Decision

1. Adopt **ECG-01** as the binding **Experience Contract Governance** SSOT.
2. Experience contracts (Delivery API, Launch, Runtime Bootstrap, Builder, Client Studio) version with **Patch / Minor / Major** as defined in ECG-01.
3. **Forward compatibility:** newer Delivery must work with older configuration when semantics hold.
4. **Backward compatibility:** new features are additive and must not change existing field/lifecycle meaning.
5. **Breaking changes** (meaning change, required-field removal, lifecycle change, layer responsibility change, Stable rename without deprecation, domain in Envelope) require **Major** + a **new ADR**.
6. Contracts are classified **Stable / Evolvable / Internal** per ECG-01.
7. Deprecation follows Introduced → Supported → Deprecated → Removed with minimum support windows in ECG-01.
8. ADR vs documentation vs implementation-only gates follow ECG-01 §8.
9. Ownership follows the Governance Matrix (Runtime / Delivery / Builder / Studio / Contracts→Architecture).
10. Adopt **Viewport Ownership Contract** (ECG-01 §9A): Delivery owns the browser viewport from successful Launch until Close completion; other layers use declarative requests only; exactly one viewport owner at a time.
11. This ADR and ECG-01 **do not modify** ADR-014…017 decisions; they only govern how future contract changes are approved and how viewport authority is enforced in implementations.

---

## Consequences

### Positive

- Implementers and reviewers share one compatibility bar.
- Partners and Builder publishers get predictable deprecation.
- Architecture freezes remain intact while contracts evolve additively.
- Viewport ownership conflicts (Launcher / Studio / Runtime / modules) are governed explicitly.

### Negative / follow-up

- Major bumps need ADR discipline (slower for true breaks — intentional).
- Contract version must be recorded on SSOT headers when Accepted revisions ship.
- First web mapping of Embed.mount must treat existing behaviour as baseline for compatibility tests.

### Rejected alternatives

| Alternative | Why rejected |
| --- | --- |
| “Change freely until TypeScript freeze” | Breaks Hosts/Builders before pilot scale |
| Put versioning only in code packages | Leaves architectural contracts undocumented |
| Amend ADR-014…017 via governance edits | Violates freeze; requires superseding ADR instead |
| Let Delivery own governance of Runtime APIs | Violates Runtime semantic authority |
| New ADR solely for Viewport Ownership | Unnecessary — clarifying governance rule, not new architecture |

---

## Compliance

Contract changes for Experience Delivery MUST follow [ECG-01](../platform/Experience-Contract-Governance.md).  
Viewport manipulation during Launch→Close MUST follow [ECG-01 §9A](../platform/Experience-Contract-Governance.md).

This ADR is **Accepted** as part of the Experience Contract Governance Freeze (with ECG-01). Governance acceptance does not by itself authorize Delivery or Runtime code changes beyond already-accepted implementation specs.

---

## Notes for maintainers

1. Link ECG-01 from EDIC-01 / EMB-01 / LRI-01 (references only).  
2. Any proposal that moves overlay/scroll ownership or Mode-as-meaning into Runtime → new ADR (not an ECG patch).  
3. Additive Landing Anchor ids and optional Launch Context fields → Minor, documentation update, no new ADR.
