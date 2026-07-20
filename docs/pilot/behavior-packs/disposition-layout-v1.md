# Behavior Pack v1 — Disposition (Layout)

**id:** `disposition-layout-v1`  
**title:** Disposition / Layout  
**version:** 1.0  
**Pilot object:** [house-modern-01](../object/house-modern-01.md)  
**Contract:** [Behavior Pack Contract](../../architecture/behavior-pack-contract.md)  
**Vocabulary:** [Decision Layer SSOT](../../architecture/decision-layer/README.md)

**Profile posture:** Help the buyer decide whether this house’s **spatial organisation** fits how they want to live — not whether photos look nice.

This pack does **not** modify UI. It supplies knowledge, rules, Moves, and composition rules only.

---

## 1. Identity

| Field | Value |
| --- | --- |
| id | `disposition-layout-v1` |
| title | Disposition (Layout) |
| summary | Guide buyers through day/night zoning, room fit, circulation, trade-offs, and a clear layout recommendation for house-modern-01. |
| version | 1.0 |
| priority affinity | `layout` (Interpretation priority id) |

---

## 2. Domain knowledge

### 2.1 What “good layout” means for this pilot

A good disposition for Modern 01 means:

- **Day zone coherence** — living + kitchen support daily togetherness without fighting circulation.  
- **Night zone rest** — bedrooms separated from social noise.  
- **Room fit** — areas match household size (esp. children / bath contention).  
- **Outdoor continuation** — garden is part of living, not leftover land.  
- **Honesty** — stairs, single bath, and kitchen size are named before emotional attachment locks in.

### 2.2 Object facts this pack reasons over

From [house-modern-01](../object/house-modern-01.md): room table, day/night split, areas, garden, floorplan media, selling points, weaknesses.

### 2.3 Layout vocabulary (domain)

| Term | Meaning |
| --- | --- |
| Day zone | Floor 0 social / work life |
| Night zone | Floor 1 rest / privacy |
| Adjacency | Rooms that must work together (living↔kitchen) |
| Contention | Shared resource stress (bath, stairs) |
| Flexibility | Ability to reassign a room (e.g. children → office) |

---

## 3. Decision rules

### 3.1 How layout affects the decision

| If buyer cares about… | Elevate / explain |
| --- | --- |
| Family togetherness | Living 32 m² + kitchen adjacency |
| Sleep quality / privacy | Upper night zone separation |
| Children growing | Children’s room area + future flexibility |
| Hosting / dining | Whether living absorbs dining given kitchen 14 m² |
| Aging / mobility | Stairs between zones |
| Outdoor life | Garden + living orientation assumptions |

### 3.2 Trade-offs

| Trade-off | Pros | Cons |
| --- | --- | --- |
| Compact upper wet core | Efficient night service | One bath for whole upper floor |
| Strong day/night split | Acoustic + lifestyle clarity | Stairs always in the path |
| Large living, modest kitchen | Great gathering | Cooking/dining may spill into living |
| Separate children’s room | Privacy now | 16 m² limits two children long-term |

### 3.3 Pros (system may emphasize)

- Readable two-zone plan  
- Strong living room scale  
- Garden buffer  
- Parents / children bedroom separation  

### 3.4 Cons (system must not hide)

- Kitchen size  
- Single upstairs bath  
- No dedicated office  
- Stair dependence  
- Children’s room ceiling for growth  

---

## 4. Recommendation rules

When Interpretation shows **layout** as leading / elevated topic (Focus: room viewed, question on layout, or pack affinity), Strategy should prefer this pack’s Story spine.

| Situation | System should | Example |
| --- | --- | --- |
| Buyer opens a room / floorplan | **explain** zoning | “You’re in the day zone — living is the social core.” |
| Buyer toggles layout priority | **ask** household shape | “How many people need morning bathroom access?” |
| Kitchen or bath concern appears | **warn** | “Single upstairs bath is the most common friction for 4-person households.” |
| Buyer saw living + garden | **compare** indoor/outdoor living | “Does gathering happen more in living or garden for you?” |
| Enough Moves completed + weaknesses acknowledged | **recommend** | Fit / conditional fit / poor fit for stated household |

**recommend** only after at least one discover + one interpret/compare Move involving a named weakness or trade-off.  
Do not recommend from exterior photo alone.

---

## 5. Decision Move library

See: [disposition-layout-move-library.md](../moves/disposition-layout-move-library.md)

---

## 6. Story composition rules

See also: [layout-strategy-composition.md](../strategy/layout-strategy-composition.md)

### 6.1 Spine (hybrid template)

Default ordered intents for Layout Story:

1. `confirm` — acknowledge layout focus  
2. `discover` — walk day zone  
3. `discover` — walk night zone  
4. `interpret` — name the day/night logic  
5. `compare` — living vs kitchen / indoor vs garden  
6. `discover` or `interpret` — surface a weakness (bath / stairs / office)  
7. `ask` via recommend-prep — household constraints  
8. `recommend` — disposition fit statement  

Omit Moves whose eligibility fails (e.g. skip garden compare if garden false — not the case here).  
Recompose when Interpretation leading topic leaves `layout` (Strategy may switch packs later — out of CAP-P01 scope).

### 6.2 Recomposition triggers

- New `ROOM_VIEWED` / `FLOOR_CHANGED` / `MEDIA_OPENED` (floorplan) / `QUESTION_OPENED` with layout affinity  
- Buyer completes or skips a Move (Signal)  
- Elevated priority set changes away from layout  

### 6.3 Forbidden composition

- Hardcoded Client Studio page routes as Story  
- Stage objects  
- UI-specific Move definitions  

---

## 7. Signals affinity

| SignalType | Affinity for this pack |
| --- | --- |
| `ROOM_VIEWED` | **Strong** |
| `FLOOR_CHANGED` | **Strong** |
| `MEDIA_OPENED` (floorplan) | **Strong** |
| `MEDIA_OPENED` (exterior gallery) | Weak (unless tied to garden/living) |
| `QUESTION_OPENED` with `layout` / disposition ids | **Strong** |

---

## 8. Priority / Interpretation outputs (pack rules for `project()`)

When this pack is active and Focus indicates spatial exploration:

- Elevate priority id `layout`  
- Provide reasons tied to room/floor/floorplan  
- Prefer layout FAQ seeds / conversation context about disposition  
- `activeTopic` ≈ Layout / Disposition  
- `nextAction` invites the next eligible Move (e.g. “Open the children’s room” / “Ask about bathroom mornings”)

Exact projector wiring is implementation (DL-01 / later) — rules live here.

---

## 9. Required knowledge

| Required | Status on house-modern-01 |
| --- | --- |
| Room list with floors/areas | Present |
| Day/night statement | Present in Pilot Object doc |
| Floorplan media | Present |
| Honest weaknesses | Present |
| Room-level photo sets | **Partial / gap** |

---

## 10. Constraints

- Never claim “perfect for every family.”  
- Never hide single-bath or kitchen-size risk.  
- Never invent rooms not in Object Package.  
- Never equate exterior beauty with disposition quality.  
- Czech/English copy may vary in Experience; domain meaning stays in Pack.
