# Sprint R-03 — Design Reconstruction (Architecture First)

**Authority:** Approved wireframe  
**Scope:** Opening · Property Explorer · Priority Engine  
**Method:** Chapter → Composition → Layout → Components

---

# Opening Chapter

## 1. Composition Envelope

| | |
|---|---|
| **Začátek** | Spodní hrana header pruhu (tenký orientační rám, ne součást dramatu) |
| **Konec** | Spodní hrana social proof pásu — poslední prvek Opening act |
| **Definující hmota** | Úvodní obrazová plocha (cream) — otevírá kapitolu, ale ne končí ji |
| **Spodní rytmus** | Třísloupcový social proof pás — tiché uzavření opening act před Exploration |

Opening je **jeden vertikální akt** uvnitř Desktop Canvas. Header stojí mimo drama. Vše pod headerem až po social proof patří jedné scéně.

## 2. Primary Mass

**Úvodní obraz (Hero Image).**

První pohled musí padnout na dům — cream plocha je vstupní brána do příběhu. Title a CTA jsou silné, ale až druhý beat. Social proof je třetí. Obraz otevírá emoční oblouk: *touha*.

## 3. Supporting Masses

| Hmota | Vztah |
|-------|--------|
| Title + spec řádek | **Podřízený** k obrazu — rational anchor hned pod emocí |
| Primary CTA | **Podřízený**, ale **rovnovážný s title** v jednom horizontálním pásu — akce patří k identitě domu, ne k nové scéně |
| Social proof ribbon | **Podřízený** — validace na konci actu, ne nový akt |

Title a CTA tvoří **jeden Supporting Mass** — horizontální pásmo pod obrazem. CTA není izolovaný objekt.

## 4. Reading Flow

```
Introductory Image
        ↓
House Title → Spec / Price
        ↓
Primary CTA (same horizontal sweep, right)
        ↓
Social Proof → column 1 → column 2 → column 3
```

Oko nikdy ne „vypadne" z opening act do bílého prostoru mezi pásy.

## 5. Spatial Rules

- Opening act = **jeden Composition Envelope** — žádné vnímatelné horizontální řezy mezi obrazem, title/CTA a social proof
- Header je **tenký rám** — nesmí konkurovat obrazu dominantou
- Title a CTA sdílejí **jednu horizontální rovinu** — CTA nezačíná novou scénu
- Social proof je **závěrečný rytmus** actu — tři rovnocenné sloupce, tenké svislé dělení
- Cream obraz končí, title/CTA pás začíná **bez vertikální propasti** — těsné handoff
- Opening act musí být **čitelný celý v prvním viewportu** — obraz kompaktní, ne monolit
- Whitespace **odděluje**, nikdy **nedominuje**

## 6. Reconstruction Blueprint

| Component | ↓ | Change | ↓ | Reason |
|-----------|---|--------|---|--------|
| `Hero` | ↓ | Obaluje celý Opening act jako jednu kompozici | ↓ | Odstranit pocit čtyř oddělených bloků |
| `HeroImage` | ↓ | Cream hmota nahoře actu, kompaktní výška | ↓ | Obraz uvádí, ne oddaluje informaci |
| `HeroContent` + `HeroCTA` | ↓ | Sdílené horizontální pásmo, bez vlastní „scény" | ↓ | CTA patří k titulku — grouping |
| `SocialProof` | ↓ | Závěrečný rytmus actu, ne samostatná kapitola | ↓ | Rhythm — epilog opening actu |
| `ClientStudioHeader` | ↓ | Zůstává mimo Opening envelope | ↓ | Hierarchy — rám, ne obsah |

## 7. Acceptance Test

1. Opening se přečte jako **jedna scéna**, ne čtyři bloky.
2. CTA vizuálně **patří k titulku** — jeden horizontální moment rozhodnutí.
3. Hero pásy **neoddělují vizuální řezy** — žádné „schody" bílého prostoru.
4. V prvním viewportu jsou viditelné: **dům, nabídka, akce, social proof**.
5. Obraz **uvádí**, ne **zdržuje** — title je dosažitelný bez hledání.

---

# Property Explorer Chapter

## 1. Composition Envelope

| | |
|---|---|
| **Začátek** | Section headings — *Procházka domem* / *Interaktivní půdorys* |
| **Konec** | Spodní hrana toggle řad ve všech třech sloupcích — společná baseline |
| **Definující hmota** | Triptych jako **jedna pracovní plocha** — tři cream hmoty stejné výšky |
| **Spodní rytmus** | Toggle páry (VIDEO/FOTKY · PŘÍZEMÍ/PATRO) zarovnané na společnou spodní linii |

Kapitola není bílá schránka s widgety. Je to **jeden nástroj** rozdělený do tří funkcí.

## 2. Primary Mass

**Levá galerie (video / foto + náhledy).**

Největší senzorická plocha — oko vstupuje sem jako do „dveří domu". Pravý půdorys je druhá silná hmota, ale galerie vede *Reading Flow*. Střed je spine, ne rival.

## 3. Supporting Masses

| Hmota | Vztah |
|-------|--------|
| Thumbnail rail | **Podřízený** galerii — pokračování levé Primary Mass |
| Room Index (Navigation Spine) | **Most** — spojuje galerii a půdorys, navigace místností |
| Floor Plan | **Rovnocenný** galerii jako druhá Primary Mass — prostorová pravda |
| Toggle řady | **Podřízený** rytmus — kontrola dole každého sloupce |

Galerie a půdorys jsou **dvě Primary Masses** jedné scény. Room Index je **Navigation Spine** — úzká svislá osa, ne třetí rival.

## 4. Reading Flow

```
Section Headings (left sweep → right)
        ↓
Main Gallery
        ↓
Thumbnail Rail
        ↓
Room Index (spine, parallel read with gallery)
        ↓
Floor Plan
        ↓
Toggle Row (shared bottom baseline)
```

Alternativní sweep: oko může přejít galerie → spine → půdorys horizontálně, ale všechny tři hmoty **sdílejí stejnou vertikální scénu**.

## 5. Spatial Rules

- Triptych **50 / 15 / 35** — proporce sloupců jsou dané
- **Společná výška** tří sloupců — cream hmoty sahají od heading linie po toggle baseline
- **Stejné spodní zarovnání** toggle řad ve všech sloupcích
- **Layout řídí proporce** obsahu — ne aspect-ratio jako architekt
- **Žádné plovoucí objekty** uvnitř bílé obálky — hmoty vyplňují sloupce
- Room Index je **Navigation Spine**, ne samostatný widget
- Galerie a půdorys **sdílejí jednu scénu** — jedna pracovní plocha, tři funkce
- Thumbnail rail **patří pod galerii** — součást levé Primary Mass
- Kruhový prvek patří k půdorysu (pokud wireframe ukazuje) — uvnitř floor plan hmoty

## 6. Reconstruction Blueprint

| Component | ↓ | Change | ↓ | Reason |
|-----------|---|--------|---|--------|
| `PropertyExplorer` | ↓ | Definuje společný Composition Envelope triptychu | ↓ | Grouping — jedna pracovní plocha |
| `MediaExplorer` | ↓ | Levý sloupec vyplní celou výšku envelope | ↓ | Primary Mass musí dominovat výšce |
| `MainMedia` | ↓ | Výšku určuje envelope, ne aspect-ratio | ↓ | Layout řídí proporce — wireframe princip |
| `ThumbnailRail` | ↓ | Přilepený pod galerii, součást levé hmoty | ↓ | Rhythm — pokračování Primary Mass |
| `RoomIndex` | ↓ | Navigation Spine — svislá hmota plné výšky | ↓ | Balance — most mezi dvěma Primary Masses |
| `RoomPanel` | ↓ | Vyplní spine od heading po toggle | ↓ | Žádné plovoucí objekty |
| `FloorPlanExplorer` | ↓ | Pravý sloupec = druhá Primary Mass, plná výška | ↓ | Symetrie dvou silných hmot |
| `FloorPlan` | ↓ | Proporce z envelope, ne fixní aspect-ratio | ↓ | Layout → proporce, ne naopak |
| `MediaModeToggle` + `FloorSelector` | ↓ | Společná spodní baseline | ↓ | Visual Rhythm — uzavření scény dole |

## 7. Acceptance Test

1. Triptych vypadá jako **jeden nástroj**, ne tři widgety v krabici.
2. Cream hmoty **vyplňují sloupce** od heading po toggle — žádné visící objekty nahoře.
3. Toggle řady sedí na **společné spodní linii**.
4. Galerie **nepřesahuje** do spine ani půdorysu — Reading Flow respektuje sloupce.
5. Room Index čte jako **Navigation Spine**, ne jako třetí konkurenční scéna.

---

# Priority Engine Chapter

## 1. Composition Envelope

| | |
|---|---|
| **Začátek** | Chapter headline — *Co je pro vás podstatné?* |
| **Konec** | Spodní hrana modrého recommendation banneru |
| **Definující hmota** | Grid 5×2 priority tiles — cream čtverce vlevo |
| **Spodní rytmus** | Modrý banner — autoritativní uzavření kapitoly |

Headline otevírá otázku. Grid + průvodce tvoří composition row. Banner **uzavírá** kapitolu — emoční přechod od *volby* k *doporučení*.

## 2. Primary Mass

**Grid 5×2 (10 priority tiles).**

Dominantní hmota — návštěvník zde **koná volbu**. Vše ostatní slouží gridu. Průvodce vysvětluje, kruh spojuje, banner shrnuje — ale grid vlastní scénu.

## 3. Supporting Masses

| Hmota | Vztah |
|-------|--------|
| Textové pole (průvodce) | **Podřízený** — Secondary Stage vpravo, reaguje na volbu |
| Kruh | **Most** — stojí na hraně gridu a textového pole, ne uvnitř pravé zóny |
| Recommendation banner | **Podřízený** — uzavírá kapitolu, ne konkuruje gridu |
| Chapter headline | **Podřízený** — otázka nad scénou |

Kruh je **boundary object** — vizuálně patří oběma světům. Textové pole je svislé, téměř výšky gridu — L-tvar, ne horizontální pruh.

## 4. Reading Flow

```
Chapter Headline
        ↓
Priority Grid (row by row, left → right)
        ↓
Circle (boundary — přechod mezi volbou a vysvětlením)
        ↓
Textové pole (Secondary Stage)
        ↓
Recommendation Banner (full width — uzavření)
```

Oko nečte grid a průvodce jako dva rovnocenné akty. Grid → most → vysvětlení → doporučení.

## 5. Spatial Rules

- Grid je **Dominant Mass** — zabírá většinu composition row
- Průvodce je **Secondary Stage** — podřízený, ne rival
- Kruh **překrývá hranici** mezi gridem a textovým polem — most, ne prvek uvnitř pravé zóny
- Textové pole je **svislé** — L-komposice, ne horizontální strip s kruhem vlevo
- **Asymetrie** — grid dominuje, průvodce doplňuje
- Banner **uzavírá kapitolu** — plná šířka, modrá hmota pod composition row
- Headline **nezačíná novou scénu** pod gridem — otázka je nad, ne mezi
- 10 tiles (5×2) — wireframe count, ne více

## 6. Reconstruction Blueprint

| Component | ↓ | Change | ↓ | Reason |
|-----------|---|--------|---|--------|
| `PriorityEngine` | ↓ | Definuje envelope: headline → composition row → banner | ↓ | Rhythm — tři fáze kapitoly |
| `SectionHeader` | ↓ | Otázka nad scénou, ne uprostřed | ↓ | Hierarchy — headline před akcí |
| `PriorityCards` | ↓ | 5×2 grid jako Dominant Mass | ↓ | Dominance — volba vlastní scénu |
| `IntroText` | ↓ | Svislé textové pole, Secondary Stage | ↓ | Balance — podřízená hmota, ne rival |
| Kruh (součást intro nebo samostatný prvek) | ↓ | Na hraně grid ↔ textové pole | ↓ | Most — boundary object |
| `RecommendationCard` | ↓ | Plná šířka pod composition row | ↓ | Rhythm — uzavření kapitoly |

## 7. Acceptance Test

1. Grid je **první hmota**, kterou oko počítá — dominantní.
2. Průvodce **doplňuje**, ne konkuruje — Secondary Stage.
3. Kruh stojí na **hraně dvou světů**, ne uvnitř pravé zóny.
4. Modrý banner **uzavírá** celou kapitolu — jasný finální beat.
5. Kapitola čte jako *„vyber → pochop → doporučení"* — jeden emoční oblouk.

---

# Reconstruction Order

| Order | Chapter | Principle |
|------:|---------|-----------|
| 1 | Opening | Obnoví emotional arc celé stránky |
| 2 | Property Explorer | Obnoví pocit nástroje |
| 3 | Priority Engine | Obnoví dramaturgii rozhodování |
