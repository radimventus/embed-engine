import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createExperienceComposerApi } from './experience-api';
import { createExperienceComposerService } from './experience-composer-service';
import { validateExperienceStructure } from './experience-structure';

describe('createExperienceComposerService', () => {
  it('creates Experience with scenes, modules and navigation', () => {
    const composer = createExperienceComposerService({
      now: () => new Date('2026-08-18T12:00:00.000Z'),
      createId: (prefix) => `${prefix}-x`,
    });

    const experience = composer.createExperience({
      objectId: 'object-harmony-124',
      title: 'Harmony Experience',
      availableModules: [
        'hero',
        'house-navigator',
        'priority',
        'faq',
        'lead-capture',
      ],
    });

    assert.equal(experience.experienceId, 'experience-object-harmony-124');
    assert.ok(experience.scenes.length >= 3);
    assert.ok(experience.modules.includes('hero'));
    assert.equal(
      experience.navigation.defaultScene,
      experience.scenes[0]?.sceneId,
    );
    assert.equal(
      experience.navigation.order.length,
      experience.scenes.length,
    );
    assert.equal(
      composer.getEvents(experience.experienceId)[0]?.type,
      'ExperienceCreated',
    );
  });

  it('adds, renames, moves, removes scenes and assigns modules', () => {
    const composer = createExperienceComposerService({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const created = composer.createExperience({
      objectId: 'object-family-98',
      title: 'Family Experience',
    });

    const withScene = composer.addScene(created.experienceId, 'Extra');
    assert.ok(
      composer
        .getEvents(created.experienceId)
        .some((event) => event.type === 'SceneAdded'),
    );

    const renamed = composer.updateScene(
      created.experienceId,
      withScene.scenes[withScene.scenes.length - 1]!.sceneId,
      { title: 'Doplněk' },
    );
    assert.ok(renamed.scenes.some((scene) => scene.title === 'Doplněk'));

    const lastId = renamed.scenes[renamed.scenes.length - 1]!.sceneId;
    const moved = composer.moveScene(created.experienceId, lastId, 'up');
    assert.ok(
      composer
        .getEvents(created.experienceId)
        .some((event) => event.type === 'SceneMoved'),
    );

    const firstId = moved.scenes[0]!.sceneId;
    const assigned = composer.assignModule(
      created.experienceId,
      firstId,
      'ai-advisor',
    );
    assert.ok(
      assigned.scenes
        .find((scene) => scene.sceneId === firstId)
        ?.modules.includes('ai-advisor'),
    );
    assert.ok(
      composer
        .getEvents(created.experienceId)
        .some((event) => event.type === 'ModuleAssigned'),
    );

    const afterRemove = composer.removeScene(created.experienceId, lastId);
    assert.ok(
      composer
        .getEvents(created.experienceId)
        .some((event) => event.type === 'SceneRemoved'),
    );
    assert.equal(afterRemove.scenes.length, moved.scenes.length - 1);
  });

  it('exposes Composer API and structure validation', () => {
    const composer = createExperienceComposerService();
    const api = createExperienceComposerApi(composer);

    const created = api.createExperience({
      objectId: 'object-villa-168',
      title: 'Villa Experience',
    });
    const loaded = api.loadExperience(created.experienceId);
    assert.ok(loaded);

    const updated = api.updateExperience(created.experienceId, {
      description: 'Struktura Experience',
    });
    assert.equal(updated.metadata.description, 'Struktura Experience');

    const report = validateExperienceStructure(updated);
    assert.equal(report.valid, true);
    assert.equal(composer.validateStructure(created.experienceId).valid, true);
  });

  it('rejects removing the last scene', () => {
    const composer = createExperienceComposerService({
      createId: (prefix) => `${prefix}-only`,
    });
    const created = composer.createExperience({
      objectId: 'object-solo',
      availableModules: ['hero'],
    });
    while (created.scenes.length > 1) {
      composer.removeScene(
        created.experienceId,
        composer.loadExperience(created.experienceId)!.scenes[1]!.sceneId,
      );
    }
    const solo = composer.loadExperience(created.experienceId)!;
    assert.equal(solo.scenes.length, 1);
    assert.throws(() =>
      composer.removeScene(solo.experienceId, solo.scenes[0]!.sceneId),
    );
  });
});
