# PT-BOOTSTRAP-READY-01 — Event-driven Experience Bootstrap

**Date:** 2026-07-24  
**Status:** Implemented and validated (local CS, Embed demo, IIFE harness, local Pages)

---

## Problem (from PT-EMBED-BOOTSTRAP-01)

Reveal Engine waited on `#social-proof` via `waitForSelector` → `queueMicrotask(poll)`.  
That node only appears after Runtime bootstrap. The microtask busy-loop starved the event loop → CSV/Runtime never finished → deadlock.

---

## Bootstrap lifecycle (new)

```text
BOOTSTRAP_STARTED          author: launchExperience / CS main
        ↓
BOOTSTRAP_LOADING          author: launchExperience (pre-mount) + Provider (fetch start)
        ↓
RUNTIME_READY              author: DecisionSessionRuntimeProvider (once)
        ↓
EXPERIENCE_READY           author: ExperienceReadyPublisher (once, after commit)
        ↓
REVEAL_READY               author: runRevealEngine (after settle / degrade)
```

| Event | Author | Moment | Transition |
| --- | --- | --- | --- |
| `BOOTSTRAP_STARTED` | Delivery `launchExperience` / CS `main` | Session start (`reset` then emit) | → loading |
| `BOOTSTRAP_LOADING` | Delivery + Provider | Overlay/mount or CSV fetch begins | → runtime work |
| `RUNTIME_READY` | Provider | `createDecisionSessionRuntime` done | → Experience render |
| `EXPERIENCE_READY` | `ExperienceReadyPublisher` | First committed Experience tree | → Reveal may run |
| `REVEAL_READY` | Reveal Engine | Settle complete or degraded top | → active |

Bus API: `bootstrapEvents.emit` / `once` / `waitFor` / `reset` / `hasEmitted`  
(once-per-session until `reset()`).

---

## Removed polling

| Removed | Location |
| --- | --- |
| `waitForSelector` | `packages/embed/src/delivery/revealEngine.ts` |
| `queueMicrotask(poll)` busy-loop | same |
| DOM wait on `#social-proof` / `[data-client-studio-root]` as sync gate | same |

Reveal may still **one-shot** query a landing anchor **after** `EXPERIENCE_READY` for scroll presentation — never waits/polls.

---

## New / changed files

| File | Change |
| --- | --- |
| `apps/client-studio/.../runtime/bootstrapEvents.ts` | Lifecycle bus (canonical for Vite bundle) |
| `packages/embed/src/delivery/bootstrapEvents.ts` | Same contract for Node/tsc tests |
| `packages/embed/src/delivery/revealEngine.ts` | Event-driven wait on `EXPERIENCE_READY` |
| `packages/embed/src/delivery/revealEngine.test.ts` | Updated tests |
| `packages/embed/src/delivery/launchExperience.ts` | `reset` + `BOOTSTRAP_*` + Reveal without DOM gate |
| `apps/client-studio/.../DecisionSessionRuntimeProvider.tsx` | `RUNTIME_READY` / `EXPERIENCE_READY` + loading UI |
| `apps/client-studio/.../StudioLoading.tsx` | `data-studio-loading` |
| `apps/client-studio/src/main.tsx` | Standalone `BOOTSTRAP_STARTED` |
| `packages/embed/vite.shared.ts` / `demo/vite.config.ts` / `tsconfig.json` | `@client-studio/bootstrap-events` alias |
| `docs/embed/*` | Rebuilt IIFE/ESM via `sync:pages` |

---

## Trace after change (IIFE harness)

```text
CTA click
 → BOOTSTRAP_STARTED / LOADING
 → overlay + mountClientStudio
 → CSV 200 (gallery/rooms/videos)
 → RUNTIME_READY (room count: 10)
 → Experience render (#social-proof present)
 → EXPERIENCE_READY
 → Reveal settle → revealState=active, data-embed-experience-active
 → REVEAL_READY
```

Harness validate (~2.7s): rooms=10, social=true, experienceActive=true, revealState=active.  
Demo validate (~3.6s): same.  
Client Studio `:4173`: room count 10.  
`validate:pages` (local): PASS.  
Built IIFE: `queueMicrotask(poll)` **absent**, `EXPERIENCE_READY` **present**.

Screenshots: `docs/reviews/assets/pt-bootstrap-ready-01/`

---

## Migration notes

- No Runtime / HousePackage / Experience model changes.
- Provider still owns Runtime creation; only emits readiness + shows `StudioLoading` while bootstrapping (replaces blank `null`).
- Embed Delivery must `bootstrapEvents.reset()` at each launch so once-flags clear.
- Production Embed and Client Studio share one bus instance via Vite alias to the CS module.

Remote GitHub Pages fingerprint updates after push of `docs/embed`.
