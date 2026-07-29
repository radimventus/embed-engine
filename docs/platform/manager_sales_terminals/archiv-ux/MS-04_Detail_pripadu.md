# MS-04 — Detail případu
## Implementační specifikace (SSOT v1.0)

## Cíl sprintu

Navrhnout hlavní pracovní obrazovku operátora po otevření případu.

Operátor musí během několika sekund pochopit:
- co se děje,
- proč se to děje,
- co doporučuje AI,
- jaký má být další krok.

---

## Business hodnota

- jedno místo pro práci s případem,
- odstranění přepínání mezi obrazovkami,
- rychlejší rozhodování,
- kompletní historie rozhodování zákazníka.

---

## UX scénář

1. Operátor klikne na položku ve Frontě pozornosti.
2. Otevře se Detail případu.
3. Okamžitě vidí aktuální stav.
4. Projde historii.
5. Přečte doporučení AI.
6. Provede akci.
7. Vrátí se zpět do Fronty pozornosti.

---

## Informační architektura

### Základní informace
- zákazník,
- projekt,
- aktuální stav,
- priorita,
- odpovědný obchodník,
- datum poslední aktivity.

### Průběh rozhodování
Přehled jednotlivých kroků Decision Journey.

### Aktivita zákazníka
Chronologický přehled všech významných událostí.

### AI doporučení
AI zobrazí:
- stručný souhrn,
- důvod doporučení,
- seznam konkrétních událostí,
- seznam konkrétních případů nebo změn,
- doporučený další krok.

AI musí vždy své doporučení vysvětlit.

---

## Doporučené akce

- Zavolat zákazníkovi.
- Předat obchodníkovi.
- Odeslat nabídku.
- Naplánovat schůzku.
- Označit jako vyřešené.

---

## UI komponenty

- Hlavička případu
- Souhrn případu
- Průběh rozhodování
- Aktivita zákazníka
- AI souhrn
- Doporučené akce
- Poznámky
- Historie změn

---

## Design Tokens & znovupoužitelné komponenty

- AppShell
- Card
- Badge
- Priorita
- Timeline
- Button
- Accordion
- Tabs
- Typografie
- Grid
- Spacing

---

## Datový model

- ID případu
- zákazník
- projekt
- Decision Journey
- aktuální priorita
- historie událostí
- AI doporučení
- otevřené úkoly
- odpovědná osoba

---

## Runtime integrace

### Čtení
- Detail Decision Journey
- Runtime Events
- Historie změn
- AI Summary
- Doporučené akce

### Zápis
- Přidání poznámky
- Změna priority
- Předání obchodníkovi
- Uzavření případu
- Naplánování další akce

---

## Stavy

- Načítání
- Případ nenalezen
- Chyba
- Připraveno

---

## Akceptační kritéria

- Operátor pochopí stav případu bez otevírání dalších obrazovek.
- AI vždy zdůvodní své doporučení.
- Všechny akce zapisují změny do Runtime.
- Detail lze opustit jediným kliknutím zpět do Fronty pozornosti.

---

## Implementační checklist

- [ ] Hlavička případu
- [ ] Souhrn případu
- [ ] Decision Journey
- [ ] Aktivita zákazníka
- [ ] AI souhrn s vysvětlením
- [ ] Doporučené akce
- [ ] Poznámky
- [ ] Runtime integrace
- [ ] Test všech stavů
