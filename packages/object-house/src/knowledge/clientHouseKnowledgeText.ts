import type { HouseKnowledgeAtom } from './houseKnowledgeTypes';

/** Presentation only: keep the approved source statement unchanged and auditable. */
export function clientHouseKnowledgeText(text: string): string {
  return text.replace(/\bCURRENT\s+/g, '')
    .replace(/Referenční validace potvrzuje, že/g, 'U referenčního domu je potvrzeno, že')
    .replace(/v této validaci/g, 'v dostupných údajích');
}

export function clientHouseFactText(fact: HouseKnowledgeAtom): string {
  const scope = fact.scope === 'REFERENCE_PROJECT'
    ? 'Údaj pro dokumentovanou referenční realizaci: ' : '';
  return scope + [clientHouseKnowledgeText(fact.statement), ...(fact.clientQualifications ?? [])].join(' ');
}
