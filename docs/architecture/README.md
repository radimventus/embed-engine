# Architecture

**Canonical platform map:** [PROJECT-MAP.md](../PROJECT-MAP.md)  
**Runtime docs (start here):** [RUNTIME.md](./RUNTIME.md) — SSOT → [RI-001](../04-reference-implementation/RI-001-Runtime-Kernel.md)  
**Decision Layer SSOT:** [decision-layer/](./decision-layer/)  
**Governance freeze:** [decision-layer/decision-layer-governance-v1.md](./decision-layer/decision-layer-governance-v1.md)

## Folders

| Path | Role |
| --- | --- |
| [RUNTIME.md](./RUNTIME.md) | **Runtime documentation index** (SSOT hierarchy) |
| `decision-layer/` | **SSOT** for Strategy, Story, Move, Terminal, Trajectory |
| `core/` | Cognitive Layer (CORE-001 / CORE-002) |
| `adr/` | Architecture Decision Records ([ADR-001](./adr/ADR-001-runtime-architecture.md) Runtime) |
| `experience/` | Experience projection notes; Terminal **modalities** only (defs → Decision Layer) |
| `living-experience-v0.1-freeze.md` | Cognitive sync freeze |
| `behavior-pack-contract.md` | Behavior Pack contract (not UI) |
| `runtime-boundaries.md` | Supporting — package ownership / dependency direction |
| `experience-projection.md` | Supporting — Experience projection principles |
| `runtime-decisions.md` | Stub → historical CommandRuntime archive |
| `archive/` | Historical only (includes CommandRuntime Runtime Decisions) |
| [`../04-reference-implementation/RI-001-Runtime-Kernel.md`](../04-reference-implementation/RI-001-Runtime-Kernel.md) | **RI-001** — Runtime Kernel Public Contract (**Runtime SSOT**) |
| [`../04-reference-implementation/RI-002-Decision-Session.md`](../04-reference-implementation/RI-002-Decision-Session.md) | **RI-002** — Decision Session (**Session SSOT**) |

## Canonical architecture (one diagram)

```text
Knowledge:     Object Package + Behavior Pack
Kernel:        Signal → reduce → DecisionState → project → Interpretation
Decision Layer: Decision Strategy → Decision Story → Decision Move
Experience:    Decision Terminal · Priority · FAQ · AI · Recommendation · …
Future:        Decision Trajectory (optional Strategy input — not MVP)
```

Do not maintain competing diagrams. Superseded diagrams belong under `archive/` or carry an explicit Historical banner.
