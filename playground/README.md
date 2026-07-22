# Embed Engine Playground

Standalone check that `embed.iife.js` mounts **Client Studio** on a plain HTML page — no Vite, no TypeScript, no `@embed-engine/embed` demo runner.

## Prerequisites

```bash
pnpm --filter @embed-engine/embed build
```

Media assets (`/house-package`, `/media`) must be served from the repository root (Client Studio `public/` is copied or linked — see below).

## Run

Serve the **repository root** (not `playground/` alone). The page loads the bundle via `../packages/embed/dist/embed.iife.js`.

```bash
# from repository root — expose Client Studio public assets at /
# Option A: symlink once
ln -sfn apps/client-studio/public/house-package house-package
ln -sfn apps/client-studio/public/media media

python3 -m http.server
```

Open:

[http://localhost:8000/playground/](http://localhost:8000/playground/)

> If you start `python3 -m http.server` inside `playground/`, the browser requests `/packages/embed/dist/embed.iife.js` relative to that folder and gets **404**. That is a static-server path issue, not an Embed SDK defect.

## What this proves

- Page is plain HTML (no bundler)
- Only external script: `embed.iife.js`
- Global `Embed` with `mount` / `unmount` / `version`
- `Embed.mount({ target: "#embed", objectId: "house-modern-01" })` mounts Client Studio
- Garden is **not** the production path (use explicit `fixture: "garden"` only for legacy)

Legacy Garden (opt-in):

```js
Embed.mount({ target: "#embed", fixture: "garden" });
```
