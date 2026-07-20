# Client Studio Geometry Specification
Version: 1.0

Status: Single Source of Truth (SSOT)

---

# Purpose

This document defines the spatial system of Client Studio.

It does not describe visual design.

It does not describe functionality.

It defines the immutable geometric rules that every screen, section and component must follow.

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

---

# 2. Workspace

Workspace is the outer environment.

Workspace:

- fills the browser
- provides background
- never defines layout
- never defines spacing
- never constrains components

Workspace exists only to host the Canvas.

---

# 3. Canvas

Canvas is the only layout authority.

Canvas defines:

- application width
- horizontal alignment
- page geometry
- spatial rhythm

No component may define its own page width.

No section may override Canvas geometry.

---

# 4. Sidebar

Sidebar belongs to the Workspace.

It is not part of the Canvas.

Changing navigation must never affect Canvas geometry.

---

# 5. Reference System

Reference design size:

1600 × 900 px

This is not a responsive breakpoint.

It is the reference coordinate system used when designing Client Studio.

---

# 6. Spatial Grid

Client Studio uses one universal spatial grid.

There are no individual grids for:

- Hero
- Gallery
- Priority Engine
- AI
- Lead Capture

Every component is placed inside one shared geometry system.

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

Audit & Lead Capture

Components always live inside rows.

---

# 8. Row Types

Only three row types exist.

## Type A

Single column

100%

Used for:

- Hero
- Full-width content
- Footer

---

## Type B

Two columns

50% / 50%

Used for:

- Property Explorer
- Priority Engine
- FAQ + AI Advisor
- Audit & Lead Capture

Different proportions are forbidden unless explicitly approved.

---

## Type C

Three equal columns

33% / 33% / 33%

Used for:

- Social Proof

---

# 9. White Space

White Space is part of the design.

It is never considered unused space.

White Space provides:

- hierarchy
- readability
- visual rhythm
- confidence

Never fill empty space without explicit design intent.

---

# 10. Vertical Rhythm

Every row follows the same internal hierarchy.

Title

↓

Primary Content

↓

Secondary Content

↓

Primary Action

The hierarchy remains identical across the application.

---

# 11. Alignment

Alignment is geometric.

Never optical.

Rules:

- Titles share the same baseline.
- Left edges align.
- Right edges align.
- Bottom controls align whenever possible.

---

# 12. Component Responsibility

Components are responsible only for their own content.

Components never define:

- page width
- page alignment
- outer spacing
- page geometry

Layout primitives own geometry.

Content components own content.

---

# 13. Responsive Behaviour

Desktop layout does not scale.

When viewport width decreases:

1. Workspace margins shrink.
2. Canvas remains unchanged.
3. Only after reaching responsive breakpoint may layout change.
4. Mobile layout is a different composition.

Content must never scale simply because viewport becomes smaller.

---

# 14. Visual Hierarchy

Each row contains:

1. Section Title
2. Primary Object
3. Secondary Object
4. Primary Action

This hierarchy applies to the complete product.

---

# 15. Visual Weight

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

This principle should remain consistent across the entire platform.

---

# 16. Geometry Ownership

Geometry belongs to the layout system.

Never to business components.

Business components must be interchangeable without affecting page geometry.

Changing content must never require changing layout.

---

# 17. Future Compatibility

This geometry system is platform-wide.

It is designed for:

- Client Studio
- Builder Studio
- Admin Studio

Future applications should reuse the same spatial principles whenever possible.

---

# Golden Rule

Components are replaceable.

Geometry is immutable.