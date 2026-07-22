# ADR — Client Studio Reference Build

**Status:** Accepted  
**Date:** 2026-07-22  
**ID:** ADR-Reference-Build

---

## Context

Client Studio has two active moving surfaces:

1. **Development** (`localhost:4173`) — changes continuously during implementation.
2. **Production Embed** (GitHub Pages IIFE) — delivery to host pages.

After further development, localhost is no longer a stable baseline for UX review or visual regression. The team needs a third, **intentionally frozen** instance that preserves the visual / UX state of Client Studio without blocking Runtime or product evolution.

---

## Decision

**Client Studio maintains a durable Reference Build used for visual regression testing and UX comparison.**

| Decision detail | Choice |
| --- | --- |
| Form | Committed static production output under `apps/client-studio/reference-build/` |
| Serve | `pnpm reference` → http://127.0.0.1:5174/ |
| Scope of freeze | UX and visual appearance (layout, surfaces, tokens-as-bundled, assets-at-freeze) |
| Not frozen as SSOT | Runtime semantics / ongoing package evolution (rebuild captures Runtime at freeze time only) |
| Update cadence | Explicit team decision only (`pnpm reference:freeze` + commit) |

Development, Production Embed, and Reference Build remain **three separate environments**.

---

## Consequences

### Positive

- Stable etalon independent of WIP on `:4173`
- Clear launch path for designers / reviewers / regression tools
- Documented refresh policy prevents accidental drift

### Negative / accepted costs

- Repository holds a duplicate production artifact (including media copied at freeze)
- Stale reference if the team forgets to refresh after agreed milestones — mitigated by documentation and `REFERENCE.json`

### Rejected alternatives

| Alternative | Why not |
| --- | --- |
| Git tag only (no served build) | Harder for non-git workflows; no one-command URL |
| Freeze via feature branch forever | Branches move; not a local “always on” etalon |
| Use GitHub Pages Embed as the visual etalon | Embed is a delivery channel; host/CSS constraints differ from standalone Studio |

---

## References

- [Client-Studio-Reference.md](../reference/Client-Studio-Reference.md)
- Artifact: `apps/client-studio/reference-build/REFERENCE.json`
