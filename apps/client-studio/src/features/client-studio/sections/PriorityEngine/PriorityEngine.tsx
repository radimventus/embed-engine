import { PILOT_SECTION_IDS, PILOT_TERMS } from '../../pilot/pilotVocabulary';
import { useDecisionContext } from '../../runtime/useDecisionContext';
import {
  PRIORITY_ENGINE_SECTION_BOTTOM_OFFSET_CLASS,
  PRIORITY_ENGINE_SECTION_HORIZONTAL_PADDING_CLASS,
} from './priority-engine-layout';
import { PriorityCards } from './PriorityCards';
import { PriorityChapterBridge } from './PriorityChapterBridge';
import { PriorityConversationPanel } from './PriorityConversationPanel';
import { PriorityConversationProvider } from './PriorityConversationProvider';
import { usePriorityExperience } from './PriorityExperienceProvider';
import { SectionHeader } from './SectionHeader';
import { SECTION_SURFACE_CLASS } from '../../section-surface';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';

/**
 * Priority Engine — Decision Discovery surface (CSCB-04 / PT-002 / PT-003).
 * Cards emit ChangePriority into Runtime.
 * Right panel + chapter bridge: Conis conversation UX (presentation only).
 */
export function PriorityEngine() {
  const {
    cards,
    categories,
    setImportance,
    toggleCard,
    minimumMet,
  } = usePriorityExperience();
  const { experience } = useDecisionSessionRuntime();
  const context = useDecisionContext();
  const terminalId = experience.context.decision.terminal.id;

  return (
    <PriorityConversationProvider>
      <section
        id={PILOT_SECTION_IDS.priority}
        tabIndex={-1}
        aria-label={`${PILOT_TERMS.priority} Experience`}
        data-testid="priority-experience"
        data-terminal-id={terminalId}
        data-minimum-met={minimumMet ? 'true' : 'false'}
        data-pt002-primary={context.focusPriority ?? ''}
        data-pt003-focus={context.focusPriority ?? ''}
        data-pt003-recommendations={context.recommendations.join('|')}
        className={`relative scroll-mt-header ${SECTION_SURFACE_CLASS} ${PRIORITY_ENGINE_SECTION_HORIZONTAL_PADDING_CLASS} ${PRIORITY_ENGINE_SECTION_BOTTOM_OFFSET_CLASS}`}
      >
        <SectionHeader />
        <div className="grid grid-cols-[52fr_48fr] items-start gap-section mobile:grid-cols-1">
          <PriorityCards
            cards={cards}
            categories={categories}
            setImportance={setImportance}
            toggleCard={toggleCard}
          />
          <PriorityConversationPanel />
        </div>
        <PriorityChapterBridge />
      </section>
    </PriorityConversationProvider>
  );
}
