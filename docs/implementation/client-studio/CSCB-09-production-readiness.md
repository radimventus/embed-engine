# Production Readiness Report — CSCB-09

| Field | Value |
| --- | --- |
| **Capability** | CSCB-09 — Production Readiness |
| **Status** | **DONE** |
| **Date** | 2026-07-22 |
| **Commit** | `chore(client-studio): production readiness` |
| **Unlocks** | RR-001 — Release Readiness Review (Client Studio v1) |

---

## Verdict

Client Studio Generation 1 is **operationally ready for controlled external pilot** pending formal RR-001 certification.

Runtime certification remains intact. No Runtime APIs or semantics were changed. Hardening is presentation / ops only.

```text
Certified Runtime
        │
        ▼
Validated Product (CSCB-01…08)
        │
        ▼
Production Ready Client Studio (CSCB-09)
        │
        ▼
Pilot Deployment  →  RR-001
```

---

## Implementation summary

| Area | Action |
| --- | --- |
| Production config | `productionConfig.ts` + Configuration Guide |
| Error resilience | MainMedia load/error fallbacks; ErrorBoundary versioned diagnostics |
| Loading | Consistent Czech status copy (bootstrap, media pending, Terminal, conversion) |
| Observability | `dataset.clientStudioVersion` / generation; safe error logging |
| Build | Vite prod sourcemap off; version define; base path support |
| Media integrity | Pilot hero/floorplan assets + photo-mode kind guard (BUG-001) |
| Documentation | Deployment, Configuration, Runbook, Operational Checklist, Known Limitations, Rollback, Pilot Checklist |

---

## Production configuration checklist

See [production/CONFIGURATION-GUIDE.md](./production/CONFIGURATION-GUIDE.md) — validated defaults: mailto lead, memory analytics, legacy OFF, sourcemaps OFF.

---

## Deployment validation

Commands (repository root):

```bash
pnpm --filter @embed-engine/client-studio typecheck
pnpm --filter @embed-engine/client-studio test
pnpm --filter @embed-engine/client-studio build
pnpm --filter @embed-engine/client-studio preview
```

Artefact: `apps/client-studio/dist/` · Guide: [production/DEPLOYMENT-GUIDE.md](./production/DEPLOYMENT-GUIDE.md)

### Production build verification

| Check | Result |
| --- | --- |
| typecheck | **PASS** |
| automated tests | **PASS** — 52 tests / 15 suites |
| production build | **PASS** — `dist/` generated |
| source maps in `dist/` | **ABSENT** (policy enforced) |
| media copied to `dist/media/house-modern-01/` | **PASS** |
| JS bundle (approx.) | ~340 kB / ~101 kB gzip (single chunk) |
| CSS | ~36 kB / ~7 kB gzip |

---

## Accessibility findings (non-blocking)

| Finding | Severity | Notes |
| --- | --- | --- |
| Lightbox: no focus trap / initial focus move | Low | Escape + close control present |
| No skip-to-content link | Low | Sidebar + section focus after scroll |
| Colour contrast formal WCAG audit not automated | Info | Design tokens; manual spot-check recommended in RR-001 |
| MainMedia now uses meaningful `alt` | Fixed in CSCB-09 | Was decorative `alt=""` |

Keyboard path for Priority slider, section nav, conversion form, and lightbox Escape verified by code review / existing patterns.

---

## Performance observations

| Observation | Pilot impact | Action |
| --- | --- | --- |
| Vite code-splitting / single app entry | Acceptable for Gen 1 | None |
| Large hero WebP (~1MB) | Acceptable for pilot object | Monitor; no premature CDN work |
| No remote analytics in prod | Positive (less network) | Documented KL-ANALYTICS |
| Decision crossfade transitions | Intentional | Keep |

No premature optimisation performed.

---

## Error resilience matrix

| Dependency | Degradation |
| --- | --- |
| Runtime bootstrap | Gate + StudioLoading; ErrorBoundary on render failure |
| Media | Czech fallback surfaces (Hero + MainMedia) |
| AI provider | Placeholder response; journey continues |
| Analytics export | try/catch adapters; memory sink in prod |
| Mailto | Error phase + fallback address copy |
| Network interruption | Last projected UI retained; refresh recovers |

---

## Known limitations

Canonical list: [production/KNOWN-LIMITATIONS.md](./production/KNOWN-LIMITATIONS.md)

---

## Architectural invariants (verified)

- [x] Runtime unchanged
- [x] No new Runtime APIs
- [x] No duplicated Runtime state
- [x] Client Studio introduces no interpretation
- [x] No new Experience Surfaces / feature expansion
- [x] Production hardening only

---

## Deliverables index

| Document | Path |
| --- | --- |
| Configuration Guide | [production/CONFIGURATION-GUIDE.md](./production/CONFIGURATION-GUIDE.md) |
| Deployment Guide | [production/DEPLOYMENT-GUIDE.md](./production/DEPLOYMENT-GUIDE.md) |
| Pilot Runbook | [production/PILOT-RUNBOOK.md](./production/PILOT-RUNBOOK.md) |
| Operational Checklist | [production/OPERATIONAL-CHECKLIST.md](./production/OPERATIONAL-CHECKLIST.md) |
| Known Limitations | [production/KNOWN-LIMITATIONS.md](./production/KNOWN-LIMITATIONS.md) |
| Rollback Procedure | [production/ROLLBACK-PROCEDURE.md](./production/ROLLBACK-PROCEDURE.md) |
| Pilot Readiness Checklist | [production/PILOT-READINESS-CHECKLIST.md](./production/PILOT-READINESS-CHECKLIST.md) |
| This report | `CSCB-09-production-readiness.md` |

---

## Next artifact

**RR-001 — Release Readiness Review (Client Studio v1)**

Not a sprint review. Formal release certification for first external pilot customers.

**Do not start new implementation capabilities until RR-001 completes.**
