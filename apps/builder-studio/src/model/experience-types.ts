/**
 * Experience Composer (EPIC-BLD-09).
 * Authoring structure only — no Runtime interpretation.
 * Experience belongs to Object Package; Scene is a logical unit.
 */

import type { ObjectModuleId } from './object-types';

export type SceneSettings = {
  readonly notes: string;
};

export type Scene = {
  readonly sceneId: string;
  readonly title: string;
  readonly order: number;
  readonly modules: readonly ObjectModuleId[];
  readonly settings: SceneSettings;
};

/**
 * Navigation structure over scenes.
 * order mirrors scenes[] sequence for explicit authoring.
 */
export type ExperienceNavigation = {
  readonly scenes: readonly string[];
  readonly defaultScene: string | null;
  readonly order: readonly string[];
};

export type ExperienceMetadata = {
  readonly title: string;
  readonly description: string;
};

/**
 * Authoring Experience — structure composition only.
 */
export type Experience = {
  readonly experienceId: string;
  readonly objectId: string;
  readonly scenes: readonly Scene[];
  readonly modules: readonly ObjectModuleId[];
  readonly navigation: ExperienceNavigation;
  readonly metadata: ExperienceMetadata;
  readonly version: string;
};

export type CreateExperienceInput = {
  readonly objectId: string;
  readonly title?: string;
  readonly description?: string;
  readonly availableModules?: readonly ObjectModuleId[];
};

export type UpdateExperienceInput = {
  readonly title?: string;
  readonly description?: string;
};

export type UpdateSceneInput = {
  readonly title?: string;
  readonly settings?: Partial<SceneSettings>;
};

export type ExperienceStructureIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
  readonly sceneId?: string;
};

export type ExperienceStructureReport = {
  readonly experienceId: string;
  readonly valid: boolean;
  readonly sceneCount: number;
  readonly moduleCount: number;
  readonly issues: readonly ExperienceStructureIssue[];
};

export type ComposerEventType =
  | 'ExperienceCreated'
  | 'SceneAdded'
  | 'SceneRemoved'
  | 'ModuleAssigned'
  | 'SceneMoved';

export type ComposerEvent = {
  readonly eventId: string;
  readonly type: ComposerEventType;
  readonly experienceId: string;
  readonly objectId: string;
  readonly at: string;
  readonly message: string;
};
