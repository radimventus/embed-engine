import { useMemo, useState } from 'react';

import { PRIORITY_BRIDGE_ANCHOR_ID } from '../../foundation/scrollToSection';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { usePriorityConversationContext } from './PriorityConversationProvider';
import { PriorityRelationships } from './PriorityRelationships';
import { MediaLightbox } from '../MediaExplorer/MediaLightbox';
import { SpatialZoomControl } from '../SpatialZoomControl';
import {
  priorityFitEntry,
  type PriorityFitContractEntry,
} from './priorityFitContract';

const heading =
  'm-0 text-[12px] font-extrabold uppercase tracking-[0.06em] text-embed-brand-navy';
const panel = 'rounded-[8px] border border-solid border-[#DEDED9] bg-white p-4';

const MEDIA_FALLBACKS = [
  ['layout', 'privacy'],
  ['comfort', 'fresh-air'],
  ['layout', 'flexibility'],
  ['quality', 'execution-detail'],
  ['plot', 'garden-terrace'],
] as const;

type GroundedFitEntry = PriorityFitContractEntry & {
  readonly grounded: boolean;
  readonly rowKind: 'priority' | 'answer';
};

const PRIORITY_SYNTHESIS: Readonly<Record<string, string>> = {
  plot: 'U tohoto domu bude důležité prověřit orientaci, příjezd a vztah terasy k zahradě na konkrétní parcele.',
  layout: 'Dům pracuje s otevřeným společným prostorem, oddělenou klidovou částí a částečně upravitelnými pokoji.',
  comfort: 'Tepelný komfort, řízené větrání a velké prosklení společně podporují příjemné vnitřní prostředí.',
  design: 'Dům stojí na jednoduché hmotě, výrazném prosklení a kombinaci střídmých materiálů.',
  energy: 'Energetická třída, řízené technologie a příprava výroby energie tvoří společný provozní celek.',
  realization: 'Rozsah úprav je částečně doložený; cenu, harmonogram a závazný rozsah je nutné potvrdit s prodejcem.',
  quality: 'Konstrukce, materiály, technologie a kontrola provedení jsou popsané jako jeden technický systém.',
  maintenance: 'Použité materiály omezují pravidelnou péči, konkrétní servisní intervaly a náklady je ale potřeba ověřit.',
};

function derivePriorityResult(
  priorityId: string,
  label: string,
  _intensity: number,
  selected: readonly GroundedFitEntry[],
): GroundedFitEntry {
  const nonRating = selected.find((entry) => entry.resultType === 'verify') ??
    selected.find((entry) => entry.resultType === 'knowledge-gap') ??
    selected.find((entry) => entry.resultType === 'information');
  return {
    priorityId,
    answerId: `priority:${priorityId}`,
    answer: label,
    resultType: nonRating?.resultType ?? 'information',
    why: PRIORITY_SYNTHESIS[priorityId] ?? 'Tuto oblast porovnáváme s doloženými vlastnostmi domu a vašimi konkrétními potřebami.',
    evidenceFactIds: selected.flatMap((entry) => entry.evidenceFactIds),
    missingEvidence: nonRating?.missingEvidence,
    roomId: selected[0]?.roomId ?? 'exterior',
    grounded: selected.length > 0 && selected.every((entry) => entry.grounded),
    rowKind: 'priority',
  };
}

function mediaExplanation(entry: PriorityFitContractEntry): string {
  const copy: Readonly<Record<string, string>> = {
    'family-space': 'Všimněte si přímého kontaktu kuchyně, jídelny a obývací části.',
    privacy: 'Všimněte si oddělení klidové části od společného prostoru domu.',
    'garden-terrace': 'Terasa navazuje na obytnou část; její fungování rozhodne osazení na pozemku.',
    'fresh-air': 'Tento prostor ukazuje místnost, kde řízené větrání průběžně obnovuje vzduch.',
    'heating-cooling': 'Všimněte si prostoru, jehož komfort podporuje vytápění i chlazení.',
    'light-view': 'Všimněte si velké prosklené plochy, která propojuje obytný prostor s výhledem ven.',
    timeless: 'Všimněte si jednoduché hmoty domu a střídmého počtu výrazových prvků.',
    character: 'Všimněte si kontrastu podlouhlé hmoty, sedlové střechy a velkého prosklení.',
    materials: 'Všimněte si kombinace dřeva a střídmého opláštění na jednoduché hmotě domu.',
    'low-effort': 'Všimněte si rozsahu opláštění, které omezuje plochy vyžadující pravidelnou povrchovou péči.',
    'execution-detail': 'Na provedení detailů se projeví kontrola konstrukcí a instalací.',
  };
  return copy[entry.answerId] ?? '';
}

const VISUAL_ANSWER_IDS = new Set([
  'family-space', 'privacy', 'garden-terrace', 'heating-cooling', 'light-view',
  'timeless', 'character', 'materials', 'low-effort',
]);

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
  const [zoomedMedia, setZoomedMedia] = useState<{
    readonly src: string;
    readonly alt: string;
  } | null>(null);
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
        rowKind: 'answer' as const,
        grounded:
          chatHouseKnowledge?.canonicalHouseId === 'modern-4kk' &&
          entry.evidenceFactIds.every((id) => factIds.has(id)),
      })),
    [chatHouseKnowledge?.canonicalHouseId, entries, factIds],
  );
  const resultRows = useMemo(
    () => tags.flatMap((tag) => {
      const selected = grounded.filter((entry) => entry.priorityId === tag.id);
      return [
        derivePriorityResult(tag.id, tag.title, tag.percent, selected),
        ...selected,
      ];
    }),
    [grounded, tags],
  );
  const media = useMemo(() => {
    const used = new Set<string>();
    const selectedIds = new Set(grounded.map((entry) => entry.answerId));
    const fallbacks = MEDIA_FALLBACKS.flatMap(([priorityId, answerId]) => {
      const entry = priorityFitEntry(priorityId, answerId);
      return entry === null || selectedIds.has(entry.answerId)
        ? []
        : [{
            ...entry,
            rowKind: 'answer' as const,
            grounded:
              chatHouseKnowledge?.canonicalHouseId === 'modern-4kk' &&
              entry.evidenceFactIds.every((id) => factIds.has(id)),
          }];
    });
    return [...grounded, ...fallbacks]
      .filter((entry) => VISUAL_ANSWER_IDS.has(entry.answerId) && mediaExplanation(entry).length > 0)
      .flatMap((entry) => {
        const asset = experience.context.roomMedia.gallery.find(
          (item) => item.roomId === entry.roomId && !used.has(item.url),
        );
        if (!asset) return [];
        used.add(asset.url);
        return [{ asset, entry }];
      })
      .slice(0, 3);
  }, [
    chatHouseKnowledge?.canonicalHouseId,
    experience.context.roomMedia.gallery,
    factIds,
    grounded,
  ]);
  const strongest = grounded.find(
    (entry) =>
      entry.resultType === 'rating' &&
      entry.grounded &&
      (entry.rating ?? 0) >= 4,
  );
  const secondStrongest = grounded.find(
    (entry) => entry !== strongest && entry.resultType === 'rating' && entry.grounded,
  );
  const plotBridge = priorityFitEntry('plot', 'orientation');
  const verify = grounded.find((entry) => entry.resultType === 'verify') ?? plotBridge;
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
        {tags.map((tag) => {
          const priority = resultRows.find((entry) => entry.answerId === `priority:${tag.id}`)!;
          const answerRows = resultRows.filter((entry) => entry.priorityId === tag.id && entry.rowKind === 'answer');
          return (
            <section key={tag.id} className="border-t border-solid border-[#E7E7E3] first:border-t-0" data-testid="priority-result-group">
              <article className="grid min-h-[72px] grid-cols-[1.15fr_145px_2fr] items-center bg-[#F7F7F5] text-[15px] mobile:m-2 mobile:grid-cols-[1fr_auto] mobile:rounded-[8px]" data-result-source="priority">
                <strong className="px-3 py-3 text-[17px] uppercase text-embed-brand-navy">{priority.answer}</strong>
                <span className="px-3 py-3 text-[13px] font-extrabold uppercase text-[#8C6B24] mobile:text-right">PRO VÁS {tag.percent} %</span>
                <span className="px-3 py-3 leading-[1.45] text-embed-foreground-primary/75 mobile:col-span-2">{priority.why}</span>
              </article>
              {answerRows.map((entry) => {
                const effectiveType = entry.grounded ? entry.resultType : 'knowledge-gap';
                const effective = { ...entry, resultType: effectiveType } as PriorityFitContractEntry;
                return <article key={`${entry.priorityId}:${entry.answerId}`} className="ml-6 grid min-h-[64px] grid-cols-[1.15fr_145px_2fr] items-center border-t border-solid border-[#ECECE8] bg-white text-[15px] mobile:m-2 mobile:grid-cols-[1fr_auto] mobile:rounded-[8px] mobile:border" data-result-type={effectiveType} data-result-source="answer">
                  <strong className="px-3 py-3 text-embed-brand-navy mobile:pb-1">↳ {entry.answer}</strong>
                  <span className={`px-3 py-3 font-extrabold ${effectiveType === 'rating' ? 'text-[20px] tracking-[1px] text-embed-brand-gold' : 'text-[12px] uppercase text-[#8C6B24]'} mobile:text-right`}>{resultLabel(effective)}</span>
                  <span className="px-3 py-3 leading-[1.4] text-embed-foreground-primary/70 mobile:col-span-2">{entry.why}</span>
                </article>;
              })}
            </section>
          );
        })}
      </div>
      {media.length === 3 ? (
        <section className="mt-4" data-testid="priority-fit-gallery">
          <h3 className={heading}>Všimněte si</h3>
          <p className="mb-2 mt-1 text-[14px] text-embed-foreground-primary/65">
            Tyto části domu souvisejí s tím, co jste označili jako důležité.
          </p>
          <div className="mx-auto grid w-[80%] grid-cols-3 gap-3 mobile:w-full mobile:grid-cols-1 mobile:gap-2">
            {media.map(({ asset, entry }) => (
              <article
                key={asset.url}
                className="overflow-hidden rounded-[8px] border border-solid border-[#DEDED9] bg-white mobile:grid mobile:grid-cols-[38%_62%]"
                data-testid="priority-context-media"
              >
                <div className="relative">
                  <img
                    src={asset.url}
                    alt={entry.answer}
                    className="aspect-[16/9] w-full object-cover mobile:h-full mobile:min-h-[92px]"
                  />
                  <SpatialZoomControl
                    onClick={() => setZoomedMedia({ src: asset.url, alt: entry.answer })}
                    label={`Zvětšit: ${entry.answer}`}
                    className="absolute bottom-2 right-2 z-10"
                  />
                </div>
                <div className="p-3">
                  <strong className="text-[15px] text-embed-brand-navy">
                    {entry.answer}
                  </strong>
                  <p className="mb-0 mt-1 text-[14px] leading-[1.45] text-embed-foreground-primary/70" data-testid="priority-context-copy">
                    {mediaExplanation(entry)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <MediaLightbox
        alt={zoomedMedia?.alt ?? ''}
        isOpen={zoomedMedia !== null}
        kind="photo"
        src={zoomedMedia?.src ?? ''}
        onClose={() => setZoomedMedia(null)}
      />
      <section className={`${panel} mt-3`} data-testid="priority-additional-topics">
        <h3 className={heading}>Další důležité informace</h3>
        <div className="mt-3 text-[15px]">
          <PriorityRelationships
            limit={6}
            excludeTitles={resultRows.map((entry) => entry.answer)}
            priorityV2
          />
        </div>
      </section>
      <div className="mt-4 grid grid-cols-2 gap-3 mobile:grid-cols-1">
        <section className={`${panel} bg-[#F7F7F5]`}>
          <h3 className={heading}>Celkový obraz</h3>
          <strong className="mt-2 block text-[16px] leading-[1.3] text-embed-brand-navy">
            {strongest
              ? secondStrongest
                ? `Nejlépe vám tento dům odpovídá v tom, jak řeší ${strongest.answer.toLocaleLowerCase('cs')} a ${secondStrongest.answer.toLocaleLowerCase('cs')}.`
                : `Nejlépe vám tento dům odpovídá v tom, jak řeší ${strongest.answer.toLocaleLowerCase('cs')}.`
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
