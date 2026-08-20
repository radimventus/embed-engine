import { useState } from "react";
import type { DecisionSessionRuntime } from "@embed-engine/runtime";

import { AppShell } from "../../components/layout/AppShell";
import { ClientStudioHeader } from "./ClientStudioHeader";
import { ClientStudioMobileNav } from "./ClientStudioMobileNav";
import { ClientStudioPage } from "./ClientStudioPage";
import { ClientStudioSidebar } from "./ClientStudioSidebar";
import { decisionJourneyScenes } from "./foundation/decisionJourney";
import { LegacyCommandRuntimeHost } from "./legacy/LegacyCommandRuntimeHost";
import { isLegacyCommandRuntimeEnabled } from "./legacy/isLegacyCommandRuntimeEnabled";

type ClientStudioAppProps = {
  /**
   * Optional Runtime injected by Embed Delivery Layer.
   * When omitted (standalone SPA), the Provider creates the Runtime once.
   */
  readonly runtime?: DecisionSessionRuntime;
  readonly initialLandingOffsetPx?: number;
};

/**
 * Composition root for Client Studio (ED-DA-04 / CSCB-01).
 *
 * Single AppShell entry for the default Decision Session path.
 * Legacy CommandRuntime is unreachable unless explicitly enabled.
 */
export function ClientStudioApp({
  runtime,
  initialLandingOffsetPx = 0,
}: ClientStudioAppProps = {}) {
  const [legacyEnabled] = useState(() => isLegacyCommandRuntimeEnabled());
  const [activeSceneId, setActiveSceneId] = useState<string | null>(
    () => decisionJourneyScenes()[0]?.id ?? null,
  );
  const [visibleSceneIds, setVisibleSceneIds] = useState<readonly string[]>(
    () =>
      decisionJourneyScenes()
        .slice(0, 1)
        .map((scene) => scene.id),
  );

  if (legacyEnabled) {
    return <LegacyCommandRuntimeHost />;
  }

  return (
    <>
      <AppShell
        sidebar={
          <ClientStudioSidebar
            activeSceneId={activeSceneId}
            visibleSceneIds={visibleSceneIds}
          />
        }
        header={<ClientStudioHeader />}
        showStatusBar={false}
      >
        <ClientStudioPage
          runtime={runtime}
          initialLandingOffsetPx={initialLandingOffsetPx}
          onActiveSceneChange={setActiveSceneId}
          onVisibleSceneIdsChange={setVisibleSceneIds}
        />
      </AppShell>
      <ClientStudioMobileNav visibleSceneIds={visibleSceneIds} />
    </>
  );
}
