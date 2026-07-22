# Architecture Decision Records

ADRs lock architectural decisions before implementation and freeze accepted boundaries.

| ADR | Title | Status |
| --- | --- | --- |
| [ADR-001](./ADR-001-runtime-architecture.md) | Runtime Architecture | Accepted |
| [ADR-002](./ADR-002-decision-state.md) | DecisionState Aggregate | Proposed → Accepted w/ Living Experience |
| [ADR-003](./ADR-003-cognitive-processing-pipeline.md) | Cognitive Processing Pipeline | Proposed → Accepted w/ Living Experience (annotated) |
| [ADR-006](./ADR-006-interpretation-projection-layer.md) | Interpretation & Projection Layer | Accepted (Soft Freeze) — annotated; Decision Layer is canonical for guidance |
| [ADR-007](./ADR-007-priority-mvp-policy.md) | Priority MVP Policy | Accepted |
| [ADR-008](./ADR-008-decision-terminal.md) | Decision Terminal implementation gate | Accepted |
| [ADR-009](./ADR-009-decision-layer.md) | Decision Layer | Accepted (definitions freeze) |
| [ADR-010](./ADR-010-decision-strategy.md) | Decision Strategy (DT-002) | Accepted (definitions freeze) |
| [ADR-011](./ADR-011-core-001-platform-overview.md) | Renumber Cognitive Layer to CORE-101 | Accepted |
| [ADR-012](./ADR-012-interpretation-first-class-artifact.md) | Interpretation as first-class domain artifact | Accepted |
| [ADR-013](./ADR-013-room-selection-semantic.md) | Room Selection is Semantic, not Graphical | Accepted |

**Platform Theory:** [../pt/README.md](../pt/README.md) (PT-001 Object · PT-002 Interpretation · PT-003 Sessions · PT-004 Decision Story · PT-005 Decision Moves)

**Vocabulary SSOT (not an ADR):** [../decision-layer/README.md](../decision-layer/README.md)  
**Runtime SSOT:** [../../04-reference-implementation/RI-001-Runtime-Kernel.md](../../04-reference-implementation/RI-001-Runtime-Kernel.md) · [../RUNTIME.md](../RUNTIME.md)  
**Decision Session SSOT:** [../../04-reference-implementation/RI-002-Decision-Session.md](../../04-reference-implementation/RI-002-Decision-Session.md)  
**Governance freeze:** [../decision-layer/decision-layer-governance-v1.md](../decision-layer/decision-layer-governance-v1.md) · tag `architecture-decision-layer-v1`

**Milestone freezes**

- [Living Experience v0.1](../living-experience-v0.1-freeze.md)
- [Decision Layer v1](../decision-layer/decision-layer-v1-freeze.md)
- [DT-002 Strategy](../decision-layer/decision-strategy-dt-002-freeze.md)
- [Behavior Pack Contract](../behavior-pack-contract.md)
- [Architecture overview](../README.md)
- [Runtime documentation index](../RUNTIME.md)

Legacy empty stub: `docs/adr/0001-platform.md`