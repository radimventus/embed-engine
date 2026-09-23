import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('PriorityRelationships.tsx', import.meta.url), 'utf8');

test('Priority V2 popup projects canonical facts by exact answer evidence ids', () => {
  assert.match(source, /chatHouseKnowledge\?\.facts/);
  assert.match(source, /topic\?\.evidenceFactIds\.includes\(fact\.id\)/);
  assert.match(source, /fact\.safeInterpretation \?\? fact\.statement/);
  assert.match(source, /topicFacts=\{active\.outputId\.startsWith\('priority-v2:'\)/);
});

test('knowledge gap never borrows legacy narrative and asks the seller', () => {
  assert.match(source, /priority-topic-knowledge-gap/);
  assert.match(source, /OVĚŘIT S PRODEJCEM/);
  assert.match(source, /topicEntry\.missingEvidence/);
  assert.match(source, /if \(!topicEntry\).*outputCache/s);
});

test('all six baseline topics and replacements use the same exact topic projection', () => {
  for (const id of ['materials-technology', 'customization', 'smart-control', 'build-speed', 'fresh-air', 'access-parking']) {
    assert.match(source, new RegExp(`'${id}'`));
  }
  assert.match(source, /outputId: `priority-v2:\$\{entry\.answerId\}`/);
});

test('Ask CONIS transfers the Priority V2 label while chat remains canonical-wide', () => {
  assert.match(source, /topicTitle: topicEntry\?\.answer \?\? bundle\.title/);
  assert.match(source, /openDecisionTopicInChat/);
  assert.match(source, /navigateToJourneySection\(PILOT_SECTION_IDS\.aiAdvisor\)/);
});
