# Decision Terminal

**Status:** Experience Layer concept (aligned with Decision Layer v1)  
**Date:** 2026-07-20  
**Depends on:** [Decision Layer](../decision-layer/decision-layer.md), Living Experience v0.1, ADR-008 (Proposed), ADR-009  
**Freeze (surface v0.1):** [decision-terminal-v0.1-freeze.md](./decision-terminal-v0.1-freeze.md)

Decision Terminal is an **Experience Surface**.  
It belongs to the **Experience Layer**.  
It is **not** part of Kernel or Runtime.

---

## Mission

Render **Decision Stories** (sequences of Decision Moves) so guided deciding is legible and actionable — on whatever channel the product chooses.

It answers:

> “What guided step(s) should the user take next, given the current Story?”

---

## What Decision Terminal is

- An Experience Surface that **renders Decision Stories** produced via Decision Strategy  
- A consumer of Interpretation (and Strategy/Story outputs once contracted)  
- Layout-agnostic  

### Rendering modalities (not architecture)

Decision Terminal **may** be rendered as:

- right panel  
- fullscreen  
- bottom sheet  
- AI conversation  
- voice  
- future interfaces  

**Right panel is one modality**, not the definition of Decision Terminal.

---

## What Decision Terminal is not

| Not this | Because |
| --- | --- |
| Kernel / Runtime component | Guidance rendering is Experience Layer |
| Decision Strategy | Strategy composes Stories; Terminal does not |
| Decision Move / Story author | Domain primitives live in Decision Layer / Behavior Pack |
| “Priority Detail” panel | Focus and Moves are domain; not a card inspector |
| Static hardcoded page flow | Stories are composed sequences of Moves |
| Decision Trajectory store | Trajectory is future architecture, not MVP |

---

## Responsibilities

1. Present the active Decision Story (and current Move context).  
2. Reflect Active Focus / Interpretation context needed to understand the Story.  
3. Collect user actions that complete, skip, or defer Moves → emit Signals.  
4. Stay coherent with peer surfaces (Priority, FAQ, AI Advisor, Recommendation).  

## Non-responsibilities

1. Selecting or composing Stories (Decision Strategy).  
2. Defining Move libraries (Behavior Pack).  
3. Writing DecisionState / calling reduce or project.  
4. Owning long-term Decision Trajectory.  

---

## Relationships

### Decision Layer

```text
Decision Strategy → Decision Story → Decision Move
                         ↓
                 Decision Terminal (renders)
```

### Interpretation

Terminal must not invent meaning. Understanding comes from Interpretation; guidance structure comes from Strategy/Story.

### Priority / FAQ / AI Advisor / Recommendation

Peer Experience surfaces. They share one mind (Interpretation). Terminal specializes in **guided Story rendering**; others specialize in filter, questions, conversation, recommendations.

### House Navigator / Media Explorer

Explorers emit Signals that change DecisionState → Interpretation → Strategy may recompose Story → Terminal updates. Explorers are not Terminals.

### Runtime / Kernel

Runtime delivers state and accepts Signals. Terminal never embeds Kernel logic.

---

## Active Focus

Terminal reacts to the **current focus of the decision process** (projected understanding), not to a private “selected Priority card” model.

Focus may evolve:

```text
single priority → combination → conflict → recommendation
```

These are focus shapes that Strategy may use when composing Stories.

---

## Decision Trajectory

See Decision Layer. **Future only.** Terminal must not implement Trajectory persistence in MVP.

---

## Supersessions

| Prior wording | Current |
| --- | --- |
| “Decision Terminal is NOT a right panel” | Terminal is **not defined as** a right panel; it **may** render as one |
| Decision Story = five conceptual screens | Story = ordered **Decision Moves**; stage names are optional narrative |
| Terminal hosts Story authorship | Terminal **renders**; Strategy **composes** |

---

## See also

- [Decision Layer](../decision-layer/decision-layer.md)  
- [Decision Layer v1 Freeze](../decision-layer/decision-layer-v1-freeze.md)  
- [Behavior Pack Contract](../behavior-pack-contract.md)  
- [ADR-008](../adr/ADR-008-decision-terminal.md) · [ADR-009](../adr/ADR-009-decision-layer.md)
