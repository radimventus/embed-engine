# Architecture Reviews (AR)

Architecture Reviews validate integrity of a frozen or proposed architecture generation.

They evaluate principles, boundaries, and readiness — not UI polish.

| ID | Document | Status | Scope |
| --- | --- | --- | --- |
| AR-001 | [Decision Architecture Review v1.0](./AR-001-decision-architecture-v1.md) | **PASSED (Conditional)** | PT-001–008, Runtime session pipeline, Experience Context, CAP roadmap |
| ED-DA-01 | [Boundary Hardening](./ED-DA-01-boundary-hardening.md) | **PASS** (ED-DA-01R closed dual stack) | Ownership / dependency / export policy |
| ED-DA-02 | [Media Projection Boundary](./ED-DA-02-media-projection-boundary.md) | **PARTIAL PASS** | Media UI on Experience Context; Object-owned catalog residual |
| ED-DA-03 | [Export Surface Hardening](./ED-DA-03-export-surface-hardening.md) | **PASS** | Public façade/contracts; pipeline on `/testing` |
| ED-DA-04 | [Context-only Provider](./ED-DA-04-context-only-provider.md) | **PASS** | Providers transport Experience + dispatch only |
| ED-DA-05 | [Flatten Session Experience](./ED-DA-05-flatten-session-experience.md) | **PASS** | `SessionExperience = { house, context }` |

**Architecture state:** [Decision Architecture v1.0 — FROZEN](../decision-architecture-v1.0-freeze.md) · Remaining work: **implementation only**

**Related**

- Platform Theory: [../pt/README.md](../pt/README.md)
- Engineering Debt: [../../implementation/Engineering Debt.md](../../implementation/Engineering%20Debt.md)
