export function InputBar() {
  return (
    <div className="mt-4 flex border border-embed-border-default">
      <input
        type="text"
        readOnly
        placeholder="Zadejte svůj dotaz"
        className="flex-1 bg-embed-background-primary px-4 py-3 text-sm text-embed-foreground-primary placeholder:text-embed-foreground-muted"
      />
      <button type="button" className="bg-embed-neutral-900 px-6 py-3 text-sm text-embed-white">
        Odeslat
      </button>
    </div>
  );
}
