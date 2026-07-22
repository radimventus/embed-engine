# ED-DA-02 — Media Projection Boundary

**Status:** PARTIAL PASS  
**Date:** 2026-07-22  
**Depends on:** Decision Architecture v1.0 (FROZEN), AR-001, ED-DA-01 / ED-DA-01R

## Goal

Harden the boundary between Runtime semantics and media presentation so media remains projection-only and never participates in semantic composition.

---

## 1. Media Ownership Report

| Surface | Consumer | Source | Verdict |
| --- | --- | --- | --- |
| Hero image / copy | `HeroImage`, `HeroContent` | `experience.context.hero` | PASS |
| Gallery / video viewport | `MainMedia` | `experience.context.roomMedia` | PASS |
| Thumbnails | `ThumbnailRail` | `experience.context.roomMedia` + local index chrome | PASS |
| Floor plan / hotspots | `FloorPlan` | `experience.context.floorPlan` | PASS (hardened) |
| Media mode / play / zoom / lightbox | Walkthrough + MediaExplorer chrome | Local UI state only | PASS |
| Catalog adapter | `runtime/presentation-assets.ts` | Manifest under `/house-package` | Residual (projection seam only) |

**Allowed inputs observed:** Experience Context (Synchronized), Object Package rooms via Runtime house projection.  
**Forbidden inputs not observed in media UI:** Interpretation / Story / Moves / Outcome / Terminal / AIContext composition.

---

## 2. Projection Boundary Report

| Allowed | Status |
| --- | --- |
| render / filter / sort / highlight / animate / project | PASS — thumbnail reorder by recommended media role; crossfade chrome |

| Forbidden | Status |
| --- | --- |
| interpret / infer / compose / calculate semantics | PASS for Decision Session path |
| duplicate Runtime | PASS — projection copies Runtime decision slices by reference equality in tests |
| media as semantic authority | PASS for Decision Session; media index/mode no longer emit `MEDIA_OPENED` |

**Single projection seam:** `projectSynchronizedExperience` is the only Client Studio module allowed to resolve catalog URLs into `context.hero` / `context.roomMedia` / `context.floorPlan`.

---

## 3. Runtime Dependency Report

| Concern | Verdict | Evidence |
| --- | --- | --- |
| Runtime depends on images / videos | PASS | `packages/runtime` uses media **roles** only |
| Runtime depends on viewer / gallery / viewport state | PASS | No imports of walkthrough or presentation assets |
| Deterministic Runtime | PASS | unchanged; 65/65 runtime tests |

Runtime public contracts unchanged. No Runtime files modified.

---

## 4. Client Studio Media Boundary Report

| Module | Before | After |
| --- | --- | --- |
| `FloorPlan` | Called `getHousePresentationAssets()` | Reads `context.floorPlan` |
| `WalkthroughProvider` | Resolved floorplan chrome via `getMediaRoom`; emitted `MEDIA_OPENED` | Reads `context.floorPlan.rooms`; media index/mode are local only |
| Catalog location | `features/walkthrough/presentation-assets.ts` | `features/client-studio/runtime/presentation-assets.ts` (seam-owned) |
| Public walkthrough export | Re-exported `getHousePresentationAssets` | Removed |

---

## 5. Residual Engineering Debt

| ID | Remaining |
| --- | --- |
| ED-DA-02 (residual) | Move catalog / per-room media into Object Package (or Runtime Object projection) so the Client Studio adapter can be deleted |
| ED-DA-01 adjacent | Cognitive `ROOM_VIEWED` / `FLOOR_CHANGED` still emitted from navigation chrome (not media index) |
| ED-DA-03…06 | Unchanged |

---

## 6. Acceptance Checklist

- [x] Media UI is projection-only (Experience Context)
- [x] Runtime has no media presentation dependency
- [x] Media does not derive Decision Session semantics
- [x] Media chrome does not write `MEDIA_OPENED`
- [x] Runtime unchanged / deterministic
- [x] Existing + new boundary tests pass
