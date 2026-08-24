import { ManagerWorkCenterHome } from "./ManagerWorkCenterHome";
import { DecisionSessionRuntimeProvider } from "./runtime/DecisionSessionRuntimeProvider";

/**
 * TASK 71B — Partner Manager Studio is one coherent Manager Intelligence
 * product. Legacy Operations / Product Learning canvases are no longer
 * appended below the new dashboard.
 */
export function ManagerStudioPage() {
  return (
    <DecisionSessionRuntimeProvider>
      <ManagerWorkCenterHome />
    </DecisionSessionRuntimeProvider>
  );
}
