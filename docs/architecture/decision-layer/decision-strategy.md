# Decision Strategy

**Status:** Architecture Freeze DT-002 (documentation only)  
**Date:** 2026-07-20  
**ID:** DT-002  
**Depends on:** Decision Layer v1 (ADR-009), Living Experience v0.1, ADR-002, ADR-003, ADR-007  
**ADR:** [ADR-010 — Decision Strategy](../adr/ADR-010-decision-strategy.md)  
**Freeze summary:** [decision-strategy-dt-002-freeze.md](./decision-strategy-dt-002-freeze.md)

This document defines **Decision Strategy** — the missing domain artifact between Interpretation and Experience.

No Runtime, React, or UI implementation is authorized by this document alone.

---

## Philosophical principle

Embed Engine is **not** a system that displays information about an object.

Embed Engine is a system that **composes and orchestrates a decision dialogue** between a human and an object.

Decision Strategy is where that dialogue is **composed**.

---

## Clarification: Kernel does not compose Stories

```text
Kernel / Cognitive pipeline ends at Interpretation.

Signal → reduce() → DecisionState → project() → Interpretation
                                                    │
                                                    ▼
                                          Decision Strategy
                                                    │
                                                    ▼
                                             Decision Story
```

**Kernel transforms Signals into Interpretation.**  
**Decision Strategy transforms Interpretation into the active Decision Story.**

Do not place Story authorship inside Kernel, `project()`, or React.

---

## 1. Definition (≤ 5 sentences)

**Decision Strategy** is the pure guidance composer that, given the current Interpretation and a Behavior Pack, produces the active Decision Story — an ordered sequence of Decision Moves for the ongoing decision dialogue.

It is the only component allowed to decide *which guided steps come next*.

It does not reason about the object (that is `project()` → Interpretation).

It does not render anything (that is Experience Layer).

It does not write DecisionState (that remains `reduce()` only).

---

## 2. Single responsibility

**Compose the active Decision Story for the current Interpretation.**

If a concern is not “which Moves, in which order, right now?”, it does not belong in Strategy.

| Tempting extra duty | Correct owner |
| --- | --- |
| Scoring priorities / meaning | `project()` / Interpretation |
| Storing Focus / Signals | DecisionState / `reduce()` |
| Drawing panels / chat | Decision Terminal / Experience |
| Defining Move catalog | Behavior Pack |
| Long-term visit patterns | Decision Trajectory (future input to Strategy) |

---

## 3. Inputs

### Required

| Input | Role |
| --- | --- |
| **Interpretation** | Current understanding of the decision situation |
| **Behavior Pack** | Move library + Story composition rules (+ related decision rules Strategy needs for eligibility) |

### Optional (future / when available)

| Input | Role |
| --- | --- |
| **Decision Trajectory** | Long-horizon behavioral pattern; may bias eligibility and ordering (**not MVP**) |

### Explicitly not required as separate Strategy inputs

| Rejected dependency | Why |
| --- | --- |
| Raw DecisionState | Strategy must not re-reason; Interpretation is the cognitive contract |
| React / layout / viewport | Presentation |
| “Decision Context” aggregate | Unnecessary; Focus already informs Interpretation |
| Object Package (direct) | Object truth reaches Strategy via Interpretation / Pack Required Knowledge gates — avoid dual reads |
| AI model weights | Generation of *new* Moves is a Pack/authoring concern, not live Strategy dependency |

---

## 4. Outputs

**Output: one active `Decision Story`.**

A Decision Story is:

- an **ordered sequence of Decision Moves** (references into the Pack Move library),  
- plus a **cursor** (which Move is active),  
- plus optional **status** per Move slot (`pending` | `active` | `completed` | `skipped` | `deferred`).

### Rejected output names

| Name | Verdict |
| --- | --- |
| Decision Story Draft | Implies a second publish step — unnecessary |
| Decision Plan | Suggests project-management semantics — wrong metaphor |
| Decision Move sequence (naked) | Missing cursor/status; Story is the named artifact |
| Interpretation field | Would pollute reasoning with guidance; Story is **Strategy output**, not `project()` output |

**Living Experience sync rule:** when Interpretation changes, Strategy recomposes Story in the same guidance cycle; Experience surfaces that need guidance subscribe to Story (Terminal) while Priority/FAQ/AI continue to read Interpretation. They stay coherent because both derive from the same Interpretation tick — not because Story is embedded inside Interpretation.

---

## 5. Lifecycle

| Event | Strategy behavior |
| --- | --- |
| **Execute** | After Interpretation is produced or updated (post-`project()`), before Experience renders guidance |
| **Recalculate** | Whenever Interpretation changes (new Signal → reduce → project). Also if Behavior Pack identity/version changes mid-session (rare; product-gated) |
| **Stop** | Experience / Runtime teardown; or Story reaches a terminal completed state with no eligible continuation Moves |

Strategy is **stateless with respect to cognition**: it does not accumulate its own DecisionState. Cursor/status live on the **Story instance** for the active Experience (ephemeral, ADR-007 active-Experience policy), not as a second cognitive aggregate.

---

## 6. Generated vs selected vs hybrid

**Decision: Hybrid (C).**

| Mode | Role |
| --- | --- |
| **Select** | Composition rules may pick a Story template / spine for the profile |
| **Generate (compose)** | Concrete Move sequence is assembled from the Move library using Interpretation (eligibility, ordering, omissions) |

Hardcoded static Stories as the primary model are **rejected**.  
Fully free-form generation with no Pack library is **rejected** (non-auditable dialogue).

---

## 7. Who owns transitions between Moves?

**Decision Strategy owns continuation.**

- Moves declare **eligibility** and **completion Signal expectations**.  
- Moves do **not** own `nextMoveId` graphs or private state machines.  
- After a Move completes (via Signal → Interpretation update), Strategy **recomposes** the Story; the next active Move emerges from Pack rules + Interpretation.

This keeps Moves reusable and prevents a second “flow engine” competing with Strategy.

---

## 8. Story architecture — Stages challenged

### Verdict

**Story contains only Moves** (ordered), plus cursor/status.

**Stages, Acts, and Chapters are not first-class domain concepts.**

### Why Stages were dropped

| If Stages remain first-class | Cost |
| --- | --- |
| Parallel taxonomy to Moves | Ambiguity (U3) |
| Invite hardcoded five-screen flows | Violates dynamic Story rule |
| Duplicate Confirmation/Discovery as both Stage and Move | Conceptual inflation |

### What remains of stage language

Optional **Move intent** taxonomy (extensible labels on Moves), for example:

`confirm` · `discover` · `interpret` · `compare` · `recommend`

Intents are **metadata on Moves**, not containers above Moves.  
Narrative language in Terminal may group by intent; architecture does not require Stage objects.

---

## 9. Decision Move — challenged and simplified

### Simplified definition

**Decision Move** = the smallest reusable guided step that can change the user’s decision state.

### Minimal shape (conceptual contract)

| Field | Purpose |
| --- | --- |
| `id` | Stable identity |
| `intent` | Optional intent label (confirm/discover/…) |
| `eligibility` | Pack-declared conditions against Interpretation |
| `completionSignals` | Which Signal kinds typically complete this Move |

No UI schema. No layout. No copy ownership mandatory at architecture level (copy may live in Pack knowledge bound to Move id).

### Reuse

- Moves **can and should** be shared across Behavior Packs via a shared library + Pack-specific overlays.  
- Packs may enable/disable/reorder Moves; they should not fork Move identity without reason.

### AI-generated Moves

- AI **may propose** new Moves into a Behavior Pack during authoring / Pilot learning.  
- AI **must not** invent live Moves outside Pack governance at runtime (unauditable dialogue).  
- Runtime Strategy only composes from the **approved Move library**.

---

## 10. Decision Layer — minimal concept set

**Keep exactly three domain guidance concepts:**

```text
Decision Strategy  →  Decision Story  →  Decision Move
```

**Remove / demote:**

| Concept | Action |
| --- | --- |
| Stages / Acts / Chapters | Demoted — optional Move intents only |
| Decision Plan / Draft | Rejected |
| Decision Context aggregate | Rejected |
| Story-as-Interpretation-field | Rejected |

**Experience concepts remain outside Decision Layer:** Decision Terminal, Priority, FAQ, AI, Recommendation.

**Future only:** Decision Trajectory (optional Strategy input later).

---

## 11. Client Studio — what to author (ranked)

| Rank | Author | Why |
| --- | --- | --- |
| 1 | **Object Package / Knowledge** | Truth the dialogue is about |
| 2 | **Behavior Pack** | Profile knowledge, rules, Move library, composition rules |
| 3 | **Decision Moves** (in Pack / shared library) | Guided-step vocabulary |
| 4 | **Story composition rules** (in Pack) | How Strategy assembles dialogue |
| 5 | **Templates** (optional Pack spines) | Hybrid selection aids — not hardcoded UX |
| — | **Decision Strategy** | **Platform capability** — not per-project authoring |
| — | **Static Decision Stories** | Avoid as primary authoring artifact |
| — | **UI layouts for Terminal** | Experience design — not Decision Layer |

Client Studio authors **knowledge and guidance vocabulary**, not Strategy engines and not pixel flows as architecture.

---

## 12. Decision Trajectory (future)

**Should Strategy consume it?** **Yes, later — as an optional input.**

When Trajectory exists:

- It may bias eligibility (e.g. skip Moves already exhausted across visits).  
- It may bias ordering (e.g. escalate `recommend` when oscillation detected).  
- It must **not** replace Interpretation.  
- It must **not** become a second DecisionState.

**MVP:** Strategy ignores Trajectory (input absent).

---

## 13. Architecture governance

| Concept | Purpose | Owner | Input | Output | Lifecycle | Dependencies | Forbidden |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Object Package** | Object truth | Knowledge / Builder | Reality / authoring | Facts | Project lifetime | — | UI, Strategy |
| **Behavior Pack** | Profile knowledge + Move library + composition rules | Knowledge / Product | Pilot learning | Pack sections | Versioned | Object knowledge refs | UI, DecisionState writes |
| **DecisionState** | Cognitive aggregate | Cognitive Layer | Signals via `reduce` | Next state | Active Experience | Signals, Focus | React, Strategy |
| **Interpretation** | Reasoning snapshot | `project()` | DecisionState (+ Pack rules) | Interpretation | Per project tick | DecisionState, Pack | UI, Story authorship |
| **Decision Strategy** | Compose active Story | Decision Layer | Interpretation, Pack (, Trajectoryᵃ) | Decision Story | Per Interpretation change | Interpretation, Pack | DecisionState writes, UI, Kernel internals |
| **Decision Story** | Ordered guided scenario | Strategy output | — | Move sequence + cursor | Ephemeral Experience | Moves | Persistence as cognitive truth (MVP) |
| **Decision Move** | Smallest guided step | Pack / shared library | — | Move definition | Versioned in Pack | Intent, eligibility | UI schema, `nextMove` graphs |
| **Decision Terminal** | Render Stories | Experience Layer | Story (+ Interpretation context) | Pixels / modality | Render cycle | Story | Strategy, Pack rules |
| **Priority / FAQ / AI / …** | Peer surfaces | Experience Layer | Interpretation (and Signals out) | Pixels | Render cycle | Interpretation | Strategy ownership |
| **Decision Trajectory** | Long-term evolution | Future | Visits, patterns, … | Trajectory view | Cross-sessionᵃ | Future ADR | Replacing Interpretation |

ᵃ Future / not MVP.

---

## 14. Architecture stability

| Concept | Class | Why |
| --- | --- | --- |
| Signal → reduce → DecisionState → project → Interpretation | **CORE** | Frozen Living Experience pipeline |
| Decision Strategy (single responsibility) | **CORE** | Required bridge to guided dialogue |
| Decision Story (Move sequence + cursor) | **CORE** | Strategy output contract |
| Decision Move (domain primitive) | **CORE** | Guidance atom |
| Behavior Pack (knowledge + library + rules) | **CORE** | Extensibility without redesign |
| Decision Terminal as Experience Surface | **CORE** | Rendering home for Stories |
| Move intent taxonomy | **EXTENSIBLE** | Labels may grow; not structural |
| Story templates / spines | **EXTENSIBLE** | Hybrid selection aids |
| Shared cross-Pack Move libraries | **EXTENSIBLE** | Reuse grows over time |
| Decision Trajectory as Strategy input | **EXPERIMENTAL** | Future; shape not frozen |
| AI authoring of Moves into Packs | **EXPERIMENTAL** | Process + governance TBD |
| Live AI inventing Moves at runtime | **Rejected** | Not a stability class — forbidden |

---

## 15. Architecture risks (unresolved — explicit)

| ID | Ambiguity | Notes |
| --- | --- | --- |
| R1 | **Execution host** of Strategy (pure function module vs Runtime service vs package boundary) | U1 remains; definition frozen, hosting not |
| R2 | **Exact Story transport** to Terminal (Runtime state field vs parallel subscription) | Must preserve one-tick coherence with Interpretation |
| R3 | **Move eligibility DSL** | How Pack expresses eligibility without leaking UI |
| R4 | **Completion Signal catalog** for Moves | Incomplete vs Living Experience SignalTypes |
| R5 | **Priority card toggle vs Move** | Are priority changes always Signals only, or also Moves? |
| R6 | **AI Advisor vs Terminal** | Peer Interpretation surface vs Terminal modality — channel taxonomy open |
| R7 | **Legacy `packages/decision`** naming vs Decision Layer | Migration path undecided |
| R8 | **Trajectory schema** | When built, must not fork cognition |

These are **not** silently resolved. They block *implementation*, not *definition freeze*.

---

## 16. Frozen architecture (recommended)

### Diagram

```text
╔══════════════════════════════════════════════════════════╗
║                   KNOWLEDGE LAYER                        ║
║   Object Package          Behavior Pack                  ║
║   (object truth)          (knowledge · rules ·           ║
║                            Move library · composition)   ║
╚═══════════════════════════╤══════════════════════════════╝
                            │
                            ▼
╔══════════════════════════════════════════════════════════╗
║                 KERNEL / COGNITIVE                       ║
║                                                          ║
║   Signal → reduce() → DecisionState → project()          ║
║                              │                           ║
║                              ▼                           ║
║                        Interpretation                    ║
║                     (reasoning snapshot)                 ║
╚═══════════════════════════╤══════════════════════════════╝
                            │
                            ▼
╔══════════════════════════════════════════════════════════╗
║                   DECISION LAYER                         ║
║                                                          ║
║              Decision Strategy                           ║
║         (compose active Decision Story)                  ║
║                            │                             ║
║                            ▼                             ║
║                     Decision Story                       ║
║              (ordered Moves + cursor)                    ║
║                            │                             ║
║                            ▼                             ║
║                     Decision Move                        ║
║              (smallest guided step)                      ║
║                                                          ║
║   Trajectory ⋯⋯ future optional Strategy input ⋯⋯        ║
╚═══════════════════════════╤══════════════════════════════╝
                            │
                            ▼
╔══════════════════════════════════════════════════════════╗
║                  EXPERIENCE LAYER                        ║
║                                                          ║
║                 Decision Terminal                        ║
║              (renders Decision Stories)                  ║
║                            │                             ║
║     Priority · FAQ · AI Advisor · Recommendation ·       ║
║              Guided Experience · Explorers               ║
║                                                          ║
║            (emit Signals → back to Kernel)               ║
╚══════════════════════════════════════════════════════════╝
```

### Layer explanation

| Layer | Explains |
| --- | --- |
| **Knowledge** | What is true about the object, and how a profile decides/is guided |
| **Kernel / Cognitive** | How Signals become understanding (Interpretation) |
| **Decision Layer** | How understanding becomes the next guided dialogue (Story of Moves) |
| **Experience** | How humans see and answer that dialogue |

### Decision Test (governance)

| Idea type | Goes to |
| --- | --- |
| New knowledge | Behavior Pack / Knowledge Layer |
| New decision rule / composition | Behavior Pack rules → applied by **Decision Strategy** |
| New guided step | **Decision Move** |
| New presentation only | **Decision Terminal** / Experience Layer |

If an idea fits more than one category, split it before accepting.

---

## Success criterion

A new engineer in two years should see immediately:

- **Knowledge** → Object Package + Behavior Pack  
- **Reasoning** → Interpretation via Kernel pipeline  
- **Guidance composition** → Decision Strategy → Story → Move  
- **Experience** → Decision Terminal + peer renderers  

That is the DT-002 freeze bar.
