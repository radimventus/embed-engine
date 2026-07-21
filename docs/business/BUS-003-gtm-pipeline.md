# BUS-003 — GTM Pipeline

**Status:** APPROVED (v1)  
**Version:** 1.0  
**Date:** 2026-07-21  
**SSOT for:** GTM Pipeline stages and stage exit criteria  
**Not SSOT for:** Account lifecycle (BUS-004), Opportunity definition (BUS-005), play content (BUS-006)

**Related:** [Business README](./README.md) · [BUS-005](./BUS-005-opportunity-model.md) · [BUS-006](./BUS-006-gtm-playbook.md) · [Opportunity template](./templates/opportunity.md)

---

## 1. Purpose

Define the **ordered stages** through which Opportunities move from first meaningful contact to expansion — independent of any CRM UI.

The Pipeline answers: *Where is this Opportunity in the go-to-market journey, and what must be true to advance?*

---

## 2. Scope

**In scope**

- Pipeline stages
- Entry / exit criteria per stage
- Relationship between Pipeline and Business Intelligence
- Cadence expectations

**Out of scope**

- Forecasting formulas
- Commission plans
- Marketing automation sequences
- CRM stage field mapping (consumer concern)

---

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Pipeline** | Ordered set of GTM stages applied to Opportunities |
| **Stage** | Named position with explicit exit criteria |
| **Stage Exit Criteria** | Evidence required before advancement |
| **Stalled Opportunity** | Opportunity that fails exit criteria within expected cadence |
| **Expansion** | Post-win stage focused on additional objects, sites, or roles |

---

## 4. Design Principles

1. **Evidence over hope** — stages advance on criteria, not optimism.  
2. **Pipeline is not BI** — Pipeline tracks motion; BI stores meaning.  
3. **Same stages for Strategic and Cash** — investment level differs; vocabulary does not.  
4. **Lost is a valid exit** — learning returns to BI (playbooks, Account Card).  
5. **DEG-aligned demos** — product proof uses Decision Journey language, not feature tours.

---

## 5. Conceptual Model

```text
Opportunity
  └── Pipeline Stage
        ├── Signal
        ├── Qualify
        ├── Discover
        ├── Prove
        ├── Propose
        ├── Commit
        ├── Deliver
        └── Expand / Closed-Lost
```

Each stage consumes Relationship and Account knowledge (BUS-001 / BUS-002) and may update them.

---

## 6. Core Components

### 6.1 Stages (v1)

| Stage | Intent | Exit criteria (minimum) |
| --- | --- | --- |
| **Signal** | First meaningful interest | Named org + contact; hypothesized segment |
| **Qualify** | Fit check | Strategic or Cash classification; problem hypothesis; Decision Maker path known or explicitly unknown |
| **Discover** | Understand decision context | Champion identified **or** plan to find one; constraints documented; Entry Strategy draft |
| **Prove** | Evidence of value | Decision Workspace / pilot experience completed or concrete proof artifact; objections listed |
| **Propose** | Commercial path | Scope, commercial model, success metrics shared; Decision Maker engaged |
| **Commit** | Mutual yes | Verbal or written commitment path; next legal/ops step dated |
| **Deliver** | First value live | Pilot or production path started; Relationship Owner active |
| **Expand** | Compound value | Additional Opportunity opened **or** Reference / Design Partner path agreed |
| **Closed-Lost** | Explicit end | Loss reason + learning note on Account Card / Opportunity |

### 6.2 Cadence (guidance)

| Stage | Typical review |
| --- | --- |
| Signal → Qualify | days |
| Discover → Prove | 1–3 weeks |
| Propose → Commit | weeks |
| Deliver → Expand | weeks–months |

Strategic Accounts may move slower with higher care; still require dated next steps.

### 6.3 Pipeline vs Sales Pipeline tool

This document defines **meaning**. A CRM may mirror stages. If tools diverge, **BUS-003 wins** until an explicit migration updates the SSOT.

---

## 7. Workflows

### 7.1 Advance an Opportunity

1. Open [Opportunity](./templates/opportunity.md).  
2. Check exit criteria for current stage.  
3. If met: advance stage; update Account Card if classification changed.  
4. If not: record blocker; apply play from BUS-006.

### 7.2 Stall review

Weekly (or agreed cadence): list Opportunities without next step date or past cadence. Force Qualify / Discover clarity or Closed-Lost.

### 7.3 Feed BI from Pipeline

On Closed-Won / Closed-Lost / Expand:

- Update Strategic Score if warranted (BUS-001)  
- Update Relationship Scores (BUS-002)  
- Capture play learning (BUS-006)

---

## 8. Governance

- BUS-003 owns stage names and exit criteria.  
- GTM lead owns Pipeline hygiene.  
- Relationship Owner owns stage truth for their Opportunities.  
- Do not add vanity stages (“nurture forever”) without exit criteria.

---

## 9. Future Evolution

- Segment-specific exit criteria  
- Explicit Design Partner track overlay  
- Conversion metrics (human-reported first)  
- Optional Client Studio GTM board that reads the same stage vocabulary (later)
