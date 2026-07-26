# PT-PRIORITY-REDESIGN-01 — Priority visual layout restore

Date: 2026-07-26

## Verdict

**PASS** — Priority section visual hierarchy restored. Core layout landed in `16a415a`; follow-up fixes gold card borders under Embed CSS isolation and keeps title → cards with no intervening info chrome.

---

## Changes

| Area | Change |
|------|--------|
| Selection info panel | Removed `Vybráno …` / `Volby můžete…` from `SectionHeader` |
| End recommendation chrome | `PRIORITY_ENGINE_SHOW_RECOMMENDATION_PANEL = false` — hides “Prozkoumejte strukturu domu” panel |
| Title → cards | `DecisionStoryRecommendationBanner` removed from between title and cards |
| Card grid | `grid-cols-5`, gap **22 px** (no `tablet:grid-cols-3`) |
| Idle card | 1 px solid `#D4AF37` (inline `borderStyle` + classes — beats embed boundary button reset) |
| Active card | 2 px solid `#D4AF37` |
| Decision Terminal | Height = `2 × 119 + 22` = **260 px**; scroll inside; no logic changes |
| Decision Report | Kept; `maxHeight: 350` + `overflow-y-auto` |

---

## Validation

Local Embed Demo `http://127.0.0.1:5180/` — Playwright Chromium-1228 — assets in `docs/reviews/assets/pt-priority-redesign-01/`.

| Check | Status |
|-------|--------|
| Info panels removed | PASS |
| Title → cards directly | PASS |
| 5 × 2 layout (desktop) | PASS |
| Gap ~22 px | PASS |
| 1 px gold default border | PASS |
| 2 px gold active border | PASS |
| Terminal height = two card rows | PASS (260 px) |
| Report max 350 px | PASS |
| Priority functionality preserved | PASS |
| Unit: `priorityExperience.test.ts` | PASS |

Root cause of prior border miss: `[data-embed-boundary] button { border-style: none }` left style `none`, so used border width stayed 0 despite Tailwind `.border` / `.border-2`. Fixed with explicit `border-solid` + inline `borderStyle` / `borderWidth` / `borderColor` on `DecisionCard`.

---

## Out of scope (unchanged)

Decision Engine · Priority logic · Terminal UX/content · Report UX/logic · Runtime · Delivery

Runtime label string “Prozkoumejte strukturu domu” may still appear **inside** Terminal/Report content — not as the removed end recommendation panel.

---

## Files

- `PriorityEngine/PriorityEngine.tsx`
- `PriorityEngine/DecisionCard.tsx`
- `PriorityEngine/decision-cards-layout.ts`
- `PriorityEngine/SectionHeader.tsx`
- `PriorityEngine/PriorityCards.tsx`
- `PriorityEngine/priority-engine-layout.ts`
- `PriorityEngine/priorityExperience.test.ts`
- `DecisionTerminal/DecisionTerminal.tsx`
- `DecisionReport/DecisionReport.tsx`
- `docs/reviews/PT-PRIORITY-REDESIGN-01.md`
