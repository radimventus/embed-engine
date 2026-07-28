import type {
  BuildGatewayAIContextInput,
  GatewayAIContextPackage,
} from '../../model';
import type { AIDecisionGateway } from './ai-decision-gateway';

/**
 * Public AI Decision Gateway API (EPIC-BLD-28).
 */
export type AIDecisionGatewayApi = {
  buildAIContext(input: BuildGatewayAIContextInput): GatewayAIContextPackage;
  publishAIContext(packageId: string): GatewayAIContextPackage;
  previewAIContext(packageId: string): GatewayAIContextPackage | null;
  listAIContexts(): readonly GatewayAIContextPackage[];
  validateAIContext(packageId: string): GatewayAIContextPackage;
};

export function createAIDecisionGatewayApi(
  gateway: AIDecisionGateway,
): AIDecisionGatewayApi {
  return {
    buildAIContext(input) {
      return gateway.buildContext(input);
    },
    publishAIContext(packageId) {
      return gateway.publish(packageId);
    },
    previewAIContext(packageId) {
      return gateway.preview(packageId);
    },
    listAIContexts() {
      return gateway.listContexts();
    },
    validateAIContext(packageId) {
      return gateway.validate(packageId);
    },
  };
}
