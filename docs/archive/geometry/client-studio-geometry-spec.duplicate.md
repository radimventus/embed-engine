# Client Studio Geometry Specification

**Version:** 1.0

**Status:** Single Source of Truth (SSOT)

---

# Purpose

This document defines the spatial system of Client Studio.

It does not define:

- visual design
- typography
- colors
- business logic
- functionality

It defines the immutable geometric rules that every screen, row and component must follow.

Wireframes describe **what** should be built.

This document defines **how the layout is constructed**.

---

# 1. Design Philosophy

Client Studio is not a website.

Client Studio is not a dashboard.

Client Studio is not an administration panel.

Client Studio is a guided customer journey presented inside one continuous workspace.

Users should never feel that they navigate between different pages.

Instead, they move through one coherent visual experience.

Every screen belongs to one uninterrupted spatial composition.

---

# 2. Workspace

Workspace is the outer environment.

Workspace:

- fills the browser viewport
- provides the neutral background
- never defines layout
- never defines spacing
- never constrains content

Workspace exists only to host the Canvas.

---

# 3. Canvas

Canvas is the only layout authority.

Canvas defines:

- application width
- horizontal alignment
- spatial rhythm
- page geometry

No component may define its own page width.

No section may override Canvas geometry.

All rows inherit their geometry from the Canvas.

---

# 4. Sidebar

Sidebar belongs to the Workspace.

It is not part of the Canvas.

Navigation must never influence Canvas dimensions or alignment.

Changing navigation should never require changing layout.

---

# 5. Reference System

Reference design size:

**1600 × 900 px**

This is not a responsive breakpoint.

It is the reference coordinate system used when designing Client Studio.

All proportions originate from this reference.

---

# 6. Spatial Grid

Client Studio uses one universal spatial grid.

There are no individual grids for:

- Hero
- Property Explorer
- Priority Engine
- AI Advisor
- Audit
- Lead Capture

Every component is positioned inside one shared geometry system.

---

# 7. Layout is Built from Rows

Pages are composed from rows.

Not from isolated sections.

Example:

Row 01

Hero

Row 02

Social Proof

Row 03

Property Explorer

Row 04

Priority Engine

Row 05

AI Advisor

Row 06

Audit & Lead Capture

Components always exist inside rows.

Rows define layout.

Components define content.

---

# 8. Row Types

Only three row types exist.

## Type A

Single column

100%

Typical usage:

- Hero
- Full-width content
- Footer

---

## Type B

Two equal columns

50% / 50%

Typical usage:

- Property Explorer
- Priority Engine
- AI Advisor
- Audit & Lead Capture

Different proportions require explicit approval.

---

## Type C

Three equal columns

33% / 33% / 33%

Typical usage:

- Social Proof

---

# 9. White Space

White Space is part of the layout.

It is never considered unused space.

White Space provides:

- hierarchy
- readability
- confidence
- rhythm
- focus

Empty space must never be filled simply because it exists.

---

# 10. Consistent Internal Spacing

Every row follows the same internal spacing rules.

Unless explicitly specified, all rows inherit identical:

- left padding
- right padding
- top padding
- bottom padding

Components should never invent their own outer spacing.

---

# 11. Vertical Rhythm

Every row follows the same internal hierarchy.

Section Title

↓

Primary Content

↓

Secondary Content

↓

Primary Action

This rhythm remains consistent throughout the application.

---

# 12. Alignment

Alignment is geometric.

Never optical.

Rules:

- titles align horizontally
- left edges align
- right edges align
- controls align whenever possible
- visual rhythm is more important than optical centering

---

# 13. Component Responsibility

Business components own content.

Layout primitives own geometry.

Components must never define:

- page width
- outer spacing
- row proportions
- canvas alignment

Components remain interchangeable.

Layout remains unchanged.

---

# 14. Responsive Behaviour

Desktop layout does not scale.

As viewport width decreases:

1. Workspace margins shrink.
2. Canvas remains unchanged.
3. Responsive breakpoint is reached.
4. Layout is recomposed for tablet/mobile.

Content should never scale simply because the browser becomes smaller.

Whitespace disappears first.

---

# 15. Visual Hierarchy

Every row contains:

1. Section Title
2. Primary Object
3. Secondary Object
4. Primary Action

This hierarchy is consistent across the entire product.

---

# 16. Visual Weight

Visual weight is intentionally asymmetric.

The left side usually contains:

- imagery
- galleries
- plans
- cards
- exploration

The right side usually contains:

- explanation
- recommendation
- AI assistance
- forms
- decisions

This information hierarchy should remain consistent across the platform.

---

# 17. Geometry Ownership

Geometry belongs to the layout system.

Never to business components.

Changing content must never require changing layout.

Replacing one component with another should not affect page geometry.

---

# 18. Platform Compatibility

This geometry system is platform-wide.

It is intended for:

- Client Studio
- Builder Studio
- Admin Studio

Future applications should reuse the same spatial principles whenever possible.

---

# Golden Rule

**Components are replaceable.**

**Geometry is immutable.**