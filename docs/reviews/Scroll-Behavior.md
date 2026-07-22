# Client Studio — Scroll Behavior

**Status:** FIXED  
**Date:** 2026-07-22  
**Scope:** Natural vertical scrolling (wheel, touchpad, keyboard, scrollbar) across Development, Reference Build, and Embed hosts

---

## Root cause

Embed shell CSS on `[data-client-studio-root]` used:

```css
overflow-x: auto;
overscroll-behavior: none;
```

Per CSS Overflow, a non-`visible` `overflow-x` forces `overflow-y` to compute to `auto`. The mount node became a **vertical wheel scrollport** even though its height grew with content (`scrollHeight === clientHeight` → nothing to scroll).

`overscroll-behavior: none` then **blocked scroll chaining** to `document.documentElement`.

| Input | Before fix (Embed) | Why |
| --- | --- | --- |
| Mouse wheel / touchpad | No movement | Consumed by non-scrolling overflow port; no chain |
| Document scrollbar drag | Worked | Directly scrolls the viewport |
| PageDown / Space / arrows | Worked | Keyboard scrolls the document, not via wheel chaining |

Standalone Development (`:4173`) and Reference Build (`:5174`) never used this shell rule — viewport scrolling already worked there.

This is **not** a Runtime, Decision Layer, Experience, or layout-structure defect. It is Embed delivery shell CSS.

Investigation notes: [Scroll-Behavior-Investigation.md](./Scroll-Behavior-Investigation.md)

---

## Fix

In `packages/embed/src/delivery/ensureStyles.ts`:

1. Set `overflow-y: clip` alongside `overflow-x: auto` so horizontal overflow remains possible without a vertical scrollport trap.
2. Set `overscroll-behavior: auto` on the mount root (and restore `html` / `body` overscroll after injected Studio base styles).

**Single vertical scrollport:** `document.documentElement` (viewport), same as standalone Studio.

Layout, Runtime, and Experience modules were not changed.

---

## Scroll ownership (after fix)

| Environment | Vertical scrollport |
| --- | --- |
| Development | `document.documentElement` |
| Reference Build | `document.documentElement` |
| Embed (demo / Pages / Fpage IIFE) | `document.documentElement` |

Nested scroll (intentional, local only):

- Thumbnail rail: horizontal wheel remap while pointer is over the rail (`useHorizontalWheelScroll`)
- Sidebar sticky column: `overflow-y: auto` only if sidebar content exceeds viewport
- Panels (Terminal, Conversation, etc.): local `overflow-y-auto` inside sections

---

## Validation

Playwright (viewport 1440×900), center-page wheel + keyboard:

| Environment | Wheel `scrollY` | PageDown | Space |
| --- | --- | --- | --- |
| Development `:4173` | 600 | ok | ok |
| Reference `:5174` | 600 | ok | ok |
| Embed demo `:5180` | 600 (was 0) | ok | ok |

GitHub Pages: rebuild + `sync:pages` includes the shell fix; live IIFE must be redeployed (push `docs/embed`).

Keyboard covered: Space, PageDown, Home (reset), and document scrollbar path unchanged.

---

## Known limitations

1. **Thumbnail rail:** while the pointer is over the horizontal rail and it can scroll sideways, vertical wheel is remapped to `scrollLeft` (by design). Move the pointer off the rail for page scroll.
2. **Section panels** with their own `overflow-y-auto` (e.g. Decision Terminal body, AI conversation) scroll locally when focused/hovered — normal nested UI scroll.
3. **`overflow-y: clip`:** older browsers may compute it as `hidden`; wheel chaining still validated in Chromium after the fix.

---

## Update / deploy

```bash
pnpm --filter @embed-engine/embed build
pnpm --filter @embed-engine/embed sync:pages
# commit docs/embed + ensureStyles, push Pages branch
```
