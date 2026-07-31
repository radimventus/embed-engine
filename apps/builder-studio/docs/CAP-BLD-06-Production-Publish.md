# CAP-BLD-06 — Production Publish

| Field | Value |
| --- | --- |
| **Status** | Done |
| **ADR** | [ADR-023](../../../docs/architecture/adr/ADR-023-house-package-content-ssot.md) |

## Publish flow

```text
Publish click
        │
        ▼
object-house importBuilderHousePackage (disk HP-002)
        │
        ├─ ERROR (non-geometry) → block
        ├─ healable HP003 geometry → publish:floorplan-geometry → re-validate
        └─ PASS / WARNING → continue
        │
        ▼
pnpm embed:publish
  · build Release Snapshot → docs/embed
  · sync Static HP → docs/house-package
        │
        ▼
Release Summary (from docs/embed/version.json + manifest.json)
```

Builder orchestrates only. No Builder Package, no mock publish, no second pipeline.

## Gate rules

| Severity | Publish |
| --- | --- |
| ERROR (content) | **blocked** |
| ERROR (healable geometry only) | allowed — pipeline regenerates geometry |
| WARNING | allowed |
| PASS | allowed |

Healable geometry codes (`HP003_GEOMETRY_MISSING`, `HP003_VIEWBOX_MISMATCH`)
trigger existing `publishAllFloorPlanGeometry` once, then re-validate.

## Host API

`POST /api/house-package/publish` (Vite Node middleware)

→ `runProductionHousePackagePublish` → spawn `pnpm embed:publish` at repo root.

## Release Summary

From real artifacts (no mock checksum):

- Publish OK
- Build fingerprint (`version.json` marker)
- House Package version (`manifest.json`)
- Embed version (`version.json`)
- Release timestamp (`fingerprint.builtAt`)
- Artifact paths: `docs/house-package`, `docs/embed`

## Failure

- Exact stage + error text shown in Builder
- Source HP CSV/media unchanged by `embed:publish` (geometry may refresh when needed)
- Publish can be retried

## Out of scope

- Git commit / push / GitHub Pages
- Login / multi-project
