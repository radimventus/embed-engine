import type {
  IntelligencePersona,
  IntelligenceProjectContext,
} from './types';

/** Default Decision personas (ChangePriority profiles) — shared platform knowledge. */
export const DEFAULT_DECISION_PERSONAS: readonly IntelligencePersona[] = [
  {
    id: 'family',
    label: 'Rodina',
    priorityIds: ['layout', 'privacy', 'plot', 'flexibility'],
  },
  {
    id: 'investor',
    label: 'Investor',
    priorityIds: ['investment', 'operating-costs', 'quality', 'energy'],
  },
  {
    id: 'senior',
    label: 'Senior',
    priorityIds: ['maintenance', 'energy', 'privacy', 'quality'],
  },
  {
    id: 'single',
    label: 'Single',
    priorityIds: ['design', 'flexibility', 'layout', 'operating-costs'],
  },
] as const;

export const CRITICAL_EXPERIENCE_STEP_IDS: readonly string[] = [
  'hero',
  'priority',
  'house-navigator',
  'faq',
  'lead-capture',
] as const;

export function createEmptyIntelligenceContext(
  projectId = 'empty',
): IntelligenceProjectContext {
  return {
    projectId,
    housePackage: {
      heroPath: '',
      galleryRows: [],
      videoRows: [],
      roomCount: 0,
      floorPlanCount: 0,
      galleryCount: 0,
      videoCount: 0,
      validationOk: false,
    },
    experience: {
      modules: [],
      faqItems: [],
      heroCta: '',
      priorityEnabled: false,
    },
    knowledge: {
      categories: [],
      completeCount: 0,
      partialCount: 0,
      missingCount: 0,
    },
    media: {
      heroAlt: '',
      documentTitles: [],
      documentUrls: [],
      energyClass: '',
    },
    qa: {
      passCount: 0,
      warnCount: 0,
      failCount: 0,
    },
    validationStatus: 'UNKNOWN',
    personas: DEFAULT_DECISION_PERSONAS,
    criticalPathStepIds: CRITICAL_EXPERIENCE_STEP_IDS,
  };
}
