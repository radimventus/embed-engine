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
await page.goto(`${process.env.DIAGNOSTIC_URL ?? 'http://127.0.0.1:4179/'}?studio=client`);
await page.waitForTimeout(5000);
if (process.argv.includes('--pacing')) {
  const measure = async (name,targetSelector,action) => {
    await page.evaluate(targetSelector => {
      delete document.documentElement.dataset.pinnedNavigationTiming;
      const trace={writes:[],frames:[],mutations:[],longTasks:[],layoutShifts:[]};
      const original=window.scrollTo.bind(window);
      window.scrollTo=(...args)=>{const before=scrollY;original(...args);trace.writes.push({at:performance.now(),before,after:scrollY,requested:args[0].top,stack:new Error().stack});};
      const mutationObserver=new MutationObserver(records=>trace.mutations.push({at:performance.now(),count:records.length,records:records.map(record=>({type:record.type,attribute:record.attributeName,target:record.target instanceof Element ? `${record.target.tagName.toLowerCase()}#${record.target.id}.${record.target.className}` : record.target.nodeName}))}));
      mutationObserver.observe(document.querySelector('[data-guided-journey]'),{childList:true,subtree:true,attributes:true});
      const observers=[];
      for(const type of ['longtask','layout-shift']) try {const observer=new PerformanceObserver(list=>{for(const entry of list.getEntries()) trace[type==='longtask'?'longTasks':'layoutShifts'].push({at:entry.startTime,duration:entry.duration,value:entry.value??0});});observer.observe({type,buffered:false});observers.push(observer);} catch {}
      let previous=performance.now();
      const sample=at=>{const target=document.querySelector(targetSelector);trace.frames.push({at,interval:at-previous,y:scrollY,targetY:target?scrollY+target.getBoundingClientRect().top:null,height:document.documentElement.scrollHeight});previous=at;if(!JSON.parse(document.documentElement.dataset.pinnedNavigationTiming??'[]').some(mark=>mark.mark==='target-reached'))requestAnimationFrame(sample);};
      requestAnimationFrame(sample);
      window.__finishPacing=()=>{mutationObserver.disconnect();observers.forEach(observer=>observer.disconnect());window.scrollTo=original;return trace;};
    },targetSelector);
    const actionAt=await page.evaluate(()=>performance.now());
    await action();
    await page.waitForFunction(()=>JSON.parse(document.documentElement.dataset.pinnedNavigationTiming??'[]').some(mark=>mark.mark==='target-reached'));
    const trace=await page.evaluate(()=>window.__finishPacing());
    const writes=trace.writes;
    assert.ok(writes.length>10,`${name}: expected RAF writes`);
    const from=writes[0].before,to=writes.at(-1).after,distance=to-from;
    const duration=Math.round(Math.min(1320,Math.max(816,768+Math.abs(distance)*.456)));
    const started=writes.at(-1).at-duration;
    const errors=writes.map(write=>{const p=Math.min(1,Math.max(0,(write.at-started)/duration));const eased=p*p*(3-2*p);return Math.abs(write.after-(from+distance*eased));});
    const intervals=writes.slice(1).map((write,index)=>write.at-writes[index].at);
    const first=writes[0].at,last=writes.at(-1).at;
    const writeErrors=writes.map(write=>Math.abs(write.after-write.requested));
    return{name,actionToFirstWriteMs:writes[0].at-actionAt,frames:writes.length,durationMs:last-first,distancePx:distance,interval:{median:[...intervals].sort((a,b)=>a-b)[Math.floor(intervals.length/2)],max:Math.max(...intervals),over20:intervals.filter(value=>value>20).length,over32:intervals.filter(value=>value>32).length,long:intervals.map((value,index)=>({at:writes[index+1].at,value})).filter(item=>item.value>20)},delta:{min:Math.min(...writes.map(write=>Math.abs(write.after-write.before))),max:Math.max(...writes.map(write=>Math.abs(write.after-write.before)))},trajectoryError:{actualVsRequestedMax:Math.max(...writeErrors),theoreticalMax:Math.max(...errors),theoreticalRms:Math.sqrt(errors.reduce((sum,value)=>sum+value*value,0)/errors.length)},targetPositions:[...new Set(trace.frames.filter(frame=>frame.at>=first&&frame.at<=last).map(frame=>frame.targetY))],documentHeights:[...new Set(trace.frames.filter(frame=>frame.at>=first&&frame.at<=last).map(frame=>frame.height))],scrollWriters:[...new Set(writes.map(write=>write.stack.split('\n')[2]))],mutationsBeforeFirstWrite:trace.mutations.filter(item=>item.at<first),mutationsDuringRaf:trace.mutations.filter(item=>item.at>=first&&item.at<=last),longTasksDuringRaf:trace.longTasks.filter(item=>item.at>=first&&item.at<=last),layoutShiftsDuringRaf:trace.layoutShifts.filter(item=>item.at>=first&&item.at<=last)};
  };
  await page.locator('[data-tour-back]').click(); await page.waitForTimeout(1500);
  const results=[];
  results.push(await measure('HERO→TOUR','#social-proof',()=>page.locator('[data-embed-hero-cta]').click()));
  results.push(await measure('TOUR→PRIORITY','#journey-scene-priority',()=>page.getByRole('button',{name:'Pokračovat →',exact:true}).click()));
  results.push(await measure('PRIORITY→RACIO','#journey-scene-racio',()=>page.getByRole('button',{name:'Přeskočit →',exact:true}).click()));
  for(const result of results){assert.equal(result.targetPositions.length,1,`${result.name}: stable target`);assert.equal(result.documentHeights.length,1,`${result.name}: stable document height`);assert.equal(result.scrollWriters.length,1,`${result.name}: one writer`);}
  console.log('PACING_PASS',JSON.stringify(results));
  await browser.close(); process.exit(0);
}
if (process.argv.includes('--sequence')) {
  const resetMarks = () => page.evaluate(() => { delete document.documentElement.dataset.pinnedNavigationTiming; });
  const waitForArrival = () => page.waitForFunction(() =>
    JSON.parse(document.documentElement.dataset.pinnedNavigationTiming ?? '[]')
      .some(mark => mark.mark === 'target-reached'));
  const current = () => page.evaluate(() => ({
    active: document.querySelector('[data-current-scene]')?.getAttribute('data-current-scene'),
    y: scrollY,
    hero: document.querySelector('#hero').getBoundingClientRect().top,
    social: document.querySelector('#social-proof').getBoundingClientRect().top,
    header: document.querySelector('[data-experience-header]').getBoundingClientRect().height,
  }));
  await page.getByRole('button',{name:'Pokračovat →',exact:true}).click();
  await page.waitForTimeout(1500);
  assert.equal((await current()).active,'journey-scene-priority');
  await resetMarks(); await page.waitForTimeout(500); await page.mouse.wheel(0,-160); await waitForArrival();
  const tour = await current();
  assert.equal(tour.active,'journey-scene-orientation');
  assert.ok(Math.abs(tour.social-tour.header)<1,'PRIORITY up lands on canonical TOUR/Social Proof');
  await resetMarks(); await page.waitForTimeout(500); await page.mouse.wheel(0,-160); await waitForArrival();
  const hero = await current();
  assert.ok(Math.abs(hero.hero-(hero.header+20))<1,'second up intent lands on canonical HERO anchor');
  await page.evaluate(() => { const hero=document.querySelector('#hero'); scrollTo({top:scrollY+hero.getBoundingClientRect().bottom-innerHeight,behavior:'instant'}); });
  await resetMarks(); await page.waitForTimeout(500); await page.mouse.wheel(0,160); await waitForArrival();
  const tourAgain = await current();
  assert.ok(Math.abs(tourAgain.social-tourAgain.header)<1,'HERO down lands on TOUR');
  await page.evaluate(() => { const boundary=document.querySelector('[data-journey-navigation-boundary="journey-scene-orientation"]'); scrollTo({top:scrollY+boundary.getBoundingClientRect().bottom-innerHeight,behavior:'instant'}); });
  await resetMarks(); await page.waitForTimeout(500); await page.mouse.wheel(0,160); await waitForArrival();
  const priority = await current();
  assert.equal(priority.active,'journey-scene-priority');
  console.log('SEQUENCE_PASS',JSON.stringify({priorityToTour:tour,tourToHero:hero,heroToTour:tourAgain,tourToPriority:priority}));
  await browser.close();
  process.exit(0);
}
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
