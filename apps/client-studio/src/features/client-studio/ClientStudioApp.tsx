import { useEffect, useRef, useState } from 'react';
import type { Runtime, SceneGraph } from '@embed-engine/core';
import {
  CANONICAL_DECISION_FLOW_START_ID,
  createDecisionRuntime,
  type GoNextCommand,
  type GoToDecisionCommand,
  type SetAnswerCommand,
  type StartDecisionFlowCommand,
} from '@embed-engine/decision';
import type { ReactExperienceModel } from '@embed-engine/model';

import { AppShell } from '../../components/layout/AppShell';
import { ClientStudioPage } from './ClientStudioPage';
import { ClientStudioSidebar } from './ClientStudioSidebar';

const PLACEHOLDER_SCENE_GRAPH: SceneGraph = {
  start: 'start',
  scenes: {
    start: { id: 'start' },
  },
};

/**
 * Composition root for Client Studio Runtime + Experience rendering.
 * Navigation state lives only in Runtime; React holds the latest ReactExperienceModel.
 */
export function ClientStudioApp() {
  const runtimeRef = useRef<Runtime | null>(null);
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
          experience={experience}
          onSelectDecision={handleSelectDecision}
        />
      }
      showStatusBar={false}
      header={<></>}
    >
      <ClientStudioPage
        runtime={runtime}
        experience={experience}
        onSelectChoice={handleSelectChoice}
        onContinue={handleContinue}
      />
    </AppShell>
  );
}
