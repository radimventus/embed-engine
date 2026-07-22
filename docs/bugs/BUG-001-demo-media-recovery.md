# BUG-001 — Demo Media Recovery

| Field | Value |
| --- | --- |
| **Type** | Product Stabilization (bug-fix stream) |
| **Status** | **FIXED** |
| **Date** | 2026-07-22 |
| **Surfaces** | Hero Experience · Spatial Terminal |
| **Source** | [PR-001](../reviews/PR-001-decision-journey-mvp.md) C2 |

---

## Root causes

1. **Hero exterior missing** — `REFERENCE_HOUSE_PACKAGE` pointed at `/media/house-modern-01/exterior.jpg`, which did not exist under `public/` (SPA HTML fallback → broken `<img>`).
2. **Spatial photo mode on video URL** — thumbnails often place video first; photo mode used index `0` with `<img src="…/video.mp4">`.
3. **Floor-plan overlay opacity** — `living-room.svg` painted a full white rect over the plan.

## Fixes

| Area | Change |
| --- | --- |
| Assets | Added `public/media/house-modern-01/exterior.webp` + `floorplan.png` |
| Package URL | `reference-house-package.ts` → `.webp` / `.png` paths |
| Walkthrough | Photo mode selects first `kind === 'photo'` thumbnail |
| MainMedia | Guard: never render video item as photo `<img>` |
| HeroImage | Czech fallback surface on media `onError` |
| Floor overlay | Removed opaque white fill from `living-room.svg` |

## Verification

| Check | Result |
| --- | --- |
| `/media/house-modern-01/exterior.webp` | HTTP 200 · `image/webp` · Hero `naturalWidth` 3450 |
| Spatial main media (photo mode) | Loads `…/living-room/01.jpg` (not mp4) |
| Room thumbnails / navigation | Intact |
| Hero screenshot | [assets/bug-001-hero.png](./assets/bug-001-hero.png) |
| Spatial screenshot | [assets/bug-001-spatial.png](./assets/bug-001-spatial.png) |

## Out of scope

- Runtime API changes
- reference-house `pudorys.webp` rename hygiene (separate; Spatial uses `public/house-package`)
