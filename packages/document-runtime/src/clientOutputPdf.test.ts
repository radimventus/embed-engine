import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument } from 'pdf-lib';
import { renderClientOutputPdf } from './generator/clientOutputPdf';
import type { ClientOutputSnapshot } from './client-output/types';

const snapshot: ClientOutputSnapshot = { schemaVersion:1,capturedAt:'2026-09-14T08:00:00.000Z',company:{id:'c',name:'Partner'},project:{id:'p',name:'Projekt'},house:{id:'h',name:'Bungalov 4KK',storeys:1},knowledgeVersion:'v04',priorities:['Energie'],exterior:[{id:'e',url:'bad.jpg',caption:'Exteriér ve vztahu k zahradě.'}],floorPlans:[{id:'f',url:'bad.jpg',caption:'Jednopodlažní dispozice.'}],interiors:[],priorityNarratives:[{title:'Energie',fact:'Doložený fakt.',userImpact:'Praktický dopad.'}],connectedTopics:[],blindspots:[],faq:[],plotAndProcess:['Ověřte orientaci na pozemku.'],auditConclusion:'Dům odpovídá vybraným prioritám.',cta:'Domluvte si další krok.'};

test('client output is a deterministic landscape PDF with the complete dramaturgy', async () => {
  const first=await renderClientOutputPdf(snapshot,async()=>{throw new Error('offline');});
  const second=await renderClientOutputPdf(snapshot,async()=>{throw new Error('offline');});
  assert.deepEqual(first,second);
  const pdf=await PDFDocument.load(first);
  assert.equal(pdf.getPageCount(),9);
  const {width,height}=pdf.getPage(0).getSize(); assert.ok(width>height);
});
