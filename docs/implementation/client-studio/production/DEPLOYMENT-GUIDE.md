# Deployment Guide — Client Studio

| Field | Value |
| --- | --- |
| **Capability** | CSCB-09 |
| **Product** | Client Studio Generation 1 |
| **Date** | 2026-07-22 |

---

## What is deployed

A static SPA built by Vite from `apps/client-studio`.

```text
apps/client-studio/
  public/          → copied into dist/ (media, house-package assets)
  dist/            → production artefact (HTML + JS/CSS chunks)
```

This is **not** the Embed IIFE GitHub Pages package (`docs/releases/GitHub Pages Distribution.md`).

---

## Prerequisites

- Node.js compatible with the repo engines field
- `pnpm` (workspace package manager)
- Clean checkout of the release commit approved by RR-001

---

## Build

From repository root:

```bash
pnpm install --frozen-lockfile
pnpm --filter @embed-engine/client-studio typecheck
pnpm --filter @embed-engine/client-studio test
pnpm --filter @embed-engine/client-studio build
```

Optional subdirectory host:

```bash
VITE_BASE=/client-studio/ pnpm --filter @embed-engine/client-studio build
```

Artefact: `apps/client-studio/dist/`.

---

## Local production preview

```bash
pnpm --filter @embed-engine/client-studio preview
```

Opens `http://127.0.0.1:4174` (strict port).

Smoke:

1. Hero media loads (or graceful fallback).
2. Spatial navigation changes rooms without blank viewport.
3. Priority + Decision Terminal update without errors.
4. Conversion mailto opens with consent gate.
5. Hard refresh recovers session bootstrap (`Připravuji Decision Session…` then journey).

---

## Hosting

Any static host that serves `index.html` for SPA routes is acceptable:

- Nginx / Apache / S3+CloudFront / Netlify / Vercel / GitHub Pages (SPA project, not Embed IIFE)

Requirements:

| Requirement | Detail |
| --- | --- |
| HTTPS | Required for pilot customers |
| SPA fallback | All unknown paths → `index.html` |
| Asset caching | Fingerprinted assets may be long-cache; `index.html` short/no-cache |
| Media | Ensure `/media/house-modern-01/*` and `/house-package/*` are published |

---

## Asset integrity

| Path | Role |
| --- | --- |
| `/media/house-modern-01/exterior.webp` | Hero primary |
| `/media/house-modern-01/floorplan.png` | Floor plan |
| `/house-package/decision-canvas/*` | Overlay SVGs |

Missing media must not crash the journey — Hero / MainMedia show Czech fallback surfaces.

---

## Source-map policy

Production builds ship **without** source maps (`build.sourcemap: false`).

Internal debug builds may temporarily set `sourcemap: true` — never for external pilot hosts.

---

## Version visibility

| Location | Value |
| --- | --- |
| `document.documentElement.dataset.clientStudioVersion` | Package version |
| `document.documentElement.dataset.clientStudioGeneration` | `1` |
| ErrorBoundary footer | Product + version on fatal UI |

Do not expose Runtime session dumps in UI or logs.

---

## Post-deploy checks

Complete [Pilot Readiness Checklist](./PILOT-READINESS-CHECKLIST.md) against the live URL before inviting external customers.
