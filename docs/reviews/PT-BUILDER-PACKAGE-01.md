# PT-BUILDER-PACKAGE-01 — Unified Builder House Package Input

| Field | Value |
| --- | --- |
| **ID** | PT-BUILDER-PACKAGE-01 |
| **Date** | 2026-07-23 |
| **Status** | Done |
| **Commits** | Spec: `6aa14d5`; Implementation: follow-up commit in this PT |

## Summary

Defined HP-002 as the sole partner/Builder authoring input (folders + CSV).  
Implemented a deterministic importer in `@embed-engine/object-house/builder-package` that generates Runtime registries without requiring partners to hand-author them.

## Spec

- [HP-002 Builder House Package Input Format](../03-specification-standard/HP-002-Builder-House-Package-Input.md) — finalized as locked SSOT in [PT-BUILDER-PACKAGE-02](./PT-BUILDER-PACKAGE-02.md)

## Import entrypoint

```ts
import { importBuilderHousePackage } from "@embed-engine/object-house/builder-package";

const result = await importBuilderHousePackage("/path/to/house-package");
```

## Generated registries

| Registry | Source |
| --- | --- |
| Hero Registry | `hero/hero.csv` + `hero/` assets |
| Gallery Registry | `gallery.csv` + `gallery/` (order from CSV only) |
| Room Registry | `rooms.csv` |
| Floor Registry | `plans/Pn.png` + `plans/Pn.svg` pairs |
| SVG Registry | floor SVG paths from plans |
| Video Registry | `videos/videos.csv` (external providers) |
| Runtime Manifest | summary of all registries |

## Validation

| Check | Result |
| --- | --- |
| Partner package needs no Runtime knowledge | Pass — CSV + folders only |
| Import deterministic / CSV order SSOT | Pass — tests assert gallery order ≠ filename order |
| Hero ≠ gallery | Pass — hero excluded from gallery registry |
| Fail-closed on unknown room / incomplete plans | Pass |

## Non-goals (this PT)

- Projection to HP-001 `house.json`
- Wiring into Client Studio Experience UI
- Writing registry files to disk (caller may persist `result`)
