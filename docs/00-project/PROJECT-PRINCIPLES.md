# Project Principles

Project Principles define how the Embed Engine project is managed and prioritized.

They are not architectural decisions.

Changes to Project Principles do not require ADR unless they modify the Reference Architecture itself.

---

# PP-001 — Pilot First

| Field | Value |
| --- | --- |
| **Status** | Active |
| **Owner** | Project |
| **Phase** | Pilot |
| **Date** | 2026-07-21 |
| **Formerly** | ADR-013 (reclassified — not an architectural decision) |

## Context

Embed Engine is in the pilot phase.

The highest project priority is not completing architecture or implementing every planned module.

The highest priority is:

> **Acquire the first paying customer and successfully deliver the pilot.**

The project therefore needs a single prioritization rule.

## Decision

For the duration of the pilot phase, every new feature is judged by the following questions:

1. Does this feature bring us closer to the first paying customer within the next 60–90 days?
2. Is it necessary for successful pilot delivery?
3. Is the cost of delaying it higher than the cost of implementing it today?

If **none** of the answers is **YES**, the feature is:

- not implemented,
- recorded in the roadmap,
- re-evaluated after successful completion of the pilot phase.

## Scope

Applies to all parts of the project:

- Core
- Runtime
- Client Studio
- Priority
- AI
- Revenue
- UX
- Business Dashboard
- all new modules

## Immediate Consequences

### Implement

- features required for the pilot,
- stability,
- client onboarding,
- sales support,
- basic reporting,
- a simple financial model.

### Defer

- Revenue Engine,
- advanced simulations,
- AI predictions,
- behavioral analytics,
- enterprise features,
- optimizations without direct pilot impact.

## Guiding Principle

> Pilot has priority over expanding the architecture.  
> The Reference Architecture MUST remain respected.  
> If a pilot requirement conflicts with the architecture, the conflict MUST be resolved through SDR or ADR before implementation continues.

Architecture must support product delivery — not delay it. The Conceptual Freeze remains in force.

## Success Metric

Every completed sprint MUST demonstrably increase the probability of acquiring the first paying customer or successfully delivering the pilot.
