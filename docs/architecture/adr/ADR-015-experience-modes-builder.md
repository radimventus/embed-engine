# ADR-015 — Experience Modes & Builder presentation configuration

**Status:** Accepted  
**Date:** 2026-07-23  
**Title:** Experience Modes are presentation configurations; Experience Host and Launch Context govern entry without forking Runtime  
**Depends on:** [ADR-001](./ADR-001-runtime-architecture.md), [ADR-014](./ADR-014-experience-launcher.md), [ELA-01](../platform/Experience-Launcher-Architecture.md), [EMB-01](../platform/Experience-Modes-and-Builder-Integration.md)  
**SSOT detail:** [Experience Modes & Builder Integration (EMB-01)](../platform/Experience-Modes-and-Builder-Integration.md)

**SSOT for:** Experience Host; Standalone / Launcher / Inline Experience Modes; Builder ownership of declarative `ExperiencePresentationConfig`; Launch Context; Delivery vs Runtime split for mode behaviour  
**Not SSOT for:** Builder UI, CMS persistence format, Runtime algorithms, Decision Journey content

---

## Context

Partner deployments need more than one **presence** of Client Studio (full page, overlay via Launcher, permanent inline slot). The platform will also grow beyond websites (Sales Terminal, Operations Terminal, QR entry, external applications).

Without a governed model, teams risk:

- forking Client Studio per channel,
- leaking overlay/chrome concerns into Runtime,
- treating Builder as a Delivery-engine configurator,
- polluting Decision Sessions with marketing/entry fields as domain facts.

ELA-01 defines Launcher Mode. EMB-01 / this ADR define the mode set, Host layer, Launch Context, and Builder/Delivery boundary.

---

## Decision

1. **Experience Host** is the environment that owns **starting** an Experience (Partner Website, Standalone Page, Sales Terminal, Operations Terminal, future QR Entry, External Application, …).
2. Embed Engine supports exactly three Experience Modes: **`standalone`**, **`launcher`** (partner default), **`inline`**. Mode is selected for a Host deployment; Runtime does not decide mode.
3. Stack is:

   ```text
   Experience Host → Experience Mode → Delivery Layer → Client Studio → Runtime Session
   ```

4. **Builder** creates only declarative **`ExperiencePresentationConfig`** (mode, Launcher metadata, Hero/Footer/Close chrome, Reveal / Landing Anchor, object binding). Builder **does not configure Delivery Layer** internals.
5. **Delivery Layer** interprets that config and realizes presentation (overlay, mount target, scroll restore, chrome flags, Session boundary).
6. **Launch Context** carries technical/marketing entry metadata from Host → Delivery → Session envelope (entry point, launcher id, referrer, campaign). It is **not** domain Decision logic and must not drive Interpretation, Priorities, Journey order, or Room selection.
7. **Runtime is mode-agnostic and host-agnostic** for meaning — sole semantic authority.
8. **One Client Studio** — modes change presentation chrome and entry behaviour via config flags, not alternate UI trees.
9. **Landing Anchor** defaults to **Social Proof** in Launcher Mode; future anchors must not require Runtime or Journey changes (see ELA-01 / ADR-014).
10. **Inline Mode** may hide Hero and/or Footer to avoid host duplication; this does not alter Decision Journey order or meaning.

---

## Why Experience Host and Launch Context

| Concept | Why introduced |
| --- | --- |
| **Experience Host** | Separates *where the Experience starts* from *how it is presented* and *what it means*. Enables Terminals, QR, and external apps without new Studios or Runtimes. |
| **Launch Context** | Captures entry/marketing/technical provenance for analytics and future continuity **without** mixing it into House Interpretation or Decision Moves. |

Without Host: every new channel invents an ad-hoc mount story.  
Without Launch Context: teams either lose entry provenance or shove campaign fields into domain Session state.

---

## Consequences

### Positive

- Unified deployment model across websites and future Terminals / QR / external apps.
- Clear Host → Mode → Delivery → Studio → Runtime pipeline.
- Builder stays declarative; Delivery stays operational; Runtime stays semantic.
- Prevents Runtime contamination by overlay/chrome/host kind.
- Extensible landing and Host catalogue without semantic forks.

### Negative / follow-up

- Delivery API must grow open/close + presentation config + Launch Context carriage.
- Studio shell must honour chrome flags and Close affordances.
- Builder UX must hide irrelevant options per mode.
- Session envelope policy for Launch Context storage must be specified at RI-002 implementation time (opaque, non-Interpretive).
- Inline Mode remains a compromise (layout collision risk) — not the partner default.

### Rejected alternatives

| Alternative | Why rejected |
| --- | --- |
| Separate Studio apps per mode or Host | Product fork; maintenance cost |
| Builder configures Delivery Layer behaviour | Couples CMS to infrastructure; wrong abstraction |
| Mode / Host flags inside Runtime as decision semantics | Mixes shell/entry with meaning |
| Campaign fields as Interpretation inputs | Pollutes Decision purity |
| Builder-controlled Journey reorder | Violates DEB-01 / Journey stability |
| Only Launcher + Standalone (no Inline) | Rejects real partner constraints; Inline kept as explicit non-default |

---

## Compliance

Implementations MUST follow [EMB-01](../platform/Experience-Modes-and-Builder-Integration.md) and remain consistent with [ELA-01](../platform/Experience-Launcher-Architecture.md) and [EDL-01](../platform/Experience-Delivery-Layer.md).

This ADR is **Accepted** as part of the Experience Delivery architecture freeze (with ADR-014 / ADR-016).

---

## Notes for Architecture Freeze

Bundle with ADR-014 / ELA-01:

- Experience Host catalogue (initial + extension rule),
- Mode matrix + Builder field list (`ExperiencePresentationConfig` only),
- Launch Context non-domain rules,
- Delivery responsibility table,
- Explicit “Runtime must not know mode/host as meaning”,
- Chrome flags contract for single Studio.
