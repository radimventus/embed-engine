# PT-RUNTIME-EVIDENCE-01 — Runtime Media Evidence

| Field | Value |
| --- | --- |
| **ID** | PT-RUNTIME-EVIDENCE-01 |
| **Date** | 2026-07-24 |
| **Status** | Evidence complete — **PŘERUŠENÍ TOKU confirmed** |
| **Scope** | Instrumentation + forensic capture only (no architecture fix) |
| **App under test** | Client Studio Vite `http://127.0.0.1:4190` with `VITE_RUNTIME_EVIDENCE=1` |

---

## Verdict (answers)

| Question | Answer (evidence-backed) |
| --- | --- |
| Jaký `gallery.csv` Runtime skutečně používá? | **Záměr:** inlined text z `public/house-package/gallery.csv` přes `builderPackageCsv.vite.ts` (`?raw`). **Běh:** bootstrap **padá** — CSV modul z `public/` Vite 7 odmítá / alias se nerozliší. |
| Jaké pořadí galerie Runtime renderuje? | Z diskového SSOT (když registry vzniknou): order `1…15` = `01.webp`…`22.webp` (viz §3). **UI na 4190 nyní registry nevytvoří** (bootstrap 500). |
| Odkud Hero pochází? | **Záměr:** `/house-package/media/hero/hero.webp` (Hero Registry). Soubor je na Network dostupný (200). |
| Jaká data dostává MainMedia? | **Záměr:** `experience.context.roomMedia` z Gallery/Video registries. **Běh:** dokud bootstrap failuje, Experience media projection nemůže naběhnout z Builder Package. |
| Kde se Builder Package odpojí od UI? | **PŘERUŠENÍ TOKU** — viz §8 |

### Runtime Source (jednoznačně)

| Candidate | Used at runtime? | Evidence |
| --- | --- | --- |
| **Builder Package Registry** | **Intended yes / currently broken before UI** | `presentation-assets.ts` imports `getBuilderResolvedPackage()` (Vite-served JS) |
| **manifest.json** | **No** (not imported by presentation-assets) | Served statically (200) but unused by adapter |
| **Other** | Vite module graph / Object Package for Navigator rooms | FloorPlan/Navigator still bind Object Package semantics |

**Does Runtime use `manifest.json` for media?** No.  
**Does Runtime successfully use Builder Package Registry in the observed Vite session?** No — bootstrap fails before registries reach UI.

---

## 1. Builder Package Evidence

From disk SSOT used as package input (`apps/client-studio/public/house-package/`):

| Field | Value |
| --- | --- |
| package root | `/house-package` |
| gallery.csv | `/house-package/gallery.csv` |
| rooms.csv | `/house-package/rooms.csv` |
| videos.csv | `/house-package/videos.csv` |
| hero | `/house-package/media/hero/hero.webp` |
| gallery fingerprint | `sha256-2050d18c69517aa6` (len 312) |
| gallery count | **15** |
| first | `{ order:1, room:exterior, file:01.webp }` |
| last | `{ order:15, room:office, file:22.webp }` |

Browser load mode (from Vite-transformed source):

```js
import galleryCsv from "/public/house-package/gallery.csv?import&raw";
```

→ CSV is **module-inlined**, not a live “read file on each paint”.

---

## 2. Runtime Registry Evidence (from package CSVs)

| Registry | count | first | last |
| --- | --- | --- | --- |
| Gallery | 15 | exterior/01.webp | office/22.webp |
| Hero | 1 | media/hero/hero.webp | same |
| Rooms | 10 | exterior / Exteriér | office / Pracovna |
| Videos | 3 | exterior/wistia | kitchen/wistia |
| Floors | 1 | p1 webp+svg | same |

Full dump: [`console-evidence.log`](./assets/pt-runtime-evidence-01/console-evidence.log)

---

## 3. Gallery order (CSV SSOT)

```text
1 exterior 01.webp
2 exterior 02.webp
3 exterior 03.webp
4 kitchen 11.webp
5 living-room 12.webp
…
15 office 22.webp
```

---

## 4. Hero Runtime (intended)

| Field | Value |
| --- | --- |
| resolved asset | `/house-package/media/hero/hero.webp` |
| source | Hero Registry → `experience.context.hero.primaryMediaUrl` |
| Network | **200** image/webp (298296 bytes) |

---

## 5. Component Evidence (bindings)

| Component | Values / binding |
| --- | --- |
| **MainMedia** | `experience.context.roomMedia` (heroUrl, videoUrl, thumbnails[], gallery[]) |
| **HeroImage** | `experience.context.hero.primaryMediaUrl` → `/house-package/media/hero/hero.webp` |
| **FloorPlan** | `experience.context.floorPlan.src` (+ Object Package floorplan preferred when present) |
| **Navigator** | `experience.context.navigation` room ids/names from Object Package |

Instrumentace (`?runtimeEvidence=1` / `VITE_RUNTIME_EVIDENCE=1`) loguje sekce `3.` / `4.` / `5.` do konzole, jakmile bootstrap naběhne.

---

## 6–7. Browser / Network / Sources evidence

Artifacts: [`docs/reviews/assets/pt-runtime-evidence-01/`](./assets/pt-runtime-evidence-01/)

| Artifact | Content |
| --- | --- |
| `devtools-console.html` | Captured evidence sections 1–8 |
| `devtools-network.html` / `network-evidence.json` | Network probe results |
| `devtools-sources.html` / `sources-evidence.json` | Module path map |
| `console-evidence.log` | Full text log |

### Network (live Vite 4190)

| URL | Status | Note |
| --- | --- | --- |
| `/house-package/gallery.csv` | 200 | Static public file |
| `/house-package/manifest.json` | 200 | **Still served**, unused by presentation-assets |
| `/house-package/media/hero/hero.webp` | 200 | Hero bytes present |
| `/public/house-package/gallery.csv?import&raw` | 200 | Inlined JS module exporting CSV string |
| `/src/.../presentation-assets.ts` | 200 | Imports **registries**, not manifest |
| `/src/.../builderPackageBootstrap.ts` | **500** | Import resolution failure (see §8) |

### Sources (Vite-transformed)

`presentation-assets.ts` served as:

```js
import { getBuilderPackageRegistries, getBuilderResolvedPackage }
  from "/src/.../builderPackageBootstrap.ts";
```

`builderPackageCsv.vite.ts` served as:

```js
import galleryCsv from "/public/house-package/gallery.csv?import&raw";
```

Vite also emits:

> Assets in public directory cannot be imported from JavaScript.

---

## 8. PŘERUŠENÍ TOKU

**Label:** PŘERUŠENÍ TOKU

| | |
| --- | --- |
| **Soubor** | `apps/client-studio/src/features/client-studio/runtime/builderPackageCsv.vite.ts` |
| **Funkce** | static ESM import of CSV via `?raw` from `public/` |
| **Řádek** | `import galleryCsv from '../../../../public/house-package/gallery.csv?raw'` |
| **Důvod** | Vite 7 forbids importing assets from `public/` into JS. Bootstrap therefore cannot load CSV text → `builderPackageBootstrap.ts` fails (observed **HTTP 500** / unresolved `@client-studio/builder-package-csv`) → Runtime registries never reach MainMedia/HeroImage. Separately, even a working `?raw` inline would **not** hot-apply disk CSV edits without module invalidation — explaining “I changed gallery.csv / Hero and nothing happened” when a stale or broken session is reviewed. |

**Secondary confusion:** `manifest.json` remains downloadable on Network, so DevTools can look “legacy”, while code path already abandoned it.

**Not a fix in this PT.** Next repair PT should relocate CSV sources out of `public/` (or fetch CSV at bootstrap) and keep evidence flag off by default.

---

## Instrumentation (temporary)

| Enable | How |
| --- | --- |
| Env | `VITE_RUNTIME_EVIDENCE=1` |
| Query | `?runtimeEvidence=1` |
| Storage | `localStorage.runtimeEvidence = '1'` |

Modules: `runtimeEvidence.ts`, hooks in bootstrap / MainMedia / HeroImage / FloorPlan / Navigator.

Commit: `debug(runtime): collect Builder Package runtime evidence`

---

## Validation checklist

- [x] Jaký gallery.csv Runtime používá (záměr vs běh)
- [x] Pořadí galerie z CSV
- [x] Hero path
- [x] MainMedia binding
- [x] Přesné místo přerušení (soubor / funkce / řádek / důvod)
- [x] Žádný architecture fix v tomto PT
