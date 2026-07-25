# PT-EMBED-RUNTIME-INTEGRATION-01 — Unify Embed Runtime Path

## Verdict

**Pass.** Embed no longer creates a separate HousePackage / Decision Session Runtime. Production Embed mounts Client Studio and consumes the **same** Provider bootstrap as standalone Client Studio:

`ensureBuilderPackageBootstrapped` → `projectBuilderImportToHousePackage` → `createDecisionSessionRuntime`.

Embed Demo (`http://localhost:5180/validate.html`; historically phrased “Live Embed”): **10 rooms**, Runtime source `builder-package/projectBuilderImportToHousePackage`, exterior gallery `01/02/03.webp` matching `gallery.csv`.

---

## 1. Embed entry path (after)

```text
Embed.mount (packages/embed/src/mount.ts)
  │
  ├─ launcher → bindExperienceLauncher → launchExperience
  └─ inline   → bootstrapClientStudioDelivery
        │
        ▼
mountClientStudio (apps/client-studio/src/embed/mountClientStudio.tsx)
  · setPresentationAssetBase(assetBase)
  · render ClientStudioApp  (runtime omitted)
        │
        ▼
DecisionSessionRuntimeProvider
  · ensureBuilderPackageBootstrapped()
  · getBuilderRuntimeHousePackage()
  · createDecisionSessionRuntime({ housePackage })
        │
        ▼
Experience → React root (Client Studio sections)
```

### Files (Embed → Experience)

| Step | File |
|------|------|
| Public entry | `packages/embed/src/mount.ts` |
| Launcher bind | `packages/embed/src/launcher/bindExperienceLauncher.ts` |
| Launch pipeline | `packages/embed/src/delivery/launchExperience.ts` |
| Inline delivery | `packages/embed/src/delivery/mountClientStudioDelivery.ts` |
| CS mount adapter | `apps/client-studio/src/embed/mountClientStudio.tsx` |
| App composition | `apps/client-studio/src/features/client-studio/ClientStudioApp.tsx` |
| Page + Provider | `ClientStudioPage.tsx` → `DecisionSessionRuntimeProvider.tsx` |
| Builder bootstrap | `apps/client-studio/src/features/client-studio/runtime/builderPackageBootstrap.ts` |
| HousePackage import | `packages/object-house/src/builder-package/projectToHousePackage.ts` |
| Runtime factory | `@embed-engine/runtime` `createDecisionSessionRuntime` |

---

## 2. Divergence vs Client Studio (before → after)

### Before (first fork)

```text
Client Studio (standalone)
  Provider → builderPackageBootstrap → projectBuilderImportToHousePackage

Embed
  resolveBuilderHousePackage()          ← DUPLICATE CSV fetch + defaults
    → createDeliveryRuntime(housePackage)
    → mountClientStudio({ runtime })    ← Provider SKIPPED Builder bootstrap
```

First divergence: **Embed created HousePackage + Runtime before mount**, while Client Studio created them **inside** `DecisionSessionRuntimeProvider`.

Published `docs/embed/*.js` still contained legacy **REFERENCE_HOUSE** (`room-living`, 8 rooms) — that explains user-visible “old Embed” when testing Pages/IIFE rather than local Client Studio `:4173`.

### After

```text
Client Studio (standalone)     Embed (launcher / inline)
            \                     /
             \                   /
              ▼                 ▼
     DecisionSessionRuntimeProvider
              │
              ▼
     ensureBuilderPackageBootstrapped()
              │
              ▼
     projectBuilderImportToHousePackage()
```

No second active production path creating HousePackage for Experience.

`resolveObjectPackage.ts` / `createDeliveryRuntime.ts` remain for **unit tests / offline projection only**.

---

## 3. Runtime trace (live Embed)

From `http://localhost:5180/validate.html` (inline Embed mount):

```text
Embed Runtime source: builder-package/projectBuilderImportToHousePackage
Embed rooms: [exterior, kitchen, living-room, vestibule, wardrobe, bedroom, bathroom, toilet, children-room, office]
Embed navigation: [exterior, kitchen, living-room, vestibule, wardrobe, bedroom, bathroom, toilet, children-room, office]
Embed room count: 10
Embed navigation room count: 10
Gallery rooms: [exterior, kitchen, living-room, vestibule, wardrobe, bedroom, bathroom, toilet, children-room, office]
Embed active room id: exterior
Embed gallery assets: gallery:exterior:1|2|3 → /house-package/media/gallery/01.webp|02.webp|03.webp
```

Artifact: `docs/reviews/assets/pt-embed-runtime-integration-01/trace.json`

---

## 4. Gallery vs `gallery.csv`

| CSV (exterior) | DOM after SelectRoom exterior |
|----------------|-------------------------------|
| `01.webp` | `/house-package/media/gallery/01.webp` |
| `02.webp` | `/house-package/media/gallery/02.webp` |
| `03.webp` | `/house-package/media/gallery/03.webp` |

---

## 5. Why Builder Runtime was not used (before)

Embed **did** call `projectBuilderImportToHousePackage` in source (`resolveObjectPackage.ts`), but:

1. Via a **parallel bootstrap** (duplicated defaults/fetch), not Client Studio’s Provider path.
2. Injected Runtime caused Provider to **skip** `ensureBuilderPackageBootstrapped`.
3. Stale **published** IIFE under `docs/embed/` still shipped REFERENCE_HOUSE (8 rooms).

---

## 6. Minimal integration (what changed)

| File | Change |
|------|--------|
| `packages/embed/src/delivery/launchExperience.ts` | Stop resolving HousePackage / creating Runtime; mount CS only |
| `packages/embed/src/delivery/mountClientStudioDelivery.ts` | Same |
| `apps/client-studio/src/embed/mountClientStudio.tsx` | `runtime` optional; stamp `objectId` when omitted |
| `packages/embed/src/delivery/clientStudioMount.stub.ts` | Types aligned |
| `DecisionSessionRuntimeProvider.tsx` | Embed-prefixed Runtime / gallery traces |
| `packages/embed/demo/validate.html` + `validate-inline.ts` | Inline mount for live proof (no launcher click) |
| `packages/embed/src/delivery/deliveryLayer.test.ts` | Mount-failure test no longer stubs CSV fetch |

No new Provider. No new bootstrap layer. Embed only sets `assetBase` + mounts.

---

## 7. Validation checklist

| Check | Result |
|-------|--------|
| Runtime source = `builder-package/projectBuilderImportToHousePackage` | Pass |
| Rooms = 10 | Pass |
| Navigation = 10 | Pass |
| Gallery matches `gallery.csv` (exterior 01–03) | Pass |
| Same init as Client Studio (Provider + builderPackageBootstrap) | Pass |
| No second production HousePackage author | Pass |

### Screenshots

- `docs/reviews/assets/pt-embed-runtime-integration-01/embed-10-rooms-navigator.png` — 10 rooms, Exteriér selected
- `docs/reviews/assets/pt-embed-runtime-integration-01/embed-overview.png`
- `docs/reviews/assets/pt-embed-runtime-integration-01/embed-exterior-gallery.png`

---

## Migration note

- **Local Embed demo** (`pnpm --filter @embed-engine/embed demo`) now matches Client Studio Runtime.
- **GitHub Pages / `docs/embed` IIFE** must be rebuilt + synced (`pnpm --filter @embed-engine/embed build` + `sync:pages`) before partners see this on Pages; the previously published bundle still embedded legacy REFERENCE_HOUSE.
- Validation helper: open `http://localhost:5180/validate.html` (inline) or launcher demo CTA on `/`.
