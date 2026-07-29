# MS-08 — Situace vyžadující pozornost
## Implementační specifikace (SSOT v1.0)

## Cíl

Automaticky upozornit na situace, které mohou negativně ovlivnit obchod, zákaznickou zkušenost nebo chod firmy.

Systém zobrazuje pouze skutečné výjimky. Nezobrazuje běžný provoz.

---

## Business hodnota

- rychlejší reakce,
- méně ztracených obchodů,
- lepší zákaznická zkušenost,
- minimální provozní zátěž.

---

## UX scénář

Uživatel vidí pouze situace vyžadující pozornost.

Každá obsahuje:
- co se děje,
- proč je to důležité,
- doporučenou akci,
- jediné primární tlačítko „Otevřít případ“.

---

## AI vyhodnocení

AI stručně vysvětlí:
- proč upozornění vzniklo,
- jaký může mít dopad,
- jaký doporučuje další krok.

---

## Runtime

Výjimky vznikají automaticky z:
- Decision Runtime,
- Priority Queue,
- aktivity klienta,
- obchodních pravidel,
- interních SLA.

---

## UX principy

- žádné seznamy všech případů,
- pouze výjimky,
- jedno doporučení,
- jedno rozhodnutí.

Pokud žádná výjimka neexistuje, zobrazí se zpráva:

„Dnes není potřeba řešit žádnou mimořádnou situaci.“

---

## Akceptační kritéria

- výjimky vznikají automaticky,
- každá obsahuje doporučení,
- jedním kliknutím lze otevřít případ,
- při absenci výjimek se nezobrazuje prázdný seznam.

---

## Implementační checklist

- [ ] Detekce výjimek
- [ ] AI vysvětlení
- [ ] Otevření případu
- [ ] Runtime integrace
- [ ] SLA pravidla
- [ ] Test scénářů
