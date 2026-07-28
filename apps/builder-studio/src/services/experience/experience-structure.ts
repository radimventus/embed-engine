import type {
  Experience,
  ExperienceStructureIssue,
  ExperienceStructureReport,
  Scene,
} from '../../model';

/**
 * Structural validation only — no Runtime meaning.
 */
export function validateExperienceStructure(
  experience: Experience,
): ExperienceStructureReport {
  const issues: ExperienceStructureIssue[] = [];

  if (experience.scenes.length === 0) {
    issues.push({
      code: 'experience.no-scenes',
      severity: 'error',
      message: 'Experience musí obsahovat alespoň jednu scénu.',
    });
  }

  const orders = experience.scenes.map((scene) => scene.order);
  const uniqueOrders = new Set(orders);
  if (uniqueOrders.size !== orders.length) {
    issues.push({
      code: 'experience.duplicate-order',
      severity: 'error',
      message: 'Pořadí scén musí být unikátní.',
    });
  }

  const sorted = [...experience.scenes].sort((a, b) => a.order - b.order);
  for (let index = 0; index < sorted.length; index += 1) {
    const scene = sorted[index];
    if (scene === undefined) {
      continue;
    }
    if (scene.modules.length === 0) {
      issues.push({
        code: 'scene.empty-modules',
        severity: 'warning',
        message: `Scéna „${scene.title}“ nemá přiřazené moduly.`,
        sceneId: scene.sceneId,
      });
    }
  }

  const nav = experience.navigation;
  if (
    nav.defaultScene !== null &&
    !experience.scenes.some((scene) => scene.sceneId === nav.defaultScene)
  ) {
    issues.push({
      code: 'navigation.invalid-default',
      severity: 'error',
      message: 'Výchozí scéna neexistuje v Experience.',
    });
  }

  for (const sceneId of nav.order) {
    if (!experience.scenes.some((scene) => scene.sceneId === sceneId)) {
      issues.push({
        code: 'navigation.orphan-order',
        severity: 'error',
        message: `Navigace odkazuje na neexistující scénu ${sceneId}.`,
        sceneId,
      });
    }
  }

  if (nav.order.length !== experience.scenes.length) {
    issues.push({
      code: 'navigation.order-mismatch',
      severity: 'warning',
      message: 'Pořadí navigace neodpovídá počtu scén.',
    });
  }

  const moduleCount = experience.modules.length;
  const hasErrors = issues.some((item) => item.severity === 'error');

  return {
    experienceId: experience.experienceId,
    valid: !hasErrors,
    sceneCount: experience.scenes.length,
    moduleCount,
    issues,
  };
}

export function collectExperienceModules(
  scenes: readonly Scene[],
): readonly Scene['modules'][number][] {
  const seen = new Set<Scene['modules'][number]>();
  const result: Scene['modules'][number][] = [];
  for (const scene of [...scenes].sort((a, b) => a.order - b.order)) {
    for (const moduleId of scene.modules) {
      if (!seen.has(moduleId)) {
        seen.add(moduleId);
        result.push(moduleId);
      }
    }
  }
  return result;
}

export function buildNavigation(
  scenes: readonly Scene[],
  defaultScene?: string | null,
): Experience['navigation'] {
  const ordered = [...scenes]
    .sort((a, b) => a.order - b.order)
    .map((scene) => scene.sceneId);
  const defaultId =
    defaultScene === undefined
      ? (ordered[0] ?? null)
      : defaultScene !== null && ordered.includes(defaultScene)
        ? defaultScene
        : (ordered[0] ?? null);
  return {
    scenes: ordered,
    defaultScene: defaultId,
    order: ordered,
  };
}
