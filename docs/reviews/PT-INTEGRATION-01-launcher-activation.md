# PT-INTEGRATION-01 — Demo Launcher Activation Report

**Date:** 2026-07-23  
**Status:** Pass  
**Mode:** `launcher` (Experience Mode — EMB-01 / ADR-015)

## Summary

Demonstrační host stránky byly přepnuty z inline auto-mountu na **Launcher workflow**. Client Studio se na loadu nerenderuje; Hero CTA armí Launcher a otevírá fullscreen Delivery Overlay s Reveal na `social-proof`.

## Changes (demo / publish only)

| Surface | Change |
| --- | --- |
| `packages/embed/demo/` | Launcher Mode; Hero CTA; no `#demo` inline mount |
| `packages/embed/demo/iife.html` | Same Launcher arming via IIFE |
| `playground/index.html` | Same |
| `docs/embed/live.html` | Regenerated via `sync-pages` as partner Hero + CTA |
| `docs/embed/index.html` | Usage snippet updated to Launcher Mode |
| `packages/embed/scripts/sync-pages.mjs` | Templates write Launcher live/index (prevents regression on next sync) |
| `docs/embed/embed.{iife,es}.js` | Rebuilt/synced so Pages IIFE includes launcher + reveal |

**Not changed:** Runtime, Delivery source logic (beyond already-shipped PT-IMPL-01/02), Decision Layer, Experience Layer, architecture docs.

## Validation results

### Initial load
- Only host Hero / partner chrome visible
- No `[data-client-studio-root]` / overlay in DOM
- CTA has `data-embed-launcher` (armed)

### Launch → Reveal
- Mode: **launcher**
- Fullscreen `[data-embed-overlay]`
- Reveal after Runtime Ready + Studio Ready (state sync)
- Landing Anchor: **`social-proof`** (`data-landing-anchor-id`, `data-viewport-ready=true`, `data-embed-reveal-state=active`)

### Close
- Overlay removed
- Host Hero visible again
- Launcher remains armed
- Host scroll restored

### Regression
- `@embed-engine/embed` unit suite: **26/26 pass** (PT-IMPL-01/02 coverage retained)

## Visual evidence

Sequence screenshots:

1. [`pt-integration-01-01-hero.png`](./assets/pt-integration-01-01-hero.png) — Refresh → Hero only  
2. [`pt-integration-01-02-overlay-open.png`](./assets/pt-integration-01-02-overlay-open.png) — CTA → fullscreen overlay  
3. [`pt-integration-01-03-reveal-social-proof.png`](./assets/pt-integration-01-03-reveal-social-proof.png) — Reveal → Landing Anchor  
4. [`pt-integration-01-04-host-restored.png`](./assets/pt-integration-01-04-host-restored.png) — Close → Hero restored  

## Known deviations

- Demo host Hero is a **partner-page** Hero (CTA surface), not Client Studio Journey Hero — by design for Launcher Mode.
- Local Vite demo is the primary interactive verification path; `docs/embed/live.html` uses `assetBase` pointing at GitHub Pages for media.
- Headless scroll position before open may be clamped by short viewport; Close still restores the captured Host scroll snapshot.
