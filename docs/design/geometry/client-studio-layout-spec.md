# Client Studio Layout Specification

Version: 1.0

Status: Approved

---

## Purpose

Client Studio is implemented as a desktop workspace.

It is NOT a responsive marketing website.

Desktop layout is the primary implementation.

Responsive behaviour is introduced only below tablet breakpoint.

---

# Source of Truth

Priority order

1. Product Constitution

2. UI Blueprint (SSOT)

3. Wireframes

4. This Layout Specification

No implementation may contradict the wireframes.

---

# Rendering Model

Viewport

↓

AppShell

↓

Workspace

↓

Desktop Canvas

↓

Sections

The Desktop Canvas owns the page geometry.

Individual sections never define page width.

---

# AppShell

Contains

- Top Navigation
- Sidebar
- Workspace

No business content.

---

# Sidebar

Width

48 px

Rules

- fixed width
- fixed position
- never scales
- no shadows
- no radius

---

# Workspace

Workspace fills the remaining viewport.

Background

embed-background-secondary

The workspace never limits content width.

---

# Desktop Canvas

The Desktop Canvas is the white bordered frame.

Rules

- centered
- fixed desktop geometry
- no responsive percentages
- no arbitrary max-width values

Examples of forbidden implementation

❌ max-w-6xl

❌ w-3/4

❌ w-4/5

❌ w-11/12

The Desktop Canvas should visually match the wireframe.

---

# Sections

Desktop Canvas

├── Hero
├── Media Explorer
├── House Navigator
├── Priority Engine
├── AI Advisor
└── Lead Capture

Each section owns only its internal layout.

Sections never define page width.

---

# Borders

Border

1 px

Radius

0

Shadow

None

---

# Layout Rules

Never reserve space for future sections.

Never anticipate future layouts.

Never estimate proportions.

Never redesign.

Implement only what exists in the current wireframe.

---

# Responsive

Desktop

Authoritative.

Tablet

Adapt layout.

Mobile

Stack vertically.

Desktop geometry must remain unchanged.