# Priority Experience Runtime Contract

**Status:** APPROVED (v1.0)  
**Version:** 1.0  
**Date:** 2026-07-21  
**SSOT for:** Runtime kontrakt mezi Kernel / Interpretation vrstvou a Priority Experience (libovolná Priority Journey)  
**Not SSOT for:** React, DOM, CSS, konkrétní package API, Object Package schema, Behavior Pack schema, layout

**Derived from (product SSOT):**

- [Priority Experience Bible](../../product/Priority%20Experience%20Bible.md)
- [Priority Decision Journey Blueprint](../../product/Priority%20Decision%20Journey%20Blueprint.md)
- [Garden Decision Journey](../../product/content/priority-garden.md) — referenční obsahový příklad, ne závislost kontraktu

**Aligned with (architecture):**

- [ADR-012 — Interpretation as first-class artifact](../adr/ADR-012-interpretation-first-class-artifact.md)
- [RI-003 — Experience Kernel](../../04-reference-implementation/RI-003-Experience-Kernel.md)
- [DEG](../../product/decision-experience-grammar/DEG.md)

---

## 1. Purpose

Tento kontrakt definuje, **co musí Runtime / Interpretation vrstva poskytnout a přijmout**, aby Priority Experience mohla vykreslit libovolnou Priority Journey podle Blueprintu.

Kontrakt odpovídá na:

- jaké vstupy jsou nutné,
- jaké výstupy musí vzniknout v jednotlivých fázích,
- jaká stage pravidla Runtime nesmí porušit,
- jaké události Journey předpokládá,
- co je stabilní extension point a co je Open Question.

### Co kontrakt je

- Technologicky nezávislá hranice mezi **významem** (Object → Interpretation → Experience) a **Priority Experience** (Journey fáze + render).
- Základ pro implementaci Experience Runtime / Priority surface bez vázání na konkrétní UI stack.

### Co kontrakt není

- Specifikace React komponent
- Specifikace Signal enumů v kódu (pokud nejsou odvozené ze SSOT)
- Obsah jedné priority (to řeší `content/priority-*.md`)

### Canonical pipeline (ADR-012 + Bible)

```text
Object
    ↓
PrioritySelection
    ↓
Interpretation          ← machine meaning (no presentation)
    ↓
Experience              ← presentation contract for semantic UI
    ↓
Priority Experience     ← Journey stages + renderers
```

Priority Experience **neinterpretuje**.  
Renderuje Experience a řídí Journey fáze podle Blueprintu.

---

## 2. Runtime Inputs

Vstupy, které Priority Experience Runtime **vyžaduje** pro běh Journey.

### 2.1 Object binding

| Input | Required | Source SSOT | Notes |
| --- | --- | --- | --- |
| Object identity | Yes | Bible R02, ADR-012, Blueprint §5 | Stabilní reference na objekt pod rozhodnutím |
| Object facts (read-only) | Yes (for Interpretation) | Bible R02, ADR-012 | Fakta se nemění interpretací; Runtime je neprezentuje jako význam |

**Constraint:** Priority Experience nesmí mutovat Object.

### 2.2 Priority Selection

| Input | Required | Source SSOT | Notes |
| --- | --- | --- | --- |
| Selected priority id(s) | Yes | Bible §3.1, Blueprint §3.1, ADR-012 | Vyjádřený uživatelský záměr |
| Selection completeness for Confirmation | Yes | Blueprint Selection → Confirmation | Bez Selection nelze potvrdit |

**Constraint:** Priority Selection neobsahuje Interpretation (ADR-012).

### 2.3 Journey confirmation state

| Input | Required | Source SSOT | Notes |
| --- | --- | --- | --- |
| Confirmation of current Selection | Yes before Interpretation | Blueprint §3.2, §4; Bible P01 | „Potvrzený rozhodovací kontext“ |

Dokud Confirmation neproběhla, Runtime **nesmí** vystavit Interpretation/Experience jako výsledek Priority Journey.

### 2.4 Priority content binding

| Input | Required | Source SSOT | Notes |
| --- | --- | --- | --- |
| Priority Journey content for active priority | Yes | Blueprint §7; Garden as example | Copy a mapping pravidla z `content/priority-*.md` |

**Open Question — OQ-01:**  
SSOT nedefinuje formát „Priority content package“ (schema souboru, locale, versioning). Kontrakt vyžaduje pouze, že obsah existuje a je vázán na priority id.

### 2.5 Optional / out of MVP inputs

| Input | MVP | Source | Notes |
| --- | --- | --- | --- |
| Multi-user Priority sets | No | Bible MVP Scope, ADR-007 | Postponed |
| Relative priority budget | No | ADR-007 | Rejected for MVP |
| Cross-visit persistence of Selection / stage | No | ADR-007, Bible MVP | Active Experience only |

---

## 3. Runtime Outputs

Výstupy, které Runtime / Interpretation vrstva **musí** dodat Priority Experience (nebo které Priority Experience musí mít k dispozici).

### 3.1 Stage: Confirmation output

| Output | Required | Source SSOT |
| --- | --- | --- |
| Confirmed Priority Selection snapshot | Yes | Blueprint §3.2 |
| Confirmation presentation payload (intent language only) | Yes | Blueprint §3.2; Garden §4 as example shape |

**Must not include:** object quality claims, scores, purchase CTA.

### 3.2 Stage: Transition output

| Output | Required | Source SSOT |
| --- | --- | --- |
| Short transition message (1–2 sentences) | Yes | Blueprint §3.3; Garden §5 |

**Must not include:** verdict, match percentage, new priority.

### 3.3 Stage: Interpretation outputs

Podle ADR-012 + Blueprint Interpretation Contract:

| Output | Required | Role |
| --- | --- | --- |
| **Interpretation** | Yes | Machine-readable meaning (no UI copy) |
| **Experience** | Yes | Presentation contract for semantic UI |

Experience MUST be mappable to (Blueprint §5):

| Field | Required |
| --- | --- |
| `title` | Yes |
| `summary` | Yes |
| `focus` | Yes |
| `evidence` | Yes |
| `concerns` | Yes |
| `confidence` | Yes |
| `recommendations` | Yes |
| `actions` | Yes |

**Constraint (Bible P08 / R07):**  
Semantic UI of Priority Experience renders **Experience**, not raw Interpretation, not invented copy.

**Open Question — OQ-02:**  
Product SSOT nevyžaduje, zda Experience Composer běží uvnitř Kernel, Interpretation Engine, nebo Experience Kernel. Kontrakt vyžaduje pouze: po Confirmation existuje Experience odvozená z Object + confirmed Priority Selection přes Interpretation.

### 3.4 Stage: House Mapping output

| Output | Required | Source SSOT |
| --- | --- | --- |
| Mapping set: Experience claim → Object anchor + why | Yes | Blueprint §6; Bible R04; Garden §7 |

Každé mapování:

```text
claimRef     → reference to Experience claim (evidence / concern / focus item)
objectAnchor → room | zone | element | relation | medium (conceptual)
why          → one sentence of relevance to active priority
```

**Must not:** mutate Experience meaning; invent new hypothesis; highlight unrelated priorities.

**Open Question — OQ-03:**  
SSOT nefixuje kanonický typ `objectAnchor` (ID schema, vazba na Object Package paths, media ids). Kontrakt drží pouze konceptuální tvar z Blueprintu.

### 3.5 Stage: Follow-up output

| Output | Required | Source SSOT |
| --- | --- | --- |
| Recommended next module handoffs | Yes (at least one) | Blueprint §3.6; Garden §8 |

**Must not:** make lead/audit the only path before understanding (Bible P06).

---

## 4. Stage Contracts

Runtime MUST enforce Blueprint stage order:

```text
Priority Selection
        ↓
Confirmation
        ↓
Transition
        ↓
Interpretation
        ↓
House Mapping
        ↓
Follow-up
```

### 4.1 Per-stage runtime duties

| Stage | Runtime / Interpretation duty | Priority Experience duty |
| --- | --- | --- |
| **Selection** | Accept / store Priority Selection input | Render selection UI; emit selection change |
| **Confirmation** | Mark Selection confirmed; block Interpretation until confirmed | Render intent-only confirmation; emit confirm / edit |
| **Transition** | Expose transition payload; no Interpretation yet or gate visibility | Render short bridge copy |
| **Interpretation** | Produce Interpretation + Experience for confirmed context | Render Experience only |
| **House Mapping** | Provide mapping set bound to current Experience + Object | Render anchors; navigate/highlight without new meaning |
| **Follow-up** | Expose handoff targets derived from Experience / Journey | Render next steps; no new interpretation |

### 4.2 Gate rules (MUST)

Derived from Blueprint §4:

1. **No Interpretation before Confirmation.**
2. **No House Mapping before Experience exists.**
3. **No Follow-up shortcut from Transition.**
4. **On Priority Selection change:** invalidate Interpretation, Experience, and House Mapping for previous context; restart at Confirmation (or Selection if incomplete).
5. **Edit path:** Confirmation → Selection is allowed without producing Experience.

### 4.3 Invalidation rule

When confirmed context changes:

```text
previous Interpretation  → invalid
previous Experience      → invalid
previous House Mapping   → invalid
```

Runtime MUST NOT silently reuse previous Experience under a new Selection.

---

## 5. Runtime Events

Události, které Journey předpokládá. Pojmenování je **kontraktové** (produktové), ne vazba na konkrétní Signal enum v kódu.

### 5.1 Required journey events

| Event | Direction | Meaning | Source |
| --- | --- | --- | --- |
| `priority.selection.changed` | Experience → Runtime | Selection updated | Blueprint §3.1, §4 |
| `priority.confirmation.accepted` | Experience → Runtime | User confirmed lens | Blueprint §3.2 |
| `priority.confirmation.edit` | Experience → Runtime | Return to Selection | Blueprint §4 |
| `priority.transition.completed` | Experience → Runtime / or local | Bridge finished | Blueprint §3.3 |
| `priority.interpretation.ready` | Runtime → Experience | Experience available for confirmed context | Blueprint §3.4, ADR-012 |
| `priority.mapping.ready` | Runtime → Experience | House Mapping set available | Blueprint §3.5 |
| `priority.followup.selected` | Experience → Runtime | User chose a handoff target | Blueprint §3.6 |
| `priority.context.invalidated` | Runtime → Experience | Selection changed; clear stale outputs | Blueprint §4 |

### 5.2 Event constraints

- `priority.interpretation.ready` MUST NOT fire before `priority.confirmation.accepted` for the same Selection snapshot.
- `priority.mapping.ready` MUST NOT fire before `priority.interpretation.ready`.
- `priority.selection.changed` MUST cause `priority.context.invalidated` (or equivalent invalidation).

### 5.3 Open Question — OQ-04

SSOT **nedefinuje**, zda tyto události jsou:

- Cognitive Signals (RI-001 / ADR-003),
- Experience-local journey events (RI-003 „presentation state“),
- nebo hybrid.

Kontrakt vyžaduje pouze **sémantiku a pořadí** výše. Mapování na Signal typy je implementační rozhodnutí podléhající ADR, pokud má měnit Cognitive state.

### 5.4 Open Question — OQ-05

SSOT **nedefinuje** timeout / auto-complete pro Transition.  
Garden uvádí krátkou komunikaci; Blueprint dovoluje „i jako krátký stav“.  
Runtime MAY treat Transition as ephemeral presentation; MUST NOT skip Confirmation.

---

## 6. Runtime Constraints

Závazná omezení odvozená z Bible + Blueprint + ADR-012:

| ID | Constraint |
| --- | --- |
| C1 | Interpretation does not mutate Object facts. |
| C2 | Presentation does not invent semantic meaning. |
| C3 | Experience is the only semantic presentation contract for Priority Journey UI. |
| C4 | Confirmation speaks only about user intent, not object quality. |
| C5 | Interpretation is a hypothesis, not a purchase verdict. |
| C6 | Confidence must not be high without evidence. |
| C7 | House Mapping must not change Experience meaning. |
| C8 | Conversion / lead MUST NOT gate Confirmation or Interpretation. |
| C9 | Runtime MUST NOT reorder Blueprint stages. |
| C10 | Runtime MUST NOT invent multi-user or relative-budget Priority models in MVP. |
| C11 | Priority-specific content may vary; stage contracts may not. |
| C12 | Garden content is an example binding, not a Runtime hardcoding. |

---

## 7. Extension Points

Stabilní místa rozšíření **bez** změny tohoto kontraktu:

| Extension point | What may be added | What must stay |
| --- | --- | --- |
| `content/priority-*.md` | New priority copy, meanings, anchors, follow-ups | Universal stage order + gates |
| Experience renderers | Terminal, Report, cards, prototypes | Experience field contract |
| Object anchors | More rooms/media/relations for mapping | Mapping shape: claim → anchor + why |
| Follow-up targets | Tour, media, another priority, later audit | No lead-only pre-understanding path |
| Interpretation richness | More factors / rules behind Interpretation | Still produces Experience for UI |

### Non-extension (requires new contract / ADR)

- New Journey stage inserted into the sequence
- Interpretation before Confirmation
- Multi-actor Priority merge
- Persistent Priority profiles across visits as product promise
- House Mapping that writes Cognitive truth independent of Experience

### Open Question — OQ-06

Blueprint MVP assumes **one dominant lens** per Journey run.  
SSOT zatím plně nedefinuje runtime pravidlo precedence při více současně vybraných prioritách (kromě obecných zmínek v ADR-007 / implementační historii).  
Dokud není vydáno doplnění Bible/Blueprint, Runtime SHOULD document chosen precedence as temporary policy and MUST NOT claim it as this Contract’s SSOT.

---

## 8. Acceptance Criteria

Runtime / Priority Experience implementace splňuje tento kontrakt, když:

### Inputs / outputs

- [ ] Accepts Object binding + Priority Selection
- [ ] Blocks Interpretation/Experience Journey output until Confirmation
- [ ] Emits Experience with all required fields after Confirmation
- [ ] Emits House Mapping set bound to that Experience
- [ ] Provides at least one Follow-up handoff

### Stage gates

- [ ] Cannot go Selection → Interpretation directly
- [ ] Cannot go Confirmation → House Mapping directly
- [ ] Selection change invalidates previous Interpretation / Experience / Mapping
- [ ] Edit confirmation returns to Selection without leaving stale Experience visible as current truth

### Semantic rules

- [ ] UI semantic copy comes from Experience (or Confirmation/Transition intent payloads), not ad-hoc invention
- [ ] No purchase verdict language in Interpretation outputs
- [ ] House Mapping does not alter Experience fields

### Extensibility

- [ ] A second priority can be added via content binding without changing stage order
- [ ] Garden is not hardcoded as the only Runtime path

### Open Questions

- [ ] OQ-01…OQ-06 are tracked; no silent invention of missing schema/event mapping

---

## Governance

- Product philosophy/language: **Priority Experience Bible**
- Stage skeleton: **Priority Decision Journey Blueprint**
- Priority content: **`docs/product/content/priority-*.md`**
- This document: **Runtime boundary** for Priority Experience
- Conflicts inventing React/Signal details: **this Contract wins for stage gates; ADR wins for Cognitive Signal ownership**
- Closing an Open Question requires update to product SSOT and/or ADR — not a silent code convention

### Document hierarchy

```text
Priority Experience Bible
        ↓
Priority Decision Journey Blueprint
        ↓
Priority Experience Runtime Contract   ← this
        ↓
content/priority-*.md  +  implementation
```
