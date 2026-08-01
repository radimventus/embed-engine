/**
 * EPIC-BX-10 — AI Author Service: generate → confirm → apply.
 * No LLM. No autonomous writes. Author always confirms.
 */

import { appendSuggestion, resolveSuggestion } from './aiAuthorStorage';
import type { ProposalResult } from './aiAuthorProposals';
import type {
  AiAuthorDomain,
  AiSuggestion,
} from './aiAuthorTypes';

export type GenerateSuggestionInput = {
  readonly projectId: string;
  readonly domain: AiAuthorDomain;
  readonly proposal: ProposalResult;
};

/**
 * Creates a Generated suggestion in local history — does not apply payload.
 */
export function generateSuggestion(
  input: GenerateSuggestionInput,
): AiSuggestion {
  const suggestion: AiSuggestion = {
    id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    projectId: input.projectId,
    domain: input.domain,
    actionId: input.proposal.actionId,
    label: input.proposal.label,
    inputSummary: input.proposal.inputSummary,
    contextSummary: input.proposal.contextSummary,
    proposalText: input.proposal.proposalText,
    payload: input.proposal.payload,
    status: 'generated',
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };
  return appendSuggestion(suggestion);
}

/**
 * Accept → mark history Accepted. Caller applies payload to existing editors.
 */
export function acceptSuggestion(
  projectId: string,
  suggestionId: string,
): AiSuggestion | null {
  return resolveSuggestion(projectId, suggestionId, 'accepted');
}

/**
 * Reject → mark history Rejected. No data change.
 */
export function rejectSuggestion(
  projectId: string,
  suggestionId: string,
): AiSuggestion | null {
  return resolveSuggestion(projectId, suggestionId, 'rejected');
}
