# @embed-engine/reference-house

Canonical on-disk **Reference House Package** (CAP-HP-002.1).

Conforms to [HP-001](../../docs/03-specification-standard/HP-001-House-Package-Specification.md).
Platform role: [PT-001](../../docs/architecture/pt/PT-001-house-package-canonical-object-contract.md).

```text
house.json          # HP-001 manifest
assets/             # media / documents / floorplans / svg overlays
```

## Consumption

| Path | Role |
| --- | --- |
| `loadHousePackage(packages/reference-house)` | Node loader / validation (`@embed-engine/object-house/loader`) |
| `REFERENCE_HOUSE_PACKAGE` | Browser Runtime fixture (`@embed-engine/object-house`) |
| `apps/client-studio/public/reference-house/` | Published SPA assets for Tour |

## Publish (GitHub Pages)

After changing any asset under `assets/` (or `house.json`), run **one** command from the repo root:

```bash
pnpm publish:reference-house
```

This orchestrates:

1. `packages/reference-house` → `apps/client-studio/public/reference-house` (`sync:reference-house`)
2. Ensures `packages/embed/dist` exists (builds embed only when needed)
3. `public/reference-house` → `docs/reference-house` (`sync:pages`)
4. SHA-256 content validation across packages / public / docs (fails on mismatch)

Validate existing trees without re-syncing:

```bash
node ./scripts/publish-reference-house.mjs --validate-only
```

Then commit the synced copies and push the GitHub Pages branch (`/docs`).

Low-level sync only (no Pages docs sync / no validation):

```bash
pnpm sync:reference-house
```

Runtime never reads the on-disk tree directly. Tour reads projected Experience Context fed by the fixture + published `/reference-house/` URLs.
