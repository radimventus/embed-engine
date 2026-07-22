# Embed Rendering Parity — Client Studio

**Status:** COMPLETE  
**Date:** 2026-07-22  
**Scope:** Visual parity between standalone Client Studio and Embed-mounted Client Studio

---

## Verdict

After fixes, embedded Client Studio matches standalone on layout metrics (viewport 1440×900):

| Metric | Standalone | Embed | Δ |
| --- | --- | --- | --- |
| Sidebar width | 48px | 48px | 0 |
| Desktop canvas | 1432px | 1432px | 0 |
| Hero image height | 584px | 584px | 0 |
| Font stack | Inter, system-ui, sans-serif | same | — |

Screenshots: [parity-standalone-after.png](./assets/parity-standalone-after.png) · [parity-embed-after.png](./assets/parity-embed-after.png)

---

## Root causes (do not guess — measured)

### 1. Incomplete Tailwind CSS in the Embed bundle (primary)

| | |
| --- | --- |
| **Symptom** | Collapsed layout, “vertical” sidebar labels, broken Hero / spacing |
| **Evidence** | Embed CSS ~9.7 KB / ~64 utilities vs standalone ~36 KB / ~346 utilities |
| **Cause** | Embed Vite build CWD is `packages/embed`. Client Studio `tailwind.config.js` content globs (`./src/**`) resolved against that CWD, so Experience TSX was **not scanned**. Only `@apply` / Preflight survived. |
| **Fix** | `packages/embed/tailwind.config.js` with **absolute** content paths to `apps/client-studio` + `packages/ui` |

### 2. Host page width constraint

| | |
| --- | --- |
| **Symptom** | Experience squeezed inside a narrow column |
| **Evidence** | `packages/embed/demo/style.css` had `#demo { width: min(960px, …) }` while canvas is fixed **1432px** |
| **Fix** | `#demo { width: 100% }` — host must not clip the Studio shell |

### 3. Missing Inter font loading

| | |
| --- | --- |
| **Symptom** | Typography drift vs localhost |
| **Evidence** | Standalone loads Google Fonts in `apps/client-studio/index.html`; Embed IIFE did not |
| **Fix** | `ensureClientStudioStyles()` injects the same Inter stylesheet + preconnect |

### 4. Standalone shell selectors (`html` / `body` / `#root`)

| | |
| --- | --- |
| **Symptom** | Background / min-height / antialias not applied to mount node |
| **Fix** | Embed shell CSS on `[data-client-studio-root]` (bridge, not a redesign) |

### 5. Media assets on foreign origins

| | |
| --- | --- |
| **Symptom** | Broken images when host ≠ Client Studio `public/` |
| **Fix** | `assetBase` on `Embed.mount` + `resolvePublicAssetUrl` / re-based house-package paths; Pages publishes `/docs/media` |

### 6. Lightbox portal host leakage

| | |
| --- | --- |
| **Symptom** | Overlay styled by host `body` rules |
| **Fix** | `SpatialLightbox` portals into `[data-client-studio-root]` when present |

---

## Surface checklist

| Surface | Parity |
| --- | --- |
| App Shell | Match |
| Sidebar (48px rail) | Match |
| Hero | Match (584px) |
| Media Explorer / House Navigator | Match (media requires host assets or `assetBase`) |
| Priority | Match |
| Decision Terminal | Match |
| AI Advisor | Match |
| Lead Capture | Match |

**Intentional differences**

- Embed injects styles into `document.head` (Tailwind Preflight is global). Hostile host CSS loaded *after* mount can still override; remount re-appends Embed styles.
- Full `/house-package` catalog (~147 MB) is not published to GitHub Pages; Hero exterior via `/media` is. Room gallery on Pages needs a host that serves the catalog or a future CDN.

---

## Production snippet (parity)

```html
<div id="embed"></div>
<script src="https://radimventus.github.io/embed-engine/embed/embed.iife.js"></script>
<script>
  Embed.mount({
    target: "#embed",
    objectId: "house-modern-01",
    assetBase: "https://radimventus.github.io/embed-engine",
  });
</script>
```

Omit `assetBase` when the host already serves `/media` and `/house-package` at its origin (e.g. local demo with Client Studio `publicDir`).

**Host constraint:** do not wrap `#embed` in a max-width &lt; 1432px if desktop canvas parity is required (or allow horizontal overflow).

---

## Local verification

```bash
pnpm --filter @embed-engine/client-studio dev   # http://127.0.0.1:4173/
pnpm --filter @embed-engine/embed demo          # http://localhost:5180/
```
