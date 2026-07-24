# PT-RUNTIME-UNIFY-01 — Eliminate Dual SSOT

## Verdict

**Pass.** Client Studio Runtime is created only from Builder Package → Runtime HousePackage. Navigation, Hero, Gallery, and Videos share that representation. `REFERENCE_HOUSE_PACKAGE` and `OBJECT_ROOM_TO_MEDIA_ROOM` are gone from the active Client Studio path.

## Data flow (after)

```text
Builder Package (HP-002 CSV + media/)
        │  HTTP fetch (dev/browser) / CSV texts (tests)
        ▼
buildBuilderPackageRegistries()
        │
        ▼
projectBuilderImportToHousePackage()     ← packages/object-house/builder-package
        │
        ▼
HousePackage (rooms + media: hero/gallery/video/floorplan)
        │
        ▼
createDecisionSessionRuntime({ housePackage })
        │
        ▼
ExperienceHouse / Experience Context
        │
        ▼
Presentation (HeroImage, RoomPanel, ThumbnailRail, MainMedia)
        — reads experience.context / experience.house only
```

## Dual SSOT removed

| Before | After |
|--------|--------|
| `REFERENCE_HOUSE_PACKAGE` → Navigation (8 rooms) | Builder `rooms.csv` → HousePackage.rooms (10) |
| Builder registries → `getMediaRoom` + id map | HousePackage.media on Experience → `experienceHouseMedia` |
| `OBJECT_ROOM_TO_MEDIA_ROOM` | **Removed** (same room ids: `kitchen`, `living-room`, …) |
| Presentation imported registries | Presentation reads Experience only |

## Importer

`projectBuilderImportToHousePackage` (`packages/object-house/src/builder-package/projectToHousePackage.ts`):

- Rooms from Room Registry (Builder ids)
- Floors: `p1` → `0`, …
- Media encoded on `HousePackage.media`:
  - `hero`
  - `gallery:{roomId}:{order}`
  - `video:{roomId}:{order}`
  - `floorplan:{floorId}`
- Partner identity/overview/location/metadata: `BUILDER_RUNTIME_HOUSE_DEFAULTS` (fields not in HP-002 CSVs)

## Validation

| Check | Result |
|-------|--------|
| Navigation room count = `rooms.csv` (10), includes `exterior` + `wardrobe` | Pass |
| Every `gallery.csv` room selectable → room media non-empty | Pass (unit test) |
| Hero = `/house-package/media/hero/hero.webp` via Experience | Pass |
| Videos from `videos.csv` via Experience media | Pass |
| Client Studio src has no `REFERENCE_HOUSE_PACKAGE` | Pass |
| `OBJECT_ROOM_TO_MEDIA_ROOM` removed | Pass |
| client-studio tests | 53 pass |

## Notes

- `REFERENCE_HOUSE_PACKAGE` remains exported for **Runtime/Decision unit fixtures** outside Client Studio active path.
- Default interpretation rules accept Builder room ids (`living-room`, …) and keep legacy `room-*` aliases for existing Runtime fixtures.
- Embed delivery resolves Builder CSVs asynchronously (`resolveBuilderHousePackage`) before `createDeliveryRuntime`.
