# PT-RUNTIME-UNIFY-02 — Finalize Runtime Unification & Repository Baseline

## Verdict

**Pass** when HEAD contains the validated Runtime-unify + Embed-integration tree, clean build/smoke/fingerprint succeed, and Pages remote validation matches local dist.

---

## 1. Working tree audit

### Validated Runtime files (include)

| Area | Paths |
| --- | --- |
| Client Studio Runtime | `DecisionSessionRuntimeProvider`, `builderPackageBootstrap`, `builderPackageTestInstall`, `builderRuntimeHouseDefaults`, `experienceHouseMedia`, `synchronizedExperience*`, `presentation-assets`, `referenceFloorPlanGeometry`, deletions of `builderVideoUrl` / `projectRegistriesToResolvedPackage` |
| Presentation adapters | `MainMedia.tsx` (+ related tests: HouseNavigator, DecisionTerminal, AIAdvisor, AuditLeadCapture, decisionAnalytics) |
| object-house | `projectToHousePackage.ts` (+ test), `resolveVideoUrl.ts`, `builder-package/index.ts`, `package.json` |
| Runtime rules | `defaultHouseRules.ts` (Builder room ids) |
| Embed | `bindExperienceLauncher.ts` (async `launchExperience`) — delivery/mount already in CAP-DEPLOY-EMBED-01 |
| Pages media SSOT | `docs/house-package` legacy per-room deletions + `docs/media/01–03.webp` |
| Docs | PT-RUNTIME-UNIFY-01, PT-EMBED-RUNTIME-INTEGRATION-01, Current-Runtime-Baseline, RUNTIME-STATUS / RUNTIME / Engineering Debt updates, validation assets |

### Temporary / do not commit

| Path | Reason |
| --- | --- |
| `.playwright-browsers/` | Local browser cache |
| `apps/client-studio/baseline/`, `vite.baseline.config.ts` | Baseline experiment, not Runtime unify |
| `docs/platform/`, `docs/management/`, `docs/00-foundation/`, `docs/prompts/`, `docs/product/` | Unrelated drafts |
| CSCB-05A / PR-001 / pt-hero / pt-bug assets | Other PTs |
| Untracked `room-*.svg` copies | Not required for unify validation |
| `packages/reference-house/.../gallery/11–22.webp` deletions | Restored — accidental / out of scope |

### Generated (committed via deploy pipeline only)

`docs/embed/*` IIFE — rebuilt after this baseline commit so fingerprint matches HEAD.

---

## 2. Consistency

Uncommitted delta matches PT-RUNTIME-UNIFY-01 + PT-EMBED-RUNTIME-INTEGRATION-01 (+ Pages house-package layout from PT-DEPLOY-EMBED-01 sync). No feature work included.

---

## 3–7. Execution record

Filled after commit / push / clean build / remote validate.

| Step | Result |
| --- | --- |
| Baseline commit | _(pending)_ |
| Push | _(pending)_ |
| Clean build + smoke | _(pending)_ |
| `validate:pages -- --remote` | _(pending)_ |
| Proposed tag | `runtime-unified-baseline` (alt: `v0.8.0-runtime-unified`) — **not created** |

---

## Suggested tag

```text
runtime-unified-baseline
```
