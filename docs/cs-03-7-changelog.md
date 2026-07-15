# CS-03.7 Changelog — Spatial Terminal Bug Fixes

## Summary

Fixed layout and navigation defects in the Spatial Terminal without changing behavior, state machine, or House Package.

## Thumbnail Rail

- Replaced sliding window with horizontal scroll when media count exceeds visible slots
- All manifest media items are reachable (mouse wheel, trackpad, touch swipe)
- Active thumbnail auto-scrolls into view on selection change
- Thumbnail size unchanged via invisible 4-column sizing grid
- Active navy border highlight preserved

## Decision Canvas

- Floor plan constrained with `max-w-full`, `max-h-full`, and `preserveAspectRatio="xMidYMid meet"`
- SVG and overlay images share the same viewBox — pixel alignment preserved
- Floor plan row uses `minmax(0, 1fr)` to prevent panel overflow

## Responsive Safety

- Added `min-w-0` and `overflow-x-hidden` across Property Explorer columns
- MainMedia, Navigation Spine, and Decision Canvas constrained to parent width
- No horizontal page scrollbar

## Removed

- `media-window.ts` sliding window (replaced by scroll + `useThumbnailRailScroll.ts`)

## Unchanged

- Walkthrough state machine and media selection behavior
- House Package manifest and asset paths
- Transition Language (125 ms)
- Thumbnail dimensions and visual styling from CS-03.6

## Deliverables

| File | Description |
|------|-------------|
| `docs/cs-03-7-spatial-terminal-1600x900.png` | Fixed terminal at 1600×900 |
| `docs/cs-03-7-thumbnail-rail-overflow-1600x900.png` | 5-item rail with last thumbnail active |
