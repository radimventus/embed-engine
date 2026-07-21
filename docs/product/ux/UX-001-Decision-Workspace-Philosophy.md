# UX-001 — Decision Workspace Philosophy

## Status

**Status:** Proposed Product Philosophy  
**Version:** 0.1  
**Date:** 2026-07-21  
**ID:** UX-001  
**Layer:** UX 2.0 — Product Philosophy  
**Not SSOT for:** wireframes, layout, components, graphic design, implementation, Runtime contracts

**Navazuje na:**

- [Decision Experience Grammar (DEG)](../decision-experience-grammar/DEG.md)
- [Decision Journey Specification (DJS)](../decision-journey/DJS.md) — Proposed
- [Product Vision](../vision/product-vision.md)
- [Product Constitution](../constitution/product-constitution.md)

---

## Purpose

Decision Workspace nevzniká jako nová stránka.

Nevzniká jako lepší prezentace domu.

Nevzniká jako konfigurátor, CMS, ani marketingový web.

Decision Workspace vzniká jako **pracovní prostředí pro podporu rozhodování**.

Cílem není ukázat objekt.

Cílem není prodat objekt rychleji.

Cílem je pomoci člověku **udělat kvalitní rozhodnutí**.

Client Studio je jednou z implementací tohoto prostředí.
Není konečnou podobou produktu.
Je důkazem, že Experience může sloužit rozhodování — ne prezentaci.

UX 2.0 začíná touto filozofií.
Ne layoutem.
Ne komponentami.
Ne wireframy.

---

## Principle 01 — Structural Stability

### Invariant

> Decision Workspace poskytuje stabilní mentální mapu, která se mezi návštěvami nemění.

> Adaptivní je interpretace, nikoli samotná struktura Experience.

### Proč

Stabilní struktura není estetické rozhodnutí.
Je produktový invariant.

#### Důvěra

Člověk důvěřuje prostředí, které poznává.
Pokud se mezi návštěvami mění celá mapa Experience, mění se i pocit jistoty.
Důvěra vzniká opakováním stejného rámce — ne překvapením v navigaci.

#### Orientace

Stabilní mentální mapa umožňuje orientaci.
Uživatel ví, kde je, kam se může vrátit, a co ještě neproběhlo.
Bez této mapy se Experience stává sledem obrazovek.

#### Kontinuita

Rozhodování není jednorázová akce.
Probíhá v čase, s přestávkami, s návraty.
Stabilní struktura umožňuje navázat přesně tam, kde rozhodování skončilo — bez znovu-učení produktu.

#### Spolupráce více lidí

Rozhodnutí o bydlení nebo investici zřídka dělá jeden člověk.
Stabilní mapa umožňuje, aby další osoba vstoupila do stejného prostředí a okamžitě rozuměla jeho tvaru.

#### Navázání obchodníka

Obchodník musí umět vstoupit do probíhajícího rozhodování.
Pokud je struktura Experience nestálá, nemůže spolehlivě pokračovat v kontextu klienta.
Stabilní Workspace je předpoklad profesionální spolupráce.

#### Sdílený mentální model

Kupující, AI i obchodník potřebují stejný rámec.
Ne stejný pohled — ale stejnou mapu.
Bez sdíleného mentálního modelu nelze sdílet Decision Session.

### Důsledek

Experience Structure je stabilní.

Mění se Interpretation.
Nemění se kostra Decision Workspace.

---

## Principle 02 — Adaptive Interpretation

Nemění se Experience.

Mění se její **interpretace**.

Struktura Workspace zůstává.
Uvnitř sekcí se mění obsah, doporučení, pořadí informací, jazyk a význam.

### Příklady

| Sekce | Stabilní | Adaptivní |
| --- | --- | --- |
| **Hero** | Role úvodního rámce | Framing, důraz, jazyk, doporučený vstup |
| **Priority** | Role kalibrace důležitosti | Váhy, zvýraznění, doporučené priority, copy |
| **FAQ** | Role otázek a odpovědí | Pořadí otázek, relevance, zvýraznění |
| **AI** | Role dialogu | Kontext, téma, doporučené další kroky |
| **Audit** | Role ověření a závazku | Interpretace připravenosti, nabídka dalšího kroku |
| **Report** | Role shrnutí rozhodnutí | Obsah shrnutí, důrazy, doporučení |

Ve všech případech:

- mění se **obsah**
- mění se **doporučení**
- mění se **pořadí informací uvnitř sekce**
- mění se **jazyk**
- mění se **interpretace**

Nemění se samotná struktura.

Adaptive Layer neznamená přestavbu Workspace.
Znamená zpřesňování významu uvnitř známé mapy.

---

## Principle 03 — Progressive Understanding

Systém nesmí uživatele interpretovat příliš brzy.

Časná jistota je falešná jistota.

Interpretace musí vznikat **postupně**.

Každá další interakce zpřesňuje porozumění:

- co je pro člověka důležité,
- co je ještě otevřené,
- co je už rozhodnuté,
- co je další přirozený krok.

Decision Workspace nehádá člověka na začátku.
Naslouchá průběhu rozhodování.

Progressive Understanding chrání uživatele před předčasným závěrem
a chrání produkt před předstíráním inteligence.

---

## Principle 04 — Decision Before Conversion

Nejdříve pomoz uživateli udělat správné rozhodnutí.

Teprve poté řeš konverzi.

Konverze není cíl.

Konverze je **důsledek** dobře vedeného rozhodovacího procesu.

Pokud Experience tlačí na lead dříve, než vznikne porozumění,
porušuje Decision Workspace.

Pokud Experience vede člověka ke kvalitnímu rozhodnutí,
konverze přichází jako přirozený výsledek — ne jako nátlak.

Tento princip odděluje Embed Engine od marketingových prezentací
a od konverzních funnelů, které optimalizují klik, nikoli rozhodnutí.

---

## Principle 05 — Shared Decision Context

Jedna Decision Session je sdílena mezi:

- kupujícím,
- AI,
- obchodníkem.

Každý vidí **jinou perspektivu**.

Všichni ale pracují nad **stejným rozhodovacím kontextem**.

### Důsledek

- Kupující prožívá Workspace jako prostředí pro rozhodnutí.
- AI pracuje nad stejnou Session jako asistent interpretace a dialogu.
- Obchodník vstupuje do stejného kontextu jako partner, ne jako restart procesu.

Bez Shared Decision Context vznikají tři oddělené příběhy.
S ním vzniká jedno rozhodování — více pohledů.

---

## Relationship to existing Product Architecture

Tyto principy nejsou novým směrem proti Embed Engine.

Jsou pokračováním stejné filozofie, kterou už platforma používá:

| Stabilní | Adaptivní |
| --- | --- |
| Object Package | Interpretation |
| Decision Matrix | Decision Filter |
| DEG | Experience Operations |
| Experience Structure | Experience Interpretation |
| Decision Workspace | Adaptive Layer |

### Stejný princip napříč vrstvami

- **Object Package** je stabilní realita objektu. Interpretation je adaptivní čtení.
- **Decision Matrix** drží rámec. Decision Filter mění, co je právě důležité.
- **DEG** drží gramatiku Experience. Experience Operations mění mentální stav.
- **Experience Structure** drží mapu. Experience Interpretation mění význam uvnitř mapy.
- **Decision Workspace** drží pracovní prostředí. Adaptive Layer mění obsah a doporučení.

UX 2.0 tedy nezačíná novou logikou produktu.

UX 2.0 pokračuje ve stejném principu:

> Stabilní je struktura.  
> Adaptivní je interpretace.

Decision Workspace je Experience vyjádření této filozofie.

---

## Out of scope

Tento dokument **neřeší**:

- wireframy
- rozmístění panelů
- komponenty
- grafický design
- implementaci
- Runtime / Session / Experience Kernel kontrakty

Tyto vrstvy přijdou později.
Nejdřív platí filozofie.

---

## Governance

- UX-001 je **Proposed** Product Philosophy pro UX 2.0.
- Konflikty s prezentací „Client Studio jako stránka“: **Decision Workspace vyhrává**.
- Budoucí UX 2.0 specifikace musí respektovat Principle 01–05.
- Wireframes a layout nesmí porušit Structural Stability.
- Adaptive chování musí zůstávat ve vrstvě Interpretation.
