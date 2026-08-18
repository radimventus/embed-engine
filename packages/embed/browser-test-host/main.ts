import clientStudioCss from "../../../apps/client-studio/src/index.css?inline";

import { Embed, registerClientStudioCss } from "../src/index";
import { getActiveSession } from "../src/session";

const DSE_BUNGALOV_4KK_HOUSE_ID =
  "reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk";
const requestedHouseId =
  new URLSearchParams(window.location.search).get("objectId")?.trim() ||
  DSE_BUNGALOV_4KK_HOUSE_ID;

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
  objectId: requestedHouseId,
});

window.__embedIntegration = {
  getDeliveryState: () => {
    const session = getActiveSession();
    return session !== null && "getDeliveryState" in session
      ? session.getDeliveryState()
      : null;
  },
};
