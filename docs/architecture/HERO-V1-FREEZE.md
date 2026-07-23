# Hero v1.0 — Design Freeze

**Status:** FROZEN  
**Version:** Hero Reference Implementation v1.0  
**Date:** 2026-07-23  
**Ticket:** PT-HERO-FREEZE-01  
**SSOT for:** Pilot Hero layout, visual design, and entry behavior  
**Not SSOT for:** Runtime Kernel algorithms, Object Package schema, non-Hero Journey sections

---

## Verdict

Hero v1.0 is the **reference implementation (SSOT)** for the pilot opening Experience scene.

Parity is confirmed across:

| Surface | Role |
|--------|------|
| Localhost Client Studio Hero | In-Studio opening scene |
| GitHub Pages / Embed live | Production delivery |
| Partner deployment (Embed Hero) | Host-page projection |

Further work **projects** this Hero — it does **not** redesign it.

---

## Reference Implementation v1.0

| Label | Value |
|-------|--------|
| Name | Hero Reference Implementation v1.0 |
| Client Studio | `apps/client-studio/src/features/client-studio/sections/Hero/` |
| Embed projection | `packages/embed/src/launcher/embedHero/` |
| Policy | This document |
| Release note | [Hero-v1.0-Freeze.md](../releases/Hero-v1.0-Freeze.md) |
| Catalog entry | [Hero-v1.0.md](../reference/Hero-v1.0.md) |

Provenance: PT-HERO-00 (sync to public), PT-HERO-00A (1/3·2/3 grid + Social Proof in card).

---

## Freeze scope

### Layout

- Hero composition (text / media)
- Text ↔ media ratio (**1/3 · 2/3** desktop; stacked compact)
- Hero + Social Proof as **one card**
- Spacing and grid

### Visual design

- Typography
- Color
- CTA
- Photography / veil
- Reveal Layer (landing reveal into Experience)
- Experience Header (including Close)

### Behavior

- Opening Client Studio from Embed CTA
- Reveal animation
- Close button
- Transitions tied to the above

---

## Change policy

### Allowed after freeze

- Bug fixes
- Responsive adaptations that **do not** change identity
- Performance optimizations
- Accessibility improvements
- Pilot-validated changes (explicit product decision)

### Not allowed

- Hero redesign
- Composition changes
- New CTA concepts / copy experiments as redesign
- Visual identity changes
- Experimental visual tweaks without freeze amendment

Breaking the freeze requires an explicit amendment to this document (and a new version label if identity changes).

---

## Projection rule

| Consumer | Obligation |
|----------|------------|
| Embed Hero | Project Hero v1.0 — do not invent a parallel design |
| Client Studio Hero | Remain the in-Studio reference of the same identity |
| Future partner deployments | Use official projection / snippet; no one-off Hero redesigns |

New implementations **must project** Hero v1.0, not redesign it.

---

## Validation (freeze gate)

| Check | Status |
|-------|--------|
| localhost ≈ GitHub Pages ≈ partner | Confirmed (PT-HERO-00 / 00A / Embed Hero / INT) |
| Visual consistency of Hero | Confirmed |
| Ready as reference Experience entry | Confirmed |
| Later sprints proceed without Hero redesign | Policy in force |

---

## Related

- [CSS Isolation Policy](./CSS-Isolation-Policy.md) — host CSS must not rewrite Hero identity
- [Client Studio Gen1](../reference/Client-Studio-Gen1.md) — full Studio freeze (broader than Hero)
- [Morning Baseline](../reference/Client-Studio-Morning-Baseline.md) — historical pre–22-Jul snapshot
