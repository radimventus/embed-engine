# PT-UX-SYNC-01 — Tour UX synchronization PLAN

**Status:** PLAN ONLY — no code applied, stash not applied/popped, no commits  
**Date:** 2026-07-26  
**Source:** `stash@{0}` — *WIP before AI publish* (`b2e7b06` / base `93552bc`)  
**Target:** `HEAD` `2782b7b` — *feat(ops): deploy production AI Delivery Edge*  
**Method:** `git stash show` / `git diff HEAD stash@{0}` (path-filtered); Playwright visual baseline; no `stash apply`/`pop`

---

## Runtime verification (already done)

| Surface | URL | Result |
| --- | --- | --- |
| Local Embed Demo | http://localhost:5180/ | **PASS** |
| Published partner snippet | https://radimventus.github.io/embed-engine/embed/partner-snippet.html | **PASS** |

Cite these as the green runtime baseline before any Tour UX promotion. PT-UX-SYNC-01 must not regress Runtime / AI delivery on either surface.

---

## Visual findings — Local vs Published (current HEAD baseline)

Screenshots (untracked, do not commit):

| Asset | Path |
| --- | --- |
| Local landing | `docs/reviews/assets/pt-ux-sync-01/local-01-landing.png` |
| Local Tour region | `docs/reviews/assets/pt-ux-sync-01/local-02-tour-region.png` |
| Local Tour clip | `docs/reviews/assets/pt-ux-sync-01/local-03-tour-clip.png` |
| Published landing | `docs/reviews/assets/pt-ux-sync-01/published-01-landing.png` |
| Published Tour region | `docs/reviews/assets/pt-ux-sync-01/published-02-tour-region.png` |
| Published Tour clip | `docs/reviews/assets/pt-ux-sync-01/published-03-tour-clip.png` |
| Metrics JSON | `local-notes.json`, `published-notes.json` |

**How opened**

- Local: CTA `#open-client-studio` / “Prozkoumat dům”
- Published: “Podívat se dovnitř – video →”

**Measured layout (1600×1000, both surfaces ≈ identical)**

| Signal | Local | Published |
| --- | --- | --- |
| `Interaktivní půdorys` | **Present** (visible `h2`) | **Present** |
| Media display width | **600 px** | **600 px** |
| Media viewport top | 254 | 254 |
| Floor-plan display top | 223 | 223 |
| Δ plan top vs media top | **−31 px** (plan higher / title overlays plan) | **−31 px** |
| Room menu (`nav`) top | 254 (top-aligned with media) | 254 |
| Room menu vertical mid-centering | **No** — top-aligned under title band | **No** |

**Baseline verdict**

Local Embed Demo and Published partner-snippet Tour chrome are **visually in sync with each other** on HEAD, and **both still show the pre-stash Tour UX**:

1. Floor plan is **not** top-aligned with the media display (title + absolute overlay / `pt-5` / justify alignment push plan geometry).
2. **“Interaktivní půdorys”** is visible over the plan column.
3. Media column is **600 px** (not stash 580).
4. Room list is **top-aligned** with the media viewport, not vertically centered in the middle column.

Stash@{0} contains the intended corrections; they are **not** on HEAD / Published yet.

---

## Tour UX changes found in `stash@{0}`

### Approved intentions → exact file + hunk summary

| # | Intention | Stash files (exact) | Hunk summary | Size |
| --- | --- | --- | --- | --- |
| 1 | Floor plan aligned with top edge of media display | `FloorPlanExplorer.tsx`, `FloorPlan.tsx`, `spatial-terminal-layout.ts`, `SpatialTerminal.tsx`, `MediaExplorer.tsx` | **FloorPlanExplorer:** drop absolute `SectionHeader`; insert invisible `SPATIAL_TERMINAL_WALKTHROUGH_TITLE_CLASS` spacer (“Align plan top with Media Display”). **FloorPlan:** remove `ResizeObserver` / `justify-center\|end` virtual box; `shrink-0` natural aspect height (TOUR-17/27). **spatial-terminal-layout:** floor-plan section `grid-rows-[minmax(0,1fr)_100px] … pt-5` → `flex flex-col` (no `pt-5`); add `SPATIAL_TERMINAL_PLAN_TOGGLE_GAP_CLASS` `min-h-[50px] flex-1`. **SpatialTerminal:** remove `min-h-spatial-terminal-surface` so height follows plan (TOUR-27). **MediaExplorer:** column `flex` + `mt-auto` thumbnails so shared bottom baseline holds when plan drives height (TOUR-29). | **M** |
| 2 | Removal of “Interaktivní půdorys” title | `FloorPlanExplorer.tsx` (+ dead `HouseNavigator/SectionHeader.tsx` remains in tree) | Stop importing/rendering `SectionHeader` (the only consumer of the Czech title string). Title file itself is **unchanged** in stash and becomes unused by Tour — optional delete/cleanup out of minimal sync. | **XS** |
| 3 | Updated media / floor plan proportions | `chapter-layout.ts`, `spatial-terminal-layout.ts` | **chapter-layout:** `SPATIAL_TERMINAL_MEDIA_TERMINAL_WIDTH_PX` **600 → 580** (TOUR-31); comment soft floor for surface; add `SPATIAL_TERMINAL_PLAN_TOGGLE_MIN_GAP_PX = 50`. **spatial-terminal-layout:** media content + viewport classes **600 → 580**; room control width `ml-[8px] w-[calc(100%-8px)]` → `w-full` (parent insets). Floor-plan column width recalculates via existing `SPATIAL_TERMINAL_FLOOR_PLAN_WIDTH_PX` formula (canvas − media − room − gutters). | **S** |
| 4 | Vertically centered room menu | `RoomIndex.tsx`, `RoomPanel.tsx`, `spatial-terminal-layout.ts` | **RoomIndex (TOUR-31/32):** `pl-section pr-0` grid → `flex … pl-10 pr-5` (+20 px optical shift right); shared title-band spacer so `Top(menu) == Top(display)`; flex-1 wrapper around `RoomPanel`. **Important:** stash uses `justify-start`, **not** `justify-center` — it delivers **optical horizontal centering** + top-band alignment, **not** mid-column vertical centering of the list. **RoomPanel (TOUR-33):** continuous 1 px token border + dividers; tokenized active/hover colors; `selectRoom` via `useWalkthrough`. If product still requires true vertical mid-centering, add a **post-stash** one-line `justify-center` on the flex-1 wrapper during implementation (confirm before coding). | **S** |

### Optional / extra Tour refinements in stash (TOUR-26…35 etc.)

Promote only if explicitly approved after the four intentions; otherwise leave in stash.

| Tag | Brief | Files | Plan |
| --- | --- | --- | --- |
| **TOUR-26** | Room-menu `SelectRoom` always first photo of room; thumbnail click preserves index via intent flag | `WalkthroughProvider.tsx` | **Optional** |
| **TOUR-27** | Section height driven by floorplan real aspect (overlaps intention 1) | `SpatialTerminal.tsx`, `FloorPlan.tsx`, `FloorPlanExplorer.tsx`, `chapter-layout.ts` | **In scope** with #1 |
| **TOUR-29** | Thumbnail rail on shared bottom baseline when plan drives height | `MediaExplorer.tsx` | **In scope** with #1 |
| **TOUR-30** | Wistia official swatch for video thumbnails (never invent local poster) | `synchronizedExperience.ts` (+ test) | **Optional** |
| **TOUR-31** | Media 580; menu +20 px right; 40 px menu↔plan gap comments | `chapter-layout.ts`, `RoomIndex.tsx`, layout tokens | **In scope** with #3/#4 |
| **TOUR-32** | Room menu column layout / title-band parity | `RoomIndex.tsx` | **In scope** with #4 |
| **TOUR-33** | Continuous bordered room list (incl. Exteriér) | `RoomPanel.tsx` | **Recommended with #4** (same chrome) |
| **TOUR-34** | Segmented VIDEO·FOTKY / floor toggle → design tokens only (no hard-coded grays) | `MediaModeToggle.tsx` | **Optional** |
| **TOUR-35** | Thumbnail 1 px gold border; 4 px outward outline hover/active without resizing 80 px box | `ThumbnailRail.tsx` | **Optional** |
| **TOUR-04** | Comment: Tour spacing module 20 px | `chapter-layout.ts` | Harmless with #3 |

Also in stash Tour-adjacent (behavior, not layout): `FloorPlan.tsx` / `RoomPanel.tsx` route `selectRoom` through `useWalkthrough` (needed if TOUR-26 is promoted together).

---

## Files affected + estimate

### Promote (approved core)

| File | Role | Est. |
| --- | --- | --- |
| `apps/client-studio/src/features/client-studio/chapter-layout.ts` | Media 580, plan-toggle gap token | **S** |
| `apps/client-studio/src/features/client-studio/sections/spatial-terminal-layout.ts` | 580 classes, flex floor-plan column, plan-toggle gap class | **S** |
| `…/HouseNavigator/FloorPlanExplorer.tsx` | Title removal + title-band spacer + gap | **XS** |
| `…/HouseNavigator/FloorPlan.tsx` | Top-align / natural height (drop virtual align box) | **S** |
| `…/HouseNavigator/RoomIndex.tsx` | Optical inset + title band + column flex | **S** |
| `…/HouseNavigator/RoomPanel.tsx` | Continuous list chrome (TOUR-33) | **S** |
| `…/MediaExplorer/MediaExplorer.tsx` | Flex column + `mt-auto` rail | **XS** |
| `…/SpatialTerminal/SpatialTerminal.tsx` | Drop forced min-height | **XS** |

**Core total:** ~**M** (half-day careful cherry-pick + visual verify), not a full stash apply.

### Optional extras (decide separately)

| File | Est. |
| --- | --- |
| `…/HouseNavigator/MediaModeToggle.tsx` (TOUR-34) | **XS** |
| `…/MediaExplorer/ThumbnailRail.tsx` (TOUR-35) | **S** |
| `…/walkthrough/WalkthroughProvider.tsx` (TOUR-26) | **S** |
| `…/runtime/synchronizedExperience.ts` (+ `.test.ts`) (TOUR-30) | **S** |

### Cleanup (optional, after #2)

| File | Note |
| --- | --- |
| `…/HouseNavigator/SectionHeader.tsx` | Becomes unused once FloorPlanExplorer stops importing it; delete only if no other refs |

---

## Implementation plan (ordered)

1. **Freeze scope** — Promote only the core file list above. Do **not** `git stash apply` / `pop`. Prefer path-scoped checkout from stash or manual hunk transfer:
   - `git checkout stash@{0} -- <core-files…>`  
   - or `git diff HEAD stash@{0} -- <file>` → apply selectively.
2. **Confirm intention #4** — Keep stash `justify-start` (optical horizontal) **or** add `justify-center` on RoomIndex flex-1 wrapper for true vertical mid-centering. Document the choice in the sync commit message.
3. **Apply layout tokens first** — `chapter-layout.ts` + `spatial-terminal-layout.ts` (580 / gap / floor-plan section class).
4. **Apply structure** — `SpatialTerminal.tsx` → `FloorPlanExplorer.tsx` → `FloorPlan.tsx` → `RoomIndex.tsx` → `RoomPanel.tsx` → `MediaExplorer.tsx`.
5. **Optional bundle** (only if approved) — MediaModeToggle / ThumbnailRail / WalkthroughProvider / wistia swatch together as a second commit.
6. **Do not promote ignore-list files** (below).
7. **Local visual verify** — http://localhost:5180/ → open Studio → Tour:
   - No “Interaktivní půdorys”
   - Plan top ≈ media viewport top (title-band spacer only)
   - Media width 580
   - Room menu inset / centering per decision in step 2
8. **Publish path (separate follow-up, not this plan’s execute step)** — rebuild Embed IIFE + `pnpm embed:publish` only after Local PASS; then re-spot-check partner-snippet.
9. **Runtime smoke** — re-confirm Local + Published Runtime PASS (AI delivery untouched).

---

## Confirmation: no unrelated code will be promoted

**Confirmed.** PT-UX-SYNC-01 will only move Tour Spatial Terminal / HouseNavigator / MediaExplorer layout (+ optional named Tour extras if separately approved). Explicitly excluded:

- AI delivery / Edge / `packages/ai`
- ADR-020 and other docs
- Client Studio header Close/parity (`ClientStudioHeader.tsx`)
- Gen1 / reference stamps, hero.webp binary, baseline bundles
- `packages/object-house` video URL helpers
- Playwright browser binaries
- Entire untracked docs dump in `stash@{0}^3`

Mechanism: **path-scoped promotion only** — never full stash apply.

---

## Out of scope / ignore list

### Tracked in `stash@{0}` — IGNORE

| Path | Why |
| --- | --- |
| `.DS_Store` | Noise |
| `apps/client-studio/gen1/GEN1.json` | Build stamp, unrelated |
| `apps/client-studio/reference-build/REFERENCE.json` | Build stamp |
| `apps/client-studio/scripts/stamp-gen1.mjs` | Stamp tooling |
| `apps/client-studio/scripts/stamp-reference.mjs` | Stamp tooling |
| `apps/client-studio/public/house-package/media/hero/hero.webp` | Media asset binary |
| `apps/client-studio/src/features/client-studio/ClientStudioHeader.tsx` | Embed Close chrome parity — not Tour layout |
| `apps/client-studio/src/features/client-studio/foundation/applicationFoundation.test.ts` | Unrelated test churn |
| `docs/architecture/adr/ADR-020-ai-delivery-architecture.md` | AI docs |
| `packages/object-house/src/builder-package/index.ts` | Package export / video helper |
| `packages/object-house/src/builder-package/resolveVideoUrl.ts` | Video URL resolution |
| `scripts/publish-reference-house.mjs` | Publish script |

### Tracked optional (not in approved-4 unless greenlit)

- `WalkthroughProvider.tsx` (TOUR-26)
- `synchronizedExperience.ts` / `.test.ts` (TOUR-30)
- `MediaModeToggle.tsx` (TOUR-34)
- `ThumbnailRail.tsx` (TOUR-35)

### Untracked `stash@{0}^3` — IGNORE entirely

| Category | Count (approx.) | Why |
| --- | --- | --- |
| `.playwright-browsers/**` | ~362 | Local browser install |
| `docs/**` | ~166 | Docs / reviews / platform archive dump |
| `apps/client-studio/baseline/**` | ~43 | Frozen baseline assets |
| `apps/client-studio/public/**` (extra media/svg/css) | ~7 | Unrelated media |
| `packages/**` (untracked) | ~3 | Not Tour UX |
| `intelligence/**` | 1 | Offline doc |
| Other Client Studio untracked | 1 | e.g. `vite.baseline.config.ts` |

**Note:** `packages/ai` does **not** appear in tracked stash files; ignore any temptation to mix AI publish WIP with this UX sync.

---

## Diff analysis commands used

```bash
git stash show --stat 'stash@{0}'
git stash show --include-untracked --stat 'stash@{0}'   # supported
git rev-parse 'stash@{0}^3' && git ls-tree -r --name-only 'stash@{0}^3'
# Pathspec form of `git stash show -p stash -- paths` failed on this git
# (“Too many revisions specified”); equivalent used instead:
git diff HEAD 'stash@{0}' -- \
  apps/client-studio/src/features/client-studio/sections/HouseNavigator \
  apps/client-studio/src/features/client-studio/sections/SpatialTerminal \
  apps/client-studio/src/features/client-studio/sections/MediaExplorer \
  apps/client-studio/src/features/client-studio/sections/spatial-terminal-layout.ts \
  apps/client-studio/src/features/client-studio/chapter-layout.ts
```

Stash parent at creation: `93552bc` (*feat(ai): implement secure published AI delivery*). Target for sync is current **HEAD `2782b7b`**, not stash parent — cherry-pick against HEAD.

---

## Success criteria (for later execute ticket)

- [ ] Local Tour: no “Interaktivní půdorys”
- [ ] Local Tour: floor-plan top edge aligned with media display top (title-band spacer only)
- [ ] Local Tour: media width 580; proportions rebalanced
- [ ] Local Tour: room menu matches approved centering decision (#4)
- [ ] No AI / docs / media-asset / header Close changes in the sync commit
- [ ] Runtime Local + Published still PASS
- [ ] Screenshots updated under `docs/reviews/assets/pt-ux-sync-01/` after sync (still OK untracked until review asks to commit)
