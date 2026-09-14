import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  HouseRelationshipOutputCache,
  type HouseRelationshipEvidenceBundle,
  type HouseRelationshipOutput,
} from '@embed-engine/object-house';

import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { useDecisionContext } from '../../runtime/useDecisionContext';
import { createRelationshipNarrativeGenerator } from './relationshipNarrativeGenerator';

const outputCache = new HouseRelationshipOutputCache();

const SECTION_LABELS = {
  connection: 'Souvislost',
  houseSolution: 'Jak je to řešené u tohoto domu',
  relationship: 'Co spolu souvisí',
  remember: 'Na co nezapomenout',
  conclusion: 'Závěr',
} as const;

function RelationshipDialog({
  bundle,
  generator,
  onClose,
}: {
  readonly bundle: HouseRelationshipEvidenceBundle;
  readonly generator: ReturnType<typeof createRelationshipNarrativeGenerator>;
  readonly onClose: () => void;
}) {
  const [output, setOutput] = useState<HouseRelationshipOutput | null>(null);
  const [failed, setFailed] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let active = true;
    setOutput(null);
    setFailed(false);
    void outputCache.getOrGenerate(bundle, generator).then(
      (value) => { if (active) setOutput(value); },
      () => { if (active) setFailed(true); },
    );
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      active = false;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [bundle, generator, onClose]);

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
        {output === null && !failed ? (
          <p className="mt-6" role="status">Připravuji doloženou souvislost…</p>
        ) : null}
        {failed ? (
          <p className="mt-6" role="alert">Pro tuto souvislost se nepodařilo připravit doložený výstup.</p>
        ) : null}
        {output !== null ? (
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
                <h4 className="m-0 text-[14px] font-bold uppercase tracking-[0.02em]">{SECTION_LABELS.remember}</h4>
                <p className="mb-0 mt-2">{output.narrative.remember}</p>
              </section>
            </div>
            {output.narrative.bullets?.length ? (
              <ul className="mb-0 mt-6 list-disc pl-6">
                {output.narrative.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            ) : null}
            <section className="mt-8 border-t-2 border-solid border-[#B8922D] pt-5">
              <h4 className="m-0 text-[12px] font-bold uppercase tracking-[0.08em] text-[#B8922D]">{SECTION_LABELS.conclusion}</h4>
              <p className="mb-0 mt-2 text-[18px] font-bold leading-[1.5]">{output.narrative.conclusion}</p>
            </section>
          </div>
        ) : null}
      </section>
    </div>,
    document.body,
  );
}

export function PriorityRelationships() {
  const { relationshipEvidence } = useDecisionSessionRuntime();
  const decision = useDecisionContext();
  const [active, setActive] = useState<HouseRelationshipEvidenceBundle | null>(null);
  const generator = useMemo(
    () => createRelationshipNarrativeGenerator(decision),
    [decision],
  );
  if (relationshipEvidence.length === 0) return null;

  const connected = relationshipEvidence.filter((item) => item.kind === 'CONNECTED');
  const blindspots = relationshipEvidence.filter((item) => item.kind === 'BLINDSPOT');
  return (
    <section
      className="w-full"
      data-testid="priority-relationships"
      aria-label="Kontextové souvislosti priorit"
    >
      <div className="grid grid-cols-3 gap-3 mobile:grid-cols-1 mobile:gap-2">
        {connected.map((bundle) => (
          <button key={bundle.outputId} type="button" onClick={() => setActive(bundle)}
            className="min-h-11 rounded-[8px] border-0 bg-[#001930] px-3 py-2.5 text-[13px] font-medium leading-[1.3] text-white transition-colors hover:bg-[#B8922D] hover:text-[#001930]"
            data-testid="priority-relationship-connected">
            {bundle.title}
          </button>
        ))}
        {blindspots.map((bundle) => (
          <button key={bundle.outputId} type="button" onClick={() => setActive(bundle)}
            className="min-h-11 rounded-[8px] border-0 bg-[#001930] px-3 py-2.5 text-[13px] font-medium leading-[1.3] text-white transition-colors hover:bg-[#B8922D] hover:text-[#001930]"
            data-testid="priority-relationship-blindspot">
            {bundle.title}
          </button>
        ))}
      </div>
      {active !== null ? <RelationshipDialog bundle={active} generator={generator} onClose={() => setActive(null)} /> : null}
    </section>
  );
}
