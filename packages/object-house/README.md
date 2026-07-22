# @embed-engine/object-house

House Object Package for the EMBED Engine.

## Principle

> Object Package is the source of truth. Experience is its interpretation.

This package holds structured knowledge about a house. It contains no React, no Runtime orchestration, and no rendering.

Renderers must never import `HousePackage`. They consume `ExperienceHouse` via `projectHouse()`.

## Public API

| Export | Role |
| --- | --- |
| `HousePackage` | Immutable object facts (logical model) |
| `REFERENCE_HOUSE_PACKAGE` | In-memory fixture for unit tests |
| `projectHouse(house)` | Object Package → `ExperienceHouse` (only Experience path) |
| `@embed-engine/object-house/loader` | Filesystem loader — `loadHousePackage(path)` |

## Loader

```ts
import { loadHousePackage } from "@embed-engine/object-house/loader";
import { projectHouse } from "@embed-engine/object-house";

const result = await loadHousePackage("packages/reference-house");
if (!result.ok) {
  // structured errors — never generic throws for validation
  console.error(result.errors);
} else {
  const experience = projectHouse(result.package);
}
```

Canonical on-disk golden dataset: `@embed-engine/reference-house` (`house.json` + `assets/`).

Loader owns filesystem concerns. Runtime must never read package files directly.

Aligned with [HP-001](../../docs/03-specification-standard/HP-001-House-Package-Specification.md), [PT-001](../../docs/architecture/pt/PT-001-house-package-canonical-object-contract.md), [ADR-013](../../docs/architecture/adr/ADR-013-room-selection-semantic.md).
