# Embed Engine – Implementation Handover

## Baseline

**Living Experience v0.1 is FROZEN.**

SSOT:

- [`docs/architecture/living-experience-v0.1-freeze.md`](../architecture/living-experience-v0.1-freeze.md)
- [`docs/architecture/behavior-pack-contract.md`](../architecture/behavior-pack-contract.md)

Tag: `v0.1-living-experience`

### Rule for all future work

Extend **behavior** (Behavior Packs).

Do **not** redesign the architecture unless a new ADR explicitly approves it.

---

## Frozen pipeline

```text
Signal
  ↓
reduce()
  ↓
DecisionState
  ↓
project()
  ↓
Interpretation
  ↓
React (Priority · FAQ · AI Advisor)
```

### Completed

- Runtime orchestration (`applySignal`)
- Signal / DecisionState / Environment / Focus
- `reduce()` — sole writer of DecisionState
- `project()` — sole Interpretation producer
- Synchronized Decision Experience (Priority / FAQ / AI)

### Invariants

1. DecisionState is the only cognitive aggregate.
2. `reduce()` is the only writer.
3. `project()` is the only Interpretation producer.
4. Runtime contains orchestration only.
5. React contains rendering only.
6. Interpretation is the only source consumed by the three Pilot renderers.

---

## Next phase

**Behavior Packs** — primary evolution mechanism.

First recommended pack: **Energy Conscious Buyer** (contract only until implemented).

Do not start with component-driven features. Start with reaction-driven Behavior Pack work.

---

## Workflow

1. Read Living Experience v0.1 freeze
2. Extend via Behavior Pack contract
3. Architecture review only if ADR change is required
4. Implement → review → commit → push
