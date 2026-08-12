import { WelcomeBridge } from "@embed-engine/ui";

import { SPATIAL_TERMINAL_MEDIA_TERMINAL_WIDTH_PX } from "../chapter-layout";
import { ConisAvatar } from "../sections/PriorityEngine/ConisAvatar";
import { CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG } from "./clientStudioWelcomeBridgeConfig";

/** The Tour display has a fixed 20 px inset from the section edge. */
const TOUR_CTA_SIDE_OVERHANG_PX = 20;
const TOUR_CTA_BANNER_WIDTH_PX =
  SPATIAL_TERMINAL_MEDIA_TERMINAL_WIDTH_PX + TOUR_CTA_SIDE_OVERHANG_PX * 2;

type ClientStudioWelcomeBridgeProps = {
  readonly open: boolean;
  readonly onContinue: () => void;
  readonly onDismiss: () => void;
};

/** Client Studio host — injects Conis avatar + Experience config into platform bridge. */
export function ClientStudioWelcomeBridge({
  open,
  onContinue,
  onDismiss,
}: ClientStudioWelcomeBridgeProps) {
  return (
    <div className="desktop:-ml-section desktop:w-[640px]">
      <WelcomeBridge
        config={CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG}
        avatar={
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              background: "#F7F6F4",
              padding: 2,
            }}
          >
            <ConisAvatar size={48} />
          </span>
        }
        open={open}
        onContinue={onContinue}
        onDismiss={onDismiss}
        style={{ width: `min(${TOUR_CTA_BANNER_WIDTH_PX}px, 100%)` }}
      />
    </div>
  );
}
