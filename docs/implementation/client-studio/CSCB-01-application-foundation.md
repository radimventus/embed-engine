# CSCB-01 — Application Foundation

| Field | Value |
| --- | --- |
| **Capability** | CSCB-01 — Application Foundation |
| **Slice** | SR-001 |
| **Status** | **DONE** |
| **Date** | 2026-07-22 |
| **Commit** | `feat(client-studio): complete application foundation` |

---

## Implementation summary

Consolidated Client Studio onto a single AppShell + single Decision Session Runtime bootstrap, with unified ErrorBoundary, Runtime loading gate, fixed sidebar journey navigation (active section), and layout-token alignment.

No Runtime package / API changes.

---

## Modified modules

**New**

- `src/components/ErrorBoundary.tsx`
- `src/features/client-studio/foundation/*` — ChapterSpacer, RuntimeBootstrapGate, StudioLoading, scrollToSection, useActiveSection, foundation tests
- `docs/implementation/client-studio/CSCB-01-application-foundation.md`
- `docs/implementation/client-studio/assets/cscb-01-application-foundation.png`

**Updated**

- `src/main.tsx` — ErrorBoundary wrap
- `ClientStudioApp.tsx` — AppShell owns header + sidebar
- `ClientStudioPage.tsx` — RuntimeBootstrapGate; ChapterSpacer; header moved out of canvas
- `ClientStudioHeader.tsx` — Kontakt → audit section
- `ClientStudioSidebar.tsx` — fixed 48px rail + section nav + active state
- `pilotVocabulary.ts` — hero / aiAdvisor ids + `PILOT_SECTION_NAV`
- `Hero.tsx` / `AIAdvisor.tsx` — section anchors
- `Workspace.tsx` / `DesktopCanvas.tsx` / `tailwind.config.js` — layout tokens
- `package.json` — foundation test in suite

---

## Runtime interaction

| Concern | Behaviour |
| --- | --- |
| Bootstrap | Sole `createDecisionSessionRuntime` in `DecisionSessionRuntimeProvider` |
| Clock | Injected `createSystemClock()` at adapter boundary (unchanged) |
| Gate | `RuntimeBootstrapGate` reads `ready` from Context transport |
| Semantics | None composed in shell — projection / transport only |

Legacy CommandRuntime host remains opt-in quarantine and is **not** the production path.

---

## Validation

| Check | Result |
| --- | --- |
| Typecheck | **PASS** (`pnpm --filter @embed-engine/client-studio typecheck`) |
| Tests | **PASS** — 23/23 (incl. 4 foundation guards) |
| Runtime API | Unchanged |
| UI | Screenshot: [assets/cscb-01-application-foundation.png](./assets/cscb-01-application-foundation.png) |

---

## Slice consumption

| Estimate | Consumed |
| --- | --- |
| 4 slices | 1 slice (SR-001 closes CSCB-01 foundation scope) |

Remaining CSCB-01 estimate budget is unused — capability goals met in one foundation pass.

---

## Acceptance checklist

- [x] Single Runtime bootstrap (default path)
- [x] Single AppShell
- [x] Navigation consistent (sidebar active + Kontakt)
- [x] Layout stable (48px sidebar, Workspace bg, tokens)
- [x] Loading + Error Boundary unified
- [x] No Runtime API change

---

## Follow-up

- CSCB-02 — Object Discovery (next)
- Optional later: remove dead “Uložit” already dropped; reintroduce under Commercial Conversion if needed
- Legacy dual-runtime quarantine remains documented — do not enable in pilot
