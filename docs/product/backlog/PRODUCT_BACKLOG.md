# Product Backlog

**Status:** Living  
**Aligned with:** Living Experience v0.1 Freeze, ADR-007 Priority MVP Policy  
**Phase complete:** CAP-P01 → CAP-P03 — first end-to-end Decision Runtime MVP

Reaction-driven backlog. Prefer Behavior Packs over architecture changes.

---

## Now (next product phase)

| ID | Item | Notes |
| --- | --- | --- |
| CAP-P04 | Pilot validation + household branching + stairs splice + richer outcome | Founding Partner #1 readiness; builds on live Runtime |
| CAP-P05 | Energy Conscious Buyer Behavior Pack | Same Object (`house-modern-01`); was OQ-P05 |
| OQ-P01 | Move-completion Signal (or standardized moveId payloads) | Today overloads `QUESTION_OPENED` |
| OQ-P03 | Room-level media enrichment on Pilot Object | Floorplan + room ids only today |
| OQ-P04 | Household-shape → DecisionState.facts mapping | Ask Move exists; facts unused in reduce |
| OQ-P06 | Dialogue position memory across Moves | Provisional trade-offs as Signals only |
| OQ-P07 | Advisor voice ownership (Pack vs Terminal copy) | Meaning in Pack; phrasing projection |
| DL-01 | Decision Move / Story / Strategy contracts polish | MVP contracts live; polish only |
| RT-01 | Unify dual CommandRuntime vs Cognitive Runtime paths | MVP keeps both |

---

## Done (product)

| ID | Item |
| --- | --- |
| CAP-P01 | First Pilot Object `house-modern-01` + Disposition Layout Behavior Pack v1 |
| CAP-P02 | Layout Decision Dialogue v1 |
| CAP-P03 | Decision Runtime MVP — Priority → Strategy → Story → Terminal → Outcome |
| DT-01 | Decision Terminal renderer (MVP — Layout Story) |
| DT-02 | Wire Strategy output to Terminal via `RuntimeState.decisionStory` |

---

## Post-MVP (explicitly postponed)

| ID | Item | Origin | Notes |
| --- | --- | --- | --- |
| PRI-PM-01 | Relative Priority budget (sum = 100%) | ADR-007 Q1 | Rejected for MVP. Revisit for negotiation / couple UX only with a new ADR. |
| PRI-PM-02 | Multi-user / couple Priority collaboration | ADR-007 Q2 | Husband+wife, family, advisor+customer as cognitive actors — postponed. Requires Participant / merge ADR. |
| PRI-PM-03 | Session restore of DecisionState | ADR-007 Q3 | Optional rehydrate before `project()`. Not LocalStorage-by-default in MVP. |
| PRI-PM-04 | Backend DecisionState persistence | ADR-007 Q3 | Durable decision process across devices / CRM. Out of Cognitive Layer. |

---

## Future research

| ID | Item | Notes |
| --- | --- | --- |
| PRI-FR-01 | Household Interpretation vs per-person views | Depends on PRI-PM-02 |
| PRI-FR-02 | Advisor-as-actor Signal attribution | Depends on PRI-PM-02 |
| PRI-FR-03 | Cross-session Priority profiles | Depends on PRI-PM-03 / PRI-PM-04 |
| PRI-FR-04 | Hybrid absolute + relative weight modes | Product experiment; not default |
| DT-FR-01 | Decision Trajectory | Future — not MVP |

---

## Done (baseline)

| ID | Item |
| --- | --- |
| LE-v0.1 | Living Experience v0.1 — synchronized Priority / FAQ / AI |
| ADR-007 | Priority MVP open questions closed |
| DT-v0.1 | Decision Terminal surface freeze (superseded in part by Decision Layer v1) |
| DL-v1 | Decision Layer architecture freeze (ADR-009) |
| DT-002 | Decision Strategy architecture freeze (ADR-010) |
| DL-GOV-v1 | Decision Layer governance documentation freeze · tag `architecture-decision-layer-v1` |

---
