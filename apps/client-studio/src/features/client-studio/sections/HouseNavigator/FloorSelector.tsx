export function FloorSelector() {
  return (
    <div className="mt-section grid grid-cols-2 gap-px">
      <button
        type="button"
        className="border border-embed-brand-navy bg-embed-white py-3 text-sm text-embed-brand-navy"
      >
        PŘÍZEMÍ
      </button>
      <button type="button" className="bg-embed-status-info py-3 text-sm text-embed-white">
        PATRO
      </button>
    </div>
  );
}
