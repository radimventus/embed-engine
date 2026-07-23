# Hero — Reference Implementation v1.0

**Status:** FROZEN  
**Version:** v1.0  
**Label:** Reference Implementation  
**Date:** 2026-07-23  
**Freeze SSOT:** [HERO-V1-FREEZE.md](../architecture/HERO-V1-FREEZE.md)  
**Release notes:** [Hero-v1.0-Freeze.md](../releases/Hero-v1.0-Freeze.md)

---

## Purpose

Hero v1.0 is the **pilot reference opening scene** of the Decision Experience.

It is the single visual and behavioral source of truth for:

- Client Studio Hero
- Embed Hero (partner-page projection)
- Future partner deployments

Implementations must **project** this reference — not redesign it.

---

## Canonical sources

| Layer | Path |
|-------|------|
| Client Studio Hero | `apps/client-studio/src/features/client-studio/sections/Hero/` |
| Embed Hero projection | `packages/embed/src/launcher/embedHero/` |
| Design freeze | `docs/architecture/HERO-V1-FREEZE.md` |

---

## Identity (frozen)

- One card: media + content + Social Proof
- Desktop grid: text **1/3** · media **2/3**
- Primary CTA opens Experience (Embed) / anchors Journey (Studio)
- Reveal + Close behavior as shipped with pilot Embed Experience

---

## Relation to other freezes

| Artifact | Scope |
|----------|--------|
| **Hero v1.0** (this doc) | Opening scene only |
| [Gen1](./Client-Studio-Gen1.md) | Full static Studio etalon |
| [Morning Baseline](./Client-Studio-Morning-Baseline.md) | Historical pre–22-Jul Studio image |
| [Reference Build](./Client-Studio-Reference.md) | Broader visual regression etalon |
