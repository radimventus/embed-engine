# 05 --- MANAGER STUDIO SPECIFICATION v1.0

**Status:** Referenční dokument (SSOT)

## Účel

Manager Studio je pracovní prostředí vlastníka nebo manažera partnera.
Jeho úkolem není zobrazovat data, ale pomáhat řídit rozhodování firmy na
základě Runtime.

## 1. Primární uživatel

-   Majitel společnosti
-   Ředitel
-   Vedoucí obchodu
-   Manažer odpovědný za výkon

## 2. Mise Studia

Poskytovat průběžný přehled o stavu rozhodovacích procesů, obchodních
příležitostí a kvalitě Experience a převádět je do doporučených
manažerských akcí.

## 3. Hlavní otázka

**Co právě teď vyžaduje moji pozornost, proč a jaký bude nejlepší další
krok?**

## 4. Odpovědnosti

Manager Studio:

-   řídí pozornost manažera,
-   prioritizuje události,
-   interpretuje stav firmy prostřednictvím Runtime,
-   poskytuje doporučené akce,
-   nikdy nevytváří vlastní sémantiku.

## 5. Architektura Studia

Manager Studio - obsahuje Manager Terminal, - využívá Runtime
prostřednictvím Projection, - pracuje nad jednotnou Decision Journey, -
sdílí Identity a Project Registry s ostatními Studii.

## 6. Manager Terminal

Manager Terminal je hlavní pracovní plocha Studia.

Obsahuje zejména:

-   Executive Overview
-   Decision Intelligence
-   Funnel & Decision Analytics
-   Timeline událostí
-   Team Performance
-   Experience Quality
-   AI Recommendations

## 7. Projection Mapping

Používané Projection:

-   Operations Projection
-   Decision Intelligence Projection
-   Experience Quality Projection

Projection skládá pohled. Runtime vytváří význam. Terminal pouze
prezentuje.

## 8. Runtime vstupy

-   Decision Journey
-   Runtime Events
-   Team State
-   Experience Validation
-   AI Recommendations

## 9. Runtime výstupy

Manager Studio může iniciovat:

-   otevření případu,
-   přiřazení obchodníkovi,
-   eskalaci,
-   potvrzení doporučení,
-   manažerské rozhodnutí.

## 10. Navigace

Primární navigace organizuje manažerskou práci podle oblastí
odpovědnosti, nikoli podle technických modulů.

## 11. Design principy

-   Jedna hlavní priorita v jednom okamžiku.
-   Nejprve význam, poté metrika.
-   Doporučení musí být vysvětlitelné.
-   Studio vede k akci, nikoli ke sledování dashboardu.

## 12. Architektonická pravidla

-   Runtime je jediným autorem významu.
-   Projection skládá pohled.
-   Terminal prezentuje.
-   Manager Studio nevytváří business logiku ani lokální interpretace.

## 13. Mimo rozsah

Do tohoto dokumentu nepatří:

-   implementace,
-   technologie,
-   oprávnění uživatelů (Identity & Access),
-   integrační služby platformy,
-   detailní UX jednotlivých obrazovek.

## Závěrečné ustanovení

Manager Studio Specification je referenční dokument definující účel,
odpovědnosti a architektonické hranice Manager Studia. Detailní
integrace se společnými platformními službami je popsána v dokumentu
Studio Integration Architecture.
