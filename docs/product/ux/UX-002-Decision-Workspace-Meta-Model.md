# UX-002 — Decision Workspace Meta-Model

## Status

**Status:** Proposed Product Domain Model  
**Version:** 0.1  
**Date:** 2026-07-21  
**ID:** UX-002  
**Layer:** UX 2.0 — Decision Workspace Meta-Model  
**Not SSOT for:** wireframes, layout, components, graphic design, frontend, implementation, Runtime algorithms

**Navazuje na:**

- [UX-001 — Decision Workspace Philosophy](./UX-001-Decision-Workspace-Philosophy.md)
- [Decision Experience Grammar (DEG)](../decision-experience-grammar/DEG.md)

---

## 1. Decision Workspace

**Decision Workspace** je nejvyšší produktová entita Experience.

Workspace není stránka.

Workspace není layout.

Workspace není sada komponent.

Workspace je **prostředí pro podporu rozhodování**.

Drží stabilní mentální mapu (UX-001 — Structural Stability).
Uvnitř této mapy probíhá adaptivní interpretace (UX-001 — Adaptive Interpretation).

Client Studio je jedna implementace Decision Workspace.
Není definiční hranicí modelu.

---

## 2. Workspace Sections

Workspace se skládá **pouze ze stabilních Sections**.

Section má rozhodovací účel.
Section je část mentální mapy Workspace.
Section se mezi návštěvami **nemění**.

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

Section odpovídá na otázku: *proč je tato část Workspace potřeba?*

Tool odpovídá na otázku: *čím člověk v této části pracuje?*

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

Nová technologie nevytváří novou Section.
Vytváří nové Tool uvnitř existující Section — nebo zůstává mimo model, dokud nemá rozhodovací účel.

---

## 4. Structural Model

První osa UX 2.0 — **statická struktura Experience**:

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

Structural Model popisuje, **jak je Experience organizována**.

Nepopisuje, jak Experience reaguje.
Nepopisuje, proč reaguje.

---

## 5. Runtime Model

Druhá osa UX 2.0 — **chování Experience**:

```text
Interaction
     ↓
  Signal
     ↓
Interpretation
     ↓
 Adaptation
     ↓
Updated Tool
     ↓
  Outcome
```

### Meaning

- **Interaction** — člověk jedná v Tool.
- **Signal** — jednání je pozorováno jako vstup.
- **Interpretation** — Kernel čte význam jednání.
- **Adaptation** — mění se obsah, důraz, pořadí informací uvnitř Tool / Section.
- **Updated Tool** — člověk vidí upravenou realizaci stejného účelu.
- **Outcome** — rozhodovací stav se posouvá.

Runtime Model popisuje, **jak Experience reaguje**.

Nepopisuje strukturu Workspace.
Nemění Sections.
Nemění mentální mapu.

---

## 6. Separation of Concerns

| Layer | Responsibility |
| --- | --- |
| **Workspace** | organizuje Experience |
| **Section** | rozhodovací účel |
| **Tool** | umožňuje interakci |
| **Runtime** | pozoruje |
| **Kernel** | interpretuje |
| **Adaptation** | mění obsah |

### Rules

- Workspace nevysvětluje chování.
- Section nevymýšlí UI.
- Tool nevytváří nový rozhodovací účel.
- Runtime nevymýšlí strukturu Workspace.
- Kernel neřeší layout.
- Adaptation nemění Sections.

Toto rozdělení chrání Structural Stability (UX-001)
a umožňuje Adaptive Interpretation (UX-001) bez chaosu ve struktuře.

---

## 7. Three Fundamental Axes

UX 2.0 stojí na třech oddělených dimenzích:

### Structure

**Jak je Experience organizována.**

Workspace → Sections → Tools.

Stabilní mentální mapa.
Nemění se mezi návštěvami.

### Behavior

**Jak Experience reaguje na uživatele.**

Interaction → Signal → … → Updated Tool → Outcome.

Dynamika běhu.
Mění se v čase jedné Session i napříč návštěvami.

### Interpretation

**Proč Experience reaguje právě tímto způsobem.**

Význam Signalů, Progressive Understanding, sdílený rozhodovací kontext.

Interpretation spojuje Behavior se smyslem rozhodnutí.
Není synonymem Structure.
Není synonymem Behavior.

### Separation rule

Tyto tři dimenze musí zůstat oddělené.

Smíchání Structure a Behavior vytváří nestabilní produkt.
Smíchání Behavior a Interpretation vytváří nepochopitelnou adaptaci.
Smíchání Structure a Interpretation vytváří „inteligentní layout“, který ničí důvěru.

---

## 8. Product Consequences

| Consequence | Meaning |
| --- | --- |
| Nové funkce = nová Tools | Ne nové Sections. Section vzniká jen s novým rozhodovacím účelem. |
| Adaptuje se obsah | Ne struktura. Mentální mapa zůstává. |
| UX je dlouhodobě stabilní | Učení Workspace se amortizuje napříč návštěvami a lidmi. |
| Runtime může růst | Evoluce Runtime / Kernel / Adaptation nemění Workspace mapu. |
| Nové technologie = Tools | AR, VR, Voice AI a další vstupují jako Tools uvnitř existujících Sections. |

### Forbidden shortcuts

- Přidat „novou sekci“, protože existuje nová komponenta.
- Měnit pořadí Sections podle A/B testu bez změny rozhodovacího účelu.
- Pojmenovat Tool jako Section.
- Pojmenovat layout panel jako Section.

---

## 9. Relationship to UX-001

| Document | Answers |
| --- | --- |
| **UX-001** | *Proč* Workspace existuje |
| **UX-002** | *Jak* je Workspace modelován |

UX-001 definuje filozofii:

- Structural Stability
- Adaptive Interpretation
- Progressive Understanding
- Decision Before Conversion
- Shared Decision Context

UX-002 převádí tuto filozofii do doménového modelu:

- stabilní **Sections** = mentální mapa
- zaměnitelné **Tools** = adaptivní realizace
- **Structure / Behavior / Interpretation** = tři oddělené osy

### Terminology continuity

UX-001 používá příklady jako Hero, Priority, FAQ, AI, Audit, Report ve smyslu adaptivního obsahu Experience.

UX-002 zpřesňuje stejný princip:

- **Hero, Priority, Audit** zůstávají **Sections** (rozhodovací účel).
- **FAQ, AI** patří do Section **Racio** jako **Tools**.
- **Report** patří do Section **Audit** (nebo Closing) jako **Tool**.
- **Tour** sjednocuje prohlídkové Tools (Gallery, Floor Plan, …).
- **Header** a **Closing** doplňují stabilní mapu Workspace.

Filozofie se nemění.
Model se zpřesňuje.

> Stabilní je struktura (Sections).  
> Adaptivní je interpretace (obsah Tools).

---

## Out of scope

Tento dokument **neřeší**:

- wireframy
- layout a rozmístění panelů
- komponenty a frontend
- implementaci
- Runtime algoritmy
- konkrétní Tool katalog mimo ilustrativní příklady

---

## Governance

- UX-002 je **Proposed** referenční meta-model pro Decision Experiences.
- Budoucí Decision Experiences musí používat Vocabulary: Workspace, Section, Tool, Structure, Behavior, Interpretation.
- Default Section set (Header, Hero, Tour, Priority, Racio, Audit, Closing) je výchozí mentální mapa.
- Změna Section setu je produktové rozhodnutí — ne UI experiment.
- Konflikty „nová feature = nová Section“: **UX-002 vyhrává** (feature = Tool).
