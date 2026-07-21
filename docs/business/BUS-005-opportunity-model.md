# BUS-005 — Opportunity Model

**Status:** APPROVED (v1)  
**Version:** 1.0  
**Date:** 2026-07-21  
**SSOT for:** Opportunity, Business Opportunity, Entry Strategy  
**Not SSOT for:** Pipeline stage list (BUS-003), Account types (BUS-001)

**Related:** [Business README](./README.md) · [BUS-002](./BUS-002-relationship-model.md) · [BUS-003](./BUS-003-gtm-pipeline.md) · [BUS-006](./BUS-006-gtm-playbook.md) · [Opportunity template](./templates/opportunity.md)

---

## 1. Purpose

Define what counts as an **Opportunity**, how **Business Opportunities** differ from pure revenue deals, and how **Entry Strategy** frames the path into an account.

Opportunities are the discrete units of commercial pursuit. Accounts are the durable assets.

---

## 2. Scope

**In scope**

- Opportunity definition and attributes
- Business Opportunity framing
- Entry Strategy structure
- Link to buying committee and Pipeline

**Out of scope**

- Pricing catalogs
- Contract templates
- Revenue recognition

---

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Opportunity** | Time-bound chance to create commercial or strategic value with a specific Account |
| **Business Opportunity** | Opportunity whose primary value includes strategic market effects (learning, reference, distribution), not only cash |
| **Entry Strategy** | Documented plan for how we gain access, prove value, and reach Commitment |
| **Primary Value** | Dominant reason we pursue: Cash / Learning / Reference / Distribution / Partnership |
| **Next Step** | Dated, owned action required to progress |
| **Loss Reason** | Structured cause when Closed-Lost |

---

## 4. Design Principles

1. **No Opportunity without Next Step** — undated interest is Signal noise.  
2. **Name the Primary Value** — Cash Accounts and Design Partners use different Entry Strategies.  
3. **Entry Strategy before demo theater** — proof serves the strategy.  
4. **One Opportunity, one Decision Maker path** — split if committees diverge.  
5. **Business Opportunity is explicit** — do not pretend every deal is strategic.

---

## 5. Conceptual Model

```text
Strategic Account
  └── Opportunity
        ├── Primary Value (Cash | Learning | Reference | Distribution | Partnership)
        ├── Entry Strategy
        ├── Buying Committee (BUS-002)
        ├── Pipeline Stage (BUS-003)
        └── Outcome → updates Account Lifecycle (BUS-004) + BI
```

**Business Opportunity** is an Opportunity where Primary Value ≠ Cash alone (or Cash is secondary).

---

## 6. Core Components

### 6.1 Opportunity attributes (v1)

| Attribute | Description |
| --- | --- |
| Account | Link to Strategic Account / Account Card |
| Summary | One sentence: what would change if we win |
| Primary Value | Cash / Learning / Reference / Distribution / Partnership |
| Entry Strategy | See 6.2 |
| Stage | BUS-003 stage |
| Relationship Owner | BUS-002 |
| Champion / Decision Maker | Known or “unknown — plan” |
| Next Step | Action + owner + date |
| Risks | Top blockers |
| Outcome | Open / Won / Lost + learning |

### 6.2 Entry Strategy structure

Every Opportunity at Discover or later should answer:

1. **Access** — How do we reach Champion and Decision Maker?  
2. **Problem** — What decision pain are we addressing?  
3. **Proof** — What Decision Journey / pilot evidence will we show?  
4. **Risk removal** — What must be true for them to say yes?  
5. **Commercial path** — What are we asking them to commit to?  
6. **Fallback** — If blocked, what is the next play (BUS-006)?

Entry Strategy is BI knowledge. It survives tool changes.

### 6.3 Opportunity vs Business Opportunity

| Opportunity (general) | Business Opportunity |
| --- | --- |
| Any time-bound pursuit | Strategic Primary Value emphasized |
| May be Cash Account deal | Often Design Partner / Reference / Partner path |
| Measured by close | Measured by close **and** BI outcomes |

---

## 7. Workflows

### 7.1 Open Opportunity

1. Confirm Account Card exists.  
2. Fill [Opportunity template](./templates/opportunity.md).  
3. Set stage to Signal or Qualify.  
4. Assign Next Step within 7 days.

### 7.2 Upgrade to Business Opportunity framing

When Strategic Score ≥ 4 or Design Partner intent appears: set Primary Value accordingly; involve founder for capacity check.

### 7.3 Close

- **Won:** update Lifecycle (BUS-004); plan Expand or Reference Path.  
- **Lost:** write Loss Reason; update playbook notes (BUS-006); adjust Relationship Score if needed.

---

## 8. Governance

- BUS-005 owns Opportunity / Business Opportunity / Entry Strategy vocabulary.  
- Relationship Owner owns Opportunity accuracy.  
- Do not open duplicate Opportunities for the same Decision Maker path without merging.  
- Soft pipeline inflation is a governance failure.

---

## 9. Future Evolution

- Opportunity types (pilot, expansion, partnership)  
- Shared Entry Strategy library per segment  
- Explicit coupling to DEG stages for proof design  
- Optional Client Studio Opportunity cards (later — consume BI, do not reinvent CRM)
