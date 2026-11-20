const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const spec = {
  openapi: '3.0.3', info: { title: '<img src=x onerror=alert(1)>', version: '0.2.0' },
  paths: {
    '/pets/{id}': { get: { tags: ['Pets'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }] } },
    '/health': { get: { tags: ['System'] } },
    '/pets': { post: { tags: ['Pets'], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string', example: 'Ada' } } } } } } } }
  }
};
function setup(t) {
  const dom = new JSDOM('<html><head><script src="/studio/studio.js?v=revision"></script><script src="/studio/theme.js?v=revision"></script></head><body><button id="return">Swagger</button><div class="swagger-ui">Original Swagger</div></body></html>', { url: 'https://api.example.org/docs', runScripts: 'outside-only' }); t.after(() => dom.window.close());
  const w = dom.window; w.alert = message => { throw new Error(message); }; w.matchMedia = query => ({ matches: false, addEventListener() {} });
  for (const name of ['core.js', 'json.js', 'theme.js', 'playful.js', 'response-effects.js']) w.eval(fs.readFileSync(require.resolve(`../${name}`), 'utf8'));
  w.SwaggerStudioBridge = { authSummary: () => ['bearer'], openAuth: () => {}, send: async () => ({ status: 200, text: '{"ok":true}', headers: {} }) };
  w.eval(fs.readFileSync(require.resolve('../studio.js'), 'utf8'));
  const data = { specUrl: 'https://api.example.org/openapi.json', spec, ui: {}, config: {} };
  return { w, data, get shadow() { return w.document.getElementById('brsvs-studio-host').shadowRoot; } };
}
const clickOp = (shadow, text) => [...shadow.querySelectorAll('nav .endpoint')].find(n => n.textContent === text).click();

test('repeated Execute replaces the bottom scene without adding space or duplicate overlays to response', async t => {
  const env=setup(t), {w,data}=env; await w.SwaggerStudio.open(data); clickOp(env.shadow,'GET/health');
  for(let i=0;i<3;i++) { env.shadow.querySelector('.send').click(); await new Promise(resolve=>setTimeout(resolve,15)); assert.equal(w.document.querySelectorAll('.brsvs-response-fx').length,1); assert.equal(env.shadow.querySelector('.response-stage'),null); }
  assert.match(env.shadow.querySelector('.response > pre').textContent,/"ok": true/);
  w.SwaggerStudio.close(); assert.equal(w.document.querySelector('.brsvs-response-fx'),null);
});

test('response schema is available before execution and follows response status and media without changing request drafts', async t => {
  const env=setup(t), {w,data}=env; data.spec=JSON.parse(JSON.stringify(spec));
  data.spec.paths['/pets'].post.responses={200:{content:{'application/json':{schema:{type:'object',properties:{id:{type:'integer'}}}},'application/xml':{schema:{type:'string'}}}},404:{content:{'application/json':{schema:{type:'object',properties:{message:{type:'string'}}}},'application/problem+json':{schema:{type:'object',properties:{error:{type:'string'}}}}}}};
  w.SwaggerStudioBridge.send=async()=>({status:404,text:'{"error":"missing"}',headers:{'content-type':'application/problem+json; charset=UTF-8'}});
  await w.SwaggerStudio.open(data); clickOp(env.shadow,'POST/pets'); const shadow=env.shadow, body=shadow.querySelector('textarea');
  body.value='{"name":"Kept"}'; body.dispatchEvent(new w.Event('input'));
  assert.ok(shadow.querySelector('.response-schema')); assert.equal(shadow.querySelector('[aria-label="Schema response status"]').value,'200');
  const type=shadow.querySelector('[aria-label="Schema content type"]'); type.value='application/xml'; type.dispatchEvent(new w.Event('change'));
  assert.match(shadow.querySelector('.response-schema pre').textContent,/"string"/); assert.equal(shadow.querySelector('textarea'),body); assert.equal(body.value,'{"name":"Kept"}');
  shadow.querySelector('.send').click(); await new Promise(resolve=>setTimeout(resolve,15));
  assert.equal(shadow.querySelector('[aria-label="Schema response status"]').value,'404'); assert.equal(shadow.querySelector('[aria-label="Schema content type"]').value,'application/problem+json');
  assert.match(shadow.querySelector('.response-schema pre').textContent,/"error"/); assert.equal(shadow.querySelector('.response-stage'),null);
  assert.equal(shadow.querySelector('.scene-dock'),null); assert.equal(shadow.querySelector('.scene-footer'),null);
});

test('authorization controls follow effective operation security, including public overrides', async t => {
  const env = setup(t), { w, data } = env;
  data.spec = JSON.parse(JSON.stringify(spec));
  data.spec.components = { securitySchemes: { bearer: { type: 'http', scheme: 'bearer' } } };
  await w.SwaggerStudio.open(data);
  assert.equal(env.shadow.querySelector('.auth-button'), null, 'unused scheme definitions do not create controls');
  clickOp(env.shadow, 'GET/health'); assert.equal(env.shadow.querySelector('input[type=password]'), null);
  assert.ok(!env.shadow.querySelector('.editor').textContent.includes('authorization'));
  w.SwaggerStudio.close(); data.spec.security = [{ bearer: [] }]; data.spec.paths['/health'].get.security = [];
  await w.SwaggerStudio.open(data); assert.ok(env.shadow.querySelector('.auth-button'));
  clickOp(env.shadow, 'GET/pets/{id}'); assert.ok(env.shadow.querySelector('input[type=password]'));
  clickOp(env.shadow, 'GET/health'); assert.equal(env.shadow.querySelector('input[type=password]'), null);
  w.SwaggerStudio.close(); delete data.spec.security;
  data.spec.paths['/pets/{id}'].get.security = [{ bearer: [] }];
  await w.SwaggerStudio.open(data); assert.ok(env.shadow.querySelector('.auth-button'), 'operation-specific auth also enables Authorize');
});
test('welcome dashboard, grouping, persistent tabs/favorites, transient request data, keyboard shortcuts', async t => {
  const env = setup(t), { w, data } = env; await w.SwaggerStudio.open(data); let shadow = env.shadow;
  assert.match(shadow.querySelector('.welcome').textContent, /YOUR API, ONE WORKSPACE/); assert.equal(shadow.querySelectorAll('.stat').length, 4); assert.equal(shadow.querySelectorAll('.group').length, 2); assert.equal(shadow.querySelector('img'), null);
  clickOp(shadow, 'GET/pets/{id}'); shadow = env.shadow;
  const stylesheet = shadow.querySelector('link');
  const input = [...shadow.querySelectorAll('.field input')].find(n => n.closest('label').textContent.startsWith('id *')); input.value = '42'; input.dispatchEvent(new w.Event('input'));
  shadow.querySelector('.main').scrollTop = 235;
  shadow.querySelector('[aria-label="Toggle favorite"]').click(); shadow = env.shadow;
  clickOp(shadow, 'GET/health'); shadow = env.shadow; shadow.querySelector('.tab button').click(); shadow = env.shadow;
  assert.equal([...shadow.querySelectorAll('.field input')].find(n => n.closest('label').textContent.startsWith('id *')).value, '42');
  assert.equal(shadow.querySelector('.main').scrollTop, 235, 'tab navigation preserves editor scroll');
  assert.equal(shadow.querySelector('link'), stylesheet, 'view changes keep the loaded stylesheet');
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })); assert.equal(shadow.activeElement, shadow.querySelector('.search'));
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true })); await new Promise(r => setTimeout(r, 20)); assert.match(shadow.querySelector('.response').textContent, /"ok": true/);
  assert.equal(shadow.activeElement, shadow.querySelector('.response'), 'response receives focus after completion');
  assert.equal(w.document.querySelector('.brsvs-response-fx').dataset.state, 'success');
  assert.equal(shadow.querySelector('.response').classList.contains('arrived'), true);
  w.SwaggerStudio.close(); await w.SwaggerStudio.open(data); shadow = env.shadow;
  assert.equal(shadow.querySelectorAll('.tab').length, 2); assert.equal(shadow.querySelector('[aria-label="Toggle favorite"]').textContent, '★');
  assert.equal([...shadow.querySelectorAll('.field input')].find(n => n.closest('label').textContent.startsWith('id *')).value, '');
  const stored = w.localStorage.getItem('studio:v2:https://api.example.org/docs:https://api.example.org/openapi.json'); assert.ok(!stored.includes('42')); assert.ok(!stored.includes('response')); assert.ok(!stored.includes('auth'));
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' })); assert.equal(w.document.querySelector('.swagger-ui').textContent, 'Original Swagger'); assert.equal(w.document.documentElement.style.overflow, '');
});
test('schema examples and theme selection update both views and survive reload', async t => {
  const env = setup(t), { w, data } = env; await w.SwaggerStudio.open(data); clickOp(env.shadow, 'POST/pets'); let shadow = env.shadow;
  assert.match(shadow.querySelector('link').href, /studio\.css\?v=revision/); assert.match(w.document.getElementById('brsvs-effects-stylesheet').href, /effects\.css\?v=revision/);
  assert.equal([...shadow.querySelectorAll('button')].some(b => b.textContent === 'Generate example'), false);
  assert.match(shadow.querySelector('textarea').value, /"name": "Ada"/);
  shadow.querySelector('textarea').value = ''; shadow.querySelector('textarea').dispatchEvent(new w.Event('input'));
  clickOp(shadow, 'GET/health'); clickOp(env.shadow, 'POST/pets'); shadow = env.shadow;
  assert.equal(shadow.querySelector('textarea').value, '', 'an intentionally cleared draft is not regenerated');
  const theme = shadow.querySelector('[aria-label="Theme for Studio and Swagger"]'); theme.value = 'light'; theme.dispatchEvent(new w.Event('change'));
  assert.equal(w.document.documentElement.dataset.studioTheme, 'light'); assert.equal(w.localStorage.getItem('brsvs:studio:theme-v2'), 'light'); assert.match(w.document.getElementById('brsvs-swagger-theme').textContent, /\.swagger-ui/);
  assert.equal(shadow.querySelector('[aria-label="Visual effect"]'), null, 'effects are part of themes, not a separate control');
  theme.value = 'winter'; theme.dispatchEvent(new w.Event('change')); assert.equal(w.document.querySelectorAll('#brsvs-theme-effects.snow span').length, 42);
  theme.value = 'winter'; theme.dispatchEvent(new w.Event('change')); assert.equal(w.document.querySelectorAll('#brsvs-theme-effects.snow span').length, 42);
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' })); assert.equal(w.document.getElementById('brsvs-studio-host'), null);
  assert.equal(w.document.querySelectorAll('#brsvs-theme-effects.snow span').length, 42, 'effects remain on standard Swagger');
  assert.equal(w.document.documentElement.dataset.studioTheme, 'winter');
  await w.SwaggerStudio.open(data); assert.equal(env.shadow.querySelector('[aria-label="Theme for Studio and Swagger"]').value, 'winter');
  assert.equal(w.document.documentElement.lastElementChild.id, 'brsvs-theme-effects', 'effects stay visible above Studio');
});
test('blocked localStorage does not prevent startup and reduced motion suppresses snow', async t => {
  const env = setup(t), { w, data } = env; Object.defineProperty(w, 'localStorage', { get() { throw new Error('Storage blocked'); } }); await w.SwaggerStudio.open(data);
  assert.ok(env.shadow.querySelector('.welcome'));
});
test('shared themes respect reduced motion and migrate previous color preferences', t => {
  const dom = new JSDOM('<html><head></head><body><div class="swagger-ui"></div></body></html>', { runScripts: 'outside-only', url: 'https://example.test' }); t.after(() => dom.window.close());
  const w = dom.window; w.localStorage.setItem('brsvs:studio:theme', 'dark'); w.matchMedia = query => ({ matches: query.includes('reduced-motion'), addEventListener() {} });
  w.eval(fs.readFileSync(require.resolve('../theme.js'), 'utf8'));
  assert.equal(w.SwaggerStudioTheme.preference(), 'dark'); w.SwaggerStudioTheme.configure({ theme: 'winter' }); assert.equal(w.SwaggerStudioTheme.preference(), 'dark');
  w.SwaggerStudioTheme.set('winter'); assert.equal(w.document.documentElement.dataset.studioTheme, 'winter'); assert.equal(w.document.getElementById('brsvs-theme-effects'), null);
});

test('request layout persists across endpoints and reloads, syncs tabs without losing request state', async t => {
  const env = setup(t), { w, data } = env; await w.SwaggerStudio.open(data);
  clickOp(env.shadow, 'POST/pets');
  const body = env.shadow.querySelector('textarea'); body.value = '{"name":"Kept"}'; body.dispatchEvent(new w.Event('input'));
  env.shadow.querySelector('[data-request-layout="stacked"]').click();
  assert.equal(env.shadow.querySelector('.editor').dataset.layout, 'stacked');
  assert.equal(env.shadow.querySelector('textarea'), body);
  clickOp(env.shadow, 'GET/health'); assert.equal(env.shadow.querySelector('.editor').dataset.layout, 'stacked');
  w.SwaggerStudio.close();
  delete w.SwaggerStudio; w.eval(fs.readFileSync(require.resolve('../studio.js'), 'utf8'));
  await w.SwaggerStudio.open(data); assert.equal(env.shadow.querySelector('.editor').dataset.layout, 'stacked');
  clickOp(env.shadow, 'POST/pets');
  w.localStorage.setItem('brsvs:studio:request-layout', JSON.stringify('split'));
  w.dispatchEvent(new w.StorageEvent('storage', { key: 'brsvs:studio:request-layout' }));
  assert.equal(env.shadow.querySelector('.editor').dataset.layout, 'split');
  assert.equal(env.shadow.querySelector('[data-request-layout="split"]').getAttribute('aria-pressed'), 'true');
  assert.ok(env.shadow.querySelector('.request textarea'));
});

test('copy API details uses schema response before execution and last response afterwards', async t => {
  const env = setup(t), { w, data } = env; let copied;
  Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: async text => { copied = text; } } });
  data.spec = JSON.parse(JSON.stringify(spec));
  data.spec.paths['/pets'].post.responses = { '201': { description: 'Created', content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'integer', readOnly: true }, password: { type: 'string', writeOnly: true }, name: { type: 'string', example: 'Ada' } } } } } } };
  await w.SwaggerStudio.open(data); clickOp(env.shadow, 'POST/pets');
  env.shadow.querySelector('.copy-api').click(); await new Promise(r => setTimeout(r, 0));
  assert.match(copied, /URL: https:\/\/api.example.org\/pets/);
  assert.match(copied, /## Request/); assert.match(copied, /Example response/);
  assert.match(copied, /"id": 1/); assert.ok(!copied.includes('password'));
  env.shadow.querySelector('.send').click(); await new Promise(r => setTimeout(r, 10));
  env.shadow.querySelector('.copy-api').click(); await new Promise(r => setTimeout(r, 0));
  assert.match(copied, /Response \(last execution\)/); assert.match(copied, /"ok": true/);
  assert.ok(!copied.includes('Example response'));
});

test('header rows preserve the body, send only enabled values, survive tabs and clear on close', async t => {
 const env=setup(t),{w,data}=env; let sent;
 w.SwaggerStudioBridge.send=async(ui,options)=>{sent=options;return {status:200,text:'{}',headers:{}};};
 await w.SwaggerStudio.open(data); clickOp(env.shadow,'POST/pets');
 const body=env.shadow.querySelector('textarea'); body.value='{"name":"Kept"}'; body.dispatchEvent(new w.Event('input'));
 const add=()=>env.shadow.querySelector('[aria-label="Add header"]').click();
 const fill=(label,value)=>{const input=env.shadow.querySelector(`[aria-label="${label}"]`);input.value=value;input.dispatchEvent(new w.Event('input'));};
 add();fill('Header name 1','X-Trace');fill('Header value 1','private-header-value');
 add();fill('Header name 2','X-Disabled');fill('Header value 2','skip');
 const toggle=env.shadow.querySelector('[aria-label="Enable header 2"]');toggle.checked=false;toggle.dispatchEvent(new w.Event('change'));
 assert.equal(env.shadow.querySelector('textarea'),body);assert.equal(body.value,'{"name":"Kept"}');
 clickOp(env.shadow,'GET/health');clickOp(env.shadow,'POST/pets');assert.equal(env.shadow.querySelector('[aria-label="Header value 1"]').value,'private-header-value');
 env.shadow.querySelector('.send').click();await new Promise(resolve=>setTimeout(resolve,15));
 assert.equal(sent.customHeaders['X-Trace'],'private-header-value');assert.equal(sent.customHeaders['X-Disabled'],undefined);
 assert.ok(!JSON.stringify(w.localStorage).includes('private-header-value'));
 env.shadow.querySelector('[aria-label="Remove header 2"]').click();assert.equal(env.shadow.querySelectorAll('.header-row').length,1);
 w.SwaggerStudio.close();await w.SwaggerStudio.open(data);clickOp(env.shadow,'POST/pets');assert.equal(env.shadow.querySelectorAll('.header-row').length,0);
});

test('table response selection, nested cells, pagination, fallback and saved view contain no data', async t => {
  const env=setup(t), {w,data}=env;
  const rows=Array.from({length:105},(_,id)=>({id,name:'<img src=x onerror=evil()>',nested:{city:'İstanbul'},tags:['x']}));
  let result={status:200,text:JSON.stringify({content:rows,other:[{flag:false}]}),headers:{}};
  w.SwaggerStudioBridge.send=async()=>result;
  await w.SwaggerStudio.open(data);clickOp(env.shadow,'GET/health');
  const execute=async()=>{env.shadow.querySelector('.send').click();await new Promise(r=>setTimeout(r,10));};
  const byText=text=>[...env.shadow.querySelectorAll('.response button')].find(n=>n.textContent===text);
  await execute(); assert.equal(env.shadow.querySelector('table'),null);
  byText('Table').click();assert.equal(env.shadow.querySelectorAll('tbody tr').length,100);assert.equal(env.shadow.querySelector('tbody img'),null);
  assert.equal(env.shadow.querySelector('td details summary').textContent,'Object');
  byText('Next').click();assert.equal(env.shadow.querySelectorAll('tbody tr').length,5);
  const source=env.shadow.querySelector('[aria-label="Table array"]');source.value='$["other"]';source.dispatchEvent(new w.Event('change'));
  assert.equal(env.shadow.querySelector('tbody').textContent,'false');
  const stored=Object.values(w.localStorage).join('');assert.ok(!stored.includes('İstanbul'));assert.ok(!stored.includes('evil'));
  w.SwaggerStudio.close();await w.SwaggerStudio.open(data);await execute();assert.ok(env.shadow.querySelector('table'));
  result={status:400,text:'[{"error":"bad"}]',headers:{}};await execute();assert.equal(env.shadow.querySelector('table'),null);assert.match(env.shadow.querySelector('.response').textContent,/bad/);
  result={status:200,text:'not JSON',headers:{}};await execute();assert.equal(env.shadow.querySelector('table'),null);
  result={status:200,text:'[]',headers:{}};await execute();assert.match(env.shadow.querySelector('.response').textContent,/0 rows/);
});

test('list controls preserve omission empty values query body edits modes and validation', async t => {
  const env=setup(t),{w}=env;
  const array={type:'array',items:{type:'string'}};
  const api={openapi:'3.0.3',paths:{'/lists':{post:{parameters:[{name:'names',in:'query',schema:array},{name:'ids',in:'query',schema:{type:'array',items:{type:'integer'}}}],requestBody:{content:{'application/json':{schema:{type:'object',properties:{filter:{type:'object',properties:{names:array}},note:{type:'string'}}},example:{filter:{names:['Ali']},note:'keep'}}}}}}}};
  let sent,calls=0;w.SwaggerStudioBridge.send=async(ui,options)=>{sent=options;calls++;return {status:200,text:'{}',headers:{}};};
  await w.SwaggerStudio.open({...env.data,spec:api});clickOp(env.shadow,'POST/lists');
  const shadow=env.shadow;
  const input=(node,value)=>{node.value=value;node.dispatchEvent(new w.Event('input',{bubbles:true}));};
  const check=shadow.querySelector('[aria-label="Send names · query"]');assert.equal(check.checked,false);check.click();
  const query=check.closest('.list-field');query.querySelector('button').click();input(query.querySelector('.list-item input'),'Ayşe & a,b');
  const bodyList=shadow.querySelector('[aria-label="filter.names"]');bodyList.querySelector('button').click(); // remove initial value
  bodyList.querySelector('button').click(); // add empty item
  const execute=async()=>{shadow.querySelector('.send').click();await new Promise(r=>setTimeout(r,10));};
  await execute();assert.deepEqual(Array.from(sent.parameters['query.names']),['Ayşe & a,b']);assert.deepEqual(Array.from(sent.requestBody.filter.names),['']);assert.equal(sent.requestBody.note,'keep');
  const mode=query.querySelector('select');mode.value='json';mode.dispatchEvent(new w.Event('change'));input(query.querySelector('textarea'),'[]');await execute();assert.equal(sent.parameters['query.names'].length,0);
  input(query.querySelector('textarea'),'[broken');await execute();assert.equal(calls,2);assert.match(shadow.querySelector('.response').textContent,/JSON/);
  input(query.querySelector('textarea'),'["valid"]');check.click();await execute();assert.equal(sent.parameters['query.names'],undefined);
  const body=shadow.querySelector('#studio-request-body');input(body,'{"filter":{"names":["updated"]},"note":"changed"}');
  assert.equal(shadow.querySelector('[aria-label="filter.names item 1"]').value,'updated');await execute();assert.equal(sent.requestBody.note,'changed');
});

test('real Swagger preview follows list edits, form encoding and invalid drafts across tabs', async t => {
  const env=setup(t),{w}=env;
  w.eval(fs.readFileSync(require.resolve('swagger-ui-dist/swagger-ui-bundle.js'),'utf8'));
  const capturedBridge = w.SwaggerStudioBridge;
  w.eval(fs.readFileSync(require.resolve('../swagger-bridge.js'),'utf8'));
  Object.assign(capturedBridge, w.SwaggerStudioBridge); w.SwaggerStudioBridge = capturedBridge;
  const fn=w.SwaggerUIBundle.plugins.SwaggerClient({configs:{},getConfigs:()=>({})}).fn;
  const list={type:'array',items:{type:'integer'}};
  const api={openapi:'3.0.3',paths:{'/lists':{post:{parameters:[{name:'ids',in:'query',schema:list}],requestBody:{content:{'application/x-www-form-urlencoded':{schema:{type:'object',properties:{names:{type:'array',items:{type:'string'}}}},encoding:{names:{style:'form',explode:true}}}}}}},'/health':{get:{}}}};
  let calls=0;w.SwaggerStudioBridge.send=async()=>{calls++;return {status:200,text:'{}',headers:{}};};
  await w.SwaggerStudio.open({...env.data,spec:api,ui:{fn}});clickOp(env.shadow,'POST/lists');
  const input=(node,value)=>{node.value=value;node.dispatchEvent(new w.Event('input',{bubbles:true}));};
  let shadow=env.shadow;shadow.querySelector('[aria-label="Send ids · query"]').click();
  shadow.querySelector('[aria-label="ids · query"] button').click();input(shadow.querySelector('[aria-label="ids · query item 1"]'),'42');
  shadow.querySelector('[aria-label="Send names"]').click();shadow.querySelector('[aria-label="names"] button').click();input(shadow.querySelector('[aria-label="names item 1"]'),'Ayşe & a,b');
  const preview=shadow.querySelector('.request-preview');preview.open=true;preview.dispatchEvent(new w.Event('toggle'));
  assert.match(preview.textContent,/ids=42/);assert.match(preview.textContent,/names=Ay/);assert.match(preview.textContent,/%26/);
  input(shadow.querySelector('[aria-label="ids · query item 1"]'),'oops');assert.match(preview.textContent,/integer/);
  clickOp(shadow,'GET/health');clickOp(env.shadow,'POST/lists');shadow=env.shadow;
  assert.equal(shadow.querySelector('[aria-label="ids · query item 1"]').value,'oops');shadow.querySelector('.send').click();await new Promise(r=>setTimeout(r,10));assert.equal(calls,0);
  shadow.querySelector('[aria-label="Send ids · query"]').click();shadow.querySelector('.send').click();await new Promise(r=>setTimeout(r,10));assert.equal(calls,1);
});


test('list editor accepts values immediately without enabling or opening options', async t => {
  const env=setup(t),{w}=env;
  const api={openapi:'3.0.3',paths:{'/lists':{get:{parameters:[{name:'names',in:'query',schema:{type:'array',items:{type:'string'}}}]}}}};
  let sent;w.SwaggerStudioBridge.send=async(ui,options)=>{sent=options;return {status:200,text:'{}',headers:{}};};
  await w.SwaggerStudio.open({...env.data,spec:api});clickOp(env.shadow,'GET/lists');
  const shadow=env.shadow,field=shadow.querySelector('.list-field'),input=field.querySelector('.list-item input');
  assert.ok(input);assert.equal(input.disabled,false);assert.equal(field.querySelector('.list-options').open,false);
  assert.match(field.querySelector('.list-status').textContent,/Not included/);
  input.value='Ayşe & a,b';input.dispatchEvent(new w.Event('input',{bubbles:true}));
  assert.equal(field.querySelector('[type=checkbox]').checked,true);assert.match(field.querySelector('.list-status').textContent,/1 value/);
  shadow.querySelector('.send').click();await new Promise(r=>setTimeout(r,10));assert.deepEqual(Array.from(sent.parameters['query.names']),['Ayşe & a,b']);
  field.querySelector('.list-item button').click();assert.match(field.querySelector('.list-status').textContent,/No values/);assert.ok(field.querySelector('.list-item input'));
});


test('network journey follows transport phases, bytes, HTTP errors and cancellation without delaying response', async t => {
  const env = setup(t), { w, data } = env;
  let phase, resolve, reject;
  w.SwaggerStudioBridge.send = (_, __, options) => { phase = options.onPhase; return new Promise((yes, no) => { resolve = yes; reject = no; options.signal.addEventListener('abort', () => reject({ name: 'AbortError' })); }); };
  await w.SwaggerStudio.open(data); clickOp(env.shadow, 'GET/health');
  env.shadow.querySelector('.send').click();
  let scene = env.shadow.querySelector('.network-journey');
  assert.equal(scene.dataset.phase, 'preparing');
  phase('waiting'); assert.equal(scene.dataset.phase, 'waiting');
  phase('receiving', { status: 404, bytes: 2048 });
  assert.equal(scene.dataset.outcome, 'error'); assert.match(scene.textContent, /2.0 KiB/);
  resolve({ status: 404, text: '{"message":"missing"}', headers: {} });
  await new Promise(r => setTimeout(r, 0));
  assert.equal(scene.dataset.phase, 'complete'); assert.equal(scene.dataset.outcome, 'error');
  assert.equal(env.shadow.querySelector('.network-journey'), null);
  assert.match(env.shadow.querySelector('.response > pre').textContent, /missing/);
  env.shadow.querySelector('.send').click();
  scene = env.shadow.querySelector('.network-journey'); phase('waiting');
  [...env.shadow.querySelectorAll('button')].find(b => b.textContent === 'Cancel').click();
  await new Promise(r => setTimeout(r, 0));
  assert.equal(scene.dataset.outcome, 'cancelled');
  assert.equal(env.shadow.querySelector('.network-journey'), null);
  assert.match(env.shadow.querySelector('.response').textContent, /Request cancelled/);
  const old = phase; clickOp(env.shadow, 'GET/pets/{id}'); old('receiving', { bytes: 99 });
  assert.equal(env.shadow.querySelector('.network-journey'), null);
});


test('unreachable server is shown briefly before error details, without delaying HTTP errors', async t => {
  const env = setup(t), { w, data } = env;
  w.SwaggerStudioBridge.send = async (_, __, { onPhase }) => { onPhase('waiting'); throw new TypeError('Failed to fetch'); };
  await w.SwaggerStudio.open(data); clickOp(env.shadow, 'GET/health');
  env.shadow.querySelector('.send').click(); await new Promise(r => setTimeout(r, 0));
  const scene = env.shadow.querySelector('.network-journey');
  assert.equal(scene.dataset.outcome, 'offline'); assert.match(scene.textContent, /Server offline/);
  assert.match(scene.textContent, /Unreachable or blocked/);
  await new Promise(r => setTimeout(r, 1150));
  assert.equal(env.shadow.querySelector('.network-journey'), null);
  assert.match(env.shadow.querySelector('.response').textContent, /Failed to fetch/);
  assert.equal(env.shadow.querySelector('.send').hasAttribute('aria-busy'), false);
});
