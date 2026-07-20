# Decision Story v1 — Layout Disposition

**id:** `story.layout.disposition.v1`  
**Pack:** [disposition-layout-v1](../behavior-packs/disposition-layout-v1.md)  
**Object:** [house-modern-01](../object/house-modern-01.md)  
**Canonical Story definition:** [Decision Layer SSOT](../../architecture/decision-layer/README.md)

**Decision Story** = ordered sequence of Decision Moves (+ cursor/status).  
No Stage objects. Intents appear only as Move metadata.

---

## Target journey

Introduce → discover → interpret → compare → recommend  
(expressed as Move intents, not stages)

---

## Ordered Moves (9)

| # | Move id | Intent | Role in dialogue |
| --- | --- | --- | --- |
| 1 | `layout.confirm-focus` | confirm | Lock shared focus on disposition |
| 2 | `layout.discover-day-zone` | discover | Walk living / kitchen |
| 3 | `layout.discover-night-zone` | discover | Walk bedroom / children / bath |
| 4 | `layout.interpret-day-night-split` | interpret | Explain zoning logic |
| 5 | `layout.compare-living-kitchen` | compare | Trade-off: gathering vs cooking space |
| 6 | `layout.compare-indoor-garden` | compare | Indoor day zone vs garden life |
| 7 | `layout.warn-bath-contention` | interpret | Honest bath constraint |
| 8 | `layout.ask-household-shape` | discover | Who lives here? |
| 9 | `layout.recommend-disposition-fit` | recommend | Fit conclusion |

Optional insert when floors change early: `layout.warn-stairs-mobility` (after #3 or #4). Strategy may splice it per composition rules without a Stage model.

---

## Cursor semantics

- Start: Move #1 `active`; others `pending`.  
- On completion Signal: mark Move `completed`; Strategy advances cursor to next eligible Move.  
- Skip allowed: mark `skipped` if buyer jumps ahead via exploration Signals that satisfy a later Move’s completion early — Strategy recomposes rather than breaking the dialogue.

---

## Decision outcome (success)

Buyer can answer:

1. Does day/night split match our life?  
2. Can we live with kitchen size + dining placement?  
3. Is one upstairs bath acceptable for our mornings?  
4. Are stairs OK long-term?  
5. Therefore: pursue / pursue with conditions / reject on layout grounds.

That outcome is the Story’s product success — not “finished all screens.”
