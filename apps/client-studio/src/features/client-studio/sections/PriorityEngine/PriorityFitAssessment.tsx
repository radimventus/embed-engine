import { useMemo } from 'react';

import { PRIORITY_BRIDGE_ANCHOR_ID } from '../../foundation/scrollToSection';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { usePriorityConversationContext } from './PriorityConversationProvider';
import { PriorityRelationships } from './PriorityRelationships';
import {
  priorityFitEntry,
  type PriorityFitContractEntry,
} from './priorityFitContract';

const heading =
  'm-0 text-[12px] font-extrabold uppercase tracking-[0.06em] text-embed-brand-navy';
const panel = 'rounded-[8px] border border-solid border-[#DEDED9] bg-white p-4';

const CONIS_CHECK_CANDIDATES = [
  ['plot', 'orientation'],
  ['plot', 'garden-terrace'],
  ['comfort', 'fresh-air'],
  ['comfort', 'heating-cooling'],
  ['quality', 'execution-detail'],
  ['realization', 'price-scope'],
] as const;

function usefulness(entry: PriorityFitContractEntry): number {
  return entry.resultType === 'rating'
    ? 4
    : entry.resultType === 'verify'
      ? 3
      : entry.resultType === 'information'
        ? 2
        : 1;
}

function mediaExplanation(entry: PriorityFitContractEntry): string {
  const copy: Readonly<Record<string, string>> = {
    'family-space': 'Všimněte si přímého kontaktu kuchyně, jídelny a obývací části.',
    privacy: 'Všimněte si oddělení klidové části od společného prostoru domu.',
    'garden-terrace': 'Terasa navazuje na obytnou část; její fungování rozhodne osazení na pozemku.',
    'fresh-air': 'Tento prostor ukazuje místnost, kde řízené větrání průběžně obnovuje vzduch.',
    'heating-cooling': 'Všimněte si prostoru, jehož komfort podporuje vytápění i chlazení.',
    'execution-detail': 'Na provedení detailů se projeví kontrola konstrukcí a instalací.',
  };
  return copy[entry.answerId] ?? entry.why;
}

function resultLabel(entry: PriorityFitContractEntry): string {
  if (entry.resultType === 'rating')
    return `${'★'.repeat(entry.rating ?? 0)}${'☆'.repeat(5 - (entry.rating ?? 0))}`;
  if (entry.resultType === 'verify') return 'PROVĚŘIT';
  if (entry.resultType === 'information') return 'INFORMACE';
  return 'OVĚŘIT S PRODEJCEM';
}

export function PriorityFitAssessment() {
  const { answers, tags, continueWithPlotCheck, continueWithPlotFind, askConis } =
    usePriorityConversationContext();
  const { experience, chatHouseKnowledge } = useDecisionSessionRuntime();
  const entries = useMemo(
    () =>
      Object.entries(answers).flatMap(([priorityId, answerIds]) =>
        answerIds.flatMap((answerId) => {
          const entry = priorityFitEntry(priorityId, answerId);
          return entry === null ? [] : [entry];
        }),
      ),
    [answers],
  );
  const factIds = useMemo(
    () => new Set(chatHouseKnowledge?.facts.map((fact) => fact.id) ?? []),
    [chatHouseKnowledge],
  );
  const grounded = useMemo(
    () =>
      entries.map((entry) => ({
        ...entry,
        grounded:
          chatHouseKnowledge?.canonicalHouseId === 'modern-4kk' &&
          entry.evidenceFactIds.every((id) => factIds.has(id)),
      })),
    [chatHouseKnowledge?.canonicalHouseId, entries, factIds],
  );
  const intensityByPriority = useMemo(
    () => new Map(tags.map((tag) => [tag.id, tag.percent])),
    [tags],
  );
  const personalResults = useMemo(() => {
    const countByPriority = new Map<string, number>();
    return [...grounded]
      .sort((left, right) =>
        (intensityByPriority.get(right.priorityId) ?? 0) -
          (intensityByPriority.get(left.priorityId) ?? 0) ||
        usefulness(right) - usefulness(left),
      )
      .filter((entry) => {
        const count = countByPriority.get(entry.priorityId) ?? 0;
        if (count >= 2) return false;
        countByPriority.set(entry.priorityId, count + 1);
        return true;
      })
      .slice(0, 3);
  }, [grounded, intensityByPriority]);
  const conisChecks = useMemo(() => {
    const usedPriorities = new Set(personalResults.map((entry) => entry.priorityId));
    const usedAnswers = new Set(personalResults.map((entry) => entry.answerId));
    const candidates = CONIS_CHECK_CANDIDATES.flatMap(([priorityId, answerId]) => {
      const entry = priorityFitEntry(priorityId, answerId);
      return entry === null || usedAnswers.has(entry.answerId)
        ? []
        : [{
            ...entry,
            grounded:
              chatHouseKnowledge?.canonicalHouseId === 'modern-4kk' &&
              entry.evidenceFactIds.every((id) => factIds.has(id)),
          }];
    });
    return [
      ...candidates.filter((entry) => !usedPriorities.has(entry.priorityId)),
      ...candidates.filter((entry) => usedPriorities.has(entry.priorityId)),
    ].slice(0, 3);
  }, [chatHouseKnowledge?.canonicalHouseId, factIds, personalResults]);
  const resultRows = useMemo(
    () => [...personalResults, ...conisChecks],
    [conisChecks, personalResults],
  );
  const media = useMemo(() => {
    const used = new Set<string>();
    return resultRows
      .flatMap((entry) => {
        const asset = experience.context.roomMedia.gallery.find(
          (item) => item.roomId === entry.roomId && !used.has(item.url),
        );
        if (!asset) return [];
        used.add(asset.url);
        return [{ asset, entry }];
      })
      .slice(0, 3);
  }, [experience.context.roomMedia.gallery, resultRows]);
  const strongest = personalResults.find(
    (entry) =>
      entry.resultType === 'rating' &&
      entry.grounded &&
      (entry.rating ?? 0) >= 4,
  );
  const secondStrongest = personalResults.find(
    (entry) => entry !== strongest && entry.resultType === 'rating' && entry.grounded,
  );
  const verify = resultRows.find((entry) => entry.resultType === 'verify');
  const unknown = resultRows.find(
    (entry) =>
      entry.resultType === 'knowledge-gap' ||
      entry.resultType === 'information',
  );

  return (
    <section
      id={PRIORITY_BRIDGE_ANCHOR_ID}
      tabIndex={-1}
      className="mt-10 w-full bg-white py-8 mobile:mt-6 mobile:px-3 mobile:py-5"
      data-testid="priority-fit-assessment"
      aria-label="Vyhodnocení míry shody"
    >
      <header>
        <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.09em] text-embed-brand-gold">
          Váš výsledek
        </p>
        <h2 className="mb-1 mt-1 text-[25px] font-bold uppercase text-embed-brand-navy mobile:text-[21px]">
          Jak vám tento dům sedí?
        </h2>
        <p className="m-0 text-[15px] leading-[1.55] text-embed-foreground-primary/70">
          Porovnali jsme to, co je pro vás důležité, s konkrétními vlastnostmi
          tohoto domu.
        </p>
      </header>
      <div
        className="mt-4 overflow-hidden rounded-[8px] border border-solid border-[#DEDED9]"
        data-testid="priority-fit-table"
      >
        <div className="grid grid-cols-[1.15fr_145px_2fr] bg-embed-brand-navy text-[12px] font-extrabold uppercase tracking-[0.06em] text-white mobile:hidden">
          <div className="px-3 py-2.5">Vaše priorita</div>
          <div className="px-3 py-2.5">Míra shody</div>
          <div className="px-3 py-2.5">Proč</div>
        </div>
        {resultRows.map((entry, index) => {
          const effectiveType =
            entry.grounded || entry.evidenceFactIds.length === 0
              ? entry.resultType
              : 'knowledge-gap';
          const effective = {
            ...entry,
            resultType: effectiveType,
          } as PriorityFitContractEntry;
          return (
            <article
              key={`${entry.priorityId}:${entry.answerId}`}
              className="grid min-h-[64px] grid-cols-[1.15fr_145px_2fr] items-center border-t border-solid border-[#E7E7E3] text-[15px] first:border-t-0 mobile:m-2 mobile:grid-cols-[1fr_auto] mobile:rounded-[8px] mobile:border mobile:border-solid mobile:border-[#DEDED9]"
              data-result-type={effectiveType}
              data-grounded={entry.grounded ? 'true' : 'false'}
              data-result-source={index < 3 ? 'personal' : 'conis-check'}
            >
              <strong className="px-3 py-3 text-embed-brand-navy mobile:pb-1">
                {entry.answer}
              </strong>
              <span
                className={`px-3 py-3 font-extrabold ${effectiveType === 'rating' ? 'text-[20px] tracking-[1px] text-embed-brand-gold' : 'text-[12px] uppercase text-[#8C6B24]'} mobile:pb-1 mobile:text-right`}
              >
                {resultLabel(effective)}
              </span>
              <span className="px-3 py-3 leading-[1.4] text-embed-foreground-primary/70 mobile:col-span-2 mobile:pt-1">
                {entry.why}
              </span>
            </article>
          );
        })}
      </div>
      {media.length === 3 ? (
        <section className="mt-4" data-testid="priority-fit-gallery">
          <h3 className={heading}>Všimněte si</h3>
          <p className="mb-2 mt-1 text-[14px] text-embed-foreground-primary/65">
            Tyto části domu souvisejí s tím, co jste označili jako důležité.
          </p>
          <div className="grid grid-cols-3 gap-3 mobile:grid-cols-1 mobile:gap-2">
            {media.map(({ asset, entry }) => (
              <article
                key={asset.url}
                className="overflow-hidden rounded-[8px] border border-solid border-[#DEDED9] bg-white mobile:grid mobile:grid-cols-[38%_62%]"
              >
                <img
                  src={asset.url}
                  alt={entry.answer}
                  className="aspect-[2/1] h-full w-full object-cover mobile:min-h-[92px]"
                />
                <div className="p-3">
                  <strong className="text-[15px] text-embed-brand-navy">
                    {entry.answer}
                  </strong>
                  <p className="mb-0 mt-1 text-[14px] leading-[1.45] text-embed-foreground-primary/70">
                    {mediaExplanation(entry)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-3 mobile:grid-cols-1">
        <section className={`${panel} bg-[#F7F7F5]`}>
          <h3 className={heading}>Celkový obraz</h3>
          <strong className="mt-2 block text-[16px] leading-[1.3] text-embed-brand-navy">
            {strongest
              ? secondStrongest
                ? `Nejsilnější shody máte v oblastech ${strongest.answer.toLocaleLowerCase('cs')} a ${secondStrongest.answer.toLocaleLowerCase('cs')}.`
                : `${strongest.answer} patří mezi vaše nejsilnější doložené shody.`
              : 'Vaše hlavní potřeby vedou především k otázkám pro další ověření.'}
          </strong>
          <p className="mb-0 mt-2 text-[15px] leading-[1.55] text-embed-foreground-primary/70">
            {verify?.missingEvidence ?? unknown?.missingEvidence ?? 'Otevřené otázky můžete ověřit v dalším kroku.'}
          </p>
        </section>
        <section className={panel}>
          <h3 className={heading}>Co z toho pro vás plyne</h3>
          <div className="mt-2 grid gap-2 text-[15px] leading-[1.5]">
            <p className="m-0 rounded-[6px] bg-[#F7F7F5] p-2">
              <b>✓ Silná stránka</b>
              <br />
              {strongest?.why ??
                'Doložené vlastnosti domu můžete dál porovnat se svými potřebami.'}
            </p>
            <p className="m-0 rounded-[6px] bg-[#F7F7F5] p-2">
              <b>△ Prověřit</b>
              <br />
              {verify?.why ?? verify?.missingEvidence ??
                'Konkrétní podmínky lze upřesnit v dalším kroku.'}
            </p>
            <p className="m-0 rounded-[6px] bg-[#F7F7F5] p-2">
              <b>? Zatím nevíme</b>
              <br />
              {unknown?.missingEvidence ??
                'Další otázky můžete snadno vyjasnit s CONIS nebo prodejcem.'}
            </p>
          </div>
        </section>
      </div>
      <section className={`${panel} mt-3`}>
        <h3 className={heading}>Další důležité informace</h3>
        <div className="mt-3 text-[15px]">
          <PriorityRelationships
            limit={6}
            excludeTitles={resultRows.map((entry) => entry.answer)}
          />
        </div>
      </section>
      <section className="mt-3 grid grid-cols-[1fr_auto] items-center gap-5 rounded-[8px] bg-embed-brand-navy p-4 text-white mobile:grid-cols-1">
        <div>
          <h3 className="m-0 text-[12px] font-extrabold uppercase tracking-[0.06em] text-embed-brand-gold">
            Co zatím nevíme → další krok
          </h3>
          <p className="mb-0 mt-1 max-w-[720px] text-[15px] leading-[1.55] text-white/85">
            Konkrétní pozemek a otevřené otázky můžeme nyní prověřit přesněji.
          </p>
        </div>
        <div className="flex gap-2 mobile:grid mobile:grid-cols-1">
          <button
            type="button"
            onClick={continueWithPlotCheck}
            className="rounded-[6px] border border-white/50 bg-transparent px-4 py-3 text-[13px] font-extrabold text-white"
          >
            MÁM POZEMEK
          </button>
          <button
            type="button"
            onClick={continueWithPlotFind}
            className="rounded-[6px] border border-white/50 bg-transparent px-4 py-3 text-[13px] font-extrabold text-white"
          >
            HLEDÁM POZEMEK
          </button>
          <button
            type="button"
            onClick={askConis}
            className="rounded-[6px] border border-white/50 bg-transparent px-4 py-3 text-[13px] font-extrabold text-white"
          >
            MÁM DOTAZ
          </button>
        </div>
      </section>
      <p className="mt-3 text-center text-[12px] text-embed-foreground-primary/50">
        Hvězdičky vyjadřují míru shody s vašimi prioritami, nikoli obecnou
        kvalitu domu.
      </p>
    </section>
  );
}
