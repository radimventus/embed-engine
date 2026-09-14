import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { renderClientOutputPdf } from './generator/clientOutputPdf';
import type { ClientOutputSnapshot } from './client-output/types';

const snapshot: ClientOutputSnapshot = { schemaVersion:1,capturedAt:'2026-09-14T08:00:00.000Z',company:{id:'c',name:'Partner'},project:{id:'p',name:'Projekt'},house:{id:'h',name:'Bungalov 4KK',storeys:1},knowledgeVersion:'v04',variant:'UNIVERSAL',priorities:['Energie'],cover:[{id:'cover',url:'/house/cover.webp',role:'cover',label:'Exteriér',caption:'Úvodní pohled.'}],exterior:[{id:'e',url:'/house/exterior.webp',role:'exterior',label:'Exteriér',caption:'Exteriér ve vztahu k zahradě.'}],floorPlans:[{id:'f',url:'/house/floorplan.png',role:'floorplan',label:'1. NP',caption:'Jednopodlažní dispozice.'}],interiors:[{id:'i1',url:'/house/interior-1.jpg',role:'interior',label:'Kuchyně',caption:'Kuchyň a její každodenní využití.'},{id:'i2',url:'/house/interior-2.jpg',role:'interior',label:'Obývací pokoj',caption:'Společný obytný prostor.'},{id:'i3',url:'/house/interior-3.jpg',role:'interior',label:'Ložnice',caption:'Soukromá část domu.'}],priorityNarratives:[{title:'Energie',fact:'Doložený fakt.',userImpact:'Praktický dopad.'}],connectedTopics:[],blindspots:[],faq:[],plotAndProcess:['Pozemek: Ověřte orientaci na pozemku.'],auditConclusion:'Dům odpovídá vybraným prioritám.',cta:'Domluvte si další krok.'};

test('client output is a deterministic landscape PDF with the complete dramaturgy', async () => {
  const first=await renderClientOutputPdf(snapshot,async()=>{throw new Error('offline');});
  const second=await renderClientOutputPdf(snapshot,async()=>{throw new Error('offline');});
  assert.deepEqual(first,second);
  const pdf=await PDFDocument.load(first);
  assert.equal(pdf.getPageCount(),10);
  const {width,height}=pdf.getPage(0).getSize(); assert.ok(width>height);
});

test('loads and embeds WebP/JPEG/PNG House media, including the 4:3 floorplan', async () => {
  const source = sharp({ create: { width: 320, height: 240, channels: 3, background: '#b8922d' } });
  const assets = new Map<string, Uint8Array>([
    ['/house/cover.webp', new Uint8Array(await source.clone().webp().toBuffer())],
    ['/house/exterior.webp', new Uint8Array(await source.clone().webp().toBuffer())],
    ['/house/floorplan.png', new Uint8Array(await source.clone().png().toBuffer())],
    ['/house/interior-1.jpg', new Uint8Array(await source.clone().jpeg().toBuffer())],
    ['/house/interior-2.jpg', new Uint8Array(await source.clone().jpeg().toBuffer())],
    ['/house/interior-3.jpg', new Uint8Array(await source.clone().jpeg().toBuffer())],
  ]);
  const requested: string[] = [];
  const offline = await renderClientOutputPdf(snapshot, async () => { throw new Error('offline'); });
  const bytes = await renderClientOutputPdf(snapshot, async (url) => {
    requested.push(url);
    const asset = assets.get(url);
    if (asset === undefined) throw new Error(`Missing ${url}`);
    return asset;
  });
  const pdf = await PDFDocument.load(bytes);
  assert.equal(pdf.getPageCount(), 10);
  assert.deepEqual(requested, ['/house/cover.webp', '/house/exterior.webp', '/house/floorplan.png', '/house/interior-1.jpg', '/house/interior-2.jpg', '/house/interior-3.jpg']);
  assert.ok(bytes.length > offline.length + 5_000);
});

test('cover consumes its own canonical hero without duplicating it on the exterior page', async () => {
  const requested: string[] = [];
  await renderClientOutputPdf(snapshot, async (url) => {
    requested.push(url);
    return new Uint8Array(await sharp({ create: { width: 320, height: 180, channels: 3, background: '#001930' } }).png().toBuffer());
  });
  assert.equal(requested.filter((url) => url === '/house/cover.webp').length, 1);
  assert.equal(new Set(snapshot.exterior.map((item) => item.url)).size, snapshot.exterior.length);
  assert.ok(snapshot.interiors.every((item) => item.role === 'interior'));
  assert.ok(snapshot.floorPlans.every((item) => item.role === 'floorplan'));
});
