# CAP-BLD-05 — House Package Validation

| Field | Value |
| --- | --- |
| **Status** | Done |
| **ADR** | [ADR-023](../../../docs/architecture/adr/ADR-023-house-package-content-ssot.md) |

## Validation pipeline

```text
House Package (HP-002 disk SSOT)
        │
        ▼
POST /api/house-package/validate
        │
        ▼
importBuilderHousePackage (@embed-engine/object-house)
        │
        ▼
Validation Report (PASS | WARNING | ERROR)
        │
        ▼
Publish gate (ERROR → disabled)
```

Builder does **not** validate its own model. Working-copy checks reuse
`buildBuilderPackageRegistries` (same object-house codes). Disk publish gate
uses `importBuilderHousePackage` only.

## Categories

| Category | Typical object-house codes |
| --- | --- |
| manifest | `BP_MISSING_FILE`, manifest paths |
| rooms.csv | path `rooms.csv` + field/CSV errors |
| gallery.csv | path `gallery.csv` |
| videos.csv | path `videos.csv` |
| media references | media paths |
| SVG / floorplan | `BP_PLAN_INCOMPLETE`, `HP003_*` |
| mandatory fields | `BP_MISSING_FIELD`, `BP_INVALID_*` |
| missing assets | `BP_ASSET_MISSING` |
| orphan references | `BP_UNKNOWN_ROOM`, `BP_UNKNOWN_FLOOR` |
| duplicate IDs | `BP_DUPLICATE_ROOM`, `BP_DUPLICATE_ORDER` |

## Report shape

Each issue: **type** · **file** · **item** · **description** (+ editor nav).

Counts: errors, warnings, PASS categories.

## Publish gate

| Severity | Publish |
| --- | --- |
| ERROR | **blocked** |
| WARNING | allowed |
| PASS | allowed |

Unsaved working copy → WARNING only (disk may still be publishable).

## Out of scope (CAP-BLD-07+)

- Runtime Preview
- Legacy mock publish retirement from pilot IA
- Geometry generation / binary upload as authoring features (geometry runs only as publish prep)
