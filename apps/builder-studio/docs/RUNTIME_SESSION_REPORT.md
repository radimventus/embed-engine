# EPIC-BLD-19 — Runtime Session Report

**Status:** Ready for architecture review  
**Commit:** deferred to start of EPIC-BLD-20 (on PASS)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Runtime Session Engine vykonává Decision Story pro jednu návštěvnickou relaci. Spravuje stav průchodu a navigaci mezi moves — nepřepisuje Story, nevyhodnocuje pravidla a negeneruje AI.

```
Decision Story
        │
        ▼
Runtime Session Engine
        │
        ▼
Runtime Session
        │
        ▼
Session Navigation
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `fbfc8e5` | `feat(builder): implement decision story composer` (EPIC-BLD-18) |

---

## RuntimeSessionEngine

| Method | Role |
| --- | --- |
| `createSession()` | Create session from story move order |
| `start()` | Running + enter first move |
| `nextMove()` / `previousMove()` | Linear navigation |
| `complete()` | Completed |
| `dispose()` | Disposed |

---

## RuntimeSession

- `id`, `runtimeId`, `storyId`, `status`
- `currentMoveId`, `moveIds[]` (ordered snapshot — Story se nemění)
- `history[]`, `metadata`, `timestamps`, `validation`

---

## SessionState

`Created` · `Running` · `Paused` · `Completed` · `Disposed`

`Paused` je v modelu připravený; navigace v tomto EPIC přepíná Running.

---

## SessionHistory / SessionNavigator

**SessionHistoryEntry** — `moveId`, `timestamp`, `action`, `metadata`

**SessionNavigator** — `current()` / `next()` / `previous()` / `jumpTo()`  
Naviguje pouze po Decision Story move order — bez větvení.

---

## SessionValidator

| Method | Role |
| --- | --- |
| `validate()` | Full session |
| `validateStory()` | runtimeId / storyId / moveIds |
| `validateNavigation()` | Target move ∈ story |

---

## Runtime Session Overview

Sekce Builderu `runtime-session` (nav **Session**):

- Session / Current Move / History / State / Navigation  
- Create / Start / Previous / Next / Complete / Dispose  
- `data-testid="runtime-session-overview"`  
- Diagnostický pohled

Vyžaduje Decision Story (Story → Compose Story).

---

## Events

| Event | When |
| --- | --- |
| `SessionCreated` | create |
| `SessionStarted` | start |
| `MoveEntered` | enter move |
| `MoveCompleted` | leave move / complete |
| `SessionCompleted` | complete |
| `SessionDisposed` | dispose |

---

## API

`createRuntimeSessionApi(engine)`:

- `createSession()`
- `startSession()`
- `nextMove()` / `previousMove()`
- `completeSession()`
- `previewSession()`

---

## Screenshot

`apps/builder-studio/docs/bld-19-runtime-session-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (85) |
| build | pass |

### New tests
- SessionNavigator sequential navigation
- SessionValidator story/navigation issues
- create → start → next → previous → complete → dispose + events
- API create/start/next/previous/complete/preview

---

## Odchylky od specifikace

| Spec | Implementace | Note |
| --- | --- | --- |
| RuntimeSession | + `moveIds`, `timestamps`, `validation` | Ordered snapshot for navigation without mutating Story |
| Preview BLD-05 type | renamed `RuntimeSession` → `PreviewRuntimeSession` | Freed canonical name for Decision Session |
| Nav label | **Session** | Fits crowded section nav |
| `Paused` | in SessionState model | No pause UI action in this EPIC |
| `jumpTo()` | on SessionNavigator | Not exposed as Overview button yet |

**Not implemented (by design):** Behavior Engine, adaptivní větvení, personalizace, AI, Prompt Builder, Analytics, cross-session logika.

---

Čeká na architektonickou kontrolu. Commit za EPIC-BLD-19 vznikne na začátku EPIC-BLD-20 při PASS.
