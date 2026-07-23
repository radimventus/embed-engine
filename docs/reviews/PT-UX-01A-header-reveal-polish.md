# PT-UX-01A — Header Polish & Reveal Timing

**Status:** COMPLETE  
**Date:** 2026-07-23  
**Size:** S (UX polish only)

---

## Changes

| Item | Result |
| --- | --- |
| Logo ↔ section left axis | Header inner rail = `w-canvas` + `px-section` (same as DesktopCanvas) |
| Actions ↔ section right axis | Same rail; Close/actions `justify-self-end` |
| Object label | `Client Studio / Modern 01` via presentation formatter (not Runtime ID) |
| Close button | Navy fill (`action.primary`) + white × (`action.onPrimary`) |
| Reveal duration | `500ms` → `750ms` (~+50%) |

---

## Validation (local live.html)

| Check | Measured |
| --- | --- |
| Logo delta vs content left | **0 px** |
| Actions delta vs content right | **0 px** |
| Header title | `Client Studio / Modern 01` |
| Close background | `rgb(0, 25, 48)` |
| Reveal `revealing`→`active` | ~600–750 ms band |
| Console errors | none |

### Evidence

- `docs/reviews/assets/pt-ux-01a-header.png`
- `docs/reviews/assets/pt-ux-01a-reveal.webm`

Cache-bust: `embed.iife.js?v=ux-01a` on Pages live demo.

Partner: use the same `?v=ux-01a` (or hard-refresh) after publish.
