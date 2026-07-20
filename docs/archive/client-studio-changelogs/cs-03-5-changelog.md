# CS-03.5 Changelog — Media Navigation

## Summary

Completed media browsing inside the Spatial Terminal. After room selection, users can explore that room's media collection via the thumbnail rail and VIDEO/FOTKY toggle.

## Added

- `SELECT_MEDIA_INDEX` and `SET_MEDIA_MODE` walkthrough actions
- `HousePackageMediaItem` — ordered media list from manifest (video, hero, gallery)
- `getVisibleMediaWindow()` — keeps active thumbnail visible within the 4-slot rail
- Thumbnail click handlers with active highlight (`border-embed-brand-navy`)

## Changed

- **ThumbnailRail** — real thumbnails from House Package, clickable, active state
- **MediaModeToggle** — VIDEO/FOTKY switches media mode and MainMedia content
- **MainMedia** — room video when VIDEO selected; crossfade via existing Decision Transition
- **WalkthroughProvider** — exposes `roomMediaItems`, `activeMediaIndex`, `selectMediaIndex`, `setMediaMode`

## Media flow

```
Room selection → media collection opens (hero)
Click thumbnail → active highlight + MainMedia crossfade
VIDEO toggle → room video (index 0)
FOTKY toggle → first photo (index 1)
```

## Unchanged

- House Package structure and manifest
- Room selection, Decision Canvas, Room List independence
- Transition Language (125 ms fade out → swap → fade in)
- Thumbnail rail geometry (4-column grid)

## Replacing media

Media order comes from manifest: `video`, `hero`, `gallery[]`. No hardcoded indices in components.
