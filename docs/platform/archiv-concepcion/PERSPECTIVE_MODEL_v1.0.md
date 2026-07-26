> **Status (kurace 2026-07-23):** HISTORICAL / ADR Candidate — Perspective curated into 01 where compatible.

# PERSPECTIVE_MODEL

## Embed Engine Perspective Model

### Version 1.0 (Draft)

# Purpose

A Perspective defines the intent with which an identity interacts with
the Runtime.

A Perspective is neither an identity nor a permission.

It answers one question:

> What question is being asked of the Runtime?

------------------------------------------------------------------------

# Relationship

Identity ↓ Permissions ↓ Perspective ↓ Projection ↓ Terminal ↓ Runtime

------------------------------------------------------------------------

# Responsibilities

A Perspective:

-   defines intent
-   selects a projection
-   determines focus
-   prioritizes information
-   enables role-specific actions

A Perspective never:

-   creates semantic meaning
-   modifies Runtime
-   owns business data

------------------------------------------------------------------------

# Perspective Structure

Perspective ├── id ├── audience ├── purpose ├── context ├── focus ├──
narrative ├── insight ├── actions └── projection

------------------------------------------------------------------------

# Standard Perspectives

## Client

Question: How should I decide?

Focus: Decision Story

Action: Continue Decision

------------------------------------------------------------------------

## Operations

Question: What changed since my last visit?

Focus: Timeline

Action: Investigate

------------------------------------------------------------------------

## Sales

Question: What is the next best action?

Focus: Decision Journey

Action: Contact / Follow-up

------------------------------------------------------------------------

## Builder

Question: How can the model be improved?

Focus: Knowledge & Runtime

Action: Author

------------------------------------------------------------------------

## Analytics

Question: What patterns are emerging?

Focus: Aggregated Runtime

Action: Explore

------------------------------------------------------------------------

# Composite Perspectives

Perspectives may be composed.

Examples:

Operations + Sales

Builder + Analytics

Executive + Operations

Composite Perspectives never change Runtime semantics. They only change
projection.

------------------------------------------------------------------------

# Architectural Invariants

-   Identity is persistent.
-   Perspective is temporary.
-   Permissions control access.
-   Perspective controls projection.
-   Runtime remains the single semantic authority.

------------------------------------------------------------------------

# Design Goal

Every future terminal should be created by defining a new
Perspective---not by creating a new semantic subsystem.
