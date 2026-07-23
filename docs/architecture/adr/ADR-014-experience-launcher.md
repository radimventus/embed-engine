# ADR-014 — Experience Launcher as default partner entry

**Status:** Accepted  
**Date:** 2026-07-23  
**Title:** Experience Launcher Mode is the default entry into Client Studio on partner sites  
**Depends on:** [ADR-001](./ADR-001-runtime-architecture.md), [CORE-001](../platform/CORE-001-Platform-Architecture-Overview.md), [DEB-01](../../product/decision-experience/Decision-Experience-Blueprint.md)  
**SSOT detail:** [Experience Launcher Architecture (ELA-01)](../platform/Experience-Launcher-Architecture.md)

**SSOT for:** Decision to separate Experience Launcher from Client Studio; Launcher Mode as default partner entry; Landing Anchor and Launch → Reveal → Experience lifecycle  
**Not SSOT for:** Launcher visuals, Builder field schemas, Runtime algorithms, Decision Journey section content

---

## Context

Pilot placement of Client Studio on partner websites showed that partners already own header, footer, navigation, and layout. Permanent **inline** embedding of the full Client Studio collides with host UX and weakens the sense of entering a guided Decision Experience.

The product still needs a single Client Studio and an unchanged Decision Journey. The missing piece is a governed **entry and presence model**.

---

## Decision

1. **Experience Launcher** is the default entry point on partner sites. It is **not** part of Client Studio.
2. Activating the Launcher **Launches** Client Studio as a **fullscreen Experience overlay** above the host page (host page remains mounted underneath).
3. After Launch, **Reveal** brings the viewport to the configured **Landing Anchor**. Default Landing Anchor is **Social Proof**. Reveal may be implemented as smooth scroll (~0.5 s) or another technique; the architecture describes UX, not a mandatory scroll implementation.
4. **Landing Anchor** is extensible (e.g. Tour, Priority, AI Advisor) without changing Runtime or Decision Journey order.
5. Client Studio provides **„Zavřít Client Studio“** in left navigation and footer. Close restores host scroll and dismisses the overlay.
6. **Decision Journey section order does not change.** Only the entry path and initial viewport change.
7. **Standalone Mode** remains supported for QA, demos, and dedicated URLs — same Studio, different presence.
8. **Runtime remains the sole semantic authority.** Launch/Close are Delivery/shell lifecycle concerns, not Decision Layer Moves (unless a future ADR promotes them).

### Initial viewport principle

> **Client Studio SHALL NOT assume that the initial user viewport corresponds to the first rendered pixel of the Experience.**

Implications:

- **Hero remains part of the Decision Journey** and may still be the first content in the rendered document.
- The entry **Landing Anchor** (default: Social Proof) may differ from the start of the rendered document.
- **Decision Journey is not disrupted** — section order and meaning stay fixed; only where the user first *sees* the Experience is governed by Reveal + Landing Anchor.

UX lifecycle terms: **Launch → Reveal → Experience** (then Close).

---

## Consequences

### Positive

- Partner sites keep their chrome; Embed no longer fights host layout by default.
- Clear mental model: Launch → Reveal → Experience → leave.
- Single Client Studio binary; no product fork.
- Landing Anchor can evolve without Runtime or Journey forks.
- Aligns Embed Delivery with real pilot constraints.

### Negative / follow-up cost

- Delivery Layer must own overlay, scroll lock, focus, and Host restore.
- Studio shell needs Close affordances and Landing Anchor Reveal support.
- Builder must configure Launchers (and Landing Anchor) separately from Studio layout.
- Analytics must distinguish Launch/Close from in-Journey events.

### Rejected alternatives

| Alternative | Why rejected |
| --- | --- |
| Keep full inline CS as partner default | Collides with host header/footer/nav |
| Second “lite” Client Studio | Forks product; violates single Experience |
| Change Journey to start at Social Proof by removing Hero | Violates Journey stability; Hero remains part of Experience |
| Hard-wire “must smooth-scroll 500 ms” as architecture | Over-specifies implementation; Reveal is the UX phase |
| Put Launch/Close semantics in Runtime Decision Story | Mixes shell lifecycle with decision semantics |

---

## Compliance

Implementations of Launcher Mode MUST follow [ELA-01](../platform/Experience-Launcher-Architecture.md).

This ADR is **Accepted** as part of the Experience Delivery architecture freeze (with ADR-015 / ADR-016). Implementations of Launcher Mode MUST follow [ELA-01](../platform/Experience-Launcher-Architecture.md).

---

## Notes for Architecture Freeze

Recommend including ELA-01 in the next platform freeze package together with:

- Embed Delivery Launch/Close contract sketch,
- Client Studio shell Close + Landing Anchor / Reveal requirements,
- Explicit non-change of Decision Journey order (DEB-01 alignment),
- Initial viewport principle (first rendered pixel ≠ initial viewport).
