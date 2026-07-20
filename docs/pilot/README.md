# Pilot CAP-P01 — First Pilot Object + Behavior Pack

**Status:** CAP-P01 complete · CAP-P02 dialogue validation in `dialogues/`  
**Date:** 2026-07-20  
**Architecture:** Frozen — [Decision Layer SSOT](../architecture/decision-layer/README.md)  
**Principle:** Help a real buyer make a better decision than browsing photos alone.

This folder holds the **first production-quality knowledge model** for one real pilot house.  
It is documentation / knowledge — not Runtime or React implementation.

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
| [dialogues/layout-dialogue-v1.md](./dialogues/layout-dialogue-v1.md) | **CAP-P02** — complete Layout decision dialogue (mind → decision) |
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

Code fixture already exists: `packages/object-house` → `REFERENCE_HOUSE_PACKAGE` (`house-modern-01`).  
This pilot docs set is the **product knowledge SSOT** for that object’s first Behavior Pack. Wiring Strategy/Terminal remains a later implementation epic (ADR-008 / DL-01).
