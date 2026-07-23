# CAP-BP-01 — Builder Package Runtime Integration

| Field | Value |
| --- | --- |
| **ID** | CAP-BP-01 |
| **Date** | 2026-07-24 |
| **Status** | Done |
| **Depends on** | HP-002, PT-BUILDER-PACKAGE-01/02, PT-BUILDER-TRACE-01 |

## Summary

Client Studio Runtime media SSOT is now the **HP-002 Builder House Package** (CSV + `media/`).  
Historical `manifest.json` → `resolveHousePackage()` is no longer used by presentation Runtime.

## Pipeline (restored)

```text
public/house-package/{gallery,rooms,videos}.csv + media/
        │
        ▼
buildBuilderPackageRegistries() / importBuilderHousePackage()
        │
        ▼
Runtime Registries (Hero, Gallery, Room, Floor, SVG, Video)
        │
        ▼
projectRegistriesToResolvedPackage()
        │
        ▼
presentation-assets / synchronizedExperience
        │
        ▼
MainMedia / HeroImage / FloorPlan / Navigator
```

## Key modules

| Module | Role |
| --- | --- |
| `packages/object-house/.../buildRegistries.ts` | Pure HP-002 → registries |
| `packages/object-house/.../importBuilderHousePackage.ts` | Node disk importer |
| `apps/client-studio/.../builderPackageBootstrap.ts` | Runtime bootstrap |
| `apps/client-studio/.../presentation-assets.ts` | Registry → presentation adapter |
| `apps/client-studio/.../HeroImage.tsx` | Hero Registry via Experience Context |

## Validation

| Check | Result |
| --- | --- |
| `gallery.csv` order drives gallery (no filename sort) | Pass |
| Hero from `media/hero/` / Hero Registry | Pass |
| `videos.csv` → provider URLs in Runtime | Pass |
| Runtime does not import `manifest.json` | Pass |
| `resolveHousePackage` marked deprecated | Pass |

## Non-goals

- Rebuild Embed Pages release (follow-up publish PT)
- Delete `manifest.json` from disk (retained as deprecated artifact)
