# Embed Engine Documentation

Navigation index for project documentation. This file is not product documentation.

## Folders

| Folder | Purpose |
| --- | --- |
| `architecture/` | Cognitive, Decision Layer SSOT, Experience projection, Runtime index |
| `04-reference-implementation/` | Epoch II RIs (**RI-001** Runtime · **RI-002** Session · **RI-003** Experience) |
| `product/` | Product principles, vision, **DEG**, Object Package, Knowledge, Pilots, Builder, backlog |
| `design/` | Design language, geometry, design system tokens |
| `implementation/` | How to implement (frontend rules, AI agent rules) |
| `roadmap/` | Long-term product development phases |
| `architecture/adr/` | Architecture Decision Records |
| `architecture/decision-layer/` | **Canonical vocabulary** for Strategy · Story · Move · Terminal · Trajectory |
| `03-specification-standard/` | ESS / EQS — specification writing and engineering quality standards |
| `00-project/` | Project Principles (governance, not architecture) |
| `sprints/` | Active sprint working notes (not SSOT) |
| `archive/` | Historical documents — not active SSOT |
| `architecture/archive/` | Historical architecture records (e.g. CommandRuntime) |

## SSOT

Each covered area has exactly one Single Source of Truth (SSOT).

| Area | SSOT |
| --- | --- |
| Product Principles | `product/constitution/product-constitution.md` |
| Product Vision | `product/vision/product-vision.md` |
| **Decision Experience Grammar (DEG)** | **`product/decision-experience-grammar/DEG.md`** |
| Object Package | `product/object-package.md` |
| Knowledge Foundation | `product/knowledge/README.md` |
| Pilot Foundation | `product/pilots/README.md` |
| First Pilot (CAP-P01) | `pilot/README.md` |
| Post-Foundation Development Policy | `product/post-foundation-development-policy.md` |
| Foundation Milestone (v0.3) | `roadmap/milestone-v0.3-foundation-complete.md` |
| Roadmap | `roadmap/embed-engine-roadmap.md` |
| Architecture overview | `architecture/README.md` |
| **Runtime** | **`04-reference-implementation/RI-001-Runtime-Kernel.md`** |
| **Decision Session** | **`04-reference-implementation/RI-002-Decision-Session.md`** |
| **Experience Layer (impl contract)** | **`04-reference-implementation/RI-003-Experience-Kernel.md`** |
| DecisionState (Cognitive aggregate) | `architecture/adr/ADR-002-decision-state.md` (structure); Session boundary → RI-002 |
| Decision Layer vocabulary | `architecture/decision-layer/README.md` |
| Decision Layer governance v1 | `architecture/decision-layer/decision-layer-governance-v1.md` |
| Decision Strategy detail (DT-002) | `architecture/decision-layer/decision-strategy.md` |
| Embed Specification Standard (ESS-001) | `03-specification-standard/ESS-001-Embed-Specification-Standard.md` |
| Engineering Quality Standard (EQS-001) | `03-specification-standard/EQS-001-Engineering-Quality-Standard.md` |
| Project Principles (PP-001) | `00-project/PROJECT-PRINCIPLES.md` |
| Behavior Pack contract | `architecture/behavior-pack-contract.md` |
| Living Experience v0.1 | `architecture/living-experience-v0.1-freeze.md` |
| Experience projection | `architecture/experience-projection.md` |
| Decision Terminal modalities | `architecture/experience/decision-terminal.md` (defs → Decision Layer) |
| ADR index | `architecture/adr/README.md` |
| Builder workflow | `product/builder/Builder_Workflow_Specification_BWS_v0.1.md` |
| Design Language | `design/language/embed-engine-design-language-v1.md` |
| Geometry | `design/geometry/client-studio-geometry-spec.md` |
| Implementation | `implementation/frontend-implementation-guide.md` |
| Engineering Playbook | `implementation/engineering-playbook.md` |

### Runtime / Session documentation hierarchy

See **[architecture/RUNTIME.md](./architecture/RUNTIME.md)** (one-minute Runtime index).

| Role | Document |
| --- | --- |
| **Runtime SSOT** | [RI-001 — Runtime Kernel](./04-reference-implementation/RI-001-Runtime-Kernel.md) |
| **Decision Session SSOT** | [RI-002 — Decision Session](./04-reference-implementation/RI-002-Decision-Session.md) |
| **Experience contract** | [RI-003 — Experience Kernel](./04-reference-implementation/RI-003-Experience-Kernel.md) |
| Architecture decision (Runtime) | [ADR-001](./architecture/adr/ADR-001-runtime-architecture.md) |
| Cognitive aggregate | [ADR-002](./architecture/adr/ADR-002-decision-state.md) |
| Supporting | [runtime-boundaries.md](./architecture/runtime-boundaries.md), [experience-projection.md](./architecture/experience-projection.md) |
| Historical (CommandRuntime) | [archive/runtime-decisions-command-runtime-v1.md](./architecture/archive/runtime-decisions-command-runtime-v1.md) |

## Recommended reading order

1. [PROJECT-MAP.md](./PROJECT-MAP.md)
2. [architecture/RUNTIME.md](./architecture/RUNTIME.md) — Runtime SSOT pointer
3. [RI-001 — Runtime Kernel](./04-reference-implementation/RI-001-Runtime-Kernel.md)
4. [RI-002 — Decision Session](./04-reference-implementation/RI-002-Decision-Session.md)
5. [RI-003 — Experience Kernel](./04-reference-implementation/RI-003-Experience-Kernel.md)
6. [Decision Layer vocabulary](./architecture/decision-layer/README.md)
7. [Decision Layer governance v1](./architecture/decision-layer/decision-layer-governance-v1.md)
8. [Product Constitution](./product/constitution/product-constitution.md)
9. [Decision Experience Grammar (DEG)](./product/decision-experience-grammar/DEG.md) — **product layer SSOT**
10. [Living Experience v0.1 Freeze](./architecture/living-experience-v0.1-freeze.md)
11. Active design / implementation guides as needed

Do not start with `archive/` or treat CommandRuntime docs as current.

## Project map

See [PROJECT-MAP.md](./PROJECT-MAP.md).
