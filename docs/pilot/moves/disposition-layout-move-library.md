# Decision Move Library — Disposition (Layout) v1

**Pack:** [disposition-layout-v1](../behavior-packs/disposition-layout-v1.md)  
**Canonical Move definition:** [Decision Layer SSOT](../../architecture/decision-layer/README.md)

Each Move is a domain primitive: **the smallest guided step that can change the user's decision state.**

No UI. No React. No HTML.

---

## Library

### `layout.confirm-focus`

| Field | Content |
| --- | --- |
| **Purpose** | Confirm that disposition/layout is the active decision focus. |
| **Intent** | `confirm` |
| **Trigger** | Interpretation leading topic is layout, or buyer selected layout priority / opened disposition question. |
| **Expected outcome** | Buyer and system share the same Active Focus: layout. |
| **Completion signal** | `QUESTION_OPENED` with `questionId: layout` **or** Strategy marks confirm after Interpretation already shows layout elevated with reason. |

---

### `layout.discover-day-zone`

| Field | Content |
| --- | --- |
| **Purpose** | Have the buyer experience the ground-floor day zone (living / kitchen). |
| **Intent** | `discover` |
| **Trigger** | Layout focus active; day-zone rooms not yet evidenced in recent Focus (no `room-living` / `room-kitchen` viewed this session). |
| **Expected outcome** | Buyer has a spatial mental model of social life downstairs. |
| **Completion signal** | `ROOM_VIEWED` with `roomId` in `{room-living, room-kitchen}` |

---

### `layout.discover-night-zone`

| Field | Content |
| --- | --- |
| **Purpose** | Have the buyer experience the upper night zone (bedroom / children / bath). |
| **Intent** | `discover` |
| **Trigger** | Day zone discovered or floor change available; night rooms under-explored. |
| **Expected outcome** | Buyer understands rest/privacy separation upstairs. |
| **Completion signal** | `ROOM_VIEWED` with `roomId` in `{room-bedroom, room-children, room-bath}` **or** `FLOOR_CHANGED` to floor `1` followed by any night room view. |

---

### `layout.interpret-day-night-split`

| Field | Content |
| --- | --- |
| **Purpose** | Explain the house’s day/night disposition logic using Object Package facts. |
| **Intent** | `interpret` |
| **Trigger** | At least one day and one night evidence Signal exist, or floorplan opened. |
| **Expected outcome** | Buyer can restate why zones are split (not just “two floors”). |
| **Completion signal** | `QUESTION_OPENED` acknowledging split (e.g. topic layout) **or** explicit Move-complete Signal payload `moveId: layout.interpret-day-night-split` when such SignalType exists (see Open Questions). |

---

### `layout.compare-living-kitchen`

| Field | Content |
| --- | --- |
| **Purpose** | Force a conscious trade-off: large living vs modest kitchen. |
| **Intent** | `compare` |
| **Trigger** | Living and/or kitchen viewed; or layout FAQ about dining/cooking. |
| **Expected outcome** | Buyer decides whether dining lives in living room — without surprise later. |
| **Completion signal** | `QUESTION_OPENED` related to kitchen/dining/living adjacency **or** both `room-living` and `room-kitchen` viewed in session. |

---

### `layout.compare-indoor-garden`

| Field | Content |
| --- | --- |
| **Purpose** | Connect indoor day zone to garden as part of disposition. |
| **Intent** | `compare` |
| **Trigger** | Garden true; living explored or exterior/garden media opened. |
| **Expected outcome** | Buyer judges outdoor life as layout, not decoration. |
| **Completion signal** | `MEDIA_OPENED` exterior **or** `ROOM_VIEWED` living after garden mentioned in Story cursor. |

---

### `layout.warn-bath-contention`

| Field | Content |
| --- | --- |
| **Purpose** | Surface single upstairs bath as a real household friction. |
| **Intent** | `interpret` (warning emphasis via recommendation rules) |
| **Trigger** | Night zone explored or household size concern; bath not yet acknowledged. |
| **Expected outcome** | Buyer factors morning contention into fit judgment. |
| **Completion signal** | `ROOM_VIEWED` `room-bath` **or** `QUESTION_OPENED` about bathroom capacity. |

---

### `layout.warn-stairs-mobility`

| Field | Content |
| --- | --- |
| **Purpose** | Make stairs between day and night an explicit decision factor. |
| **Intent** | `interpret` |
| **Trigger** | `FLOOR_CHANGED` occurred or both floors evidenced. |
| **Expected outcome** | Buyer accepts or rejects stair dependence knowingly. |
| **Completion signal** | `FLOOR_CHANGED` **or** `QUESTION_OPENED` about stairs/mobility/elderly/toddlers. |

---

### `layout.ask-household-shape`

| Field | Content |
| --- | --- |
| **Purpose** | Capture who will live here (counts, WFH, guests) before recommend. |
| **Intent** | `discover` (questioning) |
| **Trigger** | At least two discover/interpret Moves completed; recommendation not yet allowed. |
| **Expected outcome** | Constraints exist for fit logic (family size, office need, bath load). |
| **Completion signal** | `QUESTION_OPENED` with household/layout constraint payload (topic `layout` or dedicated question ids when available). |

---

### `layout.recommend-disposition-fit`

| Field | Content |
| --- | --- |
| **Purpose** | Deliver a disposition fit conclusion: strong fit / conditional fit / weak fit. |
| **Intent** | `recommend` |
| **Trigger** | Weakness acknowledged (bath or stairs or kitchen) **and** household shape asked **and** day+night discovered. |
| **Expected outcome** | Buyer leaves with a clearer decision than photo browsing — accept, condition, or walk away from layout grounds. |
| **Completion signal** | `QUESTION_OPENED` accepting recommendation topic **or** explicit completion Signal for this moveId (Open Questions). |

---

## Shared Move notes

- Moves are **reusable** across future layout-oriented packs; ids are stable.  
- Eligibility is evaluated by Decision Strategy using Interpretation + these triggers.  
- Completion always returns to cognition via **Signals** — Moves never write DecisionState.
