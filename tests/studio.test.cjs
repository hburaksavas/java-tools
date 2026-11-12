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
  for (const name of ['core.js', 'theme.js']) w.eval(fs.readFileSync(require.resolve(`../${name}`), 'utf8'));
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
  const input = [...shadow.querySelectorAll('.field input')].find(n => n.closest('label').textContent.startsWith('id *')); input.value = '42'; input.dispatchEvent(new w.Event('input'));
  shadow.querySelector('[aria-label="Toggle favorite"]').click(); shadow = env.shadow;
  clickOp(shadow, 'GET/health'); shadow = env.shadow; shadow.querySelector('.tab button').click(); shadow = env.shadow;
  assert.equal([...shadow.querySelectorAll('.field input')].find(n => n.closest('label').textContent.startsWith('id *')).value, '42');
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })); assert.equal(shadow.activeElement, shadow.querySelector('.search'));
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true })); await new Promise(r => setTimeout(r, 20)); assert.match(shadow.querySelector('.response').textContent, /"ok": true/);
  w.SwaggerStudio.close(); await w.SwaggerStudio.open(data); shadow = env.shadow;
  assert.equal(shadow.querySelectorAll('.tab').length, 2); assert.equal(shadow.querySelector('[aria-label="Toggle favorite"]').textContent, '★');
  assert.equal([...shadow.querySelectorAll('.field input')].find(n => n.closest('label').textContent.startsWith('id *')).value, '');
  const stored = w.localStorage.getItem('studio:v2:https://api.example.org/docs:https://api.example.org/openapi.json'); assert.ok(!stored.includes('42')); assert.ok(!stored.includes('response')); assert.ok(!stored.includes('auth'));
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' })); assert.equal(w.document.querySelector('.swagger-ui').textContent, 'Original Swagger'); assert.equal(w.document.documentElement.style.overflow, '');
});
test('schema examples and theme selection update both views and survive reload', async t => {
  const env = setup(t), { w, data } = env; await w.SwaggerStudio.open(data); clickOp(env.shadow, 'POST/pets'); let shadow = env.shadow;
  [...shadow.querySelectorAll('button')].find(b => b.textContent === 'Generate example').click(); assert.match(shadow.querySelector('textarea').value, /"name": "Ada"/);
  const theme = shadow.querySelector('[aria-label="Theme for Studio and Swagger"]'); theme.value = 'light'; theme.dispatchEvent(new w.Event('change'));
  assert.equal(w.document.documentElement.dataset.studioTheme, 'light'); assert.equal(w.localStorage.getItem('brsvs:studio:theme'), 'light'); assert.match(w.document.getElementById('brsvs-swagger-theme').textContent, /\.swagger-ui/);
  [...shadow.querySelectorAll('button')].find(b => b.textContent === 'Settings').click();
  const effect = shadow.querySelector('[aria-label="Visual effect"]'); effect.value = 'snow'; effect.dispatchEvent(new w.Event('change')); assert.equal(shadow.querySelectorAll('.flake').length, 28);
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' })); assert.ok(w.document.getElementById('brsvs-studio-host')); assert.equal(shadow.querySelector('.settings-backdrop'), null);
});
test('blocked localStorage does not prevent startup and reduced motion suppresses snow', async t => {
  const env = setup(t), { w, data } = env; Object.defineProperty(w, 'localStorage', { get() { throw new Error('Storage blocked'); } }); w.matchMedia = () => ({ matches: true }); data.config.effect = 'snow'; await w.SwaggerStudio.open(data);
  assert.ok(env.shadow.querySelector('.welcome')); assert.equal(env.shadow.querySelector('.snow'), null);
});
