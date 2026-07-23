# PT-TOUR-LAYOUT-RELEASE-01 — Publish Tour layout to Pages

Date: 2026-07-23

## Status

**PASS** — LAYOUT-01 source committed, IIFE rebuilt, Pages synced with cache-bust `tour-layout-01`.

## Why

PT-TOUR-LAYOUT-01 lived only in the working tree. Pages still served `96b4e8d` / `?v=tour-01` (REDESIGN-01).

## Release steps

1. Working-tree LAYOUT sources (RoomIndex / RoomPanel / FloorPlan / spatial-terminal-layout)
2. `IIFE_CACHE_BUST`: `tour-01` → **`tour-layout-01`**
3. `pnpm --filter @embed-engine/embed build`
4. `pnpm sync:pages` → `docs/embed/*`

## Bundle verification (local IIFE before push)

| Marker | Present |
|--------|---------|
| RoomIndex `pl-section pr-0` (no `px-section` / no `-translate-x-[5px]`) | ✅ |
| `calc(100%-15px)` shared menu/toggle width | ✅ |
| `minmax(0,1fr)_100px` floor-plan rows | ✅ |
| `pl-[30px]` / `pr-[20px]` | ✅ |
| live.html `?v=tour-layout-01` | ✅ |

IIFE size: **456 576 B**

## Commit

**`9f95667`** — `build(embed): publish tour layout fix to pages`

Contains LAYOUT-01 sources **and** `docs/embed/embed.iife.js` / `live.html?v=tour-layout-01` in the **same** commit (not built from an uncommitted tree).

Parent: `96b4e8d` (prior tour-01 redesign publish).
