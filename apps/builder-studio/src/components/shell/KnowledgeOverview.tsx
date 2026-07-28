import type {
  KnowledgeEvent,
  KnowledgePackage,
} from '../../model';

type KnowledgeOverviewProps = {
  readonly knowledgePackage: KnowledgePackage;
  readonly events: readonly KnowledgeEvent[];
  readonly onSaveKnowledge: () => void;
  readonly onAddFact: () => void;
  readonly onAddEntity: () => void;
  readonly onAddRelationship: () => void;
  readonly onAddFaq: () => void;
};

/**
 * Knowledge Overview (EPIC-BLD-11).
 * Read/overview of Facts, Entities, Relationships, FAQ, Documents.
 * Authoring structure only — no AI / inference.
 */
export function KnowledgeOverview({
  knowledgePackage,
  events,
  onSaveKnowledge,
  onAddFact,
  onAddEntity,
  onAddRelationship,
  onAddFaq,
}: KnowledgeOverviewProps) {
  return (
    <div className="space-y-8" data-testid="knowledge-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Knowledge Package
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {knowledgePackage.metadata.title}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {knowledgePackage.knowledgeId} · v{knowledgePackage.version} ·{' '}
            {knowledgePackage.metadata.status}
          </p>
        </div>
        <button
          type="button"
          onClick={onSaveKnowledge}
          className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
        >
          Uložit Knowledge
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryTile label="Facts" value={`${knowledgePackage.facts.length}`} />
        <SummaryTile
          label="Entities"
          value={`${knowledgePackage.entities.length}`}
        />
        <SummaryTile
          label="Relationships"
          value={`${knowledgePackage.relationships.length}`}
        />
        <SummaryTile label="FAQ" value={`${knowledgePackage.faqs.length}`} />
        <SummaryTile
          label="Documents"
          value={`${knowledgePackage.documents.length}`}
        />
      </div>

      <section aria-labelledby="facts-heading">
        <div className="flex items-center justify-between gap-3">
          <h3
            id="facts-heading"
            className="text-base font-semibold text-builder-ink"
          >
            Facts
          </h3>
          <button
            type="button"
            onClick={onAddFact}
            className="rounded-[8px] border border-[#DDE5EF] px-3 py-1.5 text-[12px] font-medium"
          >
            + Fact
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {knowledgePackage.facts.map((fact) => (
            <li
              key={fact.id}
              className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
            >
              <p className="text-sm font-semibold text-builder-ink">
                {fact.title}
              </p>
              <p className="mt-0.5 text-sm text-builder-ink">{fact.value}</p>
              <p className="mt-1 text-[12px] text-builder-muted">
                {fact.category} · {fact.source}
                {fact.tags.length > 0 ? ` · ${fact.tags.join(', ')}` : ''}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="entities-heading">
        <div className="flex items-center justify-between gap-3">
          <h3
            id="entities-heading"
            className="text-base font-semibold text-builder-ink"
          >
            Entities
          </h3>
          <button
            type="button"
            onClick={onAddEntity}
            className="rounded-[8px] border border-[#DDE5EF] px-3 py-1.5 text-[12px] font-medium"
          >
            + Entity
          </button>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {knowledgePackage.entities.map((entity) => (
            <li
              key={entity.id}
              className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
            >
              <p className="text-sm font-semibold text-builder-ink">
                {entity.label}
              </p>
              <p className="mt-1 text-[12px] text-builder-muted">
                {entity.type}
                {entity.aliases.length > 0
                  ? ` · ${entity.aliases.join(', ')}`
                  : ''}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="relationships-heading">
        <div className="flex items-center justify-between gap-3">
          <h3
            id="relationships-heading"
            className="text-base font-semibold text-builder-ink"
          >
            Relationships
          </h3>
          <button
            type="button"
            onClick={onAddRelationship}
            className="rounded-[8px] border border-[#DDE5EF] px-3 py-1.5 text-[12px] font-medium"
          >
            + Relationship
          </button>
        </div>
        <p className="mt-1 text-[13px] text-builder-muted">
          Datový model only — bez inference.
        </p>
        <ul className="mt-3 space-y-2">
          {knowledgePackage.relationships.map((rel) => (
            <li
              key={rel.id}
              className="rounded-[12px] border border-[#DDE5EF] px-4 py-3 text-sm"
            >
              <span className="font-medium text-builder-ink">{rel.from}</span>
              <span className="mx-2 text-builder-muted">— {rel.relation} →</span>
              <span className="font-medium text-builder-ink">{rel.to}</span>
              <span className="ml-2 text-[12px] text-builder-muted">
                conf. {rel.confidence}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq-heading">
        <div className="flex items-center justify-between gap-3">
          <h3
            id="faq-heading"
            className="text-base font-semibold text-builder-ink"
          >
            FAQ Repository
          </h3>
          <button
            type="button"
            onClick={onAddFaq}
            className="rounded-[8px] border border-[#DDE5EF] px-3 py-1.5 text-[12px] font-medium"
          >
            + FAQ
          </button>
        </div>
        <p className="mt-1 text-[13px] text-builder-muted">
          Odděleno od Experience — Experience FAQ pouze zobrazuje.
        </p>
        <ul className="mt-3 space-y-2">
          {knowledgePackage.faqs.map((faq) => (
            <li
              key={faq.id}
              className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
            >
              <p className="text-sm font-semibold text-builder-ink">
                {faq.question}
              </p>
              <p className="mt-1 text-sm text-builder-muted">{faq.answer}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="documents-heading">
        <h3
          id="documents-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Document Registry
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Bez OCR a parsování — pouze registrace assetRef.
        </p>
        {knowledgePackage.documents.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Žádné dokumenty — nahrajte soubory v sekci Soubory.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {knowledgePackage.documents.map((doc) => (
              <li
                key={doc.id}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3 text-sm"
              >
                <span className="font-semibold text-builder-ink">
                  {doc.title}
                </span>
                <span className="mt-0.5 block text-[12px] text-builder-muted">
                  {doc.type} · assetRef: {doc.assetRef}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="knowledge-history-heading">
        <h3
          id="knowledge-history-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Historie relace
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Session only — bez persistence.
        </p>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zatím žádné události.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {events.slice(0, 10).map((event) => (
              <li
                key={event.eventId}
                className="flex items-start justify-between gap-3 rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <div>
                  <span className="font-medium text-builder-ink">
                    {event.type}
                  </span>
                  <span className="mt-0.5 block text-builder-muted">
                    {event.message}
                  </span>
                </div>
                <time className="shrink-0 text-[11px] text-builder-muted">
                  {new Date(event.at).toLocaleTimeString('cs-CZ', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SummaryTile({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-[12px] border border-[#DDE5EF] px-4 py-3">
      <p className="text-[12px] uppercase tracking-wide text-builder-muted">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-builder-ink">{value}</p>
    </div>
  );
}
