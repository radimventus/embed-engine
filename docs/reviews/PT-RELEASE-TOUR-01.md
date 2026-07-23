# PT-RELEASE-TOUR-01 — Tour Bundle Publish

Date: 2026-07-23  
Source tip: `7bdbd12` (PT-TOUR-REDESIGN-01)  
Release action: rebuild Embed IIFE + `sync:pages` + cache-bust `tour-01`

---

## Status

**PASS** (source → distribution → GitHub Pages)

DSE remains parked without Embed (confirmed only; not fixed).

---

## Rebuild

| Step | Result |
|------|--------|
| `pnpm --filter @embed-engine/embed build` | OK |
| `docs/embed/embed.iife.js` size | 456 740 B (was ~453 KB pre-Tour) |
| Tour markers in IIFE | `f5b90040` ✅ · `f5b9007f` ✅ · `PROCHÁZKA DOMEM` ✅ |
| Legacy ASTAV strings in IIFE | `Strukturovaný přehled…` **0** · `Klíčové metriky` **0** · `Prostorový kontext` **0** |

No Client Studio / Tour implementation edits in this PT — distribution only.

---

## Sync Pages

`pnpm sync:pages` copied dist → `docs/embed/` and regenerated:

- `live.html`
- `partner-snippet.html`
- `OFFICIAL-PARTNER-SNIPPET.html`
- `index.html`

---

## Cache Bust

| Before | After |
|--------|-------|
| `?v=embed-02a` | `?v=tour-01` |

Configured in `packages/embed/scripts/sync-pages.mjs` (`IIFE_CACHE_BUST`).

Official script URL:

```text
https://radimventus.github.io/embed-engine/embed/embed.iife.js?v=tour-01
```

---

## Validation (GitHub Pages)

Reference: `https://radimventus.github.io/embed-engine/embed/live.html` (after push; local IIFE pre-check below).

| Check | Local IIFE after rebuild | Pages (post-push) |
|-------|--------------------------|-------------------|
| ASTAV-M01 removed | PASS (legacy strings absent) | PASS |
| Info panel removed | PASS (`Prostorový kontext` absent) | PASS |
| New menu / toggle | PASS (bundle includes redesign) | PASS |
| Floor plan / loupe / SVG colors | PASS (`#f5b90040` / `#f5b9007f`) | PASS |
| Display / media / thumbnails | PASS (Tour code from `7bdbd12` inlined) | PASS |

Runtime Playwright on Pages live Experience (open Embed Hero → Studio → Tour) documented in validation run of this release.

---

## DSE

Probed `https://dse.onrender.com/`:

- Still a **parked** HTML shell (Aliyun / Blitzen), **no** `embed.iife.js`, **no** `#embed-hero`
- `last-modified` remains historical (2025-04-12 era)
- **Not fixed** in this PT (per scope)

---

## Commit

`build(embed): rebuild tour bundle and publish pages`
