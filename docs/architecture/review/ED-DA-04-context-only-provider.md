# ED-DA-04 — Context-only Provider

**Status:** PASS  
**Date:** 2026-07-22  
**Depends on:** Decision Architecture v1.0 (FROZEN), AR-001, ED-DA-01…03

## Goal

Convert Runtime-facing React Providers into pure Context transport layers. Providers may transport Runtime state; they must never create semantic meaning.

---

## 1. Provider Audit

| Provider | Classification (before) | Classification (after) | Notes |
| --- | --- | --- | --- |
| `DecisionSessionRuntimeProvider` | State Container + leaked internals | **Context Transport** | Removed `runtime` / `interpretation` exposure |
| `WalkthroughProvider` | State Container + cognitive adapter | **Context Transport + UI chrome** | No cognitive signals; `SelectRoom` only |
| `PriorityExperienceProvider` | UI State Container | **UI State Container** | Cards → `ChangePriority` dispatch; no semantic compose |
| `PrioritySelectionContext` | UI State | **UI State** | Selection chrome only |
| `ExperienceBindingProvider` | Legacy Adapter | **Legacy Adapter (unmounted)** | Documented in `cognitive/LEGACY.md` |
| `InterpretationProvider` | Legacy Adapter | **Legacy Adapter (unmounted)** | Same |
| `DecisionStoryProvider` | Legacy Adapter (+ `getDispositionMove`) | **Legacy Adapter (unmounted)** | Same |

No dedicated Terminal / AI Providers exist — UI reads `experience.context.decision.terminal` / `.ai` via Decision Session Context.

---

## 2. Provider Responsibility Matrix

| Responsibility | Allowed on Provider? | Where it lives |
| --- | --- | --- |
| Hold Runtime instance | Yes (private) | `DecisionSessionRuntimeProvider` ref |
| Expose `experience` / `experience.context` | Yes | Context value |
| Expose `dispatch` | Yes | Context value |
| Expose `ready` | Yes | Context value |
| Expose raw `runtime` / `interpretation` | **No** | Removed |
| Compose Story / Moves / Outcome / Terminal / AI | **No** | Runtime only |
| Media presentation projection call | Yes (transport) | `projectSynchronizedExperience` (ED-DA-02 seam) |
| Local media chrome (index / mode) | Yes | `WalkthroughProvider` |
| Cognitive `applySignal` | **No** on live path | Legacy only |

---

## 3. Legacy Provider Report

| Item | Disposition |
| --- | --- |
| Cognitive Provider tree on `ClientStudioPage` | **Removed** from live mount |
| Cognitive Runtime bootstrap in `ClientStudioApp` | **Removed** from default path |
| `cognitive/*` modules | Kept as explicit legacy adapters (`LEGACY.md`) |
| `useDecisionTerminal` | Unmounted; documented legacy dependency on cognitive Providers |

---

## 4. Acceptance Checklist

- [x] Live Providers are transport / UI chrome only
- [x] No Provider composes Decision Session semantics
- [x] Runtime remains sole semantic authority
- [x] UI consumes Decision Session via Context (`experience` + `dispatch`)
- [x] Runtime package unchanged
- [x] Tests pass

---

## Remaining Engineering Debt

| ID | Status |
| --- | --- |
| ED-DA-04 | **Done** |
| ED-DA-05 | Flatten `SessionExperience` into `context` |
| ED-DA-06 | Injectable clock |
| ED-DA-02 residual | Object-owned media catalog |
| Legacy cognitive modules | Delete when dialogue Terminal is retired or rebound to Decision Session Story |
