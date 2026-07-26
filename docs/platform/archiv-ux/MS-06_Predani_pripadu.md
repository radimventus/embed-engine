# MS-06 — Předání případu
## Implementační specifikace (SSOT v2.0)

## Cíl

Předat případ správnému člověku během několika sekund.

Operátor nerozhoduje, komu případ předat. Systém navrhne nejlepšího příjemce a vysvětlí proč.

---

## Business hodnota

- minimální počet kliknutí,
- odstranění rozhodování,
- rychlé převzetí odpovědnosti,
- automatický zápis do Runtime.

---

## UX scénář

1. AI doporučí nového vlastníka.
2. Operátor zvolí:
   - Potvrdit,
   - nebo Vybrat jiného.
3. Runtime automaticky:
   - změní vlastníka,
   - zapíše historii,
   - odešle oznámení,
   - přepočítá Frontu pozornosti.

Celá interakce trvá přibližně 5 sekund.

---

## AI doporučení

AI vždy stručně vysvětlí důvod doporučení, například:

- nejnižší vytížení,
- zkušenost s podobnými případy,
- předchozí komunikace s klientem.

---

## Akceptační kritéria

- předání proběhne do několika sekund,
- operátor nemusí vyplňovat formuláře,
- Runtime provede všechny následné kroky automaticky,
- historie je zachována bez dodatečné práce uživatele.

---

## Implementační checklist

- [ ] AI doporučení
- [ ] Potvrdit / Vybrat jiného
- [ ] Automatický zápis Runtime
- [ ] Aktualizace Fronty pozornosti
- [ ] Oznámení novému vlastníkovi
