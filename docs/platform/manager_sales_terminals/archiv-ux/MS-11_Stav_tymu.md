# MS-11 — Stav týmu
## Implementační specifikace (SSOT v1.0)

## Cíl

Poskytnout vedoucímu rychlý přehled o aktuálním stavu týmu na základě ověřitelných dat z Runtime.

Nejde o hodnocení zaměstnanců ani KPI dashboard. Jde o interpretaci stavu systému.

---

## Business hodnota

- rychlé pochopení stavu týmu,
- včasné odhalení přetížení,
- podpora rozhodování vedoucího,
- důvěra v AI doporučení.

---

## UX scénář

Systém zobrazí jedno hlavní sdělení:

- 🟢 Tým pracuje stabilně.
- 🟠 Doporučena pozornost.
- 🔴 Vyžaduje zásah.

Pod ním AI vysvětlí důvod a doporučí první krok.

Primární akce:

**Zobrazit doporučení**

---

## Runtime

Využívá pouze ověřitelná data:

- převzaté případy,
- zatížení front,
- čekající případy,
- interakce,
- poznámky,
- Decision Runtime.

---

## UX principy

- jedna obrazovka,
- jedno hlavní sdělení,
- žádné grafy,
- žádné tabulky,
- žádné žebříčky zaměstnanců.

---

## Akceptační kritéria

- Runtime vytvoří souhrn stavu týmu,
- AI vysvětlí stav,
- zobrazují se pouze ověřitelná data,
- uživatel jedním kliknutím otevře doporučení.
