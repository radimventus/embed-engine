# Frontend Implementation Guide

Version: 1.0

Status: Single Source of Truth (SSOT)

---

# Purpose

This document defines how Client Studio and future EMBED applications must be implemented.

It complements:

- Product Bible
- Client Studio Geometry Specification
- Client Studio Design Language

This document defines implementation rules.

Not product strategy.

Not visual design.

---

# 1. General Principles

Implementation must always follow this priority:

1. Product Bible
2. Geometry Specification
3. Design Language
4. Wireframes
5. This document

Implementation must never redefine product behaviour.

---

# 2. Development Philosophy

Build the smallest possible implementation that faithfully represents the product.

Never build infrastructure before it becomes necessary.

Never optimize for hypothetical future requirements.

Always optimize for delivering customer value.

---

# 3. Screen-first Development

Applications are built screen by screen.

Never implement complete modules in advance.

Each sprint should produce one complete, reviewable screen.

Every completed screen should be demonstrable to a client.

---

# 4. Component Philosophy

Every screen is composed from reusable components.

Components must be:

- isolated
- reusable
- composable
- predictable

Avoid inheritance.

Prefer composition.

---

# 5. Layout Ownership

Geometry belongs exclusively to layout primitives.

Business components never control:

- page width
- page alignment
- outer spacing
- canvas positioning

Business components only render content.

---

# 6. Folder Structure

Use feature-based architecture.

Example:

src/

features/

client-studio/

sections/

Hero/

MediaExplorer/

HouseNavigator/

PriorityEngine/

AIAdvisor/

LeadCapture/

Components should remain close to the feature that owns them.

Do not create shared components prematurely.

---

# 7. Naming

Components:

PascalCase

Example:

Hero.tsx

PriorityCard.tsx

Conversation.tsx

Hooks:

camelCase

Example:

useConversation()

Files should describe the rendered component.

Avoid generic names.

---

# 8. State Management

Prefer local state.

Introduce shared state only when necessary.

Avoid global state during MVP.

React state is preferred.

No premature stores.

---

# 9. Styling

Never hardcode colors.

Always use Design Tokens.

Never hardcode spacing.

Never hardcode typography.

Avoid inline styles.

Prefer utility classes.

---

# 10. Responsiveness

Desktop-first.

Geometry follows Geometry Specification.

Mobile layout is a recomposition.

Never simply shrink desktop UI.

---

# 11. Accessibility

Every interactive element must be keyboard accessible.

Buttons must be buttons.

Inputs must have labels.

Visible focus indicators are required.

Semantic HTML is preferred.

---

# 12. Performance

Lazy load only when beneficial.

Avoid unnecessary abstractions.

Optimize images.

Avoid unnecessary rerenders.

Keep bundle size reasonable.

---

# 13. AI Implementation Rules

AI assistants must never invent:

- spacing
- colors
- typography
- layout
- hierarchy

Always use existing:

- Design Tokens
- Geometry Specification
- existing components

Never create a new component if an existing one satisfies the requirement.

---

# 14. Placeholder Strategy

During MVP it is acceptable to use placeholders.

Placeholders must clearly indicate future functionality.

Example:

"AI response will be implemented in a later phase."

Do not fake functionality.

---

# 15. Technical Debt

Every sprint must explicitly report:

- known limitations
- intentional simplifications
- postponed work

Never silently introduce technical debt.

---

# 16. Definition of Done

A screen is complete when:

✓ matches approved wireframe

✓ follows Geometry Specification

✓ follows Design Language

✓ builds successfully

✓ contains no placeholder layout outside approved scope

✓ introduces no unnecessary abstractions

✓ can be demonstrated to a client

---

# 17. Review Checklist

Every implementation must answer:

Does it match the wireframe?

Does it follow Geometry Specification?

Does it follow Design Language?

Could it be shown to a customer tomorrow?

If not,

what is missing?

---

# 18. Future Evolution

Client Studio is the reference implementation.

Builder Studio

Admin Studio

Future applications

should reuse the same implementation principles whenever possible.

---

# Golden Rules

Never invent UX.

Never invent layout.

Never invent business logic.

Prefer composition over abstraction.

Prefer simplicity over flexibility.

Prefer working software over perfect architecture.

Every sprint must move the product closer to the first paying customer.