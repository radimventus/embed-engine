# @embed-engine/decision

Decision domain foundation for the EMBED Engine.

## Purpose

This package defines the universal decision categories and structures that describe a sellable object from a decision-making perspective. It is the foundation for:

- Decision Matrix
- Interpretation Engine
- AI Advisor
- Decision Report
- Recommendation Engine
- Studio Manager

This is a **domain-model package**. It contains no business logic, no React, and no rendering.

## Architecture

```
OBJECT
        ↓
Decision Matrix          Decision Filter
(object perspective)       (visitor perspective)
        ↓                        ↓
        └──────────┬─────────────┘
                   ↓
           Interpretation
                   ↓
           Experience Layer
```

- **Decision Matrix** describes the **object** — normalized scores per category (0.00–1.00).
- **Decision Filter** describes the **visitor** — calibrated importance per category (future sprint).
- **Interpretation Engine** combines both to produce meaning for the experience layer.

## Models

| Type | Role |
|------|------|
| `DecisionCategory` | Universal category definition (id, title, description, icon) |
| `DecisionCategoryScore` | Normalized score for one category |
| `DecisionMatrix` | Versioned matrix attached to an object type |
| `InterpretationRules` | Placeholder for future interpretation rules |

## Scores

All scores use normalized values in the closed interval **0.00–1.00**.

No percentages. No raw numeric labels in the domain model.

## Initial Categories

Temporary placeholders (methodology workshop will refine names):

`energy`, `operating-costs`, `layout`, `privacy`, `design`, `quality`, `plot`, `investment`, `maintenance`, `flexibility`

## Object Package

> **TODO:** Decision Matrix will become part of Object Package in a future sprint.
>
> Do not connect House Package yet.

## Example

See `src/decision-matrix.example.ts` for an architectural example. It is **not** exported from the public API and is **not** connected to UI.

## Usage

```typescript
import {
  DECISION_CATEGORIES,
  type DecisionMatrix,
  type DecisionCategory,
} from '@embed-engine/decision';

const matrix: DecisionMatrix = {
  version: '1.0',
  objectType: 'house',
  categories: [{ categoryId: 'energy', score: 0.91 }],
};
```

## Forbidden Dependencies

- React or any UI framework
- Browser or HTTP APIs
- Business logic or rendering

Pure TypeScript exports only.
