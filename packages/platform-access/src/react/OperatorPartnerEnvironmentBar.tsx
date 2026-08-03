/**
 * OF-12 — Operator PE chrome: Client / Manager / Sales + return to Office.
 * Shown only while CONIS Admin operator PE mode is active.
 */

import {
  getOperatorPartnerEnvironment,
  returnFromOperatorPartnerEnvironment,
  switchOperatorPartnerStudio,
  type OperatorPeStudioSurface,
} from '../pilot/operatorPartnerEnvironment';

const SURFACES: readonly {
  readonly id: OperatorPeStudioSurface;
  readonly label: string;
}[] = [
  { id: 'client', label: 'Client Studio' },
  { id: 'manager', label: 'Manager Studio' },
  { id: 'sales', label: 'Sales Studio' },
];

type OperatorPartnerEnvironmentBarProps = {
  readonly activeSurface: OperatorPeStudioSurface;
};

/**
 * Compact PE studio switcher for CONIS Admin operator entry (no Invite/NDA/Welcome).
 */
export function OperatorPartnerEnvironmentBar({
  activeSurface,
}: OperatorPartnerEnvironmentBarProps) {
  const state = getOperatorPartnerEnvironment();
  if (state === null) return null;

  return (
    <div
      className="platform-access__operator-pe-bar"
      data-testid="operator-pe-bar"
      role="navigation"
      aria-label="Partner Environment — CONIS Admin"
    >
      <p className="platform-access__operator-pe-label">
        Partner Environment · CONIS Admin
      </p>
      <div className="platform-access__operator-pe-actions" role="group">
        {SURFACES.map((surface) => {
          const isActive = surface.id === activeSurface;
          if (isActive) {
            return (
              <span
                key={surface.id}
                className="platform-access__operator-pe-btn platform-access__operator-pe-btn--active"
                aria-current="page"
                data-testid={`operator-pe-${surface.id}`}
              >
                {surface.label}
              </span>
            );
          }
          return (
            <button
              key={surface.id}
              type="button"
              className="platform-access__operator-pe-btn"
              data-testid={`operator-pe-${surface.id}`}
              onClick={() => {
                switchOperatorPartnerStudio(surface.id);
              }}
            >
              {surface.label}
            </button>
          );
        })}
        <button
          type="button"
          className="platform-access__operator-pe-btn platform-access__operator-pe-btn--return"
          data-testid="operator-pe-return-office"
          onClick={() => {
            returnFromOperatorPartnerEnvironment();
          }}
        >
          Zpět do Office
        </button>
      </div>
    </div>
  );
}
