# Distribution Package v0.1

**Status:** DEFINED  
**Date:** 2026-07-21  
**Package:** `@embed-engine/embed`  
**Detail SSOT:** [packages/embed/DISTRIBUTION.md](../../packages/embed/DISTRIBUTION.md)

## Decision

The production distribution package for Embed Engine is the contents of:

```text
packages/embed/dist/
```

produced exclusively by:

```bash
pnpm --filter @embed-engine/embed build
```

## Required artifacts

- `embed.es.js` — ESM
- `embed.iife.js` — IIFE (`global Embed`)
- `index.d.ts` — public types entry
- `version.json` — version + artifact manifest

## Explicitly out of this definition

- GitHub Pages
- GitHub Actions / auto-publish
- CDN / npm registry publish
- Changes to `Embed.mount` / `unmount` / `version`

Deferred items: [Engineering Debt](../implementation/Engineering%20Debt.md).
