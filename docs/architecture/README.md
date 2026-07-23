# Architecture

**Canonical platform map:** [PROJECT-MAP.md](../PROJECT-MAP.md)  
**Runtime docs (start here):** [RUNTIME.md](./RUNTIME.md) — SSOT → [RI-001](../04-reference-implementation/RI-001-Runtime-Kernel.md)  
**Decision Layer SSOT:** [decision-layer/](./decision-layer/)  
**Governance freeze:** [decision-layer/decision-layer-governance-v1.md](./decision-layer/decision-layer-governance-v1.md)

### Decision Architecture v1.0

| | |
| --- | --- |
| **State** | **ARCHITECTURE FROZEN** |
| **Review** | **PASSED (Conditional)** — [AR-001](./review/AR-001-decision-architecture-v1.md) |
| **Freeze** | [decision-architecture-v1.0-freeze.md](./decision-architecture-v1.0-freeze.md) |
| **Remaining work** | Implementation only (CAPs + ED-DA-\*) |

### Experience Delivery architecture (2026-07-23)

| | |
| --- | --- |
| **State** | **ACCEPTED** (architecture freeze `594cd8d`) |
| **SSOTs** | [ELA-01](./platform/Experience-Launcher-Architecture.md) · [EMB-01](./platform/Experience-Modes-and-Builder-Integration.md) · [EDL-01](./platform/Experience-Delivery-Layer.md) |
| **ADRs** | [ADR-014](./adr/ADR-014-experience-launcher.md) · [ADR-015](./adr/ADR-015-experience-modes-builder.md) · [ADR-016](./adr/ADR-016-experience-delivery-layer.md) |
| **Stack** | Experience Host → Launcher → Modes → Delivery → Client Studio → Runtime |

### Implementation Specification Freeze (2026-07-23)

| | |
| --- | --- |
| **State** | **ACCEPTED** |
| **Implementation Contracts** | [EDIC-01](./platform/Experience-Delivery-Implementation-Contract.md) · [ADR-017](./adr/ADR-017-experience-delivery-implementation-contract.md) |
| **Implementation Specifications** | [LRI-01](./platform/Launcher-Runtime-Integration-Specification.md) |
| **Doc tree** | Platform Constitution → Platform Architecture → Experience Architecture → Implementation Contracts → Implementation Specifications |
| **Next** | Implementation PTs (no further architectural decisions for Launch/Close/Reveal) |

## Folders

| Path | Role |
| --- | --- |
| [RUNTIME.md](./RUNTIME.md) | **Runtime documentation index** (SSOT hierarchy) |
| `decision-layer/` | **SSOT** for Strategy, Story, Move, Terminal, Trajectory |
| `platform/` | Platform Architecture Overview (CORE-001) · [Experience Launcher (ELA-01)](./platform/Experience-Launcher-Architecture.md) · [Experience Modes & Builder (EMB-01)](./platform/Experience-Modes-and-Builder-Integration.md) · [Experience Delivery Layer (EDL-01)](./platform/Experience-Delivery-Layer.md) · [Delivery Implementation Contract (EDIC-01)](./platform/Experience-Delivery-Implementation-Contract.md) · [Launcher Runtime Integration (LRI-01)](./platform/Launcher-Runtime-Integration-Specification.md) |
| `core/` | Cognitive Layer & Decision State (CORE-101 / CORE-002) |
| `adr/` | Architecture Decision Records ([ADR-001](./adr/ADR-001-runtime-architecture.md) Runtime · [ADR-013](./adr/ADR-013-room-selection-semantic.md) Room Selection · [ADR-014](./adr/ADR-014-experience-launcher.md)–[ADR-017](./adr/ADR-017-experience-delivery-implementation-contract.md) Experience Delivery stack + implementation contract) |
| `pt/` | Platform Theory ([PT-001](./pt/PT-001-house-package-canonical-object-contract.md) Object · [PT-002](./pt/PT-002-interpretation-is-the-product.md) Interpretation · [PT-003](./pt/PT-003-decision-sessions-are-reproducible.md) Sessions · [PT-004](./pt/PT-004-decision-story-is-the-product.md) Decision Story · [PT-005](./pt/PT-005-decision-experience-composed-from-moves.md) Decision Moves · [PT-006](./pt/PT-006-ai-explains-never-decides.md) AI Explains · [PT-007](./pt/PT-007-decision-terminal-is-the-outcome.md) Decision Terminal · [PT-008](./pt/PT-008-every-decision-experience-produces-outcome.md) Decision Outcome) |
| `review/` | Architecture Reviews ([AR-001 Decision Architecture v1.0](./review/AR-001-decision-architecture-v1.md)) |
| `contracts/` | Cross-layer runtime contracts (e.g. [Priority Experience Runtime Contract](./contracts/Priority%20Experience%20Runtime%20Contract.md)) |
| [Priority Experience Integration Model](./Priority%20Experience%20Integration%20Model.md) | End-to-end integration of Priority Experience SSOTs + OQ resolution |
| `domain/` | Domain models (e.g. [Priority Domain Model](./domain/Priority%20Domain%20Model.md)) |
| `experience/` | Experience projection notes; Terminal **modalities** only (defs → Decision Layer) |
| `decision-architecture-v1.0-freeze.md` | **Decision Architecture v1.0 — FROZEN** |
| `living-experience-v0.1-freeze.md` | Cognitive sync freeze |
| `behavior-pack-contract.md` | Behavior Pack contract (not UI) |
| `runtime-boundaries.md` | Supporting — package ownership / dependency direction |
| `experience-projection.md` | Supporting — Experience projection principles |
| `runtime-decisions.md` | Stub → historical CommandRuntime archive |
| `archive/` | Historical only (includes CommandRuntime Runtime Decisions) |
| [`../04-reference-implementation/RI-001-Runtime-Kernel.md`](../04-reference-implementation/RI-001-Runtime-Kernel.md) | **RI-001** — Runtime Kernel Public Contract (**Runtime SSOT**) |
| [`../04-reference-implementation/RI-002-Decision-Session.md`](../04-reference-implementation/RI-002-Decision-Session.md) | **RI-002** — Decision Session (**Session SSOT**) |
| [`../04-reference-implementation/RI-003-Experience-Kernel.md`](../04-reference-implementation/RI-003-Experience-Kernel.md) | **RI-003** — Experience Layer implementation contract |

## Canonical architecture (one diagram)

```text
Knowledge:     Object Package + Behavior Pack
Kernel:        Signal → reduce → DecisionState → project → Interpretation
Decision Layer: Decision Strategy → Decision Story → Decision Move
Experience:    Decision Terminal · Priority · FAQ · AI · Recommendation · …
Future:        Decision Trajectory (optional Strategy input — not MVP)
```

Do not maintain competing diagrams. Superseded diagrams belong under `archive/` or carry an explicit Historical banner.
