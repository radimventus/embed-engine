export function AuditSummary() {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-4">
      <div className="border border-embed-white px-6 py-3 text-sm text-embed-white">
        Mám vlastní pozemek
      </div>
      <div className="bg-embed-status-warning px-6 py-3 text-sm text-embed-white">
        Hledám vhodnou parcelu
      </div>
    </div>
  );
}
