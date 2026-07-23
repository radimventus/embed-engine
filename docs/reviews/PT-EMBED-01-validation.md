# PT-EMBED-01 Validation

Date: 2026-07-23

## Goal

Project the Reference Hero onto the partner page as the first Experience scene (Embed Hero). CTA continues into Client Studio.

## Implementation

- Delivery-owned Embed Hero in `packages/embed/src/launcher/embedHero/`
- Launcher Mode: `target: "#embed-hero"` mounts the projection; CTA opens existing overlay + Reveal
- Client Studio / Reference Hero sources unchanged
- Cache-bust: `?v=embed-01`

## Parity (1600×900)

| Check | Reference 5176 | Embed Hero (live.html) |
|------|----------------|-------------------------|
| Title | Rodinný dům, kde to dýchá štěstím | identical |
| CTA | Podívat se dovnitř – video → | identical |
| Content ratio | 0.333 | 0.333 |
| Photo veil | present | present |
| Social Proof | present | present |

## Transition

CTA → fullscreen Client Studio overlay → Reveal settle. Same visual language before and after open.

## Artifacts

- `docs/reviews/assets/pt-embed-01-reference-5176.png`
- `docs/reviews/assets/pt-embed-01-embed-hero.png`
- `docs/reviews/assets/pt-embed-01-studio-after-cta.png`
- `docs/reviews/assets/pt-embed-01-transition.gif`

## Partner usage

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
  });
</script>
```
