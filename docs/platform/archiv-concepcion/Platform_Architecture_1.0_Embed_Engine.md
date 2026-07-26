> **Status (kurace 2026-07-23):** HISTORICAL / ADR Candidate source — SSOT architecture is `ux-sprinty/01_PLATFORM_ARCHITECTURE_v2.1.md`.

# Platform Architecture 1.0

## The Meta Architecture of Embed Engine

### Status

**Version:** 1.0 (Draft)

Purpose:

Define the highest architectural model of the platform.

This document does **not** describe implementation.

It defines **where meaning is created, where it is executed, and where
it is projected.**

Everything below (Runtime, Client Studio, Manager Studio, Sales Studio,
AI, Analytics...) derives from this document.

------------------------------------------------------------------------

# Vision

Embed Engine is **not** a collection of applications.

It is a layered decision platform.

Each layer has exactly one responsibility.

Meaning is never duplicated.

Meaning flows in one direction only.

``` text
Authoring
      │
      ▼
Runtime
      │
      ▼
Terminal
      │
      ▼
Persona
```

------------------------------------------------------------------------

# Layer 1 --- Authoring Layer

Purpose:

Create the knowledge from which decisions can later emerge.

Authoring never creates live decisions.

It creates decision potential.

Primary environment:

**Builder**

Builder is the authoring environment of the platform.

Typical domains:

-   Knowledge
-   Objects
-   Business
-   Decision Models
-   Behavior Packs
-   Assets
-   AI Knowledge
-   Rules
-   Configurations

Output:

**Runtime-ready knowledge**

------------------------------------------------------------------------

# Layer 2 --- Runtime Layer

Purpose:

Transform authored knowledge into live meaning.

This is the only layer allowed to produce semantic interpretation.

Core:

**Decision Runtime**

Runtime owns:

-   Decision Session
-   Priority
-   Signals
-   Kernel
-   Interpretation
-   Decision Strategy
-   Decision Story
-   Decision Moves
-   Outcome

**Architectural invariant**

> Runtime is the single author of meaning.

------------------------------------------------------------------------

# Layer 3 --- Projection Layer

Purpose:

Project Runtime according to the needs of a specific persona.

Projection never creates meaning.

Projection only reveals it.

Projection is implemented through **Terminals**.

A Terminal is an Experience Surface that projects Runtime for a specific
role.

------------------------------------------------------------------------

# Personas

## Client Terminal

**Question**

> How should I decide?

## Manager Terminal

**Question**

> What is happening across my business?

## Sales Terminal

**Question**

> What should I do to close this case?

## Analytics Terminal

**Question**

> How is the system performing?

------------------------------------------------------------------------

# Unified Runtime

Every Terminal consumes the same Runtime.

``` text
               Decision Runtime
                      │
      ┌───────────────┼───────────────┐
      │               │               │
      ▼               ▼               ▼
 Client         Manager         Sales
 Terminal        Terminal      Terminal
                      │
                      ▼
              Analytics Terminal
```

No duplicated semantics.

Only different projections.

------------------------------------------------------------------------

# Information Flow

``` text
Builder

↓

Runtime

↓

Decision Session

↓

Terminal

↓

Persona
```

Only Runtime may change Decision Session state.

------------------------------------------------------------------------

# Architectural Invariants

1.  Builder authors knowledge.
2.  Runtime authors meaning.
3.  Terminals author nothing.
4.  Runtime is the only semantic engine.
5.  Every application is a Runtime projection.
6.  Terminals differ by perspective, never by data ownership.
7.  Decision Sessions are shared across all Terminals.

------------------------------------------------------------------------

# Summary

Embed Engine is a layered decision platform.

-   **Builder** creates knowledge.
-   **Runtime** transforms knowledge into live meaning.
-   **Terminals** project that meaning for different personas.

Every application is a specialized projection of the same Runtime.
