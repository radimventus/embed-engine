# Engineering Playbook (v0.3)

## Purpose

Engineering Playbook definuje jednotný způsob vývoje Embed Engine.

Neřeší architekturu.

Neřeší implementaci.

Definuje proces, podle kterého vznikají nové schopnosti platformy.

---

# Core Principle

Od Foundation v0.3 platí:

> Engine se nerozšiřuje přidáváním funkcí.
>
> Engine se rozšiřuje přidáváním Decision Capabilities.

Každá změna musí přispívat k této vizi.

---

# Development Lifecycle

Každá nová capability prochází stejným životním cyklem:

```text
Problem
    ↓
Pilot
    ↓
Evidence
    ↓
Knowledge
    ↓
Capability
    ↓
Runtime
    ↓
Experience
```

Runtime není výchozím bodem.

Runtime je implementací ověřeného poznání.

---

# Decision Gate

Před zahájením implementace musí být zodpovězeny následující otázky:

1. Jaký problém capability řeší?
2. Jaká cílová skupina z ní bude profitovat?
3. Jaké poznatky ji podporují?
4. Lze ji ověřit pilotem?
5. Vyžaduje změnu Runtime?
6. Pokud ano, je potřeba ADR?

Pokud není možné odpovědět na první čtyři otázky, implementace nezačíná.

---

# Architecture Changes

Architektonické změny jsou výjimkou.

Za architektonickou změnu se považuje změna:

* Runtime boundaries
* Projection model
* Object Package contract
* Product terminology
* Documentation SSOT
* Public Runtime API

Každá taková změna vyžaduje nový Architecture Decision Record (ADR).

---

# Definition of Ready

Nový EPIC je připraven k implementaci pouze pokud:

* je definován problém,
* existuje očekávaná capability,
* jsou určeny dotčené části systému,
* jsou známá kritéria úspěchu,
* jsou identifikována případná architektonická rizika.

---

# Definition of Done

EPIC je dokončen pouze pokud:

* capability je implementována,
* dokumentace odpovídá skutečné implementaci,
* nevznikla duplicita vůči existujícím SSOT,
* případné architektonické změny jsou zaznamenány pomocí ADR,
* poznatky z pilotů byly promítnuty do Knowledge Foundation, pokud jsou obecně platné.

---

# Documentation Rules

Dokumentace není cílem.

Vzniká pouze tehdy, když:

* formalizuje dlouhodobé poznání,
* popisuje architektonické rozhodnutí,
* vytváří nový SSOT,
* usnadňuje budoucí vývoj.

Dočasné pracovní poznámky do SSOT nepatří.

---

# AI Agent Workflow

Každý AI agent postupuje před návrhem změny následovně:

1. Načte Product Vision.
2. Načte Product Principles.
3. Načte Post-Foundation Development Policy.
4. Ověří relevantní SSOT dokumenty.
5. Zkontroluje existující ADR.
6. Teprve poté navrhne řešení.

Agent nesmí navrhovat změny, které obcházejí schválené architektonické principy.

---

# Success Metric

Úspěch projektu není měřen počtem implementovaných funkcí.

Primární metriky jsou:

* počet ověřených Decision Capabilities,
* kvalita rozhodovací zkušenosti,
* množství formalizovaného Product Knowledge,
* úspěšnost pilotů při ověřování nových poznatků.

---

# Guiding Principle

Embed Engine je platforma pro převod expertních znalostí do personalizovaných rozhodovacích zkušeností.

Každá změna by měla tuto schopnost rozšiřovat, zpřesňovat nebo zjednodušovat — nikdy ji neoslabovat.
