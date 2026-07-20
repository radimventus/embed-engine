# Decision Layer v1 — Architecture Freeze & Review

**Status:** FROZEN (documentation only)  
**Date:** 2026-07-20  
**SSOT:** [decision-layer.md](./decision-layer.md)  
**Strategy SSOT:** [decision-strategy.md](./decision-strategy.md) (DT-002 / ADR-010)  
**ADR:** [ADR-009](../adr/ADR-009-decision-layer.md) · [ADR-010](../adr/ADR-010-decision-strategy.md)

No Runtime / React / Kernel code changes accompany this freeze.

---

## Architecture summary

```text
Interpretation + Behavior Pack
  → Decision Strategy → Decision Story → Decision Move
Experience Layer → Decision Terminal (+ Priority, FAQ, AI, …)
```

Kernel ends at Interpretation. Strategy composes dialogue. Terminal renders Stories.

DT-002 locked: single Strategy responsibility, hybrid composition, Strategy-owned continuation, Stages demoted to Move intents, Story not an Interpretation field.

---

## Architecture strengths

1. Clean separation — reasoning / guidance / presentation  
2. Domain-first Moves  
3. Dynamic hybrid Stories  
4. Terminal as surface  
5. Trajectory deferred honestly  
6. Compatible with Living Experience peers  

---

## Architecture weaknesses / open risks

See **R1–R8** in [decision-strategy.md](./decision-strategy.md) (hosting, transport, eligibility DSL, Signals, Priority↔Move, AI channel, legacy package, Trajectory schema).

Former U2/U3 resolved by ADR-010. U1 remains as R1.

---

## Recommended next milestone

**DL-01:** Move / Story / Strategy data contracts (no UI), then Pack libraries, then ADR-008 Terminal.

---

## Freeze rule

Extend via contracts and Behavior Packs.  
Do not fold Strategy into React.  
Do not put Terminal in Kernel.  
Do not implement Trajectory without a dedicated ADR.
