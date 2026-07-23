# PT-UX-01C Validation

Date: 2026-07-23

## Changes

- Reveal duration: 750ms → **1125ms** (`LANDING_REVEAL_DURATION_MS`)
- Close visual circle: 40px → **32px** (`h-8`); hit target **44px** (`h-11`)
- × size/weight unchanged: **32px / bold**
- × optically centered (CSS grid + slight upward translate)

## Measurements (local Pages bundle, 1600×900)

| Check | Result | Status |
|------|--------|--------|
| Reveal duration (revealing→active) | **1153 ms** (target ~1125) | PASS |
| Open → done | 1266 ms | info |
| Reveal end state | active | PASS |
| Visual circle Ø | 32px | PASS |
| Hit target Ø | 44px | PASS |
| × font-size / weight | 32px / 700 | PASS |
| Center Δx / Δy | 0px / −1.92px | PASS |
| Close dismisses overlay | true | PASS |

## Artifacts

- Close crop: `docs/reviews/assets/pt-ux-01c-close.png`
- Header: `docs/reviews/assets/pt-ux-01c-header.png`
- Reveal GIF: `docs/reviews/assets/pt-ux-01c-reveal.gif`

## Notes

- Cache-bust: `?v=ux-01c`
- No API / Design Token / Reveal-logic / header-layout changes beyond polish.
- Constant verified in IIFE: `zd=1125`.
