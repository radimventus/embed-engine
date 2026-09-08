import assert from 'node:assert/strict';
import test from 'node:test';

import { bootstrapModern4kkReferenceContent } from '../reference/modern4kkContentBootstrap';
import { getCanonicalHouseRuntimeContext } from './canonicalHouseRuntimeContext';
import {
  canonicalHouseKnowledgeEntries,
  selectCanonicalChatHouseKnowledge,
  selectCanonicalHouseKnowledge,
} from './selectCanonicalHouseKnowledge';

test('Chat receives safe CURRENT House facts independently of Priority selection', () => {
  bootstrapModern4kkReferenceContent();
  const context = getCanonicalHouseRuntimeContext('modern-4kk');
  assert.ok(context);

  const priorityKnowledge = selectCanonicalHouseKnowledge(context, ['energy']);
  const chatKnowledge = selectCanonicalChatHouseKnowledge(context);
  const chatEntries = canonicalHouseKnowledgeEntries(chatKnowledge);

  assert.equal(chatKnowledge.canonicalHouseId, 'modern-4kk');
  assert.ok(chatKnowledge.facts.length >= priorityKnowledge.facts.length);
  assert.ok(
    chatEntries.some(
      (entry) =>
        entry.id === 'modern-4kk-roof-bratex-click' &&
        entry.text.includes('BRATEX CLICK'),
    ),
  );
  assert.ok(
    chatEntries.some(
      (entry) =>
        entry.id === 'modern-4kk-anthracite-shading' &&
        entry.text.includes('antracitovými roletovými žaluziemi'),
    ),
  );
});
