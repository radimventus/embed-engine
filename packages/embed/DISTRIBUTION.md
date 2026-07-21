# Embed Distribution Package

**Package:** `@embed-engine/embed`  
**Aligned with:** [Architecture Freeze v0.1](../../docs/releases/Architecture%20Freeze%20v0.1.md)

This document defines the **production distribution package** produced by:

```bash
pnpm --filter @embed-engine/embed build
```

It does **not** publish to npm, GitHub Pages, or a CDN. It only standardizes `packages/embed/dist/`.

---

## Build output (`dist/`)

### Required artifacts

| File | Purpose |
| --- | --- |
| `embed.es.js` | ESM bundle for modern hosts / bundlers (`import { Embed } from "…"`) |
| `embed.iife.js` | IIFE bundle exposing global `Embed` for plain `<script>` tags |
| `index.d.ts` | Public TypeScript entry types |
| `version.json` | Machine-readable package / API version + artifact manifest |

Supporting public declaration files referenced by `index.d.ts` (for example `Embed.d.ts`, `fixtures.d.ts`, `mount.d.ts`) are also emitted as part of the types surface.

### Optional debug artifacts

| File | Purpose |
| --- | --- |
| `embed.es.js.map` | Source map for ESM (sources excluded from map payload) |
| `embed.iife.js.map` | Source map for IIFE (sources excluded from map payload) |

Host pages do **not** need source maps to run Embed.

### Not part of the public package

Internal implementation declarations (`bootstrap`, `session`, `styles`, `iife` entry) are pruned after `tsc` and must not be consumed by hosts.

---

## `version.json`

Written on every build. Example shape:

```json
{
  "name": "@embed-engine/embed",
  "version": "0.1.0",
  "apiVersion": "0.1.0",
  "freeze": "Architecture Freeze v0.1",
  "artifacts": {
    "esm": "embed.es.js",
    "iife": "embed.iife.js",
    "types": "index.d.ts",
    "sourcemaps": ["embed.es.js.map", "embed.iife.js.map"]
  },
  "publicApi": ["Embed.mount", "Embed.unmount", "Embed.version"]
}
```

`package.json` `version` and `Embed.version` (`src/version.ts` → `EMBED_VERSION`) must match or the build fails.

---

## Public API (unchanged)

```ts
Embed.mount(...)
Embed.unmount(...)
Embed.version
```

This slice does not change the Embed public API.

---

## Reproducibility notes

- Bundles are built with Vite library mode; workspace packages are **bundled in** so IIFE/ESM are self-contained for hosts.
- Absolute host filesystem paths must not appear in shippable JS (build asserts this).
- Source maps use relative `sources` paths and exclude inline `sourcesContent`.

---

## How to build

From the monorepo root:

```bash
pnpm --filter @embed-engine/embed build
```

Or via Turbo (builds dependencies first):

```bash
pnpm build --filter @embed-engine/embed
```

Verify locally with the standalone playground (serve repository root):

```bash
python3 -m http.server
# open http://localhost:8000/playground/
```
