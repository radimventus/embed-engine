import { readFileSync } from 'node:fs';
import fontkit from '@pdf-lib/fontkit';
import sharp from 'sharp';
import { PDFDocument, rgb, type PDFImage, type PDFPage, type PDFFont } from 'pdf-lib';
import type { ClientOutputMedia, ClientOutputNarrative, ClientOutputSnapshot } from '../client-output/types';

const REGULAR = new URL('./assets/fonts/inter/Inter-Regular.ttf', import.meta.url);
const SEMIBOLD = new URL('./assets/fonts/inter/Inter-SemiBold.ttf', import.meta.url);
const NAVY = rgb(0, 0.098, 0.188);
const GOLD = rgb(0.79, 0.61, 0.22);
const MUTED = rgb(0.33, 0.39, 0.45);
const LINE = rgb(0.85, 0.85, 0.83);
const SOFT = rgb(0.95, 0.95, 0.94);
const WHITE = rgb(1, 1, 1);
const A4_LANDSCAPE: [number, number] = [841.89, 595.28];

export const CLIENT_OUTPUT_MEDIA_LAYOUT = {
  titleSafeBottom: 486,
  frameWidth: 390,
  firstFrameY: 255,
  secondFrameY: 24,
  ratio: 16 / 9,
} as const;

export type ClientOutputAssetLoader = (url: string) => Promise<Uint8Array>;

function wrap(font: PDFFont, text: string, size: number, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.replace(/\s+/g, ' ').trim().split(' ')) {
    const next = line.length === 0 ? word : `${line} ${word}`;
    if (font.widthOfTextAtSize(next, size) <= width) line = next;
    else { if (line) lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}

function textBlock(page: PDFPage, font: PDFFont, value: string, x: number, y: number, width: number, size = 12, color = NAVY): number {
  const leading = size * 1.42;
  const lines = wrap(font, value, size, width);
  lines.forEach((line, index) => page.drawText(line, { x, y: y - index * leading, size, font, color }));
  return y - lines.length * leading;
}

function pageNumber(page: PDFPage, regular: PDFFont, number: number): void {
  page.drawText(String(number).padStart(2, '0'), { x: 784, y: 23, size: 8, font: regular, color: MUTED });
}

function title(page: PDFPage, bold: PDFFont, eyebrow: string, heading: string): void {
  page.drawText(eyebrow.toUpperCase(), { x: 42, y: 548, size: 9, font: bold, color: GOLD });
  page.drawText(heading, { x: 42, y: 516, size: 25, font: bold, color: NAVY });
}

async function embedImage(pdf: PDFDocument, media: ClientOutputMedia, load: ClientOutputAssetLoader, ratio: number): Promise<PDFImage | null> {
  try {
    const bytes = await load(media.url);
    const width = 1600;
    const height = Math.round(width / ratio);
    const normalized = await sharp(bytes)
      .resize({ width, height, fit: ratio === 4 / 3 ? 'contain' : 'cover', background: '#ffffff' })
      .png()
      .toBuffer();
    return await pdf.embedPng(normalized);
  } catch { return null; }
}

async function drawImageFrame(
  pdf: PDFDocument,
  page: PDFPage,
  media: ClientOutputMedia,
  load: ClientOutputAssetLoader,
  ratio: number,
  x: number,
  y: number,
  width: number,
  height = width / ratio,
): Promise<boolean> {
  const image = await embedImage(pdf, media, load, ratio);
  if (image === null) return false;
  page.drawImage(image, { x, y, width, height });
  return true;
}

async function drawCover(
  pdf: PDFDocument,
  page: PDFPage,
  bold: PDFFont,
  regular: PDFFont,
  snapshot: ClientOutputSnapshot,
  load: ClientOutputAssetLoader,
): Promise<void> {
  const cover = snapshot.cover?.[0] ?? snapshot.exterior[0];
  if (cover !== undefined) {
    await drawImageFrame(pdf, page, cover, load, 16 / 9, 34, 145, 774, 435);
    page.drawRectangle({ x: 34, y: 145, width: 774, height: 84, color: WHITE, opacity: 0.92 });
  } else {
    page.drawRectangle({ x: 34, y: 145, width: 774, height: 435, color: NAVY });
  }
  page.drawText('CONIS', { x: 48, y: 552, size: 14, font: bold, color: WHITE });
  page.drawText('KLIENTSKÝ VÝSTUP', { x: 48, y: 112, size: 9, font: bold, color: GOLD });
  page.drawText(snapshot.house.name, { x: 48, y: 72, size: 30, font: bold, color: NAVY, maxWidth: 430 });
  page.drawText('Váš pohled na dům v souvislostech.', { x: 520, y: 87, size: 15, font: regular, color: NAVY });
  page.drawText(`${snapshot.project.name} · ${snapshot.capturedAt.slice(0, 10)}`, { x: 520, y: 62, size: 9, font: regular, color: MUTED });
}

async function mediaPage(
  pdf: PDFDocument,
  regular: PDFFont,
  bold: PDFFont,
  heading: string,
  media: readonly ClientOutputMedia[],
  ratio: number,
  load: ClientOutputAssetLoader,
  number: number,
): Promise<void> {
  const page = pdf.addPage(A4_LANDSCAPE);
  title(page, bold, media[0]?.role === 'interior' ? 'Interiér' : 'Váš dům', heading);
  const items = media.slice(0, 2);
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]!;
    // Keep the complete image spread below the title safe-zone (heading baseline 516).
    const frameW = CLIENT_OUTPUT_MEDIA_LAYOUT.frameWidth;
    const frameH = frameW / ratio;
    const x = 42;
    const y = index === 0
      ? CLIENT_OUTPUT_MEDIA_LAYOUT.firstFrameY
      : CLIENT_OUTPUT_MEDIA_LAYOUT.secondFrameY;
    page.drawRectangle({ x, y, width: frameW, height: frameH, color: SOFT });
    await drawImageFrame(pdf, page, item, load, ratio, x, y, frameW, frameH);
    page.drawText(item.label ?? (item.role === 'interior' ? 'Interiér' : 'Exteriér'), {
      x: 458, y: y + frameH - 18, size: 12, font: bold, color: NAVY, maxWidth: 337,
    });
    textBlock(page, regular, item.caption, 458, y + frameH - 44, 337, 10, MUTED);
  }
  pageNumber(page, regular, number);
}

async function floorPlanPage(
  pdf: PDFDocument,
  regular: PDFFont,
  bold: PDFFont,
  media: ClientOutputMedia,
  heading: string,
  load: ClientOutputAssetLoader,
  number: number,
): Promise<void> {
  const page = pdf.addPage(A4_LANDSCAPE);
  title(page, bold, 'Půdorys', heading);
  page.drawRectangle({ x: 42, y: 72, width: 540, height: 405, color: SOFT });
  await drawImageFrame(pdf, page, media, load, 4 / 3, 42, 72, 540, 405);
  page.drawText(media.label ?? 'Půdorys', { x: 615, y: 445, size: 12, font: bold, color: NAVY });
  textBlock(page, regular, media.caption, 615, 418, 180, 10, MUTED);
  pageNumber(page, regular, number);
}

function priorityPage(
  pdf: PDFDocument,
  regular: PDFFont,
  bold: PDFFont,
  personalized: boolean,
  priorities: readonly string[],
  items: readonly ClientOutputNarrative[],
  number: number,
): void {
  const page = pdf.addPage(A4_LANDSCAPE);
  title(page, bold, personalized ? 'Co je pro vás důležité' : 'Váš dům v souvislostech', personalized
    ? 'Dům posuzujeme přes vaše priority.'
    : 'Ověřené vlastnosti a jejich praktický význam.');
  priorities.slice(0, 3).forEach((priority, index) => {
    const x = 42 + index * 254;
    page.drawLine({ start: { x, y: 476 }, end: { x: x + 224, y: 476 }, thickness: 2, color: GOLD });
    page.drawText(String(index + 1).padStart(2, '0'), { x, y: 456, size: 8, font: bold, color: GOLD });
    page.drawText(priority, { x: x + 30, y: 451, size: 13, font: bold, color: NAVY });
  });
  const top = priorities.length > 0 ? 405 : 465;
  const columns = [42, 423];
  ['CO DOSTÁVÁTE', 'CO TO ZNAMENÁ V BĚŽNÉM ŽIVOTĚ'].forEach((label, index) => {
    page.drawRectangle({ x: columns[index]!, y: 63, width: 354, height: top - 40, color: SOFT });
    page.drawText(label, { x: columns[index]! + 18, y: top - 10, size: 9, font: bold, color: GOLD });
  });
  items.slice(0, 3).forEach((item, index) => {
    const y = top - 48 - index * 104;
    page.drawText(item.title, { x: 60, y, size: 11, font: bold, color: NAVY, maxWidth: 315 });
    textBlock(page, regular, item.fact, 60, y - 22, 315, 9.5, NAVY);
    if (item.userImpact !== undefined) {
      page.drawText(item.title, { x: 441, y, size: 11, font: bold, color: NAVY, maxWidth: 315 });
      textBlock(page, regular, item.userImpact, 441, y - 22, 315, 9.5, NAVY);
    }
    if (index < 2) {
      page.drawLine({ start: { x: 60, y: y - 78 }, end: { x: 378, y: y - 78 }, thickness: 0.7, color: LINE });
      page.drawLine({ start: { x: 441, y: y - 78 }, end: { x: 759, y: y - 78 }, thickness: 0.7, color: LINE });
    }
  });
  pageNumber(page, regular, number);
}

function relationshipPage(
  pdf: PDFDocument,
  regular: PDFFont,
  bold: PDFFont,
  eyebrow: string,
  heading: string,
  items: readonly ClientOutputNarrative[],
  number: number,
): void {
  const page = pdf.addPage(A4_LANDSCAPE);
  title(page, bold, eyebrow, heading);
  items.slice(0, 3).forEach((item, index) => {
    const x = 42 + index * 254;
    page.drawRectangle({ x, y: 100, width: 234, height: 370, color: WHITE, borderColor: LINE, borderWidth: 1 });
    page.drawRectangle({ x, y: 464, width: 234, height: 6, color: eyebrow.includes('uniknout') ? GOLD : NAVY });
    page.drawText(item.title, { x: x + 16, y: 430, size: 13, font: bold, color: NAVY, maxWidth: 202 });
    page.drawText('ŘEŠENÍ DOMU', { x: x + 16, y: 380, size: 8, font: bold, color: GOLD });
    const next = textBlock(page, regular, item.fact, x + 16, 360, 202, 9.5, NAVY);
    page.drawText('PROČ NA TOM ZÁLEŽÍ', { x: x + 16, y: next - 22, size: 8, font: bold, color: GOLD });
    if (item.userImpact !== undefined) {
      textBlock(page, regular, item.userImpact, x + 16, next - 42, 202, 9.5, NAVY);
    }
  });
  pageNumber(page, regular, number);
}

function blindspotsAndFaqPage(
  pdf: PDFDocument,
  regular: PDFFont,
  bold: PDFFont,
  blindspots: readonly ClientOutputNarrative[],
  faq: ClientOutputSnapshot['faq'],
  number: number,
): void {
  const page = pdf.addPage(A4_LANDSCAPE);
  title(page, bold, 'Co by vám nemělo uniknout', 'Souvislosti mimo hlavní fokus a vybrané otázky.');
  blindspots.slice(0, 3).forEach((item, index) => {
    const x = 42 + index * 254;
    page.drawLine({ start: { x, y: 470 }, end: { x: x + 230, y: 470 }, thickness: 3, color: GOLD });
    page.drawText(item.title, { x, y: 440, size: 11, font: bold, color: NAVY, maxWidth: 225 });
    if (item.userImpact !== undefined) {
      textBlock(page, regular, item.userImpact, x, 416, 225, 9, NAVY);
    }
  });
  page.drawText('RELEVANTNÍ OTÁZKY', { x: 42, y: 280, size: 9, font: bold, color: GOLD });
  let y = 250;
  faq.slice(0, 3).forEach((item) => {
    page.drawText(item.question, { x: 42, y, size: 10.5, font: bold, color: NAVY, maxWidth: 755 });
    y = textBlock(page, regular, item.answer, 42, y - 18, 755, 9, MUTED) - 14;
  });
  pageNumber(page, regular, number);
}

function processPage(pdf: PDFDocument, regular: PDFFont, bold: PDFFont, snapshot: ClientOutputSnapshot, number: number): void {
  const page = pdf.addPage(A4_LANDSCAPE);
  const headings = snapshot.variant === 'HAS_LAND'
    ? ['Váš pozemek', 'Ověřme, jak na něm bude tento dům fungovat.']
    : snapshot.variant === 'SEEKING_LAND'
      ? ['Hledání pozemku', 'Vybírejte místo už s ohledem na tento dům.']
      : ['Pozemek', 'Dům a pozemek patří k sobě.'];
  title(page, bold, headings[0]!, headings[1]!);
  if (snapshot.variant === 'UNIVERSAL' && snapshot.landPaths !== undefined) {
    const paths = [
      { title: 'MÁM POZEMEK', intro: 'Ověříme, jak dům funguje na konkrétním místě.', items: snapshot.landPaths.hasLand },
      { title: 'HLEDÁM POZEMEK', intro: 'Vlastnosti domu proměníme ve vodítka pro výběr parcely.', items: snapshot.landPaths.seekingLand },
    ] as const;
    paths.forEach((path, row) => {
      const y = row === 0 ? 320 : 105;
      page.drawText(path.title, { x: 42, y: y + 126, size: 12, font: bold, color: GOLD });
      page.drawText(path.intro, { x: 42, y: y + 102, size: 10, font: regular, color: NAVY });
      path.items.slice(0, 4).forEach((item, index) => {
        const x = 42 + index * 190;
        const separator = item.indexOf(':');
        const itemTitle = separator > 0 ? item.slice(0, separator) : item;
        const copy = separator > 0 ? item.slice(separator + 1).trim() : '';
        page.drawRectangle({ x, y, width: 172, height: 82, color: SOFT });
        page.drawText(String(index + 1).padStart(2, '0'), { x: x + 12, y: y + 61, size: 8, font: bold, color: GOLD });
        page.drawText(itemTitle, { x: x + 38, y: y + 59, size: 9.5, font: bold, color: NAVY, maxWidth: 120 });
        textBlock(page, regular, copy, x + 12, y + 38, 148, 7.5, NAVY);
      });
    });
    pageNumber(page, regular, number);
    return;
  }
  const items = snapshot.plotAndProcess.slice(0, 4);
  items.forEach((item, index) => {
    const x = 42 + index * (items.length === 4 ? 190 : 254);
    const width = items.length === 4 ? 172 : 230;
    page.drawRectangle({ x, y: 185, width, height: 260, color: SOFT });
    page.drawText(String(index + 1).padStart(2, '0'), { x: x + 15, y: 414, size: 12, font: bold, color: GOLD });
    const separator = item.indexOf(':');
    const itemTitle = separator > 0 ? item.slice(0, separator) : `Krok ${index + 1}`;
    const copy = separator > 0 ? item.slice(separator + 1).trim() : item;
    page.drawText(itemTitle, { x: x + 15, y: 378, size: 12, font: bold, color: NAVY, maxWidth: width - 30 });
    textBlock(page, regular, copy, x + 15, 344, width - 30, 9.5, NAVY);
  });
  pageNumber(page, regular, number);
}

async function conclusionPage(
  pdf: PDFDocument,
  regular: PDFFont,
  bold: PDFFont,
  snapshot: ClientOutputSnapshot,
  load: ClientOutputAssetLoader,
  number: number,
): Promise<void> {
  const page = pdf.addPage(A4_LANDSCAPE);
  title(page, bold, 'Váš osobní závěr', 'Máte podklady pro další krok.');
  page.drawRectangle({ x: 42, y: 286, width: 755, height: 174, color: SOFT });
  textBlock(page, regular, snapshot.auditConclusion, 70, 405, 700, 15, NAVY);
  page.drawLine({ start: { x: 42, y: 240 }, end: { x: 797, y: 240 }, thickness: 1, color: GOLD });
  page.drawText('VÁŠ DALŠÍ KROK', { x: 42, y: 205, size: 9, font: bold, color: GOLD });
  const nextStep = snapshot.variant === 'HAS_LAND'
    ? 'Navazující konzultace ověří vztah domu k vašemu pozemku.'
    : snapshot.variant === 'SEEKING_LAND'
      ? 'Navazující konzultace převede vlastnosti domu do kritérií pro hledaný pozemek.'
      : 'Navazující konzultace pomůže zvolit další cestu podle vaší situace s pozemkem.';
  textBlock(page, regular, nextStep, 42, 180, 500, 12, NAVY);
  const partner = snapshot.partner;
  if (partner?.logoUrl !== undefined) {
    const logo = await embedImage(pdf, {
      id: 'partner-logo', url: partner.logoUrl, caption: partner.companyName,
    }, load, 16 / 9);
    if (logo !== null) page.drawImage(logo, { x: 650, y: 158, width: 145, height: 70 });
  }
  page.drawText(partner?.companyName ?? snapshot.company.name, { x: 42, y: 117, size: 15, font: bold, color: NAVY });
  const contact = [partner?.email, partner?.phone, partner?.websiteUrl].filter(
    (value): value is string => Boolean(value?.trim()),
  );
  textBlock(page, regular, contact.length > 0 ? contact.join(' · ') : snapshot.cta, 42, 92, 755, 11, MUTED);
  pageNumber(page, regular, number);
}

export async function renderClientOutputPdf(snapshot: ClientOutputSnapshot, load: ClientOutputAssetLoader = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Asset ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const regular = await pdf.embedFont(readFileSync(REGULAR));
  const bold = await pdf.embedFont(readFileSync(SEMIBOLD));
  let number = 1;
  const coverPage = pdf.addPage(A4_LANDSCAPE);
  await drawCover(pdf, coverPage, bold, regular, snapshot, load);
  pageNumber(coverPage, regular, number++);
  const exterior = snapshot.exterior.slice(0, 2);
  if (exterior.length > 0) await mediaPage(pdf, regular, bold, 'Exteriér a první dojem', exterior, 16 / 9, load, number++);
  for (const floorPlan of snapshot.floorPlans) {
    await floorPlanPage(pdf, regular, bold, floorPlan, snapshot.house.storeys > 1 ? 'Půdorys podlaží' : 'Jak dům funguje jako celek.', load, number++);
  }
  const personalized = snapshot.priorities.length > 0;
  priorityPage(pdf, regular, bold, personalized, snapshot.priorities, snapshot.priorityNarratives, number++);
  relationshipPage(pdf, regular, bold, personalized ? 'Souvislosti podle vašich priorit' : 'Dům v souvislostech', personalized ? 'Tři pohledy, které propojují vaše priority.' : 'Tři důležité souvislosti domu.', snapshot.connectedTopics, number++);
  for (let index = 0; index < snapshot.interiors.length; index += 2) {
    await mediaPage(pdf, regular, bold, `Prostor v souvislostech · ${index + 1}–${Math.min(index + 2, snapshot.interiors.length)}`, snapshot.interiors.slice(index, index + 2), 16 / 9, load, number++);
  }
  blindspotsAndFaqPage(pdf, regular, bold, snapshot.blindspots, snapshot.faq, number++);
  processPage(pdf, regular, bold, snapshot, number++);
  await conclusionPage(pdf, regular, bold, snapshot, load, number++);
  pdf.setTitle(`${snapshot.house.name} – osobní výstup CONIS`);
  pdf.setCreationDate(new Date(snapshot.capturedAt));
  pdf.setModificationDate(new Date(snapshot.capturedAt));
  return pdf.save({ useObjectStreams: false });
}
