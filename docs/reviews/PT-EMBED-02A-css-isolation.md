# PT-EMBED-02A — CSS Isolation Hardening

Date: 2026-07-23

## Verdict

Delivery Layer now isolates Embed Experience from partner global CSS. CTA identity (white on navy, no underline) holds under Bootstrap, Tailwind-like host rules, Elementor, WordPress, and an aggressive reset — matching the clean-host baseline.

Policy: [CSS-Isolation-Policy.md](../architecture/CSS-Isolation-Policy.md)

---

## 1. Collisions found (audit)

| Collision | Host pattern | Symptom |
|-----------|--------------|---------|
| CTA / links | `a`, `a:visited`, `a:hover` with `color` / `text-decoration` / `!important` | CTA text/color rewritten (production partner report) |
| CTA background | theme `a { background }` / Elementor button rules | CTA loses navy fill |
| Typography inheritance | `body` / `html` font, line-height, letter-spacing | Experience inherits partner type |
| Buttons | `button { all: unset }` / WP `.wp-block-button__link` | Header / Close drift |
| Box model | global `* { box-sizing: content-box }` | Layout shift |
| Form controls | host `input` / `select` appearance | Future forms inherit host chrome |
| Specificity trap | Isolation `a:link` / `a:visited` **above** `[data-embed-hero-cta]` | Internal reclaim stripped CTA (caught in validation) |
| Utility weakness | Tailwind classes without `!important` + boundary specificity | Lose to WP/Elementor `a { … !important }` |
| Embed Hero outside shell | Hero lacked `[data-client-studio-root]` | Soft shell reclaim missed partner Hero |

Hero / Client Studio / Runtime feature code were not the root cause — **light-DOM global CSS injection without a Delivery boundary** was.

---

## 2. Fixes (Delivery only)

| Change | File(s) |
|--------|---------|
| CSS Isolation Policy module + CTA/Close hooks | `packages/embed/src/delivery/cssIsolation.ts` |
| Inject `#embed-css-isolation` last | `packages/embed/src/delivery/ensureStyles.ts` |
| Mark `data-embed-boundary` on Hero, overlay, Studio root | `mountEmbedHero.ts`, `overlaySurface.ts`, `mountClientStudio.tsx` |
| Tailwind `important: true` | `packages/embed/tailwind.config.js` |
| PostCSS wrap class utilities under `[data-embed-boundary]` | `postcss-embed-boundary-utilities.js`, `postcss.config.js` |
| Include `packages/embed/src` in Tailwind content | `tailwind.config.js` |
| Cache-bust `?v=embed-02a` | `sync-pages.mjs` → official snippet |
| Unit tests | `cssIsolation.test.ts`, overlay boundary assert |

Appearance tokens unchanged (still navy `#001930` / white CTA, Inter, 8px radius, md padding).

---

## 3. Validation

Hostile host pages (local IIFE `?v=embed-02a`):

| Host simulation | CTA color | CTA bg | Decoration | Identity vs clean | Console |
|-----------------|-----------|--------|------------|-------------------|---------|
| Clean HTML | `rgb(255,255,255)` | `rgb(0,25,48)` | none | — | clean |
| Bootstrap-like | same | same | none | match | clean |
| Tailwind-like | same | same | none | match | clean |
| Elementor-like | same | same | none | match | clean |
| WordPress default-like | same | same | none | match | clean |
| Aggressive CSS reset | same | same | none | match | clean |

Screenshots: `docs/reviews/assets/pt-embed-02a-{clean,bootstrap,tailwind-host,elementor,wordpress,aggressive-reset}.png`

Also confirmed: Social Proof present, H1 color `rgb(0,25,48)`, boundary attribute set, isolation stylesheet resolves `[data-embed-boundary] a[data-embed-hero-cta]`.

---

## 4. Constraints check

| Constraint | Status |
|------------|--------|
| Do not change Experience look | Pass (tokens preserved) |
| Do not patch individual components | Pass (Delivery isolation + hooks) |
| Harden whole Experience | Pass (boundary on Hero + overlay + Studio) |
