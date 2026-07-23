# PT-INT-01 — Partner Embed Integration Validation

Date: 2026-07-23

## Verdict

**Root cause: partner host still uses the legacy launcher button snippet.**

Embed Hero (PT-EMBED-01) only mounts when the partner page provides:

1. `<div id="embed-hero"></div>`
2. `Embed.mount({ mode: "launcher", target: "#embed-hero", … })`
3. Script URL with cache-bust `?v=embed-01` (or newer)

A page that only has `#open-client-studio` + `launcher: "#open-client-studio"` will load the **latest IIFE** and still show **no Embed Hero** — by design. The button arms open/close; it does not project the Hero card.

This is an **integration / snippet** issue, not a regression in Hero implementation. `docs/embed/live.html` and GitHub Pages are correct.

## Checks

### 1. Snippet (decisive)

| Variant | DOM | Mount options | Embed Hero |
|--------|-----|---------------|------------|
| **Legacy (typical partner)** | `#open-client-studio` button | `launcher: "#open-client-studio"` | **Absent** |
| **Required (PT-EMBED-01)** | `#embed-hero` empty host | `target: "#embed-hero"`, `mode: "launcher"` | **Present** |

Reproduced locally with the same `embed.iife.js?v=embed-01`:

- Old snippet → `hasEmbedHero: false`
- New snippet → `hasEmbedHero: true`, reference H1 + CTA

### 2. Script URL / cache

| Layer | Finding |
|------|---------|
| GitHub Pages IIFE | Serves current bundle; `live.html` uses `?v=embed-01` |
| Partner must bump `?v=` | Stale `?v=hero-00a` / `ux-01f` / bare URL keeps old behavior **and** may miss Embed Hero API path if very old |
| Cloudflare on `dse.onrender.com` | `cf-cache-status: HIT`, `s-maxage=300` — host HTML is cached; snippet updates need purge/hard refresh after deploy |

### 3. Runtime mode

Required: `mode: "launcher"` **and** `target: "#embed-hero"`.

If `mode` is omitted and only `target` is set, mount resolves to **inline** (full Studio into the slot) — not Embed Hero. Always set `mode: "launcher"` explicitly on partner pages.

### 4. DOM

Required mount point:

```html
<div id="embed-hero"></div>
```

Must not be replaced by another id, and must exist **before** `Embed.mount` runs.

### 5. Host `dse.onrender.com`

Fetched 2026-07-23:

- Returns a **parked / placeholder** HTML shell (Aliyun script), **no** `embed.iife.js`, **no** `#embed-hero`
- Cloudflare cache HIT; `last-modified: Sat, 12 Apr 2025`
- This host currently does **not** run the Embed integration at all

If DSE production is a different URL (WordPress origin, custom domain), apply the snippet there. If Render was the intended host, the service content needs to be restored and the new snippet deployed.

## Required partner snippet

Canonical copy-paste: [`docs/embed/partner-snippet.html`](../embed/partner-snippet.html)

```html
<div id="embed-hero"></div>
<script src="https://radimventus.github.io/embed-engine/embed/embed.iife.js?v=embed-01"></script>
<script>
  Embed.mount({
    mode: "launcher",
    target: "#embed-hero",
    objectId: "house-modern-01",
    assetBase: "https://radimventus.github.io/embed-engine",
    entryPoint: "hero-cta",
    launcherId: "embed-hero",
  });
</script>
```

## Partner activation checklist

1. Replace legacy button snippet with the block above (Custom HTML / theme partial).
2. Remove obsolete `#open-client-studio` unless intentionally kept as a **second** entry (optional `launcher:` in addition to `target:`).
3. Confirm Network tab loads `embed.iife.js?v=embed-01` (200).
4. Confirm DOM contains `#embed-hero` and `[data-embed-hero]` after load.
5. Purge Cloudflare / WP cache / hard refresh.
6. Click CTA → Client Studio overlay opens; Close restores host.

## Confirmation

| Surface | Status |
|---------|--------|
| Reference `docs/embed/live.html` | PASS — Embed Hero |
| GitHub Pages live | PASS — Embed Hero |
| Partner with legacy button snippet | FAIL — no Hero projection (expected until snippet update) |
| `dse.onrender.com` (current fetch) | FAIL — no Embed script present |

**No Embed Engine code change required for Hero.** Partner must deploy the new snippet. Optional follow-up: restore/fix DSE Render host content if that URL is still the production target.
