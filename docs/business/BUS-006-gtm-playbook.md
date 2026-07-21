# BUS-006 — GTM Playbook

**Status:** APPROVED (v1)  
**Version:** 1.0  
**Date:** 2026-07-21  
**SSOT for:** GTM plays, decision processes, Entry Strategy patterns  
**Not SSOT for:** Product UX specs, Pricing, Legal terms

**Related:** [Business README](./README.md) · [BUS-003](./BUS-003-gtm-pipeline.md) · [BUS-005](./BUS-005-opportunity-model.md) · [DEG](../product/decision-experience-grammar/DEG.md) · [DJS](../product/decision-journey/DJS.md)

---

## 1. Purpose

Capture **repeatable GTM plays** and the **decision processes** Embed Engine uses to choose them.

The Playbook converts Business Intelligence into action without reducing GTM to improvisation or to CRM task spam.

---

## 2. Scope

**In scope**

- Play definition and catalog (v1 starter set)
- When to choose which play
- Decision processes for Design Partner vs Cash Account paths
- Link to DEG/DJS for product proof

**Out of scope**

- Full marketing campaign calendars
- HR hiring playbooks
- Implementation runbooks for engineering delivery

---

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Play** | Named, reusable GTM pattern with trigger, steps, and success signal |
| **Decision Process** | Explicit rule for choosing among plays |
| **Entry Strategy Pattern** | Reusable skeleton for Entry Strategies (BUS-005) |
| **Proof Motion** | How we demonstrate Decision Experience value (aligned with DEG/DJS) |
| **Objection Pattern** | Recurring blocker with known responses |

---

## 4. Design Principles

1. **Plays are knowledge assets** — write them down after they work twice.  
2. **Product proof follows DEG** — never start with component tours.  
3. **Choose play by Primary Value** — Cash ≠ Design Partner.  
4. **Short plays beat vague “nurture.”**  
5. **Losses update plays** — Closed-Lost without learning is waste.

---

## 5. Conceptual Model

```text
Trigger (signal / stall / expansion)
  → Decision Process (which play?)
    → Play execution
      → Pipeline advance or Closed-Lost learning
        → Playbook / Account BI update
```

Proof Motion sits inside plays that reach Prove stage (BUS-003).

---

## 6. Core Components

### 6.1 Starter play catalog (v1)

| Play ID | Name | Trigger | Success signal |
| --- | --- | --- | --- |
| P-01 | **Segment warm intro** | Strategic Target, no Champion | Meeting with plausible Champion |
| P-02 | **Problem discovery** | Qualify → Discover | Constraints + Decision Maker path documented |
| P-03 | **Decision Journey demo** | Prove needed | Prospect articulates their Mental State change (DEG/DJS language) |
| P-04 | **Design Partner invite** | Strategic Score ≥ 4 + Champion | Mutual Pilot success metrics agreed |
| P-05 | **Cash path propose** | Clear budget + Decision Maker | Proposal accepted into Commit review |
| P-06 | **Objection: “we need a website”** | Confusion with CMS | Reframe to Decision Workspace; DEG one-pager |
| P-07 | **Objection: “show me AI”** | Feature curiosity | Redirect to Decision Journey; AI only if proof-relevant |
| P-08 | **Reference ask** | Adopted + strong outcome | Case Study Plan opened |
| P-09 | **Expansion object** | Adopted single object | New Opportunity for second object/site |
| P-10 | **Reactivate dormant** | Dormant Account | New Next Step or Archive |

### 6.2 Decision processes

#### A. New Strategic Account

1. Classify type + Strategic Score (BUS-001).  
2. If Design Partner capacity available and Score ≥ 4 → P-01 → P-02 → P-04.  
3. Else → P-01 → P-02 → P-03 → P-05 as fit.

#### B. Stall at Prove

1. Verify Champion exists (BUS-002). If not → find Champion before more demos.  
2. Re-run P-03 with explicit DJS stage framing.  
3. If still stalled → Closed-Lost learning or downgrade to Cash path.

#### C. Post-win

1. Lifecycle → Adopted (BUS-004).  
2. Evaluate P-08 (Reference) vs P-09 (Expand).  
3. Update Strategic Score.

### 6.3 Proof Motion (product-aligned)

Proof Motion must answer DEG’s four questions and follow DJS stages — typically Orientation → Discovery → Prioritization → Commitment for a guided demo.

Do not open with architecture diagrams unless the Influencer is technical and requested them.

---

## 7. Workflows

### 7.1 Run a play

1. Name the play on the Opportunity / Meeting Note.  
2. Execute steps.  
3. Record success signal or failure cause.  
4. Advance Pipeline or update play notes.

### 7.2 Promote a pattern to a play

After two similar successes: add Play ID to this catalog with trigger and success signal.

### 7.3 Retire a play

If a play fails repeatedly with good execution: mark retired with reason; keep history.

---

## 8. Governance

- BUS-006 owns play IDs and decision processes.  
- GTM lead curates the catalog.  
- Founder owns Design Partner invite capacity (P-04).  
- Plays must not contradict DEG/DJS product principles.

---

## 9. Future Evolution

- Segment-specific playbooks  
- Win/loss library linked to Objection Patterns  
- Play metrics (human tallies first)  
- Embedding play suggestions in future Client Studio BI views (consume-only)
