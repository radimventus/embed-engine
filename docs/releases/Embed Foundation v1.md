# Embed Foundation v1

**Status:** COMPLETE  
**Closed:** 2026-07-22  
**Branch:** `feature/cap-p04-founding-partner`  
**Tag:** `embed-foundation-v1`  
**Next stage:** Decision Experience

---

## Summary

Embed Foundation is closed as a distinct project milestone. Production Embed delivers Client Studio; visual parity and scroll behavior are verified; a Reference Build etalon is available for regression.

**Out of pilot scope (deferred):** Konverzky / commercial conversion beyond the existing Client Studio surfaces already shipped in Gen1.

---

## Completed in this stage

| Area | Outcome |
| --- | --- |
| Runtime stabilization | Decision Session Runtime shared; no duplicate Runtime in Embed |
| Client Studio integration | Gen1 Experience as production renderer |
| Delivery Layer | `Embed.mount({ target, objectId, assetBase? })` → Object Package → Runtime → ClientStudioApp |
| Production Embed | GitHub Pages IIFE + live host |
| Rendering parity | Full Tailwind CSS, fonts, shell isolation, assets |
| Scroll behavior | Document as single vertical scrollport under Embed |
| Reference Build | Frozen etalon at http://127.0.0.1:5174/ (`pnpm reference`) |

---

## Environments

| Environment | Entry |
| --- | --- |
| Development | http://127.0.0.1:4173/ |
| Production Embed | https://radimventus.github.io/embed-engine/embed/ |
| Reference Build | http://127.0.0.1:5174/ |

---

## Canonical documentation

- [Client-Studio-Reference.md](../reference/Client-Studio-Reference.md)
- [ADR-Reference-Build.md](../adr/ADR-Reference-Build.md)
- [Embed-Rendering-Parity.md](../reviews/Embed-Rendering-Parity.md)
- [Scroll-Behavior.md](../reviews/Scroll-Behavior.md)
- [Embed-Delivery-Client-Studio.md](../reviews/Embed-Delivery-Client-Studio.md)
- [GitHub Pages Distribution.md](./GitHub%20Pages%20Distribution.md)

---

## Closure rule

Further product work continues under **Decision Experience** (and related platform docs). Embed Foundation artifacts should not be casually rewritten; refresh Reference Build only by explicit team decision (`pnpm reference:freeze`).
