# Behavior Pack — Architectural Contract

**Status:** CONTRACT ONLY (not implemented)  
**Date:** 2026-07-20  
**Depends on:** [Living Experience v0.1 Freeze](./living-experience-v0.1-freeze.md), [Decision Layer vocabulary](./decision-layer/README.md), ADR-002, ADR-003, ADR-009, ADR-010  
**Rule:** Behavior Packs extend **behavior**. They must not change the cognitive pipeline and must **not** modify UI.

Decision Move / Story / Strategy definitions: **link only** — [decision-layer/README.md](./decision-layer/README.md).

```text
Signal → reduce() → DecisionState → project() → Interpretation
                         ↓
                 Decision Strategy → Decision Story → Decision Move
                         ↓
                   Experience Layer
```

This document defines **what a Behavior Pack is** and **what it must own**.  
It does **not** prescribe package layout, file names, or runtime loading APIs.

---

## 1. Definition

A **Behavior Pack** is one **decision profile**.

It encodes how Embed Engine should interpret Signals, project meaning, and **guide** deciding for a specific buyer mindset.

Examples (profiles, not implementations):

| Behavior Pack | Decision posture |
| --- | --- |
| Energy Conscious Buyer | Minimize energy risk and operating cost |
| Young Family | Optimize layout, safety, flexibility |
| Investor | Emphasize yield, liquidity, maintenance |
| Luxury Buyer | Emphasize design, quality, privacy |

A Behavior Pack **provides**:

- domain knowledge  
- decision rules  
- **Decision Move library**  
- **Story composition rules**  

A Behavior Pack is **not**:

- a React feature or UI theme  
- something that “modifies UI”  
- a CMS page  
- a second DecisionState  
- a parallel Interpretation producer  
- an AI prompt dump without structure  
- Decision Strategy itself (Strategy *applies* Pack rules)

---

## 2. Place in the architecture

```text
Object Package          Behavior Pack
       │                      │
       │         ┌────────────┴────────────┐
       │         │ knowledge · rules       │
       │         │ Move library            │
       │         │ Story composition rules │
       │         └────────────┬────────────┘
       └──────────┬───────────┘
                  ▼
            DecisionState
                  │
                  ▼
              project()     (Pack rules → Interpretation)
                  │
                  ▼
           Interpretation
                  │
                  ▼
         Decision Strategy  (Pack composition → Story)
                  │
                  ▼
           Decision Story / Moves
                  │
══════════════════╧══════════════════
           Experience Layer
                  │
                  ▼
         Decision Terminal · Priority · FAQ · AI · …
```

| Layer | Owns |
| --- | --- |
| Object Package | Immutable object truth |
| Behavior Pack | Knowledge, rules, Move library, Story composition |
| `reduce()` | Evolve DecisionState (profile-agnostic mechanics) |
| `project()` | DecisionState → Interpretation (Pack interpretation rules) |
| Decision Strategy | Apply Pack composition rules → Story |
| Experience | Render Stories / Interpretation; emit Signals |

**Invariants:**

- React / Experience surfaces never import Behavior Pack rules.  
- Behavior Pack never writes DecisionState.  
- Behavior Pack never renders UI.

---

## 3. Contract sections

Every Behavior Pack MUST declare the following sections.  
Sections may be empty only if explicitly marked `none` with rationale.

### 3.1 Identity

| Field | Purpose |
| --- | --- |
| `id` | Stable pack id (e.g. `energy-conscious-buyer`) |
| `title` | Human name |
| `summary` | One paragraph: who this buyer is |
| `version` | Pack version for Pilot knowledge tracking |

### 3.2 Signals

Which Signals matter for this profile, and how they are weighted in meaning (not how `reduce` stores them).

Must define:

- relevant `SignalType`s  
- optional Signal payload expectations  
- which Signals are **strong**, **weak**, or **ignored** for this profile  

Does **not** redefine Signal types.

### 3.3 Priority Rules

How DecisionState / Focus maps to Interpretation priorities.

Output fields: `Interpretation.priorities` (`weight`, `rank`, `reason`, `highlighted`).

### 3.4 Recommendations

Short actionable guidance strings.

Output field: `Interpretation.recommendations`.

### 3.5 Conversation Context

Framing for conversational surfaces.

Output field: `Interpretation.conversationContext`.

### 3.6 Question Strategy

FAQ / suggested questions selection and `why` templates.

Output field: `Interpretation.recommendedQuestions`.

### 3.7 Next Actions

Suggested next step templates.

Output fields: `Interpretation.nextAction`, contributes to `activeTopic`.

### 3.8 Decision Move library

Catalog of **Decision Moves** this pack may offer.

Each Move entry should eventually declare (contract-level; schema TBD):

- stable `id`  
- intent / purpose  
- eligibility hints (Interpretation / Focus conditions)  
- completion Signal expectations  
- non-UI description of the guided step  

Moves are domain primitives — not cards or screens.

### 3.9 Story composition rules

How **Decision Strategy** assembles Moves into a **Decision Story** for this profile (ADR-010).

Must define:

- hybrid selection spines / templates (optional)  
- compose rules from the Move library given Interpretation  
- when to recompose on Interpretation change  
- optional **Move intent** preferences — **not** first-class Stages/Acts/Chapters  

Strategy applies these rules; the Pack does not execute Strategy and does not modify UI.
### 3.10 Required Knowledge

Object / product knowledge required for honest guidance.

### 3.11 Constraints

Forbidden claims, compliance boundaries, aggressiveness limits.

### 3.12 Output mapping

| Pack section | Consumed by |
| --- | --- |
| Priority / Question / Conversation / Next / Recommendations | `project()` → Interpretation |
| Move library + Story composition | Decision Strategy → Story → Moves |
| Signals affinity | indirect via Focus after `reduce` |
| Required Knowledge / Constraints | quality gates on projected + guided content |

---

## 4. Non-goals (v0)

- Runtime pack marketplace  
- Hot-swapping packs mid-session without product decision  
- Pack inheritance graphs  
- LLM-authored packs without review  
- Per-renderer packs (one pack feeds Strategy + Interpretation; many surfaces render)

---

## 5. Acceptance test for a future implementation

A Behavior Pack is valid only if:

1. Swapping Pack A → Pack B changes Interpretation **and/or** composed Story for the same DecisionState.  
2. Priority, FAQ, AI, and Decision Terminal stay coherent in one update cycle where they share inputs.  
3. No new cognitive aggregate is introduced.  
4. Experience Layer still contains **no** pack rules.  
5. No UI code is required to “activate” the pack’s guidance logic.

---

## 6. First pack (product recommendation)

**Energy Conscious Buyer** — see Living Experience v0.1 Freeze.

Implementation remains out of scope for this contract document.
