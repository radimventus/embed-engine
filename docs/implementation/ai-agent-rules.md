# AI Agent Rules

Version: 1.0

Status: Mandatory

---

# Purpose

This document defines the mandatory behaviour of AI coding assistants working on EMBED Platform.

These rules override implementation preferences.

If uncertain, always choose the simpler implementation.

The goal is not to write more code.

The goal is to deliver a product that can be shown to the first paying customer.

---

# Read Order

Always read these documents before implementing anything:

1. Engineering Playbook (`docs/implementation/engineering-playbook.md`)
2. Post-Foundation Development Policy (`docs/product/post-foundation-development-policy.md`)
3. Product Vision (`docs/product/vision/product-vision.md`)
4. Product Constitution (`docs/product/constitution/product-constitution.md`)
5. Client Studio Geometry Specification (`docs/design/geometry/client-studio-geometry-spec.md`)
6. Embed Engine Design Language (`docs/design/language/embed-engine-design-language-v1.md`)
7. Frontend Implementation Guide (`docs/implementation/frontend-implementation-guide.md`)
8. Relevant Wireframe

See also `docs/README.md` and `docs/PROJECT-MAP.md`.

Follow the Playbook AI Agent Workflow and Decision Gate before proposing changes.

Architecture freeze areas require an ADR before change.

Implementation must follow this order.

---

# Product Philosophy

Build products.

Not demos.

Not experiments.

Not architecture for its own sake.

Every sprint must move the project closer to production.

---

# MVP First

Prefer the smallest implementation that satisfies the wireframe.

Do not implement future requirements.

Do not build infrastructure before it is needed.

Avoid premature abstraction.

---

# Screen-first Development

Implement one screen at a time.

Never implement multiple roadmap sections unless explicitly requested.

Each screen must be independently reviewable.

---

# Geometry

Never invent layout.

Never invent spacing.

Never invent proportions.

Never modify geometry without updating the Geometry Specification.

The **design wireframe** is the authority for correct layout geometry.

DOM metrics (`offsetHeight`, `computedHeight`, CSS values) prove implementation consistency only — they do not prove design correctness.

If render deviates from the wireframe, investigate React/Tailwind/layout — not the reference artifact.

Do not question wireframe scale or provenance unless direct proof of reference error exists.

Always follow:

Client Studio Geometry Specification.

---

# UX

Never invent UX.

Never redesign the wireframe.

Never add new interactions.

Never remove existing interactions.

Implement exactly what is specified.

---

# Components

Prefer composition.

Do not create shared components unless explicitly requested.

Keep components close to the feature that owns them.

---

# Styling

Always use Design Tokens.

Never hardcode:

- colors
- spacing
- typography
- border radius

Avoid inline styles.

---

# State

Prefer local React state.

Avoid global state during MVP.

Avoid unnecessary context providers.

---

# Backend

Do not create APIs.

Do not implement authentication.

Do not implement persistence.

Do not implement analytics.

Do not implement telemetry.

Unless explicitly requested.

---

# AI

Do not implement AI providers.

Do not connect LLM APIs.

Use placeholders when appropriate.

The UI comes first.

The intelligence comes later.

---

# Build Quality

Every sprint must:

✓ compile

✓ build successfully

✓ introduce no console errors

✓ preserve existing behaviour

---

# Deliverables

Every sprint must include:

- files changed
- architectural decisions
- build result
- screenshot (desktop)
- technical debt
- deviations from wireframe

---

# Review Question

At the end of every sprint answer:

"Could this be shown to a client tomorrow?"

If not,

explain exactly what is missing.

---

# Golden Rules

Never invent.

Never redesign.

Never over-engineer.

Prefer composition over abstraction.

Prefer working software over elegant architecture.

Every decision must help reach the first paying customer within 30–60 days.

