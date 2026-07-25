# PT-003 — Decision Context Engine

## Verdict

**Pass** — DecisionContext is the sole interpretive input for Priority Experience modules.

## Pipeline

```text
User → Priority Selection → Signals → Decision Story → Decision Context → Experience
```

## Runtime

| Piece | Location |
| --- | --- |
| `DecisionContext` | `priority-pipeline-mvp/DecisionContext.ts` |
| `buildDecisionContext(story)` | `priority-pipeline-mvp/buildDecisionContext.ts` |
| Session API | `buildDecisionContext()` / `getDecisionContext()` on `PriorityDecisionSession` |
| Public export | `@embed-engine/runtime` + `/priority-pipeline` |

## Experience

Components read `useDecisionContext()` (Runtime `buildDecisionContext` over Live `priorityIds`).

Interpretation headlines, summaries, and recommendations come from Context mapping table — not from React components.

## Validation

1. energy / layout / privacy → Context headline/summary/recommendations (PT example copy)
2. design primary → different Context; Experience texts change without component edits

## Out of scope (next)

- FAQ (PT-004), AI (PT-005), Report — will consume the same DecisionContext
