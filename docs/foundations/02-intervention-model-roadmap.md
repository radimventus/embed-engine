# Foundations Roadmap

## Document Structure

``` text
docs/foundations/
├── README.md
├── 01-decision-intelligence-model.md          ✅ Foundation Freeze v0.1
├── 02-intervention-model.md                   ← CURRENT NEXT STEP
├── 03-experience-model.md
├── 04-evidence-model.md
├── 05-hypothesis-model.md
├── 06-context-model.md
└── 07-decision-kernel-model.md
```

## Current Focus

**Document:**

`docs/foundations/02-intervention-model.md`

### Purpose

The Intervention Model defines **what the system can do** once it
understands the user's decision state.

It bridges the gap between:

-   Decision Intelligence Model
-   Experience Model
-   Decision Kernel
-   Runtime

The Intervention Model is technology-agnostic and describes intervention
types, goals, expected effects, prerequisites, and renderer
independence.

This document becomes the behavioral foundation of Embed Engine.
