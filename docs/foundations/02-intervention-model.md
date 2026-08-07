# 02 -- Intervention Model

**Foundations v0.1**

## Purpose

The Intervention Model defines **what the system can do after it
understands the user's decision state**.

The Decision Intelligence Model explains how the platform thinks.

The Intervention Model explains how the platform acts.

An intervention is **not** a UI element, component, popup, animation, or
AI message.

An intervention is an intentional cognitive action designed to improve
the user's mental model of the object.

------------------------------------------------------------------------

# Core Principle

The Decision Kernel never selects a screen.

The Decision Kernel selects an **Intervention**.

Renderers decide how that intervention is expressed.

``` text
Insight
    ↓
Intervention
    ↓
Renderer
    ↓
Experience
```

------------------------------------------------------------------------

# Intervention Definition

An intervention consists of:

-   Intent
-   Preconditions
-   Expected cognitive effect
-   Success indicators
-   Compatible renderer capabilities

It never contains UI implementation.

------------------------------------------------------------------------

# Fundamental Principles

1.  Interventions are renderer-independent.
2.  Interventions operate on understanding, not persuasion.
3.  Every intervention has a measurable purpose.
4.  Different renderers may express the same intervention differently.
5.  Interventions may strengthen, weaken or validate hypotheses.
6.  No renderer creates interventions on its own.
7.  The Kernel is the single source of orchestration.

------------------------------------------------------------------------

# Intervention Lifecycle

``` text
Hypothesis
    ↓
Insight
    ↓
Intervention Selection
    ↓
Renderer Selection
    ↓
Experience
    ↓
New Signals
```

------------------------------------------------------------------------

# Canonical Intervention Types

## Reveal

Expose information that reduces uncertainty.

## Validate

Confirm an emerging understanding or hypothesis.

## Challenge

Introduce evidence that questions an incorrect assumption.

## Focus

Reduce cognitive load by directing attention.

## Compare

Place alternatives into meaningful context.

## Guide

Recommend a logical next exploration step.

## Anchor

Stabilize understanding around an important concept.

## Calm

Reduce confusion or decision anxiety.

## Explain

Provide missing context or causal relationships.

## Summarize

Compress accumulated knowledge into a coherent mental model.

------------------------------------------------------------------------

# Renderer Independence

Possible renderers include:

-   Priority Panel
-   AI Copilot
-   Media Gallery
-   Video
-   Compare Engine
-   Report
-   CTA
-   Future renderers

Each renderer implements only the presentation.

------------------------------------------------------------------------

# Capability Matching

Not every renderer can express every intervention equally well.

A capability layer maps interventions to renderer abilities.

Example:

-   Challenge → AI, Panel, Report
-   Reveal → Gallery, Video, AI
-   Summarize → Report, AI

The Decision Kernel selects an intervention.

The orchestration layer selects a compatible renderer.

------------------------------------------------------------------------

# Success Criteria

An intervention is successful when it improves the user's mental
representation of the object.

Success is evaluated through subsequent signals rather than immediate
clicks.

------------------------------------------------------------------------

# Non-goals

The Intervention Model does not define:

-   Runtime implementation
-   APIs
-   UI layouts
-   Components
-   AI prompts
-   Data structures

Those belong to lower architectural layers.

------------------------------------------------------------------------

# Relationship to Other Foundation Documents

``` text
01 Decision Intelligence Model
        ↓
02 Intervention Model
        ↓
03 Experience Model
        ↓
04 Evidence Model
        ↓
05 Hypothesis Model
        ↓
06 Context Model
        ↓
07 Decision Kernel Model
```
