# CS-03.8 Changelog — Spatial Terminal Production Fixes

## Summary

Final production fixes for Spatial Terminal v1. Visual and layout corrections only — no architecture, state machine, or House Package changes.

## Chapter Transition

- Added visible 30 px band (`bg-embed-background-secondary`) between Opening and Property Explorer
- Matches outer workspace canvas grey — clearly separates chapters without looking like empty margin
- Removed merged `mb-[30px]` from Hero section

## Video Reload

- Video element remounts on VIDEO mode entry via stable `videoKey`
- Playback resets: `pause()`, `currentTime = 0`, `load()` — poster shows immediately
- Play button visible whenever video is paused in VIDEO mode (intro and room context)
- Room video plays via local `video.play()` without state machine changes
- Removed room-video autoplay that prevented reliable reload

## Floor Selector

- Restored segmented control: `PŘÍZEMÍ` / `PATRO`
- Design system colors: active Embed Navy fill, inactive white with hover
- Typography: `text-sm font-medium tracking-wide`, `py-3`

## Thumbnail Rail Navigation

- Left/right chevrons when overflow exists
- Semi-transparent (`bg-embed-white/75`), vertically centered, positioned outside rail (`-left-2` / `-right-2`)
- Scrolls exactly one viewport group (4 thumbnails) per click

## Thumbnail Geometry

- Aspect ratio changed from 1:1 to **16:9** (`aspect-video`)
- Reduced height, increased visible width per thumb
- Rail height anchored by invisible 4-column sizing grid

## Spatial Alignment

- Shared `SPATIAL_TERMINAL_HEADER_CLASS` across all three columns
- Unified `gap-section` grid spacing; removed extra `mt-section` offsets
- Navigation Spine uses `justify-start` — top-aligned with Main Media and Decision Canvas
- MediaExplorer uses `content-start` to prevent stretched auto-rows from offsetting Main Media

## Deliverables

| File | Description |
|------|-------------|
| `docs/cs-03-8-spatial-terminal-1600x900.png` | Production screenshot |
| `docs/cs-03-8-thumbnail-overflow-1600x900.png` | Overflow rail with chevrons |
| `docs/cs-03-8-spatial-terminal-comparison.png` | CS-03.7 vs CS-03.8 |
