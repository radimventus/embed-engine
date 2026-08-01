import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  acceptSuggestion,
  generateSuggestion,
  listProjectSuggestions,
  proposeFaqQuestions,
  proposeHeroHeadline,
  proposeKnowledgeFill,
  proposeReleaseNotes,
  rejectSuggestion,
} from './index';
import type { KnowledgeCategoryView } from '../knowledge-composer/knowledgeProjection';

describe('aiAuthor (EPIC-BX-10)', () => {
  it('generates suggestions without applying them', () => {
    const projectId = `ai-${Date.now()}`;
    const proposal = proposeHeroHeadline({
      projectName: 'Harmony',
      currentTitle: 'Starý nadpis',
    });
    const suggestion = generateSuggestion({
      projectId,
      domain: 'hero',
      proposal,
    });
    assert.equal(suggestion.status, 'generated');
    assert.ok(suggestion.proposalText.length > 0);
    assert.equal(listProjectSuggestions(projectId)[0]?.id, suggestion.id);
  });

  it('accept and reject update suggestion history only', () => {
    const projectId = `ai-resolve-${Date.now()}`;
    const created = generateSuggestion({
      projectId,
      domain: 'faq',
      proposal: proposeFaqQuestions({
        existing: [],
        projectName: 'Villa',
      }),
    });
    const accepted = acceptSuggestion(projectId, created.id);
    assert.equal(accepted?.status, 'accepted');

    const second = generateSuggestion({
      projectId,
      domain: 'release',
      proposal: proposeReleaseNotes({
        projectName: 'Villa',
        preparedChanges: ['Hero'],
        heroPath: 'media/hero/hero.webp',
      }),
    });
    const rejected = rejectSuggestion(projectId, second.id);
    assert.equal(rejected?.status, 'rejected');
  });

  it('knowledge fill uses existing category fields only', () => {
    const category: KnowledgeCategoryView = {
      id: 'energy',
      label: 'Energetika',
      description: 'Energie',
      summary: 'B',
      health: 'complete',
      itemCount: 1,
      updatedAt: new Date().toISOString(),
      dependencies: ['Runtime'],
      fields: [
        {
          key: 'energyClass',
          label: 'Energetická třída',
          value: 'B',
          editable: false,
        },
      ],
      editTarget: { kind: 'inline-readonly' },
    };
    const proposal = proposeKnowledgeFill(category);
    assert.match(proposal.proposalText, /Energetika|energet/i);
    assert.equal(
      (proposal.payload as { suggestedFaq: { answer: string } }).suggestedFaq
        .answer.includes('B'),
      true,
    );
  });
});
