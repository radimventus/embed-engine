import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  HOUSEHOLD_PROFILE_FACT_KEY,
  isHouseholdProfile,
  recommendPromptFor,
  type HouseholdProfile,
} from '@embed-engine/object-house';

import {
  applyQuestionOpened,
  useApplyCognitiveSignal,
} from '../../cognitive/CognitiveRuntimeContext';
import { useExperienceSession } from '../../cognitive/ExperienceBindingProvider';
import { useActiveDecisionMove } from '../../cognitive/DecisionStoryProvider';
import { useWalkthrough } from '../../../walkthrough';
import { PILOT_TERMS } from '../../pilot/pilotVocabulary';

export type TerminalPhase =
  | 'loading'
  | 'idle'
  | 'move'
  | 'household'
  | 'outcome'
  | 'error';

export type TerminalAction = {
  readonly label: string;
  readonly run: () => void;
  readonly disabled?: boolean;
};

/**
 * Decision Terminal view-model from Session snapshot + Story (S-004 / S-005).
 * CTA labels and whyNow from Behavior Pack when present — no DecisionState coupling.
 */
export function useDecisionTerminal() {
  const session = useExperienceSession();
  const applySignal = useApplyCognitiveSignal();
  const walkthrough = useWalkthrough();
  const { story, definition, outcome, activeMoveId } = useActiveDecisionMove();
  const interpretation = session.interpretation;

  const pendingRef = useRef(false);
  const [pending, setPending] = useState(false);
  const [householdDraft, setHouseholdDraft] = useState<HouseholdProfile | null>(
    null,
  );

  const sessionProfile = useMemo(() => {
    const value = session.facts[HOUSEHOLD_PROFILE_FACT_KEY];
    return isHouseholdProfile(value) ? value : null;
  }, [session.facts]);

  useEffect(() => {
    pendingRef.current = false;
    setPending(false);
  }, [activeMoveId, outcome?.status, story?.id, session.version]);

  useEffect(() => {
    if (activeMoveId === 'layout.ask-household-shape') {
      setHouseholdDraft(sessionProfile);
      return;
    }
    if (story === null || outcome !== null) {
      setHouseholdDraft(null);
    }
  }, [activeMoveId, outcome, sessionProfile, story]);

  const withTransition = useCallback((action: () => void) => {
    if (pendingRef.current) {
      return;
    }
    pendingRef.current = true;
    setPending(true);
    action();
  }, []);

  const clearPending = useCallback(() => {
    pendingRef.current = false;
    setPending(false);
  }, []);

  const phase: TerminalPhase = useMemo(() => {
    if (session.status === 'idle' || session.status === 'loading') {
      return 'loading';
    }
    if (session.status === 'destroyed') {
      return 'error';
    }
    if (outcome && story) {
      return 'outcome';
    }
    if (story === null || activeMoveId === null) {
      return 'idle';
    }
    if (definition === null) {
      return 'error';
    }
    if (activeMoveId === 'layout.ask-household-shape') {
      return 'household';
    }
    return 'move';
  }, [activeMoveId, definition, outcome, session.status, story]);

  const completedCount =
    story?.slots.filter((slot) => slot.status === 'completed').length ?? 0;
  const totalMoves = story?.slots.length ?? 0;

  const startDialogue = useCallback(() => {
    withTransition(() => {
      applyQuestionOpened(applySignal, 'layout', 'Priority focus: Dispozice');
    });
  }, [applySignal, withTransition]);

  const submitHousehold = useCallback(() => {
    if (householdDraft === null || activeMoveId === null) {
      return;
    }
    withTransition(() => {
      applyQuestionOpened(
        applySignal,
        activeMoveId,
        `Household: ${householdDraft}`,
        { householdProfile: householdDraft },
      );
    });
  }, [activeMoveId, applySignal, householdDraft, withTransition]);

  const acknowledgeMove = useCallback(
    (moveId: string, purpose: string) => {
      withTransition(() => {
        applyQuestionOpened(applySignal, moveId, `Move acknowledged: ${purpose}`);
      });
    },
    [applySignal, withTransition],
  );

  const openRoom = useCallback(
    (roomId: string) => {
      withTransition(() => {
        walkthrough.selectRoom(roomId);
      });
    },
    [walkthrough, withTransition],
  );

  const commitLayout = useCallback(
    (commitment: 'continue-with-layout' | 'layout-does-not-fit') => {
      applyQuestionOpened(
        applySignal,
        `layout.commitment.${commitment}`,
        `Layout commitment: ${commitment}`,
        { layoutCommitment: commitment },
      );
    },
    [applySignal],
  );

  const moveBody =
    activeMoveId === 'layout.recommend-disposition-fit'
      ? recommendPromptFor(sessionProfile ?? undefined)
      : definition?.advisorPrompt;

  const packCta = definition?.ctaLabel ?? 'Continue';
  const pendingLabel = 'Updating…';

  const moveAction: TerminalAction | null = useMemo(() => {
    if (phase !== 'move' || activeMoveId === null || definition === null) {
      return null;
    }

    if (activeMoveId === 'layout.discover-day-zone') {
      return {
        label: pending ? pendingLabel : (definition.ctaLabel ?? 'Open living room'),
        run: () => openRoom('living-room'),
      };
    }
    if (activeMoveId === 'layout.discover-night-zone') {
      return {
        label: pending ? pendingLabel : (definition.ctaLabel ?? 'Open bedroom'),
        run: () => openRoom('bedroom'),
      };
    }
    return {
      label: pending ? pendingLabel : packCta,
      run: () => acknowledgeMove(activeMoveId, definition.purpose),
    };
  }, [
    acknowledgeMove,
    activeMoveId,
    definition,
    openRoom,
    packCta,
    pending,
    phase,
  ]);

  return {
    phase,
    pending,
    clearPending,
    withTransition,
    story,
    definition,
    outcome,
    activeMoveId,
    completedCount,
    totalMoves,
    sessionProfile,
    householdDraft,
    setHouseholdDraft,
    interpretation,
    startDialogue,
    submitHousehold,
    commitLayout,
    moveBody,
    moveAction,
    whyNow: definition?.whyNow,
    terms: PILOT_TERMS,
  };
}
