import { useState, type ReactNode } from 'react';
import { useOptionalDecisionAnalytics } from '../analytics';
import { HeaderHoverMenu } from './HeaderHoverMenu';
import { useDecisionSessionRuntime } from '../runtime/DecisionSessionRuntimeProvider';
import { buildClientOutputSnapshot } from '../client-output/clientOutputSnapshot';
import { downloadClientOutput, submitClientOutput } from '../client-output/clientOutputClient';

type HeaderSaveMenuProps={readonly icon:ReactNode};
const PDF_HINT='PDF vychází z aktuálního domu, vašich priorit a ověřených informací o domě.';
export function HeaderSaveMenu({icon}:HeaderSaveMenuProps){const analytics=useOptionalDecisionAnalytics();const runtime=useDecisionSessionRuntime();const[phase,setPhase]=useState<'idle'|'loading'|'success'|'error'>('idle');return <HeaderHoverMenu label="Stáhnout PDF" icon={icon} panelTestId="header-save-panel"><button type="button" role="menuitem" disabled={phase==='loading'} className="w-full cursor-pointer border-0 bg-transparent p-0 text-left text-sm font-semibold underline decoration-white/50 underline-offset-2 hover:decoration-white" style={{borderStyle:'none',backgroundColor:'transparent',color:'#FFFFFF'}} onClick={async()=>{analytics?.experienceEvent({experienceEventType:'house.saved',surfaceId:'hero'});setPhase('loading');try{const output=await submitClientOutput({snapshot:buildClientOutputSnapshot(runtime,'UNIVERSAL'),trigger:'HEADER'});downloadClientOutput(output,runtime.experience.house.title);setPhase('success');}catch{setPhase('error');}}}>{phase==='loading'?'Připravuji PDF…':'Stáhnout osobní PDF'}</button>{phase==='success'?<p role="status" className="mt-2 text-xs">PDF je připravené ke stažení.</p>:null}{phase==='error'?<p role="alert" className="mt-2 text-xs">PDF se nepodařilo připravit. Zkuste to prosím znovu.</p>:null}<p className="mt-2.5 text-xs leading-snug" style={{color:'rgba(255,255,255,0.8)'}}>{PDF_HINT}</p></HeaderHoverMenu>;}
