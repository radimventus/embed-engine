# Product documentation

Active product SSOT lives here.

| Path | Role |
| --- | --- |
| `constitution/` | Product principles, flywheel, moat, governance, CTO principles |
| `vision/` | Executive summary, vision, business model, founder vision |
| `object-package.md` | Object Package product contract (SSOT) |
| `knowledge/` | Knowledge Foundation (SSOT) |
| `pilots/` | Pilot Foundation (SSOT process) |
| `../pilot/` | **CAP-P01 knowledge model** — first Pilot Object + Behavior Pack |
| `post-foundation-development-policy.md` | Post-Foundation development policy (SSOT) |
| `builder/` | Builder product spec and workflow SSOT |
| `backlog/` | Product backlog (reaction-driven) |

**First pilot knowledge (CAP-P01):** [`../pilot/README.md`](../pilot/README.md) — Object `house-modern-01` + Behavior Pack `disposition-layout-v1`.


**Canonical source:** [`../architecture/decision-layer/README.md`](../architecture/decision-layer/README.md)

| Concept | One-line (link only — full text in SSOT) |
| --- | --- |
| Decision Move | Smallest guided step that can change the user's decision state |
| Decision Story | Ordered sequence of Decision Moves |
| Decision Strategy | Orchestration layer that composes the active Decision Story |
| Decision Terminal | Experience Surface that renders Decision Stories |
| Decision Trajectory | Future Architecture — not MVP |
| Behavior Pack | Knowledge, rules, Move library, composition — **not** UI |

**Governance:** [`../architecture/decision-layer/decision-layer-governance-v1.md`](../architecture/decision-layer/decision-layer-governance-v1.md)  
**Priority MVP:** [`../architecture/adr/ADR-007-priority-mvp-policy.md`](../architecture/adr/ADR-007-priority-mvp-policy.md)

## Product Bible

Historical monolith: [`../archive/product-bible/PRODUCT-BIBLE.md`](../archive/product-bible/PRODUCT-BIBLE.md)

**Not authoritative** for Decision Layer vocabulary. Where the Bible says “right panel”, “Priority Detail”, or static flows, prefer Decision Layer SSOT / ADR-007–010.
