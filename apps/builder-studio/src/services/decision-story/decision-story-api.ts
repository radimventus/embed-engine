import type {
  ComposeStoryInput,
  DecisionStory,
  StoryValidation,
} from '../../model';
import type { DecisionStoryComposer } from './decision-story-composer';

/**
 * Public Decision Story API (EPIC-BLD-18).
 */
export type DecisionStoryApi = {
  composeStory(input: ComposeStoryInput): DecisionStory;
  previewStory(storyId: string): DecisionStory | null;
  validateStory(storyId: string): StoryValidation;
};

export function createDecisionStoryApi(
  composer: DecisionStoryComposer,
): DecisionStoryApi {
  return {
    composeStory(input) {
      return composer.compose(input);
    },
    previewStory(storyId) {
      return composer.preview(storyId);
    },
    validateStory(storyId) {
      return composer.validateStory(storyId).validation!;
    },
  };
}
