# Reference Implementation

Epoch II specifications that freeze **how** frozen architecture is realized as implementable public contracts.

These documents do **not** change Reference Architecture, Platform Canon, ESS, or EQS.

| ID | Title | Status | Version | Role |
| --- | --- | --- | --- | --- |
| [RI-001](./RI-001-Runtime-Kernel.md) | Runtime Kernel | Frozen | 1.0 | **Runtime SSOT** |
| [RI-002](./RI-002-Decision-Session.md) | Decision Session | Frozen | 1.0 | **Decision Session SSOT** |
| [RI-003](./RI-003-Experience-Kernel.md) | Experience Kernel | Frozen | 1.0 | **Experience Layer implementation contract** |

**Implementation:** EX-01 + S-002 + S-003 Priority MVP + **S-004 Decision Terminal MVP** (ADR-008 Accepted). Default demo is Cognitive-only. CommandRuntime opt-in via `?legacyCommandRuntime=1`.

## Authority order

1. Platform Canon (when published as a discrete artifact)
2. Reference Architecture v1.0 (Conceptual Freeze)
3. [ESS-001](../03-specification-standard/ESS-001-Embed-Specification-Standard.md)
4. [EQS-001](../03-specification-standard/EQS-001-Engineering-Quality-Standard.md)
5. Accepted ADRs ([ADR-001](../architecture/adr/ADR-001-runtime-architecture.md) for Runtime; [ADR-002](../architecture/adr/ADR-002-decision-state.md) for DecisionState)
6. Reference Implementation specifications (this folder)

## Runtime / Session / Experience navigation

- Runtime index: [architecture/RUNTIME.md](../architecture/RUNTIME.md)
- Runtime SSOT: [RI-001](./RI-001-Runtime-Kernel.md)
- Decision Session SSOT: [RI-002](./RI-002-Decision-Session.md)
- Session philosophy: [PT-003 — Decision Sessions are Reproducible](../architecture/pt/PT-003-decision-sessions-are-reproducible.md)
- Experience contract: [RI-003](./RI-003-Experience-Kernel.md)
- Historical CommandRuntime: [archive/runtime-decisions-command-runtime-v1.md](../architecture/archive/runtime-decisions-command-runtime-v1.md)

## Related

- [ADR-001 — Runtime Architecture](../architecture/adr/ADR-001-runtime-architecture.md)
- [ADR-002 — DecisionState Aggregate](../architecture/adr/ADR-002-decision-state.md)
- [Decision Layer vocabulary](../architecture/decision-layer/README.md)
- [Living Experience v0.1 Freeze](../architecture/living-experience-v0.1-freeze.md)
- [Experience Projection Principles](../architecture/experience-projection.md)
