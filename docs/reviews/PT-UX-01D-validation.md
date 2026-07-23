# PT-UX-01D Validation

Date: 2026-07-23

## Change
- Close × optical alignment: `translate(-2px, 2px)` (left + down) to correct slight top-right bias.
- Circle Ø, × size/weight, colors, hit target, and button position unchanged.

## Measurements (1600×900)

| Check | Result | Status |
|------|--------|--------|
| Visual circle Ø | 32px | PASS |
| Hit target Ø | 44px | PASS |
| × font-size / weight | 32px / 700 | PASS |
| Optical translate | -2px 2px | PASS |
| Center offset Δx / Δy | -2px / 2px (~−2 / +2) | PASS |

## Artifacts
- `docs/reviews/assets/pt-ux-01d-close.png`
- `docs/reviews/assets/pt-ux-01d-header.png`

## Notes
- Cache-bust: `?v=ux-01d`
- Header layout / Design Tokens unchanged.
