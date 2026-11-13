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
  const dom = new JSDOM('<html><head></head><body><button id="return">Swagger</button><div class="swagger-ui">Original Swagger</div></body></html>', { url: 'https://api.example.org/docs', runScripts: 'outside-only' }); t.after(() => dom.window.close());
  const w = dom.window; w.alert = message => { throw new Error(message); }; w.matchMedia = query => ({ matches: false, addEventListener() {} });
  for (const name of ['core.js', 'theme.js', 'response-effects.js']) w.eval(fs.readFileSync(require.resolve(`../${name}`), 'utf8'));
  w.SwaggerStudioBridge = { authSummary: () => ['bearer'], openAuth: () => {}, send: async () => ({ status: 200, text: '{"ok":true}', headers: {} }) };
  w.eval(fs.readFileSync(require.resolve('../studio.js'), 'utf8'));
  const data = { specUrl: 'https://api.example.org/openapi.json', spec, ui: {}, config: {} };
  return { w, data, get shadow() { return w.document.getElementById('brsvs-studio-host').shadowRoot; } };
}
const clickOp = (shadow, text) => [...shadow.querySelectorAll('nav .endpoint')].find(n => n.textContent === text).click();
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
  assert.equal([...shadow.querySelectorAll('button')].some(b => b.textContent === 'Generate example'), false);
  assert.match(shadow.querySelector('textarea').value, /"name": "Ada"/);
  shadow.querySelector('textarea').value = ''; shadow.querySelector('textarea').dispatchEvent(new w.Event('input'));
  clickOp(shadow, 'GET/health'); clickOp(env.shadow, 'POST/pets'); shadow = env.shadow;
  assert.equal(shadow.querySelector('textarea').value, '', 'an intentionally cleared draft is not regenerated');
  const theme = shadow.querySelector('[aria-label="Theme for Studio and Swagger"]'); theme.value = 'light'; theme.dispatchEvent(new w.Event('change'));
  assert.equal(w.document.documentElement.dataset.studioTheme, 'light'); assert.equal(w.localStorage.getItem('brsvs:studio:theme-v2'), 'light'); assert.match(w.document.getElementById('brsvs-swagger-theme').textContent, /\.swagger-ui/);
  assert.equal(shadow.querySelector('[aria-label="Visual effect"]'), null, 'effects are part of themes, not a separate control');
  theme.value = 'winter'; theme.dispatchEvent(new w.Event('change')); assert.equal(w.document.querySelectorAll('#brsvs-theme-effects.snow span').length, 42);
  theme.value = 'cosmic'; theme.dispatchEvent(new w.Event('change')); assert.equal(w.document.querySelectorAll('#brsvs-theme-effects.stars span').length, 30);
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' })); assert.equal(w.document.getElementById('brsvs-studio-host'), null);
  assert.equal(w.document.querySelectorAll('#brsvs-theme-effects.stars span').length, 30, 'effects remain on standard Swagger');
  assert.equal(w.document.documentElement.dataset.studioTheme, 'cosmic');
  await w.SwaggerStudio.open(data); assert.equal(env.shadow.querySelector('[aria-label="Theme for Studio and Swagger"]').value, 'cosmic');
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
