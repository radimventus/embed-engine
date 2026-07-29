> **Status (kurace 2026-07-23):** HISTORICAL / ADR Candidate — Projection block curated into 01; C/N/I/A ownership = Open Question.

# PROJECTION_ARCHITECTURE

## Embed Engine Projection Architecture

### Version 1.0 (Draft)

# Purpose

Projection Architecture defines how Runtime is exposed to different
personas without creating new semantic meaning.

Runtime remains the single author of meaning. Projection adapts
visibility, emphasis and interaction.

------------------------------------------------------------------------

# Principle

Knowledge ↓ Runtime ↓ Projection ↓ Terminal ↓ Experience

Projection never creates semantics.

------------------------------------------------------------------------

# Core Concepts

## Perspective

Defines the question being asked.

Examples: - Client - Operations - Sales - Builder - Analytics

## Projection

Transforms Runtime into a role-specific view.

Projection may: - select information - prioritize information - organize
information - expose actions

Projection may NOT: - create interpretations - create stories - modify
Runtime semantics

## Terminal

A Terminal renders one Projection.

It provides interaction only.

------------------------------------------------------------------------

# Projection Pipeline

Runtime ↓ Perspective Selection ↓ Projection Composition ↓ Terminal
Rendering ↓ User Interaction ↓ Runtime

Only Runtime may update semantic state.

------------------------------------------------------------------------

# Projection Grammar

Every Projection contains:

1.  Context
2.  Narrative
3.  Insight
4.  Action

These blocks exist in every Terminal.

------------------------------------------------------------------------

# Operations Projection

Context: Organization

Narrative: Timeline

Insight: Operational Insights

Action: Investigate, Assign, Contact

------------------------------------------------------------------------

# Sales Projection

Context: Decision Identity

Narrative: Decision Journey

Insight: Signals + AI Recommendation

Action: Next Best Action

------------------------------------------------------------------------

# Client Projection

Context: My Situation

Narrative: Decision Story

Insight: Why this matters

Action: Continue Decision

------------------------------------------------------------------------

# Builder Projection

Context: Knowledge Model

Narrative: Model Evolution

Insight: Impact Analysis

Action: Improve Runtime

------------------------------------------------------------------------

# Architectural Invariants

-   Runtime owns meaning.
-   Projection owns presentation.
-   Terminal owns interaction.
-   Perspective defines intent.
-   Identity is independent from Perspective.
-   Permissions are independent from Projection.

------------------------------------------------------------------------

# Future Extensions

Additional Perspectives may be introduced without modifying Runtime.

Examples: - Customer Success - Partner - Executive - Support - AI
Supervisor

The platform grows by adding Projections, not semantic engines.
