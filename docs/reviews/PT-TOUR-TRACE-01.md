# PT-TOUR-TRACE-01 — live.html → Tour render path

Date: 2026-07-23  
Scope: audit only (no layout changes)

---

## Status

**FAIL (deployment gap) — not a second Tour implementation**

`embed/live.html` renders the **same** Tour components edited in PT-TOUR-LAYOUT-01 (`RoomIndex`, `RoomPanel`, `MediaModeToggle`, `FloorPlan`, `FloorPlanZoomControl` / `SpatialZoomControl`).

Those LAYOUT-01 edits were **never committed**, **never rebuilt into** `docs/embed/embed.iife.js`, and **never published** to GitHub Pages. Pages still serve **PT-TOUR-REDESIGN-01** (`?v=tour-01`, commit `96b4e8d`).

Report metrics (185 / 448 / 30 px…) were measured on **local Vite** against the **uncommitted** working tree — not against Pages.

---

## Path: `live.html` → Tour

```text
docs/embed/live.html
  └─ <script src="…/embed/embed.iife.js?v=tour-01">
  └─ Embed.mount({ mode: "launcher", target: "#embed-hero", … })
       └─ packages/embed/src/mount.ts
            └─ bindExperienceLauncher → CTA
                 └─ packages/embed/src/delivery/launchExperience.ts
                      ├─ createOverlaySurface()
                      ├─ createDeliveryRuntime(objectPackage)
                      └─ mountClientStudio({ target: overlay.mountTarget, runtime, assetBase })
                           └─ apps/client-studio/src/embed/mountClientStudio.tsx
                                └─ <ClientStudioApp runtime={…} />
                                     └─ ClientStudioApp.tsx → ClientStudioPage.tsx
                                          └─ <WalkthroughProvider>
                                               └─ <SpatialTerminal />   ← Tour shell
                                                    ├─ MediaExplorer
                                                    ├─ RoomIndex        ← room menu + VIDEO/FOTKY
                                                    └─ FloorPlanExplorer
                                                         └─ FloorPlan   ← SVG + loupe
```

Published bundle tip: **`96b4e8d`** `build(embed): rebuild tour bundle and publish pages`  
(contains source from **`7bdbd12`** `feat(tour): redesign layout and interaction polish`)

---

## Element → component (what Pages actually ships)

Classes below are taken from the **live IIFE** (`embed.iife.js?v=tour-01`) and match **HEAD** sources (REDESIGN-01). Line numbers = `git show HEAD:…`.

### 1. Room menu

| | |
|--|--|
| **Component** | `RoomIndex` → `RoomPanel` |
| **Files** | `…/HouseNavigator/RoomIndex.tsx` · `…/HouseNavigator/RoomPanel.tsx` |
| **Lines** | RoomIndex section **L12–14**; RoomPanel nav **L13–16**; row button **L22–32** |
| **Classes (live)** | Section: `grid h-full min-w-0 shrink-0 -translate-x-[5px] grid-rows-[auto_1fr_100px] content-start items-start gap-0 overflow-x-hidden px-section pb-section` |
| | Nav: `ml-[15px] flex min-h-0 min-w-0 flex-col justify-start gap-1 overflow-x-hidden overflow-y-auto mobile:ml-0` |
| | Button: `min-h-[39px] w-full rounded-[8px] … text-[#001930]` |

LAYOUT-01 intended (working tree only, **not in IIFE**): `pl-section pr-0`, shared `ml-[15px] w-[calc(100%-15px)]`.

### 2. VIDEO / FOTKY toggle

| | |
|--|--|
| **Component** | `MediaModeToggle` (inside `RoomIndex`) |
| **File** | `…/HouseNavigator/MediaModeToggle.tsx` |
| **Lines** | Wrapper **L18–20**; option buttons **L26–34** |
| **Classes (live)** | Host row: `SEGMENTED_CONTROL_FLOOR_BASELINE_CLASS` + `ml-[15px]` + inner `w-full` (`RoomIndex.tsx` **L21–23**) |
| | Control: `inline-flex w-full min-w-0 shrink-0 gap-0.5 rounded-[8px] border border-embed-border-default bg-white p-0.5` |

Optical mismatch on Pages: toggle `w-full` + `ml-[15px]` overflows → ~176px; room rows shrink → ~161px. LAYOUT-01 fix not published.

### 3. Floorplan wrapper

| | |
|--|--|
| **Component** | `FloorPlanExplorer` → `FloorPlan` (display + plan box) |
| **Files** | `…/FloorPlanExplorer.tsx` · `…/FloorPlan.tsx` · token `SPATIAL_TERMINAL_FLOOR_PLAN_SECTION_CLASS` in `spatial-terminal-layout.ts` **L40–41** |
| **Lines** | Section **L14–18**; display **L177–181**; plan box **L183–186** |
| **Classes (live)** | Section: `scroll-mt-header` + `grid h-full w-full min-w-0 grid-rows-[1fr_100px] content-start items-start overflow-x-hidden pl-[30px] pr-[20px] pb-section pt-5` |
| | Display: `relative flex min-h-0 w-full min-w-0 max-w-none overflow-hidden mobile:items-center` + `items-end` \| `items-center` |
| | Plan box: `relative w-full min-w-0 max-w-none` + `style.aspectRatio` |

LAYOUT-01 intended: `grid-rows-[minmax(0,1fr)_100px]`, display `flex-1 h-full` — **absent** from live IIFE.

### 4. SVG wrapper

| | |
|--|--|
| **Component** | `FloorPlanCanvas` (inner function of `FloorPlan.tsx`) |
| **File** | `…/HouseNavigator/FloorPlan.tsx` |
| **Lines** | SVG root **L48–54**; class from caller **L188** `block h-full w-full` |
| **Classes (live)** | `block h-full w-full` · `viewBox` from Experience · `preserveAspectRatio="xMidYMid meet"` · fills `#f5b90040` / `#f5b9007f` |

Same SVG path on Pages and in LAYOUT work — LAYOUT did not change SVG.

### 5. Magnifier (loupe)

| | |
|--|--|
| **Component** | `FloorPlanZoomControl` → `SpatialZoomControl` |
| **Files** | `…/FloorPlanZoomControl.tsx` · `…/SpatialZoomControl.tsx` · call site `FloorPlan.tsx` **L189–192** |
| **Lines** | Call: className `absolute bottom-3 z-10`, `style={{ right: 20 }}` (`LOUPE_RIGHT_INSET_PX = 20`) |
| | Button base (`SpatialZoomControl` **L11–20**): `flex h-[42px] w-[42px] … border border-[#D4AF37] bg-white/90 …` |
| **Live IIFE** | Confirmed: `"absolute bottom-3 z-10",style:{right:V0}` with `V0=20`; label `Zvětšit půdorys` |

---

## Why report showed 185 / 448 / 30 px but Pages looks unchanged

| Fact | Detail |
|------|--------|
| Measurement host | Local Client Studio Vite (`:5291`), **not** `live.html` / Pages IIFE |
| Source under test | **Uncommitted** LAYOUT-01 working tree |
| Git | `RoomIndex` / `RoomPanel` / `FloorPlan` / `spatial-terminal-layout` still **modified, unstaged**; no commit message for LAYOUT-01 |
| Publish | Last Pages sync = `96b4e8d` / cache-bust **`tour-01`** = REDESIGN-01 only |
| IIFE probe | Live bundle contains `-translate-x-[5px]` + `px-section` RoomIndex; **missing** `pr-0`, `calc(100%-15px)`, `minmax(0,1fr)_100px` |

So the report numbers are real for the **local dirty tree**. They were never the numbers of the **released** Embed.

---

## Second Tour / override?

| Candidate | Verdict |
|-----------|---------|
| `PropertyExplorer` | Exists under `sections/PropertyExplorer/` but **not mounted** in `ClientStudioPage` (Tour = `SpatialTerminal` only). String `PropertyExplorer` **absent** from live IIFE. |
| `baseline/` / `gen1/` / `reference-build/` house-package copies | Asset snapshots only — not an alternate React Tour for `live.html`. |
| Legacy `LegacyCommandRuntimeHost` | Only if explicitly enabled; default Embed path uses `ClientStudioPage` → `SpatialTerminal`. |
| CSS Isolation / host styles | Affect host bleed; do **not** replace Tour components or ship LAYOUT classes. |

**Conclusion:** One Tour implementation. Failure mode = **source edited locally, distribution not rebuilt/published**.

---

## Render tree (Active Experience)

```text
[data-embed-overlay-mount][data-client-studio-root]
  ClientStudioApp
    AppShell
      ClientStudioPage
        WalkthroughProvider
          SpatialTerminal (#walkthrough)
            MediaExplorer
            RoomIndex [aria-label="Seznam místností"]
              RoomPanel [aria-label="Místnosti"]
              MediaModeToggle [aria-label="Režim média"]
            FloorPlanExplorer [aria-label="Půdorys"]
              FloorPlan
                displayRef wrapper
                  planRef wrapper
                    FloorPlanCanvas <svg>
                    FloorPlanZoomControl → SpatialZoomControl [aria-label="Zvětšit půdorys"]
```

---

## Recommended next step (out of scope for this audit)

1. Commit PT-TOUR-LAYOUT-01 source + report  
2. `pnpm --filter @embed-engine/embed build` + `pnpm sync:pages`  
3. Bump `IIFE_CACHE_BUST` past `tour-01`  
4. Push branch used by GitHub Pages  
5. Re-validate `live.html` against the new `?v=`
