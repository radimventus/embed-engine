# PT-RACIO-REDESIGN-01 — FAQ progressive panel loading

## Verdict

**PASS.** Racio FAQ list shows **5** panels initially and expands by **5** via **Načíst další**, without changing FAQ content or generation.

## Scope

| In | Out |
| --- | --- |
| Visible count / load-more UX | FAQ titles, answers, order |
| Preserve already-visible panels | Runtime / generation logic |
| Unlimited expansion (data-bound) | Decision / AI wiring |

## Implementation

| File | Change |
| --- | --- |
| `faqProgressiveLoading.ts` | Page size `5`, `initial` / `next` / `hasMore` helpers |
| `faqProgressiveLoading.test.ts` | Unit coverage for paging math |
| `SuggestedQuestions.tsx` (`FaqList`) | Slice + text button **Načíst další** |

Content still flows from `faqItemsFromAiContext` unchanged — only the visible window moves.

## Behaviour

```text
5 FAQ → Načíst další → 10 → … → N (until items.length)
```

- Button hidden when `visibleCount >= items.length`
- Item identity (`item.id`) preserved → expanded panels stay open when loading more
- `items` reference change resets to the first page

## Validation

| Check | Result |
| --- | --- |
| Initial ≤ 5 | PASS (helpers + UI) |
| Button only when more remain | PASS |
| +5 per click, previous kept | PASS |
| No hard UI max beyond data | PASS |
| FAQ content / projection untouched | PASS |

```bash
pnpm --filter @embed-engine/client-studio exec node --import tsx --test \
  src/features/client-studio/sections/AIAdvisor/faqProgressiveLoading.test.ts
```

## Commit

`feat(faq): implement progressive panel loading`
