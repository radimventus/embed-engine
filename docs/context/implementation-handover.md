# Embed Engine – Implementation Handover

## Baseline

**Living Experience v0.1** is frozen (cognitive sync).  
**Decision Layer v1** is frozen (definitions only — ADR-009).

SSOT:

- [`docs/architecture/living-experience-v0.1-freeze.md`](../architecture/living-experience-v0.1-freeze.md)
- [`docs/architecture/decision-layer/decision-layer.md`](../architecture/decision-layer/decision-layer.md)
- [`docs/architecture/behavior-pack-contract.md`](../architecture/behavior-pack-contract.md)
- [`docs/architecture/experience/decision-terminal.md`](../architecture/experience/decision-terminal.md)

### Rule for all future work

Extend **behavior** (Behavior Packs + Decision Layer contracts).

Do **not** redesign the cognitive pipeline unless a new ADR explicitly approves it.

Do **not** put Decision Strategy or Move libraries in React.

Do **not** put Decision Terminal in Kernel.

---

## Frozen cognitive pipeline

```text
Signal → reduce() → DecisionState → project() → Interpretation
```

## Decision Layer (definitions freeze)

```text
Interpretation → Decision Strategy → Decision Story → Decision Move
```

Experience Layer renders (Decision Terminal, Priority, FAQ, AI, …).

Decision Trajectory = **future only**.

---

## Priority MVP policy (closed)

ADR-007: absolute weights; single visitor; active-Experience-only DecisionState.

## Next milestones (recommended order)

1. Decision Move / Story / Strategy **data contracts** (resolve ADR-009 unknowns U1–U2)  
2. Behavior Pack sections for Move library + composition  
3. ADR-008 Acceptance + Decision Terminal renderer epic  
4. First Behavior Pack: Energy Conscious Buyer  

---

## Workflow

1. Read Decision Layer + Living Experience freezes  
2. Extend via Behavior Pack / Decision Layer contracts  
3. Architecture review only if ADR change is required  
4. Implement → review → commit → push
