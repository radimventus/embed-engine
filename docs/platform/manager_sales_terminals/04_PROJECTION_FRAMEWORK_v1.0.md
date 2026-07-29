# 04_PROJECTION_FRAMEWORK_v1.0

**Status:** SSOT (Single Source of Truth)

## 1. Účel

Projection Framework definuje jednotný model všech Projection v
platformě Embed Engine.

Projection je kompoziční vrstva mezi Runtime a Terminal. Jejím účelem je
organizovat význam vytvořený Runtime do pohledu odpovídajícího konkrétní
Perspective.

Projection nevytváří význam, business logiku ani interpretaci.

------------------------------------------------------------------------

## 2. Architektonická pozice

Knowledge → Runtime → Identity → Perspective → Projection → Terminal →
Human

Projection je jediná vrstva odpovědná za kompozici pohledu.

------------------------------------------------------------------------

## 3. Odpovědnost Projection

Projection: - vybírá informace, - určuje jejich prioritu, - skládá
navigaci, - připravuje View, - připravuje doporučené akce vytvořené
Runtime.

Projection nesmí: - měnit Runtime, - interpretovat znalosti, - obsahovat
business logiku, - vytvářet AI doporučení.

------------------------------------------------------------------------

## 4. Projection Grammar

Každá Projection musí být schopna vytvořit následující strukturu:

Context → Narrative → Insight → Action

Terminal tuto strukturu pouze prezentuje.

------------------------------------------------------------------------

## 5. Hierarchie

Terminal → Projection → View → Component

-   Terminal = pracovní prostředí podle role.
-   Projection = konkrétní pohled na Runtime.
-   View = jednotlivá obrazovka.
-   Component = konkrétní UI prvek.

------------------------------------------------------------------------

## 6. Typy Projection

### Operations Projection

Každodenní provoz.

### Decision Guidance Projection

Vedení obchodníka během Decision Journey.

### Decision Intelligence Projection

Analýza chování systému a zákazníků.

### Experience Quality Projection

Vyhodnocení kvality Experience.

### Builder Projection

Tvorba a správa Experience.

------------------------------------------------------------------------

## 7. Architektonické invarianty

-   Runtime vlastní význam.
-   Projection vlastní kompozici.
-   Terminal vlastní prezentaci.
-   Každý nový Terminal používá Projection definované tímto dokumentem.

------------------------------------------------------------------------

## 8. Rozsah

Tento dokument definuje: - Projection, - Projection Grammar, -
Projection Hierarchy, - typy Projection, - architektonické invarianty.

Neřeší implementaci ani UI.

------------------------------------------------------------------------

## 9. Závěrečné ustanovení

Tento dokument je referenčním SSOT pro všechny Projection v platformě
Embed Engine.
