> **Status (kurace 2026-07-23):** HISTORICAL — SSOT is `ux-sprinty/03_TERMINAL_FRAMEWORK_v1.0.md`.

# TERMINAL_FRAMEWORK
## Embed Engine Terminal Framework
### Version 1.0 (Draft)

## Purpose

The Terminal Framework defines the common contract shared by every Embed Engine terminal.

A terminal is never an application with its own business logic.
It is a Runtime projection with a standardized interaction model.

---

## Layer Position

Knowledge
↓
Runtime
↓
Projection
↓
Terminal Framework
↓
Concrete Terminal
↓
User

---

## Common Contract

Every terminal must implement:

- Identity Context
- Perspective
- Projection
- Context
- Narrative
- Insight
- Action
- Interaction Channel

---

## Lifecycle

1. Resolve Identity
2. Select Perspective
3. Request Projection
4. Render Terminal
5. Capture Intent
6. Send Intent to Runtime
7. Receive Updated Projection
8. Re-render

---

## Extension Points

Concrete terminals specialize only:

- widgets
- layout
- navigation
- actions
- visualization

They never redefine Runtime semantics.

---

## Standard Terminal Family

- Client Terminal
- Operations Terminal
- Sales Terminal
- Builder Terminal
- Analytics Terminal
- AI Terminal

---

## Architectural Invariants

- Runtime is the semantic authority.
- Projection is the composition authority.
- Terminal is the interaction authority.
- UI is never the source of truth.
- All terminals follow the same lifecycle.

---

## Future Rule

Every new Embed Engine application must first be expressible as a Terminal before introducing new Runtime capabilities.
