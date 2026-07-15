export function AuditSummary() {
  return (
    <div className="mx-auto mt-section grid w-full max-w-xl grid-cols-2 gap-section">
      <div className="bg-embed-white px-section py-3 text-center text-sm text-embed-brand-navy">
        Mám vlastní pozemek
      </div>
      <div className="bg-embed-status-warning px-section py-3 text-center text-sm text-embed-white">
        Hledám vhodnou parcelu
      </div>
    </div>
  );
}
