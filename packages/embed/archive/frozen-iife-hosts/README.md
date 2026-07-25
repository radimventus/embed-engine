# Archive — frozen IIFE hosts

**Not Local Runtime. Not Embed Demo. Not Playground.**  
**Not a substitute for Published Embed verification after a fresh publish.**

These HTML pages load the **Release Snapshot** `docs/embed/embed.iife.js`
(same tree as `packages/embed/dist` via symlink). They exist only so an
explicit archival / smoke check of a built IIFE remains possible.

## Live Runtime hosts (SSOT)

| Host | Command |
|------|---------|
| Local Runtime | `pnpm --filter @embed-engine/client-studio dev` → `:4173` |
| Embed Demo | `pnpm --filter @embed-engine/embed demo` → `demo/index.html` |
| Playground | `pnpm exec vite --config playground/vite.config.ts` → `:5185` |

Those hosts resolve `packages/*/src` via SSOT aliases. They never load these archive pages.

Official publish: `pnpm embed:publish` · [ADR-019](../../../../docs/architecture/adr/ADR-019-runtime-vs-release.md)

## How to open this archive (explicit)

1. `pnpm embed:publish` (or package build that refreshes `docs/embed`)
2. From repo root, static-serve (example):
   `npx --yes serve packages/embed -p 5199`
3. Open:
   `http://127.0.0.1:5199/archive/frozen-iife-hosts/iife.html`

Do **not** open these files through the Vite Embed Demo server — they are
intentionally outside `packages/embed/demo/`.
