# CS-03.9B Changelog — Final Geometry Fix

## Summary

Restores approved Spatial Terminal production geometry after CS-03.9A regression. No behavior, state machine, House Package, or proportion changes.

## Floor Selector Position

- Moved from bottom attachment to top of Decision Canvas container
- Top edge of PŘÍZEMÍ / PATRO aligns with top edge of floor plan border box (0 px delta verified)
- Fixed width `9.5rem`, centered on canvas — matches VIDEO / FOTOKY shell

## Floor Selector State

- PŘÍZEMÍ: active (`aria-pressed={true}`, navy segment)
- PATRO: disabled (`disabled`, muted segment) — second floor not yet implemented
- Shared segmented-control tokens with MediaModeToggle

## Decision Canvas Title

- `Interaktivní půdorys` spans the Decision Canvas chapter via `DECISION_CANVAS_CHAPTER_TITLE_CLASS`
- Title extends across room navigation + floor plan optical grid; text aligns with Room Navigation content left edge
- Title belongs to the full right section, not only the SVG block

## Unchanged

- Spatial Terminal proportions (50 / 15 / 35)
- Walkthrough state machine, House Package, Transition Language
- Media, Navigation Spine, Decision Canvas SVG geometry

## Deliverables

| File | Description |
|------|-------------|
| `docs/cs-03-9b-spatial-terminal-1600x900.png` | Final screenshot |
| `docs/cs-03-9b-changelog.md` | This changelog |
