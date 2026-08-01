import { OPERATIONS_SECTION_IDS } from '../operationsVocabulary';
import { OperationsSurface } from '../OperationsSurface';

/**
 * Actions placeholder — operational commands return to Runtime in later capabilities.
 * Foundation does not dispatch from this surface.
 */
export function Actions() {
  return (
    <OperationsSurface
      id={OPERATIONS_SECTION_IDS.actions}
      title="Akce"
      description="Základní plocha. Přiřazení / kontakt / vyřešení se napojí na Runtime později."
    >
      <ul className="space-y-2 text-sm text-embed-foreground-primary/55">
        <li>Přiřadit — připraveno pro další capability</li>
        <li>Kontaktovat — připraveno pro další capability</li>
        <li>Vyřešit — připraveno pro další capability</li>
      </ul>
    </OperationsSurface>
  );
}
