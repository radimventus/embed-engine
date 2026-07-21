# UX-002 — Decision Workspace Meta-Model

## Status

**Status:** Proposed Product Domain Model  
**Version:** 0.2  
**Date:** 2026-07-21  
**ID:** UX-002  
**Layer:** UX 2.0 — Decision Workspace Meta-Model (product only)  
**Not SSOT for:** wireframes, layout, components, graphic design, frontend, implementation, Runtime, Kernel, Platform Architecture

**Navazuje na:**

- [UX-001 — Decision Workspace Philosophy](./UX-001-Decision-Workspace-Philosophy.md)
- [Decision Experience Grammar (DEG)](../decision-experience-grammar/DEG.md)

---

## 1. Decision Workspace

**Decision Workspace** je nejvyšší produktová entita Experience.

Workspace není stránka.

Workspace není layout.

Workspace není sada komponent.

Workspace není modul ani frontendový kontejner.

Workspace je **prostředí pro podporu rozhodování**.

Drží stabilní mentální mapu (UX-001 — Structural Stability).
Uvnitř této mapy se mění interpretace obsahu (UX-001 — Adaptive Interpretation).

Client Studio je jedna implementace Decision Workspace.
Není definiční hranicí modelu.

---

## 2. Workspace Sections

Workspace se skládá **pouze ze stabilních Sections**.

### Co je Section

Section:

- není stránka
- není modul
- není komponenta

Section je **stabilní rozhodovací prostor**.

Má rozhodovací účel.
Je částí mentální mapy Workspace.
Mezi návštěvami se **nemění**.

### Default Section set

| Section | Purpose |
| --- | --- |
| **Header** | Orientace v Workspace — identita, kontext, navigace v mentální mapě |
| **Hero** | Vstupní rámec rozhodnutí — proč jsme zde a co je v sázce |
| **Tour** | Poznání objektu — prohlídka reality před kalibrací priorit |
| **Priority** | Kalibrace důležitosti — co je pro rozhodování podstatné |
| **Racio** | Porozumění a zdůvodnění — otázky, dialog, podklady pro racionální jistotu |
| **Audit** | Ověření a závazek — shoda rozhodnutí s realitou a další krok |
| **Closing** | Uzavření Experience — shrnutí, kontinuita, odchod se srozumitelným stavem |

### Invariant

Sections jsou stabilní.

Nemění se mezi návštěvami.

Nemění se podle kampaně, zařízení ani experimentu.

Mění se interpretace obsahu uvnitř Section — ne existence ani pořadí Sections ve Workspace mapě.

---

## 3. Sections vs Tools

### Rule

**Sections** mají rozhodovací účel.

**Tools** tento účel realizují.

| Concept | Question | Stability |
| --- | --- | --- |
| **Section** | *Proč je tato část Workspace potřeba?* | Stabilní |
| **Tool** | *Čím člověk v této části pracuje?* | Zaměnitelné |

### Examples

#### Tour

Účel Section: poznat objekt.

Tools (příklady):

- Gallery
- Video
- Floor Plan
- Room Navigator

#### Priority

Účel Section: kalibrovat důležitost.

Tools (příklady):

- Decision Cards
- Sliders
- Decision Terminal

#### Racio

Účel Section: porozumět a zdůvodnit.

Tools (příklady):

- FAQ
- AI
- Documentation
- Calculator

#### Audit

Účel Section: ověřit a zavázat.

Tools (příklady):

- Forms
- Recommendations
- Reports

### Invariant

Tools **nejsou** součástí architektury Workspace.

Tools jsou zaměnitelné.

Section zůstává.

Nová funkce znamená nové Tool — ne novou Section.
Nová technologie (AR, VR, Voice AI, …) vstupuje jako Tool uvnitř existující Section.

---

## 4. Structural Model

Produktový model organizace Experience:

```text
Decision Workspace
        ↓
    Sections
        ↓
      Tools
```

### Meaning

- **Workspace** organizuje Experience jako celek.
- **Sections** tvoří stabilní mentální mapu.
- **Tools** jsou vyměnitelné prostředky interakce uvnitř Sections.

Structural Model popisuje **Structure**:

> Jak je Experience organizována.

Nepopisuje Behavior platformy.
Nepopisuje Runtime pipeline.
Nepopisuje Kernel ani Decision State.

---

## 5. Product Responsibilities

UX-002 definuje pouze produktové odpovědnosti Decision Workspace.

| Layer | Responsibility |
| --- | --- |
| **Workspace** | organizuje Experience jako prostředí pro rozhodnutí |
| **Section** | drží stabilní rozhodovací účel |
| **Tool** | realizuje účel Section zaměnitelným způsobem |

### Product rules

- Workspace nevysvětluje platformní chování.
- Section nevymýšlí UI ani komponenty.
- Tool nevytváří nový rozhodovací účel.
- Nová feature ≠ nová Section.
- Layout panel ≠ Section.
- Komponenta ≠ Section.

### Boundary with Platform

| Product (UX / Experience) | Platform Architecture |
| --- | --- |
| Workspace, Sections, Tools | Workspace Engine, Runtime, Kernel |
| Experience Blueprint (budoucí UX-003+) | Blueprint Schema, Tool Contracts |
| Konkrétní slovník Sections a Tools | Unverzální mechanismy, Session, Signals |
| Strategie a kompozice Experience | Interpretation, Event Pipeline, Rendering |

Hlavní rozhodnutí sprintu:

> Platforma definuje mechanismy, kontrakty a jazyky.  
> Produkt definuje jejich konkrétní slovník, strategii a kompozici.

---

## 6. Design Principles

Tyto principy řídí produktový model Workspace.
Vycházejí z UX-001 a z objevů UX 2.0 sprintu.

### Structural Stability

Experience má stabilní strukturu.

Nemění se Sections.
Mění se pouze interpretace obsahu uvnitř Sections / Tools.

### Sections vs Tools

Section = stabilní rozhodovací účel.
Tool = zaměnitelná realizace.

Toto oddělení je hlavní produktový objev modelu.

### Section is not a component

Section není stránka, modul ani komponenta.
Section je stabilní rozhodovací prostor.

### Structure is product concern

Structure (Workspace → Sections → Tools) patří do produktu.

Behavior (reakce systému, Runtime, Kernel, Adaptation) patří do Platform Architecture — ne do UX-002.

### Decision Before Conversion

Workspace nejdřív podporuje kvalitní rozhodnutí.
Konverze je důsledek — ne cíl struktury.

### Shared Decision Context

Jedna Decision Session je sdílena mezi kupujícím, AI a obchodníkem.
Perspektivy se liší.
Kontext zůstává společný.
Struktura Workspace to umožňuje tím, že zůstává stejná mapa.

---

## 7. Relationship to UX-001

| Document | Answers |
| --- | --- |
| **UX-001** | *Proč* Workspace existuje |
| **UX-002** | *Jak* je Workspace modelován (produktově) |

UX-001 definuje filozofii:

- Structural Stability
- Adaptive Interpretation
- Progressive Understanding
- Decision Before Conversion
- Shared Decision Context

UX-002 převádí filozofii do produktového modelu:

- stabilní **Sections** = mentální mapa
- zaměnitelné **Tools** = realizace účelu
- **Structural Model** = organizace Experience

### Terminology continuity

UX-001 používá příklady jako Hero, Priority, FAQ, AI, Audit, Report ve smyslu adaptivního obsahu Experience.

UX-002 zpřesňuje stejný princip:

- **Hero, Priority, Audit** zůstávají **Sections**.
- **FAQ, AI** patří do Section **Racio** jako **Tools**.
- **Report** patří do Section **Audit** (nebo Closing) jako **Tool**.
- **Tour** sjednocuje prohlídkové Tools.
- **Header** a **Closing** doplňují stabilní mapu Workspace.

Filozofie se nemění.
Model se zpřesňuje.
Platformní chování se z modelu odkládá.

> Stabilní je struktura (Sections).  
> Adaptivní je interpretace (obsah Tools).

---

## Out of Scope

Tento dokument **neřeší**:

### UX / design

- wireframy
- layout a rozmístění panelů
- komponenty a frontend
- grafický design

### Platform Architecture (samostatná větev)

Tyto koncepty **nepatří do UX-002** a budou řešeny mimo UX dokumenty:

- Runtime
- Kernel
- Decision State
- Event Pipeline
- Interpretation (platformní mechanismus)
- Adaptation
- Session
- Blueprint Schema
- Tool Runtime
- Rendering
- Behavior jako platformní dimenze

### Budoucí UX dokumenty

- UX-003 — Experience Blueprint
- UX-004 — Section Contract
- UX-005 — Tool Contract
- UX-006 — Experience Flow

---

## Governance

- UX-002 je **Proposed** referenční produktový meta-model Decision Workspace.
- Vocabulary: Workspace, Section, Tool, Structural Model.
- Default Section set: Header, Hero, Tour, Priority, Racio, Audit, Closing.
- Změna Section setu je produktové rozhodnutí — ne UI experiment.
- Konflikty „nová feature = nová Section“: **UX-002 vyhrává** (feature = Tool).
- Konflikty „UX dokument má popisovat Runtime“: **Out of Scope** — Platform Architecture.
