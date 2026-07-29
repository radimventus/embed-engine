# 08 --- STUDIO INTEGRATION ARCHITECTURE v1.0

**Status:** Referenční dokument (SSOT)

## Účel

Studio Integration Architecture definuje způsob spolupráce všech Studií
platformy CONIS a jejich společných platformních služeb.

Neřeší implementaci ani UX jednotlivých Studií.

------------------------------------------------------------------------

# 1. Architektura platformy

Knowledge ↓ Runtime ↓ Shared Platform Services ↓ Client Studio \| Sales
Studio \| Manager Studio \| Builder Studio

Všechna Studia využívají společné Runtime.

------------------------------------------------------------------------

# 2. Role Studií

Client Studio - podporuje rozhodování klienta.

Sales Studio - vede obchodníka Decision Journey klienta.

Manager Studio - řídí výkon firmy a priority.

Builder Studio - vytváří a publikuje Decision Experience.

------------------------------------------------------------------------

# 3. Shared Platform Services

Platforma sdílí následující služby:

-   Runtime
-   Identity & Access
-   Project Registry
-   Validation
-   Build
-   Publish
-   Telemetry
-   Audit Log

Budoucí služby:

-   Notifications
-   Reporting
-   Integrations

------------------------------------------------------------------------

# 4. Runtime

Runtime je jediným autorem významu.

Žádné Studio nesmí vytvářet vlastní interpretaci.

------------------------------------------------------------------------

# 5. Tok dat

Builder Studio → Runtime

Runtime → Projection

Projection → Client Studio → Sales Studio → Manager Studio

Interakce uživatelů → Runtime

------------------------------------------------------------------------

# 6. Identity & Access

Identity zajišťuje kontinuitu.

Access Management určuje:

-   přístup ke Studiím,
-   přístup k projektům,
-   oprávnění funkcí.

Identity nikdy nevytváří význam.

------------------------------------------------------------------------

# 7. Project Registry

Project Registry je sdílená služba všech Studií.

Obsahuje:

-   projekty,
-   objekty,
-   metadata,
-   stav publikace.

------------------------------------------------------------------------

# 8. Publish Pipeline

Builder vytváří Build.

Publish Pipeline publikuje Release.

Runtime používá publikovaný obsah.

------------------------------------------------------------------------

# 9. Telemetry

Veškeré události vzniklé ve Studiích jsou zaznamenávány do společné
telemetrie.

Manager i Sales využívají stejná Runtime data.

------------------------------------------------------------------------

# 10. Architektonické invarianty

-   Runtime je jediným zdrojem významu.
-   Studia jsou Runtime projekce různých rolí.
-   Shared Services jsou společné všem Studiím.
-   Identity zachovává kontinuitu.
-   Access neurčuje význam.
-   Publish je jedinou cestou do produkce.

------------------------------------------------------------------------

# 11. Rozsah dokumentu

Patří sem:

-   vztahy mezi Studii,
-   sdílené služby,
-   integrační architektura.

Nepatří sem:

-   UX,
-   implementace,
-   databáze,
-   API,
-   detailní specifikace jednotlivých Studií.

------------------------------------------------------------------------

# Závěrečné ustanovení

Studio Integration Architecture je referenční dokument popisující
spolupráci všech Studií a sdílených platformních služeb. Veškeré budoucí
rozšiřování platformy musí respektovat zde definované integrační
principy.
