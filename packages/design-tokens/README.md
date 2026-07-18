# @embed-engine/design-tokens

Immutable design tokens for the EMBED Engine.

## Purpose

This package defines the shared visual language of the platform: colors, typography, spacing, radius, shadows, and motion. It is the single source of truth for design values consumed by UI layers and applications.

## Color system

One palette — four values only:

| Token | Hex |
|-------|-----|
| `palette.navy` | `#001325` |
| `palette.warmWhite` | `#FAF9F6` |
| `palette.lightGray` | `#E3E3E3` |
| `palette.gold` | `#C8A165` |

All semantic tokens (`background`, `foreground`, `border`, `brand`, `surface`, `neutral`, `status`) resolve exclusively to these four values. Applications must not introduce local hex colors or default Tailwind gray/white utilities.

## Responsibilities

- Export immutable token constants (`palette`, `colors`, `typography`, `spacing`, `radius`, `shadows`, `motion`)
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
import { colors, palette, typography, spacing } from '@embed-engine/design-tokens';

const brandColor = colors.brand.navy;
const surface = palette.warmWhite;
```
