import { useState, type ReactNode } from 'react';

import { useOptionalDecisionAnalytics } from '../analytics';
import { HeaderHoverMenu } from './HeaderHoverMenu';
import { useDecisionSessionRuntime } from '../runtime/DecisionSessionRuntimeProvider';
import { buildClientOutputSnapshot } from '../client-output/clientOutputSnapshot';
import { submitClientOutput } from '../client-output/clientOutputClient';

type HeaderSaveMenuProps = {
  readonly icon: ReactNode;
};

const PDF_HINT =
  'Doporučujeme nejprve nastavit priority ve střední části stránky, aby export obsahoval vaše preference.';

/**
 * Print / Save-as-PDF for the current Experience page (CAP UX 57).
 * Browser print dialog is the delivery path until Builder owns export.
 */
/**
 * Uložit — hover panel with PDF action (CAP UX 57).
 */
export function HeaderSaveMenu({ icon }: HeaderSaveMenuProps) {
  const analytics = useOptionalDecisionAnalytics();
  const runtime = useDecisionSessionRuntime();
  const [email,setEmail]=useState('');const[phase,setPhase]=useState<'idle'|'loading'|'success'|'error'>('idle');

  return (
    <HeaderHoverMenu label="Odeslat" icon={icon} panelTestId="header-save-panel">
      <label className="block text-xs font-semibold" htmlFor="client-output-email">E-mail příjemce</label>
      <input id="client-output-email" type="email" required value={email} disabled={phase==='loading'} onChange={event=>setEmail(event.target.value)} className="mt-2 w-full rounded-md border border-white/40 bg-white px-3 py-2 text-sm text-[#001930]" placeholder="vas@email.cz" />
      <button
        type="button"
        role="menuitem"
        className="w-full cursor-pointer border-0 bg-transparent p-0 text-left text-sm font-semibold underline decoration-white/50 underline-offset-2 hover:decoration-white"
        style={{
          borderStyle: 'none',
          backgroundColor: 'transparent',
          color: '#FFFFFF',
        }}
        disabled={phase==='loading'||!email.trim()}
        onClick={async () => {
          analytics?.experienceEvent({
            experienceEventType: 'house.saved',
            surfaceId: 'hero',
          });
          setPhase('loading');try{const result=await submitClientOutput({snapshot:buildClientOutputSnapshot(runtime),recipient:email.trim(),trigger:'HEADER'});setPhase(result.deliveryStatus==='SENT'?'success':'error');}catch{setPhase('error');}
        }}
      >
        {phase==='loading'?'Připravuji výstup…':'Odeslat osobní PDF'}
      </button>
      {phase==='success'?<p role="status" className="mt-2 text-xs">Výstup byl odeslán.</p>:null}
      {phase==='error'?<p role="alert" className="mt-2 text-xs">Výstup se nepodařilo doručit. Zkuste to prosím znovu.</p>:null}
      <p className="mt-2.5 text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.8)' }}>
        {PDF_HINT}
      </p>
    </HeaderHoverMenu>
  );
}
