# SP-03 --- Project Runtime

**Status:** Draft → SSOT po schválení\
**Location:** `docs/platform/project/SP-03-project-runtime.md`

# 1. Purpose

Tento dokument definuje způsob, jakým Runtime načítá a interpretuje
Project.

Runtime je společný pro všechny Projecty a nikdy neobsahuje projektově
specifickou logiku.

# 2. Principle

Runtime nezná žádnou firmu.

Runtime zná pouze Project.

Veškeré rozdíly mezi zákazníky jsou výsledkem interpretace aktivního
Projectu.

# 3. Responsibilities

Runtime je odpovědný za:

-   načtení Manifestu
-   validaci Projectu
-   inicializaci prostředí
-   načtení jednotlivých částí Projectu
-   sestavení Experience
-   spuštění Runtime

# 4. Runtime Pipeline

``` text
openProject(projectId)
        ↓
Load Manifest
        ↓
Validate
        ↓
Load Identity
        ↓
Load Configuration
        ↓
Load Objects
        ↓
Load Assets
        ↓
Load Knowledge
        ↓
Load Presentation
        ↓
Initialize Experience
        ↓
Run
```

Každý Project je načítán stejnou pipeline.

# 5. Runtime Contract

Runtime přijímá pouze identifikátor Projectu.

Všechny ostatní informace získává z Manifestu.

# 6. Isolation

Aktivní může být vždy pouze jeden Project.

Project nesmí přistupovat k datům jiného Projectu.

Publikace ani běh jednoho Projectu nesmí ovlivnit jiný Project.

# 7. Architectural Rules

1.  Runtime existuje pouze jednou.
2.  Runtime nikdy neobsahuje zákaznická data.
3.  Runtime nikdy neobsahuje zákaznickou logiku.
4.  Runtime interpretuje pouze Manifest.
5.  Runtime používá stejnou pipeline pro všechny Projecty.

# 8. Consequences

Přidání nového Projectu nikdy nevyžaduje změnu Runtime.

Jakákoliv změna Runtime se automaticky vztahuje na všechny Projecty.

## Constitutional Principle

> Runtime je univerzální interpret. Project je jediným zdrojem
> zákaznické konfigurace.
