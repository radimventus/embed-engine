# PT-RUNTIME-FIX-01 — Builder Package Bootstrap (Vite 7)

## Verdict

**Pass.** Builder Package bootstrap no longer uses `public/?raw` imports. Client Studio loads HP-002 CSVs over HTTP, creates Runtime registries, and presentation assets continue to read only from those registries.

## Bootstrap path

```text
DecisionSessionRuntimeProvider
  └─ ensureBuilderPackageBootstrapped()
       └─ fetch(/house-package/{gallery,rooms,videos}.csv)  // cache: no-store
            └─ buildBuilderPackageRegistries(...)
                 └─ Gallery / Room / Video / Hero / Floor registries
                      └─ projectSynchronizedExperience → UI
```

- Browser: HTTP `fetch` of Vite `public/` assets (Vite 7–supported).
- Node tests: `bootstrapBuilderPackageRegistriesSyncForTests` + disk CSV via `builderPackageTestInstall.ts`.
- Package entry `@embed-engine/object-house/builder-package` is browser-safe (no `node:fs`). Disk importer moved to `@embed-engine/object-house/builder-package/node`.

## Files changed

| File | Change |
|---|---|
| `apps/client-studio/.../builderPackageBootstrap.ts` | HTTP CSV load + async ensure |
| `apps/client-studio/.../DecisionSessionRuntimeProvider.tsx` | Await bootstrap before Experience |
| `apps/client-studio/.../builderPackageTestInstall.ts` | Test CSV install |
| `apps/client-studio/.../builderPackageCsv.ts` | **Deleted** |
| `apps/client-studio/.../builderPackageCsv.vite.ts` | **Deleted** |
| `apps/client-studio/vite.config.ts` | Remove `?raw` alias |
| `apps/client-studio/tsconfig.json` | Remove csv path alias |
| `packages/embed/vite.shared.ts` | Remove csv alias |
| `packages/object-house/.../index.ts` | Browser-safe barrel |
| `packages/object-house/.../node.ts` | Node disk importer export |
| `packages/object-house/package.json` | `builder-package/node` export |
| Tests / MainMedia | Ready after bootstrap |

## Registry confirmation

With `?runtimeEvidence=1`:

- `1.BuilderPackage` — HTTP fetch mode
- `2.RuntimeRegistry` — gallery, hero, rooms, videos, floors present
- `6.RuntimeSource` — `csvLoadMode: http-fetch-public-house-package`, `usesManifestJson: false`

Counts (fixture package): gallery 15, rooms 10, videos 3, hero 1.

## Validation

| Area | Result |
|---|---|
| Hero | Registry + evidence resolve `/house-package/media/hero/hero.webp`; HTTP GET reflects disk after change |
| Gallery | Reordering `gallery.csv` → first registry entry becomes `02.webp` after reload |
| Rooms | `rooms.csv` rename → Room Registry name `Kuchyně PT-FIX` |
| Videos | `videos.csv` mediaId → Video Registry `ptfix01marker` |
| Bootstrap | No Vite `public/?raw` error; no bootstrap alert; `bootstrapOk: true` |
| Unit tests | client-studio 52/52 pass |

Artifacts: [`docs/reviews/assets/pt-runtime-fix-01/`](../assets/pt-runtime-fix-01/)

- `console-no-bootstrap-error.html` — console dump without bootstrap failure
- `console-viewport.png` — viewport after successful bootstrap
- `validation.json` — machine-readable probe

## Constraints preserved

- HP-002 schema unchanged
- Builder Package remains SSOT (no `manifest.json` fallback)
- Presentation still reads registries only
- Runtime command/Experience API unchanged beyond bootstrap readiness gate
