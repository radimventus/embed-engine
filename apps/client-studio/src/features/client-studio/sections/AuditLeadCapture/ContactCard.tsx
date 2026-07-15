export function ContactCard() {
  return (
    <div className="mt-section border-t border-embed-white pt-section">
      <div className="grid grid-cols-2 gap-section text-sm leading-relaxed text-embed-white mobile:grid-cols-1 mobile:text-center">
        <div>
          <p>Asrav s.r.o.</p>
          <p>Budějická 765, Lierec</p>
          <p>IČ: 123 456 88</p>
        </div>
        <div className="text-right mobile:text-center">
          <p>+420 987 654 321</p>
          <p>kontakt@astav.cz</p>
        </div>
      </div>
    </div>
  );
}
