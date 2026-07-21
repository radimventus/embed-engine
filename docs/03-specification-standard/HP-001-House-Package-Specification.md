# HP-001 — House Package Specification

| Field | Value |
| --- | --- |
| **ID** | HP-001 |
| **Title** | House Package Specification |
| **Status** | Proposed → **APPROVED (v0.1)** |
| **Version** | 0.1 |
| **Date** | 2026-07-21 |
| **Normative for** | House Package producers and consumers (loaders, exporters, importers, Client Studio authoring) |
| **Depends on** | [Object Package — Product Contract](../product/object-package.md), [ESS-001](./ESS-001-Embed-Specification-Standard.md), [Architecture Freeze v0.1](../releases/Architecture%20Freeze%20v0.1.md) |
| **RFC 2119** | MUST, MUST NOT, SHOULD, SHOULD NOT, MAY (per ESS-001 §3) |
| **SSOT for** | House Package logical model, physical layout, `house.json` contract, asset and versioning rules |
| **Not SSOT for** | Runtime Kernel API, Interpretation algorithms, Behavior Packs, Experience projection, React/UI, Cognitive Signals |

---

## 1. Purpose

HP-001 defines **House Package** as the authoritative, framework-independent **distribution contract** for object truth in the residential-house vertical of Embed Engine.

It is the public contract between:

| Producer | Consumer |
| --- | --- |
| Client Studio, Builder workflows, import/export tools | Runtime loaders, Interpretation Engine inputs, future HTTP/API publishers |

### Relationship to Object Package

[Object Package](../product/object-package.md) is the **product-meaning SSOT**: what object truth is, who owns it, and how it relates to Decision and Experience.

**House Package** is the **house-vertical encoding** of that contract:

```text
Object Package (product contract)
        │
        ▼
House Package (HP-001)     ← logical model + physical package + house.json
        │
        ▼
Loader / Runtime binding   ← out of scope of HP-001
```

HP-001 MUST NOT introduce a second product truth layer.  
A conforming House Package **is** an Object Package instance for a house.

### Core principle

> Object Package is the source of truth. Experience is its interpretation.  
> House Package is how that truth is packaged and exchanged for a house.

---

## 2. Scope

### 2.1 In scope

- Purpose and architectural principles of House Package
- Logical model (entities and required fields)
- Physical package structure on disk / in archives
- Minimal `house.json` schema
- Asset reference rules
- Package and schema versioning
- Extensibility and backward-compatibility rules
- Invariants, error model, and conformance checklist for loaders

### 2.2 Out of scope

HP-001 MUST NOT specify:

- Object Package Loader implementation
- Schema validators as code
- Runtime / Kernel APIs or `load()` semantics beyond opaque binding expectations
- Interpretation Engine rules or Behavior Packs
- HTTP API endpoints
- Client Studio UI
- Customer-specific or CMS-specific schemas
- Binary codecs for images/video

---

## 3. Normative language

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** in this document are to be interpreted as described in [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119) and ESS-001 §3.

Non-normative text is marked **Note:**, **Rationale:**, or **Example:**.

---

## 4. Architecture alignment

HP-001 uses Reference Architecture vocabulary:

| Term | Role in HP-001 |
| --- | --- |
| Object Package | Product truth contract; House Package is its house-vertical distribution form |
| Behavior Pack | Separate knowledge; MUST NOT be embedded as required House Package content in v0.1 |
| Interpretation | Reads object facts; MUST NOT mutate House Package |
| Experience / Renderer | MUST NOT reconstruct object truth from raw package bytes |
| Runtime / Kernel | MAY bind an opaque package; MUST NOT own package schema as Kernel SSOT |

HP-001 MUST NOT relocate Cognition, Strategy, or Experience responsibilities into the package format.

---

## 5. Architectural principles

1. **Facts only** — House Package carries object truth, not visit state, UI chrome, or scores.
2. **Read-only for consumers** — Interpretation and Runtime MUST treat package content as immutable for a given bind.
3. **Logical ≠ physical** — Logical model is independent of zip layout, CDN hosting, or filesystem; physical layout is one normative serialization.
4. **Framework independence** — No React, no DOM, no TypeScript runtime types as normative requirement.
5. **Vertical specificity without Engine lock-in** — Field names may reflect house domain (rooms, floors); Kernel MUST remain usable for non-house objects via other Object Package encodings.
6. **Stable identity** — `identity.id` is the durable object id across media and Experience bindings.
7. **Assets by reference** — Binaries live beside `house.json`; `house.json` stores references, not blobs.

---

## 6. Logical model

### 6.1 Aggregate

A House Package logically consists of:

| Entity | Cardinality | Role |
| --- | --- | --- |
| **HouseIdentity** | 1 | Stable id, title, commercial reference |
| **HouseOverview** | 1 | Summary metrics used across Experiences |
| **HouseLocation** | 1 | Geographic context (non-PII project location) |
| **HouseMetadata** | 1 | Construction / energy and similar static attributes |
| **Room** | 0..n (SHOULD ≥ 1 for residential MVP) | Spatial parts of the house |
| **MediaAsset** | 0..n | References to images, floorplans, video |

**Note:** Adjacency graphs, orientation vectors, and 3D meshes are **extensions** (see §11) — not required in v0.1.

### 6.2 HouseIdentity

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | MUST | Stable machine id (e.g. `house-modern-01`) |
| `title` | string | MUST | Human-readable name |
| `reference` | string | MUST | Commercial / catalogue reference |

### 6.3 HouseOverview

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `price` | number | MUST | Indicative price (unit documented in package or project policy; v0.1 assumes major currency units as integer/float number) |
| `usableArea` | number | MUST | Usable area (m²) |
| `landArea` | number | MUST | Land / plot area (m²) |
| `rooms` | number | MUST | Room count summary (integer ≥ 0) |
| `hasGarden` | boolean | MUST | Whether outdoor/garden use is part of the object |

### 6.4 HouseLocation

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `city` | string | MUST | City |
| `district` | string | MUST | District / area label |

### 6.5 HouseMetadata

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `energyClass` | string | MUST | Energy class label (e.g. `B`) |
| `construction` | string | MUST | Construction type label |

### 6.6 Room

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | MUST | Stable room id (e.g. `room-living`) |
| `name` | string | MUST | Display name |
| `area` | number | MUST | Area (m²) |
| `floor` | integer | MUST | Floor index (`0` = ground) |

Room `id` values MUST be unique within the package.

### 6.7 MediaAsset

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | MUST | Stable media id |
| `type` | string enum | MUST | One of: `image`, `floorplan`, `video` |
| `title` | string | MUST | Display title |
| `url` | string | MUST | Package-relative path or absolute URL (see §8) |

Media `id` values MUST be unique within the package.

---

## 7. Physical structure

### 7.1 Package root

A House Package MUST be a directory (or archive whose root is that directory) with:

```text
<package-root>/
  house.json          # REQUIRED — logical model serialization
  assets/             # REQUIRED if any relative media urls are used; MAY be empty
    …                 # media files referenced by house.json
```

### 7.2 Naming

| Item | Rule |
| --- | --- |
| Package root directory | SHOULD equal `identity.id` |
| Manifest filename | MUST be `house.json` at package root |
| Asset paths | MUST be portable (forward slashes); MUST NOT contain `..` segments |

### 7.3 Archives

When distributed as a single file, producers SHOULD use `.zip` with the package root as the archive root (so `house.json` is at the top level of the zip).

**Note:** Compression format is not Kernel concern; loaders MAY support additional archive types if they preserve the logical layout.

### 7.4 Separation from physical transport

CDN URLs, git LFS, and signed download links are transport concerns. HP-001 only requires that after resolution, the consumer sees the logical + physical structure above.

---

## 8. `house.json` — minimal schema (v0.1)

### 8.1 Root object

```json
{
  "packageFormat": "house-package",
  "schemaVersion": "0.1",
  "contentVersion": "1.0.0",
  "identity": { },
  "overview": { },
  "location": { },
  "metadata": { },
  "rooms": [ ],
  "media": [ ]
}
```

| Field | Required | Description |
| --- | --- | --- |
| `packageFormat` | MUST | Literal `"house-package"` |
| `schemaVersion` | MUST | HP-001 schema version; v0.1 documents `"0.1"` |
| `contentVersion` | MUST | SemVer of **this object’s content** (facts revision) |
| `identity` | MUST | §6.2 |
| `overview` | MUST | §6.3 |
| `location` | MUST | §6.4 |
| `metadata` | MUST | §6.5 |
| `rooms` | MUST | Array of Room (§6.6); MAY be empty only if explicitly allowed by project policy — residential MVP SHOULD be non-empty |
| `media` | MUST | Array of MediaAsset (§6.7); MAY be empty |

Unknown top-level fields: see §11 (extensions).

### 8.2 Example (non-normative)

Aligned with pilot `house-modern-01` / reference fixture knowledge:

```json
{
  "packageFormat": "house-package",
  "schemaVersion": "0.1",
  "contentVersion": "1.0.0",
  "identity": {
    "id": "house-modern-01",
    "title": "Modern 01",
    "reference": "ASTAV-M01"
  },
  "overview": {
    "price": 6900000,
    "usableArea": 142,
    "landArea": 620,
    "rooms": 5,
    "hasGarden": true
  },
  "location": {
    "city": "Praha",
    "district": "Západ"
  },
  "metadata": {
    "energyClass": "B",
    "construction": "Zděná"
  },
  "rooms": [
    { "id": "room-living", "name": "Obývací pokoj", "area": 32, "floor": 0 },
    { "id": "room-kitchen", "name": "Kuchyně", "area": 14, "floor": 0 },
    { "id": "room-bedroom", "name": "Ložnice", "area": 18, "floor": 1 },
    { "id": "room-children", "name": "Dětský pokoj", "area": 16, "floor": 1 },
    { "id": "room-bath", "name": "Koupelna", "area": 8, "floor": 1 }
  ],
  "media": [
    {
      "id": "media-exterior",
      "type": "image",
      "title": "Exteriér",
      "url": "assets/exterior.jpg"
    },
    {
      "id": "media-floorplan",
      "type": "floorplan",
      "title": "Půdorys",
      "url": "assets/floorplan.svg"
    }
  ]
}
```

### 8.3 Encoding

- `house.json` MUST be UTF-8 JSON.
- Numbers MUST NOT be encoded as strings.
- Booleans MUST be JSON booleans.

---

## 9. Asset rules

1. Every `media[].url` that is package-relative MUST resolve under `<package-root>/` without leaving the package (`..` forbidden).
2. Absolute `https://` URLs MAY be used; producers SHOULD prefer package-relative assets for offline / Embed distribution.
3. Missing referenced relative files MUST cause loader validation failure (see §13).
4. Asset binaries MUST NOT be inlined into `house.json` in v0.1.
5. Recommended media types for files: image → `.jpg`/`.png`/`.webp`; floorplan → `.svg`/`.png`; video → `.mp4` (informative).

---

## 10. Versioning

| Version field | Meaning | Compatibility |
| --- | --- | --- |
| `schemaVersion` | HP-001 logical/physical contract | Breaking schema changes require new HP-001 minor/major and new `schemaVersion` |
| `contentVersion` | Revision of facts for this `identity.id` | SemVer; patch = corrections; minor = additive facts; major = incompatible fact remodel for same id |

Rules:

1. Changing `identity.id` creates a **different** object — not a version bump of the previous package.
2. Consumers MUST reject `packageFormat` ≠ `"house-package"`.
3. Consumers that implement only `schemaVersion` `"0.1"` MUST reject unknown major schema versions; they MAY accept additive compatible extensions per §11.
4. `contentVersion` MUST change whenever published facts change.

---

## 11. Extensibility and compatibility

### 11.1 Additive extensions (compatible)

Producers MAY add:

- additional properties on existing objects,
- additional entries in `rooms` / `media`,
- optional sibling files under `assets/`,

provided required v0.1 fields remain valid.

Consumers that do not understand an extension MUST ignore unknown properties **unless** a future `schemaVersion` marks them required.

### 11.2 Reserved future extensions (not required in v0.1)

Documented for planning; MUST NOT be treated as required by v0.1 loaders:

| Extension | Intent |
| --- | --- |
| `relations` / adjacency | Room–room or room–outdoor links |
| `anchors` | Canonical objectAnchor ids for Priority House Mapping (see Integration Model OQ-03) |
| `i18n` | Locale maps for names/titles |
| `currency` | Explicit ISO currency for `overview.price` |
| `behaviorPackRefs` | Declarative links to Behavior Packs (packs remain separate artifacts) |
| `geometry` | Meshes / BIM references |

### 11.3 Incompatible changes

Removing/renaming required fields, changing `media.type` enum without version bump, or embedding Behavior Pack executable rules inside `house.json` REQUIRES a new HP-001 version and ADR if architecture responsibilities shift.

---

## 12. Public contract (loader boundary)

HP-001 does not define a programming API. For conformance, a **House Package Loader** (future) is any component that:

**Inputs:** package root path, zip bytes, or equivalent resolved tree.  
**Outputs:** an immutable in-memory representation of the logical model (§6), or a structured error (§13).

### Execution semantics

- Loading is **I/O-bound** (not Pure).
- Validation of an already-parsed `house.json` object against §6–§8 SHOULD be **deterministic and Pure**.
- Concurrent loads of distinct packages MAY proceed independently.
- Ordering of media/room arrays MUST be preserved as in `house.json`.

### Non-guarantees

- HP-001 does not guarantee Interpretation quality.
- HP-001 does not guarantee Presence of every media binary on remote absolute URLs (network failures are loader/runtime operational concerns).

---

## 13. Invariants

1. `identity.id` MUST be non-empty and stable for the published object.
2. `overview.rooms` SHOULD equal `rooms.length` when both represent the same enumeration policy; if they differ, producers MUST document the counting rule in content notes (future extension) — v0.1 SHOULD keep them equal.
3. Room and media ids MUST be unique within the package.
4. Consumers MUST NOT mutate package facts after successful load.
5. Renderers MUST NOT read House Package as a substitute for Experience projection ([Object Package §7–§8](../product/object-package.md)).

---

## 14. Error model

A conforming loader MUST fail validation (MUST NOT silently invent facts) when:

| Code (informative) | Condition |
| --- | --- |
| `HP_MISSING_MANIFEST` | `house.json` absent |
| `HP_INVALID_JSON` | JSON parse failure |
| `HP_BAD_FORMAT` | `packageFormat` ≠ `house-package` |
| `HP_UNSUPPORTED_SCHEMA` | `schemaVersion` not supported |
| `HP_MISSING_FIELD` | Required §6 / §8 field missing or wrong type |
| `HP_DUPLICATE_ID` | Duplicate room or media id |
| `HP_ASSET_MISSING` | Relative `media.url` target missing |
| `HP_ASSET_ESCAPE` | Path escapes package root |

Error reporting shape is implementation-defined; codes above are recommended for interoperability.

---

## 15. Conformance tests (black-box)

A loader claiming HP-001 v0.1 conformance MUST pass:

1. **Accept** the example in §8.2 when assets exist at the referenced relative paths.
2. **Reject** package without `house.json`.
3. **Reject** `packageFormat: "other"`.
4. **Reject** missing `identity.id`.
5. **Reject** duplicate `rooms[].id`.
6. **Reject** relative media url whose file is absent.
7. **Reject** media url containing `..`.
8. **Preserve** room order from JSON in the loaded model.
9. **Ignore** unknown top-level property `extensions.foo` without failing (additive rule).
10. **Expose** `schemaVersion` and `contentVersion` to the consumer.

---

## 16. Versioning and change control

- Status lifecycle follows ESS-001 (Proposed → Approved → Frozen).
- v0.1 is **Approved** for independent loader design; breaking changes require HP-001 v0.2+ and explicit migration notes.
- TypeScript fixtures (e.g. `@embed-engine/object-house`) are **implementations**, not this SSOT. Drift MUST be resolved toward HP-001 once a loader lands.

---

## 17. Quality checklist (ESS-001)

- [x] Logical model separated from physical layout (§6 vs §7)
- [x] No framework or customer-specific lock-in
- [x] Aligns with Object Package product contract
- [x] Sufficient for independent loader implementation
- [x] No Runtime Kernel implementation details
- [x] Extensions reserved without breaking v0.1 required surface
- [x] Conformance tests listed

---

## Related documents

- [Object Package — Product Contract](../product/object-package.md)
- Pilot object: [house-modern-01](../pilot/object/house-modern-01.md)
- [Architecture Freeze v0.1](../releases/Architecture%20Freeze%20v0.1.md) — Object Package Loader still open
- Priority mapping anchors: Integration Model OQ-03 / Domain Model DM-OQ-06 (future `anchors` extension)
