import { AUDIT_ACCENT, AUDIT_WHITE } from './audit-panel';

/** Journey conclusion hero — commercial conversion (CSCB-07). */
export function AuditTransition() {
  return (
    <div className="mx-auto w-full max-w-[61.6rem] px-section pb-10 pt-14 text-center mobile:pb-8 mobile:pt-12">
      <h1
        className="font-sans text-5xl font-bold leading-[1.1] tracking-tight mobile:text-4xl"
        style={{ color: AUDIT_WHITE }}
      >
        Připraveni na další krok?
      </h1>

      <p className="mx-auto mt-7 max-w-[52.8rem] font-sans text-xl font-normal leading-snug text-white/90 mobile:mt-5 mobile:text-lg">
        Máte za sebou prohlídku, priority i doporučení. Teď můžete pokračovat
        konzultací, nabídkou nebo schůzkou — podle toho, co vám dává smysl.
      </p>

      <p
        className="mx-auto mt-5 max-w-[52.8rem] font-sans text-xl font-semibold leading-snug mobile:text-lg"
        style={{ color: AUDIT_ACCENT }}
      >
        Bez nátlaku. Jedna poptávka, jeden další krok.
      </p>
    </div>
  );
}
