# Engineering Debt

Deferred technical work that must **not** expand the current slice scope.
Items here are candidates for later milestones / ADRs.

## Distribution / Publish

| ID | Item | Why deferred |
| --- | --- | --- |
| ED-DIST-01 | GitHub Pages hosting of `packages/embed/dist` | **In progress / see** [GitHub Pages Distribution](../releases/GitHub%20Pages%20Distribution.md) |
| ED-DIST-02 | GitHub Actions release workflow | Publishing automation out of scope |
| ED-DIST-03 | CDN / npm publish of `@embed-engine/embed` | Requires auth, semver policy, changelog process |
| ED-DIST-04 | Single bundled `embed.d.ts` (rollup-types) | Current multi-file public `.d.ts` graph is sufficient for MVP |
| ED-DIST-05 | Auto-generate `src/version.ts` from `package.json` | Build already fails on mismatch; codegen can wait |
| ED-DIST-06 | Private-repo anonymous Pages access | Public HTTPS for anonymous users requires public repo or paid Pages visibility |

## Embed / Runtime (known TODOs)

| ID | Item | Notes |
| --- | --- | --- |
| ED-EMB-01 | Multi-instance `Embed.mount` on one page | Marked TODO(ADR) in session registry |
| ED-EMB-02 | Remote / CMS / Object Package fixture loading | Marked TODO(ADR) in fixtures |
| ED-RT-01 | Journey events → Cognitive Signals | Architecture Freeze open item |
| ED-RT-02 | Production Experience Composer (non-mock) | Architecture Freeze open item |

## Process

When closing a slice: add deferred items here instead of expanding DoD.
