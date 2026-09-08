import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const here = new URL('.', import.meta.url);
const service = readFileSync(new URL('./embedAIService.ts', here), 'utf8');
const advisor = readFileSync(new URL('./AIAdvisor.tsx', here), 'utf8');

test('AI service recreates its singleton when Company, Project or House scope changes', () => {
  assert.match(service, /let embedAIServiceScope: string \| null = null/);
  assert.match(service, /createEmbedAISessionScope/);
  assert.match(service, /input\.companyId \?\? 'unknown-company'/);
  assert.match(service, /input\.projectId \?\? 'unknown-project'/);
  assert.match(service, /input\.runtimeHouseId \?\? input\.canonicalHouseId/);
  assert.match(service, /embedAIServiceScope !== scope/);
  assert.match(service, /embedAIService = null/);
});

test('AI Advisor resets visible conversation and sends within runtime scope', () => {
  assert.match(advisor, /analyticsScope/);
  assert.match(advisor, /createEmbedAISessionScope/);
  assert.match(advisor, /getEmbedAIService\(aiSessionScope\)/);
  assert.match(advisor, /setMessages\(\[createAssistantSeed\(openingText\)\]\)/);
  assert.match(advisor, /\}, \[aiSessionScope\]\);/);
});
