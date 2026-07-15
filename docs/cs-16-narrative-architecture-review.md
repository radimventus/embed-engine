# CS-16 — Narrative Architecture Review

**Role:** Autor příběhu / Narrative Design Director  
**Date:** 2026-07-15  
**Wireframe:** absolutní autorita  
**Render:** `docs/cs-15-render-1600-fullpage.png`

Metoda: každá sekce = kapitola. Žádná geometrie, žádný kód.

---

## Co má každá kapitola udělat s návštěvníkem

| Kapitola | Úkol vůči návštěvníkovi |
|----------|-------------------------|
| **Header** | Orientovat. *„Jsem ve správném studiu, vím kde uložit, vím jak kontaktovat.“* |
| **Hero** | Vzbudit touhu. *„Tenhle dům je krásný, je můj typ, chci dovnitř.“* |
| **Social Proof** | Validovat rozhodnutí. *„Nejsem blázen — ostatní to taky řeší, teď, tento týden.“* |
| **Property Explorer** | Ponořit do reality. *„Projdu si ho, pochopím místnosti, vidím půdorys — dokážu si ho představit.“* |
| **Priority Engine** | Zapojit identitu. *„Oni se ptají, co je pro mě důležité — berou mě vážně, personalizují.“* |
| **FAQ** | Uklidnit pochybnosti. *„Moje obavy nejsou unikátní — odpovědi existují.“* |
| **AI Advisor** | Otevřít dialog. *„Můžu se zeptat na cokoliv, bez tlaku, bez ostychu.“* |
| **Lead Capture** | Převést záměr v akci. *„Chci ověřit, jestli to sedí mým plánům — jsem připraven nechat kontakt.“* |
| **Footer** | Uzavřít důvěru. *„Stojí za tím reálná firma, vím na koho se obrátit.“* |

---

## Celkový oblouk wireframu

```
touha → důkaz → identita → jistota → dialog → rozhodnutí → důvěra
```

Wireframe vede návštěvníka jako prodejce, který ví, kdy mluvit o srdci a kdy o faktech.

---

## Kapitola po kapitole

### Header

| | |
|---|---|
| **Desired** | Klidná jistota. Návštěvník ví, kde je, a má pocit kontroly. |
| **Actual** | Shodné. Studio působí profesionálně, utility jsou dostupné. |
| **Difference** | Minimální. |
| **Why** | Header renderuje stejný narativní tón — tichý průvodce, ne překážka. |

---

### Hero

| | |
|---|---|
| **Desired** | Okamžitá emoce: krása domu → identifikace s nabídkou → impulz k akci (*Podívat se dovnitř*). První obrazovka = celý příslib produktu. |
| **Actual** | Práznota a čekání. Návštěvník nevidí dům ani příslib — vidí nehotovost. Emoce nepřichází; přichází otázka *„Je to rozbité?“* |
| **Difference** | Wireframe: **touha**. Render: **podezření**. |
| **Why** | Opening kapitola dává prázdnému poli příliš mnoho času a příliš málo významu. Příběh nemá hrdinu — má mezeru. Návštěvník ještě nečte o domě; čte o stavu produktu. |

---

### Social Proof

| | |
|---|---|
| **Desired** | Sociální teplo hned po emočním hákku. *„Nejsi sám, ostatní to řeší právě teď.“* |
| **Actual** | Obsah je správný, ale dorazí pozdě — až po dlouhém scrollu přes hero. Působí jako dodatek, ne jako ujištění. |
| **Difference** | Wireframe: **validace touhy**. Render: **poznámka pod čarou**. |
| **Why** | Social proof je epilog opening kapitoly. Když opening kapitola nekončí emocí, ale prázdnotou, epilog ztrácí kontext. |

---

### Property Explorer

| | |
|---|---|
| **Desired** | Hluboké ponoření. Návštěvník prochází dům jako v prohlídce — galerie, místnosti, půdorys jako jeden zážitek objevování. |
| **Actual** | Záměr je čitelný, ale tempo padá. Místo *„jdu dovnitř“* je *„procházím chodbou mezi panely.“* Objevování existuje, urgency ne. |
| **Difference** | Wireframe: **immersion**. Render: **prohlížení rozptýlených modulů**. |
| **Why** | Kapitola ztratila rytmus předchozí kapitoly. Návštěvník přichází unavený z opening voidu; explorer ho nevtáhne zpět do flow, jen nabízí další bílé prostory. |

---

### Priority Engine

| | |
|---|---|
| **Desired** | Osobní zapojení. *„Teď jsem na řadě já — řeknu, co je důležité, a oni mi to vrátí zpět.“* Pocit spolupráce, ne dotazníku. |
| **Actual** | Formulářový dojem. Výběr a vysvětlení se necítí jako jeden dialog — spíš jako dvě sousedící obrazovky. |
| **Difference** | Wireframe: **spolupráce**. Render: **evidence sběru dat**. |
| **Why** | Narativ *„vyber 3 priority“* vyžaduje pocit, že někdo na druhé straně poslouchá. Rozbitá kompozice kapitoly rozbíjí iluzi partnerství. |

---

### FAQ

| | |
|---|---|
| **Desired** | Uvolnění. Pochybnosti se rozpouštějí — odpovědi jsou po ruce, strukturované, klidné. |
| **Actual** | Blízké wireframu. Accordion čte jako *„máme na to odpovědi.“* |
| **Difference** | Minimální. |
| **Why** | FAQ je obsahově stabilní kapitola; její narativ nezávisí tak silně na předchozím rytmu. |

---

### AI Advisor

| | |
|---|---|
| **Desired** | Intimní dialog. Návštěvník cítí, že se může zeptat na cokoliv — i na *úzký pozemek* — bez studu. |
| **Actual** | Chat je čitelný, konverzace dává smysl. Pocit průvodce je přítomný. |
| **Difference** | Wireframe a render jsou blízké. |
| **Why** | AI kapitola stojí na obsahu, ne na proporci. Dialog funguje i když předchozí kapitoly ztratily tempo. |

---

### Lead Capture

| | |
|---|---|
| **Desired** | Vrchol commitmentu. Tmavě modrá kapitola = *„Teď rozhoduju — ověřím, jestli to sedí mým plánům.“* Emoční důraz, jasná volba (pozemek / parcela), jednoduchý krok. |
| **Actual** | Silná kapitola. Kontrast, CTA, formulář — conversion moment je čitelný. |
| **Difference** | Minimální až mírně pozitivní. |
| **Why** | Finální kapitola nese vlastní vizuální váhu; nepotřebuje perfektní předchozí rytmus, aby byla srozumitelná. |

---

### Footer

| | |
|---|---|
| **Desired** | Tiché uzavření. Legitimita firmy, kontakt, klid po rozhodnutí. |
| **Actual** | Shodné. |
| **Difference** | Minimální. |
| **Why** | Footer je epilog; plní svou roli. |

---

## Provádí render stejnou emoční sekvenci?

**Ne.**

Wireframe: `touha → důkaz → identita → jistota → dialog → rozhodnutí`

Render: `podezření → zpoždění → únava → formulář → (teprve pak) jistota → dialog → rozhodnutí`

Backend stránky (FAQ, AI, Lead Capture) vyprávějí správně.  
Opening act je přepsaný jiným žánrem — z romance na technický draft.

---

## Ve které kapitole se příběh poprvé rozpadne?

**V Hero — v opening kapitole, dříve než návštěvník stihne pocítit cokoliv kromě nejistoty, zda produkt vůbec existuje.**

---

## Jedna oprava

**Přepsat opening kapitolu tak, aby návštěvník na první pohled prošel celým emočním obloukem Hero: vidí dům → chápe nabídku → cítí sociální validaci → má kam jít dál — místo toho, aby první kapitola byla ticho mezi obálcemi.**
