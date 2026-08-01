import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildDecisionPath } from './decisionPath';
import { buildDecisionQaReport } from './decisionQa';
import { buildPreviewCenterModel } from './previewCenterModel';
import { getPreviewPersona } from './previewPersonas';
import {
  BUILDER_PREVIEW_PERSONA_STORAGE_KEY,
  writePreviewPersonaScenario,
} from './previewScenario';

describe('previewCenter (EPIC-BX-06)', () => {
  it('maps personas to Runtime priority profiles (not mocks)', () => {
    const family = getPreviewPersona('family');
    const investor = getPreviewPersona('investor');
    assert.ok(family.priorityIds.includes('layout'));
    assert.ok(investor.priorityIds.includes('investment'));
    assert.notDeepEqual(family.priorityIds, investor.priorityIds);
  });

  it('writes preview persona scenario for Shared Runtime bridge', () => {
    const payload = writePreviewPersonaScenario('investor');
    assert.equal(payload.personaId, 'investor');
    assert.ok(payload.priorityIds.length > 0);
    const raw = sessionStorage.getItem(BUILDER_PREVIEW_PERSONA_STORAGE_KEY);
    assert.ok(raw !== null);
    const parsed = JSON.parse(raw!) as { personaId: string };
    assert.equal(parsed.personaId, 'investor');
  });

  it('builds Decision Path from Experience module order', () => {
    const path = buildDecisionPath({ projectId: 'test-preview-path' });
    assert.ok(path.length >= 4);
    assert.equal(path[0]?.id, 'hero');
    assert.ok(path.some((step) => step.id === 'lead-capture'));
  });

  it('builds Decision QA without a parallel preview model', () => {
    const qa = buildDecisionQaReport({
      projectId: 'test-preview-qa',
      snapshot: null,
      validationReport: null,
    });
    assert.ok(qa.items.some((item) => item.id === 'hero'));
    assert.ok(qa.items.some((item) => item.id === 'runtime'));
    assert.ok(qa.items.some((item) => item.id === 'faq'));
    assert.ok(qa.items.some((item) => item.id === 'lead'));
  });

  it('remount key changes when persona or device changes', () => {
    const a = buildPreviewCenterModel({
      projectId: 'p1',
      snapshot: null,
      validationReport: null,
      personaId: 'family',
      deviceId: 'desktop',
      comparePersonaId: 'investor',
      compareDeviceId: 'mobile',
      compareActive: false,
      activeCompareSide: 'primary',
    });
    const b = buildPreviewCenterModel({
      projectId: 'p1',
      snapshot: null,
      validationReport: null,
      personaId: 'investor',
      deviceId: 'desktop',
      comparePersonaId: 'investor',
      compareDeviceId: 'mobile',
      compareActive: false,
      activeCompareSide: 'primary',
    });
    assert.notEqual(a.remountKey, b.remountKey);
    assert.match(a.remountKey, /family/);
    assert.match(b.remountKey, /investor/);
  });

  it('compare mode keeps a single active Runtime remount key side', () => {
    const model = buildPreviewCenterModel({
      projectId: 'p1',
      snapshot: null,
      validationReport: null,
      personaId: 'family',
      deviceId: 'desktop',
      comparePersonaId: 'investor',
      compareDeviceId: 'mobile',
      compareActive: true,
      activeCompareSide: 'compare',
    });
    assert.match(model.remountKey, /investor/);
    assert.match(model.remountKey, /mobile/);
    assert.match(model.remountKey, /compare/);
  });
});
