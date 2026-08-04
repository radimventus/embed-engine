/**
 * PT-15 — Embedded deal templates (mirror of docs/platform/office/deal).
 * Runtime must not depend on filesystem in the browser.
 */

import type { CommercialDocumentType } from './types';

export const DEAL_TEMPLATES: Readonly<Record<CommercialDocumentType, string>> =
  Object.freeze({
    electronic_order: `<!DOCTYPE html>
<html lang="cs"><head><meta charset="utf-8" /><title>Elektronická objednávka CONIS</title></head>
<body>
<p class="brand">CONIS</p>
<h1>Elektronická objednávka</h1>
<p>Individualizovaný obchodní dokument · SSOT</p>
<p>Číslo objednávky: {{orderId}}</p>
<p>Partner: {{partnerName}}</p>
<p>Společnost: {{companyName}}</p>
<p>Balíček: {{packageName}}</p>
<p>Částka: {{amountCzk}} CZK</p>
<p>Datum: {{issuedAt}}</p>
<p>Projekt: {{projectId}}</p>
<p>Navázáno na Rámcovou smlouvu, Implementační standard, DPA a VOP.</p>
</body></html>`,
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
    proforma: `<!DOCTYPE html>
<html lang="cs"><head><meta charset="utf-8" /><title>Proforma faktura CONIS</title></head>
<body class="invoice">
<p class="brand">CONIS</p>
<h1>Proforma faktura</h1>
<p>Číslo: {{proformaNumber}}</p>
<p>Objednávka: {{orderId}}</p>
<p>Odběratel: {{companyName}} ({{partnerName}})</p>
<p>Balíček: {{packageName}}</p>
<p>Částka k úhradě: {{amountCzk}} CZK</p>
<p>Vystaveno: {{issuedAt}}</p>
<p>Splatnost: {{dueDate}}</p>
<p>Projekt: {{projectId}}</p>
</body></html>`,
    pilot_offer: `<!DOCTYPE html>
<html lang="cs"><head><meta charset="utf-8" /><title>Nabídka pilotního programu CONIS</title></head>
<body>
<p class="brand">CONIS</p>
<h1>Nabídka pilotního programu</h1>
<p>Personalizovaná nabídka pro partnera {{partnerName}}.</p>
<p>Společnost: {{companyName}}</p>
<p>Hero: {{heroLabel}}</p>
<p>Web partnera: {{websiteUrl}}</p>
<p>Projekt: {{projectId}}</p>
<p>Balíček: {{packageName}}</p>
<p>Datum: {{issuedAt}}</p>
<p>Ostatní obsah nabídky zůstává společný pro všechny partnery.</p>
</body></html>`,
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
