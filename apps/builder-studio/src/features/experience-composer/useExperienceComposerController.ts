import { useCallback, useEffect, useState } from 'react';

import {
  addExperienceModule,
  createDefaultExperienceComposition,
  reorderExperienceModules,
  toggleExperienceModule,
  updateModuleConfig,
  type ExperienceComposition,
  type ExperienceModuleConfigs,
  type ExperienceModuleId,
} from './experienceComposition';
import {
  loadExperienceComposition,
  persistExperienceComposition,
} from './experienceComposerStorage';

export type ExperienceComposerController = {
  readonly composition: ExperienceComposition;
  readonly selectedModuleId: ExperienceModuleId | null;
  readonly editingModuleId: ExperienceModuleId | null;
  readonly selectModule: (moduleId: ExperienceModuleId | null) => void;
  readonly openEditor: (moduleId: ExperienceModuleId) => void;
  readonly closeEditor: () => void;
  readonly reorder: (fromIndex: number, toIndex: number) => void;
  readonly toggleEnabled: (moduleId: ExperienceModuleId) => void;
  readonly addModule: (moduleId: ExperienceModuleId) => void;
  readonly saveConfig: <K extends ExperienceModuleId>(
    moduleId: K,
    config: ExperienceModuleConfigs[K],
  ) => void;
};

/**
 * EPIC-BX-03 — Experience Composer state for the active project.
 */
export function useExperienceComposerController(
  projectId: string | null,
  heroImagePath?: string,
): ExperienceComposerController {
  const [composition, setComposition] = useState<ExperienceComposition>(() =>
    projectId === null
      ? createDefaultExperienceComposition('__none__', heroImagePath)
      : loadExperienceComposition(projectId, heroImagePath),
  );
  const [selectedModuleId, setSelectedModuleId] =
    useState<ExperienceModuleId | null>('hero');
  const [editingModuleId, setEditingModuleId] =
    useState<ExperienceModuleId | null>(null);

  useEffect(() => {
    if (projectId === null) {
      return;
    }
    const next = loadExperienceComposition(projectId, heroImagePath);
    setComposition(next);
    setSelectedModuleId(next.modules[0]?.id ?? 'hero');
    setEditingModuleId(null);
  }, [projectId, heroImagePath]);

  useEffect(() => {
    if (projectId === null || composition.projectId !== projectId) {
      return;
    }
    persistExperienceComposition(composition);
  }, [composition, projectId]);

  const apply = useCallback((next: ExperienceComposition) => {
    setComposition(next);
  }, []);

  return {
    composition,
    selectedModuleId,
    editingModuleId,
    selectModule: setSelectedModuleId,
    openEditor: (moduleId) => {
      setSelectedModuleId(moduleId);
      setEditingModuleId(moduleId);
    },
    closeEditor: () => setEditingModuleId(null),
    reorder: (fromIndex, toIndex) => {
      apply(reorderExperienceModules(composition, fromIndex, toIndex));
    },
    toggleEnabled: (moduleId) => {
      apply(toggleExperienceModule(composition, moduleId));
    },
    addModule: (moduleId) => {
      apply(addExperienceModule(composition, moduleId));
      setSelectedModuleId(moduleId);
    },
    saveConfig: (moduleId, config) => {
      apply(updateModuleConfig(composition, moduleId, config));
    },
  };
}
