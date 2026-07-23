# PT-PRIORITY-REDESIGN-01 — Priority visual layout restore

Date: 2026-07-23

## Verdict

**PASS** — Priority section restored to original visual hierarchy: no info chrome between title and cards, 5×2 grid, gold borders, Decision Terminal height matches two card rows, Decision Report capped at 350 px. Decision Engine / Priority logic unchanged.

---

## Changes

| Area | Change |
|------|--------|
| Selection info panel | Removed `Vybráno …` copy from `SectionHeader`; title band spacing restored |
| End panel | `PRIORITY_ENGINE_SHOW_RECOMMENDATION_PANEL = false` (hides “Prozkoumejte strukturu domu” recommendation chrome) |
| Card grid | Kept `grid-cols-5`; removed `tablet:grid-cols-3` (was forcing 3×4 on desktop); gap **22 px** |
| Idle card | `border` 1 px `#D4AF37` |
| Active card | `border-2` `#D4AF37` (selection/open state) |
| Decision Terminal | Height = `2 × 119 + 22` = **260 px**; scroll inside; no logic changes |
| Decision Report | Kept; `maxHeight: 350` + `overflow-y-auto` |

---

## Validation

| Check | Status |
|-------|--------|
| Info panels removed | ✅ |
| Title → cards directly | ✅ |
| 5 × 2 layout (desktop) | ✅ |
| Gap ~22 px | ✅ |
| 1 px gold default border | ✅ |
| 2 px gold active border | ✅ |
| Terminal height = two card rows | ✅ (260 px) |
| Report max 350 px | ✅ |
| Priority functionality preserved | ✅ (signals / Runtime untouched) |
| Unit: `priorityExperience.test.ts` | ✅ |

---

## Out of scope (unchanged)

Decision Engine · Priority logic · Terminal UX/content · Report UX/logic · Runtime · Delivery

---

## Files

- `PriorityEngine/SectionHeader.tsx`
- `PriorityEngine/PriorityCards.tsx`
- `PriorityEngine/DecisionCard.tsx`
- `PriorityEngine/decision-cards-layout.ts`
- `PriorityEngine/priority-engine-layout.ts`
- `PriorityEngine/priorityExperience.test.ts`
- `DecisionTerminal/DecisionTerminal.tsx`
- `DecisionReport/DecisionReport.tsx`
