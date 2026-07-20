# Decision Terminal

**Status:** Architecture Freeze v0.1 (documentation only)  
**Date:** 2026-07-20  
**Depends on:** Living Experience v0.1, ADR-002, ADR-003, ADR-007  
**Related ADR:** [ADR-008 — Decision Terminal](../adr/ADR-008-decision-terminal.md) (Proposed)  
**Freeze summary:** [Decision Terminal v0.1 Freeze](./decision-terminal-v0.1-freeze.md)

This document defines **Decision Terminal** as a product-architecture concept.  
It does **not** prescribe layout pixels, React components, or Runtime APIs.

---

## Mission

Decision Terminal is the **reusable interpretation surface** of the Decision Experience.

Its mission is to make the engine’s current understanding of the user’s decision process **legible and actionable** — in one place that can appear wherever the Experience needs it.

It answers:

> “Given what we know so far, what does this mean for the decision — right now?”

---

## What Decision Terminal is

- A **surface** that renders meaning from **Interpretation** (and, later, richer projected fields).
- Driven by **Active Focus** of the decision process — not by a single UI widget owning the story.
- A home for the **Decision Story** (conceptual stages of understanding).
- Reusable across Client Studio (and future Studios) without becoming a fixed chrome region.

## What Decision Terminal is not

**Decision Terminal is NOT a “right panel”.**

| Not this | Because |
| --- | --- |
| A fixed layout slot to the right of Priority cards | Placement is a renderer choice; the concept is portable |
| A Priority-card detail drawer | Focus may be a room, media, conflict, or recommendation — not only a card |
| A second intelligence | It does not score, reduce, or invent meaning |
| FAQ, AI Advisor, or House Navigator | Those are peer renderers / explorers; Terminal narrates the shared mind |
| Decision Trajectory (MVP) | Trajectory is a future capability (see below) |

Historical UI language that called the Priority intro / copy area a “right panel” is **superseded** by this concept for architectural intent.

---

## Responsibilities

Decision Terminal **does**:

1. Present the current **Active Focus** in human language.  
2. Advance or reflect the **Decision Story** stage (conceptually).  
3. Surface Interpretation fields relevant to the moment (context, reasons, next action, recommendations, conflicts when projected).  
4. Invite the next meaningful Signal (explore, confirm, challenge, ask) without owning Signal creation rules.  
5. Stay synchronized with Priority, FAQ, and AI Advisor via the same Interpretation.

Decision Terminal **does not**:

1. Write DecisionState.  
2. Call `reduce()` or `project()`.  
3. Contain Behavior Pack rules.  
4. Reconstruct domain graphs or Object Package truth.  
5. Replace Priority cards, FAQ lists, AI chat, or spatial explorers.  
6. Persist Decision Trajectory in MVP.

---

## Relationship to Interpretation

```text
DecisionState
    → project()
    → Interpretation
    → Decision Terminal (renderer / surface)
```

Interpretation is the **only** cognitive source the Terminal may consume (same rule as Priority / FAQ / AI).

The Terminal may compose presentation from Interpretation fields (`activeTopic`, `conversationContext`, `recommendations`, `nextAction`, priority reasons, etc.). It must not invent parallel meaning.

---

## Relationship to Runtime

Runtime orchestrates:

`Signal → reduce → DecisionState → project → Interpretation`

Decision Terminal is an **Experience Layer** consumer. It may:

- subscribe to Interpretation (via the shared provider / Experience bridge),
- emit Signals through existing Runtime APIs when the user acts.

It must not embed Kernel logic or hold a private DecisionState.

---

## Relationship to Priority

| Priority | Decision Terminal |
| --- | --- |
| Renders the priority **filter** (weights, ranks, highlights) | Renders the **story of what that filter means now** |
| Card click sets Focus via Signal | Reacts to Focus / Interpretation — not to “which card was last clicked” as private state |
| Peer renderer | Peer surface; both read the same Interpretation |

Selecting a Priority card may change Active Focus; the Terminal explains the consequence. The Terminal is not a property inspector for one card.

---

## Relationship to AI Advisor

| AI Advisor | Decision Terminal |
| --- | --- |
| Conversational channel (asks / acknowledges) | Narrative / decision-stage surface |
| Uses `conversationContext`, `nextAction`, etc. | May show overlapping Interpretation fields in a non-chat form |
| Local transcript is chrome | Terminal story stages are conceptual, not chat turns |

They must **think together** (one Interpretation). They must not duplicate conflicting advice.

---

## Relationship to FAQ

| FAQ | Decision Terminal |
| --- | --- |
| Renders `recommendedQuestions` | May explain *why* the topic matters in the Decision Story |
| Opens questions → Signals | May highlight the same Active Focus without owning the question bank |

---

## Relationship to House Navigator

House Navigator is a **spatial explorer**. Opening rooms / floors emits Signals → Focus → Interpretation.

Decision Terminal **reacts** to that Focus (e.g. layout emphasis after a room) as part of Discovery / Reality Check stages. It does not replace floor plans or room lists.

---

## Relationship to Media Explorer

Media Explorer is a **media explorer**. Opening gallery / media emits Signals.

Decision Terminal reflects the resulting Interpretation (e.g. design emphasis) without embedding the media rail.

---

## Active Focus

**Active Focus** is the current center of the decision process as understood by the Cognitive Layer (today: primarily `DecisionState.focus` projected into Interpretation — e.g. `activeTopic`, elevated priorities, reasons).

Decision Terminal reacts to **Active Focus**, not to a specific Priority card instance.

### Evolution of focus (conceptual)

```text
single priority
      ↓
combination of priorities
      ↓
decision conflict
      ↓
recommendation
```

These are **focus shapes**, not UI screens. MVP may only express the first steps richly; later stages require richer Interpretation / Behavior Packs — not a Terminal redesign of the pipeline.

---

## Decision Story

### Purpose

Decision Story is the **narrative arc** of how understanding deepens during an Experience. It gives Decision Terminal a vocabulary for “where we are” in the decision process.

### Lifecycle

Story progresses as Signals accumulate and Interpretation changes. Stages may skip, revisit, or run in parallel depending on Behavior Pack and user path. Stage identity is **conceptual** — projected labels may appear later; React must not invent stage machines that bypass Interpretation.

### Stages (conceptual — not fixed screens)

| Stage | Intent |
| --- | --- |
| **Confirmation** | Acknowledge what the user just did / what Focus is |
| **Discovery** | Open relevant meaning (questions, topics, what to explore next) |
| **Interpretation** | Explain what the engine understands about priorities and object fit |
| **Reality Check** | Ground claims in spatial / media evidence the user has seen |
| **Recommendation** | Propose a coherent next step or ranked emphasis |

Implementations may map these to Terminal content blocks; they must not become a mandatory five-page wizard.

---

## Decision Trajectory

### Definition

**Decision Trajectory** represents the evolution of a user’s decision process **across time** — patterns beyond the current DecisionState snapshot.

### Status

**NOT part of MVP implementation.**  
Future architectural capability only.

### Potential inputs (illustrative)

- priority changes  
- intensity changes  
- interaction order  
- repeated visits  
- timestamps  
- recurring behavioral patterns  

### Relationship to Interpretation

Decision Trajectory **extends** Interpretation (e.g. as future projected history / pattern fields).  
It does **not** replace Interpretation.  
It does **not** become a second cognitive aggregate.  
Persistence of trajectory is governed by ADR-007 (MVP: active Experience only) until a future persistence ADR.

---

## Architectural consequences

1. Replace “right panel” product language with **Decision Terminal** where architectural intent is meant.  
2. Keep Living Experience rule: one Interpretation → many surfaces (Priority, FAQ, AI, Terminal).  
3. Implementation (when approved) extends projected fields / Behavior Packs — not a new pipeline.  
4. Decision Trajectory stays deferred; no schema work in this freeze.

---

## Open questions

None that block documenting this freeze. Implementation sequencing (when Terminal ships relative to first Behavior Pack) is a **product backlog** choice, not an architectural ambiguity.

Deferred to ADR-008 acceptance + implementation epic:

- Exact Interpretation fields for Story stage labels  
- Whether Terminal is co-located with Priority in Client Studio v1 layout  

---

## See also

- [Decision Terminal v0.1 Freeze](./decision-terminal-v0.1-freeze.md)  
- [Living Experience v0.1 Freeze](../living-experience-v0.1-freeze.md)  
- [Behavior Pack Contract](../behavior-pack-contract.md)  
- [Experience Model (foundations)](../../foundations/03-experience-model.md)
