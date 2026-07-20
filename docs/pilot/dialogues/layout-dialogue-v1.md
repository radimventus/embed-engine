# Layout Decision Dialogue v1

**id:** `dialogue.layout.disposition.v1`  
**CAP:** P02 — Decision Dialogue Validation  
**Object:** [house-modern-01](../object/house-modern-01.md)  
**Pack:** [disposition-layout-v1](../behavior-packs/disposition-layout-v1.md)  
**Story spine:** [layout-decision-story-v1](../stories/layout-decision-story-v1.md)  
**Moves:** [disposition-layout-move-library](../moves/disposition-layout-move-library.md)

This is **not** a screen design.  
This is the **decision conversation** between the system (as advisor) and one real buyer.

Architecture stays frozen. Strategy → Story → Moves → Human → Decision.

---

## 1. Dialogue overview

A couple walks into Modern 01 emotionally. They liked the exterior. They are about to fall for the living room photo.

The dialogue’s job is to slow that fall just enough that **layout fit** becomes a conscious choice — including the uncomfortable parts — before money and ego lock in.

Tone: experienced consultant beside them. Never brochure. Never “unique opportunity.” Always: *what will Tuesday morning feel like in this plan?*

```text
Priority: Disposition (Layout)
        ↓
Strategy composes story.layout.disposition.v1
        ↓
Moves in sequence (with branches)
        ↓
Buyer’s mental model updates
        ↓
Decision Outcome (pursue / conditional / walk away on layout grounds)
```

---

## 2. Decision objective

By the end, the buyer can answer **without guessing**:

1. Does the day/night split match how we actually live?  
2. Where does dining live — and is the kitchen size acceptable?  
3. Is one upstairs bathroom workable for *our* mornings?  
4. Are stairs between life and sleep acceptable long-term?  
5. Therefore: **pursue / pursue with conditions / reject** — on disposition, not on façade beauty.

Secondary objective: the buyer should feel **more confident**, not more sold.

---

## 3. Buyer initial assumptions

**Persona (pilot):** Marta (38) and Tomáš (40). One child (6). Considering a second child. Both work partly from home. Parents visit overnight a few times a year. Budget stretches to ~7M. They found Modern 01 online.

**What is already in their heads (before dialogue):**

| Assumption | Risk if unchallenged |
| --- | --- |
| “142 m² is enough for a family.” | Area ≠ workable disposition |
| “Nice living room = good house.” | Living 32 m² hides kitchen 14 m² |
| “Two floors is normal / fine.” | Stairs become daily friction later |
| “5 rooms sounds complete.” | No study; bath contention invisible |
| “Garden will solve everything outdoors.” | Outdoor life still needs indoor day-zone logic |
| “We’ll figure bathrooms later.” | Morning conflict is a relationship tax |

**Emotional state:** hopeful, slightly rushed, afraid of missing a “good one.”

The dialogue must respect hope and still introduce friction early enough to be useful.

---

## 4. Complete Move-by-Move dialogue

Entry event: buyer marks **Disposition / Layout** as the decision focus (Priority).  
Strategy activates `story.layout.disposition.v1`. Cursor → Move 1.

---

### Move 1 — `layout.confirm-focus`

**Purpose**  
Align system and buyer: *today we are deciding how life is organised in space — not how pretty the render looks.*

**Decision uncertainty it removes**  
“Are we evaluating atmosphere or disposition?” → Disposition.

**Expected buyer reaction**  
Slight slowdown. Relief that someone is structuring the chaos. Mild resistance if they only wanted “nice photos.”

**Advisor voice (what happens in the mind next)**  
> “Before we fall for the living room light — let’s decide whether this plan fits *your* week. Disposition first. Beauty second.”

**Required evidence from Object Package**  
- Object identity `house-modern-01`  
- Typology: family house, two floors, garden  

**Behavior Pack knowledge used**  
- Layout as leading priority affinity  
- Rule: do not recommend from exterior alone  

**Trade-off explained**  
Spending attention on layout now vs. discovering layout regret after emotional commitment.

**Completion condition**  
Buyer accepts layout as the active focus (Priority / question on disposition). Interpretation leads with `layout`.

**Possible Strategy continuation**  
→ `layout.discover-day-zone`  
Branch: if buyer immediately opens a night room, Strategy may still insist on confirm, then recompose discover order (see §5).

---

### Move 2 — `layout.discover-day-zone`

**Purpose**  
Build a lived mental model of the **ground-floor day zone** (living + kitchen), not a postcard of “open space.”

**Decision uncertainty it removes**  
“What’s the social heart of this house?” → Living 32 m² + kitchen 14 m² adjacency.

**Expected buyer reaction**  
Tomáš lights up at living size. Marta starts sensing the kitchen is smaller than the living fantasy. Productive tension appears.

**Advisor voice**  
> “Stand in the day zone. This is where your weekdays happen. Living is generous — thirty-two metres. Kitchen is fourteen. Notice that gap now, not after you buy curtains.”

**Required evidence from Object Package**  
- `room-living` 32 m² floor 0  
- `room-kitchen` 14 m² floor 0  
- Day-zone statement  

**Behavior Pack knowledge used**  
- Day zone coherence  
- Selling point: generous living  
- Weakness: modest kitchen  

**Trade-off explained**  
Gathering scale vs cooking/dining workspace — not yet forced to choose, but planted.

**Completion condition**  
Buyer has “been in” living and/or kitchen as spatial evidence (`ROOM_VIEWED` day rooms). Mental map of downstairs social life exists.

**Possible Strategy continuation**  
→ `layout.discover-night-zone`  
If both living and kitchen already evidenced, Strategy may shorten later compare but must not skip the trade-off Move.

---

### Move 3 — `layout.discover-night-zone`

**Purpose**  
Experience the **upper night zone** as a different kind of life — rest, privacy, morning routine — not “more rooms upstairs.”

**Decision uncertainty it removes**  
“Is sleep protected from day life?” → Yes by floor split; cost = stairs + shared bath.

**Expected buyer reaction**  
Relief that child and parents have separate rooms. Unease when they notice one bathroom serves the whole upper floor.

**Advisor voice**  
> “Upstairs is for ending the day. Parents here, child there, bath in the middle. Quiet is the point. Ask yourself: who fights for the bathroom at 7:15?”

**Required evidence from Object Package**  
- `room-bedroom` 18 m², `room-children` 16 m², `room-bath` 8 m², floor 1  
- Night-zone / wet-core facts  

**Behavior Pack knowledge used**  
- Night zone rest  
- Parents/children separation as pro  
- Single bath as con  

**Trade-off explained**  
Acoustic privacy vs. vertical living and shared wet core.

**Completion condition**  
Night zone spatially evidenced (room and/or floor change into upper level).

**Possible Strategy continuation**  
→ `layout.interpret-day-night-split`  
Branch: if `FLOOR_CHANGED` was the dominant evidence, Strategy may splice `layout.warn-stairs-mobility` immediately after interpret (or before).

---

### Move 4 — `layout.interpret-day-night-split`

**Purpose**  
Turn exploration into **meaning**: two floors are not “extra space” — they are a lifestyle contract.

**Decision uncertainty it removes**  
“Why is the house organised this way?” → Day together / night apart by design.

**Expected buyer reaction**  
“Ah — so this is intentional.” Confidence rises. They can now explain the plan to each other in one sentence.

**Advisor voice**  
> “This house separates *together* from *alone*. Day life downstairs. Sleep upstairs. That’s a strength if your evenings are social and your nights need quiet. It’s a tax if you hate stairs or need everything on one level.”

**Required evidence from Object Package**  
- Layout overview / circulation idea  
- Floor 0 vs Floor 1 room sets  

**Behavior Pack knowledge used**  
- Definition of day/night zones  
- Pros of clear split  
- Cons: stairs always in the path  

**Trade-off explained**  
Clarity of lifestyle zones vs. vertical friction every single day.

**Completion condition**  
Buyer can restate the split in their own words (acknowledgement via question/disposition focus). Uncertainty “what do two floors mean here?” is gone.

**Possible Strategy continuation**  
Default → `layout.compare-living-kitchen`  
If stairs anxiety is already verbalised → splice `layout.warn-stairs-mobility` next, then return to compare spine.

---

### Move 5 — `layout.compare-living-kitchen`

**Purpose**  
Force the dining question into the open before romance closes it.

**Decision uncertainty it removes**  
“Where do we eat — and is that OK?” → Dining likely lives in/near living because kitchen is compact.

**Expected buyer reaction**  
Argument between partners is allowed and healthy. One says “we cook a lot.” One says “we host in the living room anyway.” System does not pick a winner — it makes the choice conscious.

**Advisor voice**  
> “Be honest: in your home, does cooking need a big stage, or does gathering? Here the plan bets on gathering. Kitchen stays modest. If Sunday cooking is sacred, this is a condition — not a footnote.”

**Required evidence from Object Package**  
- Living 32 vs kitchen 14  
- Adjacency living↔kitchen  
- Weakness: kitchen size / dining spill  

**Behavior Pack knowledge used**  
- Compare rule for living vs kitchen  
- Trade-off table: large living, modest kitchen  

**Trade-off explained**  
Hosting/gathering comfort vs cooking workspace dignity.

**Completion condition**  
Buyer has taken a position (even provisional): accept dining-in-living logic, or flag kitchen as a deal-breaker/condition.

**Possible Strategy continuation**  
→ `layout.compare-indoor-garden`  
Branch: kitchen deal-breaker → Strategy may jump toward recommend with **weak fit** after household ask (still must ask household shape).

---

### Move 6 — `layout.compare-indoor-garden`

**Purpose**  
Treat garden as **continuation of disposition**, not Instagram backdrop.

**Decision uncertainty it removes**  
“Is outdoor life part of the plan or leftover land?” → 620 m² garden + living orientation toward outdoor life is part of the day-zone bet.

**Expected buyer reaction**  
Relief (“the kids will be outside”). Or realism (“we won’t use garden if living doesn’t connect”).

**Advisor voice**  
> “The day zone wants to spill outside. If your summers live outdoors, this plan supports you. If you barely leave the sofa, the garden won’t save a cramped kitchen — it only rewards people who actually go out.”

**Required evidence from Object Package**  
- `hasGarden: true`, land 620 m²  
- Living orientation assumptions toward garden  
- Exterior/floorplan as supporting evidence  

**Behavior Pack knowledge used**  
- Outdoor continuation  
- Compare indoor vs garden  

**Trade-off explained**  
Indoor day-zone constraints vs outdoor compensation — garden helps living, it does not erase kitchen/bath limits.

**Completion condition**  
Buyer links garden to how they live weekdays/weekends — not only to “nice to have.”

**Possible Strategy continuation**  
→ `layout.warn-bath-contention`  
(Strategy may swap order with stairs warn if mobility already dominant.)

---

### Move 7 — `layout.warn-bath-contention`

**Purpose**  
Name the most common silent killer of family satisfaction in this plan: **one upstairs bath**.

**Decision uncertainty it removes**  
“Will mornings work?” → For 3–4 people, expect contention unless routines are staggered.

**Expected buyer reaction**  
Discomfort. Good. Better now than after handover. Some buyers minimise (“we’ll manage”); advisor stays calm and concrete.

**Advisor voice**  
> “I’m not trying to talk you out of the house. I’m trying to protect your 7 a.m. One bath upstairs for parents and child — and maybe a second child later. If mornings are already tense in your current flat, this plan will amplify that. If you’re staggered and calm, it’s fine. Which are you?”

**Required evidence from Object Package**  
- Single `room-bath` 8 m² on floor 1  
- No second bath in package  
- Weakness list: morning contention  

**Behavior Pack knowledge used**  
- Warn rule for bath  
- Constraint: never hide single-bath risk  
- Household load implications  

**Trade-off explained**  
Efficient compact wet core vs. parallel morning demand.

**Completion condition**  
Bath risk is acknowledged as a real factor (not shrugged as “details”).

**Possible Strategy continuation**  
→ `layout.ask-household-shape`  
Optional splice: `layout.warn-stairs-mobility` if not yet done and floors were changed.

---

### Move 7b (branch splice) — `layout.warn-stairs-mobility`

**Purpose**  
Make vertical living an explicit life choice, especially with child, ageing parents visits, or future mobility.

**Decision uncertainty it removes**  
“Are stairs just architecture?” → Stairs are daily tax between coffee and sleep.

**Expected buyer reaction**  
Parents-visit scenario clicks. Or “we’re young, stairs are fine” — still a decision, not an accident.

**Advisor voice**  
> “Every night ends upstairs. Every morning starts with a descent. With a six-year-old that’s normal. With a sleeping guest on crutches, it’s a negotiation. Decide with eyes open.”

**Required evidence from Object Package**  
- Two-level layout  
- Day 0 / night 1 split  

**Behavior Pack knowledge used**  
- Stairs as con of day/night split  
- Mobility / toddler / elderly consideration  

**Trade-off explained**  
Zone clarity vs continuous stair dependence.

**Completion condition**  
Stairs accepted or flagged as condition/reject factor.

**Possible Strategy continuation**  
Return to spine → household ask → recommend.

---

### Move 8 — `layout.ask-household-shape`

**Purpose**  
Load the **human variables** the plan will be judged against — before the system states a fit.

**Decision uncertainty it removes**  
“Fit for whom?” → Concrete household: counts, WFH, guests, second child intent.

**Expected buyer reaction**  
They get specific. Vague “family house” becomes “us + one child + maybe second + two laptops + overnight grandparents.”

**Advisor voice**  
> “Tell me the real household — not the brochure family. How many people on a school morning? Who works from home? Do grandparents sleep over? Are you planning another child in three years? Disposition is judged against *that*, not against an average.”

**Required evidence from Object Package**  
- Room count and types (to map answers onto plan limits)  
- Children’s room 16 m²; no dedicated study  

**Behavior Pack knowledge used**  
- Ask-before-recommend rule  
- Flexibility of children’s room vs office need  
- Bath load vs headcount  

**Trade-off explained**  
Aspirational household narrative vs plan capacity (office missing, bath, children’s room growth).

**Completion condition**  
Enough constraints stated to support a non-generic recommendation  
(pilot example answer: 2 adults + 1 child, second child possible, 2× WFH, grandparents 4×/year).

**Possible Strategy continuation**  
→ `layout.recommend-disposition-fit`

---

### Move 9 — `layout.recommend-disposition-fit`

**Purpose**  
Deliver a **disposition verdict** the buyer can act on — pursue, pursue with conditions, or walk away — without shame and without sales pressure.

**Decision uncertainty it removes**  
“So… is this layout right for us?” → A named fit class with reasons.

**Expected buyer reaction**  
Calm. Even if the answer is “conditional” or “weak,” confidence rises because the decision is reasoned. The dangerous state — vague hope — is gone.

**Advisor voice (example for this persona — conditional fit)**  
> “Here’s my disposition read — not a sales close.  
> **Conditional fit.**  
> The day/night split matches how you live: social downstairs, quiet upstairs, child with their own room. Garden supports that story.  
> Conditions you must accept with eyes open: kitchen stays modest — dining lives with living; one upstairs bath on school mornings; stairs every day; no true study — WFH will borrow living or bedroom.  
> If you accept those four, this plan can serve you well. If any one of them will poison your week, keep looking — you’re not ‘failing,’ you’re choosing accurately.”

**Required evidence from Object Package**  
- Full disposition fact set used across prior Moves  
- Selling points + weaknesses both  

**Behavior Pack knowledge used**  
- Recommend only after discover + interpret/compare + weakness + household ask  
- Never “perfect for every family”  
- Fit classes: strong / conditional / weak  

**Trade-off explained**  
Final synthesis of all prior trade-offs into one decision frame.

**Completion condition**  
Buyer accepts the verdict as their working decision (even if they later revisit energy/price). Layout uncertainty is resolved enough to act.

**Possible Strategy continuation**  
- Dialogue complete for disposition.  
- Later packs (energy, investment) may start new Stories — out of this dialogue’s scope.  
- If buyer rejects conditions → Outcome = walk away on layout; Strategy should not reopen beauty marketing.

---

## 5. Alternative Strategy branches

Strategy does not invent new architecture. It **recomposes** the same Move library.

| Buyer behaviour | Strategy continuation |
| --- | --- |
| Opens night rooms before day | Confirm → night discover → day discover → interpret (order flex; both zones still required) |
| Obsessed with garden/exterior first | Confirm → day discover → indoor/garden compare earlier → then night spine |
| Immediately asks “is kitchen big enough?” | After confirm + minimal day evidence → jump to living/kitchen compare, then backfill night discover before recommend |
| Mentions ageing parents / injury | Splice `layout.warn-stairs-mobility` before household ask |
| Declares “we need an office” early | Keep spine; in household ask treat WFH as hard constraint; recommend leans **conditional/weak** (no study room) |
| Tries to skip weaknesses | Block recommend until bath or kitchen weakness Move completed (Pack rule) |
| Household is 2 adults, no kids, no WFH | Recommend may become **strong fit** if stairs+bath OK and kitchen accepted |
| Household is 2 adults + 2 kids + heavy WFH | Recommend **weak fit** unless they accept serious compromises |

---

## 6. Decision Outcome

**For Marta & Tomáš (pilot path above): Conditional fit on disposition.**

| Question | Resolved answer |
| --- | --- |
| Day/night split | Yes — matches social evenings + quiet sleep |
| Kitchen / dining | Acceptable only if dining lives in living |
| One bath | Acceptable only with staggered mornings; second child = revisit risk |
| Stairs | Acceptable now; flag if parents’ mobility worsens |
| Action | Continue interest **with written conditions**; do not treat layout as “done / perfect” |

**What the buyer knows that photo-browsing never taught them**  
The four conditions. The office gap. The bath math. The stairs tax. The living-vs-kitchen bet.

---

## 7. Validation

### Would a buyer make a better decision after this dialogue than after browsing photos alone?

**Yes.**

Photos optimise for desire.  
This dialogue optimises for **Tuesday morning truth**.

After photos alone, Marta and Tomáš would likely say: “Beautiful living room — we should move fast.”  
After this dialogue they say: “Beautiful living room — and we know the price of that beauty in kitchen, bath, stairs, and desk space. We can buy with conditions, or walk away without regret.”

That is a better decision even when the answer is still “yes, with conditions.”  
It is also a better decision when the answer becomes “no” — because “no” arrives before deposit and self-justification.

### CAP-P02 success read

Reading top to bottom: this is the conversation an honest advisor would have on site.  
If a buyer would rather face a house with this dialogue than with a traditional glossy presentation alone — **CAP-P02 holds.**

---

## References

- [Pilot README](../README.md)  
- [Validation (CAP-P01)](../validation.md)  
- [Open questions](../open-questions.md)  
- Decision Layer vocabulary (SSOT): link only — do not redefine
