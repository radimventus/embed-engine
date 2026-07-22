import { ActiveJourneys } from './surfaces/ActiveJourneys';
import { Actions } from './surfaces/Actions';
import { AttentionQueue } from './surfaces/AttentionQueue';
import { LiveOverview } from './surfaces/LiveOverview';
import { OperationalInsights } from './surfaces/OperationalInsights';
import { Timeline } from './surfaces/Timeline';

/**
 * Operations Terminal canvas — ordered Experience Surfaces (MSCB-01).
 */
export function OperationsCanvas() {
  return (
    <div
      className="w-full max-w-5xl"
      data-studio-shell="operations-canvas"
    >
      <LiveOverview />
      <Timeline />
      <ActiveJourneys />
      <AttentionQueue />
      <OperationalInsights />
      <Actions />
    </div>
  );
}
