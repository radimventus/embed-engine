# ADR-007 — Priority MVP Policy (Closed Open Questions)

**Status:** Accepted  
**Date:** 2026-07-20  
**Depends on:** Living Experience v0.1 Freeze, ADR-002, ADR-003  
**Scope:** Priority weight model, multi-user collaboration, DecisionState persistence for Pilot / MVP

This ADR formally closes three historical Priority “Open Questions”.  
It does **not** change Runtime, DecisionState shape, or Interpretation fields.

---

# Context

Living Experience v0.1 is frozen. Priority research left three ambiguities that must not remain open for Pilot / MVP:

1. Absolute vs relative Priority weights  
2. Multi-user / couple Priorities  
3. Priority / DecisionState persistence  

Current code already behaves as independent weights, single visitor Focus, and in-memory Runtime state. This ADR makes that behavior the **official policy**.

---

# Decision summary

| # | Question | MVP decision | Status |
| --- | --- | --- | --- |
| 1 | Absolute vs relative weights | **Absolute / independent weights** (Option A) | **Accepted** |
| 2 | Multi-user / couple Priorities | **Single-visitor DecisionState only** | **Postponed** (not MVP) |
| 3 | Persistence | **Active Experience only** (Runtime memory) | **Accepted** |

---

# Question 1 — Absolute vs relative weights

## Options

| Option | Meaning |
| --- | --- |
| **A — Absolute (independent)** | Each Priority has its own weight in `[0, 1]` (UI may show 0–100%). Weights need not sum to 1. |
| **B — Relative (fixed budget)** | All Priorities share one budget; sum of weights = 100% at all times. |

## MVP selection

**Option A — Absolute / independent weights.**

### Why

1. **Matches Living Experience v0.1** — `project()` elevates Focus targets independently (`BASE_WEIGHT`, room→layout, media→design, question→1.0) without renormalizing the set.  
2. **Pilot clarity** — A first-time visitor can see several priorities rise together (“Layout 92 and Design 90”) without an invisible tax on other cards.  
3. **Signal fidelity** — One Signal raises meaning; it does not force artificial demotion of unrelated Priorities.  
4. **Simpler MVP architecture** — No budget allocator in `reduce` or `project`; Behavior Packs can tune absolute elevation rules first.

### Product assumptions

- The Pilot proves **one intelligence reacting**, not a finished preference-allocation instrument.  
- Priority cards communicate **emphasis**, not a constrained investment portfolio.  
- Couples negotiating trade-offs are **out of MVP scope** (see Question 2).

### Architectural consequences

- `Interpretation.priorities[].weight` remains an independent scalar.  
- Ranking / highlight are derived comparisons, not evidence that weights form a simplex.  
- UI progress heuristics (e.g. “selected if weight > 0.5”) are presentation rules, not a budget model.  
- Introducing Option B later requires an **explicit new ADR** (and likely Behavior Pack + projector changes), not a silent UI tweak.

### Alternative backlog

Option B remains **Post-MVP / Future research** as a possible couple-negotiation or advisor-calibration mode — see backlog. It is **Rejected for MVP**, not rejected forever.

---

# Question 2 — Multi-user / couple Priorities

## Scenarios considered

- Husband + wife (joint purchase)  
- Family (multiple stakeholders)  
- Advisor + customer (guided selling)

## MVP selection

**Collaborative decision-making is not part of MVP.**

**Status: Postponed.**

### Why

1. Living Experience v0.1 assumes **one Focus** inside **one DecisionState** for one active Experience.  
2. Pilot success metric is synchronized Priority / FAQ / AI for a **single visitor journey**.  
3. Multi-actor models introduce conflicts, merge policy, identity, and UX that would redesign cognitive semantics — forbidden without a new ADR.  
4. Commercial Pilot value does not depend on couple co-editing in v0.1.

### Explicit postponement

| In MVP | Not in MVP |
| --- | --- |
| One visitor → one DecisionState → one Interpretation | Parallel Priority sets per person |
| One Focus attention | Merge / vote / veto of Priorities |
| Advisor may **observe** the same Experience | Advisor as a second cognitive actor with separate weights |

### Future architecture (not designed here)

Would likely require a dedicated ADR covering at least:

- Participant / actor identity (who emitted the Signal)  
- Whether multiple Focus streams exist or one shared Focus  
- Conflict aggregate policy when actors disagree  
- Projection rules for “household Interpretation” vs per-person views  
- Session / persistence implications for shared Experiences  

Until that ADR exists, implementers must **not** invent multi-user Priority logic in React or `project()`.

---

# Question 3 — Persistence

## Options evaluated

| Option | MVP? |
| --- | --- |
| DecisionState only in active Runtime | **Yes — selected** |
| Browser session only (explicit session store) | No |
| LocalStorage restore | No |
| URL-encoded DecisionState | No |
| Backend persistence | No |

## MVP selection

**DecisionState lives only during the active Experience.**

It is held in Cognitive Runtime memory for the lifetime of the loaded Experience.  
Reload, new tab, or Runtime `destroy` starts a **fresh** DecisionState (via `load` → `createInitialDecisionState` → `project`).

**Status: Accepted.**

### Why

1. Aligns with CORE-001: Persistence is **outside** the Cognitive Layer.  
2. Pilot proves reaction quality, not resume / CRM continuity.  
3. Avoids premature schema, privacy, and restore-conflict design.  
4. Keeps debugging deterministic: empty Focus → known initial Interpretation.

### Explicit rejections for MVP

- **LocalStorage** — Rejected for MVP (silent restore would hide Signal→Interpretation causality).  
- **URL state** — Rejected for MVP (leaks decision process; couples poorly with Signal history).  
- **Backend persistence** — Rejected for MVP (product/ops surface beyond Pilot).

### Post-MVP note

Optional **session restore** or **backend DecisionState** may be proposed later via ADR. They must not mutate the pipeline order; they may only rehydrate DecisionState before `project()`.

---

# Distinctions locked by this ADR

| Class | Items |
| --- | --- |
| **MVP decisions** | Independent weights; single visitor; in-memory active Experience only |
| **Postponed** | Multi-user / couple Priority collaboration; relative weight budget mode |
| **Future research** | Household merge semantics; advisor-as-actor; durable Priority profiles across sessions |

---

# Consequences

- No architectural ambiguity remains for these three questions in Priority MVP.  
- Behavior Packs may change **how** absolute weights are elevated; they may not switch to a sum=100% model without a new ADR.  
- Product Bible archive is **not** rewritten; living product docs point here as SSOT for Priority MVP policy.

---

# Related

- [Living Experience v0.1 Freeze](../living-experience-v0.1-freeze.md)  
- [Behavior Pack Contract](../behavior-pack-contract.md)  
- [Product Backlog](../../product/backlog/PRODUCT_BACKLOG.md)  
- [CORE-001 Cognitive Layer](../core/CORE-001-cognitive-layer.md)
