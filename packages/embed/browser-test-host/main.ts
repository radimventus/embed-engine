import clientStudioCss from "../../../apps/client-studio/src/index.css?inline";

import { Embed, registerClientStudioCss } from "../src/index";
import { getActiveSession } from "../src/session";

const DSE_BUNGALOV_4KK_HOUSE_ID =
  "reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk";

declare global {
  interface Window {
    __embedIntegration?: {
      readonly getDeliveryState: () => unknown;
    };
  }
}

registerClientStudioCss(clientStudioCss);

Embed.mount({
  mode: "inline",
  target: "#embed",
  objectId: DSE_BUNGALOV_4KK_HOUSE_ID,
});

window.__embedIntegration = {
  getDeliveryState: () => {
    const session = getActiveSession();
    const state =
      session !== null && "getDeliveryState" in session
        ? session.getDeliveryState()
        : null;
    return state === null
      ? null
      : {
          requestedHouseId: state.requestedHouseId,
          resolvedHouseId: state.resolvedHouseId,
          projectId: state.projectId,
          activeHouseId: state.activeHouseId,
        };
  },
};
