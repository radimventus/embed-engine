# PT-PRIORITY-DESIGN-02 — Priority Conis conversation flow

Date: 2026-07-26

## Verdict

**Local PASS** — Right panel is a guided Conis dialog (instruction → tags → short questions → FAQ/Chat paths). Decision Runtime, Priority grid, Decision Report, and Decision Terminal source are unchanged.

---

## Behaviour

| Phase | Trigger | Right panel |
|-------|---------|-------------|
| A Instruction | Open / 0 selected | Short instruction only |
| B Confirmation | 1–2 selected | Gold tags for selected priorities |
| C Dialog | ≥ 3 selected | One short question (2–3 options) per selected priority |
| Complete | All dialog answers | FAQ path · Ask Conis · subtle PDF note |

Progress events (UX only): priority count, order, changes, dialog answers, intensity, phase, completion path — via `createPriorityConversationProgress()`. No evaluation, no Runtime dispatch from the conversation layer.

---

## Validation

Local Embed Demo `http://127.0.0.1:5180/` — assets in `docs/reviews/assets/pt-priority-design-02/`.

| Check | Status |
|-------|--------|
| Starts with instruction | PASS |
| Tags update after each selection | PASS |
| Dialog after third priority | PASS |
| Questions short (2–3 options) | PASS |
| Communication only in right panel | PASS |
| FAQ / Chat offered only at end | PASS |
| No modals / tooltips / new screens | PASS |
| Panel shell height 260 px preserved | PASS |
| No Runtime change | PASS |
| Unit: `priorityConversation.test.ts` | PASS |

---

## Out of scope (unchanged)

- Priority card grid
- `DecisionTerminal.tsx` source / Decision Report
- Decision Runtime / Story / Strategy
- Data model / API
- PDF generation

---

## Files

- `PriorityEngine/PriorityConversationPanel.tsx`
- `PriorityEngine/usePriorityConversation.ts`
- `PriorityEngine/priorityConversation.constants.ts`
- `PriorityEngine/priorityConversationProgress.ts`
- `PriorityEngine/priorityConversation.test.ts`
- `PriorityEngine/PriorityEngine.tsx` (mount conversation panel)
- `docs/reviews/PT-PRIORITY-DESIGN-02.md`
