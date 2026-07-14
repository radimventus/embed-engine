export function ContactCard() {
  return (
    <div className="mt-10 border-t border-embed-white pt-6">
      <div className="grid grid-cols-2 gap-4 text-sm text-embed-white">
        <div>
          <p>Asrav s.r.o.</p>
          <p>Budějická 765, Lierec</p>
          <p>IČ: 123 456 88</p>
        </div>
        <div className="text-right">
          <p>+420 987 654 321</p>
          <p>kontakt@astav.cz</p>
        </div>
      </div>
    </div>
  );
}
