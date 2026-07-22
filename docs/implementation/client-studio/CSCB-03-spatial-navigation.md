# CSCB-03 — Spatial Navigation

| Field | Value |
| --- | --- |
| **Capability** | CSCB-03 — Spatial Navigation |
| **Status** | **DONE** |
| **Date** | 2026-07-22 |
| **Commit** | `feat(client-studio): implement spatial navigation` |

---

## Implementation summary

Spatial Navigation is a **pure Runtime projection** of the Spatial Terminal (`PropertyExplorer`):

- Floor Selector ↔ `navigation.currentFloor` via `SelectRoom` to first room on floor  
- Room list filtered to active floor  
- Interactive floor plan hotspots filtered by floor, with hover + active highlight  
- Spatial Context Panel shows projected room name / area / floor  
- Media column updates from `context.roomMedia` after each `SelectRoom`

No Runtime API changes. No semantic composition in Client Studio.

---

## Runtime interaction

```text
User (Floor / Room / Hotspot)
        │
        ▼
useHouseNavigator.selectRoom | selectFloor
        │
        ▼
dispatch({ type: "SelectRoom", roomId })
        │
        ▼
Runtime (sole semantic authority)
        │
        ▼
Experience Context
  ├── navigation.currentFloor / rooms
  ├── activeRoom
  ├── roomMedia
  └── floorPlan
        │
        ▼
Spatial Terminal projection (UI only)
```

### Navigation events (interaction only)

| Event | Command | Effect |
| --- | --- | --- |
| Select room (list) | `SelectRoom` | Active room + media + floor sync |
| Select room (hotspot) | `SelectRoom` | Same |
| Switch floor | `SelectRoom` (first room on floor) | Floor + room + media sync |

There is **no** `ChangeFloor` command — ADR-013 / Runtime surface unchanged.

---

## Modified modules

| Module | Change |
| --- | --- |
| `FloorPlan.tsx` | Floor-filtered hotspots; hover/active; `useHouseNavigator` |
| `RoomPanel.tsx` | Floor-filtered room list; touch targets |
| `SpatialContextPanel.tsx` | **New** — projected room facts |
| `MediaExplorer.tsx` | Hosts Spatial Context Panel |
| `houseNavigatorModel.ts` | `roomsOnFloor` helper |
| `useHouseNavigator.ts` | Exposes `floorRooms` |
| `PropertyExplorer.tsx` | Tablet/mobile stacking |
| `spatial-terminal-layout.ts` | Mobile media column width |
| `WalkthroughProvider.tsx` | Removed unused `selectFloor` (nav via House Navigator) |
| Tests | `spatialNavigation.test.ts` + floor filter coverage |

---

## Acceptance checklist

- [x] Floor switching  
- [x] Room selection  
- [x] Active room/floor synced with Runtime  
- [x] Room-specific media updates  
- [x] No semantic logic outside Runtime  
- [x] Desktop / tablet / mobile interaction  
- [x] No Runtime API changes  

---

## Validation

| Check | Result |
| --- | --- |
| Typecheck | **PASS** |
| Tests | **PASS** — 31/31 |
| Desktop | [assets/cscb-03-spatial-desktop.png](./assets/cscb-03-spatial-desktop.png) |
| Mobile | [assets/cscb-03-spatial-mobile.png](./assets/cscb-03-spatial-mobile.png) |

---

## Slice consumption

| Estimate | Consumed |
| --- | --- |
| 6 slices | Hardened existing Spatial Terminal into CSCB-03 complete capability |

---

## Follow-up

- ED-DA-02 residual — Object-owned per-floor plan assets (single ground-floor image remains)  
- Panorama media kind (future-compatible; not required now)  
- Next capability: **CSCB-04 — Decision Discovery (Priority Experience)**
