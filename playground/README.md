# Embed Engine Playground

Standalone check that `embed.iife.js` works on a plain HTML page — no Vite, no TypeScript, no `@embed-engine/embed` demo runner.

## Prerequisites

```bash
pnpm --filter @embed-engine/embed build
```

## Run

Serve the **repository root** (not `playground/` alone). The page loads the bundle via `../packages/embed/dist/embed.iife.js`, which only resolves when the static server can see both `playground/` and `packages/`.

```bash
# from repository root
python3 -m http.server
```

Open:

[http://localhost:8000/playground/](http://localhost:8000/playground/)

> If you start `python3 -m http.server` inside `playground/`, the browser requests `/packages/embed/dist/embed.iife.js` relative to that folder and gets **404**. That is a static-server path issue, not an Embed SDK defect.

## What this proves

- Page is plain HTML (no bundler)
- Only external script: `embed.iife.js`
- Global `Embed` with `mount` / `unmount` / `version`
- `Embed.mount({ target: "#embed", fixture: "garden" })` renders Garden Experience
- Full Journey progresses without importing Runtime or Renderer on the page
