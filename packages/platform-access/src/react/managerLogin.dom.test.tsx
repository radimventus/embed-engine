import assert from 'node:assert/strict';
import test from 'node:test';
import {Window} from 'happy-dom';
import {login, loadPlatformSession, clearPlatformSession, resetUserRegistry, resetOperatorPartnerEnvironmentForTests} from '../index';

test('ordinary Office-host login and restored Manager session use Workspace, including MS click', async () => {
  resetUserRegistry();resetOperatorPartnerEnvironmentForTests();clearPlatformSession();
  const result=login({email:'manager@ac.local',password:'demo',rememberMe:false});
  assert.ok(result.ok);
  if(!result.ok) return;
  const serverSession={...result.session,activeStudioId:null,workspaceContext:null};
  clearPlatformSession();
  const window=new Window({url:'https://conis.cz/studio/office/'});
  const destinations:string[]=[];
  window.location.assign=(url:string|URL)=>{destinations.push(String(url));};
  window.location.replace=(url:string|URL)=>{destinations.push(String(url));};
  const globals={window,document:window.document,HTMLElement:window.HTMLElement,navigator:window.navigator,IS_REACT_ACT_ENVIRONMENT:true,
    fetch:async (url:unknown)=>String(url).endsWith('/login')?Response.json({ok:true,session:serverSession}):String(url).endsWith('/me')?Response.json(serverSession):Response.json({}, {status:503})};
  const previous=new Map(Object.keys(globals).map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  for(const [key,value] of Object.entries(globals)) Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});
  const {act}=await import('react');
  const {createRoot}=await import('react-dom/client');
  const {SessionProvider,usePlatformSession}=await import('./SessionProvider');
  let context!:ReturnType<typeof usePlatformSession>;
  function Probe(){context=usePlatformSession();return null;}
  const host=window.document.createElement('div');window.document.body.append(host);
  const root=createRoot(host as unknown as HTMLElement);
  try {
    await act(async()=>{root.render(<SessionProvider bindStudioId="office"><Probe/></SessionProvider>);});
    assert.equal(context.session?.activeStudioId,'manager','restore must not adopt Office host');
    await act(async()=>{await context.login({email:'manager@ac.local',password:'demo',rememberMe:false});});
    assert.equal(new URL(destinations.at(-1)!).pathname,'/studio/workspace/');
    assert.equal(new URL(destinations.at(-1)!).searchParams.get('studio'),'manager');
    assert.equal(loadPlatformSession()?.workspaceContext?.activeStudio,'manager');
    await act(async()=>context.selectStudio('manager'));
    assert.equal(new URL(destinations.at(-1)!).pathname,'/studio/workspace/');
    const count=destinations.length;
    await act(async()=>{context.selectStudio('office');context.selectStudio('builder');});
    assert.equal(destinations.length,count);
    const {PlatformAccessRoot}=await import('./PlatformAccessRoot');
    for(const studioId of ['office','builder','manager'] as const) {
      await act(async()=>root.render(<PlatformAccessRoot key={studioId} studioId={studioId}><div data-forbidden-content="true"/></PlatformAccessRoot>));
      assert.equal(host.querySelector('[data-forbidden-content]'),null,'standalone content must never render');
      assert.equal(new URL(destinations.at(-1)!).pathname,'/studio/workspace/');
    }
  } finally {
    await act(async()=>root.unmount());await window.happyDOM.abort();
    for(const [key,descriptor] of previous) {if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}
    clearPlatformSession();resetOperatorPartnerEnvironmentForTests();
  }
});
