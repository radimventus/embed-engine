import { readFileSync } from 'node:fs';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb, type PDFImage, type PDFPage, type PDFFont } from 'pdf-lib';
import type { ClientOutputMedia, ClientOutputNarrative, ClientOutputSnapshot } from '../client-output/types';

const REGULAR = new URL('./assets/fonts/inter/Inter-Regular.ttf', import.meta.url);
const SEMIBOLD = new URL('./assets/fonts/inter/Inter-SemiBold.ttf', import.meta.url);
const NAVY = rgb(0, 0.098, 0.188);
const GOLD = rgb(0.79, 0.61, 0.22);
const MUTED = rgb(0.33, 0.39, 0.45);
const A4_LANDSCAPE: [number, number] = [841.89, 595.28];

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
  const leading = size * 1.45;
  const lines = wrap(font, value, size, width);
  lines.forEach((line, index) => page.drawText(line, { x, y: y - index * leading, size, font, color }));
  return y - lines.length * leading;
}

function title(page: PDFPage, bold: PDFFont, eyebrow: string, heading: string): void {
  page.drawText(eyebrow.toUpperCase(), { x: 42, y: 548, size: 9, font: bold, color: GOLD });
  page.drawText(heading, { x: 42, y: 516, size: 25, font: bold, color: NAVY });
}

async function embedImage(pdf: PDFDocument, media: ClientOutputMedia, load: ClientOutputAssetLoader): Promise<PDFImage | null> {
  try {
    const bytes = await load(media.url);
    return /\.png(?:\?|$)/i.test(media.url) ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
  } catch { return null; }
}

function drawCover(page: PDFPage, bold: PDFFont, regular: PDFFont, snapshot: ClientOutputSnapshot): void {
  page.drawRectangle({ x: 0, y: 0, width: 842, height: 595, color: NAVY });
  page.drawText('CONIS', { x: 48, y: 532, size: 15, font: bold, color: rgb(1,1,1) });
  page.drawText(snapshot.house.name, { x: 48, y: 310, size: 38, font: bold, color: rgb(1,1,1) });
  page.drawText(`Osobní výstup pro ${snapshot.project.name}`, { x: 48, y: 276, size: 17, font: regular, color: rgb(.86,.88,.9) });
  page.drawText(snapshot.priorities.join(' · '), { x: 48, y: 92, size: 12, font: regular, color: GOLD });
}

async function mediaPage(pdf: PDFDocument, regular: PDFFont, bold: PDFFont, heading: string, media: readonly ClientOutputMedia[], ratio: number, load: ClientOutputAssetLoader): Promise<void> {
  const page = pdf.addPage(A4_LANDSCAPE); title(page, bold, 'Váš dům', heading);
  const items = media.slice(0, 2);
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]!; const frameW = 350; const frameH = frameW / ratio;
    const x = index === 0 ? 42 : 449; const y = 276;
    page.drawRectangle({ x, y, width: frameW, height: frameH, color: rgb(.94,.94,.93) });
    const image = await embedImage(pdf, item, load);
    if (image) {
      const scale = Math.max(frameW / image.width, frameH / image.height);
      const width = image.width * scale; const height = image.height * scale;
      page.drawImage(image, { x: x + (frameW-width)/2, y: y+(frameH-height)/2, width, height });
    }
    textBlock(page, regular, item.caption, x, 250, frameW, 10, MUTED);
  }
}

function narrativePage(pdf: PDFDocument, regular: PDFFont, bold: PDFFont, heading: string, items: readonly ClientOutputNarrative[]): void {
  const page = pdf.addPage(A4_LANDSCAPE); title(page, bold, 'Podle vašich priorit', heading);
  items.slice(0,3).forEach((item, index) => {
    const x = 42 + index * 263;
    page.drawText(item.title, { x, y: 460, size: 13, font: bold, color: NAVY, maxWidth: 230 });
    page.drawText('FAKT', { x, y: 418, size: 8, font: bold, color: GOLD });
    let y = textBlock(page, regular, item.fact, x, 398, 230, 10);
    page.drawText('CO TO PRO VÁS ZNAMENÁ', { x, y: y - 17, size: 8, font: bold, color: GOLD });
    textBlock(page, regular, item.userImpact, x, y - 38, 230, 10);
  });
}

export async function renderClientOutputPdf(snapshot: ClientOutputSnapshot, load: ClientOutputAssetLoader = async (url) => {
  const response = await fetch(url); if (!response.ok) throw new Error(`Asset ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create(); pdf.registerFontkit(fontkit);
  const regular = await pdf.embedFont(readFileSync(REGULAR)); const bold = await pdf.embedFont(readFileSync(SEMIBOLD));
  drawCover(pdf.addPage(A4_LANDSCAPE), bold, regular, snapshot);
  await mediaPage(pdf, regular, bold, 'Exteriér a první dojem', snapshot.exterior, 16/9, load);
  await mediaPage(pdf, regular, bold, snapshot.house.storeys > 1 ? 'Půdorysy jednotlivých podlaží' : 'Půdorys domu', snapshot.floorPlans, 4/3, load);
  narrativePage(pdf, regular, bold, 'Co je pro vás důležité', snapshot.priorityNarratives);
  narrativePage(pdf, regular, bold, 'Tři souvislosti, které podporují vaše priority', snapshot.connectedTopics);
  for (let index=0; index<snapshot.interiors.length; index+=2) await mediaPage(pdf, regular, bold, 'Interiéry v souvislostech', snapshot.interiors.slice(index,index+2), 16/9, load);
  narrativePage(pdf, regular, bold, 'Souvislosti, které stojí za pozornost', snapshot.blindspots);
  const faq = pdf.addPage(A4_LANDSCAPE); title(faq,bold,'Otázky a odpovědi','Co pomůže před dalším krokem');
  let fy=465; snapshot.faq.slice(0,4).forEach(item=>{ faq.drawText(item.question,{x:42,y:fy,size:11,font:bold,color:NAVY,maxWidth:750}); fy=textBlock(faq,regular,item.answer,42,fy-20,750,10)-16; });
  const process=pdf.addPage(A4_LANDSCAPE); title(process,bold,'Pozemek a proces','Od domu k vašemu rozhodnutí');
  let py=460; snapshot.plotAndProcess.forEach((item,index)=>{ process.drawText(`${index+1}`,{x:45,y:py,size:16,font:bold,color:GOLD}); py=textBlock(process,regular,item,75,py,700,12)-22; });
  const conclusion=pdf.addPage(A4_LANDSCAPE); title(conclusion,bold,'Váš osobní závěr','Máte podklady pro další krok');
  textBlock(conclusion,regular,snapshot.auditConclusion,42,450,755,16); textBlock(conclusion,bold,snapshot.cta,42,155,755,17,GOLD);
  pdf.setTitle(`${snapshot.house.name} – osobní výstup CONIS`); pdf.setCreationDate(new Date(snapshot.capturedAt)); pdf.setModificationDate(new Date(snapshot.capturedAt));
  return pdf.save({ useObjectStreams: false });
}
