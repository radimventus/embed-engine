# PT-TOUR-VERIFY-01 — Audit

Date: 2026-07-23  
Scope: Verify PT-TOUR-REDESIGN-01 claim (`7bdbd12`) vs git, Pages, and DSE  
Method: read-only (no code changes, no new implementation)

---

## Status

**FAIL**

Source implementation of PT-TOUR-REDESIGN-01 **is present** in git commit `7bdbd12` on `feature/cap-p04-founding-partner`.

The Tour redesign is **not present** in the production Embed distribution (`docs/embed/embed.iife.js` / GitHub Pages) and **cannot appear on DSE** (host has no Embed at all).

Visual inspection of DSE / published Experience correctly sees **no** Tour redesign. That does **not** mean the commit is missing from git.

---

## Commit

| Field | Value |
|-------|--------|
| Hash (short) | `7bdbd12` |
| Hash (full) | `7bdbd12f94d41e6f179cba2ca3f2573f98cac20e` |
| Exists | **Yes** |
| Branch | `feature/cap-p04-founding-partner` (local HEAD + `origin/feature/cap-p04-founding-partner`) |
| Parent | `ca75ecbf27665fe408d13390c73d3601265f1dcd` (`docs(hero): freeze hero v1.0…`) |
| Subject | `feat(tour): redesign layout and interaction polish` |
| Author / date | Radim Věntus · 2026-07-23 18:28:18 +0200 |
| On remote tip | **Yes** (`origin/feature/cap-p04-founding-partner` == `7bdbd12`) |
| Reverted | **No** |

### Changed files (18)

```
M  apps/client-studio/.../ClientStudioPage.tsx
M  apps/client-studio/.../JourneySurfaceObserver.tsx
M  apps/client-studio/.../chapter-layout.ts
M  apps/client-studio/.../pilotVocabulary.ts
M  apps/client-studio/.../synchronizedExperience.ts
M  apps/client-studio/.../synchronizedExperience.test.ts
M  apps/client-studio/.../HouseNavigator/FloorPlan.tsx
M  apps/client-studio/.../HouseNavigator/FloorPlanExplorer.tsx
M  apps/client-studio/.../HouseNavigator/FloorPlanZoomControl.tsx
M  apps/client-studio/.../HouseNavigator/MediaModeToggle.tsx
M  apps/client-studio/.../HouseNavigator/RoomPanel.tsx
M  apps/client-studio/.../MediaExplorer/MainMedia.tsx
M  apps/client-studio/.../MediaExplorer/MediaExplorer.tsx
M  apps/client-studio/.../MediaExplorer/ThumbnailRail.tsx
M  apps/client-studio/.../SpatialZoomControl.tsx
M  apps/client-studio/.../spatial-terminal-layout.ts
M  apps/client-studio/.../walkthrough/WalkthroughProvider.tsx
A  docs/reviews/PT-TOUR-REDESIGN-01.md
```

**Not in commit:** `docs/embed/embed.iife.js`, `packages/embed/dist/*`, `sync:pages` artifacts, cache-bust bump.

Last commit that updated published IIFE: `9604970` (`fix(embed): harden css isolation…`, 2026-07-23 17:08).

---

## Implementation (source at `7bdbd12`)

Verified via `git show 7bdbd12:…` against PT-TOUR-REDESIGN-01 claims:

| Requirement | Verdict | Evidence |
|-------------|---------|----------|
| Remove ASTAV-M01 (`PropertyExplorer`) | ✅ implementováno | `ClientStudioPage` mounts `Hero` → `SpatialTerminal` only |
| Remove `SpatialContextPanel` from Experience | ✅ implementováno | `MediaExplorer` has title → `MainMedia` → `ThumbnailRail` only |
| Expand room menu (~+15px) | ✅ implementováno | `SPATIAL_TERMINAL_ROOM_INDEX_WIDTH_PX = 224` (was 209) |
| Room menu navy text / compact rows | ✅ implementováno | `RoomPanel`: `text-[#001930]`, `min-h-[39px]` |
| VIDEO/FOTKY redesign | ✅ implementováno | `MediaModeToggle`: white default, navy hover, beige active |
| Floor plan layout 30/20 | ✅ implementováno | `pl-[30px] pr-[20px]` on floor-plan section |
| Loupe −20px from plan right | ✅ implementováno | `LOUPE_RIGHT_INSET_PX = 20` on plan box |
| SVG sync | ✅ implementováno | Single SVG; image + overlays share viewBox / `xMidYMid meet` |
| SVG hover/active colors | ✅ implementováno | `#f5b90040` / `#f5b9007f` |
| VIDEO → FOTKY on room select | ✅ implementováno | `WalkthroughProvider` forces `photo` on `activeRoomId` change |
| Room-scoped media | ✅ implementováno | `projectRoomContext` → `getMediaRoom` / `house-package` |
| Thumbnail rail (4 slots, relevance) | ✅ implementováno | `FITTED_THUMB_WIDTH_PX` + `scrollRelevantToCenter` |

**Git working tree:** HEAD is `7bdbd12`. Source changes are visible in the repo. They are **not** visible by inspecting the tracked Pages IIFE blob (still from `9604970`).

---

## Deployment

| Check | Result |
|-------|--------|
| DSE URL probed | `https://dse.onrender.com/` |
| DSE branch / commit | **N/A** — host does not serve Embed Engine |
| DSE HTML | Parked placeholder (`sd.blitzen.site` / Aliyun script); `last-modified: Sat, 12 Apr 2025` |
| DSE contains Embed snippet / IIFE | **No** |
| DSE contains `7bdbd12` | **No** (no app build) |
| GitHub Pages IIFE | `https://radimventus.github.io/embed-engine/embed/embed.iife.js` |
| Pages IIFE build vintage | Matches pre-Tour CSS-isolation publish (`9604970`), not `7bdbd12` |
| Pages IIFE Tour redesign markers | **Absent** (`f5b90040`/`f5b9007f`/`getMediaRoom`/width 224 = 0) |
| Pages IIFE still contains legacy Tour strings | **Yes** — `Strukturovaný přehled charakteristik`, `Klíčové metriky`, `Prostorový kontext` |
| Cache | Cloudflare on DSE (`s-maxage=300`); Pages Fastly `max-age=600`. Cache is secondary — content is simply the old bundle |

### DSE status

**Not running Client Studio / Embed Tour.** Same finding as PT-INT-01: Render host is parked. Visual review on DSE cannot validate Tour redesign regardless of git.

---

## Visual Review

Interpretation: **published Experience / DSE surface** (what a partner user sees).

| Point | Published / DSE | Git source `7bdbd12` |
|-------|-----------------|----------------------|
| ASTAV-M01 removed | ❌ chybí | ✅ implementováno |
| SpatialContextPanel removed | ❌ chybí | ✅ implementováno |
| Menu width | ❌ chybí | ✅ implementováno |
| Menu colors | ❌ chybí | ✅ implementováno |
| VIDEO/FOTKY redesign | ❌ chybí | ✅ implementováno |
| Floor plan layout | ❌ chybí | ✅ implementováno |
| Loupe position | ❌ chybí | ✅ implementováno |
| SVG sync | ❌ chybí | ✅ implementováno |
| SVG hover/active | ❌ chybí | ✅ implementováno |
| VIDEO→FOTKY | ❌ chybí | ✅ implementováno |
| Room-scoped media | ❌ chybí | ✅ implementováno |
| Thumbnail layout | ❌ chybí | ✅ implementováno |

---

## Root Cause

**Dual gap — not a missing git commit.**

1. **Distribution not rebuilt**  
   `7bdbd12` changes **Client Studio source** only. Partner/Experience delivery uses **`embed.iife.js`**, which embeds Client Studio at **build** time. That IIFE was **not** rebuilt and **not** synced to `docs/embed/` in `7bdbd12`. GitHub Pages therefore still serves the CSS-isolation bundle (`9604970`), which still includes ASTAV-M01 copy (`Strukturovaný přehled…`) and Spatial Context strings (`Prostorový kontext`).

2. **DSE host has no Embed**  
   `dse.onrender.com` is a parked page with no `embed.iife.js` and no `#embed-hero`. It cannot show Tour redesign until a real partner page loads a rebuilt IIFE (or local Client Studio is used).

The PT-TOUR-REDESIGN-01 report is accurate about **source** completion and incorrect/incomplete if read as **“visible on DSE / production Embed Experience.”** The contradiction (report vs visual) is a **deploy / publish** mismatch, not a fabricated commit and not a silent revert.

---

## Další krok (recommended)

**Opravit deployment** — do not re-implement Tour from scratch.

1. From repo tip `7bdbd12`: rebuild Embed distribution (`pnpm --filter @embed-engine/embed build`) and `pnpm sync:pages`.
2. Bump partner cache-bust (`?v=…`) and push `feature/cap-p04-founding-partner` so Pages updates.
3. Validate on `docs/embed/live.html` / GitHub Pages Experience (open Tour after Hero).
4. Separately restore/fix DSE (or the real partner host) to load the official snippet against the new IIFE — DSE is currently empty of Embed.

**Do not close PT** until published IIFE loses legacy Tour strings and gains redesign markers.

**Do not re-implement** unless a post-publish visual check still fails against source.

---

## Audit constraints

- No application code changed for this PT.
- No git commit created for this audit file (per PT-TOUR-VERIFY-01 commit strategy).
