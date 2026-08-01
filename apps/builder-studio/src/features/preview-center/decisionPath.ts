/**
 * EPIC-BX-06 — Decision Path from Experience Composer module order.
 */

import {
  EXPERIENCE_MODULE_CATALOG,
  type ExperienceModuleId,
} from '../experience-composer/experienceComposition';
import { loadExperienceComposition } from '../experience-composer/experienceComposerStorage';

export type DecisionPathStep = {
  readonly id: ExperienceModuleId;
  readonly label: string;
  readonly enabled: boolean;
  readonly index: number;
};

export function buildDecisionPath(input: {
  readonly projectId: string;
  readonly heroRelativePath?: string;
}): readonly DecisionPathStep[] {
  const composition = loadExperienceComposition(
    input.projectId,
    input.heroRelativePath,
  );

  return composition.modules.map((module, index) => {
    const def =
      EXPERIENCE_MODULE_CATALOG.find((item) => item.id === module.id) ??
      EXPERIENCE_MODULE_CATALOG[0];
    return {
      id: module.id,
      label: def.label,
      enabled: module.enabled,
      index,
    };
  });
}
