# CS-03.9 Changelog — Spatial Terminal Final Production Polish

## Summary

Closes Spatial Terminal v1. Final production polish only — no architecture, state machine, or House Package changes.

## HTML5 Video Controls

- Native `<video controls>` enabled after first playback (`hasStartedPlayback`)
- READY: poster + centered Play overlay; no native controls
- PLAYING: native play/pause, seek, volume, fullscreen
- Player resets on VIDEO → PHOTO, source change, and walkthrough mode change (`mode`, `mediaMode`, `videoSrc`)

## Floor Selector

- Shared segmented-control tokens with VIDEO/FOTKY (`spatial-terminal-layout.ts`)
- Identical shell, padding (`py-2`), radius, typography; `w-full` in each column

## Spatial Terminal Height

- Removed `min-h-property-explorer` (44 rem)
- Content-sized columns with `items-start` — no stretch whitespace
- Compact chapter height driven by media, navigation, and decision canvas content

## Optical Grid Audit

- Unified `SPATIAL_TERMINAL_SECTION_CLASS` (24 px padding, 24 px gap) across terminal columns
- Shared `CHAPTER_HEADER_CLASS` / `SPATIAL_TERMINAL_HEADER_CLASS` (24 px header band)
- Opening → 30 px grey transition → Spatial Terminal → Priority Engine (`py-section`) as three chapters
- Top alignment verified: Main Media, Navigation Spine, Decision Canvas within 1 px

## Deliverables

| File | Description |
|------|-------------|
| `docs/cs-03-9-spatial-terminal-1600x900.png` | Final screenshot |
| `docs/cs-03-9-spatial-terminal-comparison.png` | CS-03.8 vs CS-03.9 |
| `docs/cs-03-9-changelog.md` | This changelog |
