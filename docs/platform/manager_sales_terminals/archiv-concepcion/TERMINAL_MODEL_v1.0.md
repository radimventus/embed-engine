> **Status (kurace 2026-07-23):** ARCHIVE CANDIDATE — merged into 03 Terminal Framework.

# TERMINAL_MODEL

## Embed Engine Terminal Model

### Version 1.0 (Draft)

# Purpose

A Terminal is the execution surface of a Projection.

It does not interpret knowledge. It does not own business logic. It
renders a Projection produced from Runtime.

------------------------------------------------------------------------

# Terminal Definition

Knowledge ↓ Runtime ↓ Projection ↓ Terminal ↓ Human

The Terminal is the interaction boundary between Runtime and the user.

------------------------------------------------------------------------

# Responsibilities

A Terminal SHALL:

-   render Projection
-   collect interactions
-   display context
-   display narrative
-   display insights
-   expose actions
-   return user interactions to Runtime

A Terminal SHALL NOT:

-   create semantic meaning
-   interpret data independently
-   own business rules
-   duplicate Runtime state

------------------------------------------------------------------------

# Internal Structure

Terminal ├── Context ├── Narrative ├── Insight ├── Action └──
Interaction Channel

------------------------------------------------------------------------

# Lifecycle

1.  Receive Projection
2.  Render View
3.  Capture Interaction
4.  Send Intent to Runtime
5.  Receive Updated Projection
6.  Re-render

------------------------------------------------------------------------

# Interaction Contract

Input: - Projection - Perspective - Identity - Permissions

Output: - User Intent - User Actions - Navigation Events

------------------------------------------------------------------------

# Terminal Types

Client Terminal - decision experience

Operations Terminal - operational overview

Sales Terminal - decision coaching

Builder Terminal - knowledge authoring

Analytics Terminal - pattern exploration

------------------------------------------------------------------------

# Architectural Invariants

-   Runtime owns semantics.
-   Projection owns composition.
-   Terminal owns presentation.
-   UI never becomes the source of truth.

------------------------------------------------------------------------

# Design Goal

Every new application in Embed Engine should first be expressible as a
new Terminal over an existing Projection before introducing any new
Runtime capability.
