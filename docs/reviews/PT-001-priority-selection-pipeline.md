# PT-001 — Priority Selection Pipeline (MVP)

## Verdict

**Pass** (Runtime + Experience projection). Vertical slice:

```text
User → Priority Selection → Runtime Signal → Decision Story → Experience Update
```

## What was implemented

| Piece | Location |
| --- | --- |
| MVP Decision Session façade | `@embed-engine/runtime/priority-pipeline` — `createDecisionSession`, `selectPriority`, `removePriority`, `recordSignal`, `buildDecisionStory`, `getDecisionStory` |
| MVP Decision Story | `primaryPriority`, `secondaryPriority`, `selectedPriorities[]`, `updatedAt` (order only — no heuristics) |
| Certified Runtime bridge | Façade dispatches `ChangePriority` into `DecisionSessionRuntime` |
| Experience projection | `PriorityDecisionStoryPanel` in Decision Terminal (Embed mounts same Client Studio Experience) |
| Pure projection helper | `projectPriorityPipelineStory` on public `@embed-engine/runtime` |

## Validation (automated)

`packages/runtime` — `PriorityDecisionSession.test.ts`:

1. Select `energy`, `layout`, `privacy` → 3 `PrioritySelected` signals  
2. Decision Story primary/secondary/order correct  
3. Certified Runtime Experience `priorityIds` / `prioritySignals` / `story` / `terminal` update  

## Manual scenario (partner demo)

1. Open Experience (Embed or Local developer shell)  
2. Scroll to Priority  
3. Select **Energie**, **Dispozice**, **Soukromí**  
4. Observe Decision Story panel: Primary / Secondary / ordered list update  
5. Observe Terminal recommendation / drivers change with Runtime Context  

## Architecture compliance

- Runtime owns state; UI is projection only  
- One user action → one MVP signal (`PrioritySelected` / `PriorityRemoved`) + `ChangePriority` event  
- No AI / FAQ / Report / Analytics / Persistence / Behavior Packs  
- Hero untouched  
- No new Decision Engine — façade over existing session pipeline  
- `createDecisionSession` intentionally on `/priority-pipeline` (ED-DA-03 keeps it off main barrel)

## Out of scope (next PTs)

- Wire Live UI toggles through façade `selectPriority` instead of bulk `ChangePriority` (bridge still uses ordered `ChangePriority`; MVP signals covered by façade API)  
- Persist Decision Session  
- FAQ / Chat / Audit / Report personalization from Decision Story  
