import type {
  IngestAnalyticsInput,
  LearningRecord,
  LearningValidationResult,
} from '../../model';
import type { LearningPipeline } from './learning-pipeline';

/**
 * Public Learning Pipeline API (EPIC-BLD-22).
 */
export type LearningPipelineApi = {
  importAnalytics(input: IngestAnalyticsInput): LearningValidationResult;
  previewLearningRecord(pipelineId: string): LearningRecord | null;
  validateLearning(pipelineId: string): LearningValidationResult;
  exportLearningRecord(pipelineId: string): string | null;
  transformLearning(pipelineId: string): LearningRecord;
};

export function createLearningPipelineApi(
  pipeline: LearningPipeline,
): LearningPipelineApi {
  return {
    importAnalytics(input) {
      return pipeline.ingest(input);
    },
    previewLearningRecord(pipelineId) {
      return pipeline.preview(pipelineId);
    },
    validateLearning(pipelineId) {
      return pipeline.validate(pipelineId);
    },
    exportLearningRecord(pipelineId) {
      return pipeline.exportRecord(pipelineId);
    },
    transformLearning(pipelineId) {
      return pipeline.transform(pipelineId);
    },
  };
}
