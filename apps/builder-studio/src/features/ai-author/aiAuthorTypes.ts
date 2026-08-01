/**
 * EPIC-BX-10 — AI Author types (assisted authoring, no LLM, no auto-write).
 */

export type AiAuthorDomain =
  | 'hero'
  | 'knowledge'
  | 'faq'
  | 'media'
  | 'experience'
  | 'release';

export type AiSuggestionStatus = 'generated' | 'accepted' | 'rejected';

export type AiAuthorActionId =
  | 'hero-headline'
  | 'hero-subtitle'
  | 'hero-cta'
  | 'knowledge-fill'
  | 'faq-questions'
  | 'faq-answers'
  | 'media-hero'
  | 'media-gallery-order'
  | 'media-captions'
  | 'experience-module-order'
  | 'experience-cta'
  | 'experience-decision-flow'
  | 'release-notes';

export type AiSuggestion = {
  readonly id: string;
  readonly projectId: string;
  readonly domain: AiAuthorDomain;
  readonly actionId: AiAuthorActionId;
  readonly label: string;
  readonly inputSummary: string;
  readonly contextSummary: string;
  readonly proposalText: string;
  /** Structured payload for apply — domain-specific, never written until accept. */
  readonly payload: unknown;
  readonly status: AiSuggestionStatus;
  readonly createdAt: string;
  readonly resolvedAt: string | null;
};

export const AI_AUTHOR_STORAGE_KEY = 'conis.builder.ai-author.v1' as const;
