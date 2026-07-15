export function ClientStudioSidebar() {
  return (
    <aside className="flex w-sidebar shrink-0 flex-col items-center gap-section bg-embed-brand-navy py-section">
      <button
        type="button"
        aria-label="Menu"
        className="flex flex-col items-center justify-center gap-1.5 p-2"
      >
        <span className="block h-px w-5 bg-embed-white" />
        <span className="block h-px w-5 bg-embed-white" />
        <span className="block h-px w-5 bg-embed-white" />
      </button>
      <button type="button" aria-label="Domů" className="p-2">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-6 w-6 fill-embed-white"
        >
          <path d="M12 3 3 10v11h6v-7h6v7h6V10L12 3z" />
        </svg>
      </button>
    </aside>
  );
}
