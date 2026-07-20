# Foundations

> **The constitutional layer of Embed Engine**

## Purpose

The `foundations` directory contains the timeless conceptual models that
define how Embed Engine thinks.

These documents do **not** describe implementation.

They define the architectural principles from which every lower layer is
derived.

------------------------------------------------------------------------

# Architectural Hierarchy

``` text
Foundations
        ↓
Architecture Decision Records (ADR)
        ↓
Contracts
        ↓
Runtime
        ↓
Client Studio
        ↓
Experience
        ↓
Implementation
```

Every lower layer must remain consistent with the layers above it.

------------------------------------------------------------------------

# What Foundations Are

Foundations define:

-   core principles
-   mental models
-   responsibilities
-   conceptual boundaries
-   architectural vocabulary

Foundations deliberately avoid technology.

------------------------------------------------------------------------

# What Foundations Are Not

Foundations do **not** define:

-   TypeScript
-   React
-   APIs
-   Runtime
-   Data structures
-   UI components
-   AI prompts
-   Implementation details

Those belong to lower architectural layers.

------------------------------------------------------------------------

# Foundation Documents

## 01 --- Decision Intelligence Model

**Question**

> How does the system think?

------------------------------------------------------------------------

## 02 --- Intervention Model

**Question**

> How does the system act?

------------------------------------------------------------------------

## 03 --- Experience Model

**Question**

> How does the user experience decision transformation?

------------------------------------------------------------------------

## 04 --- Context Model

**Question**

> In what context are decisions interpreted?

------------------------------------------------------------------------

## 05 --- Evidence Model

**Question**

> What evidence does the system reason from?

------------------------------------------------------------------------

## 06 --- Hypothesis Model

**Question**

> How does understanding emerge?

------------------------------------------------------------------------

## 07 --- Decision Strategy Model

**Question**

> Why does the system act now?

------------------------------------------------------------------------

## 08 --- Experience Orchestrator Model

**Question**

> How are interventions composed into experiences?

------------------------------------------------------------------------

## 09 --- Decision Kernel Model

**Question**

> How are all foundation models orchestrated?

------------------------------------------------------------------------

# Development Workflow

Every foundational model follows the same lifecycle.

``` text
Discovery
    ↓
Draft
    ↓
Architecture Review
    ↓
Revision
    ↓
Freeze
    ↓
ADR
    ↓
Implementation
```

No implementation should precede a stable conceptual model.

------------------------------------------------------------------------

# Design Rules

Every new architectural idea must answer four questions.

1.  Which layer does it belong to?
2.  Is it timeless enough for Foundations?
3.  Does it belong instead to ADR or Runtime?
4.  Will this still be true in five years?

If the answer to the last question is "no", it is not a Foundation.

------------------------------------------------------------------------

# Mission

Embed Engine is not built around screens or features.

It is built around a coherent theory of Decision Intelligence.

The purpose of the Foundations is to preserve that theory as the stable
source of truth for the entire platform.
