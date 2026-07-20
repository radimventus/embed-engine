# CAP-P03 — Decision Runtime MVP

**Status:** Implemented (minimal)  
**Architecture:** Frozen — no new layers

## Implemented Runtime diagram

```text
Priority click (layout)
        │
        ▼
   QUESTION_OPENED Signal
        │
        ▼
 Runtime.applySignal
        │
        ├─ reduce() → DecisionState
        ├─ project() → Interpretation
        └─ Decision Strategy (disposition-layout-v1 composer)
                │
                ▼
         Decision Story  → RuntimeState.decisionStory
                │
                ▼
         Decision Terminal (renders active Move)
                │
        User completes Move (room Signal or Acknowledge)
                │
                ▼
         Strategy advances cursor
                │
                ▼
         … until Decision Outcome
```

## Demo instructions

1. `pnpm --filter @embed-engine/core build`
2. `pnpm --filter @embed-engine/object-house build`
3. `pnpm --filter @embed-engine/client-studio dev`
4. Open Client Studio.
5. Click Priority **Dispozice** (layout).
6. Decision Terminal shows Move 2 (day zone) — confirm auto-completes.
7. Open living or kitchen in House Navigator → night-zone Move.
8. Open a night room or switch floor → interpret Move.
9. Click **Acknowledge & continue** through compare/warn/ask/recommend.
10. Terminal shows **Decision outcome** (conditional fit).

## Remaining gaps before Pilot #1

- Stairs branch Move not spliced dynamically
- Outcome always conditional-fit (no household branching)
- Move-completion still overloads `QUESTION_OPENED` (OQ-P01)
- Room media still thin (OQ-P03)
- Dual CommandRuntime path unchanged
- No persistence (ADR-007)
