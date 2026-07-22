# Project Map

One-page orientation for Embed Engine. Not a specification.

**Canonical architecture:** [architecture/README.md](./architecture/README.md) · [RUNTIME.md](./architecture/RUNTIME.md) · [Decision Layer SSOT](./architecture/decision-layer/README.md) · [Governance v1](./architecture/decision-layer/decision-layer-governance-v1.md)

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
| **Decision Experience Grammar (DEG)** | Product layer — Mental State / Experience operations | [`product/decision-experience-grammar/DEG.md`](./product/decision-experience-grammar/DEG.md) |
| **Decision Journey (DJS)** | Visit trajectory of mental transformations (Proposed) | [`product/decision-journey/DJS.md`](./product/decision-journey/DJS.md) |
| **Business Intelligence** | Market, Strategic Accounts, Relationships, GTM knowledge | [`business/README.md`](./business/README.md) |
| **Object Package** | Object truth | `product/object-package.md` |
| **House Package** | House-vertical object distribution contract | [HP-001](./03-specification-standard/HP-001-House-Package-Specification.md) · platform theory [PT-001](./architecture/pt/PT-001-house-package-canonical-object-contract.md) |
| **Interpretation** | Canonical platform product (meaning) | [PT-002](./architecture/pt/PT-002-interpretation-is-the-product.md) · [ADR-012](./architecture/adr/ADR-012-interpretation-first-class-artifact.md) |
| **Behavior Pack** | Knowledge, rules, Move library, composition — not UI | `architecture/behavior-pack-contract.md` |
| **Runtime / Kernel** | Public façade + internal orchestration | **[RI-001](./04-reference-implementation/RI-001-Runtime-Kernel.md)** · [RUNTIME.md](./architecture/RUNTIME.md) · [ADR-001](./architecture/adr/ADR-001-runtime-architecture.md) |
| **Decision Session** | One active Experience decision journey | **[RI-002](./04-reference-implementation/RI-002-Decision-Session.md)** |
| **DecisionState** | Sole Cognitive aggregate (Session core) | ADR-002 / CORE-002 |
| **Decision Layer** | Strategy · Story · Move · Terminal · Trajectory | `architecture/decision-layer/` |
| **Interpretation** | Reasoning snapshot | ADR-003 / CORE-101 |
| **Experience** | Surfaces that render; emit Signals | **[RI-003](./04-reference-implementation/RI-003-Experience-Kernel.md)** · Experience Layer |
| **Client Studio** | Decision Workspace (not page builder) | apps — Experience host; product intent → DEG |
| **Archive** | History only (incl. CommandRuntime) | `archive/` · `architecture/archive/` |

## Rule of thumb

> Knowledge holds truth and profile guidance vocabulary.  
> DEG designs Mental State transitions.  
> Kernel produces Interpretation.  
> Decision Strategy composes the dialogue Story.  
> Experience only renders and emits Signals.

## Start here

1. [architecture/RUNTIME.md](./architecture/RUNTIME.md) — Runtime SSOT in one page  
2. [RI-001 — Runtime Kernel](./04-reference-implementation/RI-001-Runtime-Kernel.md)  
3. [RI-002 — Decision Session](./04-reference-implementation/RI-002-Decision-Session.md)  
4. [RI-003 — Experience Kernel](./04-reference-implementation/RI-003-Experience-Kernel.md)  
5. [architecture/decision-layer/README.md](./architecture/decision-layer/README.md)  
6. [architecture/decision-layer/decision-layer-governance-v1.md](./architecture/decision-layer/decision-layer-governance-v1.md)  
7. [Living Experience v0.1 Freeze](./architecture/living-experience-v0.1-freeze.md)
