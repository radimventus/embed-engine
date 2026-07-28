import type {
  ComposerEvent,
  CreateExperienceInput,
  Experience,
  ExperienceStructureReport,
  ObjectModuleId,
  Scene,
  UpdateExperienceInput,
  UpdateSceneInput,
} from '../../model';
import {
  buildNavigation,
  collectExperienceModules,
  validateExperienceStructure,
} from './experience-structure';

const MAX_HISTORY = 40;

export type ExperienceComposerService = {
  createExperience(input: CreateExperienceInput): Experience;
  loadExperience(experienceId: string): Experience | null;
  loadExperienceByObject(objectId: string): Experience | null;
  updateExperience(
    experienceId: string,
    patch: UpdateExperienceInput,
  ): Experience;
  addScene(experienceId: string, title?: string): Experience;
  removeScene(experienceId: string, sceneId: string): Experience;
  moveScene(
    experienceId: string,
    sceneId: string,
    direction: 'up' | 'down',
  ): Experience;
  updateScene(
    experienceId: string,
    sceneId: string,
    patch: UpdateSceneInput,
  ): Experience;
  assignModule(
    experienceId: string,
    sceneId: string,
    moduleId: ObjectModuleId,
  ): Experience;
  unassignModule(
    experienceId: string,
    sceneId: string,
    moduleId: ObjectModuleId,
  ): Experience;
  validateStructure(experienceId: string): ExperienceStructureReport;
  getEvents(experienceId?: string): readonly ComposerEvent[];
  getHistory(experienceId?: string): readonly ComposerEvent[];
  listExperiences(): readonly Experience[];
};

function nextVersion(previous: string): string {
  const parts = previous.split('.').map(Number);
  const major = parts[0] ?? 1;
  const minor = parts[1] ?? 0;
  const patch = (parts[2] ?? 0) + 1;
  return `${major}.${minor}.${patch}`;
}

function reindexScenes(scenes: readonly Scene[]): Scene[] {
  return [...scenes]
    .sort((a, b) => a.order - b.order)
    .map((scene, index) => ({
      ...scene,
      order: index,
    }));
}

function withScenes(
  experience: Experience,
  scenes: readonly Scene[],
  versionBump: boolean,
): Experience {
  const reindexed = reindexScenes(scenes);
  return {
    ...experience,
    scenes: reindexed,
    modules: collectExperienceModules(reindexed),
    navigation: buildNavigation(
      reindexed,
      experience.navigation.defaultScene,
    ),
    version: versionBump ? nextVersion(experience.version) : experience.version,
  };
}

const DEFAULT_SCENE_BLUEPRINT: readonly {
  readonly title: string;
  readonly modules: readonly ObjectModuleId[];
}[] = [
  { title: 'Úvod', modules: ['hero', 'market-pulse'] },
  { title: 'Prohlídka', modules: ['house-navigator'] },
  { title: 'Rozhodování', modules: ['priority', 'faq'] },
  { title: 'Kontakt', modules: ['lead-capture'] },
];

/**
 * ExperienceComposerService (EPIC-BLD-09).
 * Orchestrates Experience structure — no Runtime interpretation.
 */
export function createExperienceComposerService(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
}): ExperienceComposerService {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const experiences = new Map<string, Experience>();
  const events: ComposerEvent[] = [];

  const pushEvent = (
    type: ComposerEvent['type'],
    experienceId: string,
    objectId: string,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('composer-event'),
      type,
      experienceId,
      objectId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requireExperience = (experienceId: string): Experience => {
    const current = experiences.get(experienceId);
    if (current === undefined) {
      throw new Error(`Experience not found: ${experienceId}`);
    }
    return current;
  };

  const write = (next: Experience): Experience => {
    experiences.set(next.experienceId, next);
    return next;
  };

  return {
    createExperience(input) {
      const existing = Array.from(experiences.values()).find(
        (item) => item.objectId === input.objectId,
      );
      if (existing !== undefined) {
        return existing;
      }

      const experienceId = `experience-${input.objectId}`;
      const available = new Set(input.availableModules ?? []);
      const scenes: Scene[] = DEFAULT_SCENE_BLUEPRINT.map((blueprint, index) => {
        const modules =
          available.size === 0
            ? [...blueprint.modules]
            : blueprint.modules.filter((moduleId) => available.has(moduleId));
        return {
          sceneId: createId(`scene-${input.objectId}`),
          title: blueprint.title,
          order: index,
          modules,
          settings: { notes: '' },
        };
      }).filter((scene) => scene.modules.length > 0 || available.size === 0);

      const ensuredScenes =
        scenes.length > 0
          ? scenes
          : [
              {
                sceneId: createId(`scene-${input.objectId}`),
                title: 'Scéna 1',
                order: 0,
                modules: [] as ObjectModuleId[],
                settings: { notes: '' },
              },
            ];

      const created: Experience = {
        experienceId,
        objectId: input.objectId,
        scenes: ensuredScenes,
        modules: collectExperienceModules(ensuredScenes),
        navigation: buildNavigation(ensuredScenes),
        metadata: {
          title: input.title?.trim() || 'Experience',
          description: input.description?.trim() || '',
        },
        version: '1.0.0',
      };
      write(created);
      pushEvent(
        'ExperienceCreated',
        created.experienceId,
        created.objectId,
        `Experience ${created.metadata.title} created`,
      );
      return created;
    },

    loadExperience(experienceId) {
      return experiences.get(experienceId) ?? null;
    },

    loadExperienceByObject(objectId) {
      return (
        experiences.get(`experience-${objectId}`) ??
        Array.from(experiences.values()).find(
          (item) => item.objectId === objectId,
        ) ??
        null
      );
    },

    updateExperience(experienceId, patch) {
      const current = requireExperience(experienceId);
      const next: Experience = {
        ...current,
        metadata: {
          title: patch.title?.trim() ?? current.metadata.title,
          description:
            patch.description !== undefined
              ? patch.description.trim()
              : current.metadata.description,
        },
        version: nextVersion(current.version),
      };
      return write(next);
    },

    addScene(experienceId, title) {
      const current = requireExperience(experienceId);
      const scene: Scene = {
        sceneId: createId(`scene-${current.objectId}`),
        title: title?.trim() || `Scéna ${current.scenes.length + 1}`,
        order: current.scenes.length,
        modules: [],
        settings: { notes: '' },
      };
      const next = withScenes(current, [...current.scenes, scene], true);
      write(next);
      pushEvent(
        'SceneAdded',
        next.experienceId,
        next.objectId,
        `Scene ${scene.title} added`,
      );
      return next;
    },

    removeScene(experienceId, sceneId) {
      const current = requireExperience(experienceId);
      if (current.scenes.length <= 1) {
        throw new Error('Experience must keep at least one scene');
      }
      const remaining = current.scenes.filter(
        (scene) => scene.sceneId !== sceneId,
      );
      if (remaining.length === current.scenes.length) {
        return current;
      }
      const next = withScenes(current, remaining, true);
      write(next);
      pushEvent(
        'SceneRemoved',
        next.experienceId,
        next.objectId,
        `Scene ${sceneId} removed`,
      );
      return next;
    },

    moveScene(experienceId, sceneId, direction) {
      const current = requireExperience(experienceId);
      const ordered = reindexScenes(current.scenes);
      const index = ordered.findIndex((scene) => scene.sceneId === sceneId);
      if (index < 0) {
        return current;
      }
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= ordered.length) {
        return current;
      }
      const swapped = [...ordered];
      const a = swapped[index];
      const b = swapped[target];
      if (a === undefined || b === undefined) {
        return current;
      }
      swapped[index] = b;
      swapped[target] = a;
      const next = withScenes(current, swapped, true);
      write(next);
      pushEvent(
        'SceneMoved',
        next.experienceId,
        next.objectId,
        `Scene ${sceneId} moved ${direction}`,
      );
      return next;
    },

    updateScene(experienceId, sceneId, patch) {
      const current = requireExperience(experienceId);
      const scenes = current.scenes.map((scene) => {
        if (scene.sceneId !== sceneId) {
          return scene;
        }
        return {
          ...scene,
          title: patch.title?.trim() ?? scene.title,
          settings: {
            notes:
              patch.settings?.notes !== undefined
                ? patch.settings.notes
                : scene.settings.notes,
          },
        };
      });
      return write(withScenes(current, scenes, true));
    },

    assignModule(experienceId, sceneId, moduleId) {
      const current = requireExperience(experienceId);
      const scenes = current.scenes.map((scene) => {
        if (scene.sceneId !== sceneId) {
          return scene;
        }
        if (scene.modules.includes(moduleId)) {
          return scene;
        }
        return {
          ...scene,
          modules: [...scene.modules, moduleId],
        };
      });
      const next = withScenes(current, scenes, true);
      write(next);
      pushEvent(
        'ModuleAssigned',
        next.experienceId,
        next.objectId,
        `Module ${moduleId} assigned to ${sceneId}`,
      );
      return next;
    },

    unassignModule(experienceId, sceneId, moduleId) {
      const current = requireExperience(experienceId);
      const scenes = current.scenes.map((scene) => {
        if (scene.sceneId !== sceneId) {
          return scene;
        }
        return {
          ...scene,
          modules: scene.modules.filter((id) => id !== moduleId),
        };
      });
      const next = withScenes(current, scenes, true);
      write(next);
      pushEvent(
        'ModuleAssigned',
        next.experienceId,
        next.objectId,
        `Module ${moduleId} unassigned from ${sceneId}`,
      );
      return next;
    },

    validateStructure(experienceId) {
      return validateExperienceStructure(requireExperience(experienceId));
    },

    getEvents(experienceId) {
      if (experienceId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.experienceId === experienceId);
    },

    getHistory(experienceId) {
      return this.getEvents(experienceId);
    },

    listExperiences() {
      return Array.from(experiences.values());
    },
  };
}
