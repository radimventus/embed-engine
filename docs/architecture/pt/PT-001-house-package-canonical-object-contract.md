# PT-001 — House Package as the Canonical Object Contract

| Field | Value |
| --- | --- |
| **ID** | PT-001 |
| **Title** | House Package as the Canonical Object Contract |
| **Status** | Approved |
| **Type** | Platform Theory (PT) |
| **Version** | 0.1 |
| **Date** | 2026-07-22 |
| **Approved** | 2026-07-22 |
| **Owner** | Platform Architecture |
| **Scope** | Embed Engine Platform |
| **SSOT for** | Platform principles governing House Package as the canonical object contract across producers and consumers |
| **Not SSOT for** | `house.json` field schema (→ [HP-001](../../03-specification-standard/HP-001-House-Package-Specification.md)), Object Package product meaning (→ [object-package.md](../../product/object-package.md)), Runtime Kernel API (→ [RI-001](../../04-reference-implementation/RI-001-Runtime-Kernel.md)) |
| **Depends on** | [Object Package — Product Contract](../../product/object-package.md), [HP-001](../../03-specification-standard/HP-001-House-Package-Specification.md), [ADR-012](../adr/ADR-012-interpretation-first-class-artifact.md), [ADR-013](../adr/ADR-013-room-selection-semantic.md) |

---

## Approval Note

PT-001 v0.1 is **Approved** as platform theory for House Package as the canonical object contract.

It establishes binding platform invariants for Object Package usage across Builder, Runtime, Experience, Studio Manager, AI, and importers/exporters. Schema detail remains in [HP-001](../../03-specification-standard/HP-001-House-Package-Specification.md); semantic room selection remains in [ADR-013](../adr/ADR-013-room-selection-semantic.md).

---

## Purpose

House Package is the **sole source of project data** for one object.

It is not merely a data format.

It is the **canonical contract** that separates:

- Builder Studio
- Runtime
- Experience
- Studio Manager
- AI
- future importers / exporters

Each of these systems works against the **same** contract.

### Document relationship

| Document | Role |
| --- | --- |
| [Object Package](../../product/object-package.md) | Product-meaning SSOT — what object truth is |
| [HP-001](../../03-specification-standard/HP-001-House-Package-Specification.md) | Distribution / schema SSOT — logical model, physical layout, `house.json` |
| **PT-001 (this document)** | Platform theory — invariants for how the whole platform uses that contract |
| [PT-002](./PT-002-interpretation-is-the-product.md) | Platform theory — Interpretation as the product; execution philosophy |
| [ADR-013](../adr/ADR-013-room-selection-semantic.md) | Binding decision for semantic room selection (Principle 8) |

A conforming House Package **is** an Object Package instance for the house vertical ([HP-001](../../03-specification-standard/HP-001-House-Package-Specification.md)).

---

## Principle 1 — House Package is the Canonical Object Contract

House Package is a complete description of one object.

It contains **facts only**.

It MUST NEVER contain:

- React
- Runtime
- Decision State
- UI
- visualization logic

House Package is not Experience.

Experience is only an interpretation of House Package.

---

## Principle 2 — Specification precedes implementation

First:

```text
House Package Specification
```

then:

```text
Reference House Package
```

The Reference House Package is the first implementation of the specification.

Never the reverse.

**Normative references:** Specification → [HP-001](../../03-specification-standard/HP-001-House-Package-Specification.md). Reference instance follows HP-001; it does not redefine it.

---

## Principle 3 — Reference Package is the Golden Dataset

The Reference House Package is not a demo.

It is:

- a validation dataset
- an integration dataset
- a test dataset
- the reference implementation of the platform object contract

Every new component MUST be able to work with the Reference House Package.

Example chain:

```text
Builder Studio
        │
        ▼
Reference House Package
        │
        ▼
Loader
        │
        ▼
Runtime
        │
        ▼
Experience
        │
        ▼
Studio Manager
        │
        ▼
Export
        │
        ▼
AI
```

---

## Principle 4 — Runtime owns behaviour

House Package MUST NEVER define behaviour.

It contains knowledge only.

For example (facts):

```text
room.id
gallery
video
documents
metadata
```

Never:

```text
if…
switch…
priority logic
React
render()
decision state
```

Interpretation belongs to Runtime (and its Interpretation / Decision Layer pipeline).

---

## Principle 5 — Experience never reads Object Package directly

A Renderer MUST NEVER read:

```text
HousePackage
```

A Renderer receives only:

```text
Experience Model
```

Pipeline:

```text
House Package
        │
        ▼
Interpretation
        │
        ▼
Projection
        │
        ▼
Experience Model
        │
        ▼
React
```

Aligned with [ADR-012](../adr/ADR-012-interpretation-first-class-artifact.md) and [Experience Projection Principles](../experience-projection.md).

---

## Principle 6 — Assets are referenced, never embedded

House Package owns references only.

For example:

```text
image
pdf
svg
wistia
youtube
```

not their binary content.

House Package is portable.

Assets MAY be local or remote.

Aligned with [HP-001 §9 Asset rules](../../03-specification-standard/HP-001-House-Package-Specification.md).

---

## Principle 7 — Semantic identity over physical storage

Runtime MUST NEVER look up files by filename.

It uses identifiers only.

For example:

```text
hero-image
living-room
technical-document
intro-video
```

Never:

```text
IMG_2837.webp
floorplan_final_v4.svg
```

Mapping from semantic id → storage path/URL is owned by the package manifest (`house.json` / media registry per HP-001).

---

## Principle 8 — Room Selection is Semantic, not Graphical

Room selection is a semantic operation.

The only room-selection input to Runtime is:

```text
RoomId
```

Never SVG.

SVG is only an Input Adapter.

Likewise:

- room list
- photograph
- AI
- Decision Story
- Priority Experience

all MUST end in:

```text
selectRoom(roomId)
```

Architecture:

```text
Input Adapter

SVG
Room List
AI
Gallery
Decision Story

        │
        ▼
     RoomId
        │
        ▼
  selectRoom()
        │
        ▼
 Decision Runtime
        │
        ▼
 Interpretation
        │
        ▼
  Experience
```

Adding a new control modality MUST NEVER change Runtime.

**Binding ADR:** [ADR-013 — Room Selection is Semantic, not Graphical](../adr/ADR-013-room-selection-semantic.md).

---

## Principle 9 — Builder produces contracts

Builder Studio MUST NOT generate React.

MUST NOT generate Runtime.

MUST NOT generate UI.

Builder produces only a valid House Package.

---

## Principle 10 — Loader validates contracts

The Loader is the sole component responsible for:

- loading
- validating
- assembling `HousePackage`

After a successful load, Runtime works only with the `HousePackage` object (in-memory logical model). Runtime MUST NOT re-parse package files as part of decision logic.

Loader implementation is out of scope of PT-001; the responsibility boundary is normative.

---

## Canonical Implementation Pipeline

```text
Reference Assets
        │
        ▼
Reference House Package
        │
        ▼
House Package Loader
        │
        ▼
HousePackage
        │
        ▼
Interpretation
        │
        ▼
Projection
        │
        ▼
Experience Model
        │
        ▼
Client Studio
```

---

## Consequences

This PT establishes long-lived platform invariants:

1. House Package is the only project-specific object contract.
2. Runtime never reads files for object truth after bind (identifiers + in-memory `HousePackage` only).
3. Renderer never reads House Package.
4. Builder creates contracts, not applications.
5. SVG is only an Input Adapter.
6. All room-selection modalities end in `selectRoom(roomId)`.
7. Reference House Package is the canonical implementation of the House Package specification.

This yields a clear division of responsibility among data (House Package), interpretation (Runtime), and presentation (Experience), so the platform can extend without breaking its core architectural invariants.

---

## Related documents

- [HP-001 — House Package Specification](../../03-specification-standard/HP-001-House-Package-Specification.md)
- [Object Package — Product Contract](../../product/object-package.md)
- [PT-002 — Interpretation is the Product](./PT-002-interpretation-is-the-product.md)
- [ADR-013 — Room Selection is Semantic, not Graphical](../adr/ADR-013-room-selection-semantic.md)
- [ADR-012 — Interpretation as first-class artifact](../adr/ADR-012-interpretation-first-class-artifact.md)
- [Experience Projection Principles](../experience-projection.md)
- [RI-001 — Runtime Kernel](../../04-reference-implementation/RI-001-Runtime-Kernel.md)
