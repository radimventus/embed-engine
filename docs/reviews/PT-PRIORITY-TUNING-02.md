# PT-PRIORITY-TUNING-02 — CONIS Constitution Integration

Date: 2026-07-26

## Verdict

**Local PASS** — Priority right panel aligned with `docs/product/foundation/CONIS-CONSTITUTION.md`. Presentation only; Decision Flow and Runtime unchanged.

---

## Changes

| Area | Change |
|------|--------|
| Intro | Conis introduction + tinted start guidance block |
| Avatar | Minimalist geometric mark on every Conis message |
| Copy | Natural language; no technical chrome (“zaznamenán”, “Pokračujte”, “VYBERTE”) |
| Transitions | Human lines (Dobře / Už mám první představu / Děkuji / Rozumím) |
| Microinteractions | Visual ack + ~500 ms before next step |
| Typography | 13px body, clearer leading and spacing |
| FAQ + Chat | Single “Kde chcete pokračovat?” block |
| Section title | Soft human heading |

---

## Validation

| Check | Status |
|-------|--------|
| Conis introduces himself | PASS |
| Avatar visible | PASS |
| Texts match Constitution | PASS |
| No technical language | PASS |
| Paced transitions | PASS |
| FAQ/Chat unified | PASS |
| No Runtime / Decision Flow change | PASS |
| Unit tests | PASS |

---

## Files

- `ConisAvatar.tsx`, `ConisMessage.tsx`
- `PriorityConversationPanel.tsx`, `usePriorityConversation.ts`
- `priorityConversation.constants.ts`, `priorityConversation.test.ts`
- `SectionHeader.tsx`, `priorityExperience.test.ts`
- `docs/reviews/PT-PRIORITY-TUNING-02.md`
