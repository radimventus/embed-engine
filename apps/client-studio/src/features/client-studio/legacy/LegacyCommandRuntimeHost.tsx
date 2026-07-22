import { useEffect, useRef, useState } from 'react';
import type { CommandRuntime, SceneGraph } from '@embed-engine/core';
import {
  CANONICAL_DECISION_FLOW_START_ID,
  createDecisionRuntime,
  type GoNextCommand,
  type GoToDecisionCommand,
  type SetAnswerCommand,
  type StartDecisionFlowCommand,
} from '@embed-engine/decision';
import type { ReactExperienceModel } from '@embed-engine/model';

import { AppShell } from '../../../components/layout/AppShell';
import { ClientStudioPage } from '../ClientStudioPage';
import { ClientStudioSidebar } from '../ClientStudioSidebar';

const PLACEHOLDER_SCENE_GRAPH: SceneGraph = {
  start: 'start',
  scenes: {
    start: { id: 'start' },
  },
};

/**
 * LEGACY host — CommandRuntime + ReactExperienceModel (EX-04 quarantine).
 * Mounted only when `isLegacyCommandRuntimeEnabled()` is true.
 * Not part of the default Decision Session path (ED-DA-04).
 */
export function LegacyCommandRuntimeHost() {
  const runtimeRef = useRef<CommandRuntime | null>(null);
  const [experience, setExperience] = useState<ReactExperienceModel | null>(null);

  if (runtimeRef.current === null) {
    runtimeRef.current = createDecisionRuntime(PLACEHOLDER_SCENE_GRAPH);
  }

  const runtime = runtimeRef.current;

  useEffect(() => {
    const command: StartDecisionFlowCommand = {
      type: 'start-decision-flow',
      decisionId: CANONICAL_DECISION_FLOW_START_ID,
    };
    setExperience(runtime.dispatch(command));
  }, [runtime]);

  const handleSelectDecision = (decisionId: string) => {
    const command: GoToDecisionCommand = {
      type: 'go-to-decision',
      decisionId,
    };
    setExperience(runtime.dispatch(command));
  };

  const handleSelectChoice = (decisionId: string, choiceId: string) => {
    const answer: SetAnswerCommand = {
      type: 'set-answer',
      decisionId,
      value: choiceId,
    };
    runtime.dispatch(answer);

    const next: GoNextCommand = { type: 'go-next' };
    setExperience(runtime.dispatch(next));
  };

  const handleContinue = () => {
    const next: GoNextCommand = { type: 'go-next' };
    setExperience(runtime.dispatch(next));
  };

  return (
    <AppShell
      sidebar={
        <ClientStudioSidebar
          legacyExperience={experience}
          onSelectDecision={handleSelectDecision}
        />
      }
      showStatusBar={false}
      header={<></>}
    >
      {/*
        Legacy quarantine only: still mounts DecisionSessionRuntimeProvider
        via ClientStudioPage for modern sections. Default production path
        (ClientStudioApp) never enables this host — single Runtime bootstrap.
      */}
      <ClientStudioPage
        legacyExperience={experience}
        onLegacySelectChoice={handleSelectChoice}
        onLegacyContinue={handleContinue}
      />
    </AppShell>
  );
}
