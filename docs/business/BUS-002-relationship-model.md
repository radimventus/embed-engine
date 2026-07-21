# BUS-002 — Relationship Model

**Status:** APPROVED (v1)  
**Version:** 1.0  
**Date:** 2026-07-21  
**SSOT for:** Relationship roles, Relationship Score, ownership  
**Not SSOT for:** Account types (BUS-001), Pipeline stages (BUS-003), Opportunity economics (BUS-005)

**Related:** [Business README](./README.md) · [BUS-001](./BUS-001-strategic-account-map.md) · [BUS-005](./BUS-005-opportunity-model.md) · [Meeting Note](./templates/meeting-note.md)

---

## 1. Purpose

Model the **human structure** of commercial relationships: who influences decisions, who owns trust on our side, and how relationship strength is assessed.

Organizations do not buy. People in roles do.

---

## 2. Scope

**In scope**

- Relationship definition
- Role types: Champion, Decision Maker, Influencer, Relationship Owner
- Relationship Score
- Access and trust patterns

**Out of scope**

- Contact database schema
- Email sequencing
- Legal contracting parties (except as Decision Maker context)

---

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Relationship** | Persistent, named link between Embed Engine and a person acting in an organizational role |
| **Champion** | Internal advocate who actively advances Embed Engine’s cause without necessarily holding budget |
| **Decision Maker** | Person with authority to approve adoption, spend, or partnership |
| **Influencer** | Person who shapes the Decision Maker’s judgment without final authority |
| **Relationship Owner** | Embed Engine person accountable for health and accuracy of the relationship |
| **Relationship Score** | Qualitative 1–5 rating of trust, access, and mutual understanding |
| **Buying Committee** | Set of Champion + Decision Maker + Influencers relevant to an Opportunity |

---

## 4. Design Principles

1. **Roles over titles** — “CEO” is not automatically Decision Maker for every deal.  
2. **One Relationship Owner** — shared ownership means no ownership.  
3. **Champion is not optional for Strategic Accounts** — without a Champion, Entry Strategy is incomplete.  
4. **Trust is evidence-based** — Relationship Score moves with observed behavior.  
5. **Separate personal rapport from commercial authority.**

---

## 5. Conceptual Model

```text
Strategic Account
  └── Relationships (people × roles)
        ├── Champion(s)
        ├── Decision Maker(s)
        ├── Influencer(s)
        └── Relationship Owner (Embed Engine)
              │
              └── Relationship Score per key person / committee health
```

A person may hold multiple roles over time (e.g. Influencer → Champion).

---

## 6. Core Components

### 6.1 Role matrix

| Role | We need from them | We provide |
| --- | --- | --- |
| Champion | Internal narrative, meeting access, truth about politics | Clarity, materials, Decision Workspace demos |
| Decision Maker | Clear yes/no path, constraints | Risk reduction, ROI framing, references |
| Influencer | Technical / financial / brand judgment | Evidence, comparisons, honest trade-offs |
| Relationship Owner | Continuity, BI hygiene | Accountability |

### 6.2 Relationship Score (1–5)

| Score | Meaning |
| --- | --- |
| 5 | Deep trust; proactive Champion; reliable access to Decision Maker |
| 4 | Strong access; Champion engaged; occasional friction |
| 3 | Working relationship; incomplete committee map |
| 2 | Thin access; polite interest only |
| 1 | Cold or adversarial; rebuild required |

Evidence examples: introductions made, feedback quality, response latency, willingness to run a pilot, honesty about blockers.

### 6.3 Committee completeness

For Strategic Accounts and active Opportunities, record at least:

- Champion identified?  
- Decision Maker identified?  
- Critical Influencers identified?  
- Relationship Owner assigned?

Incomplete committees explain stalled Opportunities better than “bad pricing.”

---

## 7. Workflows

### 7.1 Map a Relationship

1. Open or create [Account Card](./templates/account-card.md).  
2. Add people with roles.  
3. Assign Relationship Owner.  
4. Set Relationship Score with one-line evidence.  
5. After each material meeting, update via [Meeting Note](./templates/meeting-note.md).

### 7.2 Elevate a Champion

Signals: they invite peers, defend the product internally, share real constraints.

Response: increase access to product truth, involve in Design Partner loops if Strategic Score warrants it.

### 7.3 Owner handoff

When Relationship Owner changes: transfer Account Card, open Opportunities, and last three Meeting Notes. Score stays until new Owner validates.

---

## 8. Governance

- BUS-002 owns relationship role vocabulary and Relationship Score.  
- Relationship Owner is mandatory for Strategic Score ≥ 3.  
- Do not store sensitive personal data beyond business-relevant contact context in templates.  
- Scores are judgment calls with written evidence — not ML outputs in v1.

---

## 9. Future Evolution

- Multi-threaded Champion maps for large accounts  
- Influence graphs (who trusts whom)  
- Relationship health alerts (human cadence first)  
- Optional Client Studio “Relationship context” panels for Decision Workspace authors (later)
