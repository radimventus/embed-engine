# Embed Distribution (conis.cz)

**Status:** PUBLISH PATH  
**Aligned with:** [Distribution Package v0.1](./Distribution%20Package%20v0.1.md), [Architecture Freeze v0.1](./Architecture%20Freeze%20v0.1.md), **PT-EMBED-MIGRATION-01**

> **Canonical public origin:** `https://conis.cz`  
> Do **not** use `https://radimventus.github.io/embed-engine` in partner hosts. That origin 301-redirects to conis.cz and breaks `fetch()` of house-package CSV (CORS).

Historical alias document: this file supersedes the former “GitHub Pages Distribution” partner URLs. GitHub Pages remains the **publish mechanism** (`/docs` branch); the **public hostname** is the custom domain `conis.cz`.

## Public URL

Base:

```text
https://conis.cz/
```

Distribution package:

```text
https://conis.cz/embed/
```

IIFE (primary host script):

```text
https://conis.cz/embed/embed.iife.js
```

Manifest (+ Runtime fingerprint):

```text
https://conis.cz/embed/version.json
```

House package assets:

```text
https://conis.cz/house-package/
```

---

## Build → publish pipeline

```text
Source (packages/embed/src + Client Studio mount)
        │
        ▼
pnpm --filter @embed-engine/embed build
  · generate .build/fingerprint.json (commit + builtAt + Runtime source)
  · vite → packages/embed/dist/embed.es.js
  · vite → packages/embed/dist/embed.iife.js   ← production IIFE
  · tsc → declarations + version.json (incl. iifeSha256)
  · smoke-runtime
        │
        ▼
pnpm --filter @embed-engine/embed sync:pages
  · finalize docs/embed/ (PAGES_ORIGIN = https://conis.cz)
  · regenerate live.html / partner snippet
  · assert fingerprint + SHA checks
        │
        ▼
git commit docs/embed/** (+ house-package / media as needed) → push
        │
        ▼
GitHub Pages (/docs) served at https://conis.cz
```

### Scripts & directories

| Role | Path |
| --- | --- |
| Build orchestrator | `packages/embed/scripts/build-distribution.mjs` |
| Fingerprint helpers | `packages/embed/scripts/lib/buildFingerprint.mjs` |
| Runtime smoke | `packages/embed/scripts/smoke-runtime.mjs` |
| Pages sync | `packages/embed/scripts/sync-pages.mjs` |
| Pages validate | `packages/embed/scripts/validate-pages.mjs` |
| Build output | `packages/embed/dist/` |
| Pages publish tree | `docs/embed/` |

---

## Host usage (official partner snippet)

Copy from [`docs/embed/OFFICIAL-PARTNER-SNIPPET.html`](../embed/OFFICIAL-PARTNER-SNIPPET.html):

```html
<div id="embed-hero"></div>
<script src="https://conis.cz/embed/embed.iife.js?v=embed-01"></script>
<script>
  Embed.mount({
    mode: "launcher",
    target: "#embed-hero",
    objectId: "house-modern-01",
    assetBase: "https://conis.cz",
    entryPoint: "hero-cta",
    launcherId: "embed-hero"
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

`assetBase` must be `https://conis.cz` on foreign partner origins (WordPress / BaseKit / DSE).

---

## Operator steps

```bash
pnpm --filter @embed-engine/embed deploy:pages
# equivalent: build && sync:pages (smoke + hash checks included)
```

Commit `docs/embed/**` (and synced media trees if changed), push. Pages source: branch folder `/docs`.

### Verify live distribution

```bash
pnpm --filter @embed-engine/embed validate:pages
pnpm --filter @embed-engine/embed validate:pages -- --remote

curl -s https://conis.cz/embed/version.json
# fingerprint.commit / marker / iifeSha256 must match docs/embed/version.json
```

Migration checklist: [Embed Migration Checklist](../ops/embed-migration-checklist.md)  
Release note: [Embed Infrastructure Migration](./Embed-Infrastructure-Migration.md)

---

## What is published

| Artifact | Published |
| --- | --- |
| `embed.iife.js` | yes |
| `embed.es.js` | yes |
| `version.json` | yes |
| `OFFICIAL-PARTNER-SNIPPET.html` | yes |
| `live.html` | yes (QA host) |
| `house-package/*` | yes (asset tree) |
