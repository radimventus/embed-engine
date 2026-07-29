# Product Backlog

**Status:** Living  
**Aligned with:** Living Experience v0.1 Freeze, ADR-007 Priority MVP Policy, [Decision Experience Grammar (DEG)](../decision-experience-grammar/DEG.md)  
**Phase complete:** CAP-P01 → CAP-P03 — first end-to-end Decision Runtime MVP · S-005/S-006A commercial pilot

Reaction-driven backlog. Prefer Behavior Packs and **User Transformation** over architecture changes.

**Prioritization (DEG):** Business Value × Pilot Experience × User Transformation — not technical components.

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
| CAP-INFRA-01 | Centralized Embed Configuration — partner paste without `assetBase` / infra fields | ED-INFRA-001 | **Post-pilot.** Prevents stale CMS infra snippets. Not before pilot-critical CAPs. [CAP](../../ops/CAP-INFRA-01-centralized-embed-configuration.md) |

---

## Future research

| ID | Item | Status | Notes |
| --- | --- | --- | --- |
| PRI-FR-01 | Household Interpretation vs per-person views | Research | Depends on PRI-PM-02 |
| PRI-FR-02 | Advisor-as-actor Signal attribution | Research | Depends on PRI-PM-02 |
| PRI-FR-03 | Cross-session Priority profiles | Research | Depends on PRI-PM-03 / PRI-PM-04 |
| PRI-FR-04 | Hybrid absolute + relative weight modes | Research | Product experiment; not default |
| DT-FR-01 | Decision Trajectory | Research | Future — not MVP; long-horizon across sessions |
| DJS-FR-01 | Decision Journey vs. Decision Conversation | Research | Journey remains canonical; Conversation not introduced. Distinct from DT-FR-01 |

### DJS-FR-01 — Decision Journey vs. Decision Conversation

**Status:** Research

**Description:** Ověřit, zda je **Decision Journey** dostatečný model i pro nelineární rozhodování a AI asistenci, nebo zda bude Embed Engine v budoucnu potřebovat obecnější koncept **Decision Conversation**.

Hypotéza vznikla během návrhu Decision Workspace a UX 2.0.

V této fázi se **Decision Conversation nezavádí**.  
Decision Journey zůstává kanonickým produkčním modelem.

**Scope**

- validovat vůči DEG
- validovat vůči DJS
- ověřit na několika reálných Experience scénářích
- ověřit na AI asistenci
- explicitně odlišit od `DT-FR-01` (Decision Trajectory), který řeší dlouhodobou evoluci napříč session

**Exit criteria** — uzavřít pouze jedním výsledkem:

| Result | Meaning | Action |
| --- | --- | --- |
| **A — Journey potvrzen** | UX 2.0 a AI scénáře prokážou, že Decision Journey stačí | Uzavřít položku |
| **B — Conversation potvrzena** | Opakovaně scénáře, které nelze přirozeně modelovat DEG + DJS + Chapters + Session | Teprve poté Proposed Product Specification pro Decision Conversation |

Do not change SSOT or ADR while this item is Research.

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
