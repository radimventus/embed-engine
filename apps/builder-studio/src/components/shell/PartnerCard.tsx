type PartnerCardProps = {
  readonly name: string;
};

export function PartnerCard({ name }: PartnerCardProps) {
  return (
    <div>
      <div className="mb-3 text-xs uppercase tracking-[1px] text-[#7D8796]">
        Partner
      </div>
      <div className="mb-6 rounded-xl border border-builder-panelBorder bg-builder-panel px-4 py-3.5 font-semibold">
        {name}
      </div>
    </div>
  );
}
