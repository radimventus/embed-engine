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
    fixture: "garden"
  });
</script>
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

Commit `docs/embed/**` and `docs/.nojekyll`, merge to the branch configured for Pages (`main`, source = `/docs`), then enable Pages in repository settings if not already active:

- Source: Deploy from a branch  
- Branch: `main`  
- Folder: `/docs`

## Verification

```bash
curl -sI https://radimventus.github.io/embed-engine/embed/embed.iife.js
# expect: HTTP/2 200  and content-type including javascript
curl -s https://radimventus.github.io/embed-engine/embed/version.json
```

## Out of scope (this slice)

- GitHub Actions auto-publish  
- CDN  
- Custom domain  
- Embed public API changes  
