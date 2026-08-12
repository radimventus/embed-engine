/**
 * PT-15 — Deal templates embedded at build time from the canonical deal package.
 */

import { GENERATED_DEAL_TEMPLATES } from './generatedDealTemplates';
import type { CommercialDocumentType } from './types';

export const DEAL_TEMPLATES: Readonly<Record<CommercialDocumentType, string>> =
  Object.freeze({
    electronic_order: GENERATED_DEAL_TEMPLATES.electronic_order,
    framework: `<!DOCTYPE html>
<html lang="cs"><head><meta charset="utf-8" /><title>Rámcová smlouva CONIS</title></head>
<body>
<p class="brand">CONIS</p>
<h1>Rámcová smlouva</h1>
<p>Smluvní rámec spolupráce mezi CONIS a partnerem {{partnerName}}.</p>
<p>Projekt: {{projectId}} · Společnost: {{companyName}}</p>
</body></html>`,
    implementation_standard: `<!DOCTYPE html>
<html lang="cs"><head><meta charset="utf-8" /><title>Implementační standard CONIS</title></head>
<body>
<p class="brand">CONIS</p>
<h1>Implementační standard</h1>
<p>Technický a provozní standard dodání CONIS pro partnera {{partnerName}}.</p>
<p>Balíček: {{packageName}} · Projekt: {{projectId}}</p>
</body></html>`,
    dpa: `<!DOCTYPE html>
<html lang="cs"><head><meta charset="utf-8" /><title>DPA CONIS</title></head>
<body>
<p class="brand">CONIS</p>
<h1>Data Processing Agreement</h1>
<p>Smlouva o zpracování osobních údajů pro partnera {{partnerName}}.</p>
<p>Společnost: {{companyName}} · Projekt: {{projectId}}</p>
</body></html>`,
    vop: `<!DOCTYPE html>
<html lang="cs"><head><meta charset="utf-8" /><title>VOP CONIS</title></head>
<body>
<p class="brand">CONIS</p>
<h1>Všeobecné obchodní podmínky</h1>
<p>VOP CONIS platné pro obchodní případ partnera {{partnerName}}.</p>
<p>Projekt: {{projectId}}</p>
</body></html>`,
    proforma: GENERATED_DEAL_TEMPLATES.proforma,
    pilot_offer: GENERATED_DEAL_TEMPLATES.pilot_offer,
  });

export function fillTemplate(
  template: string,
  values: Readonly<Record<string, string>>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? '');
}

export function htmlToPlainLines(html: string): readonly string[] {
  return html
    .replace(/<\/(p|h1|h2|div|section|header|li)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 0);
}
