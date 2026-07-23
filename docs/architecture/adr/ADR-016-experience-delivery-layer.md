# ADR-016 — Experience Delivery Layer

**Status:** Accepted  
**Date:** 2026-07-23  
**Title:** Experience Delivery Layer delivers Client Studio without owning Decision meaning  
**Depends on:** [ADR-001](./ADR-001-runtime-architecture.md), [ADR-014](./ADR-014-experience-launcher.md), [ADR-015](./ADR-015-experience-modes-builder.md), [ELA-01](../platform/Experience-Launcher-Architecture.md), [EMB-01](../platform/Experience-Modes-and-Builder-Integration.md), [EDL-01](../platform/Experience-Delivery-Layer.md)  
**SSOT detail:** [Experience Delivery Layer Architecture (EDL-01)](../platform/Experience-Delivery-Layer.md)

**SSOT for:** Existence and boundaries of the Experience Delivery Layer; delivery lifecycle and state model; Session bootstrap via Delivery Envelope; renderer independence  
**Not SSOT for:** Concrete Embed API, React mount code, Runtime algorithms, Builder UI

---

## Context

ELA-01 and EMB-01 define entry, Modes, Host, Builder presentation config, and Launch Context. The platform still needs a single named subsystem that **physically delivers** Client Studio across Hosts (website, Terminals, mobile, QR, external apps) without contaminating Runtime with overlay, mount, or chrome concerns.

Today’s Embed mount path is an embryonic Delivery Layer. Without an explicit architecture, Delivery risks absorbing domain logic—or Runtime risks absorbing presentation lifecycle.

---

## Decision

1. Introduce **Experience Delivery Layer** as the sole owner of Experience **presence**: mount, overlay/inline/standalone surfaces, viewport/focus, Host scroll lock/restore, Launch→Reveal→Active→Close→Dispose→Return Host lifecycle.
2. Delivery **interprets** Builder-published `ExperiencePresentationConfig`; Builder does **not** configure Delivery internals.
3. Delivery bootstraps Runtime via a **Delivery Envelope** (object binding + presentation snapshot + Launch Context + technical context). Launch Context remains **non-domain**.
4. **Runtime remains the only semantic authority** for Decision Session / Interpretation / Decision Layer.
5. Delivery **MUST NOT** assume a concrete renderer (React today; native / SSR later).
6. One Client Studio implementation; Delivery does not fork UI by Mode or Host.
7. Future Hosts (Sales Terminal, Operations Terminal, Mobile App, QR Entry, External Integrations) reuse Delivery without Runtime change.

---

## Consequences

### Positive

- Clear Host → Delivery → Studio → Runtime stack.
- Safe extension to Terminals / mobile / QR without Runtime forks.
- Prevents domain logic in mount/overlay code.
- Aligns with ELA-01 Reveal and EMB-01 presentation config.

### Negative / follow-up

- Existing `Embed.mount` must be mapped explicitly onto Delivery lifecycle states.
- Delivery Envelope storage rules need RI-002 alignment at implementation time.
- Multi-instance Delivery on one page remains constrained (see ED-EMB-01).

### Rejected alternatives

| Alternative | Why rejected |
| --- | --- |
| Runtime owns overlay / mount | Violates semantic purity; couples Kernel to Host UI |
| Client Studio owns Delivery | Mixes Journey UI with Host integration; harder native reuse |
| Separate Delivery per Host | Forks platform; duplicates lifecycle |
| Builder configures Delivery engines | Wrong abstraction (EMB-01) |

---

## Compliance

Implementations MUST follow [EDL-01](../platform/Experience-Delivery-Layer.md) and remain consistent with ELA-01 / EMB-01.

This ADR is **Accepted** as part of the Experience Delivery architecture freeze (with ADR-014 / ADR-015).

---

## Notes for Architecture Freeze

Bundle with ADR-014 / ADR-015:

- Delivery responsibility table,
- Lifecycle + state model,
- Delivery Envelope / Session bootstrap,
- Renderer independence statement,
- Host extension rule (no Runtime change).
