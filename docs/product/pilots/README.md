# Pilot Foundation

**Status:** APPROVED  
**Version:** 1.0  
**Scope:** Product meaning of pilots  
**SSOT for:** Pilot Layer (product framing)  
**Not SSOT for:** Roadmap phase dates, QA test plans, Runtime features, Knowledge Base

**Related**

- Knowledge: [Knowledge Foundation](../knowledge/README.md)
- Object Package: [Object Package Product Contract](../object-package.md)
- Roadmap: [Embed Engine Roadmap](../../roadmap/embed-engine-roadmap.md) (timing only)
- Product: [Business Model / pilot commercial notes](../vision/business-model.md) (commercial framing; this document owns pilot-as-knowledge-process)

---

## 1. Purpose

This document defines why pilots exist in Embed Engine and what they produce as **knowledge**.

**First concrete pilot knowledge model:** [`../../pilot/README.md`](../../pilot/README.md) (CAP-P01 — house-modern-01 + disposition-layout-v1).

---

## 2. Why Pilots Exist

Pilots exist to:

- verify that Object Package + Decision + Interpretation create useful Experience in reality,
- learn which decision questions and interpretations matter,
- protect the shared Engine from speculative features,
- convert real project friction into durable Product Knowledge.

Commercial pilot terms (pricing, priority of development) may appear in business documents.  
This SSOT defines the **knowledge purpose** of pilots.

---

## 3. What Is Validated During a Pilot

A pilot validates, at minimum:

| Area | Question |
| --- | --- |
| Object Package | Are encoded object truths complete enough for the intended Experience? |
| Decision | Do questions and answers reflect real visitor priorities? |
| Interpretation | Do highlights / recommended order / summary feel meaningful? |
| Experience | Can renderers show the projection without reconstructing domain state? |
| Process | Can Builder capture and update object truth repeatably? |

A pilot does **not** primarily validate:

- Runtime Kernel internals,
- visual pixel polish as an end in itself,
- AI quality,
- analytics completeness.

Those may occur alongside a pilot, but they are not the pilot’s knowledge mission.

---

## 4. Expected Outputs

Every pilot must leave behind:

1. **Validated Experience path** — a concrete Decision → Interpretation → Experience sequence that worked (or failed clearly).  
2. **Object Package gaps** — missing or ambiguous object truths that blocked interpretation.  
3. **Decision / interpretation lessons** — which preferences mattered, which did not.  
4. **Process notes** — Builder/implementer steps that were unclear or repeated.  
5. **Explicit non-learnings** — what was noise and must not enter Product Knowledge.

Outputs are written as product insights for the Knowledge Layer. They are not dumped into Runtime.

---

## 5. What Is Stored as New Knowledge

| Stored as Knowledge | Not stored as Knowledge |
| --- | --- |
| Repeatable decision/interpretation patterns | One-off client whims without Engine value |
| Object truth fields proven necessary for Experience | UI decorations unrelated to deciding |
| Builder capture rules that prevent gaps | Temporary workarounds |
| Confirmed failures (“do not ask / do not highlight X”) | Unverified opinions |

New knowledge updates Product Knowledge / Decision Knowledge framing.  
It may later justify Object Package contract refinements or Decision design changes.  
It must not silently invent Runtime API surface.

---

## 6. Relationship to Runtime, Experience, Product

```text
Pilot (real project + real visitors/sales context)
        │
        ▼
Observations
        │
        ├──► refine Object Package contract usage
        ├──► refine Decision Knowledge
        └──► refine what Experience must project
                │
                ▼
         Shared Engine value
```

| Layer | Pilot relationship |
| --- | --- |
| **Product** | Accepts or rejects pilot learnings into the shared Engine story |
| **Runtime** | Stays stable; pilots should not require Kernel changes by default |
| **Experience** | Is the observable outcome used to judge pilot success |
| **Knowledge** | Is the durable residue of the pilot |
| **Roadmap** | Schedules when pilots happen; does not redefine what a pilot is |

---

## 7. Success Criteria (Knowledge View)

A pilot succeeds when:

- at least one end-to-end personalized Experience path is exercised on real object truth,
- gaps are recorded as Object Package or Decision Knowledge work — not as undocumented UI hacks,
- the shared Engine is smarter for the next project, even if the pilot client’s custom wish is refused.

A pilot fails as a knowledge process when:

- learnings stay only in chat or individual memory,
- renderer logic absorbs domain knowledge,
- features are added without a stated knowledge hypothesis.

---

## 8. Explicit Non-Goals (this document)

- Test automation strategy  
- AI evaluation  
- Analytics instrumentation plan  
- Decision Assets library  
- Automatic optimization from pilot data  
