# @embed-engine/design-tokens

Immutable design tokens for the EMBED Engine.

## Purpose

This package defines the shared visual language of the platform: colors, typography, spacing, radius, shadows, and motion. It is the single source of truth for design values consumed by UI layers and applications.

## Responsibilities

- Export immutable token constants (`colors`, `typography`, `spacing`, `radius`, `shadows`, `motion`)
- Provide a single public API via `src/index.ts`
- Remain framework and runtime independent

This package contains **no logic**. Only exported constants.

## Forbidden Dependencies

Do not add:

- React or any UI framework
- CSS or Tailwind
- Utility or helper functions
- Browser or Node-specific APIs
- Runtime dependencies of any kind

Only pure TypeScript constants are permitted.

## Usage

```typescript
import { colors, typography, spacing } from '@embed-engine/design-tokens';

const brandColor = colors.foreground.primary;
const fontFamily = typography.fontFamily.sans;
const padding = spacing[4];
```

## Design Notes

- Tokens are defined with `as const` for immutability and strict typing.
- Semantic tokens (`background`, `foreground`, `status`) sit above primitive scales (`neutral`).
- Values align with the EMBED Platform boot screen and professional software UI conventions.
