# Priority Experience Content Model

**Status:** APPROVED (v1.0)  
**Version:** 1.0  
**Date:** 2026-07-21  
**SSOT for:** Univerzální obsahová vrstva Priority Experience — typy obsahu, hierarchie, kontrakty textů, tón, varianty, lokalizace, AI generování  
**Not SSOT for:** UX principy (Bible), Journey kostra (Blueprint), Runtime kontrakt, Renderer/layout, React

**Derived from:**

- [Priority Experience Bible](./Priority%20Experience%20Bible.md)
- [Priority Decision Journey Blueprint](./Priority%20Decision%20Journey%20Blueprint.md)
- [Garden Decision Journey](./content/priority-garden.md) — referenční obsah, ne závislost modelu
- [Priority Experience Runtime Contract](../architecture/contracts/Priority%20Experience%20Runtime%20Contract.md)

---

## 1. Purpose

Tento dokument formalizuje **obsahovou vrstvu** Priority Experience.

Odděluje:

| Vrstva | Odpovědnost | SSOT |
| --- | --- | --- |
| Filozofie / jazykové principy | Proč a jak mluvíme | Priority Experience Bible |
| Journey kostra | Jaké fáze a v jakém pořadí | Priority Decision Journey Blueprint |
| Runtime | Vstupy, výstupy, gate, události | Priority Experience Runtime Contract |
| **Content** | Jaký obsah existuje, co smí říkat, jak se variantuje a lokalizuje | **tento dokument** |
| Renderer | Jak se obsah zobrazí | mimo Content Model |

### Co Content Model dělá

- Definuje typy obsahu potřebné pro libovolnou Priority Journey
- Definuje hierarchii a vlastnictví textů
- Formalizuje kontrakty polí (co musí obsahovat / co nesmí)
- Stabilizuje tón, varianty, lokalizaci a pravidla AI generování

### Co Content Model nedělá

- Nemění Decision Journey ani stage order
- Nezavádí nové UX principy
- Nedefinuje Runtime API ani UI komponenty
- Nedefinuje sémantická rules Interpretation Engine

### Základní oddělení významu a komunikace

```text
Interpretation     → machine meaning (bez UI copy)
Experience         → presentation-ready semantic content
Journey chrome     → stage microcopy (Selection / Confirmation / Transition / Mapping / Follow-up)
UI chrome          → neutrální popisky rozhraní (ne význam)
```

Bible P08 / R07: sémantický význam pro uživatele patří Experience (a stage intent payloads), ne Rendereru.

---

## 2. Content Types

Univerzální typy obsahu. Platí pro každou prioritu.

### 2.1 Priority Definition Content

| Field (conceptual) | Role | Source pattern |
| --- | --- | --- |
| `priorityId` | Stabilní machine id | Garden: `garden` |
| `priorityLabel` | Uživatelský název | Garden: Zahrada |
| `priorityMeaning` | Co priorita znamená produktově | Garden §1 |
| `priorityNot` | Čím priorita není | Garden §1 |

### 2.2 Intent Content

| Field | Role | Source pattern |
| --- | --- | --- |
| `userIntentPhrases` | Jak lidé záměr říkají | Garden §2 |
| `intentSummary` | Jedna věta pro Confirmation | Garden §2; Blueprint §3.2 |

### 2.3 Possible Meanings Content

| Field | Role | Source pattern |
| --- | --- | --- |
| `possibleMeanings[]` | Běžné lidské motivace (bez psychologické terminologie) | Garden §3 |

**Authoring note (derived):** Garden explicitně říká, že systém v MVP motivaci neuhádne. Possible Meanings slouží autorům obsahu a kvalitě Interpretation — **ne jako diagnóza uživatele v UI**.

**Open Question — OQ-C01:**  
SSOT neříká, zda se Possible Meanings smí kdykoli zobrazit uživateli (např. jako nápověda). Dokud není rozhodnuto, default = **authoring-only**.

### 2.4 Stage Microcopy

| Stage | Required content units | Source |
| --- | --- | --- |
| Selection | Výzva k výběru záměru | Bible Language Guide; Blueprint §3.1 |
| Confirmation | title, body, primaryAction, secondaryAction | Blueprint §3.2; Garden §4 |
| Transition | 1–2 věty bridge copy | Blueprint §3.3; Garden §5 |
| Interpretation | Experience fields (viz §2.5) | Blueprint §5 |
| House Mapping | claim → anchor + why (+ optional „k ověření“) | Blueprint §6; Garden §7 |
| Follow-up | recommended next steps / module handoffs | Blueprint §3.6; Garden §8 |

### 2.5 Experience Semantic Content

Povinná presentation-ready pole (Blueprint §5):

| Field | Content role |
| --- | --- |
| `title` | Název čtení optikou priority |
| `summary` | Hypotéza v prostém jazyce |
| `focus[]` | Důrazy čtení |
| `evidence[]` | Důvody vázané na objekt (`title` + `description`) |
| `concerns[]` | Rizika / na co si dát pozor |
| `confidence` | Úroveň + skóre + explanation (upřímná jistota) |
| `recommendations[]` | Směr dalšího porozumění |
| `actions[]` | Další kroky (label; ne nátlak ke koupi) |

### 2.6 House Mapping Content

| Field | Role |
| --- | --- |
| `claimRef` | Vazba na Experience claim |
| `objectAnchor` | Místo / zóna / prvek / vztah / médium |
| `why` | Jedna věta relevance k prioritě |

### 2.7 UI Chrome Content

Neutrální popisky rozhraní (Bible: Chrome ≠ význam).

Příklady: názvy sekcí, aria labels, systémové stavy bez sémantiky.

**Constraint:** UI chrome nesmí nést novou interpretaci objektu.

### 2.8 Explicitly out of Content Model

| Not a Priority Experience content type | Why |
| --- | --- |
| Object facts | Belong to Object Package |
| Machine Interpretation factors/codes | Belong to Interpretation (ADR-012); no UI wording |
| Layout / visual tokens | Renderer |
| Lead / sales scripts before understanding | Forbidden by Bible P06 as Journey content |

---

## 3. Content Hierarchy

```text
Priority Content Pack (`content/priority-<id>`)
├── Priority Definition
├── Intent Content
├── Possible Meanings (authoring)
└── Stage Content
    ├── Selection microcopy
    ├── Confirmation microcopy
    ├── Transition microcopy
    ├── Interpretation → Experience semantic content
    ├── House Mapping entries
    └── Follow-up handoffs
```

### Ownership rules

| Content | Owned by | Consumed by |
| --- | --- | --- |
| Priority Content Pack | Product content (`priority-*.md` / future pack) | Runtime binding + renderers |
| Experience semantic fields | Interpretation → Experience composition | All semantic renderers |
| Stage microcopy (Confirmation/Transition) | Priority Content Pack | Journey stages before/around Experience |
| UI chrome | Product locale / design system | Renderer only |
| Object facts | Object Package | Interpretation (read-only) |

### Hierarchy invariants

1. Experience semantic content **nepřebíjí** Confirmation intent copy — mají jiné fáze.
2. House Mapping **neobsahuje** nový summary/confidence — lokalizuje Experience.
3. Follow-up text **neinterpretuje** znovu objekt — odkazuje na další modul.
4. UI chrome **nepatří** do Experience polí.

---

## 4. Content Contracts

### 4.1 Confirmation content contract

**MUST**

- Mluvit o uživatelském záměru
- Obsahovat cestu potvrdit + upravit výběr
- Respektovat zvolenou prioritu

**MUST NOT**

- Hodnotit kvalitu objektu
- Uvádět skóre shody
- Nabízet koupi / lead
- Vnutit jinou prioritu

### 4.2 Transition content contract

**MUST**

- 1–2 věty
- Přepnout očekávání na čtení (ne skóre)

**MUST NOT**

- Verdikt, procenta, dlouhý marketing, nová priorita
- Přidávat nový význam objektu

### 4.3 Experience content contract

**MUST**

- Formulovat hypotézu („podle vaší priority…“ / ekvivalent)
- Vázat evidence/concerns na objekt
- Uvádět upřímnou confidence
- Nabízet další krok porozumění (recommendations/actions)

**MUST NOT**

- Absolutní verdikty („ideální“, „musíte koupit“)
- Falešná preciznost jako fakt o životě uživatele
- Diagnóza osobnosti
- Přepis Priority Selection
- House Mapping uvnitř textu jako náhrada Mapping fáze

### 4.4 House Mapping content contract

**MUST**

- Mapovat claim → anchor + why
- Krýt klíčová tvrzení Experience (nebo explicitní „k ověření“)
- Zůstat v scope aktivní priority

**MUST NOT**

- Inventovat novou hypotézu
- Zvýraznit celý dům „pro jistotu“
- Měnit Experience fields
- Spouštět konverzi

### 4.5 Follow-up content contract

**MUST**

- Aspoň jeden doporučený další krok

**MUST NOT**

- Být pouze lead/audit před porozuměním

### 4.6 Microcopy contract (Bible)

1. Jeden úkol na mikrotext  
2. Záměr dřív než výsledek  
3. Hypotéza, ne soud  
4. Objekt musí být přítomen v sémantickém obsahu  
5. Chrome ≠ význam  
6. Žádná nová priorita v copy  

---

## 5. Tone Rules

Odvozeno z Bible Language Guide.

### Required tone

- Klidný, věcný, partnerský
- Orientovaný na porozumění
- Konkrétní k objektu a rozhodnutí
- Respektující nejistotu

### Preferred stems

| Intent | Preferred direction |
| --- | --- |
| Selection | „Co je pro vás podstatné?“ |
| Hypothesis | „Podle vašich priorit se objekt čte takto…“ |
| Evidence | „Protože…“ / „To podporuje…“ |
| Risk | „Na co si dát pozor…“ |
| Confidence | „Míra jistoty tohoto čtení…“ |
| Next step | „Doporučený další krok…“ |

### Forbidden tone / phrases

- Absolutní verdikty
- Falešná preciznost („shoda 97 % s vaším životem“ jako fakt)
- Nátlak („poslední šance“, „jen dnes“)
- Přepisování uživatele
- Marketing bez vazby na objekt a záměr
- Jazyk konfigurátoru jako popis Priority Experience

### Confidence tone

- Nízká/střední jistota je legitimní obsah (Bible R06)
- Vysoká jistota bez evidence je zakázaný obsah

---

## 6. Variant Rules

### What may vary by priority

(Blueprint §7 — priority-specific)

- `priorityLabel` / meaning / not
- Intent phrases + intentSummary
- Possible Meanings
- Confirmation / Transition copy
- Experience field values
- House Mapping anchors + why
- Follow-up handoff list

### What must not vary by priority

- Stage set and order
- Experience field set (title…actions)
- Confirmation/Transition/Experience/Mapping contracts (§4)
- Tone + forbidden phrases
- Rule „Chrome ≠ význam“
- Separation Interpretation (machine) vs Experience (presentation)

### Object variants

House Mapping a části Experience se smí lišit objektem (`house-modern-01` vs jiný Object), pokud:

- zůstává stejná priorita a Journey,
- fakta objektu se nemění obsahem,
- mapping zůstává claim → anchor + why.

### Multi-priority variants

**Open Question — OQ-C02:**  
Blueprint/Runtime označují multi-priority precedence jako otevřenou. Content Model proto **nedefinuje** sloučené copy pro více čoček najednou. Do rozhodnutí platí obsah pro **jednu aktivní čočku** na Journey run.

---

## 7. Localization Rules

### MVP (derived)

- Uživatelské texty Priority Experience komunikují **česky** (Bible Language Guide).
- Garden referenční copy je CS.

### Stable across locales (when added)

- `priorityId` and machine keys remain stable
- Experience field structure remains stable
- Stage contracts remain stable
- Tone rules apply in every locale (hypothesis, no verdict, no pressure)

### Locale process

- Semantic meaning is authored per locale; Renderer does not invent translation.
- UI chrome may be localized independently of Experience fields.

### Open Question — OQ-C03

SSOT nedefinuje:

- seznam podporovaných locales po MVP,
- fallback při chybějícím překladu,
- zda Interpretation machine codes mají locale-independent glossary.

Dokud není rozhodnuto: MVP = CS only; jiné locales nejsou součástí tohoto Modelu.

### Open Question — OQ-C04

SSOT nedefinuje max. délky polí (title/summary/actions).  
Content Model proto nestanovuje character limits — jen tón a kontrakty.

---

## 8. AI Generation Rules

Pravidla pro AI (nebo jakékoli generativní) vytváření obsahu Priority Experience.  
Nevytvářejí nové UX principy — vynucují stávající SSOT.

### AI MAY

- Navrhovat stage microcopy a Experience texty **v rámci** Tone + Content Contracts
- Navrhovat House Mapping `why` věty vázané na existující Experience claims a Object anchors
- Navrhovat Possible Meanings jako authoring pomoc
- Překládat do jiných locales **až** po uzavření OQ-C03, se zachováním struktury polí

### AI MUST

- Respektovat Priority Selection (Bible R05) — nesmí přepsat zvolenou prioritu
- Formulovat Interpretation/Experience jako hypotézu (R01)
- Vázat sémantická tvrzení na objekt (R04)
- Oddělit machine Interpretation od presentation Experience (ADR-012 / P08)
- Zachovat stage order a contracts Blueprintu
- Označit nejistotu, pokud chybí fakta (R06)

### AI MUST NOT

- Generovat verdikty ke koupi nebo nátlakové CTA v Confirmation/Interpretation
- Vymýšlet Object facts
- Diagnostikovat osobnost uživatele z Possible Meanings
- Přidávat novou Journey fázi nebo měnit pořadí
- Generovat Experience copy, které Renderer „vylepší“ mimo Experience kontrakt
- Automaticky přepisovat uživatelské priority (Bible MVP Scope)
- Tvrdit falešnou preciznost jako fakt o životě uživatele

### AI output validation checklist

Před přijetím AI obsahu:

1. Passes §4 Content Contracts  
2. Passes §5 Tone Rules  
3. No new priority injected  
4. Experience fields complete if Interpretation stage  
5. Mapping entries do not alter Experience meaning  
6. No lead-only Follow-up before understanding  

### Open Question — OQ-C05

SSOT nedefinuje, zda AI smí za běhu generovat Experience live, nebo pouze authoring-time drafty do `priority-*.md`.  
Do rozhodnutí: Content Model podporuje **obě cesty jen pokud** výstup splní kontrakty; Runtime ownership live generování není součástí tohoto dokumentu.

---

## 9. Acceptance Criteria

Content pack / text set je akceptovatelný, když:

### Completeness

- [ ] Má Priority Definition + Intent + Stage microcopy + Experience fields + House Mapping + Follow-up
- [ ] Possible Meanings existují alespoň pro authoring (nebo explicitně N/A)

### Contracts

- [ ] Confirmation = intent-only
- [ ] Transition = 1–2 věty, bez verdiktu
- [ ] Experience = hypotéza + evidence/concerns/confidence/actions
- [ ] Mapping = claim → anchor + why
- [ ] Follow-up ≠ lead-only před porozuměním

### Separation

- [ ] Žádný sémantický význam pouze v UI chrome
- [ ] Žádné Object facts vymyšlené obsahem
- [ ] Journey order nezměněn

### Tone / locale

- [ ] Splňuje Tone Rules
- [ ] MVP texts in Czech (unless OQ-C03 closed otherwise)

### Variants / AI

- [ ] Priority-specific only where Variant Rules allow
- [ ] AI-produced content passes AI MUST/MUST NOT
- [ ] Open Questions not silently filled by invention

---

## Governance

| Document | Owns |
| --- | --- |
| Priority Experience Bible | Philosophy, principles, language intent |
| Priority Decision Journey Blueprint | Stages and stage contracts (structure) |
| Priority Experience Runtime Contract | Runtime inputs/outputs/events/gates |
| **Priority Experience Content Model** | Content types, hierarchy, text contracts, tone, variants, locale, AI content rules |
| `content/priority-*.md` | Concrete content instances |

- Konflikty „jiný tón pro prioritu X“: **Content Model + Bible vyhrávají**.
- Konflikty „jiná Journey kvůli copy“: **Blueprint vyhrává**.
- Uzavření OQ-C01…OQ-C05 vyžaduje update tohoto dokumentu (a případně Bible/Runtime) — ne tichou konvenci v kódu.
