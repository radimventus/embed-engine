# ADR-008 — Decision Terminal

**Status:** Accepted  
**Date:** 2026-07-20  
**Accepted:** 2026-07-21 (S-004 — Decision Terminal Production)  
**Depends on:** Living Experience v0.1, ADR-009 Decision Layer, ADR-002, ADR-003, ADR-007, RI-001, RI-002, RI-003  
**Concept SSOT:** [Decision Layer — Terminal](../decision-layer/decision-layer.md#decision-terminal-experience-layer) · [Vocabulary index](../decision-layer/README.md)  
**Experience modalities:** [Decision Terminal modalities](../experience/decision-terminal.md)  
**Decision Layer SSOT:** [Decision Layer](../decision-layer/decision-layer.md)  
**Supersedes (terminology):** earlier wording that treated “right panel” as the architecture for guidance.

---

# Context

ADR-009 / ADR-010 freeze Decision Move / Story / Strategy.

Decision Terminal is the **Experience Surface** that renders Decision Stories. It is not Kernel, not Strategy, and not synonymous with a right panel.

---

# Decision

Accept Decision Terminal as an Experience Layer surface that:

- renders Decision Stories (sequences of Decision Moves)
- may be presented as right panel, fullscreen, bottom sheet, AI conversation, voice, or future channels
- emits Signals when Moves are completed / skipped / deferred (and related user intents)
- stays peer-coherent with Priority, FAQ, AI Advisor, Recommendation

Decision Trajectory remains out of scope.

---

# Acceptance resolutions (S-004)

Former gate items, closed without architecture redesign:

| Gate | Resolution |
| --- | --- |
| How Story reaches Terminal (U2) | Session snapshot `decisionStory` via Runtime / Experience Binding (RI-001, RI-002, EX-01). Terminal does not call Strategy. |
| First modality | Co-located panel beside Priority Experience (Client Studio). Layout is presentation, not architecture. |
| Pack ↔ Terminal | Terminal reads Move presentation fields from Behavior Pack Move library (`advisorPrompt`, intent, purpose, tradeOff). Pack does not modify UI chrome. |

---

# Non-goals

- Implementing Strategy or Move engines in this ADR
- Placing Terminal in Kernel
- Equating Terminal with “Priority Detail” or a static page flow

---

# Related

- [RI-003 — Experience Kernel](../../04-reference-implementation/RI-003-Experience-Kernel.md)
- Implementation: Client Studio `sections/DecisionTerminal/`
