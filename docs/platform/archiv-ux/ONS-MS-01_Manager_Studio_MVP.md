# ONS-MS-01 – Manager Studio MVP

## Status
Approved (Architecture Freeze v1)

---

# 1. Účel

Manager Studio je řídicí vrstva nad Embed Engine určená pro management.

Nejde o CRM, ERP ani klasickou administraci.

Jeho cílem je poskytnout rychlý přehled o stavu Experience a podpořit obchodní rozhodování.

---

# 2. Principy

- Agile First
- Apple Easy
- One Screen → One Question
- Runtime First
- MVP First

---

# 3. Informační architektura

Manager Studio

1. Dashboard
2. Experience
3. Obchodní zdraví
4. Nastavení

Žádné další sekce nejsou součástí MVP.

---

# 4. Specifikace obrazovek

## Dashboard

Otázka:
Co se právě děje?

Obsah:
- Aktivní Experience
- Aktivní návštěvníci
- Nové Decision Journey
- Poslední AI Insight

---

## Experience

Otázka:
Jaké Experience spravuji?

Obsah:
- Seznam Experience
- Stav publikace
- Základní statistiky
- Otevření detailu

---

## Obchodní zdraví

Otázka:
Jak si vede moje Experience?

Obsahuje pouze Executive Insights:

- Rychlost rozhodování zákazníků
- Kde ztrácíme zákazníky
- Co ovlivňuje rozhodnutí zákazníků

Viz ONS-EX-01.

---

## Nastavení

Otázka:
Jak je systém nastaven?

Obsah:
- Firma
- Uživatelé
- Doména
- API

---

# 5. Co není součástí MVP

- CRM
- ERP
- Exporty
- Automatizace
- Report Builder
- Dashboard Builder
- Segmentace
- Audit log
- Historie změn
- Pokročilé filtry
- Business Intelligence

---

# 6. UX pravidla

Každá obrazovka:

- odpovídá pouze na jednu otázku,
- obsahuje minimum ovládacích prvků,
- umožňuje pochopení během několika sekund.

Pokud začne řešit více témat, musí být rozdělena.

---

# 7. Runtime

Manager Studio nepočítá obchodní metriky.

Veškeré agregace a analytické výpočty poskytuje Runtime.

Frontend pouze zobrazuje data.

---

# 8. Akceptační kritéria

- Implementovány jsou přesně čtyři obrazovky.
- Každá obrazovka plní jediný účel.
- Executive Insights jsou integrovány do Obchodního zdraví.
- Manager Studio nevyžaduje CRM pro základní funkčnost.
- Rozsah odpovídá pilotnímu MVP.
