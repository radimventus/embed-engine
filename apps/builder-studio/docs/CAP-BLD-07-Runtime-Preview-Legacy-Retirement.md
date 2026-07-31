# CAP-BLD-07 — Runtime Preview & Legacy Retirement

| Field | Value |
| --- | --- |
| **Status** | Done |
| **ADR** | [ADR-023](../../../docs/architecture/adr/ADR-023-house-package-content-ssot.md) |

## Final Builder architecture

```text
Builder Studio (Authoring Surface)
        │
        ▼
House Package HP-002  (Content SSOT)
        │
        ├─ Edit / Persist / Validate (object-house)
        ├─ Publish → pnpm embed:publish → docs/embed + docs/house-package
        └─ Runtime Preview → Embed.mount → Client Studio → Shared Runtime
```

## Runtime Preview

After Publish OK:

1. Builder opens Preview host
2. `Embed.mount({ mode: 'inline', objectId: house-modern-01 })`
3. Client Studio Provider bootstraps HP via `projectBuilderImportToHousePackage`
4. Shared Runtime drives Decision Experience

Same path as Client Experience / Embed. **No Stub Runtime.**

## Release verification

Preview chrome shows:

| Field | Source |
| --- | --- |
| Publish fingerprint | `docs/embed/version.json` marker (CAP-BLD-06 summary) |
| Runtime fingerprint | `builder-package/projectBuilderImportToHousePackage` |
| House Package fingerprint | FNV of mounted CSV/hero/manifest (not mock) |
| Build timestamp | `fingerprint.builtAt` |

## Legacy retirement

| Removed from production path | Disposition |
| --- | --- |
| `useBuilderStudioSession` | Moved to `src/legacy/` |
| Stub Runtime Adapter / Preview service | Marked `@legacy`; `test:legacy` only |
| Mock PublishService | Marked `@legacy`; replaced by embed:publish |
| `MOCK_PROJECTS` / mock-data | Marked `@legacy`; fixtures for legacy tests |
| WorkspaceCanvas / PublishPanel lab UI | Unused by App; remain offline |

Production App dependency guard: `builderStudioProductionPath.test.ts`.

## Out of scope

- Login / Company / Workspace
- Manager / Sales Studio
- Git push / GitHub Pages
