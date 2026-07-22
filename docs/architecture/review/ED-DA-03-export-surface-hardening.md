# ED-DA-03 — Export Surface Hardening

**Status:** PASS  
**Date:** 2026-07-22  
**Depends on:** Decision Architecture v1.0 (FROZEN), AR-001, ED-DA-01 / ED-DA-01R

## Goal

Harden the Runtime public export surface so downstream modules cannot accidentally bypass architectural boundaries. API exposure only — no Runtime behaviour change.

---

## 1. Export Audit

### Classification

| Class | Examples | Disposition |
| --- | --- | --- |
| **Canonical Public API** | `createDecisionSessionRuntime`, `DecisionSessionRuntime`, `ExperienceContext`, `SessionExperience`, Story/Moves/Outcome/Terminal/AIContext contracts + schema versions, serialize/restore/replay, Priority Journey façade used by Embed | Kept on `@embed-engine/runtime` and `@embed-engine/runtime/session` |
| **Internal Runtime API** | `compose*`, `evaluate*`, `interpretDecisionSession`, `validateCommand`, `applyDecisionEvent`, `dispatchCommand`, `createDecisionSession`, `selectRoom`, `projectFromInterpretation`, ruleset helpers | Moved to `@embed-engine/runtime/testing` |
| **Legacy / unused barrel noise** | Broad garden mock re-exports on main index; dead type aliases (`DecisionEventType`, `RuntimeCommandType`) | Removed from main index (mock remains on `./priority/mock`; command type stays on testing) |
| **Deprecated API** | None required — monorepo consumers did not depend on removed main-index symbols | N/A |

### Consumer verification

| Consumer | Imports | Verdict |
| --- | --- | --- |
| Client Studio | Façade + contract types + `projectExperienceContext` only | PASS |
| Embed | Priority façade + garden fixture helpers | PASS |
| Runtime tests | `@embed-engine/runtime/testing` (via relative `./testing`) | PASS |

No external package imported pipeline composers from `@embed-engine/runtime` before this change.

---

## 2. Public API Report

**Entry:** `@embed-engine/runtime`

Kept Decision Session surface:

- Façade: `createDecisionSessionRuntime`, `DecisionSessionRuntime`, `RuntimeCommand`, `DispatchResult`, …
- Contracts: `DecisionStory*`, `DecisionMove*`, `DecisionOutcome*`, `DecisionTerminal*`, `AIContext*`, `ExperienceContext*`, `SessionExperience`, `SessionInterpretation`
- Session lifecycle: serialize / restore / replay / clone
- Projection helper used by Client Studio: `projectExperienceContext`

Kept Priority Journey surface required by Embed:

- `createPriorityRuntimeEngine`, `applyPriorityEvent`, `renderPriorityJourney`, `createGardenEngineEvents`, `createGardenJourneyRun`, …

**Entry:** `@embed-engine/runtime/session` — same Decision Session public API only.

---

## 3. Internal API Report

**Entry:** `@embed-engine/runtime/testing`

Contains pipeline composers and low-level session helpers formerly on the public barrel.

Documented in `session/OWNERSHIP.md` and barrel headers: Experience modules must not import this entry.

---

## 4. Legacy Export Report

| Change | Breaking outside monorepo? | Migration |
| --- | --- | --- |
| Removed `compose*` / `evaluate*` / `interpretDecisionSession` / … from main index | Yes for any external importer | Import from `@embed-engine/runtime/testing` |
| Removed unused garden mock constants from main index | Low risk (unused outside package) | `@embed-engine/runtime/priority/mock` |
| No `@deprecated` shims retained on main index | Intentional — debt was “narrow exports”; no in-repo consumers | Documented here |

---

## 5. Acceptance Checklist

- [x] Runtime public API contains canonical contracts + façade
- [x] Internal helpers no longer on public index / session barrel
- [x] Client Studio imports only supported Runtime APIs (unchanged, verified)
- [x] No Runtime behaviour changes
- [x] Existing tests pass (+ export surface guard)

---

## Remaining Engineering Debt

| ID | Status |
| --- | --- |
| ED-DA-03 | **Done** (this report) |
| ED-DA-04 | Provider still exposes `runtime` / raw `interpretation` |
| ED-DA-05 | Flat `SessionExperience` vs `context` duplication |
| ED-DA-06 | Injectable clock |
| ED-DA-02 residual | Object-owned media catalog |
