# 06 --- SALES STUDIO SPECIFICATION v1.0

**Status:** Referenční dokument (SSOT)

## Účel

Sales Studio je pracovní prostředí obchodníka. Jeho úkolem je převádět
informace z Runtime do konkrétních obchodních kroků vedoucích klienta k
informovanému rozhodnutí.

## 1. Primární uživatel

-   Obchodník
-   Konzultant
-   Account Manager

## 2. Mise Studia

Pomáhat obchodníkovi porozumět aktuálnímu stavu Decision Journey každého
klienta a doporučit nejlepší další krok.

## 3. Hlavní otázka

**Komu mám právě teď pomoci udělat další krok v rozhodování a jak?**

## 4. Odpovědnosti

Sales Studio:

-   prioritizuje obchodní případy,
-   interpretuje stav klienta prostřednictvím Runtime,
-   doporučuje další akci,
-   podporuje kontinuální Decision Journey,
-   nikdy nevytváří vlastní sémantiku.

## 5. Architektura Studia

Sales Studio:

-   obsahuje Sales Terminal,
-   využívá Runtime prostřednictvím Projection,
-   pracuje nad jednotnou Decision Journey,
-   sdílí Identity a Project Registry s ostatními Studii.

## 6. Sales Terminal

Sales Terminal je hlavní pracovní plocha Studia.

Obsahuje zejména:

-   Active Opportunities
-   Decision Journey
-   Client Timeline
-   Decision Profile
-   Next Best Action
-   AI Recommendations

## 7. Projection Mapping

Používané Projection:

-   Decision Guidance Projection
-   Operations Projection

Projection skládá pohled. Runtime vytváří význam. Terminal pouze
prezentuje.

## 8. Runtime vstupy

-   Decision Journey
-   Runtime Events
-   Lead State
-   Priority Changes
-   AI Recommendations

## 9. Runtime výstupy

Sales Studio může iniciovat:

-   kontakt klienta,
-   sjednání schůzky,
-   předání případu,
-   uzavření obchodního kroku,
-   zpětnou vazbu Runtime.

## 10. Navigace

Primární navigace organizuje práci obchodníka podle aktivních případů a
doporučených akcí.

## 11. Design principy

-   Jeden klient, jeden doporučený další krok.
-   Decision Journey je důležitější než stav CRM.
-   Doporučení musí být vysvětlitelné.
-   Studio vede obchodníka k akci.

## 12. Architektonická pravidla

-   Runtime je jediným autorem významu.
-   Projection skládá pohled.
-   Terminal prezentuje.
-   Sales Studio nevytváří business logiku ani lokální interpretace.

## 13. Mimo rozsah

Do tohoto dokumentu nepatří:

-   implementace,
-   technologie,
-   Identity & Access,
-   integrační služby platformy,
-   detailní UX obrazovek.

## Závěrečné ustanovení

Sales Studio Specification je referenční dokument definující účel,
odpovědnosti a architektonické hranice Sales Studia. Detailní integrace
se společnými platformními službami je popsána v dokumentu Studio
Integration Architecture.
