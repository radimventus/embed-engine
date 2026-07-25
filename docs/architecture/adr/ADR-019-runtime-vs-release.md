# ADR-019 — Runtime vs Release

**Status:** Accepted  
**Date:** 2026-07-25  
**CAP:** CAP-GOV-01  
**Related:** [runtime-ssot.md](../runtime-ssot.md) · [embed-release-workflow.md](../embed-release-workflow.md) · [troubleshooting/embed-parity.md](../troubleshooting/embed-parity.md) · Platform Constitution § Runtime & Release Principle

## Context

Repeated incidents showed the same failure mode:

1. A developer changed Experience or Runtime source.
2. Local (and later Embed Demo) showed the change immediately.
3. GitHub Pages / partner IIFE still showed an older product.
4. The team treated that gap as a **Runtime bug** or dual-product divergence.

The gap was usually **release latency**, not a second Runtime.

### Why the problem arose

- `docs/embed/` is a **compiled snapshot** served by GitHub Pages.
- Vite hosts (Local, Embed Demo, Playground) load **live source**.
- Without a mandatory publish step, source and Pages diverge silently.
- Historical freezes (`reference-build`, `gen1`, archived IIFE HTML) looked like “Embed” and were used as verification surfaces.

### Why Runtime and Release were confused

Ambiguous language (“Live Embed”, “Embed”, “Pages”) mixed four different surfaces:

| Surface | Role |
| --- | --- |
| **Local Runtime** | Developer host of the live Runtime |
| **Embed Demo** | Partner-style host of the same live Runtime |
| **Release Snapshot** | `docs/embed/` tree produced by publish |
| **Published Embed** | That snapshot as served on GitHub Pages |

Treating Published Embed as Live Runtime caused false architecture alarms and blocked shipping.

## Decision

1. **One Runtime.** Local Runtime and Embed Demo are hosts only. They are not separate products.
2. **Release Snapshot ≠ Runtime.** `docs/embed` is never Live Runtime.
3. **One publish path.** Preparing a Release Snapshot is done only via:

   ```bash
   pnpm embed:publish
   ```

4. **Release Validation is mandatory.** Publish must prove local snapshot integrity (fingerprint, tree, artifact hashes) before the snapshot is considered READY.
5. **Remote Validation is a separate step.** After commit + push, Published Embed is checked (e.g. `pnpm embed:publish -- --remote`) without inventing a second product surface.
6. **Diagnostic categories are separate.**

   - **Runtime / Experience defect** — Local or Embed Demo wrong or inconsistent with each other.
   - **Release defect** — Local/Demo correct, Published Embed stale, fingerprint mismatch, or publish skipped.

## Consequences

### Positive

- New developers can locate the correct surface without project history.
- “I don’t see my change in Embed” has a fixed checklist before architecture hunting.
- Fingerprint ties Published Embed to a concrete build.

### Negative / costs

- Partner-visible changes require an explicit publish + commit + push.
- Pages lag behind source until a release is cut — by design.

### Forbidden

- Manual edits to `docs/embed/*.js` as a “quick fix”.
- Ad-hoc partial sync instead of `pnpm embed:publish`.
- Validating Experience changes against Published Embed before publish.
- Treating archival freezes as Live Runtime.

## Terminology (normative for this ADR)

| Term | Meaning |
| --- | --- |
| **Runtime** | The single live source Runtime (packages + Experience mount path) |
| **Local Runtime** | Local Vite host (`client-studio` dev) of that Runtime |
| **Embed Demo** | Embed package Vite demo host of that Runtime |
| **Release Snapshot** | Built tree under `docs/embed/` |
| **Published Embed** | Release Snapshot as served (GitHub Pages / partner IIFE URL) |

**Deprecated as ambiguous:** “Live Embed” — do not use without defining which of the four surfaces is meant.

## Enforcement

| Mechanism | Role |
| --- | --- |
| Platform Constitution — Runtime & Release Principle | Normative platform rule |
| `pnpm embed:publish` | Sole official snapshot preparation |
| Release Validation / Remote Validation | Gate READY vs Published |
| [embed-parity troubleshooting](../troubleshooting/embed-parity.md) | Ordered diagnosis |

## Notes

ADR-001 already covers Runtime Architecture (Kernel / façade). This ADR covers **delivery surfaces and release governance**, not Cognitive Runtime internals.
