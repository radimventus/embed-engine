# Embed Migration Checklist

**Ticket:** PT-EMBED-MIGRATION-01  
**Canonical origin:** `https://conis.cz`  
**Forbidden in production installs:** `https://radimventus.github.io`

Use this checklist when cutting partners over from the legacy GitHub Pages hostname to the custom domain.

---

## 1. Repo

- [ ] `packages/embed/scripts/sync-pages.mjs` → `PAGES_ORIGIN = "https://conis.cz"`
- [ ] `packages/embed/scripts/publish-release.mjs` / `validate-pages.mjs` use `https://conis.cz`
- [ ] `docs/embed/OFFICIAL-PARTNER-SNIPPET.html` uses only `conis.cz` (script + `assetBase`)
- [ ] `docs/embed/{partner-snippet,live,index}.html` use only `conis.cz`
- [ ] No production code under `apps/`, `packages/embed/scripts/`, or `docs/embed/` references `radimventus.github.io` as a load URL
- [ ] AI Delivery Edge default CORS includes `https://conis.cz` (and `https://www.conis.cz`)
- [ ] Grep gate:

```bash
rg -n 'radimventus\.github\.io' apps packages/embed/scripts docs/embed \
  packages/ai-delivery-edge/src --glob '!**/node_modules/**'
# Expect: only explanatory comments (no URL used as script/assetBase), or zero hits
```

---

## 2. Release

- [ ] `pnpm embed:publish` (or `deploy:pages`) completes
- [ ] `docs/embed/version.json` fingerprint matches local IIFE
- [ ] Commit release snapshot + migration docs
- [ ] Push to the branch that publishes GitHub Pages `/docs`

---

## 3. CDN / public host

- [ ] `curl -sI https://conis.cz/embed/embed.iife.js` → **200**
- [ ] `curl -sI https://conis.cz/house-package/gallery.csv` → **200** + CORS `Access-Control-Allow-Origin: *` (or partner allowlist)
- [ ] `curl -sI https://radimventus.github.io/embed-engine/house-package/gallery.csv` → **301** to `https://conis.cz/...` (legacy alias only — must not be used by partners)
- [ ] `https://conis.cz/embed/version.json` matches the released fingerprint

---

## 4. CMS (partner host)

For each production install (starting with DSE `https://www.domysenergii.cz/embed`):

- [ ] Open BaseKit / CMS embed widget HTML
- [ ] Replace entire snippet with [`OFFICIAL-PARTNER-SNIPPET.html`](../embed/OFFICIAL-PARTNER-SNIPPET.html)
- [ ] Confirm `script src` is `https://conis.cz/embed/embed.iife.js?v=embed-01` (or current approved `?v=`)
- [ ] Confirm `assetBase: "https://conis.cz"` — **never** `radimventus.github.io`
- [ ] Publish / save the CMS page

### DSE paste (copy-paste)

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

---

## 5. Cache

- [ ] Hard-refresh partner page (or purge CDN/CMS cache if present)
- [ ] Confirm Network panel shows IIFE from `conis.cz` (not a long-lived github.io cache)
- [ ] If IIFE updates later, bump `?v=` (or set `EMBED_PARTNER_CACHE_BUST` on publish) and re-paste CMS

---

## 6. Partner verification

On `https://www.domysenergii.cz/embed` (and any other partner):

- [ ] Page loads Embed Hero without console error `Builder House Package bootstrap failed`
- [ ] Network: all `/house-package/*` requests go to `https://conis.cz/house-package/*`
- [ ] Network: **zero** requests to `radimventus.github.io`
- [ ] Network: IIFE from `https://conis.cz/embed/embed.iife.js`

---

## 7. Runtime verification

- [ ] Console: `Embed Runtime` / `Build:` / `Runtime:` / `Built:`
- [ ] Hero CTA opens Experience
- [ ] Gallery / rooms / videos CSV load (200)
- [ ] Optional: AI Delivery chat works from partner origin (CORS allowlist includes partner if required)

---

## 8. Rollback

If conis.cz is unavailable:

1. **Do not** revert partners to `radimventus.github.io` for `assetBase` (CORS failure on CSV redirect).
2. Prefer fixing conis.cz / Pages custom domain DNS.
3. Emergency only: serve assets from a same-origin path on the partner host and set `assetBase` to that origin — never github.io.
4. Repo rollback: restore previous `docs/embed` commit; keep `PAGES_ORIGIN` on `https://conis.cz`.

---

## Simplified snippet (future)

Partners should eventually paste only a mount target + one script tag, with `assetBase` resolved inside Delivery. Formal CAP: [CAP-INFRA-01](./CAP-INFRA-01-centralized-embed-configuration.md) (post-pilot). Detail sketch: [Simplified Partner Snippet Proposal](./embed-simplified-partner-snippet-proposal.md). **Not implemented in this migration.**
