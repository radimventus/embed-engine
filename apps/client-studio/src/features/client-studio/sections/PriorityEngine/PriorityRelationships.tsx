import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  evidenceBoundNarrative,
  HouseRelationshipOutputCache,
  type HouseRelationshipEvidenceBundle,
  type HouseRelationshipOutput,
  type HouseKnowledgeAtom,
} from '@embed-engine/object-house';

import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { useDecisionContext } from '../../runtime/useDecisionContext';
import { navigateToJourneySection } from '../../foundation/journeyNavigation';
import { PILOT_SECTION_IDS } from '../../pilot/pilotVocabulary';
import { openDecisionTopicInChat } from '../AIAdvisor/decisionTopicChatBridge';
import { createRelationshipNarrativeGenerator } from './relationshipNarrativeGenerator';
import { BUNGALOV_4KK_FIT_CONTRACT } from './priorityFitContract';
import type { PriorityFitContractEntry } from './priorityFitContract';

const outputCache = new HouseRelationshipOutputCache();

const SECTION_LABELS = {
  connection: 'Souvislost',
  houseSolution: 'Jak je to řešené u tohoto domu',
  facts: 'Ověřená fakta',
  relationship: 'Co spolu souvisí',
  remember: 'Na co nezapomenout',
  conclusion: 'Závěr',
} as const;

function renderEmphasizedFact(value: string) {
  const clean = value.replace(/^[-*•]\s*/, '').trim();
  const wholeBold = /^\*\*([^*]+)\*\*$/.exec(clean);
  const normalized = wholeBold?.[1] ?? clean;
  if (!normalized.includes('**')) {
    const words = normalized.split(/\s+/);
    const emphasisEnd = Math.min(words.length, 9);
    return <>
      <span>{words.slice(0, 2).join(' ')}{words.length > 2 ? ' ' : ''}</span>
      {words.length > 2 ? <strong>{words.slice(2, emphasisEnd).join(' ')}</strong> : null}
      {words.length > emphasisEnd ? <span>{` ${words.slice(emphasisEnd).join(' ')}`}</span> : null}
    </>;
  }
  const parts = normalized.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => part.startsWith('**') && part.endsWith('**')
    ? <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
    : <span key={`${part}-${index}`}>{part.replace(/\*+/g, '')}</span>);
}

function RelationshipDialog({
  bundle,
  generator,
  onClose,
  topicEntry,
  topicFacts = [],
}: {
  readonly bundle: HouseRelationshipEvidenceBundle;
  readonly generator: ReturnType<typeof createRelationshipNarrativeGenerator>;
  readonly onClose: () => void;
  readonly topicEntry?: PriorityFitContractEntry;
  readonly topicFacts?: readonly HouseKnowledgeAtom[];
}) {
  const [output, setOutput] = useState<HouseRelationshipOutput | null>(null);
  const [failed, setFailed] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const askConis = () => {
    openDecisionTopicInChat({ houseId: bundle.houseId, topicTitle: topicEntry?.answer ?? bundle.title });
    onClose();
    navigateToJourneySection(PILOT_SECTION_IDS.aiAdvisor);
    window.setTimeout(() => {
      document.querySelector<HTMLInputElement>(`#${PILOT_SECTION_IDS.aiAdvisor} input`)?.focus();
    }, 450);
  };

  useEffect(() => {
    let active = true;
    const { primaryFact: _primary, relatedFact: _related, supportingFacts: _supporting, ...evidence } = bundle;
    if (topicEntry) {
      setOutput(null);
    } else {
      setOutput({ ...evidence, narrative: evidenceBoundNarrative(bundle) });
    }
    setFailed(false);
    if (!topicEntry) {
      void outputCache.getOrGenerate(bundle, generator).then(
        (value) => { if (active) setOutput(value); },
        () => { /* Grounded synchronous fallback remains visible. */ },
      );
    }
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      active = false;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [bundle, generator, onClose, topicEntry]);

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto bg-[#001930]/45 px-5 pb-5 pt-[12vh] mobile:px-3 mobile:pb-3 mobile:pt-[8vh]"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="priority-relationship-title"
        className="mb-5 w-full max-w-[980px] rounded-[14px] bg-white px-12 py-10 text-embed-foreground-primary shadow-2xl tabletMin:px-8 tabletMin:py-8 mobile:p-5"
        data-testid="priority-relationship-dialog"
        data-relationship-kind={bundle.kind}
      >
        <header className="flex items-start justify-between gap-8 border-b border-solid border-[#E3E3E3] pb-7 mobile:gap-4 mobile:pb-5">
          <div className="max-w-[820px]">
            <p className="m-0 text-[12px] font-bold uppercase tracking-[0.08em] text-[#B8922D]">
              {bundle.kind === 'CONNECTED' ? 'Souvisí s vašimi prioritami' : 'Co by vám nemělo uniknout'}
            </p>
            <h3 id="priority-relationship-title" className="mb-0 mt-2 text-[32px] font-bold uppercase leading-[1.15] tracking-[-0.02em] tabletMin:text-[28px] mobile:text-[24px]">
              {bundle.title}
            </h3>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Zavřít"
            className="h-10 w-10 shrink-0 rounded-full border border-solid border-[#D9D4CC] bg-white text-[24px] leading-none text-[#001930] transition-colors hover:border-[#B8922D] hover:bg-[#F7F6F4]"
          >
            ×
          </button>
        </header>
        {topicEntry ? (
          <div className="mt-8 text-[16px] leading-[1.65] mobile:mt-6 mobile:text-[15px]" data-testid="priority-topic-content">
            {topicFacts.length > 0 ? (
              <>
                <section className="max-w-[800px]">
                  <h4 className="m-0 text-[12px] font-bold uppercase tracking-[0.08em] text-[#B8922D]">{SECTION_LABELS.houseSolution}</h4>
                  <p className="mb-0 mt-2 text-[19px] font-medium leading-[1.5] mobile:text-[17px]">{topicEntry.why}</p>
                </section>
                <section className="mt-8 rounded-[10px] bg-[#F7F6F4] px-7 py-6 mobile:px-5 mobile:py-5">
                  <h4 className="m-0 text-[17px] font-bold uppercase leading-[1.35]">{SECTION_LABELS.facts}</h4>
                  <ul className="mb-0 mt-3 flex list-none flex-col gap-2 p-0">
                    {topicFacts.map((fact) => <li key={fact.id} className="relative pl-4 before:absolute before:left-0 before:top-[0.72em] before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-[#B8922D]">{fact.safeInterpretation ?? fact.statement}</li>)}
                  </ul>
                </section>
              </>
            ) : (
              <section className="rounded-[10px] bg-[#F7F6F4] px-7 py-6 mobile:px-5 mobile:py-5" data-testid="priority-topic-knowledge-gap">
                <h4 className="m-0 text-[17px] font-bold uppercase text-[#8C6B24]">OVĚŘIT S PRODEJCEM</h4>
                <p className="mb-0 mt-3">{topicEntry.why}</p>
                {topicEntry.missingEvidence ? <p className="mb-0 mt-2 text-embed-foreground-primary/70">Je potřeba doplnit: {topicEntry.missingEvidence}</p> : null}
              </section>
            )}
            <button type="button" onClick={askConis} className="mt-7 rounded-[8px] border-0 bg-[#B8922D] px-5 py-3 text-[15px] font-bold text-[#001930]" data-testid="priority-relationship-ask-conis">Zeptat se CONIS</button>
          </div>
        ) : null}
        {!topicEntry && output === null && !failed ? (
          <div className="mt-8" role="status">
            <p className="m-0 text-[18px] font-bold leading-[1.5] text-[#001930]">
              Díváme se, co pro vás znamená „{bundle.title}“
            </p>
            <p className="mb-0 mt-2 text-[15px] leading-[1.6] text-embed-foreground-primary/70">
              Propojujeme vlastnosti tohoto domu s tím, co je pro vaše rozhodnutí důležité.
            </p>
            <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#F7F6F4] px-4 py-2.5 text-[14px] font-medium text-[#001930]">
              <span
                className="h-5 w-5 animate-spin rounded-full border-[3px] border-solid border-[#D9CDAF] border-t-[#B8922D]"
                aria-hidden="true"
              />
              <span>Načítám</span>
            </div>
          </div>
        ) : null}
        {!topicEntry && failed ? (
          <p className="mt-6" role="alert">Pro tuto souvislost se nepodařilo připravit doložený výstup.</p>
        ) : null}
        {!topicEntry && output !== null ? (
          <div className="mt-8 text-[16px] leading-[1.65] mobile:mt-6 mobile:text-[15px]" data-testid="priority-relationship-content">
            <section className="max-w-[800px]">
              <h4 className="m-0 text-[12px] font-bold uppercase tracking-[0.08em] text-[#B8922D]">{SECTION_LABELS.connection}</h4>
              <p className="mb-0 mt-2 text-[19px] font-medium leading-[1.5] mobile:text-[17px]">{output.narrative.connection}</p>
            </section>
            <section className="mt-8 rounded-[10px] bg-[#F7F6F4] px-7 py-6 mobile:mt-6 mobile:px-5 mobile:py-5">
              <h4 className="m-0 text-[17px] font-bold uppercase leading-[1.35]">{SECTION_LABELS.houseSolution}</h4>
              <p className="mb-0 mt-3 max-w-[840px]">{output.narrative.houseSolution}</p>
            </section>
            <div className="mt-7 grid grid-cols-2 gap-8 tabletMin:gap-6 mobile:grid-cols-1 mobile:gap-5">
              <section>
                <h4 className="m-0 text-[14px] font-bold uppercase tracking-[0.02em]">{SECTION_LABELS.relationship}</h4>
                <p className="mb-0 mt-2">{output.narrative.relationship}</p>
              </section>
              <section className="border-l border-solid border-[#D9CDAF] pl-8 tabletMin:pl-6 mobile:border-l-0 mobile:border-t mobile:pl-0 mobile:pt-5">
                <h4 className="m-0 text-[14px] font-bold uppercase tracking-[0.02em]">{SECTION_LABELS.facts}</h4>
                {output.narrative.bullets?.length ? (
                  <ul className="mb-0 mt-3 flex list-none flex-col gap-2 p-0">
                    {output.narrative.bullets.map((bullet) => (
                      <li key={bullet} className="relative pl-4 before:absolute before:left-0 before:top-[0.72em] before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-[#B8922D]">
                        {renderEmphasizedFact(bullet)}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <section className="mt-6 border-t border-solid border-[#D9CDAF] pt-5">
                  <h4 className="m-0 text-[14px] font-bold uppercase tracking-[0.02em]">{SECTION_LABELS.remember}</h4>
                  <p className="mb-0 mt-2">{output.narrative.remember}</p>
                </section>
              </section>
            </div>
            <section className="mt-8 border-t-2 border-solid border-[#B8922D] pt-5">
              <h4 className="m-0 text-[12px] font-bold uppercase tracking-[0.08em] text-[#B8922D]">{SECTION_LABELS.conclusion}</h4>
              <p className="mb-0 mt-2 text-[18px] font-bold leading-[1.5]">{output.narrative.conclusion}</p>
            </section>
            <button type="button" onClick={askConis}
              className="mt-7 rounded-[8px] border-0 bg-[#B8922D] px-5 py-3 text-[15px] font-bold text-[#001930]"
              data-testid="priority-relationship-ask-conis">
              Zeptat se CONIS
            </button>
          </div>
        ) : null}
      </section>
    </div>,
    document.body,
  );
}

export function PriorityRelationships({
  limit,
  excludeTitles = [],
  priorityV2 = false,
}: {
  readonly limit?: number;
  readonly excludeTitles?: readonly string[];
  readonly priorityV2?: boolean;
} = {}) {
  const { relationshipEvidence, chatHouseKnowledge } = useDecisionSessionRuntime();
  const decision = useDecisionContext();
  const [active, setActive] = useState<HouseRelationshipEvidenceBundle | null>(null);
  const generator = useMemo(
    () => createRelationshipNarrativeGenerator(decision),
    [decision],
  );
  useEffect(() => {
    if (active !== null && !active.outputId.startsWith('priority-v2:') && !relationshipEvidence.some((item) => item.outputId === active.outputId && item.houseId === active.houseId)) {
      setActive(null);
    }
  }, [active, relationshipEvidence]);
  if (relationshipEvidence.length === 0) return null;

  const excluded = new Set(excludeTitles.map((title) => title.trim().toLocaleLowerCase('cs')));
  const preferred = relationshipEvidence.filter(
    (item) => !excluded.has(item.title.trim().toLocaleLowerCase('cs')),
  );
  const fallback = relationshipEvidence.filter(
    (item) => excluded.has(item.title.trim().toLocaleLowerCase('cs')),
  );
  const approvedTopicIds = [
    'materials-technology', 'customization', 'smart-control', 'build-speed',
    'fresh-air', 'access-parking', 'light-view', 'flexibility', 'execution-detail',
    'family-space', 'privacy', 'garden-terrace', 'heating-cooling', 'orientation',
    'timeless', 'character', 'materials', 'low-cost', 'independence', 'price-scope',
    'durability-warranty', 'low-effort', 'full-service', 'self-service',
  ];
  const topicEntries = approvedTopicIds
    .map((answerId) => BUNGALOV_4KK_FIT_CONTRACT.find((entry) => entry.answerId === answerId))
    .filter((entry): entry is (typeof BUNGALOV_4KK_FIT_CONTRACT)[number] =>
      entry !== undefined && !excluded.has(entry.answer.trim().toLocaleLowerCase('cs')),
    );
  const projected = topicEntries.flatMap((entry, index) => {
    const source = relationshipEvidence.find((bundle) =>
      bundle.evidence.some((evidence) => entry.evidenceFactIds.includes(evidence.factId)),
    ) ?? relationshipEvidence[index % relationshipEvidence.length];
    return source ? [{ ...source, outputId: `priority-v2:${entry.answerId}`, title: entry.answer }] : [];
  });
  const visible = (priorityV2 ? projected : [...preferred, ...fallback]).slice(0, limit);
  return (
    <section
      className="w-full"
      data-testid="priority-relationships"
      aria-label="Kontextové souvislosti priorit"
    >
      <div className="grid grid-cols-6 gap-3 tabletMin:grid-cols-3 mobile:grid-cols-1 mobile:gap-2">
        {visible.map((bundle) => (
          <button key={bundle.outputId} type="button" onClick={() => setActive(bundle)}
            className="min-h-11 rounded-[8px] border-0 bg-[#001930] px-3 py-2.5 text-[15px] font-normal leading-[1.3] text-white transition-colors hover:bg-[#B8922D] hover:text-[#001930]"
            data-testid={bundle.kind === 'CONNECTED'
              ? 'priority-relationship-connected'
              : 'priority-relationship-blindspot'}>
            {bundle.title}
          </button>
        ))}
      </div>
      {active !== null ? <RelationshipDialog
        bundle={active}
        generator={generator}
        onClose={() => setActive(null)}
        topicEntry={active.outputId.startsWith('priority-v2:')
          ? BUNGALOV_4KK_FIT_CONTRACT.find((entry) => `priority-v2:${entry.answerId}` === active.outputId)
          : undefined}
        topicFacts={active.outputId.startsWith('priority-v2:')
          ? (chatHouseKnowledge?.facts ?? []).filter((fact) => {
              const topic = BUNGALOV_4KK_FIT_CONTRACT.find((entry) => `priority-v2:${entry.answerId}` === active.outputId);
              return topic?.evidenceFactIds.includes(fact.id) ?? false;
            })
          : []}
      /> : null}
    </section>
  );
}
