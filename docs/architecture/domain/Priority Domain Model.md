# Priority Domain Model

**Status:** APPROVED (v1.0)  
**Version:** 1.0  
**Date:** 2026-07-21  
**SSOT for:** Technologicky nezávislý doménový model Priority Experience — entity, vztahy, invarianty, agregáty, pravidla rozšíření  
**Not SSOT for:** TypeScript typy, React, package API, Object Package schema, Cognitive Signal enumy, UX copy

**Derived exclusively from:**

| Artifact | Contribution |
| --- | --- |
| [Priority Experience Bible](../../product/Priority%20Experience%20Bible.md) | Principy P01–P10, rules R01–R07, MVP scope |
| [Priority Decision Journey Blueprint](../../product/Priority%20Decision%20Journey%20Blueprint.md) | Stages, gates, Interpretation/House Mapping contracts |
| [Priority Experience Content Model](../../product/Priority%20Experience%20Content%20Model.md) | Content entity fields |
| [Priority Experience Runtime Contract](../contracts/Priority%20Experience%20Runtime%20Contract.md) | Runtime I/O, events, constraints C1–C12 |
| [Priority Experience Integration Model](../Priority%20Experience%20Integration%20Model.md) | Layer ownership, OQ resolutions |
| [ADR-012](../adr/ADR-012-interpretation-first-class-artifact.md) | Object / PrioritySelection / Interpretation / Experience |
| [ADR-007](../adr/ADR-007-priority-mvp-policy.md) | MVP weight / multi-user / persistence policy |
| [ADR-002](../adr/ADR-002-decision-state.md) | DecisionState remains sole **cognitive** aggregate |
| [RI-003](../../04-reference-implementation/RI-003-Experience-Kernel.md) | Experience Layer vs Cognition |

This model **does not invent** product or UX principles. Where SSOT is ambiguous, the item is marked **Open Question**.

---

## 1. Domain Overview

### 1.1 Purpose

Priority Domain Model formalizuje **rozhodovací čočku** a její Journey jako doménu mezi:

```text
Product SSOTs (Bible / Blueprint / Content)
        ↓
Priority Domain Model          ← this document
        ↓
Future TypeScript contracts + Runtime implementation
```

Doména odpovídá na: co existuje, kdo co vlastní, co je vždy pravda, kde končí agregát.

### 1.2 Bounded context

**In scope**

- Priority as decision lens (definition + selection + confirmation)
- Priority Decision Journey run (stages + gates)
- Core meaning/communication artifacts used by that Journey (Interpretation, Experience)
- House Mapping and Follow-up handoffs as Journey outputs
- Journey events as domain vocabulary (not Signal enum)

**Out of scope**

- Object Package internals (facts owned elsewhere)
- Cognitive `DecisionState` shape and `reduce` pipeline (ADR-002 / ADR-003)
- Renderer / layout / React
- Lead / sales scripts as Journey content (Bible P06)

### 1.3 Canonical meaning chain

Aligned with ADR-012 + Integration Model:

```text
Object (facts)
    ↓
PrioritySelection (intent)
    ↓
ConfirmedDecisionContext (after Confirmation)
    ↓
Interpretation (machine meaning)
    ↓
Experience (communication)
    ↓
HouseMappingSet (anchors)
    ↓
FollowUpHandoff (optional next modules)
```

Presentation (UI/HTML/Terminal) is **outside** this domain model.

### 1.4 Relation to Cognitive Layer

| Concern | Owner |
| --- | --- |
| Sole cognitive aggregate | `DecisionState` (ADR-002) |
| Priority Journey stage / confirmation UI state | Experience-local domain (Integration Model OQ-04 MVP) |
| Writing Selection/Confirmation into DecisionState | **Open Question** — Needs ADR (Integration Model OQ-04) |

This document defines **Priority Experience domain aggregates**. They are **not** a second cognitive aggregate.

---

## 2. Entity Definitions

Entities below are conceptual. Field lists are derived from SSOTs; types are not TypeScript.

### 2.1 ObjectRef

| | |
| --- | --- |
| **Role** | Stable reference to the object under decision |
| **Source** | Bible R02; ADR-012 Object; Runtime §2.1 |
| **Owns** | Identity only (in this domain) |
| **Does not own** | Facts mutation, interpretation |

**Attributes (domain):** `objectId` (stable identity).  
Facts are read-only inputs from Object Package — not Priority entities.

---

### 2.2 PriorityDefinition

| | |
| --- | --- |
| **Role** | Catalog definition of one priority lens |
| **Source** | Content Model §2.1; Blueprint §7 |
| **Identity** | `priorityId` |

| Attribute | Required | Source |
| --- | --- | --- |
| `priorityId` | Yes | Content Model |
| `priorityLabel` | Yes | Content Model |
| `priorityMeaning` | Yes | Content Model |
| `priorityNot` | Yes | Content Model |

**Related content (same definition binding, not separate runtime entities):**

- Intent Content (`userIntentPhrases`, `intentSummary`) — Content Model §2.2
- Possible Meanings (`possibleMeanings[]`) — Content Model §2.3; MVP authoring-only (OQ-C01 Resolved)
- Stage microcopy binding — Content Model §2.4

**Open Question — DM-OQ-01:** Machine-loadable Priority content package schema (locale, versioning beyond `priority-<id>.md`) — Integration Model OQ-01 Needs ADR for runtime packaging.

---

### 2.3 PrioritySelection

| | |
| --- | --- |
| **Role** | User-expressed decision intent (lens) |
| **Source** | ADR-012; Bible §3.1; Blueprint §3.1; Runtime §2.2 |
| **Contains** | Selected priority identity(ies) |
| **Must not contain** | Interpretation, Experience, object quality claims |

| Attribute | Required | Source |
| --- | --- | --- |
| `selectedPriorityIds` | Yes (non-empty before Confirmation) | Runtime „priority id(s)“ |
| `dominantPriorityId` | MVP assumed | Blueprint „one dominant lens“ |

**Open Question — DM-OQ-02:** Whether `PrioritySelection` includes per-priority **weights** as domain fields of this Journey, or weights remain only on Cognitive / Interpretation projections (ADR-007). Runtime Contract for Priority Journey requires ids; weight placement across layers is not uniquely specified for this domain → treat weights as **not required** on Journey `PrioritySelection` until product/ADR clarifies.

**Open Question — DM-OQ-03:** Multi-id selection composition / precedence when more than one id is selected (Integration Model OQ-06) — Deferred MVP / Needs ADR for composition. Domain MVP assumes one dominant lens per Journey run.

---

### 2.4 Confirmation

| | |
| --- | --- |
| **Role** | Makes Selection a conscious decision context |
| **Source** | Bible P01; Blueprint §3.2; Runtime §2.3, §3.1 |
| **Speaks about** | User intent only |
| **Must not speak about** | Object quality, scores, purchase CTA |

| Attribute | Required | Source |
| --- | --- | --- |
| `selectionSnapshot` | Yes | Runtime „Confirmed Priority Selection snapshot“ |
| `accepted` | Yes | `priority.confirmation.accepted` |
| `presentationPayload` | Yes | Content Model Confirmation units (title, body, actions) |

---

### 2.5 ConfirmedDecisionContext

| | |
| --- | --- |
| **Role** | Snapshot of intent after Confirmation — input to Interpretation |
| **Source** | Blueprint §3.2 „potvrzený rozhodovací kontext“; Runtime gate |
| **Composition** | `ObjectRef` + confirmed `PrioritySelection` (+ active `PriorityDefinition` binding) |

No Interpretation may be produced for Priority Journey without this context.

---

### 2.6 JourneyStage

| | |
| --- | --- |
| **Role** | Position in Universal Journey |
| **Source** | Blueprint §2 |

**Allowed values (exact order):**

```text
Selection → Confirmation → Transition → Interpretation → HouseMapping → FollowUp
```

`FollowUp` is optional handoff after Mapping (Blueprint §3.6).

---

### 2.7 PriorityJourneyRun

| | |
| --- | --- |
| **Role** | One execution of Priority Decision Journey for an object + selection context |
| **Source** | Blueprint Universal Journey; Runtime stage contracts |
| **Tracks** | Current `JourneyStage`, Selection, Confirmation, produced outputs, invalidation |

MVP persistence: active Experience only (ADR-007) — no cross-visit promise.

---

### 2.8 Interpretation

| | |
| --- | --- |
| **Role** | Machine-readable meaning of Object under ConfirmedDecisionContext |
| **Source** | ADR-012; Bible R01–R06; Runtime §3.3 |
| **Must not contain** | UI wording, presentation, formatting |

**Conceptual content examples (ADR-012):** strengths, frictions, opportunities, conflicts, trade-offs, match score, confidence inputs, recommended intent.

**Open Question — DM-OQ-04:** Alignment between this Core Interpretation (ADR-012) and Cognitive projection named `Interpretation` (CORE-101 / ADR-006 note in ADR-012) — not redefined here; follow-up ADR if contracts must unify.

---

### 2.9 Experience

| | |
| --- | --- |
| **Role** | Human communication / semantic presentation contract built from Interpretation |
| **Source** | ADR-012; Bible P08 / R07; Blueprint §5; Content Model §2.5 |
| **Is not** | UI, HTML, PDF, React |

| Field | Required | Source |
| --- | --- | --- |
| `title` | Yes | Blueprint §5 |
| `summary` | Yes | Blueprint §5 |
| `focus` | Yes | Blueprint §5 |
| `evidence` | Yes | Blueprint §5 |
| `concerns` | Yes | Blueprint §5 |
| `confidence` | Yes | Blueprint §5 |
| `recommendations` | Yes | Blueprint §5 |
| `actions` | Yes | Blueprint §5 |

Experience is the **only** semantic presentation contract for Priority Journey UI (Runtime C3).

---

### 2.10 ExperienceClaimRef

| | |
| --- | --- |
| **Role** | Reference to an Experience claim used in House Mapping |
| **Source** | Blueprint §6; Runtime §3.4 (`claimRef`) |

Conceptual target: evidence / concern / focus item (or equivalent claim) inside current Experience.

**Open Question — DM-OQ-05:** Canonical claim identity scheme (stable ids vs ordinal paths into Experience fields) is not fixed in SSOT.

---

### 2.11 ObjectAnchor

| | |
| --- | --- |
| **Role** | Conceptual place in the object that anchors a claim |
| **Source** | Blueprint §6; Runtime §3.4 |

**Conceptual kinds:** room | zone | element | relation | medium.

**Open Question — DM-OQ-06:** Canonical `objectAnchor` ID schema and binding to Object Package paths/media ids (Integration Model OQ-03) — **Needs ADR**. Domain keeps conceptual shape only.

---

### 2.12 MappingEntry

| | |
| --- | --- |
| **Role** | One House Mapping link |
| **Source** | Blueprint §6; Content Model §2.6; Runtime §3.4 |

| Attribute | Required | Source |
| --- | --- | --- |
| `claimRef` | Yes | Runtime |
| `objectAnchor` | Yes | Runtime (conceptual) |
| `why` | Yes | one sentence relevance |

Optional product concept: explicit „k ověření“ when fact missing (Blueprint §6 rule 1) — may be represented as MappingEntry variant or null-anchor policy; exact encoding is **Open Question — DM-OQ-07**.

---

### 2.13 HouseMappingSet

| | |
| --- | --- |
| **Role** | Set of MappingEntry for current Experience + Object |
| **Source** | Blueprint §3.5, §6; Runtime §3.4 |
| **Must not** | Mutate Experience meaning; invent new hypothesis |

---

### 2.14 FollowUpHandoff

| | |
| --- | --- |
| **Role** | Recommended next Workspace module after Journey reading |
| **Source** | Blueprint §3.6; Runtime §3.5 |
| **Constraint** | Lead/audit must not be the only pre-understanding path (Bible P06; Runtime C8) |

At least one handoff required when Follow-up is presented.

---

### 2.15 TransitionMessage

| | |
| --- | --- |
| **Role** | Short bridge copy (1–2 sentences); no new meaning |
| **Source** | Blueprint §3.3; Runtime §3.2; Integration Model OQ-05 Resolved (ephemeral) |

Not a meaning artifact. Ephemeral Journey chrome.

---

### 2.16 PriorityJourneyEvent

| | |
| --- | --- |
| **Role** | Domain vocabulary of Journey events |
| **Source** | Runtime Contract §5 |

| Event | Meaning |
| --- | --- |
| `priority.selection.changed` | Selection updated |
| `priority.confirmation.accepted` | Lens confirmed |
| `priority.confirmation.edit` | Return to Selection |
| `priority.transition.completed` | Bridge finished |
| `priority.interpretation.ready` | Experience available for confirmed context |
| `priority.mapping.ready` | House Mapping set available |
| `priority.followup.selected` | User chose handoff |
| `priority.context.invalidated` | Selection changed; clear stale outputs |

**Open Question — DM-OQ-08:** Mapping of these events to Cognitive Signals vs Experience-local events when writing DecisionState (Integration Model OQ-04 Needs ADR for Cognitive write).

---

### 2.17 Explicitly non-entities (this domain)

| Concept | Why not a Priority domain entity |
| --- | --- |
| UI chrome strings | Content Model §2.7; presentation |
| Renderer / Terminal / Report | ADR-012 Renderers |
| DecisionState | Cognitive aggregate (ADR-002) |
| Garden-specific rooms | Instance content, not universal domain |
| Lead / CRM records | Outside Journey; P06 |

---

## 3. Relationships

```text
PriorityDefinition 1 ──binds──► many PriorityJourneyRun (via priorityId)

ObjectRef 1 ──facts for──► Interpretation
PrioritySelection 1 ──confirmed as──► Confirmation.selectionSnapshot
Confirmation ──creates──► ConfirmedDecisionContext
ConfirmedDecisionContext + ObjectRef ──input──► Interpretation
Interpretation ──composes──► Experience
Experience ──claims referenced by──► MappingEntry.claimRef
ObjectRef ──anchors──► MappingEntry.objectAnchor
MappingEntry * ──member of──► HouseMappingSet
Experience + HouseMappingSet ──inform──► FollowUpHandoff*
PriorityJourneyRun ──owns stage +──► Selection, Confirmation, outputs
PriorityJourneyEvent ──transitions / notifies──► PriorityJourneyRun
```

### Cardinality notes (derived)

| Relation | Cardinality | Source |
| --- | --- | --- |
| JourneyRun → dominant PriorityDefinition | 1 (MVP) | Blueprint one dominant lens |
| ConfirmedDecisionContext → Interpretation | 0..1 (none before Confirmation) | P01 / gates |
| Interpretation → Experience | 1 (when Interpretation stage completes) | ADR-012 / Runtime |
| Experience → HouseMappingSet | 0..1 then 1 when Mapping ready | Blueprint §4 |
| ExperienceClaim → MappingEntry | ≥1 or explicit verify (product rule) | Blueprint §6 |
| FollowUpHandoff | ≥1 when Follow-up shown | Runtime §3.5 |

---

## 4. Domain Invariants

Invariants are MUST rules. Sources cited; no new product principles.

### 4.1 Sequence & gates

| ID | Invariant | Source |
| --- | --- | --- |
| I1 | Journey stages follow Selection → Confirmation → Transition → Interpretation → HouseMapping → (FollowUp) without reordering | Blueprint §2; Runtime C9 |
| I2 | No Interpretation / Experience for Journey before Confirmation of current Selection | Bible P01; Runtime C1 gate |
| I3 | No House Mapping before Experience exists | Blueprint §4; Runtime |
| I4 | No Follow-up shortcut from Transition | Blueprint §4; Runtime |
| I5 | Confirmation → Selection (edit) allowed without producing Experience | Blueprint §4 |

### 4.2 Meaning & facts

| ID | Invariant | Source |
| --- | --- | --- |
| I6 | Interpretation does not mutate Object facts | Bible R02; Runtime C1 |
| I7 | Interpretation contains no UI wording / presentation | ADR-012 |
| I8 | Experience is the only semantic presentation contract for Priority Journey UI | Bible P08 / R07; Runtime C3 |
| I9 | Presentation / Renderers do not invent semantic meaning | Bible R07; Runtime C2 |
| I10 | Interpretation is a hypothesis, not a purchase verdict | Bible R01; Runtime C5 |
| I11 | Confidence must not be high without evidence | Bible R06; Runtime C6 |
| I12 | PrioritySelection is the lens; Interpretation must not silently rewrite Selection | Bible R03 / R05; Blueprint §5 |

### 4.3 Confirmation & conversion

| ID | Invariant | Source |
| --- | --- | --- |
| I13 | Confirmation speaks only about user intent, not object quality | Blueprint §3.2; Runtime C4 |
| I14 | Conversion / lead must not gate Confirmation or Interpretation | Bible P06; Runtime C8 |

### 4.4 Mapping & invalidation

| ID | Invariant | Source |
| --- | --- | --- |
| I15 | House Mapping must not change Experience meaning | Blueprint §6; Runtime C7 |
| I16 | On Selection change: previous Interpretation, Experience, HouseMappingSet are invalid; no silent reuse | Blueprint §4; Runtime §4.3 |
| I17 | Transition adds no new meaning | Blueprint §3.3 |

### 4.5 MVP policy

| ID | Invariant | Source |
| --- | --- | --- |
| I18 | No multi-user Priority merge in MVP | ADR-007; Runtime C10 |
| I19 | No relative-budget Priority model in MVP | ADR-007; Runtime C10 |
| I20 | MVP Journey assumes one dominant lens per run | Blueprint §2 / §7; Integration OQ-06 Deferred |
| I21 | Cross-visit Priority persistence is not a product promise (active Experience only) | ADR-007 |

---

## 5. Aggregate Boundaries

### 5.1 Aggregates in this domain

| Aggregate root | Consistency boundary | Contained / referenced |
| --- | --- | --- |
| **PriorityDefinition** | One priority catalog entry + its content binding | Intent, Possible Meanings (authoring), stage microcopy templates |
| **PriorityJourneyRun** | One Journey execution | JourneyStage, PrioritySelection, Confirmation, TransitionMessage, refs to produced outputs, event log semantics |
| **Interpretation** | Machine meaning for one ConfirmedDecisionContext | Machine factors only (no UI) |
| **Experience** | Communication artifact for one Interpretation | Required semantic fields §2.9 |
| **HouseMappingSet** | Mapping for one Experience + ObjectRef | MappingEntry* |

### 5.2 External references (not owned)

| Reference | Owned by |
| --- | --- |
| Object facts | Object Package / Knowledge |
| DecisionState | Cognitive Layer |
| Renderer trees | Experience hosts / apps |

### 5.3 Transactional rules (domain)

1. **Confirmation** updates `PriorityJourneyRun` only; it does not write Object facts.
2. **Interpretation + Experience** are produced together for a ConfirmedDecisionContext (pipeline ADR-012); UI must consume Experience, not raw Interpretation.
3. **HouseMappingSet** is replaced/invalidated with Experience; it never patches Experience fields.
4. **Invalidation** clears Interpretation, Experience, HouseMappingSet together when Selection changes.

### 5.4 Aggregate anti-patterns (forbidden)

- Treating `PriorityJourneyRun` as a second cognitive aggregate replacing DecisionState
- Embedding HTML/React inside Experience or Interpretation
- Letting HouseMappingSet invent claims absent from Experience
- Hardcoding Garden entity names into aggregate roots

---

## 6. Extension Rules

Derived from Blueprint §7, Runtime §7, Content Model hierarchy, Integration Model lifecycle.

### 6.1 Allowed without changing this Domain Model

| Extension | How |
| --- | --- |
| New priority | New `PriorityDefinition` + `content/priority-<id>.md` conforming to Content Model |
| New Object anchors (instances) | More MappingEntry targets for a given Object — conceptual kinds unchanged |
| New Follow-up targets | Additional `FollowUpHandoff` values (not lead-only path) |
| New Experience renderers | Outside domain; same Experience fields |
| Richer Interpretation factors | Behind Interpretation; still compose to same Experience contract |

### 6.2 Requires product SSOT update (not silent)

| Change | Update |
| --- | --- |
| New Journey stage | Blueprint + Runtime Contract + Integration Model + this Domain Model |
| Showing Possible Meanings in UI | Content Model / Bible (OQ-C01) |
| Multi-lens merged Experience | Bible + Blueprint + ADR (OQ-06 / OQ-C02) |
| Character limits on fields | Content Model guidance (OQ-C04 Deferred) |

### 6.3 Requires ADR (architecture)

| Change | Why |
| --- | --- |
| Canonical ObjectAnchor / claim ID schemas | DM-OQ-05, DM-OQ-06 |
| Journey events writing DecisionState / new Signals | DM-OQ-08 |
| Live AI generation of Interpretation/Experience in-session | Integration OQ-C05 |
| Machine Priority content package format | DM-OQ-01 |
| Relative weights or multi-actor Priority | ADR-007 reopen |
| Unifying Core vs Cognitive Interpretation types | DM-OQ-04 |

### 6.4 Priority-specific vs universal

| May vary per priority | Must stay universal |
| --- | --- |
| Labels, intent phrases, microcopy, mapping instances, follow-ups | Stage order, gates, Experience field meanings, Confirmation intent-only rule, Mapping shape claim→anchor+why |

---

## 7. Acceptance Criteria

Domain Model is ready as a base for TypeScript contracts and Runtime when:

### Completeness

- [ ] Every Blueprint stage has a corresponding domain concept (stage and/or payload entity)
- [ ] ADR-012 chain Object → PrioritySelection → Interpretation → Experience is represented
- [ ] House Mapping and Follow-up are first-class outputs
- [ ] Journey events from Runtime Contract are listed without inventing Signal enums

### Separation

- [ ] Interpretation has no UI fields
- [ ] Experience fields match Blueprint §5
- [ ] Confirmation cannot carry object-quality claims
- [ ] Domain aggregates are explicitly not DecisionState
- [ ] Object facts are external references only

### Open Questions discipline

- [ ] DM-OQ-01 … DM-OQ-08 are not silently closed in code
- [ ] MVP implementers follow Resolved Integration Model items (one dominant lens, ephemeral Transition, authoring-only meanings)
- [ ] Needs ADR items block claiming platform SSOT

### Implementation interface clarity

| Consumer | Uses this model for |
| --- | --- |
| TypeScript contracts | Entity names, required fields, invariants as types/guards |
| Runtime / Core | When Interpretation/Experience may exist; invalidation |
| Experience Layer | JourneyRun stage machine; what to emit/consume |
| Content authors | What PriorityDefinition must supply (via Content Model) |

---

## 8. Open Question Index

| ID | Topic | Status |
| --- | --- | --- |
| DM-OQ-01 | Runtime Priority content package schema | Needs ADR (see OQ-01) |
| DM-OQ-02 | Weights on Journey PrioritySelection vs elsewhere | Open — not uniquely specified for Journey domain |
| DM-OQ-03 | Multi-priority composition / precedence | Deferred MVP / Needs ADR (OQ-06) |
| DM-OQ-04 | Core Interpretation vs Cognitive Interpretation type | Needs follow-up ADR if unify |
| DM-OQ-05 | ExperienceClaimRef identity scheme | Open |
| DM-OQ-06 | ObjectAnchor canonical IDs | Needs ADR (OQ-03) |
| DM-OQ-07 | Encoding of „k ověření“ mapping | Open |
| DM-OQ-08 | Journey events → Cognitive Signals | Needs ADR for Cognitive write (OQ-04) |

Closing a DM-OQ updates the owning product/architecture SSOT first; this Domain Model follows.

---

## Governance

```text
Bible → Blueprint → Content Model → Runtime Contract → Integration Model
                                                              ↓
                                                    Priority Domain Model (this)
                                                              ↓
                                              TypeScript contracts / Runtime
```

- Conflict on Journey structure: **Blueprint / Runtime gates win**.
- Conflict on meaning split: **ADR-012 wins**.
- Conflict on MVP Priority policy: **ADR-007 wins**.
- Conflict on cognitive aggregate: **ADR-002 wins** (DecisionState only).
- Philosophy / language: **Bible wins**.
- Instance markdown (e.g. Garden) never overrides this model.
