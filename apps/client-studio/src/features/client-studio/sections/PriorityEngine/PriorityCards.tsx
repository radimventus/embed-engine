const PRIORITY_CARD_COUNT = 10;

export function PriorityCards() {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Array.from({ length: PRIORITY_CARD_COUNT }, (_, index) => (
        <div key={index} className="aspect-square bg-embed-status-warning" />
      ))}
    </div>
  );
}
