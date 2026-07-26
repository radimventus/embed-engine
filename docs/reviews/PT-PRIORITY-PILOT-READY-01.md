# PT-PRIORITY-PILOT-READY-01 — Pilot readiness UX refinement

Date: 2026-07-26

## Verdict

**Local PASS** — Priority Experience presentation refined for pilot partner review. Runtime / Decision Flow / data model unchanged.

---

## Checklist → implementation map

| Review item | Implementation | Notes |
|-------------|----------------|-------|
| 1 Avatar larger / lighter / top-aligned | `ConisAvatar` 40px, lighter fill `#2A4A66`, gold nodes; `ConisMessage` `items-start` | Done |
| 2 Typography larger | Body 15px, lead 16px, quiz options 15px, FAQ 15/14px | Done |
| 3 First screen clarity | Split greeting + „Váš další krok“ block | Structure, not more prose |
| 4 Remove HLAVNÍ | Badge removed from `DecisionCard`; `isPrimary` ring kept internally | Done |
| 5 Priority order + clarifications | Order starts Pozemek → Dispozice…; right-panel clarifications for Dispozice & Investice | Card titles unchanged |
| 6 Orientation | Spacing, start heading, quiz highlight, audit CTA hierarchy | Done |
| 7 Microinteractions ~50% slower | `750ms` general | Done |
| 8 Quiz pacing ~1.5s + clearer copy | `CONIS_QUIZ_ADVANCE_MS = 1500`; rewritten prompts/options; stronger pending state | Done |
| 9 Right panel → Audit | Soft Audit prep copy + primary Audit CTA | Done |
| 10 FAQ UX | Title/subtitle, larger type, reorder by selected priorities (presentation only) | Runtime FAQ keys unchanged |
| 11 Transition opens next chapter | „Teď už vám lépe rozumím…“ + Audit path | FAQ/Chat remain secondary |
| 12 Constitution check | Copy reviewed against CONIS Constitution | Calm, no marketing, leaves decision to user |

### Not deferred

All checklist items above were implemented. No intentional skips.

---

## Validation

| Check | Status |
|-------|--------|
| Avatar trust / size | PASS |
| Typography readability | PASS |
| First screen structure | PASS |
| No HLAVNÍ in UI | PASS |
| Clarifications for Dispozice | PASS |
| Quiz pacing ≥ ~1.2s | PASS |
| Audit transition | PASS |
| FAQ title softened | PASS |
| No Runtime / Flow change | PASS |
| Unit tests | PASS |

Assets: `docs/reviews/assets/pt-priority-pilot-ready-01/`

---

## Files

- PriorityEngine: avatar, message, panel, constants, cards, DecisionCard, hook, progress, tests
- AIAdvisor: FAQ title/typography, `orderFaqItemsForPriorities`, AIAdvisor wiring
- `docs/reviews/PT-PRIORITY-PILOT-READY-01.md`
