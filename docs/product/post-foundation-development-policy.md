# Post-Foundation Development Policy (v0.3)

**Related process SSOT:** [Engineering Playbook](../implementation/engineering-playbook.md)

## Status

Foundation byla dokončena.

Architektura Runtime, Experience, Product i Documentation je považována za stabilní.

Od tohoto okamžiku platí zásada:

> Architektura se nemění bez velmi silného důvodu.

---

# Priority vývoje

Další vývoj se řídí tímto pořadím:

1. Nové Decision Capabilities
2. Ověření v pilotních projektech
3. Získávání Decision Knowledge
4. Implementace Runtime pouze tehdy, pokud je vyžadována novou capability
5. Refactoring pouze při jednoznačném přínosu

---

# Architectural Freeze

Následující oblasti jsou považovány za stabilní:

* Runtime boundaries
* Projection model
* Object Package koncept
* Documentation SSOT
* Product terminology

Změny těchto oblastí vyžadují Architecture Decision Record (ADR).

---

# Capability-first Development

Každý nový EPIC musí odpovědět na otázku:

> Jakou novou rozhodovací schopnost Engine získává?

Nestačí přidat komponentu nebo funkci.

Každá změna musí rozšiřovat schopnosti platformy.

---

# Pilot-first Validation

Nové schopnosti se nejprve ověřují na pilotních objektech.

Teprve ověřené poznatky mohou být povýšeny na Product Knowledge.

---

# Knowledge-first Evolution

Pokud vznikne nové pravidlo nebo poznatek, postup je vždy:

Pilot → Evidence → Knowledge → Capability → Runtime (je-li potřeba)

Nikdy opačně.

Runtime není zdrojem znalostí.

Runtime pouze vykonává formalizované znalosti.

---

# Success Metric

Úspěch projektu nebude hodnocen podle:

* počtu komponent,
* počtu řádků kódu,
* počtu modulů.

Primární metrikou je růst ověřených Decision Capabilities, které zvyšují kvalitu rozhodovací zkušenosti koncového uživatele.

---

# Strategic Direction

Embed Engine není cílem sám o sobě.

Je to platforma pro systematické převádění expertních znalostí do personalizovaných rozhodovacích zkušeností.

Každá další etapa vývoje musí tuto vizi posilovat, nikoli rozmělňovat.
