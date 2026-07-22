# CSCB-04 — Decision Discovery (Priority Experience)

| Field | Value |
| --- | --- |
| **Capability** | CSCB-04 — Decision Discovery |
| **Status** | **DONE** |
| **Date** | 2026-07-22 |
| **Commit** | `feat(client-studio): implement priority experience` |

---

## Implementation summary

Priority Experience captures user intent and delivers it to Runtime through `ChangePriority` Decision Signals.

The surface:

- presents the canonical 10-priority catalogue
- supports multi-select / deselect / intensity
- encodes intensity as **priority order** (Runtime has no intensity field)
- hydrates from `experience.context.decision.priorityIds` for session continuity
- never interprets, scores, or recommends

Experience adaptation (Hero media order, Terminal, signals) continues to originate exclusively from Runtime Context after dispatch.

---

## Runtime event diagram

```text
User (select / intensity)
        │
Priority Cards (UI chrome only)
        │
usePrioritySignalBridge
        │
dispatch({ type: "ChangePriority", priorityIds: orderedIds })
        │
Runtime
  ├── PriorityChanged event
  ├── runtimeState.priorityIds
  ├── evaluatePrioritySignals
  └── Interpretation → Focus → Story → … → Experience Context
        │
Experience Surfaces re-project (Hero, Terminal, …)
```

### Dispatched signals / commands

| Interaction | Command | Payload |
| --- | --- | --- |
| Select / deselect / intensity change | `ChangePriority` | `priorityIds` ordered by importance desc |

Empty local selection does **not** dispatch (Runtime rejects empty arrays) — last Runtime set remains.

---

## Runtime Context changes (after successful dispatch)

| Field | Effect |
| --- | --- |
| `decision.priorityIds` | Updated ordered ids |
| `decision.prioritySignals` | Re-evaluated strengths / kinds |
| `decision.focus` | May change focus room / action |
| `decision.story` / `terminal` / `ai` | Recomposed by Runtime pipeline |
| `hero` / `roomMedia` projection | May reorder via synchronized Experience |

---

## Modified modules

- `useDecisionCards.ts` — hydrate from Runtime; intensity helpers
- `usePrioritySignalBridge.ts` — documented Decision Signal policy
- `PriorityExperienceProvider.tsx` — expose selection progress
- `SectionHeader.tsx` — progressive disclosure of min selection
- `PriorityCards.tsx` — responsive catalogue grid
- `DecisionCard.tsx` — touch-friendly
- `PriorityEngine.tsx` — CSCB-04 surface markers
- `priorityExperience.test.ts` — guards

---

## Acceptance checklist

- [x] Multi-select priorities  
- [x] Adjust intensity (order encoding)  
- [x] Interactions dispatch Runtime Decision Signals  
- [x] Runtime Context updates  
- [x] Experience adapts via Runtime projection only  
- [x] Session continuity via Runtime hydrate  
- [x] No semantic logic in Client Studio  

---

## Validation

| Check | Result |
| --- | --- |
| Typecheck | **PASS** |
| Tests | **PASS** — 38/38 |
| Desktop | [assets/cscb-04-priority-desktop.png](./assets/cscb-04-priority-desktop.png) |
| Mobile | [assets/cscb-04-priority-mobile.png](./assets/cscb-04-priority-mobile.png) |

---

## Follow-up

- First-class intensity on Runtime command would require ADR (out of CSCB-04)  
- Decision Terminal / Report remain projection peers in the same section — full Terminal work is CSCB-05  
- Next: **CSCB-05 — Decision Presentation**
