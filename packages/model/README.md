# @embed-engine/model

Domain model for the EMBED Engine.

## Purpose

This package defines the core domain vocabulary of the engine: entities, value objects, and enums. It is the foundation layer on which services, UI, and applications are built.

The model is designed as a reusable sales engine. Client Studio is one consumer; the types are not tied to a single industry.

## Responsibilities

- Define domain entities (`Project`, `House`, `Floor`, `Room`, `Asset`, `Lead`, `Recommendation`, `Metadata`, `Theme`, `Pipeline`)
- Define immutable value objects (`Id`, `Coordinates`, `Media`, `Money`, `Area`)
- Define string-based domain enums (`AssetType`, `HouseStatus`, `LeadStatus`, `Priority`, `RoomType`, `Visibility`)
- Export a single public API via `src/index.ts`

This package contains **no business logic**. Entities expose properties and simple getters only.

## Forbidden Dependencies

This package must remain framework and runtime independent.

Do not add:

- React or any UI framework
- Browser APIs (`window`, `document`, `fetch`, etc.)
- HTTP clients or server frameworks
- Node-specific modules (`fs`, `path`, `process`, etc.)
- Runtime dependencies of any kind

Only pure TypeScript is permitted.

## Usage

```typescript
import {
  Project,
  House,
  Id,
  Money,
  HouseStatus,
  Visibility,
} from '@embed-engine/model';

const project = new Project(
  new Id('project-1'),
  'Summer Campaign',
  'Q3 sales initiative',
  Visibility.Public,
  '2026-07-14T00:00:00.000Z',
  '2026-07-14T00:00:00.000Z',
);
```

## Design Notes

- Cross-entity relationships use `Id` references to avoid circular dependencies and keep aggregates lightweight.
- `House` represents a sellable unit with spatial structure; naming reflects the current product domain without encoding industry-specific assumptions into other types.
- `Recommendation.targetId` references any sellable unit, not only houses.
- Timestamps are ISO 8601 strings to avoid environment-specific date APIs.
