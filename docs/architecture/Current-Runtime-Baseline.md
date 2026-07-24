# Current Runtime Baseline

**Status:** Infrastructure complete — referenční baseline pro navazující CAP  
**Established by:** CAP-RUNTIME-BASELINE-01 / PT-RUNTIME-UNIFY-02  
**Related PTs:** PT-RUNTIME-UNIFY-01 · PT-EMBED-RUNTIME-INTEGRATION-01 · PT-DEPLOY-EMBED-01

---

## Current Runtime Baseline

| Concern | Authority |
| --- | --- |
| **Runtime source** | `builder-package/projectBuilderImportToHousePackage` (`RUNTIME_HOUSE_PACKAGE_SOURCE`) |
| **HousePackage source** | HP-002 Builder Package CSVs (`rooms.csv` / `gallery.csv` / `videos.csv`) + media under `/house-package` |
| **Provider** | `DecisionSessionRuntimeProvider` — creates Runtime via `ensureBuilderPackageBootstrapped` → `getBuilderRuntimeHousePackage` (standalone **and** Embed) |
| **Client Studio path** | SPA → Provider → Builder bootstrap → `createDecisionSessionRuntime` → Experience → Presentation |
| **Embed path** | `Embed.mount` → `mountClientStudio` (no injected Runtime) → same Provider bootstrap |
| **Build validation** | `pnpm --filter @embed-engine/embed build` → fingerprint + Runtime smoke (10 rooms, exterior gallery 01–03, Hero) |
| **Pages validation** | `sync:pages` SHA-256 + fingerprint gate; `validate:pages` / `validate:pages -- --remote` |

```text
Builder Package (HP-002)
        ↓
projectBuilderImportToHousePackage()
        ↓
HousePackage
        ↓
Decision Session Runtime
        ↓
Experience
        ↓
Presentation   ← Client Studio SPA  |  Embed IIFE (same path)
```

Dual SSOT (`REFERENCE_HOUSE_PACKAGE` navigation + registry media map) is **removed** from the active Client Studio / Embed path.

Older PT notes that still describe Embed injecting Runtime via `resolveBuilderHousePackage` are **superseded** by PT-EMBED-RUNTIME-INTEGRATION-01 (Provider-owned bootstrap).

---

## Operator checklist

```bash
pnpm --filter @embed-engine/embed deploy:pages
pnpm --filter @embed-engine/embed validate:pages
# after push + Pages rebuild:
pnpm --filter @embed-engine/embed validate:pages -- --remote
```

Console on Embed mount:

```text
Embed Runtime
Build: <short-sha>
Runtime: builder-package/projectBuilderImportToHousePackage
Built: <ISO-8601 Z>
```

---

## Suggested Git tag (not applied automatically)

`runtime-unified-baseline`  
alternate: `v0.8.0-runtime-unified`

---

## Related documentation

- [PT-RUNTIME-UNIFY-01](../reviews/PT-RUNTIME-UNIFY-01.md)
- [PT-EMBED-RUNTIME-INTEGRATION-01](../reviews/PT-EMBED-RUNTIME-INTEGRATION-01.md)
- [PT-DEPLOY-EMBED-01](../reviews/PT-DEPLOY-EMBED-01.md)
- [GitHub Pages Distribution](../releases/GitHub%20Pages%20Distribution.md)
- [Engineering Debt](../implementation/Engineering%20Debt.md)
- Certified Runtime core: [RUNTIME-STATUS](./RUNTIME-STATUS.md) (RAR-001)
