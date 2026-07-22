# MSCB-001 — Manager Studio Capability Backlog

**Status:** Active  
**Date:** 2026-07-22  
**Product:** Manager Studio (Operations Terminal)  
**Runtime:** Certified Decision Session Runtime (RAR-001)

---

## Mission

Help an operator understand what changed, why it changed, and what should happen next.

Primary question: **What changed since my last visit?**

Architecture: [OPERATIONS_TERMINAL_v1.0](../../platform/OPERATIONS_TERMINAL_v1.0.md)

---

## Capability table

| ID | Capability | Goal | Status |
| --- | --- | --- | --- |
| [MSCB-01](#mscb-01--application-foundation) | Application Foundation | Single shell + Runtime bootstrap + ops IA | **Done** |
| MSCB-02 | Live Activity & Timeline | Richer Runtime event feed | Planned |
| MSCB-03 | Journey Monitor | Multi-session observation | Planned |
| MSCB-04 | Attention & Alerts | Operational attention queue | Planned |
| MSCB-05 | Operational Actions | Dispatch actions back to Runtime | Planned |
| MSCB-06 | Insights | Runtime-derived patterns | Planned |

---

### MSCB-01 — Application Foundation

**Goal:** Establish Manager Studio as a Runtime-powered Operations Terminal shell.

**Status:** **DONE** — [report](./manager-studio/MSCB-01-application-foundation.md)

**Scope**

- Single AppShell (header + sidebar + workspace)
- Single Decision Session Runtime bootstrap
- Operations section navigation (IA from Operations Terminal)
- Foundation surfaces projecting Runtime facts only
- ErrorBoundary + loading gate
- No Client Studio coupling
- No Runtime API changes

---

## Architectural Constraints

1. Runtime remains the sole semantic authority.
2. Operations Terminal projects Runtime — never invents interpretation.
3. Timeline / alerts / insights are projections.
4. Actions return to Runtime (later capabilities).
5. No duplicated Runtime state in the app.
6. Apps contain no business logic beyond presentation composition.

---

## Relationship to Client Studio

| Client Studio | Manager Studio |
| --- | --- |
| Buyer Decision Journey | Operator Operations Terminal |
| Experience Surfaces for decision | Operations Surfaces for change detection |
| Same certified Runtime | Same certified Runtime |
| Independent app package | Independent app package |
