# PT-TOUR-REDESIGN-01 — Tour Layout & Interaction Polish

Date: 2026-07-23

## Verdict

Tour (Procházka domem) chrome cleaned: legacy ASTAV-M01 Property Explorer removed from the Journey, dynamic room info panel removed, room menu / VIDEO·FOTKY unified, floor plan enlarged with SVG sync + gold overlays, room selection forces PHOTO with room-scoped media, thumbnail rail centers relevant items in a 4-slot viewport.

Hero, Runtime, Delivery Layer, and CSS Isolation were not changed.

---

## Changes

| Area | Change |
|------|--------|
| ASTAV-M01 | Unmounted `PropertyExplorer` from `ClientStudioPage`; nav/analytics no longer list Objekt |
| Info panel | Removed `SpatialContextPanel` from `MediaExplorer` (component kept, not deleted) |
| Room menu | Column +15px (`209→224`); row ~`min-h-[39px]` (−12%); default text `#001930` |
| VIDEO/FOTKY | Custom toggle: white default, navy hover, beige active (matches room rows) |
| Floor plan | `pl-[30px]` / `pr-[20px]`; larger column; align end if taller than display else center |
| Loupe | Anchored to plan box, `right: 20px` |
| SVG overlays | Same SVG viewBox + `xMidYMid meet`; hover `#f5b90040`; active `#f5b9007f` |
| Room → media | On `activeRoomId` change → `mediaMode = photo`, pause chrome |
| Photo load | `projectRoomContext` maps Object room → `house-package` room media via `getMediaRoom` |
| Thumbnails | Scroll so two most relevant sit in center slots; viewport = exactly 4 full thumbs |

---

## Validation checklist

| Check | Status |
|-------|--------|
| ASTAV-M01 section gone after Hero | Done (unmounted) |
| Dynamic info panel gone under PROCHÁZKA DOMEM | Done |
| Room menu width / row / navy text | Done |
| Toggle white + navy hover | Done |
| Floor plan gaps 30 / 20 | Done |
| Loupe on plan right −20px | Done |
| SVG transform lock | Done (single SVG) |
| SVG hover/selected colors | Done |
| VIDEO→PHOTO on room select | Done |
| Photo load (room-scoped paths) | Done + unit tests |
| Thumbnail relevance + 4 full | Done |

Unit: `synchronizedExperience.test.ts`, `mediaProjectionBoundary.test.ts` — pass.

---

## Constraints

- No Runtime architecture changes
- No Hero edits
- No Delivery Layer edits
- Experience command path still `SelectRoom` only
- PropertyExplorer sources retained (not mounted)
