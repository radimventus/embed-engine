import { useEffect, useMemo, useRef, useState } from 'react';

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

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[#001930]/45 p-5"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="priority-relationship-title"
        className="max-h-[88vh] w-full max-w-[760px] overflow-y-auto rounded-[12px] bg-white p-8 text-embed-foreground-primary shadow-2xl mobile:p-5"
        data-testid="priority-relationship-dialog"
        data-relationship-kind={bundle.kind}
      >
        <header className="flex items-start justify-between gap-5">
          <div>
            <p className="m-0 text-[12px] font-bold uppercase tracking-[0.08em] text-[#B8922D]">
              {bundle.kind === 'CONNECTED' ? 'Souvisí s vašimi prioritami' : 'Co by vám nemělo uniknout'}
            </p>
            <h3 id="priority-relationship-title" className="mb-0 mt-2 text-[24px] font-bold uppercase leading-tight">
              {bundle.title}
            </h3>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Zavřít"
            className="h-9 w-9 shrink-0 rounded-full border border-solid border-[#D9D4CC] bg-white text-[22px] leading-none"
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
          <div className="mt-6 grid gap-5 text-[15px] leading-[1.6]" data-testid="priority-relationship-content">
            {(Object.keys(SECTION_LABELS) as Array<keyof typeof SECTION_LABELS>).map((key) => (
              <section key={key}>
                <h4 className="m-0 text-[15px] font-bold uppercase">{SECTION_LABELS[key]}</h4>
                <p className="mb-0 mt-1">{output.narrative[key]}</p>
              </section>
            ))}
            {output.narrative.bullets?.length ? (
              <ul className="m-0 list-disc pl-6">
                {output.narrative.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
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
    <section className="grid gap-4" data-testid="priority-relationships">
      <div>
        <h3 className="m-0 text-[15px] font-bold uppercase">Souvisí s tím, co je pro vás důležité</h3>
        <div className="mt-3 grid grid-cols-3 gap-3 mobile:grid-cols-1">
          {connected.map((bundle) => (
            <button key={bundle.outputId} type="button" onClick={() => setActive(bundle)}
              className="rounded-[7px] border-0 bg-[#001930] px-4 py-3 text-[14px] font-bold text-white"
              data-testid="priority-relationship-connected">
              {bundle.title}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="m-0 text-[15px] font-bold uppercase">Co by vám nemělo uniknout</h3>
        <div className="mt-3 grid grid-cols-3 gap-3 mobile:grid-cols-1">
          {blindspots.map((bundle) => (
            <button key={bundle.outputId} type="button" onClick={() => setActive(bundle)}
              className="rounded-[7px] border border-solid border-[#B8922D] bg-[#F7F6F4] px-4 py-3 text-[14px] font-bold text-[#001930]"
              data-testid="priority-relationship-blindspot">
              {bundle.title}
            </button>
          ))}
        </div>
      </div>
      {active !== null ? <RelationshipDialog bundle={active} generator={generator} onClose={() => setActive(null)} /> : null}
    </section>
  );
}
