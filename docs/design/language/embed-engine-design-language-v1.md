# Embed Engine Design Language

**Version:** 1.0  
**Status:** Foundational — applies to all Embed Engine products and modules  
**Scope:** Narrative, composition, hierarchy, review language  
**Not in scope:** Implementation, geometry tokens, component libraries, product-specific screens

---

# Purpose

Embed Engine is a family of guided professional experiences — not websites, not dashboards, not admin panels.

Each product (Client Studio, Developer Studio, Parcel Studio, Finance Studio, AI Studio, and future modules) is one continuous journey inside a shared workspace. Users never navigate between pages; they move through **Visual Chapters** toward a decision.

This document defines **how to think** when designing any Embed Engine experience. It is the first version of the Embed Engine Design Language — the authority for narrative structure, visual composition, and design review across all products.

Wireframes remain the authority for *what* a specific product shows.  
This document defines *how* any product must be composed.

---

# 1. Narrative Architecture

Embed Engine leads a person from first impression to committed action through seven psychological phases. These phases are **not page sections**. They are states of mind.

```
Attention
    ↓
Desire
    ↓
Exploration
    ↓
Identity
    ↓
Confidence
    ↓
Dialogue
    ↓
Commitment
```

## Attention

**Purpose:** Capture focus without demanding effort. The visitor must instantly know *where they are* and *that something meaningful awaits*.

**Psychological shift:** From ambient browsing to focused presence.

**Failure mode:** Empty dominance — large voids that feel like loading, not invitation.

---

## Desire

**Purpose:** Create emotional pull toward the subject. The visitor must feel *this could be mine / this matters to me* before any rational argument.

**Psychological shift:** From presence to wanting.

**Failure mode:** Information before emotion — specs and actions appear before the visitor cares.

---

## Exploration

**Purpose:** Convert desire into spatial or conceptual understanding. The visitor must *see*, *navigate*, or *discover* the subject — not read about it abstractly.

**Psychological shift:** From wanting to knowing.

**Failure mode:** Widget gallery — disconnected tools floating in a container instead of one instrument.

---

## Identity

**Purpose:** Invite personal investment. The visitor declares *what matters to me* — preferences, priorities, context, role.

**Psychological shift:** From passive observer to active participant.

**Failure mode:** Form disguised as interaction — data collection without the feeling of being heard.

---

## Confidence

**Purpose:** Dissolve doubt. Structured answers, evidence, and reassurance replace uncertainty.

**Psychological shift:** From hesitation to calm readiness.

**Failure mode:** Information dump — answers exist but do not address the visitor's emotional block.

---

## Dialogue

**Purpose:** Open two-way exchange. The visitor may ask, probe, and receive guidance without pressure.

**Psychological shift:** From receiving to conversing.

**Failure mode:** Chat bolted onto FAQ — two equal panels with no relationship.

---

## Commitment

**Purpose:** Convert readiness into action. One clear, bounded decision — submit, confirm, proceed, sign.

**Psychological shift:** From *I could* to *I will*.

**Failure mode:** Ambiguous exit — multiple competing actions with no visual climax.

---

## Emotional Arc

Every Embed Engine product follows this arc. Not every product implements all seven phases in one scroll — but **no phase may be skipped psychologically**. If Exploration is absent, Identity feels arbitrary. If Confidence is absent, Commitment feels reckless.

The arc is **sequential**. Each phase hands emotional state to the next.

---

# 2. Visual Chapters

## Definition

A **Visual Chapter** is the smallest complete narrative unit in Embed Engine. It is one psychological beat rendered as one compositional act.

A Chapter is **not** a React component, not a `<section>`, not a route. It is what the visitor *experiences* as one chapter of a story.

## What a Chapter Contains

Every Chapter has:

| Element | Role |
|---------|------|
| **Composition Envelope** | The visual boundary of the act |
| **Primary Mass** | One dominant visual element |
| **Supporting Masses** | Elements that serve the Primary Mass |
| **Chapter Rhythm** | How the chapter opens and closes |
| **Psychological goal** | One question the chapter answers |

## When a Chapter Begins

A Chapter begins when the **emotional state shifts**.  
Attention becomes Desire. Desire becomes Exploration. The visitor feels the ground change.

Visual signal: new **Dominant Mass**, new **Reading Flow**, or a **Narrative Transition** (tonal shift, density change, full-width closure).

## When a Chapter Ends

A Chapter ends when its **psychological question is answered** and **Visual Closure** is delivered.

| Phase | Question answered | Closure signal |
|-------|-------------------|----------------|
| Attention + Desire | *What is this? Do I want it?* | Social proof, invitation forward |
| Exploration | *Can I understand it?* | Shared bottom rhythm, instrument complete |
| Identity | *Does this fit me?* | Recommendation, guidance banner |
| Confidence | *Are my doubts normal?* | Accordion rest, calm density |
| Dialogue | *Can I ask freely?* | Input ready, conversation visible |
| Commitment | *What do I do now?* | Full-width climax, single action |

## How to Recognise a Completed Chapter

A Chapter is complete when a stakeholder, without scrolling further, can answer:

1. *What just happened to me emotionally?*
2. *What am I expected to do or feel next?*

**Not** when pixels align. **When the psychological handoff is clear.**

## Chapter vs Section

| Section (implementation) | Chapter (design) |
|--------------------------|------------------|
| Defined by code boundary | Defined by narrative beat |
| May split one chapter | One chapter may span multiple sections |
| Has an ID | Has a psychological goal |

Implementation may use multiple sections inside one Chapter — but the visitor must never *feel* the seams.

---

# 3. Design Grammar

The vocabulary of Embed Engine composition. Use these terms in design, review, and documentation.

---

## Composition Envelope

**Definition:** The outer visual boundary within which one compositional act takes place.

**Purpose:** Groups elements into one perceived scene. Prevents floating widgets.

**Use when:** Defining any Chapter, stage, or multi-element act.

**Never use when:** Describing a single isolated control or a global shell (workspace, app chrome).

---

## Primary Stage

**Definition:** The main spatial field where the Chapter's drama occurs.

**Purpose:** Holds Primary Mass and Supporting Masses in one readable plane.

**Use when:** A Chapter needs one unified working surface (exploration instrument, decision grid, conversion block).

**Never use when:** The element is navigational chrome or a footnote.

---

## Secondary Stage

**Definition:** A subordinate spatial field that supports the Primary Stage without competing.

**Purpose:** Holds explanation, guidance, or secondary input tied to the Primary Mass.

**Use when:** Identity, dialogue, or dual-column confidence layouts.

**Never use when:** The secondary field carries equal narrative weight — then it is a co-primary (rare, must be justified).

---

## Primary Mass

**Definition:** The single dominant visual element in a Chapter or stage.

**Purpose:** Directs the eye first. Owns attention.

**Use when:** Every Chapter — exactly one.

**Never use when:** Two elements fight for first fixation — redesign until one wins.

---

## Supporting Mass

**Definition:** Any visual element subordinate to the Primary Mass.

**Purpose:** Context, action, validation, navigation within the act.

**Use when:** Titles, CTAs, thumbnails, toggles, captions, proof strips.

**Never use when:** The element should dominate — promote it to Primary Mass or move it to another Chapter.

---

## Navigation Spine

**Definition:** A narrow vertical axis that connects two Primary Masses without being content itself.

**Purpose:** Wayfinding between exploration zones — room lists, step indices, module rails within a stage.

**Use when:** Multi-zone exploration instruments.

**Never use when:** The spine carries primary information — it is structure, not story.

---

## Bridge Element

**Definition:** A visual object that physically or perceptually spans the boundary between two compositional zones.

**Purpose:** Signals continuity — *these two things are one decision*.

**Use when:** Circle on grid boundary, connector icon, overlapping label between Identity zones.

**Never use when:** Placed fully inside one zone — then it is decoration, not a bridge.

---

## Narrative Transition

**Definition:** The perceptual shift between Chapters — tonal, density, or colour change.

**Purpose:** Tells the visitor: *a new act begins* without breaking the continuous scroll.

**Use when:** Moving from Exploration to Identity, from Dialogue to Commitment.

**Never use when:** Inside a Chapter — internal shifts use rhythm, not acts.

---

## Chapter Rhythm

**Definition:** The opening and closing beat of a Chapter — how it inhales and exhales.

**Purpose:** Opening hooks attention; closure delivers Visual Closure.

**Use when:** Designing any Chapter envelope.

**Never use when:** Confused with padding — rhythm is narrative, not spacing.

---

## Decision Boundary

**Definition:** The line — visual or psychological — where one choice ends and consequences begin.

**Purpose:** Makes Identity and Commitment chapters feel consequential.

**Use when:** Toggle before form, grid selection before recommendation, confirm before submit.

**Never use when:** Every interaction is treated as equal weight — dilutes commitment.

---

## Emotional Anchor

**Definition:** The element that carries the feeling of a Chapter — often imagery, colour block, or human voice.

**Purpose:** Ensures the Chapter is remembered emotionally, not just understood.

**Use when:** Opening (image), Commitment (full-width colour), Dialogue (conversation tone).

**Never use when:** Treated as interchangeable placeholder — anchors must be intentional.

---

## Visual Closure

**Definition:** The explicit end signal of a Chapter — banner, rule, tonal inversion, full-width bar.

**Purpose:** Prevents the visitor from drifting into the next Chapter unconsciously.

**Use when:** End of Identity (recommendation), end of Commitment (footer within block).

**Never use when:** The Chapter fades into whitespace — that is abandonment, not closure.

---

# 4. Hierarchy of Decisions

Design decisions in Embed Engine follow strict order. **Never reverse.**

```
Narrative
    ↓
Decision
    ↓
Composition
    ↓
Geometry
    ↓
Components
    ↓
Implementation
```

## Narrative

*What psychological journey does this product deliver?*  
Which phases of the arc appear? What is the visitor's emotional state at each beat?

## Decision

*What must the visitor decide at each Chapter?*  
One decision per Chapter. If there are two decisions, there are two Chapters.

## Composition

*What are the Masses, Stages, Envelopes, and Reading Flows?*  
Dominance, grouping, rhythm, closure — before any pixel or component name.

## Geometry

*What are the spatial proportions of the Composition Envelope?*  
Defined in product geometry specifications — after composition is locked.

## Components

*What reusable building blocks instantiate the composition?*  
Components serve composition. Composition never serves components.

## Implementation

*How is it built?*  
Last. Always last.

## Why Reverse Order Fails

| If you start with… | You get… |
|--------------------|----------|
| Components | Widget inventory, not a journey |
| Geometry / tokens | Correct spacing, wrong story |
| Composition without narrative | Pretty layout, no conversion |
| Implementation | Accidental architecture frozen in code |

**Golden rule:** If a component exists but no Primary Mass needs it, remove the component — not the Mass.

---

# 5. Composition Rules

Universal rules derived from Embed Engine reconstruction. Apply to every product.

1. **One Primary Mass per Chapter.** If two elements compete, the Chapter is two Chapters or the design is wrong.

2. **Supporting Mass never contests Primary Mass.** Subordination is visual, not verbal.

3. **Whitespace separates; it never narrates.** Empty space is punctuation, not content. Dominant void = broken Chapter.

4. **CTA never opens a new scene.** Action belongs to the Chapter that created the desire. CTAs are Supporting Mass.

5. **Navigation Spine is not content.** It connects; it does not tell the story.

6. **Bridge Element connects two zones of one decision.** Not decoration inside one zone.

7. **Banner or full-width bar closes a Chapter.** Visual Closure before Narrative Transition.

8. **Dominant image is never decoration.** It is an Emotional Anchor — it opens Desire or Exploration.

9. **Layout defines proportion; proportion does not define layout.** Envelope height and column rhythm come first; media aspect follows.

10. **One Primary Stage per exploration instrument.** Multiple tools in one envelope share height and bottom rhythm — not floating cards.

11. **Asymmetry expresses dominance.** Identity and decision Chapters are rarely symmetric. Dominant side carries the decision; secondary side carries guidance.

12. **Symmetry expresses parity.** Confidence + Dialogue may use equal columns when both voices matter equally.

13. **Three masses in one envelope share one bottom baseline.** Toggles, actions, and footers align — the instrument feels finished.

14. **Header and app chrome are frame, not Chapter.** They orient; they do not dominate the narrative.

15. **One Composition Envelope per Opening act.** First impression is one scene — not stacked boxes.

16. **Colour inversion signals Commitment.** The emotional climax uses tonal weight — not incremental grey.

17. **Reading Flow is single-threaded per Chapter.** The eye has one intended path. Branching is allowed only in Exploration and Dialogue — never in Opening or Commitment.

18. **Placeholder is not a Mass.** Labelled empty blocks must still obey envelope rules — they represent future Primary Mass, not permission for void.

---

# 6. Narrative Rules

Rules governing attention and psychological handoff.

1. **The visitor never wonders what to do next.** Each Chapter ends with implicit or explicit forward pull.

2. **Each Chapter answers exactly one question.** If it answers two, split it.

3. **One Chapter = one decision or one emotional shift.** Not both unless the decision *is* the shift (Commitment).

4. **The next Chapter exists only when the previous one completed.** No premature Identity before Exploration; no Commitment before Confidence.

5. **Emotion before explanation in Opening.** Attention and Desire precede rational proof.

6. **Participation before persuasion in Identity.** The visitor speaks before the system recommends.

7. **Reassurance before ask in Commitment.** Confidence and Dialogue precede the form.

8. **Continuous scroll, discrete acts.** One workspace — many Chapters — no page breaks in the psychological sense.

9. **Social proof validates, never leads.** It is Supporting Mass at the end of Opening — not Primary Mass.

10. **Dialogue is invitation, not interrogation.** Input appears when the visitor is ready to speak — not when the system needs data.

11. **Failure is a Chapter, not an error state.** Empty, blocked, or invalid moments get Composition Envelope and Closure — not bare alerts.

12. **Products differ in content, not in arc structure.** Parcel Studio and Finance Studio use the same grammar; only Masses change.

---

# 7. Acceptance Language

From this version forward, Embed Engine design review uses **Design Language only**.

## Do Not Use in Review

- Pixel deltas, percentages, rem values
- Framework utilities, grid column counts, aspect-ratio names
- Component prop names, DOM structure
- "Looks close enough"

## Use Instead

| Instead of… | Say… |
|-------------|------|
| Hero is 32 px taller | Primary Mass overwhelms Opening; Desire delayed |
| Grid is 52/48 | Supporting Mass contests Primary Mass |
| `aspect-video` wrong | Layout does not govern proportion; Mass floats |
| Section has too much padding | Whitespace narrates instead of separates |
| Button misaligned | CTA opens new scene; breaks Reading Flow |
| Column overflow | Primary Mass breaches Composition Envelope |
| Looks fine | Chapter completes its psychological goal |

## Review Sentence Templates

- *"[Chapter] reads as one scene / multiple scenes."*
- *"Primary Mass is [element]; Supporting Masses are subordinate / competing."*
- *"Reading Flow: [path]. Interruption at [beat]."*
- *"Visual Closure present / absent before [next Chapter]."*
- *"Bridge Element connects / fails to connect [zone A] and [zone B]."*
- *"Navigation Spine carries wayfinding / incorrectly carries content."*
- *"Narrative Transition signals new act / absent / premature."*

---

# 8. Design Review Checklist

Universal approval checklist — maximum 20 points. Any Embed Engine screen must pass all applicable items.

1. **Arc** — The screen participates in Attention → Commitment; no phase skipped without justification.

2. **Chapter boundaries** — Each act has clear beginning (emotional shift) and Visual Closure.

3. **One Primary Mass** — Each Chapter has exactly one dominant element.

4. **Supporting subordination** — No Supporting Mass competes with Primary Mass.

5. **One scene per Opening** — First impression is one Composition Envelope.

6. **CTA placement** — Actions belong to their Chapter; none open a new scene.

7. **Reading Flow** — Eye path is intentional and completable without search.

8. **Whitespace role** — Space separates only; no dominant void.

9. **Exploration instrument** — Multi-zone stages share envelope, height, bottom baseline.

10. **Navigation Spine** — Connects zones; does not hold primary story.

11. **Bridge Element** — Identity/decision zones connected where wireframe requires span.

12. **Asymmetry / symmetry** — Matches narrative intent (dominance vs parity).

13. **Identity before recommendation** — Visitor participates before system advises.

14. **Confidence before Commitment** — Doubt addressed before ask.

15. **Dialogue parity** — Conversation and structured answers relate as designed (peer or guide).

16. **Commitment climax** — Final Chapter has tonal weight and single primary action.

17. **Frame vs Chapter** — App chrome orients; does not dominate narrative.

18. **Placeholder discipline** — Empty blocks respect Mass and envelope rules.

19. **Cross-product grammar** — Terms and structure match this Design Language.

20. **Stakeholder sentence** — *"This is the same product intent as the approved wireframe story"* — without prompting.

---

# 9. Final Question

**Could another UX Designer, who has never seen Client Studio, design new Embed Engine modules from this document alone and produce a consistent product?**

**Answer: Yes — with one explicit dependency.**

This document fully defines **narrative structure, compositional grammar, decision hierarchy, rules, and review language** for any Embed Engine module. A designer can determine what Chapters exist, what Masses dominate, how Reading Flow proceeds, and how to approve the result.

**Dependency:** Each product still requires an **approved wireframe** for specific content, Mass identity (what the Primary Mass *is* in that product), and proportional geometry in that product's geometry specification. Design Language defines *how to compose*; wireframes define *what to compose*.

Without wireframes, a designer knows **the shape of the journey** but not **the subject of each Mass**. That is intentional — Embed Engine sells many domains; grammar is shared, story is per product.

**Principle completeness for v1.0:** Narrative arc, Chapter definition, grammar vocabulary, decision hierarchy, composition rules, narrative rules, acceptance language, and review checklist are sufficient for cross-product consistency. Geometry and tokens remain in separate product specifications — not because grammar is incomplete, but because proportions are product-specific while psychology is engine-wide.

---

# Appendix: Relationship to Other Documents

| Document | Relationship |
|----------|--------------|
| Product wireframes | Authority for *what* each product shows |
| Product geometry specifications | Authority for *proportions* after composition is locked |
| This Design Language | Authority for *narrative and composition* across all products |
| Implementation guides | Last — serve composition, never lead it |

---

**Embed Engine Design Language v1.0** — foundational. All future products and modules inherit this grammar.
