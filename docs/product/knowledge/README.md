# Knowledge Foundation

**Status:** APPROVED  
**Version:** 1.0  
**Scope:** Product framework for Knowledge Layer  
**SSOT for:** Product Knowledge / Decision Knowledge framing  
**Not SSOT for:** Object Package contract, Decision Assets, Knowledge Base, AI, analytics

**Related**

- Object Package: [Object Package Product Contract](../object-package.md)
- Pilots: [Pilot Foundation](../pilots/README.md)
- Runtime SSOT: [RI-001 — Runtime Kernel](../../04-reference-implementation/RI-001-Runtime-Kernel.md) · [RUNTIME.md](../../architecture/RUNTIME.md)
- Experience: [Experience Projection Principles](../../architecture/experience-projection.md)
- Product: [Product Constitution](../constitution/product-constitution.md)

---

## 1. Purpose

This document defines the first generation of the **Decision Knowledge Layer** as a product framework.

It does not create a knowledge base, Decision Assets catalog, learning engine, or AI system.

It defines vocabulary and boundaries so future knowledge work does not collide with Runtime, Experience, or Object Package SSOTs.

---

## 2. What Product Knowledge Means

**Product Knowledge** is durable understanding that improves how Embed Engine creates commercial decision experiences.

It includes knowing:

- what matters when people decide,
- which object truths are decision-relevant,
- which interpretations produce useful Experience,
- which patterns survive across projects.

Product Knowledge is an asset of the product company. It is not a single project’s CMS content and not Runtime orchestration code.

---

## 3. What Decision Knowledge Means

**Decision Knowledge** is the subset of Product Knowledge that shapes the path from visitor answers to interpreted Experience.

It concerns:

- which decisions are asked,
- how answers form filters / preferences,
- how those preferences select or emphasize parts of an Object Package,
- what projected outcomes (highlights, order, summary) mean for the visitor.

Decision Knowledge lives conceptually between Object Package truth and Experience projection. It is not the ExperienceModel itself.

---

## 4. Data vs Knowledge

| | **Data** | **Knowledge** |
| --- | --- | --- |
| Nature | Recorded facts or events | Interpreted, reusable meaning |
| Example | Price = 6 900 000; layout rooms on house-modern-01 | CAP-P01 Disposition Pack reasons about day/night zones — [`../../pilot/`](../../pilot/) |

| Change trigger | Fact or event changes | Understanding improves |
| Primary home | Object Package, answers, media references | Decision Knowledge / Product Knowledge |
| Alone sufficient for Experience? | No | No — needs Object Package + Decision state + projection rules |

Data without knowledge produces catalogs.  
Knowledge without data produces empty advice.  
Experience requires both, joined by interpretation.

---

## 5. Object Package vs Knowledge

| | **Object Package** | **Knowledge** |
| --- | --- | --- |
| About | One concrete object | How the Engine understands decisions and objects over time |
| Question | What is true about this object? | What do we know about deciding and interpreting? |
| Instance | Per project / object | Product-level (and later validated via pilots) |
| Consumed by | Interpretation / Decision Strategy / Experience surfaces | See [Decision Layer SSOT](../../architecture/decision-layer/README.md) |
| Replaces the other? | No | No |

Object Package is **encoded object truth**.  
Knowledge is **how that truth is used to create decision experiences**.

---

## 6. Long-term Types of Knowledge (Framework Only)

The system is expected to accumulate, over time, these knowledge types. This list is a framework, not a backlog of deliverables.

1. **Object knowledge** — structured truth carried by Object Packages.  
2. **Decision knowledge** — which questions, answers, and filters matter for choosing.  
3. **Interpretation knowledge** — how Decision × Object Package become highlights, order, and summary.  
4. **Experience knowledge** — which projected outcomes help visitors decide (validated in pilots).  
5. **Implementation knowledge** — repeatable Builder/process lessons that improve encoding quality.

Out of scope for this foundation document: Decision Assets catalogs, scoring models, recommendation engines, automated learning loops.

---

## 7. Relationship to Runtime, Experience, Product

```text
Product Knowledge (why / what we believe about deciding)
        │
        ▼
Decision design + Interpretation rules
        │
        ├── reads → Object Package (object truth)
        │
        ▼
ExperienceModel (projection)
        │
        ▼
Renderer
```

| Layer | Knowledge role |
| --- | --- |
| **Product** | Owns whether knowledge belongs in the shared Engine |
| **Runtime** | Remains a deterministic orchestrator; does not store Product Knowledge |
| **Decision** | Applies Decision Knowledge as domain behavior outside Core |
| **Experience** | Publishes results of interpretation; does not own Knowledge |
| **Pilots** | Validate and refine Knowledge without inventing Runtime features |

---

## 8. Quality Gate

A proposed “knowledge” item is valid only if:

1. It improves personalized decision Experience, not just content volume.  
2. It has a clear home: Object Package, Decision Knowledge, or Pilot insight — not Runtime Core.  
3. It does not duplicate an existing SSOT.  
4. It is not introduced “for later” without a current Experience use.

---

## 9. Explicit Non-Goals (this document)

- AI / LLM  
- Decision Assets inventory  
- Knowledge Base product  
- Analytics platform  
- Automatic optimization  
