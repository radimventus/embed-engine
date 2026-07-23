# PT-HOUSE-PACKAGE-ROOMS-01 — Canonical Media Room IDs

Date: 2026-07-23

## Verdict

**PASS** — House Package, decision-canvas, and Runtime mapping use one canonical Media Room ID set. Legacy alias `room-children → hall` removed.

---

## Canonical Media Room IDs (13)

`bathroom` · `bedroom` · `children-room` · `exterior` · `hall` · `kitchen` · `living-room` · `office` · `technical-room` · `terrace` · `toilet` · `vestibule-corridor` · `wardrobe`

Folder typo `media/exterier` renamed → `media/exterior`.

---

## Object → Media mapping

| Object Room ID | Media Room ID |
|----------------|---------------|
| `room-living` | `living-room` |
| `room-kitchen` | `kitchen` |
| `room-bedroom` | `bedroom` |
| `room-bath` | `bathroom` |
| `room-children` | `children-room` |
| `room-office` | `office` |
| `room-toilet` | `toilet` |
| `room-hallway-entrance` | `vestibule-corridor` |

Object Package IDs **unchanged**. Media-only rooms (`hall`, `terrace`, `technical-room`, `wardrobe`, `exterior`) have no Object row — expected.

---

## Opening

```json
"opening": { "roomId": "exterior", "asset": "hero" }
```

Switched because `exterior` is in the manifest with `hero.jpg` / gallery / video and `resolveHousePackage` resolves `opening.roomId` fully. Walkthrough default remains `living-room`.

---

## Assets

| Check | Result |
|-------|--------|
| Manifest lists all 13 rooms | ✅ |
| Each room: `hero.jpg`, `01–03.jpg`, `video.mp4` | ✅ (seeded from living-room where missing) |
| `decision-canvas/<id>.svg` for every room | ✅ (stubs copied from living-room.svg where new) |
| No orphan media folders / SVG | ✅ |
| No orphan files under `media/` root | ✅ |
| `floorPlanRegion` kept only where known | ✅ (living, kitchen, bedroom, bathroom) |

---

## Validation

- Asset graph script: **OK**
- `synchronizedExperience.test.ts`: **8/8 pass**
- Mapping smoke: all 8 Object rooms resolve; children ≠ hall

---

## Files

- `apps/client-studio/public/house-package/manifest.json`
- `apps/client-studio/public/house-package/media/**` (canonical folders + required files)
- `apps/client-studio/public/house-package/decision-canvas/**`
- `apps/client-studio/src/features/client-studio/runtime/presentation-assets.ts`
