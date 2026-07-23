# HP-002 — Builder House Package Input Format

| Field | Value |
| --- | --- |
| **ID** | HP-002 |
| **Title** | Builder House Package Input Format |
| **Status** | Draft → Implemented (PT-BUILDER-PACKAGE-01) |
| **Version** | 1.0 |
| **Owner** | Platform Architecture |
| **Date** | 2026-07-23 |
| **Document type** | Reference Specification (ESS-001) |
| **Normative for** | Builder Studio authoring input, partner package producers, Runtime importers |
| **Depends on** | [HP-001](./HP-001-House-Package-Specification.md) (distribution contract), [Object Package](../product/object-package.md) |
| **RFC 2119** | MUST, MUST NOT, SHOULD, MAY |
| **SSOT for** | Partner-facing folder + CSV input layout; import → registry generation rules |
| **Not SSOT for** | Client Studio UI, Decision Engine, Embed Delivery, HP-001 `house.json` on-disk distribution |

---

## 1. Purpose

HP-002 defines the **only supported partner input** for importing an object into Builder Studio / Runtime.

Partners prepare a structured package (**folders + CSV**).  
Runtime **MUST NOT** require partners to author Runtime registries, manifests, or map files by hand.

```text
Partner House Package (HP-002)
        │  import (deterministic)
        ▼
Runtime Registries + Runtime Manifest
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
| **HP-002** | **Authoring input** for Builder — CSV-driven, partner-simple |

HP-002 import **MAY** later emit or project into HP-001-compatible artifacts.  
That projection is out of scope of the partner-facing layout defined here.

---

## 2. Physical structure

```text
house-package/
├── hero/
│   ├── hero.jpg          # (or other image; name referenced by hero.csv)
│   └── hero.csv
├── gallery/
│   ├── 01.jpg
│   ├── 02.jpg
│   ├── …
│   └── (files only — no per-room subfolders required)
├── videos/
│   └── videos.csv        # NO video binary files in package
├── plans/
│   ├── P1.png
│   ├── P1.svg
│   ├── P2.png
│   ├── P2.svg
│   └── …
├── gallery.csv
└── rooms.csv
```

### Rules

1. **Hero is not part of the gallery.** Hero lives only under `hero/`.
2. **Gallery order is defined only by `gallery.csv`.** Runtime MUST NOT sort by filename.
3. **Rooms / Czech labels / floor binding are defined only by `rooms.csv`.** Runtime MUST NOT invent rooms from folder names.
4. **Videos are external.** `videos/` contains configuration only (`videos.csv`), never binary video files.
5. **Plans are paired by basename.** `P1.png` + `P1.svg` → floor `P1`. Runtime MUST pair automatically.
6. **CSV is the Single Source of Truth** for all metadata listed in this spec.

---

## 3. CSV formats

All CSV files MUST use UTF-8, comma separator, header row present.  
Empty lines MUST be ignored. Fields MUST NOT rely on filename order for semantics.

### 3.1 `hero/hero.csv`

| Column | Required | Description |
| --- | --- | --- |
| `file` | MUST | Filename under `hero/` (e.g. `hero.jpg`) |
| `title` | MAY | Optional display title |

v1 expects **exactly one** data row. Schema MUST allow additional rows later without breaking importers (importers SHOULD reject >1 row until multi-hero is specified).

Example:

```csv
file,title
hero.jpg,Hero
```

### 3.2 `gallery.csv` (package root)

| Column | Required | Description |
| --- | --- | --- |
| `order` | MUST | Integer gallery sequence (ascending). Unique. |
| `room` | MUST | Internal room id (MUST exist in `rooms.csv`) |
| `file` | MUST | Filename under `gallery/` |

Example:

```csv
order,room,file
1,exterior,01.jpg
2,exterior,02.jpg
3,living-room,03.jpg
4,kitchen,04.jpg
```

### 3.3 `rooms.csv` (package root)

| Column | Required | Description |
| --- | --- | --- |
| `floor` | MUST | Floor id matching plan basename (e.g. `P1`, `P2`) |
| `room` | MUST | Internal room id (stable, kebab-case recommended) |
| `name` | MUST | Czech display name |

Example:

```csv
floor,room,name
P1,exterior,Exteriér
P1,living-room,Obývací pokoj
P1,kitchen,Kuchyně
P2,bedroom,Ložnice
```

Runtime uses `room` to bind: navigator labels, gallery/video room scope, plan floor membership.  
Room-specific SVG overlays beyond floor `P*.svg` are not required in v1.

### 3.4 `videos/videos.csv`

| Column | Required | Description |
| --- | --- | --- |
| `order` | MUST | Integer video-layer sequence. Unique. |
| `room` | MUST | Internal room id (MUST exist in `rooms.csv`) |
| `provider` | MUST | Provider key (e.g. `wistia`) |
| `mediaId` | MUST | Provider media identifier |

Example:

```csv
order,room,provider,mediaId
1,exterior,wistia,0w5cd0e1n2
2,living-room,wistia,ab12cd34
```

Runtime MUST construct the player from `provider` + `mediaId` (no local video files).

---

## 4. Import process

```text
1. Locate package root (folder named house-package/ or provided path)
2. Require files: rooms.csv, gallery.csv, hero/hero.csv, videos/videos.csv
3. Parse CSVs → validate headers + types
4. Validate referenced files exist under hero/, gallery/
5. Validate every gallery/video room id ∈ rooms.csv
6. Discover plans/: for each unique Pn, require Pn.png + Pn.svg
7. Validate every rooms.csv floor ∈ discovered plan ids
8. Generate registries (deterministic order)
9. Generate Runtime Manifest summarizing registries
```

### Determinism

Given identical package bytes, import MUST produce identical registry contents  
(same ids, same ordering by CSV `order` / stable secondary keys).

### Errors

Import MUST fail closed on:

- missing required CSV / header
- duplicate `order` or duplicate `room` id
- missing asset file
- unknown `room` reference
- floor without matching plan pair
- plan file without partner PNG/SVG

---

## 5. Generated Runtime registries

These artifacts are **not** authored by the partner.  
They are produced by the importer:

| Registry | Contents |
| --- | --- |
| **Hero Registry** | Hero media entries from `hero.csv` + resolved paths |
| **Gallery Registry** | Ordered stills from `gallery.csv` (order, room, file, path) |
| **Room Registry** | Rooms from `rooms.csv` (floor, room id, Czech name) |
| **Floor Registry** | Floors from `plans/` pairs (`P1` → png + svg paths) |
| **SVG Registry** | Floor SVG paths keyed by floor id (from plans) |
| **Video Registry** | Ordered external videos from `videos.csv` |
| **Runtime Manifest** | Package format version + pointers/summaries of all registries |

### Non-goals for v1 registries

- Decision / Priority configuration
- Embed Delivery URLs
- Behavior Packs / Interpretation

---

## 6. Architectural principles (normative)

1. Hero is **not** gallery.
2. Gallery sequence is **only** `gallery.csv`.
3. Room identity / naming is **only** `rooms.csv`.
4. Runtime MUST NOT infer order from filenames.
5. Runtime MUST NOT infer rooms from directory layout.
6. CSV is metadata SSOT.
7. House Package (HP-002) is the Builder authoring input.
8. Runtime derives all listed registries automatically on import.

---

## 7. Conformance checklist

- [ ] Partner can assemble package without Runtime knowledge
- [ ] Import is deterministic
- [ ] Experience media/rooms/plans/videos can be bound from generated registries alone
- [ ] No hand-written Runtime registry files in the partner package

---

## 8. Document control

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 2026-07-23 | Initial Builder input format (PT-BUILDER-PACKAGE-01) |
