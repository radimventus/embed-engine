# MS-03 — Fronta pozornosti
## Implementační specifikace (SSOT v1.0)

## Cíl sprintu

Navrhnout hlavní pracovní seznam operátora.

Fronta pozornosti není seznam událostí.
Je to seznam práce, kterou je potřeba udělat.

Hlavní otázka:
> Na čem mám pracovat právě teď?

---

## Business hodnota

- odstranění hledání důležitých případů,
- sjednocení priorit práce,
- rychlejší reakce na kritické situace,
- jedno místo pro každodenní práci.

---

## UX scénář

1. Operátor otevře Operations Studio.
2. Přehled Runtime zobrazí celkový stav.
3. Fronta pozornosti zobrazí případy čekající na akci.
4. Operátor otevře první případ.
5. Vyřeší jej.
6. Fronta se automaticky přepočítá.

---

## Informační architektura

Každá položka obsahuje:
- název případu,
- zákazníka,
- důvod zařazení,
- prioritu,
- doporučenou akci,
- termín,
- odpovědnou osobu.

---

## UI komponenty

- Fronta pozornosti
- Položka fronty
- Priorita
- Doporučená akce
- Filtry
- Vyhledávání

---

## Design Tokens & znovupoužitelné komponenty

- AppShell
- Card
- Badge
- Priorita
- Tlačítka
- Ikony
- Typografie
- Grid
- Spacing

---

## Runtime integrace

### Čtení

- Priority Engine
- Runtime Events
- Decision Journey
- AI doporučení
- Stav případu

### Zápis

- Otevření případu
- Označení jako vyřízené
- Předání obchodníkovi
- Přidání poznámky
- Změna priority

---

## AI souhrn

AI panel obsahuje:

### Souhrn

Stručné vysvětlení situace.

### Případy

Pod souhrnem je vždy seznam konkrétních případů s přímým otevřením detailu.

AI nikdy nezobrazuje doporučení bez možnosti zobrazit zdrojové případy.

---

## Stavy

- Načítání
- Prázdná fronta
- Chyba
- Připraveno

---

## Akceptační kritéria

- Fronta je automaticky seřazena podle priority.
- Vyřízení případu okamžitě změní pořadí.
- Každá položka otevře detail případu.
- AI souhrn vždy obsahuje odkazy na zdrojové případy.
- Operátor nikdy nemusí hledat další práci ručně.

---

## Implementační checklist

- [ ] Fronta pozornosti
- [ ] Položka fronty
- [ ] Filtry
- [ ] Vyhledávání
- [ ] AI souhrn
- [ ] Seznam doporučených případů
- [ ] Runtime integrace
- [ ] Test všech stavů
