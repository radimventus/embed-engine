# Engineering Debt

Deferred technical work that must **not** expand the current slice scope.
Items here are candidates for later milestones / ADRs.

## Distribution / Publish

| ID | Item | Why deferred |
| --- | --- | --- |
| ED-DIST-01 | GitHub Pages hosting of `packages/embed/dist` | **Done (M3/S2)** — published under `docs/embed/` at https://conis.cz/embed/ (custom domain; PT-EMBED-MIGRATION-01) |
| ED-INFRA-001 | GitHub Pages used as production `assetBase` (CORS on 301) | **PASS** — [ED-INFRA-001](../ops/ED-INFRA-001.md); follow-up [CAP-INFRA-01](../ops/CAP-INFRA-01-centralized-embed-configuration.md) |
| ED-DIST-02 | GitHub Actions release workflow | Publishing automation out of scope |
| ED-DIST-03 | CDN / npm publish of `@embed-engine/embed` | Requires auth, semver policy, changelog process |
| ED-DIST-04 | Single bundled `embed.d.ts` (rollup-types) | Current multi-file public `.d.ts` graph is sufficient for MVP |
| ED-DIST-05 | Auto-generate `src/version.ts` from `package.json` | Build already fails on mismatch; codegen can wait |
| ED-DIST-06 | Retarget Pages source to `main` `/docs` after merge | Pages currently builds from `feature/cap-p04-founding-partner` for M3/S2 verification |
| ED-DIST-07 | Stale Embed IIFE on Pages vs local Runtime | **Done (PT-DEPLOY-EMBED-01)** — fingerprint + SHA-256 sync gates; see [Current Runtime Baseline](../architecture/Current-Runtime-Baseline.md) |
| DEPLOY-FP-01 | `fingerprint.commit` cannot equal containing Git HEAD | **Structural** (not a Runtime bug). Fingerprint is embedded in versioned `docs/embed` artifacts (`version.json` + IIFE). Git content-addressing means the short hash *inside* the tree cannot generally equal the hash *of* the commit that contains it. Close gates must treat tip-artifact identity (SHA-256 / `validate:pages --remote`) as authority; do not require `fingerprint.commit == HEAD`. Revisit in a future infra iteration. **Priority: Low.** See [PT-DEPLOY-CLOSE-01](../reviews/PT-DEPLOY-CLOSE-01.md). |

## Engineering baseline (product Runtime)

| ID | Item | Notes |
| --- | --- | --- |
| EB-RT-01 | Dual SSOT (REFERENCE_HOUSE + Builder registries) | **Done (PT-RUNTIME-UNIFY-01)** |
| EB-RT-02 | Embed vs Client Studio Runtime init divergence | **Done (PT-EMBED-RUNTIME-INTEGRATION-01)** |
| EB-RT-03 | Reproducible HEAD = validated tree + Pages | **Done (CAP-RUNTIME-BASELINE-01 / PT-RUNTIME-UNIFY-02)** |

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
| ED-DA-06 | Require injectable clock on production create/dispatch | **Done** — `RuntimeClock` DI; no Runtime `Date.now()` ([ED-DA-06 report](../architecture/review/ED-DA-06-injectable-clock.md)) |

## Process

When closing a slice: add deferred items here instead of expanding DoD.

## AI Delivery / ACC alignment (CAP-AI-DELIVERY-01)

Source: [CAP-AI-DELIVERY-01 mapping](../architecture/ai/CAP-AI-DELIVERY-01-runtime-delivery-mapping.md).

| ID | Item | Notes |
| --- | --- | --- |
| ED-AI-01 | Missing AI Delivery; Runtime calls Adapter directly | **Closed** (WP-B) |
| ED-AI-02 | Pre-ACC ChatRequest/ChatResponse vs ACC-01 | Still open — CAP-AI-ACC-WIRE-01 |
| ED-AI-03 | Experience constructs OpenAIProvider / Published config gap | **Closed** (CAP-AI-PUBLISH-01) |
| ED-AI-04 | ConversationError vendor string coupling | Partial — AdapterFailure primary; residual regex |
| ED-AI-05 | Provider vs Adapter terminology | Partial — AIAdapter + aliases remain |
| ED-AI-06 | DecisionMemory naming vs AIS-01 Memory | Optional naming pass |
| ED-AI-07 | No Capability negotiation / streaming Events | Future |
| ED-AI-12 | Experience injects secrets into Delivery bootstrap | **Closed** (CAP-AI-PUBLISH-01) |

## ED-BP-01 — Builder Package Hot Reload

Track changes to `gallery.csv`, `rooms.csv`, `videos.csv`, and `media/`, regenerate Runtime registries, and refresh Experience without a manual reload (development only).

Priority: Low–Medium (not required for pilot).
