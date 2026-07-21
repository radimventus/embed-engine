# BUS-001 — Strategic Account Map

**Status:** APPROVED (v1)  
**Version:** 1.0  
**Date:** 2026-07-21  
**SSOT for:** Strategic Account taxonomy, market map, Strategic Score  
**Not SSOT for:** Opportunity stages, CRM fields, Relationship roles (see BUS-002)

**Related:** [Business README](./README.md) · [BUS-002](./BUS-002-relationship-model.md) · [BUS-004](./BUS-004-account-lifecycle.md) · [Account Card](./templates/account-card.md)

---

## 1. Purpose

Define which organizations Embed Engine treats as **Strategic Accounts**, how they are classified, and how the market map guides attention.

The map answers: *Who matters for long-term platform success, and why?*

---

## 2. Scope

**In scope**

- Strategic Account definition and types
- Strategic Score
- Market segments relevant to Embed Engine GTM
- Distinction between strategic and opportunistic attention

**Out of scope**

- Individual Relationship roles (BUS-002)
- Deal stages (BUS-003)
- Opportunity economics (BUS-005)
- CRM configuration

---

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Strategic Account** | An organization we deliberately pursue or retain because it compounds platform value beyond a single invoice |
| **Cash Account** | An account valued primarily for near-term revenue with limited strategic spillover |
| **Design Partner** | Strategic Account engaged in structured product co-learning (pilots, feedback loops) |
| **Reference Customer** | Account that publicly or privately validates outcomes for others |
| **Strategic Partner** | Account with mutual long-term alignment (distribution, co-marketing, joint GTM) |
| **Strategic Score** | Qualitative 1–5 rating of strategic importance |
| **Market Segment** | Cluster of accounts sharing buying context (e.g. modular housing producers, developers, land sellers) |

---

## 4. Design Principles

1. **Attention is finite** — not every paying customer is Strategic.  
2. **Strategy before CRM** — classification lives in BI even if no CRM exists.  
3. **Compounding over vanity** — logos matter less than learning, references, and distribution.  
4. **Explicit Cash Accounts** — revenue-only accounts are valid; they must not consume Design Partner energy.  
5. **Reversible classification** — scores and types change with evidence.

---

## 5. Conceptual Model

```text
Market
  └── Segments
        └── Organizations
              └── Strategic Account? ── yes → type + Strategic Score
                                    └── no  → Cash / opportunistic (optional tracking)
```

A Strategic Account sits at the intersection of:

- ability to adopt Decision Workspace / Client Studio,
- influence on peer buyers,
- willingness to co-create Decision Knowledge,
- fit with Embed Engine’s product-led GTM.

---

## 6. Core Components

### 6.1 Account types

| Type | Intent | Typical investment |
| --- | --- | --- |
| Design Partner | Shape product + DEG/DJS validation | High (founder time) |
| Reference Customer | Proof for others | Medium (case study care) |
| Strategic Partner | Mutual market leverage | High (joint planning) |
| Cash Account | Revenue with low strategic spillover | Low (efficient delivery) |

An organization may hold **one primary type** and optional secondary labels (e.g. Design Partner → later Reference Customer).

### 6.2 Strategic Score (1–5)

| Score | Meaning |
| --- | --- |
| 5 | Platform-defining — Design Partner or Strategic Partner candidate |
| 4 | High leverage — strong reference or segment leadership |
| 3 | Meaningful — good fit, limited network effects |
| 2 | Opportunistic — worth a deal, not a program |
| 1 | Low strategic value — Cash Account or decline |

Score criteria (apply qualitatively):

- Segment influence  
- Fit with Decision Experience product  
- Capacity for Design Partner work  
- Likelihood of Reference Customer outcomes  
- Expansion potential across objects / sites  

### 6.3 Segment map (v1)

Initial segments for Embed Engine GTM:

| Segment | Why it matters |
| --- | --- |
| Modular / prefab housing producers | Natural Decision Workspace buyers; object-rich catalogs |
| Residential developers | Multi-object decision journeys; higher ticket |
| Land / plot sellers | Adjacent Decision Journey (plot + house) |
| Sales studios / agencies | Distribution and multi-account leverage |
| Strategic technology / channel partners | Amplification, not end-buyer alone |

Segment list evolves; types and scores stay stable.

---

## 7. Workflows

### 7.1 Nominate a Strategic Account

1. Capture organization on [Account Card](./templates/account-card.md).  
2. Assign primary type and Strategic Score.  
3. Name Relationship Owner (BUS-002).  
4. Decide Entry Strategy (BUS-005 / BUS-006).  
5. Review in next GTM cadence.

### 7.2 Reclassify

Triggered by: closed deal, failed pilot, new Champion, segment shift.

Update Account Card; record reason in Meeting Note or Opportunity close-out.

### 7.3 Portfolio balance

Maintain a visible mix:

- few Design Partners (high care),
- growing Reference Customers,
- clear Cash Accounts (protected from over-service).

---

## 8. Governance

- BUS-001 owns Strategic Account vocabulary and Strategic Score.  
- Relationship Owners maintain Account Cards.  
- Founder / Product owns Design Partner slots (capacity-limited).  
- Do not invent numeric “lead scoring engines” in v1 — criteria over formulas.

---

## 9. Future Evolution

- Segment depth (ICPs per segment)  
- Explicit anti-ICP list  
- Geographic or regulatory overlays  
- Optional sync of Account Card fields into Client Studio BI views (product bridge — later)  
- Historical Strategic Score changelogs
