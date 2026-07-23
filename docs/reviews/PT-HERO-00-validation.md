# PT-HERO-00 Validation

Date: 2026-07-23

## Goal

Synchronize the approved Reference Hero (local Morning Baseline at `http://127.0.0.1:5176/`) into the public Embed delivery path without inventing new UX.

## What was synchronized

| Piece | Reference (5176) | Public Embed (after sync) |
|------|------------------|---------------------------|
| Eyebrow | MODERN A01 – 4+kk | MODERN A01 – 4+kk |
| Title | Rodinný dům, kde to dýchá štěstím | Rodinný dům, kde to dýchá štěstím |
| Metrics | 124 m2 / A ++ / Dřevostavba | identical |
| CTA | Podívat se dovnitř – video → | identical |
| Photo plane | house-modern-01 exterior + left veil | `/media/house-modern-01/exterior.webp` + veil |

## Publish

- Rebuilt `@embed-engine/embed` IIFE from Client Studio sources
- `pnpm sync:pages` → `docs/embed/*`
- Cache-bust: **`?v=hero-00`**
- Partner usage snippet in `packages/embed/scripts/sync-pages.mjs` updated to the same query

## Environment checks

| Environment | Hero copy match | Bundle | Cache-bust |
|-------------|-----------------|--------|------------|
| Local 5176 (SoT) | reference | baseline static | n/a |
| Local `docs/embed/live.html` | PASS (measured on `#hero`) | local IIFE | `hero-00` |
| GitHub Pages `live.html` | PASS after publish push | Pages IIFE | `hero-00` |
| Partner Render | PASS when script uses Pages IIFE `?v=hero-00` | same as Pages | must bump `?v=` |

## Shell features retained on Pages / partner Embed

- Sticky Experience header (UX-01 series)
- Close control
- Reveal settle (~1125ms)

Standalone 5176 remains the historical Morning Baseline SPA (no Embed chrome). Public parity is for **Hero Scene content**, delivered through Embed.

## Partner activation

```html
<script src="https://radimventus.github.io/embed-engine/embed/embed.iife.js?v=hero-00"></script>
```

If partner still shows the previous Hero, hard-refresh or purge host/CDN cache — the previous `?v=ux-01f` tip must not remain.

## Artifacts

- `docs/reviews/assets/pt-hero-00-local-5176-full.png`
- `docs/reviews/assets/pt-hero-00-local-pages-hero.png`

## Confirmation

Reference Hero from 5176 is synchronized into the public Embed IIFE and published via the Pages branch with cache-bust `hero-00`.
