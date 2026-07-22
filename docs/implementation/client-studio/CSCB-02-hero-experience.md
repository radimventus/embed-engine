# CSCB-02 / SR-002 — Hero Experience

| Field | Value |
| --- | --- |
| **Capability** | CSCB-02 — Object Discovery (slice SR-002) |
| **Status** | **DONE** (Hero slice) |
| **Date** | 2026-07-22 |
| **Commit** | `feat(client-studio): implement hero experience` |

---

## Implementation summary

Hero is the opening **Decision Surface** for Object Discovery.

It answers:

1. **What am I viewing?** — object title, reference, construction, location  
2. **Why care?** — projected object facts (rooms / garden, area, land, price)  
3. **How do I start?** — Decision Entry CTAs open journey sections (no decisions)

Hardcoded SocialProof was removed from the opening surface (not Context-backed).

---

## Runtime data used by Hero

| UI concern | Runtime / Context field | Notes |
| --- | --- | --- |
| Name | `context.object.title` / `context.hero.title` | Object identity |
| Reference / type | `context.object.reference`, `construction` | Type ≈ construction (no separate type field) |
| Location | `context.object.city`, `district` | |
| Energy class | `context.object.energyClass` | |
| Main params | `context.hero.metrics` ← object usableArea + house landArea/price | Projection formats only |
| Why-care line | `context.hero.description` ← house.roomCount / hasGarden | Object facts only |
| Primary media | `context.hero.heroMedia` / `primaryMediaUrl` | House media → presentation fallback |
| Video support | `heroMedia.kind === 'video'` | Rendered as `<video>` |

**Hero does not:** dispatch, compose Story/Moves/Outcome/Terminal/AI, interpret Decision Focus into identity, or import Object Package / presentation catalog.

Decision Focus metadata remains on `context.hero` for adapters but is **not rendered** as Hero identity.

---

## Decision Entry CTAs

| CTA | Target |
| --- | --- |
| Prozkoumat dům | `#walkthrough` |
| Podívat se na dispozici | `#floor-plan` |
| Objevit priority | `#priority-experience` |

---

## Modified modules

- `sections/Hero/Hero.tsx`, `HeroContent.tsx`, `HeroImage.tsx`, `HeroSurface.tsx`
- `sections/Hero/HeroDecisionEntries.tsx` (new; replaces `HeroCTA.tsx`)
- `runtime/synchronizedExperience.ts` — object-stable Hero projection
- `pilotVocabulary.ts` — `floorPlan` section id
- `FloorPlanExplorer.tsx` — scroll anchor
- Tests + docs

---

## Validation

| Check | Result |
| --- | --- |
| Typecheck | **PASS** |
| Tests | **PASS** — 26/26 |
| No interpretation in Hero | Guard test **PASS** |
| Desktop screenshot | [assets/cscb-02-hero-desktop.png](./assets/cscb-02-hero-desktop.png) |
| Mobile screenshot | [assets/cscb-02-hero-mobile.png](./assets/cscb-02-hero-mobile.png) |

---

## Slice consumption

| CSCB-02 estimate | This slice |
| --- | --- |
| 5 slices | 1 (SR-002 Hero) |

Remaining CSCB-02: Property Explorer, galleries, documents, specifications.

---

## Follow-up

- CSCB-02 continued — Property Explorer / media / documents  
- Optional: retire unused `SocialProof.tsx` in a cleanup slice  
- Object `type` field on Experience Context if product needs a dedicated typology beyond `construction`
