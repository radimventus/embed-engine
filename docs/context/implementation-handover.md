# CONTEXT — P-001 / CAP-P01
# Embed Engine

_Last update: po Architecture Freeze A-004_

---

# Aktuální stav projektu

Architektura platformy byla během posledních dní stabilizována.

Proběhly dva zásadní Architecture Freeze workshopy:

- A-003 Decision Layer
- A-004 Decision Strategy

Oba byly přijaty jako nové SSOT.

Architektura se nyní považuje za stabilní.

Další práce se přesouvá z návrhu architektury na tvorbu prvního kompletního pilotního produktu.

---

# Poslední přijaté commity

Decision Layer

SHA

2a19b4fd4997c274605d13a79c7aee8acf8f568e

Commit

docs(architecture): freeze Decision Layer architecture

---

Decision Strategy

SHA

f0e6dbdede803dbde0531f06d8585b8e3338d0ab

ADR-010 Accepted

SSOT

docs/architecture/decision-layer/decision-strategy.md

---

# Frozen Architecture

Knowledge Layer

- Object Package
- Behavior Pack

↓

Kernel

Signal

↓

reduce()

↓

Decision State

↓

project()

↓

Interpretation

↓

Decision Layer

Decision Strategy

↓

Decision Story

↓

Decision Move

↓

Experience Layer

Decision Terminal

↓

Experience

Priority

FAQ

AI Advisor

Recommendation

...

---

# Canonical Definitions

## Object Package

Represents the object.

Contains structured object data only.

No reasoning.

---

## Behavior Pack

Provides:

- domain knowledge
- reasoning rules
- recommendation rules
- Decision Move library
- Story composition rules

Behavior Pack NEVER modifies UI.

---

## Kernel

Produces Decision State.

Projects Interpretation.

Never creates Experiences.

Never creates Stories.

---

## Interpretation

Explains the current decision state.

Nothing more.

---

## Decision Strategy

Transforms

Interpretation

+

Behavior Pack

↓

Decision Story

Single responsibility.

Owns continuation.

May later consume Decision Trajectory.

---

## Decision Story

Ordered sequence of Decision Moves.

Stories are selected and/or composed by Strategy.

No Stages.

No Chapters.

No Acts.

Optional Move intents only.

---

## Decision Move

Smallest guided step capable of changing the user's decision state.

Domain primitive.

Not UI.

Not React.

Not Component.

Moves expose:

- eligibility
- completion

Moves NEVER decide what comes next.

---

## Decision Terminal

Experience Surface.

Renders Decision Story.

Lives inside Experience Layer.

---

## Decision Trajectory

Future Architecture.

Not part of MVP.

Optional future input for Strategy.

---

# Locked Principles

Kernel never creates Experiences.

Experience never performs reasoning.

Only Decision Strategy transforms Interpretation into Decision Story.

Only Decision Story organizes Decision Moves.

Only Decision Moves interact with the user.

---

# Remaining Open Risks

R1

Strategy host

R2

Story transport

R3

Eligibility DSL

R4

Completion Signals

R5

Priority ↔ Move relationship

R6

AI vs Decision Terminal

R7

packages/decision naming collision

R8

Decision Trajectory schema

These remain intentionally unresolved.

Do NOT solve them during P-001.

---

# Current Product Direction

Architecture phase is considered complete enough.

Current focus:

Build the first complete Decision Experience.

The architecture should now be validated through a real object.

Not by creating more abstractions.

---

# P-001

First Complete Decision Experience

Goal

Prove that the complete Decision Pipeline works end-to-end.

Success means:

Object Package

↓

Behavior Pack

↓

Interpretation

↓

Decision Strategy

↓

Decision Story

↓

Decision Moves

↓

Decision Terminal

↓

Decision Outcome

without hardcoded business logic outside Behavior Pack.

---

# CAP-P01

Pilot Object + Behavior Pack

Current milestone.

Mission

Create the first production-quality knowledge model for one real family house.

Deliverables

- Pilot Object
- Behavior Pack
- Decision knowledge
- Recommendation rules
- Trade-offs
- Decision Move library
- Story composition rules

No Runtime implementation.

No UI implementation.

No architecture redesign.

---

# Next planned milestones

CAP-P02

Decision Experience

Design the first complete Story.

---

CAP-P03

Runtime Integration

Connect the complete pipeline.

---

CAP-P04

Pilot Validation

Run with a real user.

Measure decision quality.

---

# Product Philosophy

Embed Engine is NOT a system that displays information about an object.

Embed Engine is a platform that composes and orchestrates a decision dialogue between a human and an object.

Architecture exists only to support better decision making.

Whenever architecture and product value conflict,

prefer product value.

---

# Working Rule

Every new document should help one real buyer make one real decision better.

If it does not,

it probably does not belong in the current milestone.
