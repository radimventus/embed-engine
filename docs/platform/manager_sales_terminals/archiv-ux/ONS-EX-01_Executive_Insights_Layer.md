# ONS-EX-01 – Executive Insights Layer

## Účel
Executive Insights Layer představuje analytickou vrstvu nad Runtime. Nejde o CRM reporting ani klasický dashboard. Vrstva převádí data z Decision Journey na jednoduché manažerské odpovědi.

---

## Architektura

Experience
↓
Decision Journey
↓
Runtime
↓
Behavior Analytics
↓
Executive Insights
↓
Manager Studio

---

## Umístění

Manager Studio

- Obchodní zdraví
  - Rychlost rozhodování zákazníků
  - Kde ztrácíme zákazníky
  - Co ovlivňuje rozhodnutí zákazníků

---

## Executive Card Standard

Každá karta obsahuje:

1. Název obchodní otázky
2. Jedno hlavní KPI
3. Jednu dominantní vizualizaci
4. 2–4 doplňující metriky
5. AI Insight (interpretace + doporučení)

---

## Executive Cards

### 1. Rychlost rozhodování zákazníků
Zdroj:
- Runtime
- Decision Journey
- Priority Engine

Vizualizace:
- Line Chart

### 2. Kde ztrácíme zákazníky
Zdroj:
- Runtime
- Behavior Analytics
- Journey Analytics

Vizualizace:
- Funnel / Horizontal Bar Chart

### 3. Co ovlivňuje rozhodnutí zákazníků
Zdroj:
- Priority Engine
- Decision Journey
- Behavior Analytics

Vizualizace:
- Ranked Horizontal Bars

---

## Runtime odpovědnost

Runtime zajišťuje:

- agregaci dat,
- výpočet metrik,
- Decision Influence Score,
- Decision Confidence,
- AI Insight.

Frontend data pouze zobrazuje.

---

## Povolené datové zdroje

- Decision Journey
- Priority Engine
- Behavior Analytics
- Navigation Events
- AI Conversation Metadata
- Experience Telemetry

Bez závislosti na CRM nebo ERP.

---

## UX pravidla

Každá karta:

- odpovídá na jednu obchodní otázku,
- používá jednu hlavní vizualizaci,
- obsahuje jedno dominantní KPI,
- obsahuje jednu AI interpretaci.

---

## Akceptační kritéria

- Executive Insights jsou součástí Manager Studio.
- Všechny metriky pochází z Runtime.
- CRM není vyžadováno.
- Všechny karty používají Executive Card Standard.
