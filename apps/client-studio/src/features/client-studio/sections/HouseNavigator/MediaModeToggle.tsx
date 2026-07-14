export function MediaModeToggle() {
  return (
    <div className="mt-4 grid grid-cols-2">
      <button type="button" className="bg-embed-neutral-900 py-3 text-sm text-embed-white">
        VIDEO
      </button>
      <button type="button" className="bg-embed-status-info py-3 text-sm text-embed-white">
        FOTKY
      </button>
    </div>
  );
}
