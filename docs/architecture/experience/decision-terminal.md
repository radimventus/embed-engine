# Decision Terminal — Experience Modalities

**Status:** Experience Layer notes (not definitional SSOT)  
**Canonical definition SSOT:** [../decision-layer/README.md](../decision-layer/README.md) · [../decision-layer/decision-layer.md § Terminal](../decision-layer/decision-layer.md#decision-terminal-experience-layer)  
**ADR:** [ADR-008](../adr/ADR-008-decision-terminal.md) (Proposed — implementation gate)

> **Do not redefine Decision Terminal here.**  
> Canonical: *An Experience Surface that renders Decision Stories. Not Kernel.*

---

## Role in Experience Layer

Decision Terminal renders the active **Decision Story** (composed by Decision Strategy).

Peer surfaces (Priority, FAQ, AI Advisor, Recommendation) primarily render **Interpretation**.  
They must stay coherent with the Terminal on the same Interpretation tick.

---

## Rendering modalities (not architecture)

Terminal **may** appear as:

- right panel  
- fullscreen  
- bottom sheet  
- AI conversation  
- voice  
- future interfaces  

“Right panel” is a modality — not the concept name.

---

## Forbidden

- Placing Terminal in Kernel / Runtime  
- Authoring Stories or Moves in React  
- Importing Behavior Pack rules into the Terminal  
- Implementing Decision Trajectory in the Terminal (Future Architecture only)

---

## Historical

[decision-terminal-v0.1-freeze.md](./decision-terminal-v0.1-freeze.md) — superseded in part by Decision Layer governance v1.
