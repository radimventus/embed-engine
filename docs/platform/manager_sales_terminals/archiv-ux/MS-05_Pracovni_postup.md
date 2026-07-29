# MS-05 — Pracovní postup
## Implementační specifikace (SSOT v1.0)

## Cíl sprintu

Navrhnout jednotný způsob provádění práce nad případem.

Každá akce operátora musí být:
- jednoduchá,
- dohledatelná,
- zaznamenaná v Runtime,
- navazující na další krok.

Operátor nikdy nepřemýšlí kam kliknout, ale pouze co udělat.

---

## Business hodnota

- sjednocení pracovních postupů,
- omezení chyb,
- dohledatelnost všech rozhodnutí,
- možnost automatizace opakovaných činností.

---

## UX scénář

1. Operátor otevře Detail případu.
2. Vybere doporučenou akci.
3. Systém zobrazí pracovní formulář.
4. Operátor akci dokončí.
5. Runtime zapíše změnu.
6. Fronta pozornosti se přepočítá.
7. Operátor pokračuje dalším případem.

---

## Typy pracovních akcí

### Zavolat zákazníkovi
- datum,
- výsledek hovoru,
- další krok.

### Poslat nabídku
- typ nabídky,
- způsob odeslání,
- termín kontroly.

### Naplánovat schůzku
- datum,
- čas,
- místo nebo online,
- poznámka.

### Předat obchodníkovi
- komu,
- důvod,
- priorita.

### Uzavřít případ
- důvod,
- výsledek,
- poznámka.

---

## UI komponenty

- Panel akcí
- Formulář akce
- Potvrzení dokončení
- Historie akcí
- Tlačítko „Další případ“

---

## Design Tokens & znovupoužitelné komponenty

- AppShell
- Card
- Dialog
- Formuláře
- Button
- Badge
- Typografie
- Grid
- Spacing

---

## Datový model

- ID akce
- typ
- datum
- uživatel
- související případ
- výsledek
- poznámka
- navazující úkol

---

## Runtime integrace

### Čtení
- dostupné akce
- oprávnění
- stav případu

### Zápis
- vytvoření akce
- změna stavu případu
- vytvoření navazujícího úkolu
- zápis do historie

---

## AI souhrn

Před provedením akce AI vysvětlí:
- proč akci doporučuje,
- z jakých událostí vychází,
- jaký očekává přínos.

Po dokončení navrhne další krok.

---

## Stavy

- Načítání
- Akce připravena
- Ukládání
- Dokončeno
- Chyba

---

## Akceptační kritéria

- Každá akce má jednotný průběh.
- Žádná akce se neztratí bez zápisu do Runtime.
- Operátor může jedním kliknutím přejít na další případ.
- Historie všech akcí je dohledatelná.

---

## Implementační checklist

- [ ] Panel pracovních akcí
- [ ] Formuláře akcí
- [ ] Potvrzení dokončení
- [ ] Historie akcí
- [ ] Přechod na další případ
- [ ] Runtime integrace
- [ ] AI doporučení
- [ ] Test všech stavů
