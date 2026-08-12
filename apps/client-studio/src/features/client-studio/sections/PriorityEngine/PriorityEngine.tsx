import { PILOT_SECTION_IDS, PILOT_TERMS } from "../../pilot/pilotVocabulary";
import {
  JOURNEY_CTA_PRIMARY_CLASS,
  JOURNEY_CTA_SECONDARY_CLASS,
} from "../../foundation/journeyCta";
import { useDecisionContext } from "../../runtime/useDecisionContext";
import {
  PRIORITY_ENGINE_SECTION_BOTTOM_OFFSET_CLASS,
  PRIORITY_ENGINE_SECTION_HORIZONTAL_PADDING_CLASS,
} from "./priority-engine-layout";
import { PriorityCards } from "./PriorityCards";
import { PriorityChapterBridge } from "./PriorityChapterBridge";
import { PriorityConversationPanel } from "./PriorityConversationPanel";
import {
  PriorityConversationProvider,
  usePriorityConversationContext,
} from "./PriorityConversationProvider";
import { usePriorityExperience } from "./PriorityExperienceProvider";
import { PriorityRacioBridge } from "./PriorityRacioBridge";
import { SectionHeader } from "./SectionHeader";
import { SECTION_SURFACE_CLASS } from "../../section-surface";
import { useDecisionSessionRuntime } from "../../runtime/DecisionSessionRuntimeProvider";

type PriorityEngineProps = {
  readonly onBack: () => void;
  readonly onContinueToRacio: () => void;
  readonly showRacioBridge: boolean;
};

/**
 * Priority Engine — Decision Discovery surface (CSCB-04 / PT-002 / PT-003).
 * Cards emit ChangePriority into Runtime.
 * Right panel + chapter bridge: Conis conversation UX (presentation only).
 */
export function PriorityEngine(props: PriorityEngineProps) {
  return (
    <PriorityConversationProvider>
      <PriorityEngineContent {...props} />
    </PriorityConversationProvider>
  );
}

function PriorityEngineContent({
  onBack,
  onContinueToRacio,
  showRacioBridge,
}: PriorityEngineProps) {
  const { cards, categories, setImportance, toggleCard, minimumMet } =
    usePriorityExperience();
  const { experience } = useDecisionSessionRuntime();
  const context = useDecisionContext();
  const { phase } = usePriorityConversationContext();
  const terminalId = experience.context.decision.terminal.id;

  return (
    <>
      <section
        id={PILOT_SECTION_IDS.priority}
        tabIndex={-1}
        aria-label={`${PILOT_TERMS.priority} Experience`}
        data-testid="priority-experience"
        data-terminal-id={terminalId}
        data-minimum-met={minimumMet ? "true" : "false"}
        data-pt002-primary={context.focusPriority ?? ""}
        data-pt003-focus={context.focusPriority ?? ""}
        data-pt003-recommendations={context.recommendations.join("|")}
        className={`relative scroll-mt-header ${SECTION_SURFACE_CLASS} mobile:overflow-visible ${PRIORITY_ENGINE_SECTION_HORIZONTAL_PADDING_CLASS} ${PRIORITY_ENGINE_SECTION_BOTTOM_OFFSET_CLASS}`}
      >
        <SectionHeader />
        <div className="grid grid-cols-[52fr_48fr] items-start gap-section mobile:grid-cols-1 mobile:gap-5">
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
      {phase === "complete" ? (
        <div
          className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-5 px-section mobile:grid-cols-1 mobile:gap-3"
          data-testid="priority-racio-controls"
          data-racio-bridge-visible={showRacioBridge ? "true" : "false"}
        >
          <button
            type="button"
            onClick={onBack}
            className={`${JOURNEY_CTA_SECONDARY_CLASS} justify-self-start justify-start mobile:w-full`}
          >
            ← Zpět
          </button>
          {showRacioBridge ? (
            <div className="min-w-0 justify-self-center mobile:w-full">
              <PriorityRacioBridge onContinue={onContinueToRacio} />
            </div>
          ) : (
            <span aria-hidden="true" />
          )}
          <button
            type="button"
            onClick={onContinueToRacio}
            className={`${JOURNEY_CTA_PRIMARY_CLASS} justify-self-end mobile:w-full`}
          >
            Pokračovat →
          </button>
        </div>
      ) : null}
    </>
  );
}
