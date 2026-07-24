# HP-002 — Builder House Package Input Format

| Field | Value |
| --- | --- |
| **ID** | HP-002 |
| **Title** | Builder House Package Input Format |
| **Status** | **Final — Locked SSOT** (PT-BUILDER-PACKAGE-02) |
| **Version** | 1.1 |
| **Owner** | Platform Architecture |
| **Date** | 2026-07-24 |
| **Document type** | Reference Specification (ESS-001) |
| **Normative for** | Builder Studio authoring input, partner package producers, Runtime importers |
| **Depends on** | [HP-001](./HP-001-House-Package-Specification.md) (distribution contract), [Object Package](../product/object-package.md) |
| **RFC 2119** | MUST, MUST NOT, SHOULD, MAY |
| **SSOT for** | Builder House Package physical layout, CSV metadata, import → registry rules |
| **Not SSOT for** | Client Studio UI, Decision Engine, Embed Delivery, hand-edited Runtime registries, HP-001 `house.json` distribution encoding |

---

## 0. Terminology (normative)

**Builder House Package** (this specification) is the **authoring Object Package**:  
the partner-facing, CSV-driven package from which Runtime **deterministically** creates internal registries and the Runtime Manifest.

It is the **only** supported authoring input for object import into Builder Studio / Runtime.

HP-002 is **locked** as the long-term SSOT for that input format.  
Changes require an explicit specification revision — not ad-hoc Runtime or UI conventions.

---

## 1. Purpose

Partners prepare a structured package (**folders + CSV**).  
Runtime **MUST NOT** require partners to author Runtime registries, manifests, or map files by hand.

```text
Builder House Package (HP-002)   ← authoring Object Package
        │  import (deterministic)
        ▼
Runtime Registries + Runtime Manifest   ← internal only
        │
        ▼
Experience / Client Studio binding
```

Builder Studio **MUST NOT** create Runtime artifacts directly during authoring.  
It **MUST** produce / accept an HP-002 package; import generates internals.

### Relationship to HP-001

| Spec | Role |
| --- | --- |
| **HP-001** | Distribution / logical Object Package encoding (`house.json`, assets) |
| **HP-002** | **Authoring** Object Package for Builder — CSV-driven, partner-simple |

HP-002 import **MAY** later emit or project into HP-001-compatible artifacts.  
That projection is out of scope of the partner-facing layout defined here.

---

## 2. Physical structure (repository)

### 2.1 Canonical location

| Role | Path |
| --- | --- |
| **Package root** | `apps/client-studio/public/house-package/` |
| **Runtime media root** | `apps/client-studio/public/house-package/media/` |

CSV metadata files live at the **package root**.  
Binary / vector media live under **`media/`**.

### 2.2 Layout

```text
apps/client-studio/public/
└── house-package/
    ├── gallery.csv
    ├── rooms.csv
    ├── videos.csv
    └── media/
        ├── hero/
        │   └── hero.webp
        ├── gallery/
        │   ├── 01.webp
        │   ├── 02.webp
        │   └── …
        ├── plans/
        │   ├── p1.webp
        │   ├── p1.svg
        │   ├── p2.webp
        │   ├── p2.svg
        │   └── …
        └── videos/
```

### 2.3 Rules

1. **Hero is not part of the gallery.** Hero lives only under `media/hero/`.
2. **Gallery order is defined only by `gallery.csv`.** Runtime MUST NOT sort by filename.
3. **Rooms / Czech labels / floor binding are defined only by `rooms.csv`.** Runtime MUST NOT invent rooms from folder names.
4. **`media/videos/`** is the logical home of the video layer. Physical video binaries are **not** expected when the provider uses external hosting (e.g. Wistia). Configuration is **`videos.csv`** at package root.
5. **Plans are paired by basename.** `p1.webp` + `p1.svg` → floor `p1`. Runtime MUST pair automatically from the pair, not from directory nesting of rooms.
6. **CSV is the Single Source of Truth** for all metadata listed in this spec.

### 2.4 Metadata derivation ban (normative)

Runtime **MUST NOT** derive metadata from filenames or directory structure.

The **only** sources of truth for package metadata are:

- `gallery.csv`
- `rooms.csv`
- `videos.csv`

Filenames identify assets referenced **by** those CSVs (and plan basename pairing for `media/plans/`).  
They MUST NOT invent order, room identity, Czech names, or provider bindings.

---

## 3. CSV formats

All CSV files MUST use UTF-8, comma separator, header row present.  
Empty lines MUST be ignored. Fields MUST NOT rely on filename order for semantics.

Column schemas below are **stable**. Path prefixes follow §2 (`media/…`).

### 3.1 Hero (no gallery CSV row)

Hero is **not** configured in `gallery.csv`.

| Rule | Requirement |
| --- | --- |
| Separation | Hero **MUST NOT** be treated as a gallery entry |
| Experience | Hero is a **standalone Experience** surface |
| Media type | Hero **MAY** be a photograph or a video in the future |
| v1 asset | Typical file: `media/hero/hero.webp` (name may vary; binding is by package convention / future Hero metadata, never via gallery order) |

### 3.2 `gallery.csv` (package root)

| Column | Required | Description |
| --- | --- | --- |
| `order` | MUST | Integer gallery sequence (ascending). Unique. |
| `room` | MUST | Internal room id (MUST exist in `rooms.csv`) |
| `file` | MUST | Filename under `media/gallery/` |

Example:

```csv
order,room,file
1,exterior,01.webp
2,exterior,02.webp
3,living-room,03.webp
4,kitchen,04.webp
```

### 3.3 `rooms.csv` (package root)

| Column | Required | Description |
| --- | --- | --- |
| `floor` | MUST | Floor id matching plan basename (e.g. `p1`, `p2`) |
| `room` | MUST | Internal room id (stable, kebab-case recommended) |
| `name` | MUST | Czech display name |
| `area` | MUST | Usable area in m² (decimal allowed; Czech `,` or `.`) |

Example:

```csv
floor,room,name,area
p1,exterior,Exteriér,0
p1,living-room,Obývací pokoj,32
p1,kitchen,Kuchyně,14
p2,bedroom,Ložnice,18.4
```

Runtime uses `room` to bind: navigator labels, gallery/video room scope, plan floor membership.  
`area` projects into Runtime room facts for Tour room list display.  
Room-specific SVG overlays beyond floor `p*.svg` are not required in v1.

### 3.4 `videos.csv` (package root)

| Column | Required | Description |
| --- | --- | --- |
| `order` | MUST | Integer video-layer sequence. Unique. |
| `room` | MUST | Internal room id (MUST exist in `rooms.csv`) |
| `provider` | MUST | Provider key — **open enum** (see §3.5) |
| `mediaId` | MUST | Provider media identifier |

Example:

```csv
order,room,provider,mediaId
1,exterior,wistia,0w5cd0e1n2
2,living-room,youtube,dQw4w9WgXcQ
```

Runtime MUST construct the player from `provider` + `mediaId`.  
When `provider` is an external host, no binary under `media/videos/` is required.

### 3.5 Video providers (open enum)

`provider` is an **open enum**. Known values include (non-exhaustive):

| Provider | Meaning |
| --- | --- |
| `wistia` | Wistia-hosted media |
| `youtube` | YouTube |
| `vimeo` | Vimeo |
| `mux` | Mux |
| `local` | Package-local / Runtime-resolved local media |

Importers and players **MUST NOT** be hard-wired solely to Wistia.  
Unknown providers SHOULD fail closed or degrade per Runtime policy, without rewriting CSV schemas.

---

## 4. Import process

```text
1. Locate package root (apps/client-studio/public/house-package/ or provided path)
2. Require files: rooms.csv, gallery.csv, videos.csv
3. Parse CSVs → validate headers + types
4. Validate referenced gallery files exist under media/gallery/
5. Validate Hero asset under media/hero/ (standalone; not gallery)
6. Validate every gallery/video room id ∈ rooms.csv
7. Discover media/plans/: for each unique pn, require pn.webp + pn.svg (basename pair)
8. Validate every rooms.csv floor ∈ discovered plan ids
9. Generate registries (deterministic order)
10. Generate Runtime Manifest summarizing registries
```

### Determinism

Given identical package bytes, import MUST produce identical registry contents  
(same ids, same ordering by CSV `order` / stable secondary keys).

### Errors

Import MUST fail closed on:

- missing required CSV / header
- duplicate `order` or duplicate `room` id
- missing asset file referenced by CSV
- unknown `room` reference
- floor without matching plan pair
- plan file without partner webp/svg

---

## 5. Generated Runtime registries

Runtime registries are **internal artifacts** created at import time.

They are **not** part of the Builder House Package.  
They **MUST NEVER** be hand-edited by partners or as a substitute for CSV authoring.

| Registry | Contents |
| --- | --- |
| **Hero Registry** | Standalone Hero Experience entry (asset under `media/hero/`) |
| **Gallery Registry** | Ordered stills from `gallery.csv` (order, room, file, path) |
| **Room Registry** | Rooms from `rooms.csv` (floor, room id, Czech name) |
| **Floor Registry** | Floors from `media/plans/` pairs (`p1` → webp + svg paths) |
| **SVG Registry** | Floor SVG paths keyed by floor id (from plans) |
| **Video Registry** | Ordered videos from `videos.csv` (`provider` open enum + `mediaId`) |
| **Runtime Manifest** | Package format version + pointers/summaries of all registries |

### Non-goals for v1 registries

- Decision / Priority configuration
- Embed Delivery URLs
- Behavior Packs / Interpretation

---

## 6. Architectural principles (normative)

1. **Builder House Package** is the authoring Object Package; Runtime derives registries deterministically.
2. Hero is **not** gallery; Hero is a **standalone Experience**; Hero **MAY** be photo or video later.
3. Gallery sequence is **only** `gallery.csv`.
4. Room identity / naming is **only** `rooms.csv`.
5. Video bindings are **only** `videos.csv`; `provider` is an **open enum**.
6. Runtime **MUST NOT** derive metadata from filenames or directory structure (§2.4).
7. Runtime **MUST NOT** infer order from filenames.
8. Runtime **MUST NOT** infer rooms from directory layout.
9. CSV trio (`gallery.csv`, `rooms.csv`, `videos.csv`) is metadata SSOT.
10. Runtime registries are import outputs only — never hand-maintained package content.
11. HP-002 is the **locked SSOT** for Builder House Package input.

---

## 7. Conformance checklist

- [x] Physical structure documented at `apps/client-studio/public/house-package/`
- [x] Runtime media root documented at `…/house-package/media/`
- [x] Metadata derivation ban explicit
- [x] Hero / gallery separation and future media types explicit
- [x] Video `provider` open enum documented
- [x] Runtime registries marked internal / non-editable
- [x] Terminology: authoring Object Package → deterministic registries
- [ ] Partner can assemble package without Runtime knowledge
- [ ] Import is deterministic
- [ ] Experience bound from generated registries alone
- [ ] No hand-written Runtime registry files in the partner package

---

## 8. Document control

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 2026-07-23 | Initial Builder input format (PT-BUILDER-PACKAGE-01) |
| 1.1 | 2026-07-24 | Finalize as locked SSOT: repo paths, media root, derivation ban, Hero Experience, open providers, registry policy (PT-BUILDER-PACKAGE-02) |
