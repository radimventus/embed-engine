# MS-12 — Připravenost Experience
## Implementační specifikace (SSOT v1.0)

## Cíl

Poskytnout okamžitý přehled o obchodní připravenosti publikované Embed Experience.

Nejde o technický monitoring ani SEO kontrolu. Cílem je ověřit, že Experience obsahuje všechny důležité prvky pro kvalitní rozhodovací zážitek.

---

## Business hodnota

- rychlé ověření připravenosti,
- odhalení chybějících částí,
- doporučení dalších kroků,
- vyšší kvalita publikovaných Experience.

---

## UX scénář

Systém zobrazí jeden stav:

- 🟢 Experience je připravena.
- 🟠 Experience vyžaduje drobná doplnění.
- 🔴 Experience není připravena k publikaci.

AI následně vypíše doporučení (např. chybí půdorys, není nakonfigurován Priority Engine, doporučeno doplnit FAQ).

Primární akce:

**Otevřít modul**

---

## Runtime

Vyhodnocení vychází z:

- struktury Experience,
- povinných modulů,
- stavu publikace,
- konfigurace Runtime,
- validačních pravidel.

---

## UX principy

- jedna obrazovka,
- jedno hlavní sdělení,
- žádné technické logy,
- žádné tabulky,
- pouze doporučené kroky.

---

## Akceptační kritéria

- Runtime vyhodnotí připravenost Experience,
- AI vysvětlí všechna zjištění,
- doporučení otevřou příslušné moduly,
- při splnění podmínek se zobrazí pozitivní stav.
