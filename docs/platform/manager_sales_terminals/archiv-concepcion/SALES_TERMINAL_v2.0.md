# SALES_TERMINAL
## Embed Engine Sales Terminal
### Version 2.0 (Concept Draft)

# Mission

The Sales Terminal helps transform Runtime knowledge into the next meaningful sales action.

Primary question:

> What should happen next?

---

# Design Principles

- Runtime owns meaning.
- Sales never invents customer intent.
- Every recommendation must be traceable to Runtime.
- The salesperson augments the journey; they do not replace it.

---

# Information Architecture

1. Home
2. Decision Identity
3. Decision Journey
4. Signals
5. AI Copilot
6. Opportunities
7. Tasks & Follow-ups
8. Activity Timeline

---

# Core Views

## Decision Identity Card

Shows:
- identity
- current stage
- confidence
- active priorities
- engagement score

## Decision Journey

Visual timeline of:
- sessions
- stories
- outcomes
- changes over time

## Signals

Runtime-derived:
- priority shifts
- hesitation
- engagement
- revisit frequency
- AI confidence

## AI Copilot

Provides:
- summary
- reasoning
- recommended next action
- suggested questions
- communication tips

## Opportunity Workspace

Instead of a CRM pipeline, opportunities are represented as evolving Decision Journeys.

## Follow-up Center

Schedules:
- calls
- emails
- reminders
- meetings

All linked back to Decision Identity.

---

# Navigation

Home
├── Identity
├── Journey
├── Signals
├── AI
├── Opportunities
└── Timeline

---

# Success Metrics

- Time to first contact
- Follow-up completion
- Journey progression
- Opportunity conversion
- AI recommendation acceptance

---

# Architectural Invariants

- No duplicated Runtime state.
- Every recommendation references Runtime.
- Timeline is a projection.
- AI is advisory only.
- Sales actions feed Runtime as events.

---

# Vision

The Sales Terminal becomes a decision coaching environment rather than a traditional CRM.
