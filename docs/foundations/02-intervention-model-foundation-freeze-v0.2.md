# 02 -- Intervention Model

## Foundation Freeze v0.2

# Reference Architecture

``` text
Interaction
      ↓
Signal
      ↓
Interpretation
      ↓
Evidence
      ↓
Context
      ↓
Hypothesis
      ↓
Insight
      ↓
Decision Strategy
      ↓
Intervention
      ↓
Delivery Strategy
      ↓
Experience Orchestrator
      ↓
Renderer
      ↓
Experience
      ↓
New Signals
```

## Newly Approved Layers

### Decision Strategy

Answers the question: \> Why is the system acting now?

Examples: - Learn - Explore - Validate - Resolve Conflict - Reduce
Risk - Increase Confidence - Commit

A strategy is not a UI, renderer, or intervention. It expresses the
system's intent.

------------------------------------------------------------------------

### Intervention

Answers the question: \> What cognitive change do we want to create?

Examples: - Reveal - Challenge - Compare - Explain - Guide - Focus

Interventions are abstract cognitive actions.

------------------------------------------------------------------------

### Delivery Strategy

Answers: \> How should the intervention be delivered in the current
context?

It considers: - renderer capabilities - timing - trust - context -
intensity - sequencing - multimodal delivery

------------------------------------------------------------------------

### Experience Orchestrator

Responsible for: - renderer selection - capability matching - fallback
scenarios - orchestration of multiple renderers - experience composition

The Kernel remains UI-independent.

## Approved Principles

1.  The Kernel never knows the UI.
2.  Renderers never make decisions.
3.  The Experience Orchestrator composes experiences.
4.  Strategy precedes intervention.
5.  Intervention precedes delivery.
6.  Delivery influences effectiveness, but never changes intent.

## Open Topics (Deferred)

-   Collaborative Decision Intelligence
-   Hypothesis Validation
-   External Context Recalibration
-   Dynamic Renderer Capabilities
-   Decision State Metrics

These are acknowledged but intentionally postponed.

## Out of Scope

-   Runtime
-   API
-   ADR
-   TypeScript
-   Data models
-   UI
-   AI prompts
-   Implementation

## Foundation Roadmap

1.  Decision Intelligence Model ✅
2.  Intervention Model (this document)
3.  Experience Model
4.  Evidence Model
5.  Hypothesis Model
6.  Context Model
7.  Decision Kernel Model
