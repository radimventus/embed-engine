# PT-003 — Decision Sessions are Reproducible

| Field | Value |
| --- | --- |
| **ID** | PT-003 |
| **Title** | Decision Sessions are Reproducible |
| **Status** | Proposed |
| **Type** | Platform Theory (PT) |
| **Version** | 0.1 |
| **Date** | 2026-07-22 |
| **Owner** | Platform Architecture |
| **Scope** | Embed Engine Platform |
| **SSOT for** | Decision Session execution philosophy — semantic history, determinism, replay, serialization, presentation independence |
| **Not SSOT for** | Decision Session public contract / lifecycle API (→ [RI-002](../../04-reference-implementation/RI-002-Decision-Session.md)), DecisionState schema (→ [ADR-002](../adr/ADR-002-decision-state.md) / CORE-002), Runtime Kernel API (→ [RI-001](../../04-reference-implementation/RI-001-Runtime-Kernel.md)), event enum catalogs |
| **Depends on** | [PT-002](./PT-002-interpretation-is-the-product.md), [PT-001](./PT-001-house-package-canonical-object-contract.md), [RI-002](../../04-reference-implementation/RI-002-Decision-Session.md), [ADR-002](../adr/ADR-002-decision-state.md), [ADR-013](../adr/ADR-013-room-selection-semantic.md) |

---

## Purpose

Define the canonical model of a Decision Session within Embed Engine.

A Decision Session is not a UI history.

A Decision Session is a **reproducible execution history** of the Runtime.

Its purpose is to guarantee that every decision can be resumed, replayed, analyzed, shared, audited, and interpreted independently of presentation technology.

---

## Motivation

Traditional applications preserve UI state.

Embed Engine preserves decision state.

The platform must be capable of reproducing an identical Interpretation from the same inputs, regardless of when, where, or how the session is rendered.

Reproducibility is a **platform capability**, not an implementation detail.

---

## Principle 1 — A Decision Session belongs to Runtime

A Decision Session records Runtime evolution.

It never records UI implementation details.

The Runtime is the authoritative owner of the session.

Aligned with [RI-002](../../04-reference-implementation/RI-002-Decision-Session.md).

---

## Principle 2 — Events are semantic

Decision Sessions record domain events.

Examples:

- `RoomSelected`
- `PriorityChanged`
- `VariantSelected`
- `QuestionAnswered`
- `ScenarioActivated`

They never record UI events.

Examples that MUST never appear:

- `ButtonClicked`
- `CardHovered`
- `AccordionOpened`
- `TabChanged`

Aligned with [ADR-013](../adr/ADR-013-room-selection-semantic.md) (Input Adapters emit semantic commands; UI gestures are not session truth).

---

## Principle 3 — Runtime State is the source of truth

The current Runtime State completely determines the current decision context.

Presentation layers may disappear and be recreated.

The Runtime State remains authoritative.

---

## Principle 4 — Sessions are deterministic

Given identical:

- Object Package
- Runtime State
- Interpretation Rules

the platform MUST always produce the same Interpretation.

This guarantees reproducibility.

Aligned with [PT-002 Principle 8](./PT-002-interpretation-is-the-product.md).

---

## Principle 5 — Sessions are serializable

A Decision Session must be representable as data.

It must be possible to:

- persist
- transmit
- restore
- clone
- compare

without requiring a UI.

---

## Principle 6 — Sessions are replayable

Every semantic event may be replayed.

Replaying the same event sequence against the same Object Package and Interpretation Rules MUST produce an identical Runtime State.

---

## Principle 7 — Interpretation is reproducible

The platform reproduces Interpretations.

Experiences are regenerated from those Interpretations.

```text
Decision Session
        ↓
Runtime
        ↓
Interpretation
        ↓
Projection
        ↓
Experience
```

Aligned with [PT-002](./PT-002-interpretation-is-the-product.md).

---

## Principle 8 — Experiences are transient

Experiences are disposable.

A destroyed Experience can always be regenerated from the Decision Session.

Experiences are never persisted as the source of truth.

---

## Principle 9 — Sessions are analyzable

Decision Sessions enable:

- analytics
- behavioral insights
- AI reasoning
- audit trails
- collaboration
- conversion analysis
- abandoned-session recovery

These capabilities emerge from semantic events, not UI telemetry.

---

## Principle 10 — Sessions are portable

A Decision Session may continue across:

- browsers
- devices
- Client Studio
- AI Advisor
- Decision Terminal
- future presentation technologies

The session remains identical.

Only the Experience changes.

---

## Invariants

The following MUST always remain true:

1. Runtime owns Decision Sessions.
2. Sessions contain semantic events only.
3. UI events are never persisted.
4. Runtime State is authoritative.
5. Interpretation is deterministic.
6. Experiences are regenerated.
7. Sessions are serializable.
8. Sessions are replayable.
9. Sessions are presentation-independent.

---

## Relationship to Architecture

| Document | Owns |
| --- | --- |
| [Object Package](../../product/object-package.md) | Domain knowledge |
| [HP-001](../../03-specification-standard/HP-001-House-Package-Specification.md) | House Package schema |
| [PT-001](./PT-001-house-package-canonical-object-contract.md) | Canonical Object Contract |
| [PT-002](./PT-002-interpretation-is-the-product.md) | Interpretation as the platform product |
| **PT-003 (this document)** | Decision Session execution model (philosophy) |
| [RI-002](../../04-reference-implementation/RI-002-Decision-Session.md) | Decision Session Reference Implementation contract |
| [ADR-013](../adr/ADR-013-room-selection-semantic.md) | Semantic Room Selection |

### Why this PT matters

PT-002 answered: **What does the platform produce?** → Interpretation.

PT-003 answers: **How is decision progress preserved so Interpretation stays reproducible across time, device, and presentation?** → Decision Session as semantic Runtime history.

---

## Canonical Decision Pipeline

```text
Object Package
        ↓
Loader
        ↓
Decision Session
        ↓
Runtime State
        ↓
Interpretation
        ↓
Projection
        ↓
Experience
        ↓
Presentation
```

---

## Consequences

This enables:

- Resume Decision
- Continue on another device
- AI continuation
- Shared decision links
- CRM synchronization
- Behavioral Analytics
- Decision replay
- Auditability
- Deterministic testing
- Future collaborative decision experiences

---

## Non-goals

A Decision Session is **not**:

- a React state snapshot
- browser history
- DOM history
- analytics event stream
- UI recording
- screen recording

It is the **semantic history of decision execution**.

---

## Approval Criteria

PT-003 may be promoted from **Proposed** to **Approved** once architecture confirms that:

1. Decision Sessions are owned exclusively by the Runtime.
2. Only semantic events are persisted.
3. Experiences remain fully regenerable from Runtime state.
4. The execution model is deterministic and replayable.
5. No presentation technology becomes part of the canonical session model.

Until Approved, PT-003 is normative intent for design; [RI-002](../../04-reference-implementation/RI-002-Decision-Session.md) remains the Session contract SSOT for Cognitive Runtime boundaries. Executable session container (semantic events, `selectRoom`, serialize/replay): `@embed-engine/runtime` (`createDecisionSession` / `selectRoom` / `replayDecisionSession`).

---

## Related documents

- [PT-001 — House Package as the Canonical Object Contract](./PT-001-house-package-canonical-object-contract.md)
- [PT-002 — Interpretation is the Product](./PT-002-interpretation-is-the-product.md)
- [RI-002 — Decision Session](../../04-reference-implementation/RI-002-Decision-Session.md)
- [RI-001 — Runtime Kernel](../../04-reference-implementation/RI-001-Runtime-Kernel.md)
- [Object Package — Product Contract](../../product/object-package.md)
- [HP-001 — House Package Specification](../../03-specification-standard/HP-001-House-Package-Specification.md)
- [ADR-002 — DecisionState Aggregate](../adr/ADR-002-decision-state.md)
- [ADR-013 — Room Selection is Semantic, not Graphical](../adr/ADR-013-room-selection-semantic.md)
