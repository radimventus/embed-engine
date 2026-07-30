# HP-003 — FloorPlan Geometry Contract

| Field | Value |
| --- | --- |
| **ID** | HP-003 |
| **Title** | FloorPlan Geometry Contract |
| **Status** | **Implemented** (CAP-HP-003) |
| **Version** | 0.1 |
| **Owner** | Platform Architecture |
| **Date** | 2026-07-30 |
| **Document type** | Reference Specification (ESS-001) |
| **Normative for** | Builder publish of floorplan geometry, House Package distribution, Experience House Navigator Input Adapter |
| **Depends on** | [HP-001](./HP-001-House-Package-Specification.md), [HP-002](./HP-002-Builder-House-Package-Input.md), [ADR-013](../architecture/adr/ADR-013-room-selection-semantic.md) |
| **Related** | PT-HP-003-001, PT-SVG-01, PT-SVG-02, CONCEPT-Room-Mask-Generator |
| **RFC 2119** | MUST, MUST NOT, SHOULD, MAY |
| **SSOT for** | Room SVG (`room-*.svg`) → publish-derived geometry → House Navigator consumption |
| **Not SSOT for** | Decision Runtime algorithms, Client Studio chrome, AI, Priority Experience, raster visual layer |

---

## 0. Purpose

Partners and Builder authors MUST be able to update **Room SVG** sources and, after publish, automatically refresh:

1. **clickable regions** (geometry),
2. **room binding** (stable `roomId` ↔ region),
3. optionally align the **visible floorplan** raster when the visual underlay drifts.

Experience and Runtime MUST NOT carry hand-maintained TypeScript hotspot tables
(e.g. today’s `referenceFloorPlanGeometry.ts`).

```text
Room SVG (room-*.svg)          ← canonical geometry source
        │
        ▼  publish pipeline
   pN.rooms / pN.author.svg / pN.geometry.json
        │
        │              pN.webp (visual underlay only)
        │                     │
        └──────────┬──────────┘
                   ▼
             House Package
                   ▼
      House Navigator (Experience Input Adapter)
                   ▼
         selectRoom(roomId)  →  Decision Runtime
```

This aligns with ADR-013: Runtime consumes **semantic `RoomId` only**. Geometry stays in the Package / Experience adapter layer.

Normative authority for geometry is defined in **§1 Canonical SVG Geometry Rule**.

---

## 1. Canonical SVG Geometry Rule (PT-HP-003-001)

Interactive floorplan geometry is **not** hand-authored in TypeScript and is **not** derived from the raster floorplan. Geometry is produced exclusively from authoritative Room SVG. That is the single source of truth for room regions in the House Package.

### 1.1 Canonical source

The **only** authoritative source of room geometry is Room SVG stored under:

```text
apps/client-studio/public/house-package/media/plans/
```

in the form:

```text
room-*.svg
```

Examples:

```text
room-kitchen.svg
room-living.svg
room-bed.svg
…
```

These files MUST be treated as the canonical geometry SSOT. All published geometry artifacts MUST be regenerable from them via the standard publish pipeline.

### 1.2 Derived artifacts

The following files are **derived artifacts** and MUST NEVER be edited by hand:

| Artifact | Role |
| --- | --- |
| `pN.rooms/` | Normalized per-room SVG inputs for publish (e.g. `p1.rooms/`) |
| `pN.author.svg` | Aggregated authoring SVG consumed by the Geometry Extractor |
| `pN.geometry.json` | Published machine contract for hit-testing / Navigator regions |

They MUST arise **exclusively** from the publish pipeline. Manual edits to derived artifacts are non-normative and MUST be discarded on the next publish.

### 1.3 Raster

The file:

```text
pN.webp
```

(for example `p1.webp`) is **not** a source of geometry.

It is a **visual underlay** only — the visible floorplan behind interactive regions. Raster MUST NOT be used to invent, correct, or override room polygons.

### 1.4 Conflict resolution

If there is disagreement among:

- Room SVG (`room-*.svg`)
- `pN.geometry.json`
- `pN.author.svg`
- `pN.webp`

the following **authority order** MUST apply (highest first):

1. **Room SVG**
2. **`pN.author.svg`**
3. **`pN.geometry.json`**
4. **`pN.webp`**

Lower-ranked artifacts MUST be treated as stale when they conflict with a higher-ranked source. Resolution is: correct the highest applicable source (normally Room SVG), then re-run publish so derived artifacts catch up. Raster never wins a geometry conflict.

### 1.5 Maintenance rule

If a clickable region does not match the visual floorplan:

- MUST NOT edit geometry by hand,
- MUST NOT edit `geometry.json`,
- MUST NOT edit `author.svg`.

When Room SVG is correct, maintainers MUST adjust only the **raster underlay** (`pN.webp`) so the visual aligns with the authoritative geometry — not the reverse.

If Room SVG is wrong, fix the Room SVG and re-publish; do not patch derived files.

### 1.6 Publish rule

Every change to Room SVG MUST be followed by the standard publish pipeline.

Publish MUST regenerate:

- `pN.rooms`
- `pN.author.svg`
- `pN.geometry.json`

(and MAY refresh raster only when explicitly exporting a design raster that shares the geometry `viewBox` — raster remains visual, not geometric authority).

---

## 2. FloorPlan Geometry Contract (summary)

| Layer | Artifact | Role |
| --- | --- | --- |
| **Canonical geometry SSOT** | `media/plans/room-*.svg` (§1) | Authoritative room shapes; human-edited source |
| **Derived room set** | `media/plans/pN.rooms/` | Publish input; MUST NOT hand-edit |
| **Derived authoring SVG** | `media/plans/pN.author.svg` (or legacy `pN.svg` — §3) | Aggregated shapes for Geometry Extractor; MUST NOT hand-edit |
| **Published geometry** | `media/plans/pN.geometry.json` | Machine contract for hotspots / hit-testing; MUST NOT hand-edit |
| **Published raster** | `media/plans/pN.webp` (or `.png`) | Visual underlay under Navigator — **not** geometry SSOT |
| **Room registry** | `rooms.csv` (`room` column) | Canonical room identity (HP-002) |
| **Experience** | reads Package geometry + raster | Input Adapter → `RoomId` |
| **Decision Runtime** | `selectRoom(roomId)` only | MUST NOT parse SVG or geometry |

**Invariant:** Updating Room SVG + re-publish MUST refresh derived geometry artifacts without editing application TypeScript. Raster may be updated independently as a visual layer when geometry is already correct (§1.5).

---

## 3. SVG Contract (authoring)

### 3.1 File placement

| Path | Requirement |
| --- | --- |
| `media/plans/room-*.svg` | MUST — canonical geometry SSOT (§1); publish input |
| `media/plans/pN.rooms/` | MUST after publish — derived per-room set; MUST NOT hand-edit |
| `media/plans/pN.author.svg` | MUST after publish — derived aggregated authoring SVG; MUST NOT hand-edit |
| `media/plans/pN.svg` | MAY — legacy alias; if present without `.author.svg`, Builder MUST treat it as authoring **only when** it contains room elements (§3.3). Empty stub SVGs (e.g. empty `viewBox`) MUST FAIL validation. |

Naming `pN` MUST match HP-002 plan basenames and `rooms.csv` `floor` values (`p1`, `p2`, …).

### 3.2 Canvas

Authoring SVG MUST declare a single root:

```xml
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 {WIDTH} {HEIGHT}"
     data-floor="p1"
     data-hp003="1">
  …
</svg>
```

| Attribute | Requirement |
| --- | --- |
| `viewBox` | MUST — pixel space shared by geometry and raster export |
| `data-floor` | MUST — equals plan id (`p1`, …) |
| `data-hp003` | MUST — contract version marker (`1` for this revision) |

`WIDTH` × `HEIGHT` SHOULD equal the natural pixel size of the exported raster.

### 3.3 Room elements

Each interactive room MUST be represented by **exactly one** shape element:

- allowed tags: `path`, `polygon`, `rect`
- forbidden for hit regions: nested groups without a room attribute, text, dimensions, furniture detail (those MAY exist but MUST NOT carry room binding)

**Required attributes (normative):**

| Attribute | Requirement | Meaning |
| --- | --- | --- |
| `data-room` | MUST | Canonical room id — **MUST equal** `rooms.csv` `room` |
| `id` | SHOULD | Same as `data-room` (tooling / a11y); if both set, `data-room` wins |

**Optional:**

| Attribute | Meaning |
| --- | --- |
| `data-room-label` | Display hint for Builder preview only (Runtime uses CSV `name`) |
| `data-interactive` | `"true"` \| `"false"` — default `true` |

### 3.4 Example

```xml
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 2790 1938"
     data-floor="p1"
     data-hp003="1">
  <path
    id="living-room"
    data-room="living-room"
    d="M1601 340h793v520h-793z" />
  <rect
    id="kitchen"
    data-room="kitchen"
    x="1601" y="880" width="793" height="280" />
</svg>
```

### 3.5 Why `data-room` (not `id` alone)

1. SVG `id` collides with defs/clipPaths and export tools rename ids.
2. `data-room` is an explicit HP-003 binding to HP-002 `rooms.csv`.
3. Matches ADR-013: graphic identity is an adapter mapping onto registry `RoomId`.

---

## 4. Publish pipeline

Responsibility: **Builder / package publish** (not Decision Runtime, not Client Studio TS).

Canonical input is Room SVG (§1). Derived geometry artifacts MUST be regenerated by publish; they MUST NOT be hand-edited.

```text
Room SVG (media/plans/room-*.svg)   ← canonical geometry SSOT (§1)
      │
      ▼  publish
pN.rooms/  →  pN.author.svg
                    │
                    ▼
           Geometry Extractor          ← Builder publish step
                    │
                    └─► pN.geometry.json

pN.webp                             ← visual underlay only (not geometry SSOT)
```

| Step | Input | Output | Owner |
| --- | --- | --- | --- |
| **0. Aggregate Room SVG** | `media/plans/room-*.svg` | `pN.rooms/`, `pN.author.svg` | Builder publish |
| **1. Validate authoring SVG** | `pN.author.svg`, `rooms.csv` | pass / fail diagnostics | Builder |
| **2. Geometry Extractor** | derived authoring SVG | `pN.geometry.json` | Builder publish |
| **3. Raster (optional / sibling)** | design raster sharing geometry `viewBox` | `pN.webp` (visual only) | Builder / design |
| **4. Package assemble** | geometry + raster + CSV | HP-002 (+ HP-003 files) | Builder / sync |
| **5. Experience consume** | Package URLs | FloorPlan + hit-test | House Navigator |
| **6. Runtime command** | `RoomId` | Decision Session | Runtime |

Raster MAY be produced by:

- rasterizing an authoring SVG composite, or
- exporting a sibling design file that **MUST** share the same `viewBox` dimensions.

Raster remains a **visual underlay** (§1.3). It MUST NOT become a geometry source. If raster and geometry viewBoxes differ, publish MUST FAIL.

---

## 5. `geometry.json` Contract

Path: `media/plans/pN.geometry.json`

### 5.1 Schema (normative shape)

```json
{
  "schema": "hp-003-floorplan-geometry",
  "schemaVersion": "1.0",
  "floorId": "p1",
  "viewBox": { "width": 2790, "height": 1938 },
  "units": "px",
  "rooms": [
    {
      "roomId": "living-room",
      "interactive": true,
      "bbox": { "x": 1601, "y": 340, "width": 793, "height": 520 },
      "polygon": [
        [1601, 340],
        [2394, 340],
        [2394, 860],
        [1601, 860]
      ]
    }
  ]
}
```

| Field | Requirement |
| --- | --- |
| `schema` | MUST — literal `hp-003-floorplan-geometry` |
| `schemaVersion` | MUST — semver string; v1.0 for this contract |
| `floorId` | MUST — matches `pN` / `rooms.csv` floor |
| `viewBox.width` / `height` | MUST — integers > 0 |
| `units` | MUST — `px` for v1 |
| `rooms[].roomId` | MUST — equals `rooms.csv` `room` |
| `rooms[].interactive` | SHOULD — default `true` |
| `rooms[].bbox` | MUST — axis-aligned bounds in viewBox space |
| `rooms[].polygon` | SHOULD — closed ring; if omitted, Navigator MUST use `bbox` for hit-test |

**v1 hit-test:** Experience MUST support `bbox`; SHOULD support `polygon` when present (point-in-polygon).

### 5.2 Non-goals for v1

- 3D / multi-layer z-order beyond document order
- Per-room decorative overlay SVGs (legacy `decision-canvas`) — out of HP-003 scope
- Encoding Decision semantics in geometry

---

## 6. Builder Contract

### 6.1 SVG validation (MUST)

Builder publish MUST fail if:

| Code | Condition |
| --- | --- |
| `HP003_SVG_MISSING` | No authoring SVG for a floor referenced by `rooms.csv` |
| `HP003_SVG_EMPTY` | SVG has no `data-room` elements |
| `HP003_SVG_BAD_FLOOR` | `data-floor` ≠ plan basename |
| `HP003_SVG_NO_VIEWBOX` | Missing / invalid `viewBox` |
| `HP003_ROOM_UNBOUND` | `data-room` value ∉ `rooms.csv` `room` set |
| `HP003_ROOM_DUP` | Duplicate `data-room` on same floor |
| `HP003_CSV_NO_GEOMETRY` | `rooms.csv` room on floor `pN` has no `data-room` element (for interactive rooms — see §6.3) |
| `HP003_VIEWBOX_MISMATCH` | Exported raster size ≠ geometry `viewBox` |

### 6.2 `rooms.csv` validation (extends HP-002)

| Rule | Behaviour |
| --- | --- |
| Every `floor` value MUST have plan pair geometry + raster after publish | FAIL |
| Every interactive room on a floor SHOULD have SVG geometry | FAIL for rooms intended for Navigator click (§5.3) |
| Geometry `roomId` not in CSV | FAIL (`HP003_ROOM_UNBOUND`) |
| CSV room without geometry | FAIL or WARN per policy (§5.3) |

### 6.3 Missing / unused geometry policy

| Case | Default (pilot) |
| --- | --- |
| CSV room, no SVG element | **FAIL** for rooms with `area > 0` on that floor; **WARN** for zero-area placeholders (e.g. `exterior`) |
| SVG `data-room`, no CSV row | **FAIL** |
| Geometry generated but unused floor | **FAIL** if floor not in CSV |

Builder UI SHOULD list both directions of mismatch before publish.

---

## 7. Runtime / Experience Contract

### 7.1 Decision Runtime

Decision Runtime MUST NOT:

- import SVG,
- read `geometry.json`,
- store hotspot coordinates.

Public command remains:

```text
selectRoom(roomId: string)
```

### 7.2 Experience / House Package projection (public interface)

Replace today’s hardcoded regions with Package-backed geometry.

**Conceptual House Package surface (Experience-facing):**

```ts
type FloorPlanGeometryRoom = {
  readonly roomId: string;
  readonly interactive: boolean;
  readonly bbox: { x: number; y: number; width: number; height: number };
  readonly polygon?: ReadonlyArray<readonly [number, number]>;
};

type FloorPlanGeometry = {
  readonly floorId: string;
  readonly viewBox: { width: number; height: number };
  readonly rooms: readonly FloorPlanGeometryRoom[];
  readonly rasterUrl: string; // resolved /house-package/media/plans/pN.webp
};

// On projected Experience Context (names illustrative):
// context.floorPlan.src          ← rasterUrl
// context.floorPlan.viewBox*     ← geometry.viewBox
// context.floorPlan.rooms[].floorPlanRegion ← from geometry.bbox (or polygon→bbox)
```

Experience MUST load `pN.geometry.json` (+ raster) via Package / `assetBase` URLs.  
Experience MUST map hit → `roomId` → `selectRoom(roomId)`.

### 7.3 Forbidden after migration

- `referenceFloorPlanGeometry.ts` (or any app-local hotspot table) as production SSOT
- Silent fallback to empty hotspots when geometry file is missing in production builds (MUST surface package error)

---

## 8. Migration plan (pilot-safe)

| Stage | State | Pilot impact |
| --- | --- | --- |
| **M0 — Today** | Raster `pN.webp` + TS `REFERENCE_FLOORPLAN_REGIONS` | Superseded |
| **M1 — Publish geometry** | Builder emits `pN.geometry.json` from authoring SVG | Done |
| **M2 — Dual-read** | Experience prefers `geometry.json`; falls back to TS if absent | Skipped (went package-only) |
| **M3 — Package-only** | Experience requires geometry for floors with plans; TS unused | Done |
| **M4 — Remove TS** | Delete `referenceFloorPlanGeometry.ts` | Done |

**Minimal first publish without full SVG authoring:**  
Export current TS regions once into `p1.geometry.json` (bootstrap), then move authoring to SVG and regenerate — pilot never depends on empty stub `p1.svg`.

---

## 9. Capability registration (roadmap)

Suggested CAP id: **CAP-HP-003** — FloorPlan Geometry Publish.

Sub-capabilities:

| ID | Scope |
| --- | --- |
| CAP-HP-003.1 | Authoring SVG schema + Builder validation |
| CAP-HP-003.2 | Geometry Extractor → `geometry.json` |
| CAP-HP-003.3 | Raster export bound to viewBox |
| CAP-HP-003.4 | Experience dual-read → package-only |
| CAP-HP-003.5 | Remove TS hotspot freeze |

Room Mask Generator concept (`CONCEPT-Room-Mask-Generator.md`) MAY feed authoring SVG / masks as an upstream Builder tool; HP-003 remains the **published** contract.

---

## 10. Validation answers (PT-HP-003)

| Question | Answer |
| --- | --- |
| What is the canonical geometry source? | Room SVG `media/plans/room-*.svg` (§1); authority order Room SVG → author.svg → geometry.json → webp |
| Are `pN.rooms/`, `pN.author.svg`, `pN.geometry.json` hand-editable? | **No** — derived publish artifacts only (§1.2) |
| Is `pN.webp` a geometry source? | **No** — visual underlay only (§1.3) |
| How must derived authoring SVG look? | `media/plans/pN.author.svg` with `viewBox`, `data-floor`, room shapes carrying `data-room` |
| Required room attributes? | **`data-room`** (= `rooms.csv` `room`); `id` SHOULD match |
| How does `geometry.json` arise? | Builder Geometry Extractor at publish from derived authoring SVG (itself from Room SVG) |
| How does Builder check SVG ↔ CSV? | Bidirectional: unbound `data-room`, missing geometry for interactive CSV rooms, viewBox/raster mismatch → FAIL |
| How does Runtime avoid hardcoded TS? | Runtime never loads geometry; Experience reads Package `geometry.json` + raster |
| Click area ≠ visual plan, SVG correct? | Adjust raster only — never patch geometry / author / geometry.json (§1.5) |
| Migration without breaking pilot? | M1 emit JSON → M2 dual-read → M3 require package → M4 delete TS |

---

## 11. Status

**Implemented** (CAP-HP-003 + PT-HP-003-001). Room SVG → publish (`pN.rooms` / `pN.author.svg` / `pN.geometry.json`) → House Package → Experience House Navigator. Raster (`pN.webp`) is visual underlay only. Decision Runtime remains `selectRoom(roomId)` only (ADR-013).
