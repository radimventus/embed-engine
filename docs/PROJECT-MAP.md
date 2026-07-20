# Project Map

One-page orientation for Embed Engine. Not a specification.

**Canonical architecture:** [architecture/README.md](./architecture/README.md) · [Decision Layer SSOT](./architecture/decision-layer/README.md) · [Governance v1](./architecture/decision-layer/decision-layer-governance-v1.md)

```text
Knowledge:      Object Package + Behavior Pack
Kernel:         Signal → reduce → DecisionState → project → Interpretation
Decision Layer: Decision Strategy → Decision Story → Decision Move
Experience:     Decision Terminal · Priority · FAQ · AI · Recommendation · …
Future:         Decision Trajectory (not MVP)
```

## Relationships

| Concept | Role | Canonical source |
| --- | --- | --- |
| **Product** | Principles and vision | `product/` |
| **Object Package** | Object truth | `product/object-package.md` |
| **Behavior Pack** | Knowledge, rules, Move library, composition — not UI | `architecture/behavior-pack-contract.md` |
| **Decision Layer** | Strategy · Story · Move · Terminal · Trajectory | `architecture/decision-layer/` |
| **Interpretation** | Reasoning snapshot | ADR-003 / CORE-001 |
| **Experience** | Surfaces that render | Experience Layer |
| **Client Studio** | Application renderer | apps — no domain reconstruction |
| **Archive** | History only | `archive/` |

## Rule of thumb

> Knowledge holds truth and profile guidance vocabulary.  
> Kernel produces Interpretation.  
> Decision Strategy composes the dialogue Story.  
> Experience only renders and emits Signals.

## Start here

1. [architecture/decision-layer/README.md](./architecture/decision-layer/README.md)  
2. [architecture/decision-layer/decision-layer-governance-v1.md](./architecture/decision-layer/decision-layer-governance-v1.md)  
3. [Living Experience v0.1 Freeze](./architecture/living-experience-v0.1-freeze.md)
