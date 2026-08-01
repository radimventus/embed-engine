import type {
  IntelligenceAnalysis,
  IntelligenceProjectContext,
} from '../domain/types';
import { analyzeProject } from '../api/intelligenceApi';

export type StudioIntelligenceId = 'builder' | 'manager' | 'sales';

/**
 * Studio adapter contract — all studios share the same engine.
 * Adapters project studio-specific sources into IntelligenceProjectContext.
 */
export type StudioIntelligenceAdapter = {
  readonly studioId: StudioIntelligenceId;
  readonly analyze: (
    context: IntelligenceProjectContext,
  ) => IntelligenceAnalysis;
};

function createAdapter(
  studioId: StudioIntelligenceId,
): StudioIntelligenceAdapter {
  return {
    studioId,
    analyze: analyzeProject,
  };
}

/**
 * Builder Adapter — Intelligence Core entry for Builder Studio.
 * Builder must project HP / Experience / Knowledge into context first.
 */
export function createBuilderIntelligenceAdapter(): StudioIntelligenceAdapter {
  return createAdapter('builder');
}

/**
 * Manager Adapter — integration point (architecture ready, not yet wired to UI).
 */
export function createManagerIntelligenceAdapter(): StudioIntelligenceAdapter {
  return createAdapter('manager');
}

/**
 * Sales Adapter — integration point (architecture ready, not yet wired to UI).
 */
export function createSalesIntelligenceAdapter(): StudioIntelligenceAdapter {
  return createAdapter('sales');
}

export function analyzeViaBuilderAdapter(
  context: IntelligenceProjectContext,
): IntelligenceAnalysis {
  return createBuilderIntelligenceAdapter().analyze(context);
}

export function analyzeViaManagerAdapter(
  context: IntelligenceProjectContext,
): IntelligenceAnalysis {
  return createManagerIntelligenceAdapter().analyze(context);
}

export function analyzeViaSalesAdapter(
  context: IntelligenceProjectContext,
): IntelligenceAnalysis {
  return createSalesIntelligenceAdapter().analyze(context);
}
