# Decision Strategy — Layout Story Composition (CAP-P01)

**Canonical Strategy definition:** [Decision Strategy DT-002](../../architecture/decision-layer/decision-strategy.md)

This document **demonstrates** how Strategy composes the Layout Story using frozen architecture.  
It does not extend Strategy. It does not implement code.

---

## Single responsibility (reminder)

Compose the active Decision Story from **Interpretation** + **Behavior Pack**.

---

## When this Story is chosen

Strategy selects / composes `story.layout.disposition.v1` when **all** hold:

1. Active Behavior Pack includes `disposition-layout-v1` (or layout affinity is primary for the pilot).  
2. Interpretation leading topic / elevated priority is **`layout`**, **or** recent Signals are strongly layout-affine (`ROOM_VIEWED`, `FLOOR_CHANGED`, floorplan `MEDIA_OPENED`, layout `QUESTION_OPENED`).  
3. No higher-priority pack override is active (CAP-P01: only this pack).

Hybrid mode:

- **Select** spine `story.layout.disposition.v1`  
- **Compose** concrete eligibility: drop Moves whose triggers fail; splice `layout.warn-stairs-mobility` when `FLOOR_CHANGED` evidenced  

---

## Inputs used

| Input | Use |
| --- | --- |
| Interpretation | `priorities`, `activeTopic`, `events`, reasons, nextAction |
| Behavior Pack | Move library + composition rules in disposition-layout-v1 |
| Decision Trajectory | **Absent** (Future Architecture) |

Raw DecisionState is not read.

---

## Output

One active **Decision Story**:

- ordered Move references from the library  
- cursor on the first incomplete eligible Move  
- status per slot  

Example after buyer viewed living + changed to floor 1:

```text
completed: layout.confirm-focus, layout.discover-day-zone
active:    layout.discover-night-zone
pending:   interpret-day-night-split → … → recommend-disposition-fit
spliced:   warn-stairs-mobility (pending after night discover)
```

---

## Continuation

Strategy **owns** continuation: after each Interpretation update, recompose.  
Moves do not point to `nextMoveId`.

---

## What Strategy does not do

- Render Terminal UI  
- Invent Moves outside the Pack library  
- Hide Object Package weaknesses  
- Switch cognitive pipeline
