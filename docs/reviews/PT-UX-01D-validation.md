# PT-UX-01D Validation

Date: 2026-07-23

## Change

- Close × optical alignment: `translate(0, 2px)` — 2px downward optical nudge.
- Circle Ø, × size/weight, colors, hit target, and button position unchanged.

## Measurements (1600×900)

| Check | Result | Status |
|------|--------|--------|
| Visual circle Ø | 32px | PASS |
| Hit target Ø | 44px | PASS |
| × font-size / weight | 32px / 700 | PASS |
| Optical translate | `0px 2px` | PASS |
| Box-center offset Δx / Δy | 0px / 2px | PASS |
| Ink-mass vs circle (pixel) | Δx +0.04 / Δy +0.86 | PASS (optically balanced) |

## Artifacts

- `docs/reviews/assets/pt-ux-01d-close.png`
- `docs/reviews/assets/pt-ux-01d-header.png`

## Notes

- Cache-bust: `?v=ux-01d`
- Header layout / Design Tokens unchanged.
- Confirmed: size and appearance otherwise identical to PT-UX-01C; only × position shifted by 2px.
