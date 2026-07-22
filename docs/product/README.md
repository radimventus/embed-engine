# Product documentation

Active product SSOT lives here.

| Path | Role |
| --- | --- |
| `constitution/` | Product principles, flywheel, moat, governance, CTO principles |
| `vision/` | Executive summary, vision, business model, founder vision |
| **`decision-experience-grammar/`** | **Decision Experience Grammar (DEG) — product layer SSOT** |
| **`Priority Experience Bible.md`** | **Priority Experience — filozofie, principy, jazyk, MVP Journey** |
| **`Priority Decision Journey Blueprint.md`** | **Univerzální kostra všech Priority Journey (fáze + kontrakty)** |
| **`Priority Experience Content Model.md`** | **Obsahová vrstva Priority Experience (texty, tón, locale, AI rules)** |
| **`../architecture/Priority Experience Integration Model.md`** | **Integrace product + runtime vrstev Priority Experience** |
| **`../architecture/domain/Priority Domain Model.md`** | **Doménový model Priority Experience (entity, invarianty, agregáty)** |
| **`../architecture/contracts/Priority Experience Runtime Contract.md`** | **Runtime kontrakt Kernel/Interpretation ↔ Priority Experience** |
| **`content/priority-garden.md`** | **Garden Decision Journey — referenční obsahový scénář (první Priority)** |
| **`decision-journey/`** | **Decision Journey Specification (DJS) — UX-001 Proposed draft** |
| `object-package.md` | Object Package product contract (SSOT) |
| **`../03-specification-standard/HP-001-House-Package-Specification.md`** | **House Package distribution contract (logical + physical + `house.json`)** |
| **`../architecture/pt/PT-001-house-package-canonical-object-contract.md`** | **Platform theory — House Package as canonical object contract** |
| **`../architecture/pt/PT-002-interpretation-is-the-product.md`** | **Platform theory — Interpretation is the product** |
| **`../architecture/pt/PT-003-decision-sessions-are-reproducible.md`** | **Platform theory — Decision Sessions are reproducible** |
| **`../architecture/pt/PT-004-decision-story-is-the-product.md`** | **Platform theory — Decision Story is the product** |
| `knowledge/` | Knowledge Foundation (SSOT) |
| `pilots/` | Pilot Foundation (SSOT process) |
| `../pilot/` | **CAP-P01 knowledge model** — first Pilot Object + Behavior Pack |
| `post-foundation-development-policy.md` | Post-Foundation development policy (SSOT) |
| `builder/` | Builder product spec and workflow SSOT |
| `backlog/` | Product backlog (reaction-driven) |

**First pilot knowledge (CAP-P01):** [`../pilot/README.md`](../pilot/README.md) — Object `house-modern-01` + Behavior Pack `disposition-layout-v1`.

---

## Decision Experience Grammar (product layer)

**Canonical source:** [`decision-experience-grammar/DEG.md`](./decision-experience-grammar/DEG.md)

After architecture stabilization, product evolution is **DEG-led**:

```text
Product Vision → DEG → DJS (journey) → Decision Story → Experience Chapters → Modules → UI → Runtime
```

**Decision Journey (Proposed):** [`decision-journey/DJS.md`](./decision-journey/DJS.md) — UX-001 trajektorie mentální změny jedné návštěvy.

Canonical product criterion:

> We do not want the best real-estate configurator.  
> We want the best environment for changing a decision.

---

## Decision Layer (architecture vocabulary)

**Canonical source:** [`../architecture/decision-layer/README.md`](../architecture/decision-layer/README.md)

| Concept | One-line (link only — full text in SSOT) |
| --- | --- |
| Decision Move | Smallest guided step that can change the user's decision state |
| Decision Story | Ordered sequence of Decision Moves |
| Decision Strategy | Orchestration layer that composes the active Decision Story |
| Decision Terminal | Experience Surface that renders Decision Stories |
| Decision Trajectory | Future Architecture — not MVP |
| Behavior Pack | Knowledge, rules, Move library, composition — **not** UI |

**Governance:** [`../architecture/decision-layer/decision-layer-governance-v1.md`](../architecture/decision-layer/decision-layer-governance-v1.md)  
**Priority MVP:** [`../architecture/adr/ADR-007-priority-mvp-policy.md`](../architecture/adr/ADR-007-priority-mvp-policy.md)

## Product Bible

Historical monolith: [`../archive/product-bible/PRODUCT-BIBLE.md`](../archive/product-bible/PRODUCT-BIBLE.md)

**Active Product Bible product layer:** [Decision Experience Grammar](./decision-experience-grammar/DEG.md)

**Priority Experience SSOT:** [Priority Experience Bible](./Priority%20Experience%20Bible.md)

Canonical positioning (validated):

> Embed Engine is an interpretation platform that transforms structured facts about an object into a personalized Decision Experience.

Canonical pipeline:

```text
Object → PrioritySelection → ExperienceComposer → Experience → Renderer(s)
```

**Not authoritative** (historical Bible) for Decision Layer vocabulary, DEG, or interpretation-vs-presentation ownership. Where the archive says “right panel”, “Priority Detail”, or page-builder flows, prefer DEG + Decision Layer SSOT / ADR-007–010.
