# Priority Decision Journey Blueprint

**Status:** APPROVED (v1.0)  
**Version:** 1.0  
**Date:** 2026-07-21  
**SSOT for:** Univerzální kostra všech Priority Journey — fáze, přechody, kontrakty  
**Not SSOT for:** Obsah konkrétní priority, UI layout, React, Runtime, Object Package schema

**Navazuje na:**

- [Priority Experience Bible](./Priority%20Experience%20Bible.md) — filozofie, principy, jazyk, interpretační pravidla
- [Decision Experience Grammar (DEG)](./decision-experience-grammar/DEG.md)
- [Decision Journey Specification (DJS)](./decision-journey/DJS.md) — Proposed (celá návštěva)

**Referenční příklad (není závislost Blueprintu):**

- [Garden Decision Journey](./content/priority-garden.md) — první obsahový scénář vytvořený podle této kostry

---

## 1. Purpose

Tento Blueprint definuje **stabilní kostru** Priority Decision Journey.

Každá budoucí priorita (Zahrada, Dispozice, Energie, Investice, …) musí:

1. projít stejnými fázemi,
2. splnit stejné kontrakty mezi fázemi,
3. dodržet stejná pravidla přechodu,
4. dodat pouze **prioritně specifický obsah** — ne vlastní Journey architekturu.

### Co Blueprint řeší

- Univerzální pořadí fází
- Mentální účel každé fáze
- Vstupy a výstupy mezi fázemi
- Kontrakt Interpretation a House Mapping
- Pravidla rozšířitelnosti pro nové priority

### Co Blueprint neřeší

- Konkrétní copy jedné priority
- Seznam motivací konkrétní priority
- Wireframy, layout, komponenty
- Runtime, Session, React

### Vrstvení SSOT

| Dokument | Odpovědnost |
| --- | --- |
| **Priority Experience Bible** | Filozofie, principy, jazyk, MVP význam Journey |
| **Priority Decision Journey Blueprint** (tento) | Univerzální kostra a kontrakty fází |
| **`content/priority-*.md`** | Obsah jedné priority podle Blueprintu |

Garden je důkaz, že Blueprint funguje.  
Garden **nedefinuje** Blueprint.

---

## 2. Universal Journey

Každá Priority Journey má přesně tuto sekvenci:

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
Follow-up (optional handoff)
```

### Invarianty sekvence

1. **Pořadí je závazné.** Fáze se nepřeskakují a neprohazují.
2. **Interpretation nikdy nepředbíhá Confirmation.** (Bible P01)
3. **House Mapping nikdy nepředbíhá Interpretation.** Nejdřív hypotéza, pak kotva v objektu.
4. **Follow-up není nová interpretace.** Je pokračování Workspace po hotovém čtení.
5. **Jedna aktivní čočka.** Journey běží pro aktuální Priority Selection (jedna dominantní priorita nebo sada dle Bible/ADR-007) — ne jako paralelní příběhy pro každou kartu zvlášť v MVP.

### Mentální oblouk (univerzální)

```text
záměr → vědomý záměr → připravenost číst → hypotéza → kotva v domě → další krok
```

---

## 3. Stage Definitions

Každá fáze má: účel, vstup, výstup, povinný obsah, zakázaný obsah, mentální efekt.

### 3.1 Priority Selection

| | |
| --- | --- |
| **Účel** | Uživatel vyjádří, co je pro rozhodnutí podstatné. |
| **Vstup** | Orientovaný návštěvník objektu (zná, že jde o rozhodování — ne nutně detaily). |
| **Výstup** | Priority Selection (vyjádřený záměr). |
| **Povinné** | Výběr priority / priorit; srozumitelná výzva k záměru. |
| **Zakázané** | Interpretace objektu; skóre; verdikt; lead. |
| **Mentální efekt** | „Řekl jsem, co je pro mě důležité.“ |

### 3.2 Confirmation

| | |
| --- | --- |
| **Účel** | Záměr se stane vědomým; uživatel potvrdí čočku. |
| **Vstup** | Priority Selection. |
| **Výstup** | Potvrzený rozhodovací kontext. |
| **Povinné** | Shrnutí zvolené priority jazykem záměru; akce potvrdit; cesta upravit výběr. |
| **Zakázané** | Čtení domu; evidence objektu; skóre shody; doporučení ke koupi; vnucení jiné priority. |
| **Mentální efekt** | „To nebyl náhodný klik.“ |

**Kontrakt:** Confirmation smí mluvit jen o **záměru uživatele**, ne o kvalitě objektu.

### 3.3 Transition

| | |
| --- | --- |
| **Účel** | Přepnout očekávání z výběru na čtení. |
| **Vstup** | Potvrzený kontext. |
| **Výstup** | Připravenost přijmout interpretaci jako hypotézu. |
| **Povinné** | Krátká komunikace (1–2 věty): „teď čteme objekt vaší optikou“. |
| **Zakázané** | Čísla shody; verdikty; dlouhý marketing; nová priorita. |
| **Mentální efekt** | „Teď nepřijde skóre — přijde čtení.“ |

**Kontrakt:** Transition nepřidává nový význam. Jen mění očekávání.

### 3.4 Interpretation

| | |
| --- | --- |
| **Účel** | Předložit srozumitelnou hypotézu o významu objektu pro daný kontext. |
| **Vstup** | Potvrzený kontext + fakta objektu (přes Experience). |
| **Výstup** | Experience (prezentační kontrakt významu). |
| **Povinné** | Viz Interpretation Contract (§5). |
| **Zakázané** | Absolutní verdikt; falešná preciznost; přepis Priority Selection; konverzní nátlak. |
| **Mentální efekt** | „Rozumím, jak se objekt v tomto kontextu čte — a na co si dát pozor.“ |

**Kontrakt:** Interpretation = Experience. UI nic nevymýšlí navíc. (Bible P08, R07)

### 3.5 House Mapping

| | |
| --- | --- |
| **Účel** | Ukotvit hypotézu v konkrétních částech objektu. |
| **Vstup** | Experience z Interpretation. |
| **Výstup** | Mapování „tvrzení čtení → místo / vlastnost domu“. |
| **Povinné** | Viz House Mapping Contract (§6). |
| **Zakázané** | Nová interpretace bez vazby na Experience; zvýraznění nesouvisejících priorit; prohlídka celého domu „pro jistotu“. |
| **Mentální efekt** | „Vím, kam se v domě podívat.“ |

### 3.6 Follow-up (handoff)

| | |
| --- | --- |
| **Účel** | Nabídnout přirozené pokračování ve Workspace. |
| **Vstup** | Hotové Interpretation + House Mapping. |
| **Výstup** | Volba dalšího modulu (Tour, média, další priorita, shrnutí, později Audit). |
| **Povinné** | Aspoň jeden doporučený další krok odvozený z Experience / Journey. |
| **Zakázané** | Lead jako jediný další krok před porozuměním (Bible P06). |
| **Mentální efekt** | „Mám kam pokračovat — bez tlaku rozhodnout hned.“ |

---

## 4. Transition Rules

Pravidla přechodu jsou univerzální. Platí pro každou prioritu.

| Z → Do | Smí přejít, když | Nesmí přejít, pokud |
| --- | --- | --- |
| Selection → Confirmation | Existuje neprázdná Priority Selection | Interpretation už běží „napřed“ |
| Confirmation → Transition | Uživatel potvrdil záměr | Uživatel chce upravit výběr (vrací se na Selection) |
| Transition → Interpretation | Transition proběhla (i jako krátký stav) | Confirmation nebyla dokončena |
| Interpretation → House Mapping | Experience je k dispozici | House Mapping by měl „opravit“ chybějící interpretaci |
| House Mapping → Follow-up | Uživatel má aspoň jednu kotvu v objektu | Follow-up nahrazuje Mapping |

### Zpětné přechody (povolené)

- Confirmation → Selection (upravit priority)
- Interpretation → Selection (změnit čočku) — **vyžaduje nový běh** Confirmation → … (žádná tichá reinterpretace bez potvrzení)
- Libovolná fáze → Selection při změně Priority Selection

### Zakázané zkratky

- Selection → Interpretation (bez Confirmation)
- Confirmation → House Mapping (bez Interpretation)
- Transition → Follow-up / Audit / Lead
- House Mapping, které mění význam Experience

### Pravidlo jedné čočky při změně

Změní-li se Priority Selection, předchozí Interpretation a House Mapping se považují za **neplatné pro nový kontext**.  
Nová Journey začíná znovu od Confirmation (nebo Selection, pokud výběr ještě není hotový).

---

## 5. Interpretation Contract

Interpretation Stage produkuje **Experience** — jediný sémantický prezentační kontrakt (Bible P08).

### Povinná sémantická pole (produktově)

Každá Priority Journey musí v Interpretation dodat obsah mapovatelný na:

| Pole Experience | Produktový význam ve Journey |
| --- | --- |
| **title** | Název čtení optikou priority |
| **summary** | Hypotéza v prostém jazyce |
| **focus** | Na co se soustředit v tomto čtení |
| **evidence** | Proč toto čtení (důvody vázané na objekt) |
| **concerns** | Na co si dát pozor |
| **confidence** | Upřímná míra jistoty hypotézy (+ vysvětlení) |
| **recommendations** | Směr dalšího porozumění |
| **actions** | Konkrétní další kroky (ne nátlak ke koupi) |

### Forma MVP

- Preferovaná forma: **jedna interpretační karta** (nebo ekvivalent jednoho uceleného čtení).
- Jazyk: hypotéza („podle vaší priority…“), ne verdikt.
- Confidence: nesmí být vysoká bez evidence (Bible R06).

### Interpretation nesmí

- Diagnostikovat osobnost uživatele
- Přepsat Priority Selection
- Tvrdit jediné správné pořadí hodnot pro všechny
- Zobrazit falešnou preciznost jako fakt o životě uživatele
- Provádět House Mapping uvnitř textu bez pozdější kotvy v objektu (smí odkázat na ověření — Mapping je samostatná fáze)

### Vztah k Object

Interpretation **čte fakta**.  
Nemění fakta. (Bible R02)

---

## 6. House Mapping Contract

House Mapping spojuje Experience s objektem.

### Povinný výstup

Sada mapování:

```text
Experience claim (důvod / riziko / focus)
        →
Object anchor (místnost, zóna, prvek, vztah, médium)
        +
Why this anchor (jedna věta relevance k prioritě)
```

### Pravidla

1. **Každé klíčové tvrzení Interpretation má alespoň jednu kotvu** — nebo explicitní „k ověření“, pokud fakt chybí.
2. **Kotva musí patřit k aktivní prioritě.** Nesmí se „pro jistotu“ zvýraznit celý dům.
3. **Mapping nevymýšlí novou hypotézu.** Jen lokalizuje stávající Experience.
4. **Počet kotev je malý a záměrný** — typicky několik míst, ne inventura objektu.
5. **Mentální výstup je orientace k ověření**, ne uzavřené rozhodnutí.

### House Mapping nesmí

- Být dekorativní highlight bez vazby na Experience
- Nahrazovat prohlídku nebo obchodníka
- Měnit confidence nebo summary Experience
- Spouštět konverzi

---

## 7. Extensibility Guidelines

### Jak přidat novou prioritu

1. Vytvoř `docs/product/content/priority-<id>.md`.
2. Vyplň stejnou obsahovou kostru jako Garden (Priority, Intent, Meanings, Confirmation, Transition, Interpretation, House Mapping, Follow-up, UX Notes).
3. **Neměň** Universal Journey ani Transition Rules.
4. Dodrž Language Guide a Interpretation Rules z Bible.
5. Ověř Acceptance Criteria (§8).

### Co smí být prioritně specifické

- Název a význam priority
- User Intent formulace
- Possible Meanings
- Copy Confirmation / Transition / Interpretation
- Konkrétní House Mapping kotvy pro daný Object
- Doporučené Follow-up moduly

### Co nesmí být prioritně specifické

- Pořadí fází
- Přeskočení Confirmation
- Vlastní „skórovací“ fáze
- Lead uprostřed Journey
- Odlišný význam Experience polí
- House Mapping před Interpretation

### Multi-priority (budoucnost)

Blueprint MVP počítá s **jednou dominantní čočkou** na běh Journey.  
Kombinace priorit (precedence, sloučené čtení) vyžaduje rozšíření Bible + novou verzi Blueprintu — ne ad-hoc výjimku v jednom `priority-*.md`.

### Referenční příklad

Garden (`priority-garden.md`) ukazuje vyplněný obsah.  
Při konfliktu mezi Garden copy a tímto Blueprintem **vyhrává Blueprint** pro kostru; Garden se opraví.

---

## 8. Acceptance Criteria

Priority Journey (libovolná priorita) je akceptovatelná, když:

### Kostra

- [ ] Obsahuje všechny fáze v pořadí Selection → Confirmation → Transition → Interpretation → House Mapping
- [ ] Follow-up nepřichází dřív než po Mapping (nebo explicitně až po Interpretation, pokud Mapping je součástí stejného kroku ověření — Mapping nesmí chybět jako koncept)
- [ ] Žádná zkratka Selection → Interpretation

### Kontrakty

- [ ] Confirmation nemluví o kvalitě objektu
- [ ] Transition je krátká a bez verdiktu
- [ ] Interpretation je hypotéza mapovatelná na Experience pole
- [ ] House Mapping kotví Experience v objektu
- [ ] Jazyk dodržuje Bible Language Guide

### Produktové principy

- [ ] Intent before Interpretation (P01)
- [ ] Relevance, not truth (P02)
- [ ] Progressive Understanding — jistota je upřímná (P05 / R06)
- [ ] Decision before Conversion (P06)
- [ ] Experience is the presentation contract (P08)
- [ ] User agency respektována (P09 / R05)

### Rozšířitelnost

- [ ] Dokument priority neodbočuje od Universal Journey
- [ ] Garden ani jiný příklad není zakódován jako jediná možná cesta

### Prototyp / implementace (produktová hotovost)

- [ ] Lze z dokumentu priority sestavit HTML prototyp bez domýšlení chybějících fází
- [ ] Lze z Blueprintu vytvořit další `priority-*.md` bez změny Blueprintu

---

## Governance

- Tento dokument je **SSOT univerzální kostry** Priority Decision Journey.
- Priority Experience Bible zůstává SSOT filozofie a jazyka.
- `content/priority-*.md` jsou SSOT obsahu jedné priority.
- Konflikty „jiná cesta pro prioritu X“: **Blueprint vyhrává**, pokud není vydána nová verze Blueprintu.
- Verze Blueprintu se zvyšuje při změně fází, přechodů nebo kontraktů — ne při přidání nové priority.
