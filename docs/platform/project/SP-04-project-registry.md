# SP-04 --- Project Registry

**Status:** Draft → SSOT po schválení\
**Location:** `docs/platform/project/SP-04-project-registry.md`

# 1. Purpose

Project Registry je centrální evidence všech Projectů dostupných na
Platformě.

Registry neposkytuje obsah Projectů. Poskytuje pouze jejich identitu a
možnost jejich otevření.

# 2. Principle

Platforma vždy pracuje se seznamem Projectů.

Aktivní Project je vždy vybrán z Registry.

# 3. Responsibilities

Registry je odpovědný za:

-   evidenci Projectů
-   vytvoření nového Projectu
-   otevření Projectu
-   archivaci Projectu
-   odstranění Projectu
-   předání projectId Runtime

# 4. Canonical Flow

``` text
Start Platform
      ↓
Load Registry
      ↓
Display Projects
      ↓
Select Project
      ↓
Open Project
      ↓
Runtime
```

# 5. Project State

Každý Project může být v jednom z následujících stavů:

-   Draft
-   Preview
-   Pilot
-   Production
-   Archived

Stav je vlastností Projectu, nikoliv Runtime.

# 6. Registry Contract

Registry vrací pouze metadata potřebná pro výběr Projectu.

Obsah Projectu načítá až Runtime prostřednictvím Manifestu.

# 7. Architectural Rules

1.  Registry nikdy nenačítá obsah Projectu.
2.  Registry předává Runtime pouze projectId.
3.  Registry je jediným zdrojem seznamu Projectů.
4.  Runtime nesmí vytvářet ani evidovat Projecty.
5.  Změna Registry nesmí ovlivnit strukturu Projectu.

# 8. Builder Integration

Úvodní obrazovka Builderu zobrazuje Registry.

Builder je uživatelské rozhraní nad Registry.

# 9. Consequences

Přidání nové firmy znamená pouze přidání nového Projectu do Registry.

Není potřeba měnit Runtime ani Client Studio.

## Constitutional Principle

> Registry spravuje Projecty. Runtime je interpretuje.
