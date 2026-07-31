# CAP-BLD-02 — Mount House Package

| Field | Value |
| --- | --- |
| **Status** | Done |
| **ADR** | [ADR-023](../../../docs/architecture/adr/ADR-023-house-package-content-ssot.md) |
| **Mode** | Read-only mount (no edit / save / publish) |

## Mount flow

```text
Builder Studio open
        │
        ▼
Vite (vite.config.js) serves
apps/client-studio/public/house-package at /house-package/*
        │
        ▼
mountHousePackage()
  · fetch rooms.csv / gallery.csv / videos.csv / manifest.json
  · resolve hero (hero.png | hero.webp)
  · buildBuilderPackageRegistries (@embed-engine/object-house)
  · load media/plans/{floor}.geometry.json (metadata)
        │
        ▼
HousePackageSidebar + HousePackageReadonlyView (read-only UI)
```

**Note:** Vite prefers `vite.config.js` over `vite.config.ts` when both exist; HP middleware lives in the JS config.
## Canonical root

`apps/client-studio/public/house-package` (HP-002)

## What replaced mock open

| Before | After |
| --- | --- |
| `useBuilderStudioSession` + `MOCK_PROJECTS` | `useHousePackageMount` + `mountHousePackage` |
| Mock Project sidebar | HP-002 nav (rooms / gallery / videos / plans / media / manifest) |
| In-memory asset collections | object-house registries from real CSV |

Mock Project is **not** opened on the authoring surface. Legacy mock services remain in the repo for later quarantine (CAP-BLD-07) but are unused by `BuilderStudioApp`.

## Out of scope (deferred)

Edit/Save → CAP-BLD-03 · Publish → CAP-BLD-05 · Preview → CAP-BLD-06
