# Decision Layer v1 — Architecture Freeze & Review

**Status:** FROZEN (documentation only)  
**Date:** 2026-07-20  
**SSOT:** [decision-layer.md](./decision-layer.md)  
**ADR:** [ADR-009 — Decision Layer](../adr/ADR-009-decision-layer.md) (Accepted — definitions freeze)

No Runtime / React / Kernel code changes accompany this freeze.

---

## Architecture summary

Guided deciding is now a first-class **Decision Layer** between Interpretation and Experience:

```text
Interpretation → Decision Strategy → Decision Story → Decision Move
Experience Layer → Decision Terminal (+ Priority, FAQ, AI, …)
```

Cognitive reasoning (`project` → Interpretation) stays separate from guidance orchestration (Strategy) and from rendering (Terminal).

---

## Architecture strengths

1. **Clean separation** — reasoning / Kernel orchestration / guidance / presentation are named and ordered.  
2. **Domain-first Moves** — guidance atoms are not UI widgets; 5–10 year evolution can change surfaces without renaming primitives.  
3. **Dynamic Stories** — rejects hardcoded page flows; Strategy is the adaptive hook.  
4. **Terminal as surface** — layout (panel, sheet, voice) is not architecture.  
5. **Trajectory deferred honestly** — long-term pattern learning reserved without polluting MVP DecisionState.  
6. **Compatible with Living Experience** — Priority / FAQ / AI remain Interpretation renderers; Terminal renders Stories.

---

## Architecture weaknesses

1. **Strategy placement is abstract** — Decision Layer is defined after Interpretation, but package/module home (core vs decision vs new package) is undecided.  
2. **Dual “Story” vocabularies** — earlier Decision Terminal docs used Confirmation→Recommendation stages; Decision Layer uses Move sequences. Both kept with clarification; risk of confusion until one projection model exists.  
3. **Behavior Pack vs Strategy overlap** — Pack owns composition rules; Strategy applies them. Boundary is clear in prose, easy to blur in code.  
4. **Legacy `packages/decision`** — CommandRuntime / ExperienceModel path still coexists; naming collision with “Decision Layer”.  
5. **Move → Signal contract** — lifecycle says Moves complete via Signals; Signal catalog for Moves is unspecified.  
6. **Active Focus vs Strategy** — Focus drives Interpretation today; Strategy’s inputs beyond Interpretation are not yet enumerated.

---

## Remaining unknowns (reported — not silently fixed)

| # | Unknown | Why it matters |
| --- | --- | --- |
| U1 | Where Decision Strategy executes (pure function? Runtime service? Behavior Pack runtime?) | Affects testability and package boundaries |
| U2 | Is Decision Story an Interpretation field, a Strategy output object, or both? | Affects Living Experience sync rule |
| U3 | Relationship of conceptual Story **stages** to Move sequences | Product language vs domain model |
| U4 | How Priority card toggles relate to Moves (are they Moves, Signals only, or both?) | Avoid double semantics |
| U5 | Whether AI Advisor is a Terminal modality or a peer surface that also consumes Stories | Channel vs surface |
| U6 | Decision Trajectory storage model when eventually built | Must not create a second cognitive aggregate |

---

## Recommended next milestone

**Decision Layer contracts (still docs / types-first):**

1. Accept ADR-009 definitions (this freeze).  
2. Specify Decision Move / Story / Strategy **data contracts** (no UI).  
3. Extend Behavior Pack contract sections for Move library + composition rules (aligned).  
4. Resolve U2: how Story reaches Decision Terminal without breaking “one Interpretation update → all surfaces”.  
5. Only then: first Terminal renderer epic (ADR-008) consuming Strategy output.

Do **not** start with a right-panel UI redesign.

---

## Freeze rule

Extend Decision Layer via contracts and Behavior Packs.  
Do not fold Strategy into React.  
Do not put Terminal in Kernel.  
Do not implement Trajectory without a dedicated ADR.
