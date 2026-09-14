import { AUDIT_ACCENT, AUDIT_MUTED, AUDIT_WHITE } from './audit-panel';
import type { LandOption } from './audit-panel';

export function SuccessState({landOption,onDownload}:{readonly landOption:LandOption;readonly onDownload?:()=>void}) {
  return (
    <div
      className="rounded-[8px] border px-6 py-8 text-center"
      style={{ borderColor: `${AUDIT_ACCENT}66` }}
      data-testid="lead-capture-success"
    >
      <p className="text-xl font-semibold" style={{ color: AUDIT_WHITE }}>
        Poptávka byla přijata.
      </p>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: AUDIT_MUTED }}>
        Vaše údaje jsme bezpečně uložili. Partner vás bude kontaktovat s dalším
        postupem.
      </p>
      {onDownload ? <button type="button" onClick={onDownload} className="mt-5 rounded-[8px] border-0 px-5 py-3 text-sm font-semibold" style={{backgroundColor:AUDIT_ACCENT,color:'#001930'}}>Stáhnout PDF – {landOption==='owned'?'Mám pozemek':'Hledám pozemek'}</button> : null}
    </div>
  );
}
