import { useState } from 'react';

import { usePilotWorkspaceContext } from '../../../office/PilotWorkspaceContext';
import {
  COMMERCIAL_PILOT_PROGRAM_PACKAGES,
  formatCommercialPilotPriceCzk,
  resolveCommercialPilotProgramId,
  type CommercialPilotProgramId,
  type CommercialPilotProgramPackage,
} from '../../../office/commercialPilotProgramCatalog';
import { setCommercialJourneySelectedProgramId } from '../../../office/commercialJourneySelection';
import { selectCommercialProjectProgram } from '../../../office/commercialProjectConfig';
import type { PilotWorkspaceCase } from '../../../office/pilotWorkspaceModel';

type PilotProgramScreenProps = {
  readonly activeCase: PilotWorkspaceCase;
};

/**
 * PT-CJ-02 — Production Pilot Program screen (digital PDF nabídka).
 * Selection is visual only — no order / payment / automation.
 */

function PilotDecisionBridge() {
  const steps = [
    'Vaše podklady',
    'Naše zpracování',
    'Nasazení na web',
    'Skuteční návštěvníci',
    'Profily zájemců',
    'Vyhodnocení po 90 dnech',
  ] as const;

  return (
    <section
      aria-label="Průběh pilotního programu"
      className="mt-9 border-t border-slate-200 pt-8"
    >
      <p className="mx-auto max-w-4xl text-center text-[19px] font-bold leading-[1.4] text-slate-900">
        <span className="block">
          To nejcennější, co CONIS nabízí, nelze ukázat na webu.
        </span>
        <span className="mt-1 block text-[#B8922D]">
          Otevírá se až partnerům, kteří vstoupí do pilotního programu.
        </span>
      </p>

      <div
        className="mt-8 flex flex-wrap items-stretch justify-center gap-y-3 lg:flex-nowrap lg:justify-between"
        data-testid="cj-pilot-process"
      >
        {steps.map((step, index) => (
          <div
            key={step}
            className="flex min-w-0 items-center"
          >
            <div className="flex min-h-[72px] w-[150px] items-center justify-center rounded-xl bg-[#001930] px-4 py-3 text-center text-[14px] font-bold leading-[1.3] text-white">
              {step}
            </div>

            {index < steps.length - 1 ? (
              <div
                aria-hidden="true"
                className="flex w-8 shrink-0 items-center justify-center text-[22px] font-bold text-[#B8922D]"
              >
                →
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function PilotProgramScreen({ activeCase }: PilotProgramScreenProps) {
  const { navigateCommercialJourneyStep } = usePilotWorkspaceContext();
  const suggested = resolveCommercialPilotProgramId(activeCase.packageName);
  const [selectedId, setSelectedId] = useState<CommercialPilotProgramId | null>(
    suggested,
  );

  const selected =
    COMMERCIAL_PILOT_PROGRAM_PACKAGES.find((pkg) => pkg.id === selectedId) ??
    null;

  return (
    <div
      className="office-cj-screen office-cj-screen--pilot-program"
      data-testid="commercial-journey-screen"
      data-cj-step="pilot_program"
      data-cj-pilot-program="true"
    >
      <header className="office-cj-pilot__head">
        <p className="office-cj-pilot__eyebrow">Pilotní program / {activeCase.partnerName}</p>
        <h2 className="office-cj-pilot__title" id="cj-pilot-program-title">
          Začněte v rozsahu, který vám dává smysl.
        </h2>
        <p className="office-cj-pilot__lead">
          Vyberete rozsah pilotu, my vše připravíme a 90 dní ověříte
          CONIS na skutečných návštěvnících vašeho webu.
        </p>
      </header>

      <div
        className="office-cj-pilot__grid"
        role="group"
        aria-labelledby="cj-pilot-program-title"
        data-testid="cj-pilot-packages"
      >
        {COMMERCIAL_PILOT_PROGRAM_PACKAGES.map((pkg) => (
          <PilotProgramCard
            key={pkg.id}
            pkg={pkg}
            selected={selectedId === pkg.id}
            onSelect={(id) => {
              setSelectedId(id);
              setCommercialJourneySelectedProgramId(id);
            }}
          />
        ))}
      </div>

      <PilotDecisionBridge />

      <footer className="office-cj-pilot__footer" data-testid="cj-pilot-summary">
        {selected === null ? (
          <p className="office-cj-pilot__hint">Vyberte balíček pro pokračování.</p>
        ) : (
          <>
            <p className="office-cj-pilot__choice">
              <strong>{selected.name}</strong>
              <span>
                {formatCommercialPilotPriceCzk(selected.priceCzk)} ·{' '}
                {selected.housesLabel} · {selected.trialDays} dní
              </span>
            </p>
            <button
              type="button"
              className="office-cj-pilot__continue"
              data-testid="cj-pilot-continue"
              data-package-select-action
              onClick={() => {
                void selectCommercialProjectProgram({
                  projectId: activeCase.projectId,
                  programId: selected.id,
                })
                  .then(() => {
                    setCommercialJourneySelectedProgramId(selected.id);
                    navigateCommercialJourneyStep('complete_order');
                  })
                  .catch((error: unknown) => {
                    console.error(
                      'Commercial program selection could not be persisted.',
                      error,
                    );
                  });
              }}
            >
              Pokračovat
            </button>
          </>
        )}
      </footer>
    </div>
  );
}

function PilotProgramCard({
  pkg,
  selected,
  onSelect,
}: {
  readonly pkg: CommercialPilotProgramPackage;
  readonly selected: boolean;
  readonly onSelect: (id: CommercialPilotProgramId) => void;
}) {
  return (
    <button
      type="button"
      className={[
        'office-cj-pilot-card',
        selected ? 'office-cj-pilot-card--selected' : '',
        pkg.recommended ? 'office-cj-pilot-card--recommended' : '',
        pkg.priceAnchor ? 'office-cj-pilot-card--anchor' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-pressed={selected}
      data-testid={`cj-pilot-package-${pkg.id}`}
      data-recommended={pkg.recommended ? 'true' : 'false'}
      data-price-anchor={pkg.priceAnchor ? 'true' : 'false'}
      onClick={() => onSelect(pkg.id)}
     data-package-card="true" data-package-selected={selected ? "true" : "false"}>
      {pkg.recommended ? (
        <span className="office-cj-pilot-card__badge">
          ★ Doporučená varianta
        </span>
      ) : null}
      <h3 className="office-cj-pilot-card__name">{pkg.name}</h3>
      <p className="office-cj-pilot-card__price">
        {formatCommercialPilotPriceCzk(pkg.priceCzk)}
      </p>
      <p className="office-cj-pilot-card__license">{pkg.housesLabel}</p>
      <p className="office-cj-pilot-card__summary">{pkg.summary}</p>
      <ul className="office-cj-pilot-card__highlights">
        {pkg.highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <span className="office-cj-pilot-card__select">
        {selected ? 'Vybráno' : 'Vybrat balíček'}
      </span>
    </button>
  );
}
