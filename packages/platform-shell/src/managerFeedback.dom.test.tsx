import assert from 'node:assert/strict';
import test from 'node:test';
import {Window} from 'happy-dom';

for (const surface of ['office', 'manager', 'client', 'sales'] as const) test('Manager '+surface+' dialog preserves typing, focus, paste, and durable submission semantics', async () => {
  const window = new Window();
  const globals = {window, document: window.document, HTMLElement: window.HTMLElement, navigator: window.navigator, IS_REACT_ACT_ENVIRONMENT: true};
  const previous = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key,value] of Object.entries(globals)) Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});
  const {act} = await import('react');
  const {createRoot} = await import('react-dom/client');
  const {PlatformHeader} = await import('./PlatformHeader');
  const host = window.document.createElement('div');window.document.body.append(host);
  const root = createRoot(host as unknown as HTMLElement);
  let calls = 0;
  let resolve!: (value: {feedbackId:string}) => void;
  let reject!: (error:Error) => void;
  let sent = '';
  try {
    await act(async () => root.render(<PlatformHeader activeStudioId={surface} accountRole="manager" roleLabel="Manager" onLogout={() => undefined} onSubmitFeedback={message => {
      calls++;sent=message;return new Promise((yes,no) => {resolve=yes;reject=no;});
    }}/>));
    await act(async () => (host.querySelector('[aria-label="Poslat zpětnou vazbu"]') as unknown as HTMLButtonElement).click());
    assert.equal(host.querySelector('.platform-notify'),null);
    const textarea = window.document.querySelector('textarea')!;
    textarea.focus();
    const input = async (text:string, inputType='insertText') => {
      await act(async () => {
        // Native setter models browser input without updating React's value tracker.
        Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value')!.set!.call(textarea,text);
        textarea.dispatchEvent(new window.InputEvent('input',{bubbles:true,inputType,data:text.slice(-1)}));
      });
      assert.ok(window.document.querySelector('textarea') === textarea,'textarea must not remount');
      assert.ok(window.document.activeElement === textarea,'typing must retain focus');
      assert.equal(textarea.value,text);
      assert.ok(window.document.querySelector('[role="dialog"]'));
    };
    await input('A');await input('Ab');await input('Ab c');
    await input('Ab c vložený text','insertFromPaste');
    const form = window.document.querySelector('form')!;
    await act(async () => {
      form.dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
      form.dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
    });
    assert.equal(calls,1);assert.equal(sent,'Ab c vložený text');assert.equal(textarea.disabled,true);
    assert.equal(host.querySelector('[role="status"]'),null);
    await act(async () => reject(new Error('Persistence unavailable')));
    assert.ok(window.document.querySelector('[role="dialog"]'));
    assert.match(window.document.querySelector('[role="alert"]')!.textContent,/Persistence unavailable/);
    assert.equal(host.querySelector('[role="status"]'),null);
    assert.equal(textarea.value,'Ab c vložený text');
    await act(async () => form.dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})));
    await act(async () => resolve({feedbackId:'durable-record'}));
    assert.equal(calls,2);assert.equal(window.document.querySelector('[role="dialog"]'),null);
    assert.match(host.querySelector('[role="status"]')!.textContent,/uložena/);
    await act(async () => (host.querySelector('[aria-label="Uživatelské menu"]') as unknown as HTMLButtonElement).click());
    assert.deepEqual(Array.from(window.document.querySelectorAll('[role="menuitem"]')).map(item => item.textContent),['Odhlásit']);
  } finally {
    await act(async () => root.unmount());window.happyDOM.abort();
    for(const [key,descriptor] of previous) {if(descriptor) Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}
  }
});
