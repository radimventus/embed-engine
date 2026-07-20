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

Decision Terminal **renders Decision Stories**.  
Story composition is **Decision Strategy**.  
Canonical vocabulary: [`architecture/decision-layer/README.md`](../architecture/decision-layer/README.md).

------------------------------------------------------------------------

## Decision Story / Strategy

Canonical definitions: [`architecture/decision-layer/README.md`](../architecture/decision-layer/README.md).

Do not redefine Decision Story, Decision Strategy, Decision Move, Decision Terminal, or Decision Trajectory in this foundations document.

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
