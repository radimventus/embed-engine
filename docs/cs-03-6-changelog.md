# CS-03.6 Changelog — Spatial Terminal Geometry Polish

## Summary

Production geometry polish for the Spatial Terminal. Visual hierarchy and component refinement only — no functionality, state machine, or layout proportion changes.

## Navigation Spine (`RoomPanel`)

- Removed table-style borders and placeholder background
- Vertical rhythm with spaced list items and left accent bar for active room
- Active: Embed Navy text + neutral-50 background
- Inactive: muted tertiary text with subtle hover

## Decision Canvas (`FloorPlan`)

- White architectural surface with light neutral border
- Reduced stroke weight (0.75 inactive / 1.25 active)
- Inactive rooms: `#E5E5E5`; active room: Embed Navy
- Compass placeholder reduced in visual weight

## Thumbnail Rail

- Rounded corners (`rounded-lg`)
- Consistent `border-2` sizing and neutral inactive borders
- `items-stretch` alignment for equal slot height
- Refined video thumbnail overlay (navy icon, lighter scrim)

## Floor Selector

- Demoted to secondary text navigation: `Přízemí / Patro`
- Removed dominant bordered buttons and info-blue fill
- Small caps rhythm (`text-xs`), muted inactive state

## Supporting refinements

- `MediaModeToggle` — compact segmented control aligned with spine
- Floor plan section header — softer weight, sentence case

## Unchanged

- Walkthrough state machine and media navigation behavior
- House Package and asset loading
- Transition Language (125 ms)
- Grid proportions (`50% / 15% / 35%`)

## Deliverables

| File | Description |
|------|-------------|
| `docs/cs-03-6-spatial-terminal-1600x900.png` | After screenshot |
| `docs/cs-03-6-spatial-terminal-comparison.png` | Side-by-side CS-03.5 vs CS-03.6 |
| `docs/cs-03-6-property-explorer-after.png` | Property Explorer crop |
