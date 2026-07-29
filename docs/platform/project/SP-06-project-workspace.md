# SP-06 --- Project Workspace

**Status:** Draft → SSOT po schválení\
**Location:** `docs/platform/project/SP-06-project-workspace.md`

# 1. Purpose

Tento dokument definuje fyzickou organizaci Projectů uvnitř Platformy
CONIS.

Cílem je zajistit, aby všechny Projecty používaly jednotnou strukturu a
aby Runtime, Registry i Builder pracovaly nad stejným modelem.

# 2. Principle

Každý Project má vlastní kořenový adresář (Project Root).

Platforma obsahuje pouze sdílené části.

Project nikdy neupravuje Platformu.

Platforma nikdy neobsahuje data Projectu.

# 3. Canonical Structure

``` text
Platform
│
├── apps
├── packages
├── runtime
├── builder
├── client-studio
├── manager-studio
│
└── projects
      ├── domy-s-energii
      ├── atrium
      └── lucern
```

# 4. Project Root

Každý Project obsahuje vlastní:

-   manifest
-   identity
-   branding
-   objects
-   assets
-   knowledge
-   presentation
-   publish
-   analytics
-   settings

Žádná z těchto částí nesmí být sdílena mezi Projecty.

# 5. Platform Boundary

Sdílené jsou pouze:

-   Runtime
-   Decision Engine
-   Experience Engine
-   Builder
-   Client Studio
-   Manager Studio
-   UI Components
-   Design System

# 6. Builder Contract

Builder pracuje pouze se složkou:

``` text
/projects
```

Každý podadresář představuje jeden Project.

# 7. Registry Contract

Registry vytváří seznam Projectů na základě dostupných Project Root
adresářů.

# 8. Architectural Rules

1.  Project má vždy vlastní Root.
2.  Root obsahuje kompletní Project.
3.  Platforma nesmí ukládat zákaznická data mimo Project Root.
4.  Builder nikdy neupravuje Platformu.
5.  Přidání Projectu znamená vytvoření nového Project Root.

# 9. Consequences

Přidání nové firmy znamená pouze vytvoření nové složky Projectu.

Platforma zůstává beze změny.

## Constitutional Principle

> Platforma je společná. Každý Project má vlastní Workspace.
