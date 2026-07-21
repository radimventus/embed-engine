# UX-001 — Decision Journey Specification (DJS)

## v0.1 — Product Draft

**Status:** Proposed Product Specification  
**Version:** 0.1  
**Date:** 2026-07-21  
**ID:** UX-001  
**SSOT for (when Approved):** Decision Journey — mental transformation trajectory for one visit  
**Not SSOT for:** UI, layout, components, implementation, Runtime, Session, Experience Kernel contracts

**Navazuje na:**

- [Decision Experience Grammar (DEG)](../decision-experience-grammar/DEG.md) — product layer grammar
- [Product Bible / product index](../README.md)
- [Decision Layer (architecture)](../../architecture/decision-layer/README.md)

**Related**

- Product Vision: [product-vision.md](../vision/product-vision.md)
- Experience Kernel: [RI-003](../../04-reference-implementation/RI-003-Experience-Kernel.md)
- First pilot: [../../pilot/README.md](../../pilot/README.md)

---

# 1. Purpose

Decision Journey Specification popisuje trajektorii mentální změny uživatele.

Neřeší:

* UI
* layout
* komponenty
* implementaci

Řeší jedinou otázku:

> Jak se během jedné návštěvy změní způsob rozhodování uživatele?

---

# 2. Design Principle

Produkt není sled obrazovek.

Produkt není sled komponent.

Produkt je sled mentálních transformací.

Každá etapa musí zanechat uživatele v lepším rozhodovacím stavu, než ve kterém do ní vstoupil.

---

# 3. Journey Overview

```text
Unknown
    ↓
Orientation
    ↓
Discovery
    ↓
Understanding
    ↓
Prioritization
    ↓
Confidence
    ↓
Commitment
    ↓
Consultation
    ↓
Action
```

---

# 4. Journey Stages

## Stage 1 — Orientation

### Vstup

Uživatel nezná objekt ani systém.

### Cíl

Rozumí:

* co si prohlíží,
* proč je to jiné,
* jak mu systém pomůže rozhodnout.

### Otázky

* Co právě vidím?
* Proč tomu věnovat pozornost?

### Výstup

Vzniká orientace.

---

## Stage 2 — Discovery

### Vstup

Uživatel je orientovaný.

### Cíl

Začíná objevovat hodnotu objektu.

Nevnímá jednotlivé informace.

Začíná chápat souvislosti.

### Výstup

Vzniká zvědavost.

---

## Stage 3 — Understanding

### Vstup

Uživatel vidí jednotlivé výhody.

### Cíl

Spojí informace do smysluplného celku.

Rozumí:

„Proč je tento objekt zajímavý právě pro mě.“

### Výstup

Vzniká porozumění.

---

## Stage 4 — Prioritization

### Vstup

Existuje více možných argumentů.

### Cíl

Systém pomůže určit, které jsou pro tohoto uživatele nejdůležitější.

### Výstup

Vzniká osobní relevance.

---

## Stage 5 — Confidence

### Vstup

Uživatel chápe hodnotu.

Stále může pochybovat.

### Cíl

Odstranit nejistotu.

Posílit důvěru.

Potvrdit správnost úvah.

### Výstup

Vzniká jistota.

---

## Stage 6 — Commitment

### Vstup

Uživatel je přesvědčen.

### Cíl

Připravit ho na další krok.

CTA již není tlak.

Je logickým pokračováním.

### Výstup

Vzniká závazek.

---

## Stage 7 — Consultation

### Vstup

Rozhodnutí je téměř hotové.

### Cíl

Neprodávat.

Pouze potvrdit.

Vyřešit poslední otázky.

### Výstup

Vzniká připravenost jednat.

---

## Stage 8 — Action

### Vstup

Rozhodnutí je učiněno.

### Cíl

Umožnit jednoduchou akci.

Například:

* rezervace schůzky,
* kontakt,
* žádost o informace,
* rezervace objektu.

### Výstup

Konverze.

---

# 5. Validation Questions

Každá etapa musí odpovědět na čtyři otázky.

## 1.

Co má uživatel právě vidět?

## 2.

Co má právě pochopit?

## 3.

Co má právě cítit?

## 4.

Jaká další akce je nyní přirozená?

Pokud některá etapa neumí odpovědět na všechny čtyři otázky, není připravena pro návrh UX.

---

# 6. Design Rule

Každé nové UX rozhodnutí musí být odůvodněno změnou mentálního stavu.

Nikdy ne estetickou preferencí.

Nikdy technickou implementací.

Nikdy existující komponentou.

---

# 7. Success Metric

Journey je úspěšná tehdy, když nový uživatel bez asistence:

* pochopí hodnotu systému během první minuty,
* získá důvěru v průběhu interakce,
* dospěje k informovanému rozhodnutí,
* přirozeně přejde k další akci.

---

# 8. Scope

Decision Journey Specification je referenční produktový artefakt.

Všechny budoucí návrhy Decision Workspace, UX 2.0 a jednotlivých Experience Modules musí být s touto trajektorií konzistentní.

Komponenty nejsou primární.

Primární je změna rozhodování uživatele.

---

# 9. Relationship to DEG and architecture

| Artefakt | Role |
| --- | --- |
| **DEG** | Jazyk Mentálních stavů a Experience operací |
| **DJS (this)** | Referenční trajektorie jedné návštěvy (stages) |
| **Decision Story / Moves** | Runtime vykonání dialogu |
| **Experience Chapters (DEG)** | Produktové celky; mapují se na DJS stages |
| **UI / UX 2.0** | Až po schválení stage a čtyřech validačních otázkách |

```text
Product Vision
      ↓
DEG (grammar)
      ↓
DJS (journey trajectory)     ← this draft
      ↓
Decision Story / Chapters
      ↓
Experience Modules
      ↓
UI
      ↓
Runtime
```

DJS nenahrazuje DEG. DEG definuje *jak mluvíme o změně rozhodování*. DJS definuje *jaká je kanonická trajektorie jedné návštěvy*.

---

# 10. Governance

- **v0.1** = Proposed Product Specification — ještě není kanonický SSOT.
- Po schválení (Status → Approved) se DJS stane SSOT pro Decision Journey.
- Konflikty s Runtime / Session / Experience Public Contracts: architektura vítězí; změna kontraktu vyžaduje ADR.
- UX 2.0 a Decision Workspace návrhy musí být konzistentní s touto trajektorií (i ve stavu Proposed, jako referenční směr).
