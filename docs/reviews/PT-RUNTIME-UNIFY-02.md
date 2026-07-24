# PT-RUNTIME-UNIFY-02 — Finalize Runtime Unification & Repository Baseline

## Verdict

**Pass.** Repository HEAD matches the validated Runtime-unify + Embed-integration + deploy-hardening tree. Clean build, smoke, and `validate:pages -- --remote` succeeded.

---

## 1. Working tree audit

### Validated Runtime files (committed)

| Area | Paths |
| --- | --- |
| Client Studio Runtime | `DecisionSessionRuntimeProvider`, `builderPackageBootstrap`, `builderPackageTestInstall`, `builderRuntimeHouseDefaults`, `experienceHouseMedia`, `synchronizedExperience*`, `presentation-assets`, `referenceFloorPlanGeometry`; removed `projectRegistriesToResolvedPackage` / moved `builderVideoUrl` → object-house |
| Presentation adapters | `MainMedia.tsx` + related tests |
| object-house | `projectToHousePackage.ts` (+ test), `resolveVideoUrl.ts`, `builder-package/index.ts` |
| Runtime rules | `defaultHouseRules.ts` |
| Embed | `bindExperienceLauncher.ts` (async launch) |
| Pages media | `docs/house-package` legacy per-room cleanup; `docs/media/01–03.webp` |
| Docs | PT reports, Current-Runtime-Baseline, RUNTIME-STATUS / RUNTIME / Engineering Debt, validation assets |

### Left uncommitted (out of scope)

| Path | Reason |
| --- | --- |
| `.playwright-browsers/` | Local cache |
| `apps/client-studio/baseline/`, `vite.baseline.config.ts` | Experiment |
| `docs/platform/`, `docs/management/`, `docs/00-foundation/`, `docs/prompts/`, `docs/product/` | Unrelated drafts |
| CSCB-05A / PR-001 / pt-hero / pt-bug assets | Other PTs |
| Untracked `room-*.svg` / `public/media/01–03.webp` | Not required for baseline |

---

## 2–7. Execution record

| Step | Result |
| --- | --- |
| Baseline commit | `40bfd9e` — `CAP-RUNTIME-BASELINE-01: Finalize unified runtime baseline` |
| Pages fingerprint align | `b81548f` — `chore(embed): align Pages IIFE fingerprint with baseline HEAD` |
| Push | **OK** — `origin/feature/cap-p04-founding-partner` = `b81548f` |
| Clean worktree build | **OK** — `pnpm install` + `pnpm build` at `40bfd9e`; smoke PASS; fingerprint `40bfd9e` |
| `validate:pages -- --remote` | **PASS** — remote marker `EMBED_RUNTIME_BUILD:40bfd9e@2026-07-24T05:17:33Z` |
| Proposed tag (not created) | `runtime-unified-baseline` (alt: `v0.8.0-runtime-unified`) |

### Runtime fingerprint (published)

```text
Build: 40bfd9e
Runtime: builder-package/projectBuilderImportToHousePackage
Built: 2026-07-24T05:17:33Z
iifeSha256: 76b98e46828d6fc649c76b9219cb9b04b0d48bd12731a057b580357cad34d07e
```

---

## Suggested tag

```text
runtime-unified-baseline
```

Create manually when ready:

```bash
git tag -a runtime-unified-baseline b81548f -m "Unified Runtime baseline (CS + Embed + Pages)"
```

---

## Documentation updated

- `docs/architecture/Current-Runtime-Baseline.md`
- `docs/architecture/RUNTIME-STATUS.md`
- `docs/architecture/RUNTIME.md`
- `docs/implementation/Engineering Debt.md`
- This report
