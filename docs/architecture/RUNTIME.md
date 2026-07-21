# Runtime documentation

Navigation only. Not a specification.

## Authoritative hierarchy

| Priority | Document | Role |
| --- | --- | --- |
| **1 — SSOT** | [RI-001 — Runtime Kernel](../04-reference-implementation/RI-001-Runtime-Kernel.md) | Frozen Public Contract for Runtime / Kernel |
| **2 — Architecture decision** | [ADR-001 — Runtime Architecture](./adr/ADR-001-runtime-architecture.md) | Accepted façade / Kernel / infrastructure split |
| **3 — Cognitive freeze** | [Living Experience v0.1](./living-experience-v0.1-freeze.md) | Frozen Cognitive orchestration (`applySignal`) + Experience sync |
| **4 — Pipeline** | [ADR-003](./adr/ADR-003-cognitive-processing-pipeline.md) | `Signal → reduce → DecisionState → project → Interpretation` |

Supporting (not SSOT):

| Document | Role |
| --- | --- |
| [runtime-boundaries.md](./runtime-boundaries.md) | Package ownership / dependency direction after CAP-01 |
| [experience-projection.md](./experience-projection.md) | Experience projection principles (Interpretation / Story → surfaces) |

Historical (not normative):

| Document | Role |
| --- | --- |
| [archive/runtime-decisions-command-runtime-v1.md](./archive/runtime-decisions-command-runtime-v1.md) | CommandRuntime era: `dispatch(command) → ExperienceModel` |

## Terminology (normative)

| Term | Meaning |
| --- | --- |
| **Runtime** | Public CORE façade (`createRuntime`, lifecycle, state access) |
| **Kernel** | Internal orchestrator owned by Runtime; not a public API |
| **Signal** | Immutable Cognitive input |
| **Decision Session** | One active Experience decision journey ([RI-002](../04-reference-implementation/RI-002-Decision-Session.md)); hosted by Runtime |
| **DecisionState** | Sole Cognitive aggregate — authoritative contents of a Decision Session ([ADR-002](./adr/ADR-002-decision-state.md)) |
| **Interpretation** | Derived Cognitive output from `project()` |
| **Experience** | Presentation layer; renders and emits Signals ([RI-003](../04-reference-implementation/RI-003-Experience-Kernel.md)) |
| **dispatch** | Opaque RuntimeEvent routing on Cognitive Runtime; **not** the historical `dispatch(command) → ExperienceModel` CommandRuntime API |

## Decision Session

**SSOT:** [RI-002 — Decision Session](../04-reference-implementation/RI-002-Decision-Session.md)

Decision Session is the named boundary of one active visitor journey. It does **not** introduce a second Cognitive aggregate. DecisionState remains the sole Cognitive aggregate inside the Session.

## Experience

**Implementation contract:** [RI-003 — Experience Kernel](../04-reference-implementation/RI-003-Experience-Kernel.md)

Experience Layer = Experience Surfaces that render Interpretation / Story and emit Signals. Not Runtime Kernel.

| Term | Meaning |
| --- | --- |
| **Experience Surface** | Terminal, Priority, FAQ, AI, Recommendation, … |
| **Experience-local state** | Presentation only — not Decision Session truth |

## Rule

Historical CommandRuntime documentation MUST NOT override RI-001, ADR-001, or Living Experience v0.1.
