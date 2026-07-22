# ADR-013 — Room Selection is Semantic, not Graphical

**Status:** Accepted  
**Date:** 2026-07-22  
**Title:** Room Selection is Semantic, not Graphical  
**Depends on:** [HP-001 — House Package Specification](../../03-specification-standard/HP-001-House-Package-Specification.md), [ADR-001](./ADR-001-runtime-architecture.md), [ADR-012](./ADR-012-interpretation-first-class-artifact.md), [Object Package — Product Contract](../../product/object-package.md)

**SSOT for:** Room selection boundary — semantic `RoomId` as the only Runtime input; Input Adapter role for SVG and all other controls  
**Not SSOT for:** SVG geometry, UI layouts, AI prompts, Experience chrome, House Package schema fields beyond Room identity ownership

---

## Context

Room selection can be triggered by many surfaces: interactive floorplan SVG, room lists, gallery photos, AI suggestions, Decision Story steps, Priority flows, and future modalities.

If any of those surfaces leak into Decision Runtime (e.g. Runtime reading SVG hit-tests, polygon ids, or UI component trees), room selection becomes a graphical concern. That couples Cognition and Experience to one control form, blocks alternative inputs, and violates Object Package / Experience separation.

Room identity already exists in Object Package / House Package (`rooms[].id`). Selection must operate on that identity, not on presentation geometry.

---

## Decision

**Room selection is a semantic operation over `RoomId`.**

No concrete control form (SVG, room list, AI, photograph, Decision Story, …) is part of decision logic.

### Rules

1. **`RoomId` is the only room-selection input into Runtime.**
2. **Runtime MUST NEVER work directly with SVG** (or any other presentation geometry).
3. **SVG is only an Input Adapter** that translates a click (or equivalent gesture) into a `RoomId`.
4. **Any other input** (AI, room list, photograph, Priority, Story, …) MUST end by calling `selectRoom(roomId)` (or an equivalent public Runtime command with the same semantics).
5. **Object Package owns the Room Registry** (canonical room ids and room facts). Adapters MUST NOT invent room ids outside that registry.
6. **Experience reacts only to a change of the active `RoomId`** (via Interpretation → Experience Model). Experience MUST NOT own selection logic.

### Architectural flow

```text
Input Adapter
(SVG | Room List | AI | Story | Gallery | …)
                │
                ▼
           RoomId
                │
                ▼
     selectRoom(roomId)
                │
                ▼
           Decision Runtime
                │
                ▼
        Interpretation
                │
                ▼
         Experience Model
```

---

## Consequences

### Allowed

- Multiple concurrent Input Adapters for the same object
- Replacing SVG floorplans without touching Runtime
- AI / Story / Priority selecting rooms by calling the same `selectRoom(roomId)` boundary
- Experience highlighting / filtering media based on active `RoomId` from Experience Model

### Forbidden

- Runtime importing SVG, DOM hit-testing, or floorplan geometry
- Encoding selection meaning in CSS classes, SVG path ids, or UI component identity without mapping to registry `RoomId`
- Experience inventing an active room that is not the Runtime-selected `RoomId`
- Adapters inventing room ids not present in Object Package Room Registry

### Implementation note (non-normative)

Existing signals such as `ROOM_VIEWED` with payload `roomId` are compatible with this ADR when they carry a registry `RoomId`. Public façade naming MAY use `selectRoom(roomId)`; the invariant is semantic identity, not the method name.

---

## Relationship to other documents

| Document | Relationship |
| --- | --- |
| [HP-001](../../03-specification-standard/HP-001-House-Package-Specification.md) | Room ids live in House Package / Object Package (`rooms[].id`) |
| [ADR-012](./ADR-012-interpretation-first-class-artifact.md) | Selection changes feed Interpretation; Experience communicates, does not decide |
| [experience-projection.md](../experience-projection.md) | Renderers consume Experience; they do not reconstruct domain selection |
| [RI-001](../../04-reference-implementation/RI-001-Runtime-Kernel.md) | Runtime owns orchestration; this ADR constrains room-focus input shape |
| [PT-002](../pt/PT-002-interpretation-is-the-product.md) | Input → Runtime → Interpretation → Projection → Experience (Principle 7) |

---

## Status

**Accepted.** This principle is binding for Runtime, Input Adapters, and Experience surfaces that select rooms.

This ADR is the binding decision record for [PT-001 Principle 8](../pt/PT-001-house-package-canonical-object-contract.md) and aligns with [PT-002](../pt/PT-002-interpretation-is-the-product.md) (Inputs modify Runtime; Experiences are disposable projections).
