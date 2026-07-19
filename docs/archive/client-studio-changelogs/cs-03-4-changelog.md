# CS-03.4 Changelog — House Package Standardization

## Summary

Replaced the temporary `public/demo/` asset structure with the production `public/house-package/` layout. All media paths are resolved through a single package manifest.

## Added

- `public/house-package/` — floor plan, decision canvas SVGs, per-room media folders
- `public/house-package/manifest.json` — room id, title, floor, canvas, hero, gallery, video
- `@embed-engine/contracts` — `HousePackageManifest`, `ResolvedHousePackage` types
- `@embed-engine/kernel` — `resolveHousePackage()` resolver

## Removed

- `public/demo/` — migrated into house-package

## Changed

- Asset loading in `WalkthroughProvider`, `FloorPlan`, `MainMedia`, `HeroSurface`
- Floor plan overlays `ground-floor.png` + selected room SVG

## Unchanged

- Walkthrough state machine, spatial sync, Transition Language (125 ms)
- Property Explorer geometry and Opening chapter layout

## Replacing a package

Update `public/house-package/` and `manifest.json`. No React changes required.
