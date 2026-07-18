# Embed Engine

# Builder Workflow Specification (BWS)

**Version:** 0.1 (Master Workflow)

------------------------------------------------------------------------

# Purpose

This document defines the canonical implementation workflow of Builder.

It is **not** a UI specification.

It is **not** an implementation document.

It is the source of truth describing every state, transition and
validation rule that Builder follows.

The workflow remains stable across Builder 0.1, 1.0 and 2.x.

Only the execution method changes.

------------------------------------------------------------------------

# Core Principle

Every workflow step contains exactly four parts:

1.  Goal
2.  Inputs
3.  Validation
4.  Output

Execution is version dependent:

-   Builder 0.1 → Human
-   Builder 1.0 → AI + Human
-   Builder 2.x → AI

------------------------------------------------------------------------

# Global Workflow

    01 Project Initialization
        ↓
    02 Media Collection
        ↓
    03 Knowledge Model
        ↓
    04 Behaviour Model
        ↓
    05 Priority Engine
        ↓
    06 Client Studio Content
        ↓
    07 Validation
        ↓
    08 Publish
        ↓
    09 Analytics
        ↓
    10 Retrospective

------------------------------------------------------------------------

# PHASE 01 --- Project Initialization

## Step 01

Goal: Create project shell.

Inputs:

-   Client
-   Project name
-   Brand
-   Contacts

Validation:

-   Required fields completed
-   Unique identifier assigned

Output:

Project created.

------------------------------------------------------------------------

# PHASE 02 --- Media Collection

## Step 02

Collect:

-   Hero renders
-   Gallery
-   Videos
-   Floor plans
-   Logos
-   Documents

Validation:

-   Resolution
-   Aspect ratio
-   Completeness
-   Licensing

Output:

Media Library complete.

------------------------------------------------------------------------

# PHASE 03 --- Knowledge Model

## Step 03

Capture objective project facts.

Examples:

-   Location
-   Architecture
-   Layout
-   Standards
-   Technology
-   Surroundings
-   Pricing
-   Availability

Validation:

Every required attribute exists.

Output:

Knowledge Model completed.

------------------------------------------------------------------------

# PHASE 04 --- Behaviour Model

## Step 04

Describe the customer.

Capture:

-   Personas
-   Motivations
-   Pain points
-   Decision triggers
-   Objections
-   Questions
-   Desired outcomes

Validation:

Each persona contains motivations, fears and decision criteria.

Output:

Behaviour Model complete.

------------------------------------------------------------------------

# PHASE 05 --- Priority Engine

## Step 05

Translate Behaviour Model into prioritised communication.

Define:

-   Core value proposition
-   Priority hierarchy
-   Benefit ordering
-   CTA strategy

Validation:

Every priority maps back to Behaviour Model.

Output:

Priority Engine ready.

------------------------------------------------------------------------

# PHASE 06 --- Client Studio Modules

Each module follows the same template.

## Hero

Goal

Inputs

Validation

Output

## Video

Goal

Inputs

Validation

Output

## House Navigator

Goal

Inputs

Validation

Output

## Priority Engine

Goal

Inputs

Validation

Output

## FAQ

Goal

Inputs

Validation

Output

## AI Advisor

Goal

Inputs

Validation

Output

## Audit

Goal

Inputs

Validation

Output

## Contact

Goal

Inputs

Validation

Output

------------------------------------------------------------------------

# PHASE 07 --- Validation

Global checks:

-   Missing content
-   Broken links
-   Copy consistency
-   Visual consistency
-   Behaviour consistency
-   Priority consistency

Output:

Project Approved.

------------------------------------------------------------------------

# PHASE 08 --- Publish

Tasks:

-   Generate Client Studio
-   Generate Embed
-   Install
-   Test
-   Production Release

Output:

Live Project.

------------------------------------------------------------------------

# PHASE 09 --- Analytics

Collect:

-   Session flow
-   Priority usage
-   AI interactions
-   Audit requests
-   Contact conversion

Output:

Pilot metrics.

------------------------------------------------------------------------

# PHASE 10 --- Retrospective

For every implementation capture:

## Keep

What worked.

## Improve

What should become Builder functionality.

## Missing

New workflow rule.

## Remove

Unused step.

Output:

New Builder knowledge.

------------------------------------------------------------------------

# State Machine

Every workflow node has only four states:

-   Not Started
-   In Progress
-   Review Required
-   Completed

Transitions:

Not Started → In Progress → Review Required → Completed

No other transitions are allowed.

------------------------------------------------------------------------

# Golden Rule

Builder never asks:

"What would you like to do?"

Builder always knows the next required step.

Its responsibility is to guide implementation toward a complete
Behaviour Model from which a complete Client Studio can be generated.

This document is the master specification from which all Builder
versions are derived.
