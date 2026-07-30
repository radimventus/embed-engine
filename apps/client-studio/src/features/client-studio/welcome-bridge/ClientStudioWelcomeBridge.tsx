import { WelcomeBridge } from "@embed-engine/ui";

import { ConisAvatar } from "../sections/PriorityEngine/ConisAvatar";
import { CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG } from "./clientStudioWelcomeBridgeConfig";

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
    />
  );
}
