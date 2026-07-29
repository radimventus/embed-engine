# SP-01 --- Project Architecture

**Status:** Draft → SSOT po schválení\
**Location:** `docs/platform/project/SP-01-project-architecture.md`

# 1. Purpose

Tento dokument definuje architektonickou jednotku **Project** jako
základní provozní jednotku platformy CONIS.

Project představuje jednu zákaznickou implementaci běžící nad sdíleným
Runtime.

# 2. Principle

Platforma CONIS existuje pouze jednou.

Runtime existuje pouze jednou.

Každá zákaznická implementace je samostatný **Project**.

Platforma nikdy nevytváří kopii Runtime ani Experience.

Každý Project používá stejný Runtime.

# 3. Definitions

## Platform

Sdílené jádro systému obsahující Runtime, Decision Engine, Builder,
Client Studio, Manager Studio a všechny sdílené komponenty.

## Project

Jedna zákaznická implementace obsahující konfiguraci, obsah a data
potřebná pro provoz.

## Runtime

Interpretuje Project a nikdy neobsahuje data konkrétní firmy.

# 4. Project Boundary

Do Projectu patří:

-   Identity
-   Branding
-   Objects
-   Assets
-   Knowledge
-   Presentation
-   Publish Configuration
-   Analytics
-   Leads
-   Settings

Nic z uvedeného nesmí být součástí Runtime.

# 5. Shared Components

Sdílené mezi všemi Projecty:

-   Runtime
-   Decision Engine
-   Experience Engine
-   Client Studio
-   Manager Studio
-   Builder
-   UI Components
-   Design System
-   Contracts
-   HP-002 format
-   Runtime APIs

# 6. Lifecycle

``` text
Create
↓
Configure
↓
Preview
↓
Pilot
↓
Production
↓
Maintain
↓
Archive
```

# 7. Runtime Contract

Runtime vždy pracuje pouze nad jedním aktivním Projectem.

# 8. Client Studio

Client Studio je editor Platformy. Při otevření Projectu mění pouze
datový zdroj.

# 9. Manager Studio

Manager Studio pracuje nad aktivním Projectem stejným způsobem.

# 10. Publishing

Publikace jednoho Projectu nesmí ovlivnit žádný jiný Project.

# 11. Architectural Rules

1.  Runtime existuje pouze jednou.
2.  Platform existuje pouze jednou.
3.  Project je jediná zákaznická jednotka.
4.  Runtime nesmí obsahovat data firmy.
5.  Client Studio ani Manager Studio nesmí obsahovat projektově
    specifickou logiku.
6.  Rozdíly mezi firmami jsou deklarovány uvnitř Projectu.
7.  Nová firma nikdy nevyžaduje fork Runtime.

# 12. Consequences

Vznik nové firmy znamená pouze vytvoření nového Projectu.

## Constitutional Principle

> **Platforma se vyvíjí. Projecty se konfigurují.**
