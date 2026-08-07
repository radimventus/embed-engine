# CAP-P03 — Decision Runtime MVP

**Status:** Complete — first end-to-end Decision Runtime milestone  
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

## Remaining gaps (moved to backlog)

Tracked in [`../product/backlog/PRODUCT_BACKLOG.md`](../product/backlog/PRODUCT_BACKLOG.md) — not unfinished CAP-P03 work:

| Gap | Backlog |
| --- | --- |
| Stairs Move splice + household branching + richer outcome | CAP-P04 |
| Energy Conscious Buyer pack | CAP-P05 |
| Move-completion Signal overload | OQ-P01 |
| Room media thin | OQ-P03 |
| Dual CommandRuntime path | RT-01 |
| No persistence | PRI-PM-03 / PRI-PM-04 (ADR-007) |
