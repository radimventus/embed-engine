
# OPERATIONS_TERMINAL
## Embed Engine Operations Terminal (Manager Studio)
### Version 1.0 (Draft)

# Mission

The Operations Terminal helps an operator understand what has changed, why it changed, and what should happen next.

Its primary question is:

> What changed since my last visit?

---

# Runtime Position

Knowledge
↓
Runtime
↓
Projection (Operations)
↓
Operations Terminal

The terminal never creates interpretations.

---

# Primary Responsibilities

- Observe Runtime activity
- Surface meaningful changes
- Prioritize operational attention
- Enable operational actions
- Return actions to Runtime

---

# Information Architecture

## 1. Live Overview
Current system state.

## 2. Timeline
Chronological Runtime events.

## 3. Active Decision Journeys
Sessions currently in progress.

## 4. Attention Queue
Items requiring human attention.

## 5. Operational Insights
Patterns generated from Runtime.

## 6. Actions
Assign, contact, investigate, resolve.

---

# Core Widgets

- Live Activity Feed
- Timeline
- Journey Monitor
- Identity Monitor
- Alert Center
- AI Operations Summary
- Task Queue

---

# Runtime Events

Examples:

- DecisionStarted
- DecisionCompleted
- PriorityChanged
- StoryUpdated
- LeadCreated
- IdentityRecognized
- AIRecommendationGenerated

---

# Terminal Grammar

Context
→ Current operational state

Narrative
→ Timeline of change

Insight
→ Why it matters

Action
→ What to do next

---

# Success Metrics

- Time to detect important changes
- Time to first action
- Unresolved attention items
- Active journeys
- AI recommendation acceptance

---

# Architectural Rules

- Runtime owns semantics.
- Timeline is a projection.
- Alerts are projections.
- AI summaries are Runtime-derived.
- Operations never duplicates Runtime state.

---

# Vision

The Operations Terminal becomes the operational nervous system of the Embed Engine platform, presenting a continuously updated projection of Runtime instead of a traditional dashboard.
