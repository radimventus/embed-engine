# PT-TOUR-LAYOUT-01 — Tour Layout Gaps & Alignment

Date: 2026-07-23

## Verdict

**PASS** — four remaining Tour layout points from PT-TOUR-REDESIGN-01 visual validation are fixed.

Screenshot: `docs/reviews/assets/pt-tour-layout-01.png`

---

## Root cause (before)

| Issue | Cause |
|-------|--------|
| Menu ≠ VIDEO/FOTKY | Toggle used `w-full` + `ml-[15px]` (overflow → 176px); room list shrank to 161px |
| Gap menu→plan ~59px | Room Index `pr-24` + floor `pl-30` + `-translate-x-[5px]` |
| Plan looked small / unused area | Display box collapsed to plan height (`1fr` + `content-start`); vertical rules never applied |
| Loupe | Already `right: 20` on plan box — blocked by collapsed display |

---

## Changes

| Area | Fix |
|------|-----|
| Menu | Shared `HOUSE_NAVIGATOR_ROOM_CONTROL_WIDTH_CLASS` (`ml-[15px] w-[calc(100%-15px)]`) on room list + VIDEO/FOTKY; Room Index `pr-0`, removed `-translate-x-[5px]` |
| Floor plan gaps | `pl-[30px]` / `pr-[20px]` unchanged; with `pr-0` on menu column, measured gap menu→plan = **30px**, plan→right = **20px** |
| Vertical align | Floor section `grid-rows-[minmax(0,1fr)_100px]`; FloorPlan display `flex-1 h-full` so variant A/B can measure against real display height |
| Loupe | Still anchored to plan box, `right: 20px` (follows plan position) |

Out of scope (unchanged): SVG colors, menu item chrome, toggle colors, thumbnails, Runtime, Hero, Delivery, media.

---

## Validation (Playwright @ 1600×900, Client Studio)

| Check | Measured | Status |
|-------|----------|--------|
| Menu width = VIDEO/FOTKY | 185px = 185px (Δ 0) | ✅ |
| Gap menu → plan | 30px | ✅ |
| Gap plan → section right | 20px | ✅ |
| Plan uses content width | 448px (= column − 30 − 20) | ✅ |
| Vertical align (plan shorter) | display 428px, plan 252px, top/bottom pad 88.2 / 88.2 (center) | ✅ |
| Loupe from plan right | 20px | ✅ |

---

## Files

- `sections/HouseNavigator/RoomIndex.tsx`
- `sections/HouseNavigator/RoomPanel.tsx`
- `sections/HouseNavigator/FloorPlan.tsx`
- `sections/spatial-terminal-layout.ts`
- `chapter-layout.ts` (comment only)
