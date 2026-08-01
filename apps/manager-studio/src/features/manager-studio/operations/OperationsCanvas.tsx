import { ActiveJourneys } from './surfaces/ActiveJourneys';
import { Actions } from './surfaces/Actions';
import { AttentionQueue } from './surfaces/AttentionQueue';
import { LiveOverview } from './surfaces/LiveOverview';
import { OperationalInsights } from './surfaces/OperationalInsights';
import { Timeline } from './surfaces/Timeline';

type OperationsCanvasProps = {
  /** PR-026 — partner UI shows Živý přehled only. */
  readonly partnerOnly?: boolean;
};

/**
 * Operations Terminal canvas — ordered Experience Surfaces (MSCB-01).
 */
export function OperationsCanvas({ partnerOnly = false }: OperationsCanvasProps) {
  return (
    <div
      className="w-full max-w-5xl"
      data-studio-shell="operations-canvas"
    >
      <LiveOverview />
      {!partnerOnly && (
        <>
          <Timeline />
          <ActiveJourneys />
          <AttentionQueue />
          <OperationalInsights />
          <Actions />
        </>
      )}
    </div>
  );
}
