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

Publish after asset changes:

```bash
node scripts/sync-reference-house-public.mjs
```

Runtime never reads the on-disk tree directly. Tour reads projected Experience Context fed by the fixture + published `/reference-house/` URLs.
