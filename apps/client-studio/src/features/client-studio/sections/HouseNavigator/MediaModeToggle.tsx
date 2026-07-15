export function MediaModeToggle() {
  return (
    <div className="mt-section grid grid-cols-2 gap-px">
      <button type="button" className="bg-embed-brand-navy py-3 text-sm text-embed-white">
        VIDEO
      </button>
      <button type="button" className="bg-embed-status-info py-3 text-sm text-embed-white">
        FOTKY
      </button>
    </div>
  );
}
