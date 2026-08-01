/**
 * EPIC-BX-03 — module ready state from HP-002 content + composer config.
 */

import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';
import type {
  ExperienceComposition,
  ExperienceModuleId,
  ExperienceModuleReadyState,
} from './experienceComposition';

export type ExperienceModuleReady = {
  readonly state: ExperienceModuleReadyState;
  readonly message: string;
  /** Optional content nav for fixing HP-backed issues. */
  readonly fixNav:
    | 'media'
    | 'rooms'
    | 'gallery'
    | 'videos'
    | 'manifest'
    | 'overview'
    | null;
};

export function evaluateModuleReadyState(input: {
  readonly moduleId: ExperienceModuleId;
  readonly composition: ExperienceComposition;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly validationReport: HousePackageValidationReport | null;
}): ExperienceModuleReady {
  const { moduleId, composition, snapshot, validationReport } = input;
  const placement = composition.modules.find((item) => item.id === moduleId);
  if (placement !== undefined && !placement.enabled) {
    return {
      state: 'warning',
      message: 'Modul je vypnutý v Experience.',
      fixNav: null,
    };
  }

  const pkg = snapshot?.validation.builderImport ?? null;
  const hasIssue = (categories: readonly string[]) =>
    validationReport?.issues.some((issue) =>
      categories.includes(issue.category),
    ) === true;

  switch (moduleId) {
    case 'hero': {
      const image = composition.configs.hero.imagePath.trim();
      if (image.length === 0) {
        return {
          state: 'error',
          message: 'Chybí hero obrázek.',
          fixNav: 'media',
        };
      }
      if (hasIssue(['media', 'missing-assets'])) {
        return {
          state: 'warning',
          message: 'Média mají varování.',
          fixNav: 'media',
        };
      }
      if (composition.configs.hero.title.trim().length === 0) {
        return {
          state: 'warning',
          message: 'Doplňte nadpis Hero.',
          fixNav: null,
        };
      }
      return { state: 'ready', message: 'Ready', fixNav: null };
    }
    case 'priority': {
      if (!composition.configs.priority.enabled) {
        return {
          state: 'warning',
          message: 'Priority engine je vypnutý.',
          fixNav: null,
        };
      }
      if (composition.configs.priority.priorityOrder.length === 0) {
        return {
          state: 'error',
          message: 'Chybí pořadí priorit.',
          fixNav: null,
        };
      }
      return { state: 'ready', message: 'Ready', fixNav: null };
    }
    case 'house-navigator': {
      const rooms = pkg?.rooms.rooms.length ?? 0;
      if (rooms === 0) {
        return {
          state: 'error',
          message: 'Chybí dispozice (místnosti).',
          fixNav: 'rooms',
        };
      }
      if (hasIssue(['rooms', 'plans', 'orphan-refs'])) {
        return {
          state: 'warning',
          message: 'Dispozice má varování.',
          fixNav: 'rooms',
        };
      }
      return { state: 'ready', message: 'Ready', fixNav: null };
    }
    case 'faq': {
      if (composition.configs.faq.items.length === 0) {
        return {
          state: 'warning',
          message: 'FAQ nemá otázky.',
          fixNav: null,
        };
      }
      return { state: 'ready', message: 'Ready', fixNav: null };
    }
    case 'ai-advisor': {
      if (composition.configs['ai-advisor'].prompt.trim().length === 0) {
        return {
          state: 'warning',
          message: 'Doplňte prompt AI Advisoru.',
          fixNav: null,
        };
      }
      return { state: 'ready', message: 'Ready', fixNav: null };
    }
    case 'lead-capture': {
      if (composition.configs['lead-capture'].cta.trim().length === 0) {
        return {
          state: 'error',
          message: 'Chybí CTA Lead Capture.',
          fixNav: null,
        };
      }
      return { state: 'ready', message: 'Ready', fixNav: null };
    }
  }
}

export function readyGlyph(state: ExperienceModuleReadyState): string {
  if (state === 'ready') return '✔';
  if (state === 'warning') return '⚠';
  return '✖';
}
