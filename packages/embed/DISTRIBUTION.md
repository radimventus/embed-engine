# Embed Distribution Package

**Package:** `@embed-engine/embed`  
**Aligned with:** [Architecture Freeze v0.1](../../docs/releases/Architecture%20Freeze%20v0.1.md), **PT-DEPLOY-EMBED-01**

This document defines the **production distribution package** produced by:

```bash
pnpm --filter @embed-engine/embed build
```

It standardizes `packages/embed/dist/` and feeds the GitHub Pages copy under `docs/embed/` (see [GitHub Pages Distribution](../../docs/releases/GitHub%20Pages%20Distribution.md)).

---

## Pipeline diagram

```text
Source
  packages/embed/src/*
  apps/client-studio/src/embed/mountClientStudio.tsx
        │
        ▼
build-distribution.mjs
  1. create .build/fingerprint.json   (git commit + UTC time + Runtime source)
  2. vite build → dist/embed.es.js    (__EMBED_RUNTIME_BUILD__ injected)
  3. vite build → dist/embed.iife.js
  4. tsc declarations
  5. version.json (+ iifeSha256 / esmSha256 / fingerprint)
  6. smoke-runtime.mjs                FAIL → build fails
        │
        ▼
sync-pages.mjs
  copy dist → docs/embed/
  assert byte-identical IIFE/ESM/version.json
  assert fingerprint marker inside published IIFE
  validate-pages.mjs
        │
        ▼
GitHub Pages (/docs) → Browser
```

---

## Build output (`dist/`)

### Required artifacts

| File | Purpose |
| --- | --- |
| `embed.es.js` | ESM bundle |
| `embed.iife.js` | IIFE (`global Embed`) — **partner production script** |
| `index.d.ts` | Public TypeScript entry types |
| `version.json` | Version + **Runtime fingerprint** + artifact SHA-256 |

### Optional debug artifacts

| File | Purpose |
| --- | --- |
| `embed.es.js.map` / `embed.iife.js.map` | Source maps |

### Not the production IIFE

| Path | Role |
| --- | --- |
| `packages/embed/demo/` (`validate.html`) | Local Vite **source** demo — not `docs/embed/embed.iife.js` |

---

## Runtime fingerprint

Generated automatically on every `build` (never hand-edited):

| Field | Source |
| --- | --- |
| `commit` | `git rev-parse --short HEAD` |
| `builtAt` | UTC ISO-8601 at build time |
| `runtimeSource` | `builder-package/projectBuilderImportToHousePackage` |
| `marker` | `EMBED_RUNTIME_BUILD:<commit>@<builtAt>` baked into JS |
| `iifeSha256` / `esmSha256` | SHA-256 of shipped bundles |

On `Embed.mount`:

```text
Embed Runtime
Build: <commit>
Runtime: builder-package/projectBuilderImportToHousePackage
Built: <builtAt>
```

Public API: `Embed.build`.

---

## `version.json` (shape)

```json
{
  "name": "@embed-engine/embed",
  "version": "0.1.0",
  "apiVersion": "0.1.0",
  "fingerprint": {
    "commit": "abc1234",
    "builtAt": "2026-07-24T04:32:00Z",
    "runtimeSource": "builder-package/projectBuilderImportToHousePackage",
    "marker": "EMBED_RUNTIME_BUILD:abc1234@2026-07-24T04:32:00Z",
    "iifeSha256": "…",
    "esmSha256": "…"
  },
  "artifacts": {
    "esm": "embed.es.js",
    "iife": "embed.iife.js",
    "types": "index.d.ts"
  },
  "publicApi": ["Embed.mount", "Embed.unmount", "Embed.version", "Embed.build"]
}
```

---

## Commands

```bash
pnpm --filter @embed-engine/embed build           # fingerprint + bundles + smoke
pnpm --filter @embed-engine/embed sync:pages      # copy + hash/fingerprint gate
pnpm --filter @embed-engine/embed validate:pages  # docs/embed == dist
pnpm --filter @embed-engine/embed validate:pages -- --remote  # live Pages
pnpm --filter @embed-engine/embed deploy:pages    # build && sync:pages
```

Stale publish is refused: `sync:pages` fails if `docs/embed/embed.iife.js` would not match `dist/embed.iife.js` after copy, or if the fingerprint marker / Runtime source string is missing.
