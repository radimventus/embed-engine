# Scroll Behavior Investigation — Client Studio

**Date:** 2026-07-22  
**Status:** Root cause identified (pre-fix)

## Environments probed

| Environment | URL | Wheel → `window.scrollY` | PageDown |
| --- | --- | --- | --- |
| Development | `:4173` | 0 → 800 | works |
| Reference Build | `:5174` | 0 → 800 | works |
| Embed demo | `:5180` | **stays 0** | works |
| GitHub Pages live | `…/embed/live.html` | **stays 0** | works |

## Scroll ownership

### Standalone (dev / reference)

- **Scrollport:** `document.documentElement` (viewport)
- `#root`, `body`, `main`, canvas: grow with content, `overflow: visible`, not scrollports
- Sidebar wrap: `sticky` + `h-screen` + `overflow-y: auto` (local only; empty)

### Embed (demo / Pages / Fpage via IIFE)

- **Intended scrollport:** still the viewport (`documentElement` can scroll: scrollHeight ≫ clientHeight)
- **Trap:** `[data-client-studio-root]` computes `overflow-x: auto` **and** `overflow-y: auto` (CSS: one non-`visible` axis forces the other), with `overscroll-behavior: none`
- Root height equals content → **cannot** scroll itself, but still acts as a wheel scrollport
- `overscroll-behavior: none` **blocks scroll chaining** to the document
- Result: wheel/touchpad no-op; dragging the **document** scrollbar still works; keyboard scrolls the document directly

## Wheel listeners

| Location | Behavior |
| --- | --- |
| `useHorizontalWheelScroll` (thumbnail rail) | `preventDefault` only when hovering the rail and mapping vertical→horizontal — not the page-wide failure |
| No other global `wheel` + `preventDefault` found |

## Overflow / height suspects

| Rule | File | Role in bug |
| --- | --- | --- |
| `overflow-x: auto` + `overscroll-behavior: none` on `[data-client-studio-root]` | `packages/embed/src/delivery/ensureStyles.ts` | **Root cause** |
| `overscroll-none` on `html, body, #root` | `apps/client-studio/src/index.css` (injected into host by Embed) | Contributes host-level overscroll lock; not the primary trap |
| Sidebar `h-screen overflow-y-auto` | `AppShell.tsx` | Nested scrollport; OK when chaining works |

## Conclusion

Not Runtime / Decision / Experience / layout structure.  
Embed shell CSS creates a non-scrolling overflow scrollport that swallows wheel/touchpad via `overscroll-behavior: none`.
