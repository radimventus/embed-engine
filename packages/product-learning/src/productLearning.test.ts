import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildProductLearningReport,
  classifyLearningCategory,
  registerLearningFeedback,
  resetLearningFeedbackRegistry,
} from './index';
import {
  clearPlatformSession,
  submitPlatformFeedback,
} from '@embed-engine/platform-access';

describe('productLearning (EPIC-BX-20)', () => {
  it('classifies feedback deterministically', () => {
    assert.equal(classifyLearningCategory('App crash bug on publish'), 'Bug');
    assert.equal(classifyLearningCategory('UI layout is confusing'), 'UX');
    assert.equal(
      classifyLearningCategory('Please add feature for export'),
      'Feature Request',
    );
    assert.equal(classifyLearningCategory('Session login on platform'), 'Platform');
  });

  it('registers feedback against existing company/workspace/project entities', () => {
    resetLearningFeedbackRegistry();
    const entry = registerLearningFeedback({
      message: 'Publish pipeline is slow',
      companyId: 'ac-modular',
      workspaceId: 'ac-modular-main',
      projectId: 'villa-168',
      studioId: 'builder',
      releaseLabel: 'v1.0.0',
    });
    assert.equal(entry.companyId, 'ac-modular');
    assert.equal(entry.workspaceId, 'ac-modular-main');
    assert.equal(entry.projectId, 'villa-168');
    assert.equal(entry.category, 'Performance');
    assert.ok(entry.capabilityId === 'release' || entry.capabilityId !== null);
  });

  it('builds insights, roadmap suggestions and executive summary', () => {
    resetLearningFeedbackRegistry();
    clearPlatformSession();
    submitPlatformFeedback({
      message: 'Bug: preview crash',
      email: 'radim@conis.local',
      studioId: 'builder',
      companyId: 'ac-modular',
    });
    registerLearningFeedback({
      message: 'Feature request: add second project template',
      companyId: 'ac-modular',
      workspaceId: 'ac-modular-main',
      projectId: 'villa-168',
      studioId: 'builder',
    });
    registerLearningFeedback({
      message: 'Feature request: add second project template again',
      companyId: 'ac-modular',
      workspaceId: 'ac-modular-main',
      projectId: 'villa-168',
      studioId: 'builder',
    });
    registerLearningFeedback({
      message: 'UX navigation is confusing in Manager',
      companyId: 'ac-modular',
      workspaceId: 'ac-modular-main',
      studioId: 'manager',
    });

    const report = buildProductLearningReport();
    assert.ok(report.entries.length >= 3);
    assert.ok(report.recommendations.length >= 1);
    assert.ok(report.roadmapSuggestions.length >= 1);
    assert.ok(report.executive.topRecommendations.length >= 1);
    assert.ok(report.insights.pilotTrends.some((t) => t.companyId === 'ac-modular'));
    resetLearningFeedbackRegistry();
  });
});
