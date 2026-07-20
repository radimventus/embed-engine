# Behavior Pack — Architectural Contract

**Status:** CONTRACT ONLY (not implemented)  
**Date:** 2026-07-20  
**Depends on:** [Living Experience v0.1 Freeze](./living-experience-v0.1-freeze.md), ADR-002, ADR-003  
**Rule:** Behavior Packs extend **behavior**. They must not change the cognitive pipeline.

```text
Signal → reduce() → DecisionState → project() → Interpretation → React
```

This document defines **what a Behavior Pack is** and **what it must own**.  
It does **not** prescribe package layout, file names, or runtime loading APIs.

---

## 1. Definition

A **Behavior Pack** is one **decision profile**.

It encodes how Embed Engine should interpret user Signals and project meaning for a specific buyer mindset.

Examples (profiles, not implementations):

| Behavior Pack | Decision posture |
| --- | --- |
| Energy Conscious Buyer | Minimize energy risk and operating cost |
| Young Family | Optimize layout, safety, flexibility |
| Investor | Emphasize yield, liquidity, maintenance |
| Luxury Buyer | Emphasize design, quality, privacy |

A Behavior Pack is **not**:

- a React feature
- a CMS page
- a second DecisionState
- a parallel Interpretation producer
- an AI prompt dump without structure

---

## 2. Place in the architecture

```text
Object Package          Behavior Pack
       │                      │
       └──────────┬───────────┘
                  ▼
            DecisionState   (facts + focus from Signals)
                  │
                  ▼
              project()     (applies Behavior Pack rules)
                  │
                  ▼
           Interpretation
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
    Priority     FAQ    AI Advisor
```

Responsibilities:

| Layer | Owns |
| --- | --- |
| Object Package | Immutable object truth |
| Behavior Pack | How to interpret Signals for a profile |
| `reduce()` | Evolve DecisionState from Signals (profile-agnostic mechanics) |
| `project()` | Apply Behavior Pack to DecisionState → Interpretation |
| React | Render Interpretation; emit Signals |

**Invariant:** Only `project()` (and helpers it calls) may apply Behavior Pack rules to produce Interpretation. React never loads Behavior Pack rules.

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
- optional Signal payload expectations (room ids, media kinds, question topics)
- which Signals are **strong**, **weak**, or **ignored** for this profile

Does **not** redefine Signal types. It only declares interpretation affinity.

### 3.3 Priority Rules

How DecisionState / Focus maps to Interpretation priorities.

Must define:

- priority ids in scope
- base weights
- elevation rules (e.g. room viewed → layout; technical media → energy)
- ranking / highlight policy
- reason templates (why a priority rose)

Output fields: `Interpretation.priorities` (`weight`, `rank`, `reason`, `highlighted`).

### 3.4 Recommendations

Short, actionable guidance strings for the Experience.

Must define:

- recommendation templates keyed by elevated priorities / Focus
- ordering policy (what appears first)

Output field: `Interpretation.recommendations`.

### 3.5 Conversation Context

Framing text for the AI Advisor (and any future conversation surface).

Must define:

- context template given active topic / Focus
- acknowledgment tone when preference changes
- what the advisor should **not** claim

Output field: `Interpretation.conversationContext`.

### 3.6 Question Strategy

How FAQ / suggested questions are chosen and explained.

Must define:

- question bank (or references into Object / Knowledge)
- selection rules (how many, which topics)
- highlight policy (which question is most relevant)
- `why` templates (explanation of recommendation)

Output field: `Interpretation.recommendedQuestions`.

### 3.7 Next Actions

Single suggested next step for the user.

Must define:

- next-action templates by Focus / elevated priority
- fallback when Focus is empty

Output field: `Interpretation.nextAction`.

Also supports: `Interpretation.activeTopic` (derived topic label for the pack).

### 3.8 Required Knowledge

What object or product knowledge must exist for this pack to be honest.

Must define:

- required Object Package facts / gaps that block quality
- optional enrichments (energy certificate, opex model, etc.)
- Pilot learning hooks (what to capture when missing)

If Required Knowledge is missing, projection should degrade gracefully (honest uncertainty), not invent facts in React.

### 3.9 Constraints

Hard limits on what this pack may claim or emphasize.

Must define:

- forbidden claims
- compliance / disclaimer boundaries
- priorities this pack must never bury without Signal evidence
- maximum aggressiveness of ranking shifts

### 3.10 Output to Interpretation

Explicit mapping: pack section → Interpretation fields.

| Pack section | Interpretation fields |
| --- | --- |
| Priority Rules | `priorities` |
| Question Strategy | `recommendedQuestions`, contributes to `activeTopic` |
| Recommendations | `recommendations` |
| Conversation Context | `conversationContext` |
| Next Actions | `nextAction`, `activeTopic` |
| Signals (affinity) | indirect — via DecisionState Focus after `reduce` |
| Required Knowledge / Constraints | quality gates on all projected strings |

**Forbidden:** Behavior Pack writing DecisionState.  
**Forbidden:** Behavior Pack being imported by React renderers.

---

## 4. Non-goals (v0)

- Runtime pack marketplace
- Hot-swapping packs mid-session without product decision
- Pack inheritance graphs / mixins
- LLM-authored packs without review
- Per-renderer packs (Priority pack ≠ FAQ pack) — **one pack, three renderers**

---

## 5. Acceptance test for a future implementation

A Behavior Pack implementation is valid only if:

1. Swapping Pack A → Pack B changes Interpretation for the **same** DecisionState.
2. Priority, FAQ, and AI Advisor all change in the **same** React update.
3. No new cognitive aggregate is introduced.
4. `reduce()` remains profile-agnostic (or accepts only explicit, documented profile-neutral mechanics).
5. React still contains **no** pack rules.

---

## 6. First pack (product recommendation)

**Energy Conscious Buyer** — see Living Experience v0.1 Freeze §G.

Implementation of that pack is **out of scope** for this contract document.
