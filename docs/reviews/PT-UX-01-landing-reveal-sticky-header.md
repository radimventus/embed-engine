# PT-UX-01 — Landing Reveal Animation & Unified Sticky Header

**Status:** COMPLETE  
**Date:** 2026-07-23  
**Size:** S (UX polish — no Runtime / API / architecture change)

---

## Summary

Launcher Experience no longer jumps mid-page on open. It starts at Hero under a single sticky header, then smooth-scrolls (~500 ms) so Social Proof sits flush under that header. The standalone Close bar is removed; Close is a circular × in the sticky header.

---

## Part 1 — Landing Reveal

| Before | After |
| --- | --- |
| Instant `behavior: "auto"` settle to Social Proof | Open at scroll top (Hero) → smooth ~500 ms scroll |
| Felt like a mid-page teleport | Feels like the Experience opens from its start and guides the user |

**Implementation (presentation only):**

- `settleViewportToElement` starts at top, waits one paint, then eases scroll
- Landing Anchor offset uses `[data-experience-header]` height
- Reveal state machine unchanged (`waiting-ready` → `resolving-anchor` → `revealing` → `active`)
- Landing Anchor Resolver unchanged

---

## Part 2 — Unified Sticky Header

| Before | After |
| --- | --- |
| Delivery Close Bar + Client Studio header (two layers) | One sticky Experience header |
| Text “Zavřít Client Studio” above content | Circular × in header actions |

Header contents: logo · object id · Zavolat / Uložit · × (overlay only).

Close still owned by Delivery: click delegation on `[data-embed-close]` inside `[data-embed-overlay]`.

---

## Validation (2026-07-23)

Scenario: CTA → fullscreen → sticky header + Hero → smooth reveal → Social Proof under header → scroll → × Close → host restored.

| Check | Result |
| --- | --- |
| No `[data-embed-overlay-chrome]` | Pass |
| `[data-experience-header]` + `[data-embed-close]` | Pass |
| Early reveal state | `revealing`, scroll leaving top |
| Landed `landingId` | `social-proof` |
| Gap (proof top − header bottom) | **0 px** |
| Console errors | None |

### Evidence

- `docs/reviews/assets/pt-ux-01-01-host-cta.png`
- `docs/reviews/assets/pt-ux-01-02-open-hero.png`
- `docs/reviews/assets/pt-ux-01-03-landing-social-proof.png`
- `docs/reviews/assets/pt-ux-01-04-scroll-sticky-header.png`
- `docs/reviews/assets/pt-ux-01-05-host-restored.png`
- `docs/reviews/assets/pt-ux-01-landing-reveal.webm` (and `.gif` when generated)

---

## Constraints respected

- Runtime unchanged
- Landing Anchor Resolver unchanged
- Reveal pipeline states / public Embed API unchanged
- No new mount configuration parameters
- Close lifecycle (unmount + host restore) unchanged
