# MS-10 — Slabá místa
## Implementační specifikace (SSOT v1.0)

## Cíl

Automaticky identifikovat opakující se vzorce, které mohou snižovat efektivitu práce s případy.

Nejde o hodnocení zaměstnanců ani o dashboard KPI. Jde o diagnostiku procesů založenou na datech, která Runtime skutečně zná.

---

## Business hodnota

- včasné odhalení opakujících se problémů,
- průběžné zlepšování procesů,
- vyšší efektivita práce,
- důvěra v doporučení AI.

---

## UX scénář

Systém zobrazí pouze několik nejvýznamnějších zjištění.

Příklad:

- Reakce na nové případy
- Poznámky po interakcích
- Opakované předávání případů

Každé zjištění obsahuje:

- stručný popis,
- AI vysvětlení,
- doporučení,
- tlačítko **Prozkoumat**.

Pokud žádný významný problém neexistuje, zobrazí:

> Momentálně jsme nenašli žádné významné slabé místo.

---

## AI diagnostika

AI vysvětlí:

- co bylo detekováno,
- proč je to důležité,
- jaký může být dopad,
- co doporučuje prověřit.

---

## Runtime

Diagnostika vychází pouze z ověřitelných dat:

- převzetí případů,
- interakcí,
- poznámek,
- změn priorit,
- Decision Runtime,
- interních pravidel.

---

## UX principy

- žádné grafy,
- žádné tabulky,
- pouze nejdůležitější zjištění,
- čitelné během jedné minuty.

---

## Akceptační kritéria

- automatická detekce opakujících se vzorců,
- AI vysvětlení každého zjištění,
- možnost otevřít detail jedním kliknutím,
- pozitivní stav při absenci problémů.

---

## Implementační checklist

- [ ] Detekce vzorců
- [ ] AI diagnostika
- [ ] Detail zjištění
- [ ] Runtime integrace
- [ ] Test scénářů

---

## Otevřené otázky

Zatím žádné.
