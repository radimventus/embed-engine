# Business Intelligence Layer

**Status:** APPROVED (foundation)  
**Version:** 1.0  
**ID:** WP-BUS-001  
**Date:** 2026-07-21  
**SSOT for:** Business Architecture / Business Intelligence Layer entry point  
**Not SSOT for:** CRM product features, Product Architecture, Runtime, DEG, sales scripts

---

## Why Business Architecture exists

Embed Engine models **how buyers decide** (Product + Decision Architecture).

It must also model **how the company wins and compounds market position** (Business Architecture).

Business Architecture is a first-class architectural domain — parallel to Product Architecture, not subordinate to a CRM tool.

| Layer | Models |
| --- | --- |
| Product Architecture | Object truth, Decision Experience, Runtime |
| **Business Architecture** | Market, Strategic Accounts, Relationships, Opportunities, GTM knowledge |
| CRM / tools | Operational capture of contacts and deals (one possible consumer) |

**Business Intelligence** is the durable knowledge layer: who matters, why, how relationships evolve, which plays work, and which accounts become long-term assets.

CRM is not Business Intelligence. CRM may store records; BI explains meaning, strategy, and compounding knowledge.

---

## How this differs from Product Architecture

| Product Architecture | Business Architecture |
| --- | --- |
| Changes how an end user decides about an object | Changes how Embed Engine wins and retains market relationships |
| DEG, DJS, Decision Story, Experience | Strategic Account, Relationship, Opportunity, GTM Pipeline |
| Object Package + Behavior Pack | Account knowledge + relationship history + playbooks |
| Runtime executes decision journeys | GTM workflows execute go-to-market journeys |

Both follow SSOT philosophy, stable terminology, and architecture-first thinking.

Neither is marketing copy.

---

## Document map

| ID | Document | Role |
| --- | --- | --- |
| BUS-001 | [Strategic Account Map](./BUS-001-strategic-account-map.md) | Who we pursue and why (market map) |
| BUS-002 | [Relationship Model](./BUS-002-relationship-model.md) | People, roles, trust, ownership |
| BUS-003 | [GTM Pipeline](./BUS-003-gtm-pipeline.md) | Stages from awareness to expansion |
| BUS-004 | [Account Lifecycle](./BUS-004-account-lifecycle.md) | How an account evolves as a business asset |
| BUS-005 | [Opportunity Model](./BUS-005-opportunity-model.md) | Discrete commercial chances and entry strategies |
| BUS-006 | [GTM Playbook](./BUS-006-gtm-playbook.md) | Repeatable plays and decision processes |
| — | [Templates](./templates/) | Operational capture without inventing CRM |

```text
Strategic Account Map (BUS-001)
        │
        ▼
Relationship Model (BUS-002) ──► Opportunity Model (BUS-005)
        │                                │
        ▼                                ▼
Account Lifecycle (BUS-004) ◄── GTM Pipeline (BUS-003)
        │
        ▼
GTM Playbook (BUS-006)
        │
        ▼
Business Intelligence (compounding knowledge)
```

---

## Recommended reading order

1. This README — orientation and boundaries  
2. [BUS-001 Strategic Account Map](./BUS-001-strategic-account-map.md)  
3. [BUS-002 Relationship Model](./BUS-002-relationship-model.md)  
4. [BUS-005 Opportunity Model](./BUS-005-opportunity-model.md)  
5. [BUS-003 GTM Pipeline](./BUS-003-gtm-pipeline.md)  
6. [BUS-004 Account Lifecycle](./BUS-004-account-lifecycle.md)  
7. [BUS-006 GTM Playbook](./BUS-006-gtm-playbook.md)  
8. [Templates](./templates/) — start capturing knowledge immediately  

Product context (optional, parallel): [DEG](../product/decision-experience-grammar/DEG.md) · [Product Constitution](../product/constitution/product-constitution.md)

---

## Core vocabulary (index)

| Term | One-line | Defined in |
| --- | --- | --- |
| Business Intelligence Layer | Durable strategic knowledge about market and relationships | this README |
| Strategic Account | Organization we deliberately pursue or retain as strategic | BUS-001 |
| Relationship | Persistent link between Embed Engine and a person/org role | BUS-002 |
| Champion | Internal advocate who advances our cause | BUS-002 |
| Decision Maker | Person with authority to approve | BUS-002 |
| Influencer | Person who shapes the Decision Maker without final authority | BUS-002 |
| Relationship Owner | Embed Engine person accountable for the relationship | BUS-002 |
| Opportunity | Time-bound chance to create commercial value | BUS-005 |
| Entry Strategy | Planned path into an account or opportunity | BUS-005 / BUS-006 |
| Business Opportunity | Opportunity framed as strategic market value, not only revenue | BUS-005 |
| Reference Customer | Account willing to validate publicly | BUS-001 / BUS-004 |
| Design Partner | Account co-shaping product through structured feedback | BUS-001 |
| Strategic Partner | Account with mutual long-term strategic alignment | BUS-001 |
| Cash Account | Account valued primarily for near-term revenue | BUS-001 |
| Relationship Score | Qualitative strength of trust and access | BUS-002 |
| Strategic Score | Qualitative strategic importance of an account | BUS-001 |
| Account Lifecycle | Stages of an account as a business asset | BUS-004 |
| Pipeline | Ordered GTM stages for opportunities | BUS-003 |

---

## Distinctions (non-negotiable)

### Business Intelligence vs CRM

| Business Intelligence | CRM |
| --- | --- |
| Why this account matters | Contact fields and activity log |
| Relationship meaning and strategy | Tasks, emails, deal stage UI |
| Compounding market knowledge | Operational system of record (optional) |
| Owned by Business Architecture SSOT | Owned by a tool vendor / ops process |

### Business Intelligence vs Sales Pipeline

| Business Intelligence | Sales Pipeline |
| --- | --- |
| Knowledge that survives a lost deal | Current deal progress |
| Patterns across accounts | Single opportunity path |
| Informs Entry Strategy and Playbooks | Consumes BI; does not define it |

CRM and Sales Pipeline may **consume** BI. They do not **define** it.

---

## Ownership

| Role | Responsibility |
| --- | --- |
| Product / Founder | Strategic Account priorities, Design Partner selection |
| Relationship Owner | Account Card freshness, meeting notes, relationship accuracy |
| GTM lead | Pipeline hygiene, playbook currency |
| Engineering | Does **not** own BI content; may later consume BI contracts in Client Studio |

Changes to vocabulary require an update to this README and the defining BUS document.

---

## Templates

Immediate-use capture formats:

- [Account Card](./templates/account-card.md)
- [Meeting Note](./templates/meeting-note.md)
- [Opportunity](./templates/opportunity.md)
- [Case Study Plan](./templates/case-study-plan.md)

Templates feed BI. They are not CRM screens.

---

## Future roadmap

1. **Foundation (this WP)** — vocabulary, models, templates, SSOT skeleton  
2. **Operating cadence** — regular Account Card and Pipeline reviews  
3. **Knowledge compounding** — case studies, lost-deal learning, playbook refinement  
4. **Product bridge** — optional Client Studio surfaces that *observe* BI (no CRM rebuild)  
5. **Automation (later)** — only after models prove stable in human use  

No software in this WP.

---

## Governance

- `docs/business/` is the SSOT for Business Architecture.
- Do not duplicate definitions across Product Bible and Business docs — link.
- Do not invent CRM schemas or APIs here.
- Prefer qualitative scores with explicit criteria over fake precision.

---

## One-line summary

**Business Architecture models how Embed Engine wins the market; Product Architecture models how buyers decide; CRM is optional storage, not the knowledge layer.**
