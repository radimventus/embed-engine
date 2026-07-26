# MS-07 — Denní briefing
## Implementační specifikace (SSOT v1.0)

## Cíl

Poskytnout každému pracovníkovi po přihlášení jediný přehled, který během několika sekund řekne:

- co dnes udělat,
- proč právě to,
- co se od včerejška změnilo,
- na co se soustředit.

Operátor nehledá práci. Práce čeká na něj.

---

## Business hodnota

- rychlejší zahájení práce,
- vyšší produktivita,
- jednotné priority,
- menší riziko přehlédnutí důležité události.

---

## UX scénář

Po přihlášení systém zobrazí stručný briefing.

AI doporučí několik prioritních kroků a nabídne jediné primární tlačítko:

**Začít pracovat**

Po kliknutí se otevře první doporučený případ.

---

## AI briefing

AI vytvoří krátké shrnutí dne:

- případy s vysokou pravděpodobností uzavření,
- změny priorit klientů,
- nové leady vyžadující rychlou reakci.

Briefing nepřesáhne jednu obrazovku.

---

## Runtime

Briefing vzniká automaticky z:

- Priority Queue,
- Decision Runtime,
- nových leadů,
- rozpracovaných případů,
- změn od posledního přihlášení.

---

## UX principy

- jedna obrazovka,
- žádné tabulky,
- žádné filtry,
- žádná konfigurace,
- pouze doporučení.

---

## Akceptační kritéria

- briefing vzniká automaticky,
- obsahuje jen několik priorit,
- jedním kliknutím lze zahájit práci,
- není nutné orientovat se v systému.

---

## Implementační checklist

- [ ] AI briefing
- [ ] Denní priority
- [ ] Shrnutí změn
- [ ] Tlačítko „Začít pracovat“
- [ ] Runtime integrace
- [ ] Test scénářů
