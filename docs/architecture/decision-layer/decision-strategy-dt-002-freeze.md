# DT-002 — Decision Strategy Architecture Freeze

**Status:** FROZEN (documentation only)  
**Date:** 2026-07-20  
**SSOT:** [decision-strategy.md](./decision-strategy.md)  
**ADR:** [ADR-010](../adr/ADR-010-decision-strategy.md)

---

## Decisions locked

| Topic | Decision |
| --- | --- |
| Definition | Strategy composes the active Decision Story from Interpretation + Behavior Pack |
| Single responsibility | Compose the active Decision Story |
| Output | Decision Story (Moves + cursor/status) — not Interpretation field |
| Kernel role | Ends at Interpretation; does **not** author Stories |
| Select vs generate | **Hybrid** |
| Move transitions | **Strategy owns continuation** (recompose); Moves declare eligibility/completion only |
| Stages / Acts / Chapters | **Not first-class**; optional Move intents only |
| Trajectory | Future optional Strategy input; not MVP |
| Minimal Decision Layer | Strategy → Story → Move only |

---

## Risks left open

R1–R8 in the SSOT (hosting, transport, eligibility DSL, Signals, Priority↔Move, AI channel, legacy package, Trajectory schema).

---

## Next milestone

Data contracts for Decision Move / Story / Strategy (DL-01) — still no UI.
