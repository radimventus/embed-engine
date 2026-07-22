# Decision Experience Blueprint (DEB-01)

**Status:** APPROVED (Product SSOT)  
**Version:** 1.0  
**Date:** 2026-07-22  
**ID:** DEB-01  
**Layer:** Product — Decision Experience  
**SSOT for:** Decision Experience product model — Vision, Decision Journey, Controlled Experience Adaptation, Immutable Experience, Design Principles  
**Not SSOT for:** Runtime Kernel, Decision Session contracts, Interpretation schema, Decision Layer vocabulary definitions, Behavior Pack loading, UI, wireframes, React, TypeScript, Client Studio Gen1 artifact

---

## Authority & alignment

This Blueprint is the **Single Source of Truth** for how Embed Engine designs and constrains the **Decision Experience** product layer after Client Studio Gen1.

It **links** to architecture; it does **not** redefine it.

| Concern | Canonical source |
| --- | --- |
| Runtime / Kernel | [RI-001](../../04-reference-implementation/RI-001-Runtime-Kernel.md), [RUNTIME.md](../../architecture/RUNTIME.md) |
| Decision Session | [RI-002](../../04-reference-implementation/RI-002-Decision-Session.md) |
| Experience contract | [RI-003](../../04-reference-implementation/RI-003-Experience-Kernel.md) |
| Decision Move / Story / Terminal / Behavior Pack | [Decision Layer vocabulary](../../architecture/decision-layer/README.md) |
| Product grammar | [DEG](../decision-experience-grammar/DEG.md) |
| Visit-level journey (related draft) | [DJS](../decision-journey/DJS.md) |
| Gen1 structural baseline | [Client Studio Gen1](../../reference/Client-Studio-Gen1.md) |
| AI role (architecture thesis) | [PT-006](../../architecture/pt/PT-006-ai-explains-never-decides.md) |

**Relationship to UX-003:** [UX-003 Experience Blueprint](../ux/UX-003-Experience-Blueprint.md) defines the *meta-contract* of any Experience Blueprint (Identity · Structure · Composition · Prerequisites · Outcomes). **DEB-01** is the **instance SSOT** for Embed Engine’s Client Studio Decision Experience — including Adaptation Surfaces and Immutable Experience. When they conflict on Client Studio scope, **DEB-01 wins for product constraints**; UX-003 remains the general Blueprint grammar.

---

## 1. Vision

### 1.1 What Decision Experience is

**Decision Experience** is the product layer that guides a person from first contact with an object to an informed decision — by interpreting that object in the context of the person’s priorities, within a stable Client Studio structure.

It is not a new application shell.  
It is not a parallel Runtime.  
It is the governed way the system **changes how the user understands the object** while Client Studio’s information architecture remains fixed.

Canonical positioning (from DEG):

> Embed Engine is an interpretation platform that transforms structured facts about an object into a personalized Decision Experience.

### 1.2 Problem it solves

People do not fail decisions because they lack more pages. They fail because:

- facts are presented without decision context,
- priorities are never made explicit,
- interpretation is left to marketing copy or sales improvisation,
- every visitor is shown the same meaning regardless of what they care about,
- “personalization” usually means rearranging the product or inventing new application branches.

Decision Experience solves **decision ambiguity under stable facts**: the object stays the same; the meaning for *this* visitor becomes clear, explainable, and actionable.

### 1.3 Main principle

**Interpretation before persuasion. Stability before adaptation.**

The system may adapt *how meaning is explained* only inside predefined Adaptation Surfaces.  
It must never adapt *what the object is*, *what the Studio is*, or *what Runtime knows as truth*.

### 1.4 How it differs from a configurator or classic product site

| Classic product site / configurator | Decision Experience |
| --- | --- |
| Optimizes browsing and option picking | Optimizes change in decision state |
| Personalization often rewrites navigation or invents flows | Personalization only inside Adaptation Surfaces |
| Facts and sales narrative blur | Facts remain immutable; Interpretation is separate |
| “AI” often invents or sells | AI explains Runtime Interpretation only |
| Success = time on page / clicks | Success = informed Commit readiness |

Decision Experience is **not** a house configurator, CMS, or lead form with nicer copy. It is a **guided decision environment** mounted on a frozen Studio structure.

---

## 2. Decision Journey

### 2.1 Purpose

The **Decision Journey** describes the mental trajectory of one visit: how the visitor’s decision state should evolve from first contact to readiness to act.

It is a **product journey model**, not a UI sitemap and not a Runtime state machine. Runtime still owns DecisionState; Journey stages describe expected *human* progress that Experience and Decision Moves support.

Related: visit-level draft [DJS](../decision-journey/DJS.md). DEB-01 Journey stages below are the **canonical stage set for Decision Experience design** going forward.

### 2.2 Journey overview

```text
Unknown
  → Explore
  → Orient
  → Prioritize
  → Interpret
  → Validate
  → Compare
  → Decide
  → Commit
```

Stages are progressive. A visitor may revisit earlier stages (especially Prioritize → Interpret) without leaving the same Decision Session. Stages do not invent parallel Client Studio apps.

### 2.3 Stages

#### Unknown

| Aspect | Description |
| --- | --- |
| **User goal** | Establish that something worthy of attention is present. |
| **System knows** | Object Package identity; no PrioritySelection; empty or initial Decision Session. |
| **System shows** | Stable Client Studio entry (Hero / first orientation of the object) — not a personalized branch. |
| **Expected output** | Attention + recognition that this is a decision environment, not a brochure dump. |

#### Explore

| Aspect | Description |
| --- | --- |
| **User goal** | Build raw familiarity with the object (spaces, media, facts). |
| **System knows** | Object Package facts and media; still little or no priority intent. |
| **System shows** | Immutable object surfaces (Hero, media, House Navigator, technical facts) — same structure for all visitors. |
| **Expected output** | Basic object literacy: “I know what this is.” |

#### Orient

| Aspect | Description |
| --- | --- |
| **User goal** | Understand *how* the system will help decide (not only *what* the object is). |
| **System knows** | Session is active; visitor has entered the decision frame. |
| **System shows** | Stable Studio framing of Priority / decision path; no structural mutation of IA. |
| **Expected output** | Mental model: priorities → interpretation → informed next step. |

#### Prioritize

| Aspect | Description |
| --- | --- |
| **User goal** | Make decision intent explicit (what matters for *me*). |
| **System knows** | PrioritySelection (or equivalent intent signals) via Decision Session / Runtime Signals. |
| **System shows** | Priority structure unchanged (Adaptation Surface A personalizes interpretation *beside* Priority, not Priority IA itself). |
| **Expected output** | Explicit priorities owned by the user; Signals applied to Runtime. |

#### Interpret

| Aspect | Description |
| --- | --- |
| **User goal** | Understand what the object *means* given my priorities. |
| **System knows** | Interpretation projected from DecisionState; Decision Story / Moves may advance. |
| **System shows** | Adaptation Surfaces (esp. Priority interpretation panel, Racio FAQ/AI) reflecting Interpretation — never new facts. |
| **Expected output** | Explainable meaning: “For my priorities, this object is … because …” |

#### Validate

| Aspect | Description |
| --- | --- |
| **User goal** | Test whether the interpretation holds against doubts, constraints, and questions. |
| **System knows** | Same Interpretation + Session; questions map to Object / Knowledge Model / Behavior Pack rules — not invent facts. |
| **System shows** | FAQ order/selection and AI answers adapted (Surfaces B, C); facts unchanged. |
| **Expected output** | Reduced uncertainty; open questions named; confidence about *what is known vs unknown*. |

#### Compare

| Aspect | Description |
| --- | --- |
| **User goal** | Place this object relative to alternatives or trade-offs (when in scope). |
| **System knows** | Current Session Interpretation; comparison may be Future Architecture if multi-object Sessions are not yet defined (see Open Questions). |
| **System shows** | Still within stable Studio; no parallel “compare app.” Comparison content must remain Interpretation-bound. |
| **Expected output** | Relative clarity: trade-offs understood; or deferred compare with explicit gap. |

#### Decide

| Aspect | Description |
| --- | --- |
| **User goal** | Form a personal stance: fit / conditional fit / not fit — based on Interpretation. |
| **System knows** | Decision Story progress; Decision Terminal may surface Outcome readiness. |
| **System shows** | Terminal / Audit CTA personalization (Surfaces D, and Terminal concept) — structure of Audit section fixed. |
| **Expected output** | Decision stance + rationale grounded in Runtime Interpretation. |

#### Commit

| Aspect | Description |
| --- | --- |
| **User goal** | Take the next real-world action with clear intent. |
| **System knows** | Decision Session Outcome / Terminal payload; outbound channels may use Session summary. |
| **System shows** | Personalized CTA / message / report chapter emphasis (Surfaces D, E, F) — workflows unchanged. |
| **Expected output** | Informed action (contact, visit, land search, share report) without inventing new product branches. |

---

## 3. Decision Moves

### 3.1 Definition

A **Decision Move** is the smallest guided step that can change the user’s decision state.

Canonical vocabulary: [Decision Layer — Decision Move](../../architecture/decision-layer/README.md). Product thesis: [PT-005](../../architecture/pt/PT-005-decision-experience-composed-from-moves.md).

DEB-01 does not redefine Moves. It specifies how Moves relate to Journey and Experience.

### 3.2 Properties (product view)

A Decision Move:

- advances or clarifies decision state (not merely UI animation),
- is explainable (“why this step now”),
- is bound to Runtime-backed meaning (Interpretation / Session),
- does not mutate Object Package facts,
- does not rewrite Client Studio structure,
- may be authored or selected via Behavior Pack + Decision Strategy (architecture), not by UI hardcoding.

### 3.3 Relationship to Journey stages

Journey stages describe **human progress**.  
Decision Moves describe **guided semantic steps** that populate those stages.

Multiple Moves may occur inside one stage (especially Interpret / Validate).  
A single Move must not create a new Studio section or Adaptation Surface outside this Blueprint.

### 3.4 Relationship to Runtime

- Moves **do not** own facts or DecisionState.
- User actions that matter emit **Signals** into Runtime (Session boundary).
- Runtime `reduce → DecisionState → project → Interpretation` remains the only cognitive mutation path.
- Experience presents Moves; it never invents Interpretation.

### 3.5 Relationship to Decision Story

Decision Story is an ordered sequence of Decision Moves (plus cursor/status).  
Moves are the atomic units; Story is the composed narrative path for the Session.

---

## 4. Decision Story

### 4.1 What it is

**Decision Story** is the ordered, Session-scoped narrative of Decision Moves that expresses how the Experience is guiding this visitor’s decision.

Canonical vocabulary: [Decision Layer — Decision Story](../../architecture/decision-layer/README.md). Product thesis: [PT-004](../../architecture/pt/PT-004-decision-story-is-the-product.md).

Story owns **narrative progression**.  
Interpretation owns **meaning**.  
Presentation only renders.

### 4.2 How it arises

Story is composed by **Decision Strategy** from:

- current **Interpretation** (from Runtime),
- active **Behavior Pack** (knowledge, rules, Move library, composition rules),
- Session context (priorities, progress).

Kernel ends at Interpretation. Kernel does **not** author Stories.

### 4.3 Composition from Moves

```text
Interpretation + Behavior Pack
        → Decision Strategy
        → Decision Story (ordered Moves + cursor)
        → Experience Context / Surfaces (Adaptation Surfaces only)
```

The Story is not a static CMS page. It is composed for the Session and may recompose when inputs that Strategy depends on change.

### 4.4 Reaction to priority change

When the user changes priorities:

1. Experience emits Signals (e.g. ChangePriority) into Runtime.
2. Runtime updates DecisionState and projects a new Interpretation.
3. Decision Strategy may recompose Story / Move cursor according to Behavior Pack rules.
4. Adaptation Surfaces update **content/emphasis** only — Client Studio structure stays fixed.

Priority change never:

- invents new technical facts,
- reshuffles Hero → House Navigator → Priority → Racio → Audit order,
- creates a fork of the application.

---

## 5. Controlled Experience Adaptation

### 5.1 Governing rule

**Decision Experience does not change the structure of Client Studio.**

Client Studio remains the same informational architecture for all users. Personalization happens **only** inside predefined **Adaptation Surfaces**.

Anything not listed as an Adaptation Surface is **Immutable Experience** (Section 6).

### 5.2 What must not change (preview)

Do not personalize:

- Hero structure and placement,
- House Navigator structure and placement,
- Priority **section structure** (input model / layout contract of Priority),
- Racio **section placement** in the Studio,
- Audit **section structure** (beyond the CTA surface defined below),
- overall section order and primary navigation.

Gen1 freezes the last static Studio image before Decision Experience ([Client Studio Gen1](../../reference/Client-Studio-Gen1.md)). Post-Gen1 Decision Experience evolves **outside** the Gen1 artifact while respecting this structural contract.

### 5.3 Adaptation Surface — definition

An **Adaptation Surface** is a bounded region of the Experience where content, emphasis, order, or messaging may vary according to Decision Session / Interpretation — without changing Client Studio information architecture or inventing new application branches.

Every adaptation must be:

- **explainable** (traceable to Interpretation / Session),
- **non-authoritative** over facts (Runtime / Object Package remain truth),
- **local** to the named surface,
- **reversible** when Session inputs change (e.g. priorities).

### 5.4 Surface A — Priority (interpretation panel)

| Rule | Specification |
| --- | --- |
| **May adapt** | The right-hand (or equivalent) **interpretation panel** that explains what selected priorities mean for this object. |
| **Must not adapt** | Priority section structure, priority input model as Studio IA, placement of Priority in the Studio. |
| **Purpose** | Explain significance of chosen priorities; connect PrioritySelection to Interpretation. |
| **Forbidden** | New Priority subsections that fork the app; hiding Priority for some users; inventing priorities the user did not select. |

### 5.5 Surface B — Racio / FAQ

| Rule | Specification |
| --- | --- |
| **May adapt** | FAQ order; FAQ selection; structure of thematic FAQ blocks. |
| **Must not adapt** | Placement of the Racio section in Client Studio; inventing answers that contradict Object Package / Runtime. |
| **Purpose** | Surface the questions most relevant to current Interpretation and priorities. |
| **Forbidden** | Relocating Racio; replacing Racio with a different section; user-specific Studio IA. |

### 5.6 Surface C — Racio / AI Chat

| Rule | Specification |
| --- | --- |
| **May adapt** | AI replies; conversational context; suggested questions. |
| **Must not adapt** | Runtime state ownership; Object facts; creation of new canonical meaning. |
| **Purpose** | Explain and expand context around Interpretation for the active Session. |
| **Hard constraint** | AI **must not** mutate Runtime, author DecisionState, or create new facts. AI explains what Runtime already projected (see Section 8). |

### 5.7 Surface D — Audit

| Rule | Specification |
| --- | --- |
| **May adapt** | The **closing call to action** only (e.g. “I already have land” vs “I am looking for land”). |
| **Must not adapt** | Audit section existence, placement, or overall structure; creation of new application branches per CTA. |
| **Purpose** | Align next-step language with Decision Session stance without forking the product. |
| **Forbidden** | Separate Audit trees per persona; CTA that implies different Studio structures. |

### 5.8 Surface E — PDF Report

| Rule | Specification |
| --- | --- |
| **May adapt** | Interpretation narrative; chapter order; summary; recommendations. |
| **Must not adapt** | Technical facts derived from Object Package; inventing measurements, specs, or claims absent from Runtime truth. |
| **Purpose** | Portable Decision Outcome / report that reflects Session Interpretation. |
| **Forbidden** | Fact tables that differ by visitor when underlying Object Package is identical; “personalized” false specs. |

### 5.9 Surface F — Messenger / SMS

| Rule | Specification |
| --- | --- |
| **May adapt** | Outbound message **content** derived from Decision Session (summary, stance, next step wording). |
| **Must not adapt** | Operational workflow of messaging systems; Session mechanics; Runtime authority. |
| **Purpose** | Carry Session meaning into human follow-up channels. |
| **Forbidden** | Channel-specific decision logic that bypasses Runtime; messages that invent facts. |

### 5.10 Adaptation inventory (normative)

| ID | Surface | Adapts | Does not adapt |
| --- | --- | --- | --- |
| A | Priority | Interpretation panel | Priority IA / structure |
| B | Racio / FAQ | Order, selection, thematic blocks | Racio placement |
| C | Racio / AI Chat | Answers, context, suggested questions | Runtime / facts |
| D | Audit | Closing CTA copy/intent | Audit structure / new branches |
| E | PDF Report | Interpretation, chapter order, summary, recommendations | Technical facts |
| F | Messenger / SMS | Message content from Session | Workflow / system ownership |

**No other Adaptation Surfaces exist** until this Blueprint is amended by an explicit product decision (and recorded here).

---

## 6. Immutable Experience

### 6.1 Definition

**Immutable Experience** is the set of Client Studio and platform properties that Decision Experience **never** personalizes, reorders, forks, or replaces per visitor.

If a proposed feature requires changing an Immutable property, it is **out of scope** for Decision Experience adaptation and must be rejected or escalated as a separate Studio generation / ADR — not as “personalization.”

### 6.2 Immutable inventory

| Domain | Immutable |
| --- | --- |
| **Client Studio IA** | Overall Studio structure; order of primary sections; primary navigation model |
| **Primary sections** | Hero; House Navigator; Priority (structure); Racio (placement); Audit (structure) |
| **Object** | The object under decision (identity); Object Package as fact source |
| **Technical data** | Specs, measurements, and factual claims from Object Package / Knowledge Model |
| **Media** | Canonical media set of the Object Package (presentation chrome may vary only if later explicitly allowed — default: media facts immutable) |
| **Runtime** | Runtime as sole semantic mutation authority; DecisionState aggregate; cognitive pipeline |
| **Gen1 contract** | Gen1 artifact is not evolved in place; DE develops outside `gen1/` |

### 6.3 Immutable behavioral rules

1. Same Studio skeleton for all visitors.
2. No per-user section trees.
3. No “hidden mode” that removes core sections for personalization.
4. No second semantic authority beside Runtime.
5. No Adaptation Surface may expand itself into a new Studio section without amending DEB-01.

### 6.4 Relationship to Gen1

Client Studio Gen1 is the **structural baseline** of the static Studio before Decision Experience. Decision Experience **adds interpretation and adaptation inside Surfaces A–F**; it does **not** redefine Gen1’s role as frozen etalon.

---
