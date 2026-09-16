import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless: true});
const mobile = process.argv.includes('--mobile');
const context = await browser.newContext({viewport: mobile ? {width:390,height:844} : {width:1440,height:process.argv.includes('--tall')?1100:900},hasTouch:mobile});
const scope = {tenantId:'tenant-domy-s-energii',companyId:'company-domy-s-energii',workspaceId:'domy-s-energii-main',projectId:'project-domy-s-energii',activeHouseId:'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk'};
const session = {...scope,user:{id:'user-radim',email:'radim@conis.local',displayName:'Local diagnostic',roles:['conis-admin'],status:'active',lastLoginAt:null,lastActivityAt:null,lastStudioId:'client'},activeStudioId:'client',workspaceContext:{...scope,operatorMode:true,partnerId:'company-domy-s-energii',activeStudio:'client',officeReturnHref:'/office/',previous:{...scope}},rememberMe:false,issuedAt:new Date().toISOString(),expiresAt:null,lastLoginAt:new Date().toISOString()};
// Never contact production, including analytics and mutation endpoints.
await context.route('**/*', route => {
  const url = new URL(route.request().url());
  if (url.hostname === '127.0.0.1') return route.continue();
  if (url.pathname === '/public/auth/me') return route.fulfill({json:session});
  return route.fulfill({status:404,json:{error:'offline diagnostic'}});
});
const page = await context.newPage();
page.on('pageerror', error => console.error(error.message));
await page.goto('http://127.0.0.1:4179/?studio=client');
await page.waitForTimeout(5000);
if (process.argv.includes('--ownership')) {
  const cdp = await context.newCDPSession(page);
  await page.evaluate(() => {
    delete document.documentElement.dataset.pinnedNavigationTiming;
    window.__ownership = {writes: [], events: [], before: {
      behavior: document.documentElement.style.scrollBehavior,
      snap: document.documentElement.style.scrollSnapType,
      anchor: document.documentElement.style.overflowAnchor,
    }};
    const original = window.scrollTo.bind(window);
    window.scrollTo = (...args) => {
      const before = scrollY;
      original(...args);
      const target = document.getElementById('journey-scene-priority');
      window.__ownership.writes.push({at: performance.now(), before, after: scrollY,
        requested: args[0].top, target: target ? target.getBoundingClientRect().top + scrollY : null});
    };
    for (const name of ['wheel', 'touchmove']) window.addEventListener(name, event => {
      window.__ownership.events.push({name,at: performance.now(),blocked:event.defaultPrevented,trusted:event.isTrusted});
    });
  });
  await page.getByRole('button',{name:'Pokračovat →',exact:true}).click();
  await page.waitForFunction(() => window.__ownership.writes.length > 0);
  await page.mouse.move(mobile ? 200 : 900, 500);
  if (mobile) await cdp.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{x:200,y:600}]});
  let tick = 0;
  while (!await page.evaluate(() => JSON.parse(document.documentElement.dataset.pinnedNavigationTiming ?? '[]').some(m => m.mark === 'target-reached'))) {
    if (mobile) await cdp.send('Input.dispatchTouchEvent', {type:'touchMove',touchPoints:[{x:200,y:tick++ % 2 ? 580 : 540}]});
    else await page.mouse.wheel(0, tick++ % 2 ? -45 : 45);
    await page.waitForTimeout(12);
    assert.ok(tick < 150, 'animation must complete');
  }
  const arrived = await page.evaluate(() => ({y:scrollY,at:performance.now(),trace:window.__ownership,
    styles:{behavior:document.documentElement.style.scrollBehavior,snap:document.documentElement.style.scrollSnapType,anchor:document.documentElement.style.overflowAnchor},
    marks:JSON.parse(document.documentElement.dataset.pinnedNavigationTiming)}));
  const reached = arrived.marks.find(m=>m.mark==='target-reached').at;
  const writes = arrived.trace.writes.filter(w=>w.at<=reached);
  const deviations = writes.slice(1).filter((w,i)=>w.before!==writes[i].after);
  assert.equal(deviations.length,0,'no native forward OR backward deviation between RAF writes');
  const direction = Math.sign(writes.at(-1).after-writes[0].before);
  assert.ok(writes.every(w=>(w.after-w.before)*direction>=0),'monotonic trajectory');
  assert.equal(new Set(writes.map(w=>w.target)).size,1,'stable target');
  const input = arrived.trace.events.filter(e=>e.at<=reached);
  assert.ok(input.length>2 && input.every(e=>e.blocked && e.trusted),'real native input is consumed during animation');
  assert.deepEqual(arrived.styles,arrived.trace.before,'all temporary scroll styles restored');
  if (mobile) {
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:200,y:600}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:200,y:510}]});
  } else await page.mouse.wheel(0,45);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const after = await page.evaluate(()=>({y:scrollY,at:performance.now(),events:window.__ownership.events}));
  if (mobile) await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.notEqual(after.y,arrived.y,'first real input after completion must move the viewport without a timer');
  assert.ok(after.events.filter(e=>e.at>reached).some(e=>!e.blocked && e.trusted),'native input released');
  assert.equal(await page.locator('[data-journey-scene]').count(),2,'input during animation cannot open another scene');
  console.log('OWNERSHIP_PASS',JSON.stringify({mobile,frames:writes.length,inputs:input.length,deviations:deviations.length,arrivalY:arrived.y,nextInputY:after.y,reached,observedAt:arrived.at,stylesRestored:true}));
  await browser.close();
  process.exit(0);
}
if (!mobile) {
  const heroTargets=[];
  for (const mode of ['button','pinned']) {
    await page.locator('[data-tour-back]').click();
    await page.waitForTimeout(1600);
    const expected=await page.evaluate(()=>scrollY+document.querySelector('#social-proof').getBoundingClientRect().top-Math.ceil(document.querySelector('[data-experience-header]').getBoundingClientRect().height));
    await page.evaluate(()=>{delete document.documentElement.dataset.pinnedNavigationTiming;});
    if(mode==='button') await page.locator('[data-embed-hero-cta]').click();
    else {
      // Finish reading HERO, without reaching the Social Proof landing yet.
      await page.evaluate(()=>{const hero=document.querySelector('#hero');window.scrollTo({top:Math.max(0,scrollY+hero.getBoundingClientRect().bottom-innerHeight),behavior:'instant'});});
      await page.mouse.move(900,500);
      await page.mouse.wheel(0,160);
    }
    await page.waitForTimeout(1600);
    const actual=await page.evaluate(()=>scrollY);
    console.log('HERO_GEOMETRY',mode,JSON.stringify(await page.evaluate(()=>({y:scrollY,max:document.documentElement.scrollHeight-innerHeight,social:document.querySelector('#social-proof').getBoundingClientRect().toJSON(),header:document.querySelector('[data-experience-header]').getBoundingClientRect().toJSON(),timing:document.documentElement.dataset.pinnedNavigationTiming}))));
    assert.ok(Math.abs(actual-expected)<1, `${mode}: ${actual} != historical ${expected}`);
    heroTargets.push({mode,expected,actual,timing:await page.evaluate(()=>JSON.parse(document.documentElement.dataset.pinnedNavigationTiming??'[]'))});
  }
  console.log('HERO_TARGETS',JSON.stringify(heroTargets));
}
await page.evaluate(() => {
  window.__trace = {writes:[],frames:[]};
  const original = window.scrollTo.bind(window);
  delete document.documentElement.dataset.pinnedNavigationTiming;
  window.scrollTo = (...args) => { window.__trace.writes.push({at:performance.now(),args,stack:new Error().stack}); original(...args); };
  let previous=scrollY;
  const sample = at => {
    const marks=JSON.parse(document.documentElement.dataset.pinnedNavigationTiming??'[]');
    if(marks.some(m=>m.mark==='target-reached')) {
      const wheel=new WheelEvent('wheel',{deltaY:5,bubbles:true,cancelable:true});
      const touch=new TouchEvent('touchmove',{bubbles:true,cancelable:true});
      window.dispatchEvent(wheel);window.dispatchEvent(touch);
      const before=scrollY;window.scrollBy({top:5,behavior:'instant'});
      window.__trace.arrival={at,wheelBlocked:wheel.defaultPrevented,touchBlocked:touch.defaultPrevented,manualDelta:scrollY-before};
      return;
    }
    const target=document.querySelector('#journey-scene-priority');
    window.__trace.frames.push({at,y:scrollY,delta:scrollY-previous,target:target?target.getBoundingClientRect().top+scrollY:null,height:document.documentElement.scrollHeight,snap:getComputedStyle(document.documentElement).scrollSnapType});
    previous=scrollY; if(window.__trace.frames.length<300) requestAnimationFrame(sample);
  };requestAnimationFrame(sample);
});
console.log('INITIAL',await page.evaluate(() => ({y:scrollY,header:document.querySelector('[data-experience-header]').getBoundingClientRect().toJSON(),social:document.querySelector('#social-proof').getBoundingClientRect().toJSON()})));
await page.getByRole('button',{name:'Pokračovat →',exact:true}).click();
await page.waitForTimeout(250);
await page.mouse.move(mobile ? 200 : 900,500);
for(let i=0;i<70;i++){await page.mouse.wheel(0,45);await page.waitForTimeout(20);}
await page.waitForTimeout(2600);
const trace=await page.evaluate(() => window.__trace);
console.log('TRACE',JSON.stringify(trace));
const moving=trace.frames.filter(f=>f.target!==null&&f.at>=trace.writes[0].at&&f.at<=trace.writes.at(-1).at);
const direction=Math.sign(trace.writes.at(-1).args[0].top-trace.writes[0].args[0].top);
assert.equal(moving.filter(f=>f.delta*direction<0).length,0,'native input must not reverse the RAF trajectory');
assert.equal(new Set(moving.map(f=>f.target)).size,1,'target geometry must remain stable');
assert.equal(new Set(moving.map(f=>f.height)).size,1,'render must finish before movement');
assert.equal(new Set(trace.writes.map(w=>w.stack.split('\n')[2])).size,1,'one JS writer');
assert.equal(trace.arrival.wheelBlocked,false,'wheel permitted on the first frame after arrival');
assert.equal(trace.arrival.touchBlocked,false,'touch permitted on the first frame after arrival');
assert.ok(trace.arrival.manualDelta>0,'viewport can move on the first frame after arrival');
assert.equal(await page.locator('[data-journey-scene]').count(),2,'one continuous gesture must not open another scene');
console.log('BUTTONS',await page.getByRole('button').allTextContents());
await page.getByRole('button',{name:'Přeskočit →',exact:true}).click();
await page.waitForTimeout(2600);
console.log('RACIO',await page.getByRole('button').allTextContents());
await page.getByRole('button',{name:'Pokračovat →',exact:true}).last().click();
await page.waitForTimeout(2600);
await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
const box=await page.evaluate(()=>{
 const copyright=[...document.querySelectorAll('p')].find(e=>e.textContent.includes('©'));
 const row=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return{element:e.tagName+'#'+e.id+'.'+e.className,contentHeight:r.height-parseFloat(s.paddingTop)-parseFloat(s.paddingBottom)-parseFloat(s.borderTopWidth)-parseFloat(s.borderBottomWidth),minHeight:s.minHeight,paddingBottom:s.paddingBottom,marginBottom:s.marginBottom,gap:s.gap,display:s.display,flex:s.flex,grid:s.gridTemplateRows,bottom:r.bottom+scrollY}};
 const ancestors=[];for(let e=copyright;e;e=e.parentElement)ancestors.push(row(e));
 return{scrollHeight:document.documentElement.scrollHeight,bodyScrollHeight:document.body.scrollHeight,scrollY,viewportBottom:scrollY+innerHeight,ancestors,rail:row(document.querySelector('[data-studio-shell="sidebar"]')),shell:row(document.querySelector('[data-studio-shell="app"]'))};
});
console.log('BOX',JSON.stringify(box));
if(!mobile){
  const copyright=box.ancestors[0];
  assert.ok(Math.abs(copyright.bottom-box.shell.bottom)<1,'no spacer after copyright');
  assert.ok(Math.abs(box.rail.bottom-box.shell.bottom)<1,'rail ends at shell');
  assert.ok(Math.abs(box.scrollHeight-box.shell.bottom)<1,'document ends at shell');
} else {
  assert.ok(box.scrollHeight>=box.ancestors[0].bottom,'copyright remains reachable');
  assert.ok(box.ancestors.find(r=>r.element.startsWith('BODY')).paddingBottom==='300px','mobile clipping reserve retained');
}
console.log('RUNTIME_ASSERTIONS=PASS');
console.log('SCENES',await page.locator('[data-journey-scene]').evaluateAll(es=>es.map(e=>e.id)));
await browser.close();
