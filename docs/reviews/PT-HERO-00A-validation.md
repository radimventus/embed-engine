# PT-HERO-00A Validation

Date: 2026-07-23

## Fixes

1. **Layout** — removed `tablet:grid-cols-[1fr_1.4fr]` so desktop stays **1/3 · 2/3** (`contentRatio 0.333` / `imageRatio 0.666`).
2. **Card radius** — `SocialProof` is nested inside the Hero `SECTION_SURFACE_CLASS` card (`overflow-hidden rounded-[11px]`), matching Morning Baseline.
3. **Close** — same Client Studio header implementation republished under **`?v=hero-00a`** so Pages and partner share one IIFE (hit 44 / visual 32 / `translate(1px, -1px)`).

## Measurements (1600×900)

| Check | 5176 reference | Local Pages | Status |
|------|----------------|-------------|--------|
| Content width ratio | 0.333 | 0.333 | PASS |
| Image width ratio | 0.666 | 0.666 | PASS |
| Hero border-radius | 11px | 11px | PASS |
| Social Proof in Hero card | yes (baseline structure) | yes (`#social-proof` inside `#hero`) | PASS |
| Close (embed only) | n/a | 44 / 32 / `1px -1px` | PASS |

## Cache-bust

Partner + Pages must load:

`embed.iife.js?v=hero-00a`

## Artifacts

- `docs/reviews/assets/pt-hero-00a-5176.png`
- `docs/reviews/assets/pt-hero-00a-local-pages.png`
- `docs/reviews/assets/pt-hero-00a-local-pages-close.png`
