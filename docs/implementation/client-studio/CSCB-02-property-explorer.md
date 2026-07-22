# CSCB-02 / SR-003 — Property Explorer

| Field | Value |
| --- | --- |
| **Capability** | CSCB-02 — Object Discovery (slice SR-003) |
| **Status** | **DONE** |
| **Date** | 2026-07-22 |
| **Commit** | `feat(client-studio): implement property explorer` |

---

## Implementation summary

Property Explorer is the informational Object Discovery Decision Surface answering:

> Co tento dům skutečně nabízí?

It sits between Hero and Spatial Terminal. The previous Spatial Terminal shell was renamed to `SpatialTerminal` so this surface owns the Property Explorer name.

---

## Runtime fields used

| UI | Source | Notes |
| --- | --- | --- |
| Title / reference | `context.object.title`, `reference` | |
| Type | `context.object.construction` | Closest available type field |
| Location | `context.object.city`, `district` | |
| Usable area / energy | `context.object.usableArea`, `energyClass` | |
| Rooms / land / price / garden | `experience.house.*` | House projection — not Object Package import |
| Floor count | `context.navigation.floors.length` | |
| Price / m² | **Not shown** | Runtime does not provide — Explorer must not compute |

**No** `dispatch`, **no** Object Package imports, **no** semantic composition.

Internal feature-group navigation is local `useState` only.

---

## Components

| Component | Role |
| --- | --- |
| `PropertyExplorer.tsx` | Section shell + local group state |
| `ObjectSummary.tsx` | Identity + summary facts |
| `KeyMetrics.tsx` | Metric strip |
| `PropertyExplorerNav.tsx` | Presentational section tabs |
| `FeatureGroups.tsx` | Active thematic block |
| `usePropertyFeatureGroups.ts` | Presentation grouping of Runtime fields |
| `SpatialTerminal.tsx` | Renamed former spatial PropertyExplorer |

---

## Validation

| Check | Result |
| --- | --- |
| Typecheck | **PASS** |
| Tests | **PASS** — 34/34 |
| Desktop | [assets/cscb-02-property-explorer-desktop.png](./assets/cscb-02-property-explorer-desktop.png) |
| Mobile | [assets/cscb-02-property-explorer-mobile.png](./assets/cscb-02-property-explorer-mobile.png) |

---

## Slice consumption

| CSCB-02 estimate | This slice |
| --- | --- |
| 5 | SR-002 Hero + SR-003 Property Explorer |

Remaining CSCB-02: galleries / documents / media catalog polish (Spatial media already under CSCB-03).

---

## Follow-up

- Optional dedicated `object.type` on Experience Context if construction is insufficient  
- Documents / galleries slices when Object Package media catalog moves (ED-DA-02)
