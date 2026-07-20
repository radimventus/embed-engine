# Architecture

**Canonical platform map:** [PROJECT-MAP.md](../PROJECT-MAP.md)  
**Decision Layer SSOT:** [decision-layer/](./decision-layer/)  
**Governance freeze:** [decision-layer/decision-layer-governance-v1.md](./decision-layer/decision-layer-governance-v1.md)

## Folders

| Path | Role |
| --- | --- |
| `decision-layer/` | **SSOT** for Strategy, Story, Move, Terminal, Trajectory |
| `core/` | Cognitive Layer (CORE-001 / CORE-002) |
| `adr/` | Architecture Decision Records |
| `experience/` | Experience projection notes; Terminal **modalities** only (defs → Decision Layer) |
| `living-experience-v0.1-freeze.md` | Cognitive sync freeze |
| `behavior-pack-contract.md` | Behavior Pack contract (not UI) |
| `runtime-*.md` | Runtime / Kernel boundaries |
| `archive/` | Historical only |

## Canonical architecture (one diagram)

```text
Knowledge:     Object Package + Behavior Pack
Kernel:        Signal → reduce → DecisionState → project → Interpretation
Decision Layer: Decision Strategy → Decision Story → Decision Move
Experience:    Decision Terminal · Priority · FAQ · AI · Recommendation · …
Future:        Decision Trajectory (optional Strategy input — not MVP)
```

Do not maintain competing diagrams. Superseded diagrams belong under `archive/` or carry an explicit Historical banner.
