# 03 -- Experience Model

## Foundations v0.1

## Purpose

The Experience Model defines how Embed Engine transforms decision
intelligence into a coherent decision experience.

It does not define UI, screens, layouts, or components.

It defines how the user's understanding of an object evolves over time.

------------------------------------------------------------------------

## Definition

Experience is **a guided sequence of interventions that progressively
transforms the user's mental model of an object, enabling higher-quality
decisions.**

------------------------------------------------------------------------

## Core Principle

The system never guides users toward clicks.

The system guides users toward understanding.

Clicks are consequences, not objectives.

------------------------------------------------------------------------

## Experience Pipeline

``` text
Decision Intelligence
        ↓
Decision Strategy
        ↓
Intervention
        ↓
Delivery Strategy
        ↓
Experience
        ↓
Decision Transformation
```

------------------------------------------------------------------------

## Experience States

-   Discover
-   Explore
-   Understand
-   Resolve
-   Commit

These are cognitive states rather than funnel stages.

------------------------------------------------------------------------

## Experience Composition

Experience is composed of multiple interventions.

Example:

Reveal → Compare → Explain → Challenge → Validate → Summarize

Order changes the experience.

------------------------------------------------------------------------

## Experience Rhythm

The rhythm of interventions matters.

Too much Reveal → overload

Too much Challenge → defensiveness

Too much Explain → fatigue

Too much Compare → analysis paralysis

------------------------------------------------------------------------

## Experience Memory

Experience remembers:

-   explored knowledge
-   confirmed hypotheses
-   rejected assumptions
-   unresolved conflicts
-   previously delivered interventions

------------------------------------------------------------------------

## Experience Continuity

Experience continues across sessions.

The platform resumes the decision process rather than merely restoring a
page.

------------------------------------------------------------------------

## Experience Quality

Quality is measured by:

-   improved understanding
-   reduced uncertainty
-   conflict resolution
-   stronger mental model
-   higher decision quality

Not by clicks.

------------------------------------------------------------------------

## Experience Completion

Experience ends when additional interventions no longer improve the
current decision process.

------------------------------------------------------------------------

## Renderer Independence

The same experience may be delivered through:

-   Decision Terminal (Experience Surface — panel, fullscreen, sheet, conversation, voice, …)
-   AI Advisor
-   Priority
-   FAQ
-   Recommendation
-   Video / Gallery explorers
-   Report
-   Multiple surfaces together

Decision Terminal **renders Decision Stories** (ordered Decision Moves + cursor).  
Story composition is **Decision Strategy** (Decision Layer), not UI.  
See [`docs/architecture/decision-layer/decision-strategy.md`](../architecture/decision-layer/decision-strategy.md).

------------------------------------------------------------------------

## Decision Story (Decision Layer)

A Decision Story is an ordered sequence of **Decision Moves** plus cursor/status.

It is composed by **Decision Strategy** (hybrid select/compose) from Interpretation + Behavior Pack.

**Stages / Acts / Chapters are not first-class.** Optional Move intents may exist.

SSOT: [`docs/architecture/decision-layer/decision-strategy.md`](../architecture/decision-layer/decision-strategy.md).

------------------------------------------------------------------------

## Decision Strategy (foundations alignment)

Decision Strategy’s single responsibility: **compose the active Decision Story**.

Kernel ends at Interpretation. Strategy is not UI and not `project()`.

------------------------------------------------------------------------

## Non-goals

This document intentionally excludes:

-   UI
-   Runtime
-   APIs
-   Components
-   Data models
-   AI prompts
-   Implementation

------------------------------------------------------------------------

## Relationship to Foundations

1.  Decision Intelligence Model
2.  Intervention Model
3.  Experience Model
4.  Context Model
5.  Evidence Model
6.  Hypothesis Model
7.  Decision Strategy Model
8.  Experience Orchestrator Model
9.  Decision Kernel Model
