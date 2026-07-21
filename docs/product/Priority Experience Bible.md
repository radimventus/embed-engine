# Priority Experience Bible

**Status:** APPROVED (v0.1)  
**Version:** 0.1  
**Date:** 2026-07-21  
**SSOT for:** Priority Experience — filozofie, principy, jazyk a MVP Decision Journey  
**Not SSOT for:** UI layout, wireframy, React, Runtime, Session kontrakty, Object Package schema, Behavior Pack schema

**Navazuje na:**

- [Decision Experience Grammar (DEG)](./decision-experience-grammar/DEG.md) — aktivní Product Bible vrstva
- [UX-001 — Decision Workspace Philosophy](./ux/UX-001-Decision-Workspace-Philosophy.md)
- [Decision Journey Specification (DJS)](./decision-journey/DJS.md) — Proposed
- [ADR-007 — Priority MVP Policy](../architecture/adr/ADR-007-priority-mvp-policy.md)
- [Product Vision](./vision/product-vision.md)

---

## 1. Manifest

### Účel

Priority Experience je místo, kde se **uživatelský záměr** stává vstupem do interpretace objektu.

Neukazuje dům lépe.

Neprodává dům rychleji.

Pomáhá člověku říct: **co je pro mě při tomto rozhodnutí důležité** — a pak ukázat, co to znamená pro konkrétní objekt.

### Hodnota

Bez Priority Experience zůstává objekt obecný.

S Priority Experience se objekt stává **osobně relevantním**.

Hodnota není ve výběru karet.

Hodnota je ve změně způsobu, jakým člověk objekt čte.

### Co Priority Experience je

- Kalibrace rozhodovacího kontextu
- Vstup uživatelského záměru do Decision Experience
- Most mezi „co mi záleží“ a „jak tento objekt číst“
- Součást Decision Workspace — ne samostatná aplikace

### Co Priority Experience není

- Konfigurátor domu
- Marketingový quiz
- Skórovací hra nebo ranking objektů
- Finální verdikt o koupi
- Nahrazení prohlídky, obchodníka nebo lidského úsudku
- UI panel s vlastním významem odděleným od Experience

### North Star věta

> Priority Experience nemění objekt.  
> Mění, **jak objekt čteme** — podle toho, co je pro člověka důležité.

---

## 2. Design Principles

Tyto principy jsou závazné. Platí i při budoucím vývoji UI, copy i interpretace.

### P01 — Intent Before Interpretation

Nejdřív záměr uživatele.

Teprve potom interpretace objektu.

Systém nesmí objekt „přeložit“ dřív, než člověk vyjádří, co je pro něj podstatné — alespoň v MVP míře potřebné pro první čtení.

### P02 — Relevance, Not Truth

Priority určuje **relevanci**, ne pravdu.

Objekt zůstává stejný.

Mění se, co je v daném kontextu důležité.

Dvě různé Priority Selection mohou vést ke dvěma různým čtením téhož objektu — aniž by se změnila fakta.

### P03 — Structural Stability

Role Priority Experience ve Workspace se nemění.

Adaptivní je interpretace uvnitř známého rámce — ne přestavba mapy Experience při každé návštěvě.

*(Navazuje na UX-001 — Structural Stability.)*

### P04 — Adaptive Interpretation

Nemění se kostra rozhodovacího prostředí.

Mění se význam, důrazy, doporučení a jazyk uvnitř Priority Experience.

*(Navazuje na UX-001 — Adaptive Interpretation.)*

### P05 — Progressive Understanding

Systém nesmí uživatele interpretovat příliš brzy.

Časná jistota je falešná jistota.

Každý další krok Journey zpřesňuje porozumění — ne předstírá hotové rozhodnutí.

*(Navazuje na UX-001 — Progressive Understanding.)*

### P06 — Decision Before Conversion

Nejdřív kvalitní rozhodnutí.

Teprve potom konverze.

Priority Experience nesmí tlačit na lead dřív, než vznikne srozumitelná interpretace.

*(Navazuje na UX-001 — Decision Before Conversion.)*

### P07 — Shared Decision Context

Priority Selection je součástí jednoho rozhodovacího kontextu.

Kupující, AI i obchodník pracují nad stejným záměrem — každý z jiné perspektivy.

*(Navazuje na UX-001 — Shared Decision Context.)*

### P08 — Experience Is the Presentation Contract

Co uživatel vidí jako sémantický výsledek Priority, pochází z **Experience**.

UI Priority Experience nevykonává vlastní význam.

UI Priority Experience Experience jen zpřístupňuje.

*(Navazuje na DEG — Interpretation vs Presentation.)*

### P09 — Respect User Agency

Uživatel vlastní Priority Selection.

Systém navrhuje čtení.

Systém nepřepisuje rozhodnutí uživatele, nenutí jiné priority a nevydává hypotézu za verdikt.

### P10 — One Object, Many Readings

Jeden objekt. Více legitimních čtení.

Priority Experience nesmí předstírat, že existuje jediné „správné“ pořadí hodnot pro všechny.

---

## 3. Decision Journey (MVP)

Priority Experience v MVP vede uživatele touto sekvencí mentálních transformací:

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
```

Tato sekvence je **produktová Journey Priority Experience**.  
Není to seznam obrazovek. Je to sled stavů rozhodování.

### 3.1 Priority Selection

**Cíl mentální změny:** z „dívám se na dům“ na „vím, co je pro mě důležité“.

Uživatel vybírá priority, které kalibrují rozhodovací kontext.

Výstup: vyjádřený záměr (Priority Selection).

### 3.2 Confirmation

**Cíl mentální změny:** záměr se stává vědomým.

Uživatel potvrzuje, že vybrané priority skutečně reprezentují jeho důrazy — ne náhodný klik.

Výstup: potvrzený rozhodovací kontext.

### 3.3 Transition

**Cíl mentální změny:** očekávání se přepne z výběru na čtení.

Člověk rozumí, že systém nyní **přečte objekt jeho optikou** — ne že „spočítá skóre“.

Výstup: připravenost přijmout interpretaci jako čtení, ne jako verdikt.

### 3.4 Interpretation

**Cíl mentální změny:** z obecných dojmů na srozumitelné čtení objektu.

Systém předkládá Experience: shrnutí, důrazy, důvody, rizika, míru jistoty, další kroky.

Výstup: hypotéza o významu objektu pro daný kontext.

### 3.5 House Mapping

**Cíl mentální změny:** interpretace se propojí s konkrétním domem.

Člověk vidí, **kde v objektu** se čtení projevuje — ne abstraktní text bez kotvy v realitě.

Výstup: propojení „co mi záleží“ ↔ „co dům ukazuje“.

### Vztah k DJS

Tato MVP sekvence je specializace kapitoly **Prioritization → Understanding / Confidence** v širší Decision Journey (DJS).  
Priority Experience Bible je SSOT pro **Priority Experience**.  
DJS zůstává SSOT pro trajektorii celé návštěvy.

---

## 4. Language Guide

### Preferovaný jazyk

- Klidný, věcný, partnerský
- Orientovaný na porozumění, ne na nátlak
- Konkrétní k objektu a k rozhodnutí
- Respektující nejistotu („zatím“, „podle vašich priorit“, „v tomto čtení“)
- Česky v uživatelských textech MVP (kde Experience komunikuje)

### Preferované formulace

| Směr | Příklad |
| --- | --- |
| Záměr | „Co je pro vás podstatné?“ |
| Hypotéza | „Podle vašich priorit se objekt čte takto…“ |
| Evidence | „Protože…“ / „To podporuje…“ |
| Riziko | „Na co si dát pozor…“ |
| Jistota | „Míra jistoty tohoto čtení…“ |
| Další krok | „Doporučený další krok…“ |

### Zakázané formulace

- Absolutní verdikty: „Ideální dům“, „Nejlepší volba“, „Musíte koupit“
- Falešná preciznost: „Shoda 97 % s vaším životem“ (jako fakt, ne jako interní skóre)
- Nátlak: „Poslední šance“, „Jen dnes“, „Už vám uniká“
- Přepisování uživatele: „Ve skutečnosti byste měli řešit…“ místo respektu k Priority Selection
- Marketingové klišé bez vazby na objekt a záměr
- Jazyk konfigurátoru: „Nakonfigurujte si dům“ jako popis Priority Experience

### Pravidla mikrotextů

1. **Jeden úkol na mikrotext** — ne míchat výběr, prodej a verikt.
2. **Záměr dřív než výsledek** — výzva k Priority Selection nesmí předbíhat interpretaci.
3. **Hypotéza, ne soud** — interpretace mluví jako čtení, ne jako rozsudek.
4. **Objekt musí být přítomen** — text bez vazby na dům je dekorace.
5. **Chrome ≠ význam** — popisky sekcí smí být UI chrome; sémantický obsah patří Experience.
6. **Žádná nová priorita v copy** — mikrotext nesmí vnutit prioritu, kterou uživatel nevybral.

---

## 5. Interpretation Rules

### R01 — Interpretation Is a Hypothesis

Interpretace je **hypotéza o významu** objektu pro daný rozhodovací kontext.

Není diagnóza člověka.

Není finální doporučení ke koupi.

Není pravda o objektu — je to kontextové čtení faktů.

### R02 — Facts Stay Stable

Fakta patří objektu.

Interpretace fakta nepřepisuje.

Mění se význam a relevance — ne realita domu.

### R03 — Priority Selection Is the Lens

Priority Selection je čočka.

Bez ní je čtení obecné.

S ní je čtení osobní — stále však hypotetické.

### R04 — Connect Reading to the House

Každé sémantické tvrzení musí být možné **ukotvit v objektu**.

House Mapping není dekorace.

Je důkaz, že interpretace mluví o tomto domě — ne o obecném „ideálním bydlení“.

### R05 — Respect the User’s Decision

Pokud uživatel zvolil priority, systém:

- respektuje je jako vstup,
- neopravuje je skrytě,
- nenahrazuje je „chytřejší“ sadou,
- může ukázat napětí a trade-offy — bez zneplatnění volby.

### R06 — Confidence Must Be Honest

Míra jistoty patří k hypotéze.

Vysoká jistota bez evidence je zakázaná.

Nízká jistota není selhání — je signál pro další krok Journey.

### R07 — Presentation Does Not Interpret

Renderer (Terminál, Report, AI intro, …) Experience zobrazuje.

Nevymýšlí nový význam.

Nevykonává Priority Selection.

Nepřepisuje hypotézu marketingovým copy.

---

## 6. MVP Scope

### MVP obsahuje

- Priority Selection jako vyjádření záměru
- Confirmation zvoleného kontextu
- Transition k očekávání interpretace
- Interpretation jako Experience (shrnutí, důrazy, důvody, rizika, jistota, kroky)
- House Mapping jako propojení čtení s objektem
- Jeden návštěvník → jeden rozhodovací kontext (ADR-007)
- Absolute / nezávislé důrazy priorit (ADR-007) — důraz, ne rozpočtová hra
- Experience jako jediný sémantický prezentační kontrakt

### MVP záměrně neobsahuje

- Multi-user / párové Priority (ADR-007 — postponed)
- Relativní rozpočet priorit se součtem 100 % (ADR-007 — rejected for MVP)
- Perzistenci Priority napříč návštěvami jako produktový slib (MVP = active Experience)
- Automatické přepsání priorit AI
- Ranking více domů / srovnávač objektů
- Plnou Decision Conversation jako náhradu Journey
- Nové semantic rules nad rámec ověřené interpretace MVP
- Redesign Workspace mapy kvůli Priority

### Kritérium hotovosti MVP

Priority Experience MVP je hotová, když platí:

1. Uživatel umí vyjádřit záměr.
2. Systém vrátí srozumitelnou hypotézu (Experience).
3. Hypotéza je propojená s domem.
4. Uživatel cítí, že jeho volba byla respektována.
5. Konverze nepřichází dřív než porozumění.

---

## Governance

- Tento dokument je **SSOT Priority Experience** pro filozofii, principy, jazyk a MVP Journey.
- Konflikty s marketingovým „quiz / konfigurátor“ framingem: **Priority Experience Bible vyhrává**.
- Konflikty s layoutem nebo komponentami: Bible neřeší layout — layout se musí přizpůsobit principům.
- DEG zůstává SSOT Decision Experience Grammar.
- DJS zůstává SSOT trajektorie celé návštěvy.
- Budoucí verze (v0.2+) smí rozšiřovat Journey a jazyk — nesmí porušit P01–P10 a R01–R07.
