# ED-DA-06 — Injectable Clock & Deterministic Runtime

**Status:** PASS  
**Date:** 2026-07-22  
**Depends on:** Decision Architecture v1.0 (FROZEN), AR-001, ED-DA-01…05

## Goal

Remove all direct Runtime dependency on host system time (`Date.now()`, `new Date()`, …).  
Runtime time is supplied only through an injectable `RuntimeClock` (or explicit `now`).

---

## 1. Clock Audit Summary

| Location | API | Classification | Action |
| --- | --- | --- | --- |
| `session/pipeline/dispatch.ts` | `Date.now()` fallback | **Runtime** | Replaced with `resolveRuntimeTimestamp` |
| `session/createDecisionSession.ts` | `Date.now()` fallback | **Runtime** | Replaced with `resolveRuntimeTimestamp` |
| `session/replay.ts` | `Date.now()` fallback | **Runtime** | Requires `createdAt` / event `.at` / `clock`; fails closed |
| `session/clock/RuntimeClock.ts` (`createSystemClock`) | `Date.now()` | **Infrastructure adapter** | Allowed — only system-clock factory |
| `DecisionSessionRuntimeProvider` | `Date.now()` on dispatch | **Presentation adapter** | Removed; injects `createSystemClock()` into Runtime |
| AIAdvisor / scripts `new Date()` | display timestamps | **Presentation** | Unchanged (out of scope) |

### Direct clock calls removed (Runtime)

- `dispatchCommand` — no system-clock fallback
- `createDecisionSession` — no system-clock fallback
- `replayDecisionSession` — no system-clock fallback

---

## 2. Clock Abstraction Introduced

```ts
type RuntimeClock = { readonly now: () => number };

createFixedClock(epochMs)   // tests / demos / reproducible sessions
createSystemClock()         // Client Studio adapter only
resolveRuntimeTimestamp()   // fails closed — never silent Date.now()
```

### Dependency injection

| Provider | Clock |
| --- | --- |
| Production (Client Studio Provider) | `createSystemClock()` |
| Runtime tests | `createFixedClock(n)` |
| Explicit timestamps | `now` still preferred when known |

`createDecisionSessionRuntime` **requires** `clock`.  
Runtime never instantiates a clock internally.

---

## 3. Files Modified

**New**

- `packages/runtime/src/session/clock/RuntimeClock.ts`
- `packages/runtime/src/session/clock/index.ts`
- `packages/runtime/src/session/RuntimeClock.determinism.test.ts`
- `docs/architecture/review/ED-DA-06-injectable-clock.md`

**Runtime**

- `createDecisionSession.ts`, `pipeline/dispatch.ts`, `replay.ts`
- `pipeline/DecisionSessionRuntime.ts` — required `clock`
- `selectRoom.ts` — optional `clock`
- `public-api.ts`, `index.ts` — export clock helpers

**Client Studio**

- `DecisionSessionRuntimeProvider.tsx` — injects system clock; dispatch no longer calls `Date.now()`

**Tests** — all `createDecisionSessionRuntime` call sites pass `clock`

---

## 4. Runtime Validation

- Runtime session sources (excluding `clock/` adapters) contain **zero** `Date.now()` / `new Date()` / `performance.now()` (guard test).
- Pipeline / façade consume only `now` or injected `clock`.
- Public contracts / serialization format unchanged.

---

## 5. Replay Validation

- Identical command sequence + fixed clock → identical sessions / Experience / JSON.
- Serialize → restore → replay with event timestamps → identical `DecisionSession`.
- Serialization format unchanged (`DECISION_SESSION_SCHEMA_VERSION` untouched).

---

## 6. Acceptance Checklist

- [x] Runtime no longer calls system clock APIs directly
- [x] Runtime receives time through DI
- [x] Decision Sessions deterministic under fixed clock
- [x] Replay deterministic
- [x] Serialization compatible
- [x] Client Studio Provider behaviour preserved (adapter owns system clock)
- [x] No semantic / pipeline / AIContext / Terminal changes

---

## Remaining Engineering Debt

| ID | Status |
| --- | --- |
| ED-DA-06 | **Done** |
| ED-DA-02 residual | Object-owned media catalog |
| RAR | Recommended next — Runtime Architecture Review (certify Runtime Hardening) |

Runtime Hardening properties after ED-DA-06:

1. Single semantic authority  
2. Stable public API  
3. Clean structural model (`SessionExperience = { house, context }`)  
4. Deterministic execution (injected clock)
