# GitHub Pages — Embed Distribution

**Status:** PUBLISH PATH  
**Aligned with:** [Distribution Package v0.1](./Distribution%20Package%20v0.1.md), [Architecture Freeze v0.1](./Architecture%20Freeze%20v0.1.md)

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

Manifest:

```text
https://radimventus.github.io/embed-engine/embed/version.json
```

> **Note:** The repository must allow GitHub Pages (public repo, or private repo on a plan that includes Pages). Anonymous HTTPS `200` for the IIFE is the publish acceptance check.

## Host usage

```html
<div id="embed"></div>
<script src="https://radimventus.github.io/embed-engine/embed/embed.iife.js"></script>
<script>
  Embed.mount({
    target: "#embed",
    objectId: "house-modern-01"
  });
</script>
```

Serve Object Package media (`/house-package`, `/media`) from the host origin (same assets as Client Studio `public/`).

Legacy Garden (opt-in only):

```js
Embed.mount({ target: "#embed", fixture: "garden" });
```

## What is published

Source of truth remains `packages/embed/dist/` (M3/S1).  
GitHub Pages serves a copy under `docs/embed/`:

| Artifact | Published |
| --- | --- |
| `embed.iife.js` | yes |
| `embed.es.js` | yes |
| `version.json` | yes |
| public `.d.ts` | yes |
| source maps | yes (optional debug) |
| internal demo / Vite / monorepo sources | **no** |

`docs/.nojekyll` disables Jekyll processing so `.js` / `.json` are served as static files.

## Operator steps (no GitHub Actions)

```bash
pnpm --filter @embed-engine/embed build
pnpm --filter @embed-engine/embed sync:pages
```

Commit `docs/embed/**` and `docs/.nojekyll`, then ensure GitHub Pages is enabled:

- Source: Deploy from a branch  
- Branch: currently `feature/cap-p04-founding-partner` (M3/S2 verification); switch to `main` after merge  
- Folder: `/docs`

**Visibility:** GitHub Free requires a **public** repository for GitHub Pages. This repo was set to public to activate Pages.

## Verification (confirmed 2026-07-21)

```bash
curl -sI https://radimventus.github.io/embed-engine/embed/embed.iife.js
# HTTP/2 200
# content-type: application/javascript; charset=utf-8

curl -s https://radimventus.github.io/embed-engine/embed/version.json
# version 0.1.0 matches packages/embed/dist/version.json
```

## Out of scope (this slice)

- GitHub Actions auto-publish  
- CDN  
- Custom domain  
- Embed public API changes  
