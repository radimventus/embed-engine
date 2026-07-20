# Product Backlog

**Status:** Living  
**Aligned with:** Living Experience v0.1 Freeze, ADR-007 Priority MVP Policy

Reaction-driven backlog. Prefer Behavior Packs over architecture changes.

---

## Now (next product phase)

| ID | Item | Notes |
| --- | --- | --- |
| DL-01 | Decision Move / Story / Strategy data contracts | After ADR-010; risks R1–R2 remain for hosting/transport. No UI. |
| BP-01 | First Behavior Pack: **Energy Conscious Buyer** | Includes Move library + Story composition sections. |

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

## Deferred implementation (architecture ready)

| ID | Item | Notes |
| --- | --- | --- |
| DT-01 | Decision Terminal renderer | After ADR-008 Accepted. Renders Stories; any modality. |
| DT-02 | Wire Strategy output to Terminal | Depends on DL-01 / U2. |
| DT-FR-01 | Decision Trajectory | Future — not MVP. |
