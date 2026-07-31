# ADR-023 — House Package as Content SSOT

**Status:** Accepted  
**Date:** 2026-07-31  
**CAP:** CAP-BLD-01  
**Title:** House Package (HP-002) is the sole Content SSOT; Builder Studio is an Authoring Surface over that package  
**Depends on:** [HP-002](../../03-specification-standard/HP-002-Builder-House-Package-Input.md), [ADR-001](./ADR-001-runtime-architecture.md), [ADR-019](./ADR-019-runtime-vs-release.md)  
**Related:** [CAP-BLD-01 migration design](../builder/CAP-BLD-01-House-Package-SSOT-Migration.md) · [Current Runtime Baseline](../Current-Runtime-Baseline.md) · Product Model (`docs/platform/manager_sales_terminals/02_PRODUCT_MODEL_v1.0.md`)  
**Numbering note:** Requested under working title “ADR-020”; **ADR-020** is already assigned to [AI Delivery Architecture](./ADR-020-ai-delivery-architecture.md). This decision is recorded as **ADR-023**.

**SSOT for:** Content ownership — House Package (HP-002) as the only content source of truth; Builder as Authoring Surface; Publish as release over an existing House Package; ban on parallel content models and new export formats  
**Not SSOT for:** Persistence, backend, login, multi-company, Runtime algorithms, Manager Studio, Sales Studio, Experience presentation config (ADR-015), Release Snapshot mechanics beyond the publish rule (ADR-019)

---

## Context

Builder Reality Audit showed two parallel **content** models in the platform:

1. **Builder Studio in-memory Project / Object / Asset / ProjectPackage model** — mock metadata, session-only “packages”, in-memory Publish / Distribution artifacts.
2. **House Package (HP-002)** — the locked authoring layout (`rooms.csv`, `gallery.csv`, `videos.csv`, `media/`, plans/SVG, and related HP-002 metadata) already consumed by Client Studio, Embed, and `@embed-engine/object-house`.

That duality produces:

- a duplicate Publish workflow that never writes production content,
- a blocked Production Publish Bridge (nothing authoritative to release from Builder),
- divergent “objects” between Builder UI and live Experience.

HP-002 already defines the Builder House Package as the **authoring Object Package** and forbids inventing ad-hoc authoring formats. Implementation drifted. This ADR **locks** the platform decision so implementation must converge on HP-002.

---

## Decision

### 1. House Package is the sole Content SSOT

**House Package (HP-002)** is the only source of truth for **content**.

Content includes, in particular:

- `rooms.csv`
- `gallery.csv`
- `videos.csv`
- `media/` (hero, gallery, plans, videos layer as defined by HP-002)
- SVG / floorplan assets under the package
- `manifest.json` where present as package auxiliary metadata — **subject to HP-002 rules** (CSV remains SSOT for rooms/gallery/videos metadata)
- all other metadata **defined by HP-002**

No Studio may treat a second tree or in-memory package as authoritative content.

### 2. Builder Studio is not the owner of content

**Builder Studio** is an **Authoring Surface** over House Package.

Builder **MUST**:

- load House Package,
- edit House Package,
- validate House Package,
- save House Package (same files / same format).

Builder **MUST NOT**:

- invent or persist a parallel content model,
- mint a “Builder Package” as a content artifact,
- treat mock Project / Object media collections as production content.

### 3. Publish never generates a new House Package

**Publish** does not create House Package content.

Publish **MUST** only:

1. validate the current House Package,
2. run necessary auxiliary generation already owned by House Package tooling (e.g. floorplan geometry publish),
3. run the existing production publish pipeline (`pnpm embed:publish` per ADR-019).

Publish **MUST NOT** export Builder memory into a new package format.

### 4. `object-house` remains the reference implementation

`@embed-engine/object-house` remains the reference implementation for House Package import, projection, and related disk tooling.

**MUST NOT** create a second House Package implementation inside Builder Studio or elsewhere.

### 5. No new export format — no Builder Package — no parallel Publish

Forbidden:

- any new content export format,
- any “Builder Package” as a content SSOT or release input,
- any parallel Publish pipeline that bypasses House Package + `embed:publish`.

### 6. One House Package across surfaces

**Runtime**, **Client Studio**, **Builder Studio**, **Embed**, and other Studios **MUST** use the **same** House Package content (HP-002), projected or released through existing tooling — not Studio-local copies of meaning or media SSOT.

Runtime remains the sole author of **meaning** (Interpretation / Decision). This ADR governs **content**, not Decision semantics.

---

## Consequences

### Positive

- One content path from authoring → release → Experience.
- Production Publish Bridge becomes definable (validate + auxiliary generate + `embed:publish`).
- Builder implementation can retire mock content without inventing formats.
- Aligns code with locked HP-002 and the Current Runtime Baseline (Builder Package → HousePackage → Session).

### Normative future shape

| Concern | Rule |
| --- | --- |
| Builder mock content model | Remove from required path |
| Parallel in-memory Publish / Distribution models | Remove from required path |
| Build | Validation of House Package (not minting a content package) |
| Publish | Release of the current House Package via existing pipeline |
| Builder | Editor of House Package |

### Costs

- Builder must gain a Node/host I/O path to read/write the canonical package tree (browser cannot be the filesystem SSOT).
- Large Builder lab surfaces (non-content) must be quarantined so they do not reintroduce a content package.

### Forbidden

- Parallel content models in any Studio.
- Builder → House Package “exporters” that invent a second format.
- Treating Builder `ProjectPackage` / `PublishedPackage` / mock assets as production content.
- Ad-hoc publish paths that skip HP-002 + `pnpm embed:publish`.

---

## Consistency with existing SSOT

| Document | Relationship |
| --- | --- |
| **HP-002** | Already locks authoring layout and “Builder House Package = authoring Object Package”. This ADR **does not revise** HP-002; it locks **platform ownership** (who is SSOT, what Builder/Publish may do). |
| **Product Model** | Defines Studios / Object / Asset at product level. This ADR specifies that **object content** for the pilot platform is materialized as **HP-002**, not a Builder-owned package. No Product Model rewrite required for acceptance. |
| **ADR-019** | Release Snapshot still only via `pnpm embed:publish`. This ADR states Publish releases **House Package content**, not a Builder-minted package. |
| **ADR-015** | Builder may still own declarative **Experience presentation** config; that is **not** content SSOT and must not replace HP-002 media/CSV. |
| **CAP-BLD-01 migration** | Implementation phasing only; subordinate to this ADR. |

---

## Out of scope

This ADR does **not** decide:

- persistence / backend,
- login / identity,
- multi-company tenancy,
- Runtime Decision algorithms,
- Manager Studio or Sales Studio product scope.

---

## Enforcement

| Mechanism | Role |
| --- | --- |
| HP-002 (locked) | Physical content format SSOT |
| This ADR | Ownership and Publish/Builder boundaries |
| `@embed-engine/object-house` | Reference import / projection / geometry tooling |
| `pnpm embed:publish` | Sole Release Snapshot path (ADR-019) |
| CAP-BLD-02…07 | Incremental Builder convergence |

---

## Validation (ADR acceptance)

- [x] House Package uniquely designated Content SSOT  
- [x] Parallel content models forbidden  
- [x] New export formats / Builder Package / parallel Publish forbidden  
- [x] Builder defined as Authoring Surface over House Package  
- [x] Consistent with HP-002, Product Model, ADR-019  
