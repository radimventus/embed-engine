import { OPERATIONS_SECTION_IDS } from '../operationsVocabulary';
import { OperationsSurface } from '../OperationsSurface';

/**
 * Insights placeholder — patterns remain Runtime-derived in later capabilities.
 */
export function OperationalInsights() {
  return (
    <OperationsSurface
      id={OPERATIONS_SECTION_IDS.insights}
      title="Provozní poznatky"
      description="Základní plocha. Agregované vzorce Runtime přijdou později."
    >
      <p className="text-sm text-embed-foreground-primary/55">
        Žádné provozní poznatky v Generation 1 foundation.
      </p>
    </OperationsSurface>
  );
}
