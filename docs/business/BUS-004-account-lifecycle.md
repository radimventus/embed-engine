# BUS-004 — Account Lifecycle

**Status:** APPROVED (v1)  
**Version:** 1.0  
**Date:** 2026-07-21  
**SSOT for:** Account Lifecycle stages as business assets  
**Not SSOT for:** Opportunity Pipeline stages (BUS-003), Relationship roles (BUS-002)

**Related:** [Business README](./README.md) · [BUS-001](./BUS-001-strategic-account-map.md) · [BUS-003](./BUS-003-gtm-pipeline.md) · [Case Study Plan](./templates/case-study-plan.md)

---

## 1. Purpose

Describe how a **Strategic Account** evolves as a long-term business asset — independent of any single Opportunity.

Lifecycle answers: *What is the maturity of this account relationship as an asset of Embed Engine?*

---

## 2. Scope

**In scope**

- Account Lifecycle stages
- Transitions between stages
- Link to Reference Customer and Design Partner outcomes
- Distinction from Opportunity Pipeline

**Out of scope**

- Subscription billing states
- Legal entity onboarding checklists
- Product feature rollout plans

---

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Account Lifecycle** | Ordered maturity states of an account as a business asset |
| **Lifecycle Stage** | Named maturity position with expected BI artifacts |
| **Dormant Account** | Previously active account with no meaningful engagement |
| **Reference Path** | Planned progression toward Reference Customer status |
| **Churn Risk** | Observed decline in Relationship Score or usage of Decision Workspace value |

---

## 4. Design Principles

1. **Lifecycle ≠ Pipeline** — many Opportunities can exist inside one Lifecycle Stage.  
2. **Assets require maintenance** — Design Partners and References decay without care.  
3. **Learning is a lifecycle outcome** — not only revenue.  
4. **Dormant is explicit** — silence is a state, not hope.  
5. **Product success and account success align** — Decision Experience quality feeds retention.

---

## 5. Conceptual Model

```text
Target → Engaged → Pilot → Adopted → Expanding → Reference / Partner
                                              ↘ Dormant / Archived
```

Opportunity Pipeline (BUS-003) runs **inside** Engaged → Expanding.

---

## 6. Core Components

### 6.1 Lifecycle stages (v1)

| Stage | Meaning | Expected BI artifacts |
| --- | --- | --- |
| **Target** | On Strategic Account Map; no deep engagement yet | Account Card; hypothesized type + Strategic Score |
| **Engaged** | Active discovery / relationship building | Relationships mapped; Meeting Notes; Entry Strategy |
| **Pilot** | Structured proof (Design Partner or paid pilot) | Success metrics; Decision Journey feedback |
| **Adopted** | Production use of Decision Workspace / Embed path | Delivery notes; Relationship Owner cadence |
| **Expanding** | Additional objects, sites, or business units | New Opportunities; updated Strategic Score |
| **Reference** | Willing to validate for others | [Case Study Plan](./templates/case-study-plan.md) active or published |
| **Partner** | Mutual strategic alignment beyond customer | Joint plan; Strategic Partner label (BUS-001) |
| **Dormant** | No meaningful engagement | Last contact date; reactivation hypothesis |
| **Archived** | Explicitly not pursued | Reason recorded |

### 6.2 Lifecycle vs Pipeline (comparison)

| Account Lifecycle | GTM Pipeline |
| --- | --- |
| One per account | One per Opportunity |
| Years possible | Weeks–months typical |
| Asset maturity | Deal motion |
| BUS-004 | BUS-003 |

### 6.3 Design Partner overlay

Design Partners usually enter at **Engaged → Pilot** with higher founder involvement. Graduation may produce **Reference** without requiring Partner.

---

## 7. Workflows

### 7.1 Advance lifecycle

1. Confirm Strategic Account type (BUS-001).  
2. Verify BI artifacts for current stage.  
3. Update Account Card lifecycle field.  
4. If moving to Reference: open Case Study Plan.

### 7.2 Detect dormancy

Triggers: no Meeting Note in agreed period; Relationship Score ≤ 2; Pipeline empty with no next step.

Action: set Dormant **or** create reactivation Opportunity with explicit Entry Strategy.

### 7.3 Archive

Use when Strategic Score falls permanently or anti-ICP confirmed. Preserve learning on Account Card.

---

## 8. Governance

- BUS-004 owns Account Lifecycle vocabulary.  
- Relationship Owner updates lifecycle stage.  
- Founder approves Partner stage and Design Partner capacity.  
- Do not conflate “Adopted” with a single Closed-Won Opportunity if value is not live.

---

## 9. Future Evolution

- Segment-specific lifecycle norms  
- Health signals tied to product usage (later, via product analytics — not CRM)  
- Portfolio dashboards by lifecycle stage  
- Explicit alumni Design Partner network
