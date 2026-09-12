"""Deterministic XLSX 04 -> House knowledge. No Excel runtime dependency.

Only approved, nonempty answers are imported. Alternatives are never facts.
Run from any directory with Python 3; --check verifies generated content.
"""
from pathlib import Path
import hashlib, json, sys, zipfile, xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/knowledge/bungalov-4kk-v04.xlsx'
TARGET = ROOT / 'packages/object-house/src/reference/modern4kkKnowledgeV04.ts'
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
TOPICS = [
 ['dispozice','design'], ['pozemek'], ['dispozice'], ['dispozice','soukromí'],
 ['design','flexibilita'], ['flexibilita','dispozice'], ['kvalita','investice'],
 ['investice'], ['pozemek','kvalita'], ['kvalita','investice'], ['kvalita'],
 ['kvalita','dispozice'], ['design','kvalita','údržba'], ['design','energie'],
 ['energie','provozní-náklady'], ['kvalita'], ['kvalita','údržba'],
 ['energie','provozní-náklady','údržba'], ['design','údržba'], ['dispozice','design'],
 ['dispozice'], ['dispozice','soukromí'], ['dispozice','soukromí'],
 ['dispozice','údržba'], ['dispozice'], ['soukromí'], ['design','pozemek'],
 ['pozemek','design'], ['soukromí','kvalita'], ['energie','provozní-náklady'],
 ['údržba','kvalita'], ['flexibilita','investice','dispozice'],
]

with zipfile.ZipFile(SOURCE) as z:
    strings = []
    if 'xl/sharedStrings.xml' in z.namelist():
        strings = [''.join(e.itertext()) for e in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si', NS)]
    xml = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
    rows = []
    chapter = ''; chapter_index = -1; questions = 0; skipped = 0
    for row in xml.findall('s:sheetData/s:row', NS):
        cells = {}
        for c in row.findall('s:c', NS):
            col = ''.join(x for x in c.attrib['r'] if x.isalpha())
            value = c.find('s:v', NS)
            if c.attrib.get('t') == 'inlineStr':
                value = ''.join(c.find('s:is', NS).itertext())
            else:
                value = '' if value is None else value.text or ''
                if c.attrib.get('t') == 's': value = strings[int(value)]
            cells[col] = value
        n = int(row.attrib['r'])
        if n == 1: continue
        if cells.get('B'): chapter = cells['B']; chapter_index += 1
        if not cells.get('D'): continue
        questions += 1
        if cells.get('F','').strip() != 'OK' or not cells.get('E','').strip():
            skipped += 1; continue
        question, answer = cells['D'].strip(), cells['E'].strip()
        provenance = cells.get('H','').strip()
        confirmed = 'CURRENT' in provenance
        reference = not confirmed and any(x in provenance for x in ['Krásné Pole','PBŘ','Souhrnná technická','D.2.1','Klientské změny'])
        constraints = []
        if chapter_index in [3,4,5]:
            constraints.append('Výběr priority není konfigurátor a neurčuje estetický vkus návštěvníka ani požadavek na změnu domu.')
        if n == 643:
            constraints.append('Údaj 50 % nemá uvedený základ ani jednotku nákladů; nelze z něj určit cenu ohřevu ani podíl úspory.')
        if n in [652,656,657,658]:
            constraints.append('Jde o orientační vyjádření autora, nikoli úplný servisní plán, rozpočet domácnosti nebo neomezenou životnost. Neprezentovat jako garanci.')
        if reference:
            constraints.append('Údaj dokumentované referenční realizace; nevydávat za záruku jiné varianty, parcely nebo budoucí dodávky.')
        if 'vizuální' in provenance.lower():
            constraints.append('Vizuálně doložený popis; nepřidávat neověřené rozměry, technické parametry ani rozsah ceny.')
        if not provenance:
            constraints.append('Odpověď schválená v XLSX 04; původní zdroj není v tabulce vyplněn. Nevymýšlet citaci.')
        if chapter_index in [7,29,30]:
            constraints.append('Popis referenčního domu není cenová nabídka ani garance budoucích nákladů, výnosů či bezúdržbovosti.')
        rows.append(dict(id=f'kb04-row-{n}',houseId='modern-4kk',subject=question,category=chapter,
            statement=answer,scope='REFERENCE_PROJECT' if reference else 'PRODUCT',
            confidence='CONFIRMED' if confirmed else 'DOCUMENTED',
            source=dict(sourceId=f'bungalov-4kk-xlsx04-r{n}',kind='CURRENT_CONFIRMED' if confirmed else 'PRODUCT_DOCUMENTATION',
                label=f'XLSX 04, List 1, D{n}:H{n}' + (f' — {provenance}' if provenance else '')),
            temporalStatus='CURRENT',constraints=constraints,relatedTopics=TOPICS[chapter_index]))

assert questions == 662 and len(rows) == 540 and skipped == 122, 'Review changed workbook scope before importing'
by_id = {x['id']:x for x in rows}
assert '112,9' in by_id['kb04-row-65']['statement']
assert '129' in by_id['kb04-row-66']['statement']
faq_rows = {
 'LAND':[34,35,40,41,43,46,47,48,50,55],
 'LAYOUT':[3,5,11,18,20,65,66,68,95,101],
 'PRIVACY':[12,21,27,90,91,93,94,96,482,620],
 'ENERGY':[382,383,387,388,389,637,644,646,647,650],
 'OPERATING_COSTS':[638,639,640,641,644,645,648,649,650,651],
 'DESIGN':[8,14,16,28,84,86,97,110,120,125],
 'QUALITY':[22,23,249,264,269,321,333,334,341,655],
 'INVESTMENT':[9,10,18,35,40,80,648,655,684,687],
 'MAINTENANCE':[83,96,264,395,620,621,655,656,657,658],
 'FLEXIBILITY':[12,18,19,20,21,22,80,81,98,102],
}
faqs=[]
for priority, numbers in faq_rows.items():
    assert len(numbers)==10
    for i,n in enumerate(numbers,1):
        atom=by_id[f'kb04-row-{n}']
        faqs.append(dict(id=f'{priority.lower()}-{i:02}',houseId='modern-4kk',priority=priority,
            question=atom['subject'],answer=atom['statement'],knowledgeAtomIds=[atom['id']],constraints=atom['constraints']))
header = '// Generated by scripts/import-bungalov-knowledge.py. Edit the XLSX source, then regenerate.\n'
header += "import type { HouseKnowledgeAtom } from '../knowledge/houseKnowledgeTypes';\n"
header += "import type { HousePriorityFaqItem } from '../priority-faq/housePriorityFaqTypes';\n"
header += f"export const KNOWLEDGE_V04_SOURCE_SHA256 = '{hashlib.sha256(SOURCE.read_bytes()).hexdigest()}';\n"
text=header+'export const KNOWLEDGE_V04: readonly HouseKnowledgeAtom[] = '+json.dumps(rows,ensure_ascii=False,indent=2)+';\n'
text+='export const FAQ_V04: readonly HousePriorityFaqItem[] = '+json.dumps(faqs,ensure_ascii=False,indent=2)+';\n'
if '--check' in sys.argv:
    assert TARGET.read_text()==text, 'Generated knowledge differs from XLSX; rerun importer'
else: TARGET.write_text(text)
print(f'KB04: {len(rows)} approved answers, {skipped} blanks excluded, {len(faqs)} curated FAQ; source hash verified')
