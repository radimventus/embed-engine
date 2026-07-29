# Simplified Partner Snippet — Proposal

**Status:** Proposal only (PT-EMBED-MIGRATION-01)  
**Do not implement in this ticket.**

## Goal

Partner paste must never require:

- `assetBase`
- Runtime / IIFE origin knowledge beyond one script URL
- Internal Delivery / fingerprint / object wiring

## Current (migration) snippet

```html
<div id="embed-hero"></div>
<script src="https://conis.cz/embed/embed.iife.js?v=embed-01"></script>
<script>
  Embed.mount({
    mode: "launcher",
    target: "#embed-hero",
    objectId: "house-modern-01",
    assetBase: "https://conis.cz",
    entryPoint: "hero-cta",
    launcherId: "embed-hero"
  });
</script>
```

Partners can (and did) set a wrong `assetBase`. That is the failure mode this migration fixes operationally.

## Target snippet (minimal)

```html
<div id="embed-hero"></div>
<script
  src="https://conis.cz/embed/embed.iife.js?v=embed-01"
  data-embed-mount
  data-target="#embed-hero"
  data-object-id="house-modern-01"
></script>
```

Or even smaller:

```html
<div id="embed-hero" data-embed="house-modern-01"></div>
<script src="https://conis.cz/embed/embed.iife.js?v=embed-01"></script>
```

IIFE auto-discovers `[data-embed]` / `#embed-hero` and mounts with defaults.

## Where configuration lives

| Concern | Owner | Source |
| --- | --- | --- |
| IIFE URL | Publish / CDN | Always `https://conis.cz/embed/embed.iife.js` |
| `assetBase` | Delivery Layer default | Hard default `https://conis.cz` inside IIFE when host omits `assetBase` |
| `objectId` | Partner attribute or central registry | `data-object-id` / `data-embed`, optional later: `GET https://conis.cz/embed/partner-config.json?host=…` |
| Launcher mode / entryPoint | Delivery defaults | `mode: "launcher"`, `entryPoint: "hero-cta"` unless overridden |
| Cache bust | Publish pipeline | `?v=` from `version.json` / `EMBED_PARTNER_CACHE_BUST` |

### Concrete implementation sketch (future)

1. **`packages/embed/src/mount.ts`**  
   If `options.assetBase` is undefined, set `assetBase = "https://conis.cz"` (or read `Embed.build.assetOrigin` baked at publish time from `PAGES_ORIGIN`).

2. **Bake at publish** (`sync-pages` / Vite define)  
   `const EMBED_DEFAULT_ASSET_BASE = "https://conis.cz"` into IIFE so partners cannot drift from the distribution origin.

3. **Optional auto-mount**  
   On `DOMContentLoaded`, if `document.querySelector("[data-embed], #embed-hero")` exists and no explicit `Embed.mount` ran, call mount with defaults.

4. **Optional central config** (only if multi-tenant defaults diverge)  
   `GET https://conis.cz/embed/config.json` → `{ assetBase, objectId?, aiDeliveryUrl? }` keyed by `location.hostname`. Keep Runtime free of HTTP; Delivery Layer fetches before mount.

## Non-goals

- No Runtime business-logic change
- No Local-first UX
- No requirement that partners host `/house-package`

## Acceptance for a future ticket

- Official docs show only the minimal snippet
- Omitting `assetBase` still loads `https://conis.cz/house-package/*`
- Wrong github.io `assetBase` is rejected or rewritten with a console warning in Delivery (optional guard)
