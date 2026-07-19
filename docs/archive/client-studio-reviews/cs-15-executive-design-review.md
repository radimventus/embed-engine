# CS-15 — Executive Design Review

**Role:** Senior Product Design Director — final visual review before stakeholder approval  
**Date:** 2026-07-15  
**Wireframe:** Approved reference (Google Drawings → PDF → 1600 px uniform export)  
**Render:** `docs/cs-15-render-1600-fullpage.png` @ 1600 px viewport  
**Method:** 30-second visual scan — no DevTools, no code

---

## Authority

Wireframe = absolute design authority.  
Live render = implementation under review.

---

## The Five Biggest Visual Mistakes

### 1. Hero Monolith

**Visual evidence**  
The opening screen is swallowed by a single pale block. Before any story begins, the eye meets an empty field that feels like a loading state — not an invitation into a home.

**Why it breaks the visual story**  
Violates **dominance** and **hierarchy**. The wireframe opens with a confident but compact introduction: image, then immediately name, promise, and action. The render inverts this — the placeholder owns the viewport and pushes the emotional hook (title, price, CTA) below the fold. The intended arc — *“see the house → understand the offer → act”* — stalls at step zero.

**Impact:** HIGH

**Estimated contribution:** 34%

---

### 2. Property Explorer — Vertical Void

**Visual evidence**  
The house tour module reads as a tall white envelope with small placeholders floating inside it. Gallery, room list, and floorplan feel disconnected — like three widgets dropped into a warehouse, not one exploration instrument.

**Why it breaks the visual story**  
Violates **grouping**, **rhythm**, and **balance**. In the wireframe, “Procházka domem” and “Interaktivní půdorys” form a single horizontal chapter — dense, navigable, purposeful. In the render, excessive vertical air separates the parts and slows reading flow. The mid-page story — *“walk through the house”* — loses urgency and coherence.

**Impact:** HIGH

**Estimated contribution:** 28%

---

### 3. Priority Engine — Wrong Composition

**Visual evidence**  
The priority block no longer reads as “choose three, learn why.” The card grid feels like a separate object from the explanation panel. Card count and spatial relationship differ from the approved layout — the eye counts more tiles than intended and cannot find the intended focal pairing between selection and guidance.

**Why it breaks the visual story**  
Violates **grouping**, **balance**, and **reading flow**. The wireframe choreographs a left-to-right decision path: options → focal circle → explanatory field → recommendation banner. The render scatters this choreography — selection and rationale feel like adjacent sections rather than one interactive moment. The emotional beat — *“tell us what matters, we’ll orient you”* — weakens.

**Impact:** HIGH

**Estimated contribution:** 18%

---

### 4. Stretched Page Rhythm

**Visual evidence**  
Scrolling feels longer than the design promises. Transitions between story beats — intro, explore, prioritize, ask, convert — are separated by visible dead zones. The page breathes in the wrong places.

**Why it breaks the visual story**  
Violates **rhythm** and **emotional arc**. The wireframe paces the journey tightly: each section hands off to the next without losing momentum. The render introduces pauses that feel accidental, not intentional. The product reads as *under construction between chapters* rather than a guided sales experience.

**Impact:** MEDIUM

**Estimated contribution:** 12%

---

### 5. Placeholder Weight vs. Content Weight

**Visual evidence**  
Beige and cream blocks in the wireframe carry information density — they are sized to content roles. In the render, placeholders often feel like oversized panels in empty rooms. Visual mass does not match narrative importance.

**Why it breaks the visual story**  
Violates **hierarchy** and **dominance** (secondary to mistakes 1–2, but visible across sections). Empty areas compete with labeled areas for attention. The eye cannot distinguish *“this is the main thing”* from *“this is reserved space.”* The design language of purposeful blocks becomes the language of unfinished layout.

**Impact:** MEDIUM

**Estimated contribution:** 8%

---

## Contribution Summary

| Mistake | Contribution |
|---------|-------------:|
| Hero monolith | 34% |
| Property Explorer vertical void | 28% |
| Priority Engine wrong composition | 18% |
| Stretched page rhythm | 12% |
| Placeholder weight imbalance | 8% |
| **TOTAL** | **100%** |

---

## Final Question

**If only ONE visual mistake could be fixed tomorrow, which one would produce the greatest improvement in perceived quality?**

**Hero monolith.**

**Why:** It is the first and strongest perceptual signal. Stakeholders, clients, and the UX Director all form their initial judgment before scrolling. A compact, confident hero immediately communicates *product polish* and establishes the vertical rhythm every subsequent section inherits. Fixing the hero does not merely improve the top of the page — it recalibrates expectations for the entire scroll. Secondary issues (Property Explorer void, Priority composition) remain important, but they are judged in the context of an opening that already feels wrong. Restore the opening chapter, and the product instantly reads closer to the approved design — even before deeper sections are corrected.

---

## Sprint Outcome

**Single highest-ROI design correction:** Restore hero visual proportion — compact intro image, title and CTA visible in the first glance, social proof as a tight epilogue to the opening chapter.

Implementation work may resume targeting this correction first.
