# CSCB-001 — Client Studio Capability Backlog v1.0

| Field | Value |
| --- | --- |
| **ID** | CSCB-001 |
| **Status** | **IMPLEMENTATION BACKLOG** |
| **Phase** | Application Development |
| **Version** | 1.0 |
| **Date** | 2026-07-22 |
| **Depends on** | [RUNTIME-STATUS](../architecture/RUNTIME-STATUS.md) — **CERTIFIED** · [RAR-001](../architecture/review/RAR-001-runtime-architecture-review.md) |

---

## Context

Runtime Architecture is certified (RAR-001 — PASS WITH COMMENTS).  
Runtime is the canonical semantic foundation of Embed Engine.

Further Runtime restructuring is **out of scope** except defect fixes or ADR-approved evolution.

The project now enters the **Application Development Phase**.

**Primary objective:** deliver the first production-ready Client Studio built entirely on the certified Runtime.

---

## Goal

Implement the first complete Client Studio capable of supporting an end-to-end customer Decision Journey.

The implementation must demonstrate that the certified Runtime can power a complete production experience **without introducing new semantic logic outside Runtime**.

---

## Guiding Principle

Client Studio is **not** a collection of screens.

Client Studio is a collection of **Decision Capabilities**.

Every capability may span multiple UI surfaces while sharing the same Runtime semantics.

---

## Capability Backlog

| ID | Capability | Goal | Runtime dependency | Slices | Status |
| --- | --- | --- | --- | --- | --- |
| [CSCB-01](#cscb-01--application-foundation) | Application Foundation | Complete the application shell | Bootstrap / Runtime init | 4 | **Done** ([report](./client-studio/CSCB-01-application-foundation.md)) |
| [CSCB-02](#cscb-02--object-discovery) | Object Discovery | Understand the property | Read-only Runtime Context | 5 | Pending |
| [CSCB-03](#cscb-03--spatial-navigation) | Spatial Navigation | Spatial exploration | Projection only | 6 | Pending |
| [CSCB-04](#cscb-04--decision-discovery) | Decision Discovery | Capture customer priorities | Decision Signals only | 6 | Pending |
| [CSCB-05](#cscb-05--decision-presentation) | Decision Presentation | Present Runtime conclusions | Presentation only | 4 | Pending |
| [CSCB-06](#cscb-06--ai-assistance) | AI Assistance | Explain Runtime decisions | AI consumes Runtime | 5 | Pending |
| [CSCB-07](#cscb-07--commercial-conversion) | Commercial Conversion | Convert journey to business outcome | Consume Decision Session | 3 | Pending |
| [CSCB-08](#cscb-08--decision-analytics) | Decision Analytics | Measure customer behaviour | Read-only | 4 | Pending |
| [CSCB-09](#cscb-09--production-readiness) | Production Readiness | Pilot deployment readiness | — | 6 | Pending |
| | | | **Total** | **43** | |

---

### CSCB-01 — Application Foundation

**Goal:** Complete the application shell.

**Status:** **Done** — [CSCB-01 report](./client-studio/CSCB-01-application-foundation.md) (SR-001)

**Scope**

- application bootstrap
- Runtime initialization
- routing
- layout
- responsive shell
- loading states
- error boundaries
- navigation

**Estimate:** 4 slices

---

### CSCB-02 — Object Discovery

**Goal:** Allow the user to understand the property.

**Scope**

- Hero
- Property Explorer
- galleries
- media
- documents
- object overview
- specifications

**Runtime dependency:** Read-only Runtime Context.

**Estimate:** 5 slices

---

### CSCB-03 — Spatial Navigation

**Goal:** Allow spatial exploration.

**Scope**

- House Navigator
- Floor selector
- Room navigation
- Hotspots
- Media projection

**Runtime dependency:** Projection only. No semantic ownership.

**Estimate:** 6 slices

---

### CSCB-04 — Decision Discovery

**Goal:** Capture customer priorities.

**Scope**

- Priority Experience
- signal dispatch
- priority weighting
- interaction refinement
- Runtime synchronization

**Runtime dependency:** Decision Signals only.

**Estimate:** 6 slices

---

### CSCB-05 — Decision Presentation

**Goal:** Present Runtime conclusions.

**Scope**

- Decision Terminal
- Decision Story
- recommendations
- summary
- report

**Runtime dependency:** Presentation only.

**Estimate:** 4 slices

---

### CSCB-06 — AI Assistance

**Goal:** Explain Runtime decisions.

**Scope**

- AI Advisor
- AIContext
- Runtime explanations
- conversation
- contextual recommendations

**Runtime dependency:** AI consumes Runtime. AI creates no semantics.

**Estimate:** 5 slices

---

### CSCB-07 — Commercial Conversion

**Goal:** Convert Decision Journey into business outcome.

**Scope**

- Lead Capture
- CTA
- forms
- validation
- CRM integration

**Runtime dependency:** Consume Decision Session only.

**Estimate:** 3 slices

---

### CSCB-08 — Decision Analytics

**Goal:** Measure customer behaviour.

**Scope**

- telemetry
- analytics events
- Decision Session metrics
- engagement
- conversions

**Runtime dependency:** Read-only.

**Estimate:** 4 slices

---

### CSCB-09 — Production Readiness

**Goal:** Prepare Client Studio for pilot deployment.

**Scope**

- UX polish
- accessibility
- performance
- responsiveness
- smoke testing
- production validation
- pilot checklist

**Estimate:** 6 slices

---

## Architectural Constraints

Mandatory Runtime invariants:

1. Runtime remains the sole semantic authority.
2. Presentation performs projection only.
3. Providers transport Runtime context only.
4. AI consumes Runtime semantics only.
5. No capability may introduce semantic composition outside Runtime.
6. All Decision Sessions originate exclusively from Runtime.

Further Runtime changes: **defects or ADR-approved evolution only** ([RUNTIME-STATUS](../architecture/RUNTIME-STATUS.md)).

---

## Acceptance Criteria

Client Studio is implementation-complete when:

- [ ] every capability is implemented
- [ ] every capability operates on the certified Runtime
- [ ] no semantic logic exists outside Runtime
- [ ] the complete Decision Journey functions end-to-end
- [ ] a pilot customer can complete the full experience from object discovery to lead conversion

---

## Deliverables (per capability)

For each completed capability provide:

1. Implementation summary
2. Modified modules
3. Runtime interaction description
4. Validation results
5. Slice consumption
6. Follow-up recommendations (if any)

Capability reports live under `docs/implementation/client-studio/` (one file per CSCB-XX when closed).

---

## Commit Strategy

Commit after each completed capability.

```text
feat(client-studio): implement CSCB-XX <capability-name>
```

---

## Expected Outcome

Completion of CSCB-001 marks the first production-ready Client Studio built entirely on the certified Runtime and establishes the reference implementation for all future Runtime-powered applications, including Manager Studio and Sales Studio.

---

## Related

- [RUNTIME-STATUS.md](../architecture/RUNTIME-STATUS.md)
- [RAR-001](../architecture/review/RAR-001-runtime-architecture-review.md)
- [Engineering Debt](./Engineering%20Debt.md)
- [Frontend implementation guide](./frontend-implementation-guide.md)
- [Engineering playbook](./engineering-playbook.md)
