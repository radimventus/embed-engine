# EPIC-BLD-20 — Behavior Engine Report

**Status:** Ready for architecture review  
**Commit:** deferred to start of EPIC-BLD-21 (on PASS)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Behavior Engine je deterministická poradní vrstva nad Runtime Session. Sleduje context, přijímá Behavior Signals a navrhuje Behavior Actions — nemění Decision Story ani Runtime Session a nepoužívá AI.

```
Runtime Session
        │
        ▼
Behavior Engine
        │
        ▼
Behavior Actions
```

Execution zůstává řízen Runtime Session. Behavior pouze doporučuje.

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `8ef76c7` | `feat(builder): implement runtime session engine` (EPIC-BLD-19) |

---

## BehaviorEngine

| Method | Role |
| --- | --- |
| `initialize()` | Prepare BehaviorContext for session |
| `evaluate()` | Build context → strategy propose → evaluation |
| `proposeActions()` | Read last proposed actions |
| `receiveSignal()` | Accept BehaviorSignal (no Session mutation) |
| `dispose()` | Drop evaluation/context/signals for session |

---

## Models

- **BehaviorContext** — sessionId, currentMove, history, signals, metadata  
- **BehaviorSignal** — MoveEntered / MoveExited / PauseDetected / ResumeDetected / UserAction / Timeout  
- **BehaviorAction** — Continue / Suggest / Highlight / Wait / Skip (proposal only)  
- **BehaviorEvaluation** — evaluation snapshot with actions + strategyId  

---

## BehaviorStrategy / BasicBehaviorStrategy

Interface: `supports()` / `evaluate()` / `propose()`

`BasicBehaviorStrategy` — deterministické mapování latest signal → actions:

| Signal | Proposed actions |
| --- | --- |
| MoveEntered | Highlight + Continue |
| MoveExited | Skip |
| PauseDetected | Wait |
| ResumeDetected | Continue |
| Timeout | Suggest |
| UserAction | Suggest |

---

## Behavior Overview

Sekce Builderu `behavior` (nav **Behavior**):

- Context / Strategy / Signals / Actions  
- Receive Demo Signals / Evaluate Behavior / Dispose  
- `data-testid="behavior-overview"`  
- Diagnostika — akce se nevykonávají

Vyžaduje Runtime Session (Session → Create/Start).

---

## Events

| Event | When |
| --- | --- |
| `BehaviorSignalReceived` | receiveSignal |
| `BehaviorEvaluated` | evaluate complete |
| `BehaviorActionProposed` | each proposed action |

---

## API

`createBehaviorApi(engine)`:

- `evaluateBehavior()`
- `previewBehavior()`
- `listBehaviorSignals()`

---

## Screenshot

`apps/builder-studio/docs/bld-20-behavior-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (89) |
| build | pass |

### New tests
- BasicBehaviorStrategy MoveEntered / PauseDetected mapping
- evaluate + BehaviorEvaluated / BehaviorActionProposed / BehaviorSignalReceived
- API evaluate / preview / listSignals + dispose

---

## Odchylky od specifikace

| Spec | Implementace | Note |
| --- | --- | --- |
| BehaviorEngine | + `receiveSignal`, `load`, `preview`, `listSignals` | Diagnostic + API support |
| BehaviorEvaluation | evaluation snapshot type | Needed for Overview / preview |
| Demo signals button | Builder diagnostic only | Seeds MoveEntered / Timeout / PauseDetected |

**Not implemented (by design):** AI, LLM, Prompt Builder, personalizace, automatické učení, Analytics, cross-session behavior, automatické vykonání BehaviorAction.

---

Čeká na architektonickou kontrolu. Commit za EPIC-BLD-20 vznikne na začátku EPIC-BLD-21 při PASS.
