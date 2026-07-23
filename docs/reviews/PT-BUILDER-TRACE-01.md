# PT-BUILDER-TRACE-01 — Builder Package Release Trace

| Field | Value |
| --- | --- |
| **ID** | PT-BUILDER-TRACE-01 |
| **Date** | 2026-07-24 |
| **Branch** | `feature/cap-p04-founding-partner` @ `249309b` |
| **Status** | Diagnosis complete — **pipeline broken (unwired)** |
| **Code change** | None (diagnostic only) |

---

## Verdict (answers)

| Question | Answer |
| --- | --- |
| Jsou správné commity součástí větve / HEAD? | **Ano** — všechny tři jsou ancestors of HEAD |
| Jsou použity při buildu běžící aplikace? | **Ne** — importer není importován žádným app/embed modulem |
| Čte Runtime `gallery.csv`? | **Ne** — čte `manifest.json` + per-room `media/<room>/` |
| Čte Runtime Hero z Builder Package? | **Ne** — Hero UI hardcode / Object Package `reference-house` |
| Kde se změna ztratí? | **Mezi Builder Importer a Runtime** — importer nikdy neběží; UI nikdy nečte CSV registry |

---

## 1. Commits

| Commit | Message | Exists | On branch / reachable from HEAD | Used in app build |
| --- | --- | --- | --- | --- |
| `6aa14d5` | docs(spec): define Builder House Package input format (HP-002) | Yes | Yes (`git merge-base --is-ancestor` = 0) | Docs only |
| `0768e7d` | feat(object-house): import HP-002 Builder packages into Runtime registries | Yes | Yes | **Library only** — consumed solely by its own unit tests |
| `249309b` | docs(builder-package): finalize HP-002 SSOT | Yes | Yes (= HEAD) | Docs only |

`importBuilderHousePackage` call sites in repo (excluding tests): **none**.

---

## 2. Input data on disk vs what Runtime reads

### Present under `apps/client-studio/public/house-package/`

| Path | Present | Notes |
| --- | --- | --- |
| `manifest.json` | Yes | **Actually loaded by Runtime** |
| `media/gallery.csv` | Yes | **Not read by any Runtime module** |
| `media/rooms.csv` | Yes | Not read; schema also diverges from HP-002 (`file`, `area` columns) |
| `media/videos.csv` | Yes | Not read; header `media-id` ≠ HP-002 `mediaId` |
| `media/gallery/` | Yes | Flat webp files |
| `media/hero/` | **No** | Missing vs HP-002 |
| Package-root `gallery.csv` / `rooms.csv` / `videos.csv` | **No** | CSVs sit under `media/` (not HP-002 package root) |

### What Runtime actually loads

```ts
// apps/client-studio/src/features/client-studio/runtime/presentation-assets.ts
import manifest from '../../../../public/house-package/manifest.json';
// → resolveHousePackage(BASE_MANIFEST)
```

Manifest still describes **per-room folders** (`media/exterior/hero.jpg`, `01.jpg`…) — the pre–HP-002 Tour catalog model.

---

## 3. Gallery pipeline trace

```text
gallery.csv (media/gallery.csv on disk)
        │
        ✖  NEVER READ
        ▼
Builder Importer  (packages/object-house/.../importBuilderHousePackage.ts)
        │
        ✖  NEVER INVOKED by Client Studio / Embed
        ▼
Runtime Registry (in-memory GalleryRegistry)
        │
        ✖  DOES NOT EXIST in running app
        ▼
Gallery Runtime   ← ACTUAL PATH STARTS HERE (legacy)
        │  presentation-assets.ts → resolveHousePackage(manifest.json)
        │  kernel resolve-house-package.ts (filename sort!)
        │  synchronizedExperience.projectRoomContext → getMediaRoom()
        ▼
Gallery Component
        │  MediaExplorer/MainMedia.tsx ← experience.context.roomMedia
        ▼
UI
```

| Step | Input | Output | File | Module | Status |
| --- | --- | --- | --- | --- | --- |
| CSV | partner edits | — | `media/gallery.csv` | — | **Orphan** |
| Importer | package root + CSVs | registries | `importBuilderHousePackage.ts` | `@embed-engine/object-house/builder-package` | **Unused** |
| Registry | importer result | GalleryRegistry | (none persisted) | — | **Missing** |
| Gallery Runtime | `manifest.json` | `ResolvedHousePackageRoom` | `manifest.json` | `presentation-assets.ts`, `resolve-house-package.ts` | **Active (legacy)** |
| Projection | media room | `roomMedia` / thumbnails | `synchronizedExperience.ts` | same | **Active** |
| UI | `roomMedia` | photos | `MainMedia.tsx` | MediaExplorer | **Active** |

**Break point:** CSV → Importer (no caller). Secondary: even if importer ran, UI still binds to `manifest.json`.

---

## 4. Hero pipeline trace

```text
media/hero/ (HP-002)
        │
        ✖  DIRECTORY ABSENT; no Hero Registry consumer
        ▼
Importer → Hero Registry
        │
        ✖  NEVER RUN
        ▼
── ACTUAL Hero paths (bypass Builder Package) ──

A) Section Hero photograph
   HeroImage.tsx
   → hard-coded `/media/house-modern-01/exterior.webp`

B) Experience hero context (title/metrics + optional media)
   synchronizedExperience.projectHeroContext
   → houseFallbackHero(experience)
   → REFERENCE_HOUSE_PACKAGE.media (reference-house hero.webp)

C) Tour opening hero (manifest only; not Hero section photo)
   resolveHousePackage → openingHeroSrc from manifest.opening.roomId
```

| Step | Input | Output | File | Module | Status |
| --- | --- | --- | --- | --- | --- |
| Builder hero | `media/hero/*` | — | (missing) | — | **Not used** |
| Importer / Hero Registry | — | — | builder-package | — | **Unused** |
| Hero Component | constant URL | CSS background | `HeroImage.tsx` | sections/Hero | **Hard-coded alternate path** |
| Experience hero | Object Package media | `context.hero` | `synchronizedExperience.ts` | + `reference-house-package.ts` | **Object Package path** |

**Confirmed:** Hero is **not** loaded from Builder House Package HP-002.

---

## 5. Runtime Registry lifecycle

| Question | Finding |
| --- | --- |
| When do HP-002 registries arise? | Only inside `importBuilderHousePackage()` if called (tests / manual) |
| When regenerated? | Never in app lifecycle |
| After CSV change? | No effect — CSV unread |
| Stale cache? | Vite/IIFE may cache `manifest.json` + assets; **not** the primary bug. Primary = wrong source of truth |

There is **no** generated Gallery/Hero registry artifact written to disk by the app.

---

## 6. Release pipeline

| Step | Behavior | Risk |
| --- | --- | --- |
| Client Studio / Embed build | Bundles `presentation-assets` → **embeds `manifest.json` import** | CSV ignored |
| `packages/embed/scripts/sync-pages.mjs` | Copies `apps/client-studio/public/house-package` → `docs/house-package` | Copies CSVs as inert files + still ships `manifest.json` |
| Overwrite new registries with old? | N/A — registries never produced; **old manifest remains authoritative** | Yes, effectively |

Build uses “current” package folder bytes, but **resolution path is still HP-001-style manifest**, not HP-002 CSV.

---

## 7. Files & modules involved

### Used by running app (legacy)

- `apps/client-studio/public/house-package/manifest.json`
- `apps/client-studio/src/features/client-studio/runtime/presentation-assets.ts`
- `packages/kernel/src/house-package/resolve-house-package.ts`
- `apps/client-studio/src/features/client-studio/runtime/synchronizedExperience.ts`
- `apps/client-studio/src/features/client-studio/sections/MediaExplorer/MainMedia.tsx`
- `apps/client-studio/src/features/client-studio/sections/Hero/HeroImage.tsx`
- `packages/object-house/src/reference-house-package.ts`
- `packages/embed/scripts/sync-pages.mjs` (copy only)

### HP-002 / unused by app

- `packages/object-house/src/builder-package/*`
- `apps/client-studio/public/house-package/media/{gallery,rooms,videos}.csv`
- HP-002 docs (`docs/03-specification-standard/HP-002-…`)

---

## 8. Minimal fix proposal (do not implement in this PT)

**Smallest restore of correct flow** (ordered):

1. **Wire once at session/bootstrap:** call `importBuilderHousePackage` (or a browser-safe CSV→registry loader) against package root; fail closed if CSVs invalid.
2. **Replace** `presentation-assets.ts` manifest import with Gallery/Room/Video/Hero registries as the sole media catalog for Tour / Media Explorer.
3. **Point HeroImage** (and/or `projectHeroContext`) at Hero Registry asset — remove hard-coded `/media/house-modern-01/exterior.webp` and stop treating Object Package image as opening Hero when Builder Package is present.
4. **Align on-disk layout** with locked HP-002 (CSVs at package root; `media/hero/`; column names `mediaId`).

Avoid larger refactor (no new CMS, no dual SSOT). Until (1)–(3), editing `gallery.csv` / Hero assets **cannot** appear in UI.

Suggested follow-up commit message (when implementing):  
`fix(builder): restore Builder Package runtime pipeline`

---

## Validation checklist

- [x] Complete pipeline trace
- [x] File / module lists
- [x] Commit confirmation
- [x] Break location identified
- [x] Minimal fix proposed
- [x] No code commit (diagnosis only)
