# Decision Layer — Vocabulary & SSOT Index

**Status:** CORE (change only via ADR)  
**Governance:** [decision-layer-governance-v1.md](./decision-layer-governance-v1.md)  
**Layer overview:** [decision-layer.md](./decision-layer.md)  
**Strategy detail (DT-002):** [decision-strategy.md](./decision-strategy.md)

This directory is the **only canonical source** for Decision Layer vocabulary.

Other documents must **link here**. They must **not** redefine these terms.

---

## Canonical definitions (do not paraphrase elsewhere)

| Concept | Canonical definition | Detail | Stability |
| --- | --- | --- | --- |
| **Decision Move** | The smallest guided step that can change the user's decision state. | [decision-layer.md § Move](./decision-layer.md#decision-move) | **CORE** |
| **Decision Story** | An ordered sequence of Decision Moves (plus cursor/status). | [decision-layer.md § Story](./decision-layer.md#decision-story) | **CORE** |
| **Decision Strategy** | The orchestration layer that composes the active Decision Story from Interpretation and Behavior Pack. | [decision-strategy.md](./decision-strategy.md) | **CORE** |
| **Decision Terminal** | An Experience Surface that renders Decision Stories. Not Kernel. | [decision-layer.md § Terminal](./decision-layer.md#decision-terminal-experience-layer) | **CORE** |
| **Decision Trajectory** | Long-term evolution of the decision process. | [decision-layer.md § Trajectory](./decision-layer.md#decision-trajectory) | **Future Architecture** (not MVP) |
| **Behavior Pack** | Provides domain knowledge, decision rules, Decision Move library, Story composition rules. Does **not** modify UI. | [../behavior-pack-contract.md](../behavior-pack-contract.md) | **CORE** (responsibilities) |

---

## ADRs

| ADR | Topic |
| --- | --- |
| [ADR-009](../adr/ADR-009-decision-layer.md) | Decision Layer definitions |
| [ADR-010](../adr/ADR-010-decision-strategy.md) | Decision Strategy (DT-002) |
| [ADR-008](../adr/ADR-008-decision-terminal.md) | Terminal implementation authorization (Accepted) |

---

## Rejected terminology

| Obsolete | Canonical |
| --- | --- |
| Right panel (as architecture) | Rendering modality of Decision Terminal |
| Priority Detail | Not a domain concept |
| Static Story / Hardcoded Story / Flow Page | Rejected — Stories are composed |
| Stages / Acts / Chapters (first-class) | Optional Move intents only |
| Behavior Pack as UI modifier | Rejected |
| Terminal in Kernel | Rejected |
