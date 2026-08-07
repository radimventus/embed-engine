# Pilot Object — house-modern-01

**Status:** Canonical Pilot Object (CAP-P01)  
**Object id:** `house-modern-01`  
**Reference:** `ASTAV-M01`  
**Title:** Modern 01  
**Code fixture:** `packages/object-house` → `REFERENCE_HOUSE_PACKAGE`  
**Product contract:** [Object Package](../../product/object-package.md)

This document is the **product knowledge model** for the first pilot house.  
It extends the reference fixture with layout-relevant truth needed by the Disposition Behavior Pack.

---

## 1. Metadata

| Field | Value |
| --- | --- |
| id | `house-modern-01` |
| title | Modern 01 |
| commercial reference | ASTAV-M01 |
| typology | Family house, 5 rooms (+ bath), garden |
| location | Praha — district Západ |
| price (indicative) | 6 900 000 CZK |
| usable area | 142 m² |
| land area | 620 m² |
| construction | Zděná (masonry) |
| energy class | B |
| garden | Yes |
| floors | Ground (0) + Upper (1) |
| pilot vertical | Residential / family house |

---

## 2. Layout overview

Two-level family house with **day zone on ground floor** and **night zone upstairs**.

```text
Floor 0 (day)
  Obývací pokoj 32 m² ── Kuchyně 14 m² ── (garden access implied)

Floor 1 (night)
  Ložnice 18 m² ── Dětský pokoj 16 m² ── Koupelna 8 m²
```

**Circulation idea:** Living + kitchen form the social core; bedrooms stack above for acoustic separation from day life.

---

## 3. Rooms

| id | Name | Floor | Area | Layout role |
| --- | --- | --- | --- | --- |
| `room-living` | Obývací pokoj | 0 | 32 m² | Primary social space; visual anchor of disposition |
| `room-kitchen` | Kuchyně | 0 | 14 m² | Day-zone work / dining adjacency to living |
| `room-bedroom` | Ložnice | 1 | 18 m² | Parents’ night zone |
| `room-children` | Dětský pokoj | 1 | 16 m² | Children’s night zone; flexibility candidate |
| `room-bath` | Koupelna | 1 | 8 m² | Upper wet core; night-zone support |

**Room count summary:** 5 (overview) — living, kitchen, children, bedroom, bath.

---

## 4. Orientation (pilot assumptions)

Documented as **pilot knowledge** (confirm on site for commercial close):

| Aspect | Assumption | Decision relevance |
| --- | --- | --- |
| Living / garden | Living oriented toward garden (south-west preferred) | Daylight + outdoor life |
| Street face | Quieter elevations toward bedrooms where possible | Privacy |
| Kitchen | Adjacent to living; service access to garden/side | Workflow of daily life |
| Upper floor | Night rooms share bath core | Compact night zone |

If site survey contradicts these, update Object Package facts — do not bury corrections in UI.

---

## 5. Media references

| id | Kind | Title | Path / URL |
| --- | --- | --- | --- |
| `media-exterior` | image | Exteriér | `/media/house-modern-01/exterior.jpg` |
| `media-floorplan` | floorplan | Půdorys | `/media/house-modern-01/floorplan.svg` |

**Pilot gap:** Room-level photo/video sets are not yet fully enumerated in the TypeScript fixture. For Layout Story, floorplan + room ids are the primary spatial evidence; gallery enrichment is CAP-P02 candidate.

---

## 6. Technical parameters (layout-relevant)

| Parameter | Value | Layout impact |
| --- | --- | --- |
| Usable area | 142 m² | Comfortable family footprint |
| Land | 620 m² | Outdoor buffer / play / garden dining |
| Levels | 2 | Clear day/night split; stairs as transition |
| Energy class | B | Not primary Layout topic — referenced only if trade-off vs compact envelope |
| Construction | Masonry | Stable partitions; limited “move a wall tomorrow” fantasy |

---

## 7. Selling points (disposition)

1. **Clear day / night split** — social life downstairs, rest upstairs.  
2. **Generous living room (32 m²)** — credible family gathering space.  
3. **Children’s room separate from parents** — privacy within night zone.  
4. **Garden + land buffer** — disposition continues outdoors.  
5. **Compact wet core upstairs** — efficient night-zone service.  
6. **Readable floorplan** — buyer can mentally walk zones without confusion.

---

## 8. Possible weaknesses (disposition — honest)

1. **Kitchen 14 m²** — may feel tight for large family cooking + dining all-in-one; buyer must decide if living absorbs dining.  
2. **Single bath (8 m²) upstairs** — morning contention risk for 3–4 people.  
3. **No dedicated study / home office room** — work-from-home needs living or bedroom compromise.  
4. **Stairs between day and night** — mobility / toddler / elderly consideration.  
5. **Children’s room 16 m²** — fine for one child; tight for two long-term.  
6. **Media depth** — without room photos, disposition must be proven via walkthrough Signals + floorplan (Pilot limitation).

---

## 9. Knowledge required by Disposition Pack

Behavior Pack `disposition-layout-v1` requires at minimum:

- room ids, names, floors, areas  
- day/night zoning statement  
- floorplan media  
- garden flag  
- honest weakness list above  

Missing room media does **not** block the Pack; it weakens Reality-check Moves (see Open Questions).

---

## 10. Canonical status

`house-modern-01` is the **canonical Pilot Object** for CAP-P01.  
Future pilots add new Object Packages; they do not redefine this one’s id.
