# Product documentation

Active product SSOT lives here.

| Path | Role |
| --- | --- |
| `constitution/` | Product principles, flywheel, moat, governance, CTO principles |
| `vision/` | Executive summary, vision, business model, founder vision |
| `object-package.md` | Object Package product contract (SSOT) |
| `knowledge/` | Knowledge Foundation (SSOT) |
| `pilots/` | Pilot Foundation (SSOT) |
| `post-foundation-development-policy.md` | Post-Foundation development policy (SSOT) |
| `builder/` | Builder product spec and workflow SSOT |
| `backlog/` | Product backlog (reaction-driven; includes Post-MVP Priority items) |

Historical Product Bible monolith: `../archive/product-bible/PRODUCT-BIBLE.md`

**Priority MVP policy (SSOT):** [`../architecture/adr/ADR-007-priority-mvp-policy.md`](../architecture/adr/ADR-007-priority-mvp-policy.md) — absolute weights, single visitor, active-Experience-only DecisionState. Do not treat archived Product Bible Priority notes as authoritative when they conflict with ADR-007.

**Decision Layer (SSOT):** [`../architecture/decision-layer/decision-layer.md`](../architecture/decision-layer/decision-layer.md) — Strategy → Story → Move.

**Decision Strategy (DT-002):** [`../architecture/decision-layer/decision-strategy.md`](../architecture/decision-layer/decision-strategy.md) — single responsibility: compose active Story. ADR-010 Accepted.

**Decision Terminal (Experience Surface):** [`../architecture/experience/decision-terminal.md`](../architecture/experience/decision-terminal.md) — renders Stories; may appear as panel/sheet/voice/…. ADR-008 Proposed.

**Behavior Pack:** knowledge, decision rules, Move library, Story composition — not UI. Contract: [`../architecture/behavior-pack-contract.md`](../architecture/behavior-pack-contract.md).

Archived Product Bible remains historical; ADR-007 / ADR-009 / ADR-010 / Decision Layer supersede conflicting Priority / “right panel” / static-flow / Stage-as-container language.
