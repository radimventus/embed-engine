# CAP-BLD-01 — House Package as SSOT (Migration Design)

| Field | Value |
| --- | --- |
| **Status** | Design accepted — implementation via follow-up CAPs |
| **Date** | 2026-07-31 |
| **Architecture lock** | [ADR-023 — House Package as Content SSOT](../adr/ADR-023-house-package-content-ssot.md) |
| **Normative format** | [HP-002](../../03-specification-standard/HP-002-Builder-House-Package-Input.md) (locked) |
| **Tooling** | `@embed-engine/object-house` · `pnpm embed:publish` |
| **Out of scope** | Company CRUD · Login · Backend · Sales Studio · new formats · Builder→HP exporter |

---

## 1. Decision

```text
House Package (HP-002)     ← sole content SSOT
        ▲
        │  load / edit / validate / save (same files)
Builder Studio             ← authoring UI + orchestration only
        │
        ▼
Publish = validate (+ optional geometry) + pnpm embed:publish
        ▼
docs/house-package · docs/embed · Live Experience
```

- Builder **MUST NOT** own a parallel content package (`ProjectPackage`, mock assets, in-memory Object media copies).
- Builder **MUST** open, edit, and save the canonical tree:
  `apps/client-studio/public/house-package/`
- Runtime remains the sole author of meaning (projection via `projectBuilderImportToHousePackage`).
- Publish **MUST NOT** mint a House Package; it publishes the current HP-002 tree.

This aligns implementation with HP-002 §1 (Builder produces/accepts HP-002 only).

---

## 2. Target architecture (minimal)

### 2.1 Session model (replace mock Project)

| Concept | Role after migration |
| --- | --- |
| **Package root** | Absolute/repo-relative path to HP-002 root (pilot: one root) |
| **Workspace handle** | Open package root + dirty/readiness flags — not a content model |
| **Partner / Project UI** | Optional lifecycle labels **referencing** package root; no duplicate media/CSV |
| **Authoring surface** | Editors bound to HP files (CSV rows, media paths, plans) |
| **Validation** | HP-002 rules + `importBuilderHousePackage` / geometry checks |
| **Publish** | Node bridge → optional `publish:floorplan-geometry` → `pnpm embed:publish` |
| **Preview** | Load same HP via object-house projection + Shared Runtime (no stub as required path) |

### 2.2 Host constraint (not a parallel model)

Browser cannot write disk or run `embed:publish`.  
Builder **dev host** (Vite middleware / local Node agent) exposes:

- `GET/PUT` package files under the canonical root  
- `POST /publish` → existing scripts only  

No second package format; host is I/O only.

### 2.3 What Builder edits (directly)

| HP-002 artifact | Builder surface |
| --- | --- |
| `rooms.csv` | Rooms / floors editor |
| `gallery.csv` | Gallery order / room binding |
| `videos.csv` | Video provider / mediaId |
| `media/hero/*` | Hero asset |
| `media/gallery/*` | Gallery binaries |
| `media/plans/*` | Floorplan raster/SVG/author SVG/geometry (SVG workflow unchanged) |
| `manifest.json` | Legacy/extra metadata if still required by tooling — not a second SSOT for rooms/gallery |

CSV remains metadata SSOT per HP-002 §2.3–2.4.

---

## 3. Entity disposition (duplicates of HP)

### 3.1 Content / package layer — remove or demote

| Entity / service | Today | Disposition |
| --- | --- | --- |
| `ActiveProjectModel` + mock asset collections | Parallel HP content | **Odstranit** as content SSOT; replace with HP session handle |
| `AssetFile` / `AssetCollection` / `asset-service` (project buckets) | Mock metadata copies | **Nahradit** editors over real `media/` + CSV |
| `ASSET_CATEGORY_ORDER` as parallel catalog | Invented categories (pdf/docx…) | **Odstranit** or shrink to HP-002 paths only |
| `ObjectPackage.media` / `.layouts` / `.knowledge` file refs | Snapshot of mock assets | **Nahradit** reference to package root (+ optional non-content tags) or **odstranit** |
| `object-content` sync from project assets | Copies into Object | **Odstranit** |
| `ProjectManifest` / `ProjectPackage` (build) | In-memory “package” | **Odstranit** as content artifact |
| `BuildService` package/manifest generation | Mints parallel package | **Transformovat**: validate HP only; no package mint |
| `DistributionModel` / `PublishedPackage` / in-memory `PublishService` success path | Mock distribution | **Nahradit** publish result from `embed:publish` (fingerprint, docs paths) |
| `mock-data.ts` projects/assets/pipeline | Fake Harmony/Family/Villa | **Odstranit** from required open path; optional fixtures for unit tests only |
| `createStubRuntimeAdapter` as Preview SSOT | Not Embed Runtime | **Odstranit** from required Preview path |
| `object-publication` / `published-object` / `platform-publication` / `client-publication` content registries | Parallel publication models | **Odstranit** from pilot authoring path (or freeze as non-content lab) |
| `artifact-export` / export-\* package models tied to Builder Package | Parallel export formats | **Odstranit** from pilot path (no new export format) |
| `AssetManagerService` registry-only assets | Second asset registry | **Odstranit** or **nahradit** thin index over HP paths |
| `object-metadata` inventing authoring fields outside HP | Partial duplicate | **Ponechat** only fields **not** in HP-002; HP CSV/files win on conflict |
| `Experience` / scenes composer (Builder-local) | Not HP-002 | **Ponechat** as Experience authoring **only if** stored outside HP or deferred; MUST NOT become object media SSOT. Pilot: demote from package content path. |
| Knowledge / Decision / Learning / Runtime\* lab services | Not HP content | **Ponechat** as non-blocking lab UI **or** hide from pilot IA — MUST NOT gate Publish |

### 3.2 Keep (orchestration / UI, not content SSOT)

| Entity | Reason |
| --- | --- |
| Shell UI (`BuilderStudioApp`, sidebar, canvas, PublishPanel) | Presentation |
| Quality-gate / validation **reports** (as views over HP validation) | Orchestration |
| Lifecycle readiness flags (derived from HP + publish result) | Orchestration |
| Preview session state (points at published/local HP) | Orchestration |
| Node production publish bridge (new, thin) | Calls existing tooling only |

### 3.3 External packages — unchanged

| Package | Rule |
| --- | --- |
| `@embed-engine/object-house` | Sole import/project/geometry APIs |
| `@embed-engine/runtime` | Preview / meaning |
| `pnpm embed:publish` | Sole Release Snapshot path |
| HP-002 layout + SVG workflow | Unchanged |

---

## 4. Open House Package (replaces Mock Project)

```text
Builder start
  → resolve packageRoot = apps/client-studio/public/house-package
  → Node/host: importBuilderHousePackage(packageRoot)  [validate readable]
  → UI binds to CSV + media listing from that root
  → edits write back to the same files (via host)
  → Publish: validate → optional publish:floorplan-geometry → pnpm embed:publish
  → Preview: projectBuilderImportToHousePackage → Shared Runtime
```

Pilot: **one** package root (no multi-project content trees).  
Sidebar “projects” become package switches only when multiple HP roots exist later — still HP roots, not Builder Packages.

---

## 5. Publish (target)

```text
Publish click
  → HP validation (object-house import + HP-002 rules)
  → optional: pnpm --filter @embed-engine/object-house publish:floorplan-geometry
  → pnpm embed:publish
  → record Release result (fingerprint, docs/embed, docs/house-package)
  → Preview uses published / local HP artifacts (not stub)
```

Explicitly **forbidden**: Builder→HP exporter, new Package model, second publish pipeline.

---

## 6. Services — modify vs remove (pilot path)

### Modify (core path)

| Area | Change |
| --- | --- |
| `useBuilderStudioSession` | Open HP root; drop mock seed as SSOT |
| `WorkspaceCanvas` / asset sections | Bind to HP files |
| `PublishPanel` + session `publishPackage` | Call production bridge |
| `vite.config.ts` | Host middleware: file I/O + publish spawn |
| `validation` | Delegate to HP import/validate |
| `preview` | Real Runtime + HP projection |
| `package.json` (builder-studio) | Depend on `object-house` (browser + bridge); Runtime for Preview |

### Remove from pilot required path (delete or quarantine)

| Cluster | Examples |
| --- | --- |
| Mock content | `mock-data.ts` production seed, parallel asset buckets |
| Parallel package mint | `services/build/*` package/manifest mint, `services/publish/*` in-memory distribution success |
| Parallel object content | `object-content` media/layout mirrors |
| Parallel publication labs | `object-publication`, `published-object`, `platform-publication`, `client-publication`, `publication-plan`, `publication-execution`, `artifact-export`, `export-*` (pilot) |
| Stub preview | `stub-runtime-adapter` as default |

Quarantine = keep tests/lab sections behind non-default nav; must not run on Publish.

### Do not rewrite

- `packages/object-house/**` HP-002 import/geometry  
- `packages/embed/scripts/publish-release.mjs`  
- Client Studio / Manager Studio HP consumption  

---

## 7. Migration plan (incremental, non-breaking slices)

| Phase | CAP | Outcome | Builder break risk |
| --- | --- | --- | --- |
| **0** | CAP-BLD-01 (design) + ADR-023 | Architecture locked | None |
| **1** | CAP-BLD-02 | Node/Vite host: read HP root + list CSV/media in Builder UI (read-only) | Low — additive; authoring surface switched |
| **2** | CAP-BLD-03 | Editors mutate HP CSV/media texts in memory (dirty/undo/reset) | Medium — replace read-only UI |
| **3** | CAP-BLD-04 | Validation = object-house import; drop mock validation as gate | Low |
| **4** | CAP-BLD-05 | Publish bridge → geometry? → `embed:publish`; retire in-memory publish success | Medium |
| **5** | CAP-BLD-06 | Preview = Runtime + HP; remove stub from required path | Medium |
| **6** | CAP-BLD-07 | Delete/quarantine parallel package models from pilot IA | Low if behind flag |

**Rule:** each phase ships with Builder still bootable; mock path may remain until phase 4–5 cutover, then disabled.

**Commit policy:** no blanket refactor; only phase PRs that keep shell working.

---

## 8. Implementation CAPs (proposed)

1. **CAP-BLD-02 — HP Open (read-only)**  
   Wire Builder to canonical package root; show rooms/gallery/videos/plans from disk.

2. **CAP-BLD-03 — HP Edit/Save**  
   Mutate HP-002 files in place via Node host; no exporter.

3. **CAP-BLD-04 — HP Validation Gate**  
   Publish/Validate use `importBuilderHousePackage` (+ geometry checks).

4. **CAP-BLD-05 — Production Publish Bridge**  
   `embed:publish` (+ optional floorplan publish); publish result = release fingerprint.

5. **CAP-BLD-06 — Production Preview**  
   Shared Runtime over same HP; stub not required.

6. **CAP-BLD-07 — Parallel Model Retirement**  
   Remove/quarantine `ProjectPackage` mint, mock assets, parallel publication labs from pilot path.

---

## 9. Validation (end state of CAP-BLD-02…07)

| Criterion | Met when |
| --- | --- |
| HP sole content SSOT | Editors read/write `public/house-package` only |
| No Builder content model | No required use of `ProjectPackage` / mock asset collections |
| Publish uses `embed:publish` | Only release path |
| No new export format | No Builder→HP exporter |
| Builder over HP | Open = package root, not Mock Project |

**This document (CAP-BLD-01 design)** does not claim end-state PASS; it unlocks the phased CAPs above.

---

## 10. Risks / non-blockers

| Item | Notes |
| --- | --- |
| Browser I/O | Solved by Node host — not a second data model |
| Live Pages after publish | ADR-019: commit/push still operator; local `docs/` is Release Snapshot |
| `manifest.json` vs CSV | CSV wins for rooms/gallery/videos; do not revive manifest as SSOT |
| Large lab surface (~70 sections) | Quarantine; do not migrate into HP |
| Multi-package later | Multiple HP roots, still HP-002 — never Builder Package |
