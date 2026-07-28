# EPIC-BLD-02 — Workspace Report

**Status:** Ready for architecture review  
**Commit:** not created (awaiting approval)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Project Workspace & Asset Management is runnable on top of BLD-01 Foundation. Builder manages project knowledge content (media / layout / knowledge) via mock application services. No Runtime interpretation, no persistence, no Build / Publish pipeline.

---

## Created / extended components

### UI
- `AssetCard` — unified card (name, state, file count, actions, drag & drop placeholder)
- `AssetFileList` — name, size, date, metadata label edit, remove
- `AssetStateBadge` — Empty / Loading / Ready / Error
- `UiStatePanel` — presentational state shells
- `MediaSection` / `LayoutSection` / `KnowledgeSection` — wired to Asset Cards
- `WorkspaceCanvas` — Active Project model + section switching

### Model
- `ActiveProjectModel` — metadata + assets (media / layout / knowledge)
- `AssetCollection` / `AssetFile` / `AssetMetadata`
- `AssetUiState`, category ids (`photographs`, `video`, `hero`, `svg`, `csv-rooms`, `csv-images`, `floorplan`, `pdf`, `docx`, `xlsx`)
- `asset-catalog.ts` — category definitions + empty collection factory

### Asset Services
- `createAssetService()`
  - `addAsset()`
  - `removeAsset()`
  - `updateMetadata()`
  - `getActiveProject()` / `ensureProject()`
- `WorkspaceService` extended to delegate asset mutations for the Active Project

---

## Active Project Model

```
ActiveProjectModel
 ├─ projectId
 ├─ record (registry metadata)
 ├─ metadata (title, partner, location, notes)
 └─ assets
     ├─ media[]      photographs | video | hero
     ├─ layout[]     svg | csv-rooms | csv-images | floorplan
     └─ knowledge[]  pdf | docx | xlsx
```

No Runtime fields.

---

## Implemented sections

| Section | Categories | Notes |
| --- | --- | --- |
| Média | Fotografie, Video, Hero | file list, upload mock, remove, metadata |
| Dispozice | SVG, CSV Rooms, CSV Images, Floorplan | UI + mock ops |
| Znalosti | PDF, DOCX, XLSX | name / size / date + metadata |

UI states on collections: **Empty / Loading / Ready / Error** (Villa 168 seed shows Loading/Error for review).

---

## Navigation state

- Switching Média ↔ Dispozice ↔ Znalosti only changes `activeSection` in the session hook.
- Asset mutations stay in the in-memory Asset Service — Workspace content is preserved.
- Switching projects preserves the selected section (no reset to Média).

---

## Screenshot

`apps/builder-studio/docs/bld-02-workspace-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| `pnpm --filter @embed-engine/builder-studio typecheck` | pass |
| `pnpm --filter @embed-engine/builder-studio test` | pass (12) |
| `pnpm --filter @embed-engine/builder-studio build` | pass |

### Tests
- `asset-service.test.ts` — load mock, add/remove, update metadata, ensure empty project
- `workspace-service.test.ts` — active model, switch project, create empty assets, mutate via workspace
- existing registry tests unchanged

---

## Deviations

1. **Upload** is a mock action (generates a placeholder filename) — no real filesystem / File API persistence.
2. **Drag & drop** triggers the same mock `addAsset()`; files are not read from disk.
3. **Metadata editing** currently exposes label in the list UI (description/alt exist on the model/service).
4. **Section navigation** shows one section at a time (cleaner for dense Asset Cards) instead of long scroll of all three.
5. Publish Panel readiness % remain static mock from BLD-01 — not recomputed from asset counts (Build Pipeline out of scope).

---

## Out of scope (confirmed absent)

- Runtime interpretation
- Build Pipeline
- Publish Pipeline
- Persistence / API
- Real binary upload storage

---

## Next

Await architecture review. After approval: commit **EPIC-BLD-02**, then proceed to **EPIC-BLD-03 – Build Pipeline**.
