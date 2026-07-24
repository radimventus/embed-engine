# GitHub Pages — Embed Distribution

**Status:** PUBLISH PATH  
**Aligned with:** [Distribution Package v0.1](./Distribution%20Package%20v0.1.md), [Architecture Freeze v0.1](./Architecture%20Freeze%20v0.1.md), **PT-DEPLOY-EMBED-01**

## Public URL

Base:

```text
https://radimventus.github.io/embed-engine/
```

Distribution package:

```text
https://radimventus.github.io/embed-engine/embed/
```

IIFE (primary host script):

```text
https://radimventus.github.io/embed-engine/embed/embed.iife.js
```

Manifest (+ Runtime fingerprint):

```text
https://radimventus.github.io/embed-engine/embed/version.json
```

> **Note:** The repository must allow GitHub Pages (public repo, or private repo on a plan that includes Pages). Anonymous HTTPS `200` for the IIFE is the publish acceptance check.

---

## Build → Pages pipeline

```text
Source (packages/embed/src + Client Studio mount)
        │
        ▼
pnpm --filter @embed-engine/embed build
  · generate .build/fingerprint.json (commit + builtAt + Runtime source)
  · vite → packages/embed/dist/embed.es.js
  · vite → packages/embed/dist/embed.iife.js   ← production IIFE
  · tsc → declarations + version.json (incl. iifeSha256)
  · smoke-runtime (Rooms 10, gallery exterior 01–03, Hero, fingerprint in IIFE)
        │
        ▼
pnpm --filter @embed-engine/embed sync:pages
  · copy dist → docs/embed/
  · regenerate live.html / partner snippet (?v=<commit>)
  · assert SHA-256(docs/embed/embed.iife.js) === SHA-256(dist/embed.iife.js)
  · assert fingerprint marker present in published IIFE
  · validate-pages (local)
        │
        ▼
git commit docs/embed/** (+ house-package / media as needed) → push
        │
        ▼
GitHub Pages (/docs) → Browser loads embed.iife.js
```

### Scripts & directories

| Role | Path |
| --- | --- |
| Build orchestrator | `packages/embed/scripts/build-distribution.mjs` |
| Fingerprint helpers | `packages/embed/scripts/lib/buildFingerprint.mjs` |
| Runtime smoke | `packages/embed/scripts/smoke-runtime.mjs` |
| Pages sync | `packages/embed/scripts/sync-pages.mjs` |
| Pages validate | `packages/embed/scripts/validate-pages.mjs` |
| Vite ESM/IIFE | `packages/embed/vite.config.ts`, `vite.iife.config.ts`, `vite.shared.ts` |
| Build output | `packages/embed/dist/` |
| Fingerprint (gitignored) | `packages/embed/.build/fingerprint.json` |
| Pages publish tree | `docs/embed/` |
| Local Vite demo (not IIFE) | `packages/embed/demo/` (`validate.html` = source via Vite) |

**Two artifacts:**

1. **Production IIFE/ESM** — `dist/` → `docs/embed/` → GitHub Pages (partners).
2. **Vite demo** — `pnpm demo` serves TypeScript source; **does not** use `docs/embed/embed.iife.js`.

---

## Host usage

```html
<div id="embed"></div>
<script src="https://radimventus.github.io/embed-engine/embed/embed.iife.js?v=<commit>"></script>
<script>
  Embed.mount({
    target: "#embed",
    objectId: "house-modern-01",
    assetBase: "https://radimventus.github.io/embed-engine"
  });
</script>
```

On mount the console must show:

```text
Embed Runtime
Build: <short-sha>
Runtime: builder-package/projectBuilderImportToHousePackage
Built: <ISO-8601 Z>
```

Also available as `Embed.build` (`commit`, `builtAt`, `runtimeSource`, `marker`).

`assetBase` is required when the host origin does not serve `/media` and `/house-package`.

---

## Operator steps

```bash
pnpm --filter @embed-engine/embed deploy:pages
# equivalent: build && sync:pages (smoke + hash checks included)
```

Commit `docs/embed/**` (and synced media trees if changed), push the Pages branch:

- Source: Deploy from a branch  
- Folder: `/docs`

### Verify Pages runs the latest build

```bash
# Local docs/embed == dist (always after sync:pages)
pnpm --filter @embed-engine/embed validate:pages

# After push + Pages rebuild — compare live site to this build
pnpm --filter @embed-engine/embed validate:pages -- --remote

# Or manually:
curl -s https://radimventus.github.io/embed-engine/embed/version.json
# fingerprint.commit / marker / iifeSha256 must match packages/embed/dist/version.json
```

If `sync:pages` detects a SHA or fingerprint mismatch, it **exits non-zero** and must not be ignored.

---

## What is published

| Artifact | Published |
| --- | --- |
| `embed.iife.js` | yes |
| `embed.es.js` | yes |
| `version.json` (incl. fingerprint + hashes) | yes |
| public `.d.ts` | yes |
| source maps | yes (optional debug) |
| internal demo / Vite / monorepo sources | **no** |

`docs/.nojekyll` disables Jekyll processing so `.js` / `.json` are served as static files.

## Out of scope

- GitHub Actions auto-publish  
- CDN  
- Custom domain  
