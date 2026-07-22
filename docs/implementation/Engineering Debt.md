# Engineering Debt

Deferred technical work that must **not** expand the current slice scope.
Items here are candidates for later milestones / ADRs.

## Distribution / Publish

| ID | Item | Why deferred |
| --- | --- | --- |
| ED-DIST-01 | GitHub Pages hosting of `packages/embed/dist` | **Done (M3/S2)** — published under `docs/embed/` at https://radimventus.github.io/embed-engine/embed/ |
| ED-DIST-02 | GitHub Actions release workflow | Publishing automation out of scope |
| ED-DIST-03 | CDN / npm publish of `@embed-engine/embed` | Requires auth, semver policy, changelog process |
| ED-DIST-04 | Single bundled `embed.d.ts` (rollup-types) | Current multi-file public `.d.ts` graph is sufficient for MVP |
| ED-DIST-05 | Auto-generate `src/version.ts` from `package.json` | Build already fails on mismatch; codegen can wait |
| ED-DIST-06 | Retarget Pages source to `main` `/docs` after merge | Pages currently builds from `feature/cap-p04-founding-partner` for M3/S2 verification |

## Embed / Runtime (known TODOs)

| ID | Item | Notes |
| --- | --- | --- |
| ED-EMB-01 | Multi-instance `Embed.mount` on one page | Marked TODO(ADR) in session registry |
| ED-EMB-02 | Remote / CMS / Object Package fixture loading | Marked TODO(ADR) in fixtures |
| ED-RT-01 | Journey events → Cognitive Signals | Architecture Freeze open item |
| ED-RT-02 | Production Experience Composer (non-mock) | Architecture Freeze open item |

## Decision Architecture (AR-001)

Deferred boundary work from [Architecture Review v1.0](../architecture/review/AR-001-decision-architecture-v1.md) (**PASSED Conditional**; architecture [FROZEN](../architecture/decision-architecture-v1.0-freeze.md)). Do **not** invent new foundational PTs — execute via CAPs + these items.

Hardening report: [ED-DA-01 Boundary Hardening](../architecture/review/ED-DA-01-boundary-hardening.md)

| ID | Item | Notes |
| --- | --- | --- |
| ED-DA-01 | Unify Client Studio on Decision Session Runtime only | **Done (ED-DA-01R)** — `interpretAndCompose` dual stack retired in Client Studio |
| ED-DA-02 | Move room media / hero projection out of walkthrough catalog ownership | **Partial** — media UI consumes Experience Context only; catalog confined to `projectSynchronizedExperience` seam ([ED-DA-02 report](../architecture/review/ED-DA-02-media-projection-boundary.md)); Object-owned assets still open |
| ED-DA-03 | Narrow `@embed-engine/runtime` public exports | **Done** — public façade/contracts only; pipeline on `@embed-engine/runtime/testing` ([ED-DA-03 report](../architecture/review/ED-DA-03-export-surface-hardening.md)) |
| ED-DA-04 | Stop exposing `runtime` / raw `interpretation` to presentation modules | **Done** — Context transports `experience` + `dispatch` only ([ED-DA-04 report](../architecture/review/ED-DA-04-context-only-provider.md)) |
| ED-DA-05 | Converge flat `SessionExperience` fields into `experience.context` | **Done** — `SessionExperience = { house, context }` ([ED-DA-05 report](../architecture/review/ED-DA-05-flatten-session-experience.md)) |
| ED-DA-06 | Require injectable clock on production create/dispatch | Reproducibility demos / replay |

## Process

When closing a slice: add deferred items here instead of expanding DoD.
