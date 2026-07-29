# PT-PRIORITY-TUNING-01 — Priority dramaturgy tuning

Date: 2026-07-26

## Verdict

**Local PASS** — Priority follows two mental stages: collection first, refinement only after the user finishes selection. Conis does not interrupt mid-task.

## Philosophy note

> Conis vede člověka po jednotlivých mentálních krocích. Nikdy po něm nechce dvě různé věci současně.

Applies here; intended as a broader Experience principle (Racio, Audit, …).

---

## Stages

| Stage | Phase | Right panel |
|-------|--------|-------------|
| 1 Collection | `instruction` | Instruction only (select ≥3, intensity) |
| 1 Collection | `collecting` | Tags + intensity % + continue navigator (no questions) |
| 1 Collection | `collection-gate` | „Je to vše?“ → Dokončit výběr / Přidat další |
| 2 Refinement | `prep` | Short mental prep → Pokračovat |
| 2 Refinement | `dialog` | Exactly **3** highlighted questions |
| 2 Refinement | `complete` | Summary + FAQ / Chat + PDF note |

Dialog starts only after **Dokončit výběr**. Up to 10 priorities can be selected.

---

## Validation

Local `http://127.0.0.1:5180/` — `docs/reviews/assets/pt-priority-tuning-01/`.

| Check | Status |
|-------|--------|
| Finish selection without dialog interrupt | PASS |
| Dialog only after finish confirmation | PASS |
| Questions visually highlighted | PASS |
| Max 3 refinement questions | PASS |
| Tags with intensity % | PASS |
| Natural stage transitions | PASS |
| Unit tests | PASS |

---

## Unchanged

Runtime · Decision Strategy / Story · data model · Priority grid · Experience architecture

---

## Files

- `PriorityEngine/usePriorityConversation.ts`
- `PriorityEngine/PriorityConversationPanel.tsx`
- `PriorityEngine/priorityConversation.constants.ts`
- `PriorityEngine/priorityConversationProgress.ts`
- `PriorityEngine/priorityConversation.test.ts`
- `PriorityEngine/PriorityEngine.tsx` (`items-start` alignment)
- `docs/reviews/PT-PRIORITY-TUNING-01.md`
