# Pilot CAP-P01 — First Pilot Object + Behavior Pack

**Status:** CAP-P01–P03 complete · Guided pilot (S-005) · Commercial readiness (S-006A)  
**Date:** 2026-07-21  
**Architecture:** Frozen — [Decision Layer SSOT](../architecture/decision-layer/README.md)  
**Principle:** Help a real buyer make a better decision than browsing photos alone.

This folder holds the **first production-quality knowledge model** for one real pilot house.  
Runtime wiring for the Layout Story is delivered in CAP-P03 (`cap-p03-decision-runtime-mvp.md`).  
Client Studio guided journey continuity is S-005 (presentation only — no Runtime redesign).

---

## Guided story (Client Studio)

```text
Landing (Hero)
  → Media + House Navigator (#walkthrough)
  → Priority + Decision Terminal (#priority-experience)
  → Audit + Lead (#audit-lead-capture)
```

Locale: Czech throughout the customer-facing pilot (S-006A).  
AI Advisor is **visible** (`PILOT_FLAGS.showAiAdvisor: true`). Chat replies are still a Generation‑1 placeholder; FAQ / intro project Runtime AIContext only — see CSCB-06 discovery.  
Lead Capture uses mailto handoff (`kontakt@astav.cz`) until a backend is wired.

Operational docs for pilot deployment: [implementation/client-studio/production/](../implementation/client-studio/production/).

Vocabulary (one term per concept): Priorita · Rozhodnutí · Důvod · Další krok · Výsledek · Závazek · Audit · Poptávka.

---

## Contents

| Document | Role |
| --- | --- |
| [object/house-modern-01.md](./object/house-modern-01.md) | Canonical Pilot Object |
| [behavior-packs/disposition-layout-v1.md](./behavior-packs/disposition-layout-v1.md) | Behavior Pack v1 — **Disposition (Layout)** |
| [moves/disposition-layout-move-library.md](./moves/disposition-layout-move-library.md) | Reusable Decision Move library |
| [stories/layout-decision-story-v1.md](./stories/layout-decision-story-v1.md) | First complete Layout Decision Story |
| [strategy/layout-strategy-composition.md](./strategy/layout-strategy-composition.md) | How Strategy composes this Story |
| [terminal/layout-terminal-experience.md](./terminal/layout-terminal-experience.md) | Decision Terminal interaction (no UI mockups) |
| [dialogues/layout-dialogue-v1.md](./dialogues/layout-dialogue-v1.md) | **CAP-P02** — complete Layout decision dialogue |
| [cap-p03-decision-runtime-mvp.md](./cap-p03-decision-runtime-mvp.md) | **CAP-P03** — Decision Runtime MVP (working) |
| [validation.md](./validation.md) | Buyer decision-quality validation |
| [open-questions.md](./open-questions.md) | Architecture limitations discovered — **not fixed** |

---

## Pipeline exercised (frozen)

```text
Object Package (house-modern-01)
  + Behavior Pack (disposition-layout-v1)
        ↓
Interpretation (layout emphasis)
        ↓
Decision Strategy → Layout Decision Story → Decision Moves
        ↓
Decision Terminal (+ Priority / FAQ / AI peers)
        ↓
Decision Outcome (buyer understands layout fit)
```

Vocabulary: [Decision Layer](../architecture/decision-layer/README.md)  
Behavior Pack contract: [behavior-pack-contract.md](../architecture/behavior-pack-contract.md)  
Object Package product contract: [object-package.md](../product/object-package.md)

---

## Implementation note

Code fixture: `packages/object-house` → `REFERENCE_HOUSE_PACKAGE` (`house-modern-01`).  
Disposition Layout Strategy composer: `createDispositionLayoutComposer()`.  
Priority titles / Terminal CTA + whyNow: Pack presentation fields (`ctaLabel`, `whyNow`, `dispositionPriorityLabel`).  
This pilot docs set remains the **product knowledge SSOT**. Remaining gaps (branching, media, persistence) live in [`../product/backlog/PRODUCT_BACKLOG.md`](../product/backlog/PRODUCT_BACKLOG.md).
