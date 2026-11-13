const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const source = name => fs.readFileSync(require.resolve(`../${name}`), 'utf8');
function setup(t, reduced = false) {
  const dom = new JSDOM('<html><head></head><body><section id="response">Readable JSON remains here</section></body></html>', { url: 'https://example.test/swagger-ui/index.html', runScripts: 'outside-only', pretendToBeVisual: true });
  t.after(() => dom.window.close()); const w = dom.window;
  w.matchMedia = query => ({ matches: reduced && query.includes('reduced-motion'), addEventListener() {} });
  w.eval(source('motion.js')); w.eval(source('theme.js')); w.eval(source('response-effects.js'));
  return w;
}
test('every saved theme has a working palette, bounded scene and response recipe', t => {
  const w = setup(t), themes = w.SwaggerStudioTheme;
  assert.equal(themes.catalog().length, 25);
  for (const theme of themes.catalog()) {
    themes.set(theme.id); assert.equal(themes.preference(), theme.id);
    assert.ok(themes.responseRecipe()); assert.match(themes.variables(), /--st-accent:#[0-9a-f]{6}/i);
    assert.ok(w.document.querySelectorAll('#brsvs-theme-effects span').length <= 42);
    const effect = w.SwaggerStudioResponseEffects.start(w.document.getElementById('response'));
    assert.equal(effect.node.dataset.state, 'pending'); assert.ok(effect.node.classList.contains(themes.responseRecipe()));
    effect.finish(200); assert.equal(effect.node.dataset.state, 'success'); effect.remove();
  }
  assert.equal(w.document.querySelectorAll('.brsvs-response-fx').length, 0);
  assert.equal(w.document.getElementById('response').textContent, 'Readable JSON remains here');
});
test('response states distinguish success, client errors, server errors, network failures and cancellation', t => {
  const w = setup(t), fx = w.SwaggerStudioResponseEffects;
  for (const [status, error, expected] of [[200, undefined, 'success'], [204, undefined, 'success'], [400, undefined, 'warning'], [404, undefined, 'warning'], [503, undefined, 'error'], [undefined, new Error('network'), 'error'], [undefined, { name: 'AbortError' }, 'cancelled']]) {
    const effect = fx.start(w.document.getElementById('response')); effect.finish(status, error);
    assert.equal(effect.node.dataset.state, expected); assert.equal(effect.node.querySelectorAll('span').length, expected === 'success' ? 9 : 0); effect.remove();
  }
});
test('theme changes refresh in-flight feedback and reduced motion leaves only a static edge', t => {
  const w = setup(t, true), target = w.document.getElementById('response'), fx = w.SwaggerStudioResponseEffects;
  const effect = fx.start(target); w.SwaggerStudioTheme.set('winter'); assert.equal(effect.node.dataset.theme, 'winter'); assert.ok(effect.node.classList.contains('ice')); assert.ok(effect.node.classList.contains('reduced'));
  effect.finish(200); assert.equal(effect.node.querySelectorAll('span').length, 0); assert.equal(w.document.getElementById('brsvs-theme-effects'), null);
  w.dispatchEvent(new w.CustomEvent('studio-closed')); assert.equal(w.document.querySelector('.brsvs-response-fx'), null);
});
test('feedback tracks the panel rectangle without moving the panel and removes finished overlays', async t => {
  const w = setup(t), target = w.document.getElementById('response');
  let top = 100; target.getBoundingClientRect = () => ({ left: 20, top, width: 400, height: 200, bottom: top + 200 });
  const effect = w.SwaggerStudioResponseEffects.start(target);
  await new Promise(r => setTimeout(r, 60)); assert.equal(effect.node.style.top, '100px');
  top = 50; await new Promise(r => setTimeout(r, 65)); assert.equal(effect.node.style.top, '50px'); assert.equal(target.style.transform, '');
  effect.finish(200); await new Promise(r => setTimeout(r, 1050)); assert.equal(effect.node.isConnected, false);
});
test('Swagger plugin preserves action results and renders feedback for real Swagger actions', async t => {
  const w = setup(t);
  // Load an actual Swagger instance with the effects installer wrapping its initializer.
  delete w.SwaggerStudioResponseEffects;
  w.eval(fs.readFileSync(require.resolve('swagger-ui-dist/swagger-ui-bundle.js'), 'utf8'));
  w.eval(source('response-effects.js'));
  const spec = { openapi: '3.0.3', info: { title: 'Test', version: '1' }, paths: { '/pets': { get: { operationId: 'pets', responses: { 200: { description: 'OK' } } } } } };
  const ui = w.SwaggerUIBundle({ spec, dom_id: null, plugins: [() => ({ fn: { execute: async () => ({ status: 200, text: '{}', headers: {} }) } })] });
  const sys = ui.getSystem(), originalPlugin = w.SwaggerUIBundle.plugins.DownloadUrl;
  assert.equal(typeof originalPlugin, 'function');
  const operation = sys.Im.fromJS(spec.paths['/pets'].get);
  const result = sys.specActions.executeRequest({ spec, pathName: '/pets', method: 'get', operation, parameters: {}, requestContentType: 'application/json', responseContentType: 'application/json', fetch: sys.fn.fetch });
  assert.equal(typeof result.then, 'function'); await result;
  await new Promise(r => setTimeout(r, 20));
  const response = sys.specSelectors.responseFor('/pets', 'get'); assert.equal(response.get('status'), 200);
  assert.equal(w.document.querySelector('.brsvs-response-fx').dataset.state, 'success');
});
test('Swagger rejected HTTP 4xx is a warning, not a network failure', async t => {
  const w = setup(t); delete w.SwaggerStudioResponseEffects;
  w.eval(fs.readFileSync(require.resolve('swagger-ui-dist/swagger-ui-bundle.js'), 'utf8')); w.eval(source('response-effects.js'));
  const spec = { openapi: '3.0.3', info: { title: 'Test', version: '1' }, paths: { '/pets': { get: { operationId: 'pets', responses: {} } } } };
  const ui = w.SwaggerUIBundle({ spec, dom_id: null, plugins: [() => ({ fn: { execute: async () => { throw Object.assign(new Error('Not found'), { status: 404 }); } } })] });
  const sys = ui.getSystem(); await sys.specActions.executeRequest({ spec, pathName: '/pets', method: 'get', operation: sys.Im.fromJS(spec.paths['/pets'].get), parameters: {} });
  await new Promise(r => setTimeout(r, 20)); assert.equal(w.document.querySelector('.brsvs-response-fx').dataset.state, 'warning');
});

test('Bosphorus ferry follows execution and is removed on theme change or reduced motion', t => {
  const w = setup(t); w.SwaggerStudioTheme.set('bosphorus');
  const effect = w.SwaggerStudioResponseEffects.start(w.document.getElementById('response'));
  assert.ok(effect.node.querySelector('.ferry-boat'));
  effect.finish(200); assert.ok(effect.node.querySelector('.ferry-boat'));
  w.SwaggerStudioTheme.set('winter'); assert.equal(effect.node.querySelector('.ferry-boat'), null);
  effect.remove();
  const reduced = setup(t, true); reduced.SwaggerStudioTheme.set('bosphorus');
  const quiet = reduced.SwaggerStudioResponseEffects.start(reduced.document.getElementById('response'));
  assert.equal(quiet.node.querySelector('.ferry-boat'), null);
  assert.equal(reduced.document.getElementById('brsvs-theme-effects'), null); quiet.remove();
});

test('Ocean Winter and Sakura execution scenes refresh, clean up and respect reduced motion', t => {
  for (const theme of ['ocean', 'winter', 'sakura']) {
    const w = setup(t); w.SwaggerStudioTheme.set(theme);
    const effect = w.SwaggerStudioResponseEffects.start(w.document.getElementById('response'));
    assert.equal(effect.node.querySelectorAll('.response-scene b').length, 7);
    effect.finish(200); assert.equal(effect.node.querySelectorAll('.response-scene').length, 1);
    w.SwaggerStudioTheme.set('dark'); assert.equal(effect.node.querySelector('.response-scene'), null);
    effect.remove(); assert.equal(w.document.querySelector('.brsvs-response-fx'), null);
    const quiet = setup(t, true); quiet.SwaggerStudioTheme.set(theme);
    const reduced = quiet.SwaggerStudioResponseEffects.start(quiet.document.getElementById('response'));
    assert.equal(reduced.node.querySelector('.response-scene'), null); reduced.remove();
  }
});

test('Ocean whale follows pending and successful requests and clears when changing theme', t => {
  const w = setup(t); w.SwaggerStudioTheme.set('ocean');
  const effect = w.SwaggerStudioResponseEffects.start(w.document.getElementById('response'));
  assert.ok(effect.node.querySelector('svg.ocean-whale'));
  effect.finish(200); assert.equal(effect.node.querySelectorAll('.whale-lane').length, 1);
  w.SwaggerStudioTheme.set('sakura'); assert.equal(effect.node.querySelector('.whale-lane'), null); effect.remove();
  const quiet = setup(t, true); quiet.SwaggerStudioTheme.set('ocean');
  const reduced = quiet.SwaggerStudioResponseEffects.start(quiet.document.getElementById('response'));
  assert.equal(reduced.node.querySelector('.whale-lane'), null); reduced.remove();
});

test('Winter snowman builds during execution and clears on theme change or reduced motion', t => {
  const w = setup(t); w.SwaggerStudioTheme.set('winter');
  const effect = w.SwaggerStudioResponseEffects.start(w.document.getElementById('response'));
  assert.equal(effect.node.querySelectorAll('.winter-snowman g').length, 3);
  effect.finish(200); assert.equal(effect.node.querySelectorAll('.snowman-lane').length, 1);
  w.SwaggerStudioTheme.set('ocean'); assert.equal(effect.node.querySelector('.snowman-lane'), null); effect.remove();
  const quiet = setup(t, true); quiet.SwaggerStudioTheme.set('winter');
  const reduced = quiet.SwaggerStudioResponseEffects.start(quiet.document.getElementById('response'));
  assert.equal(reduced.node.querySelector('.snowman-lane'), null); reduced.remove();
});

test('Rainy Night and Monsoon share lightning feedback with reduced motion and theme cleanup', t => {
  for (const theme of ['rainy-night', 'monsoon']) {
    const w = setup(t); w.SwaggerStudioTheme.set(theme);
    const effect = w.SwaggerStudioResponseEffects.start(w.document.getElementById('response'));
    assert.ok(effect.node.querySelector('.storm-bolt'));
    effect.finish(200); assert.equal(effect.node.querySelectorAll('.storm-lane').length, 1);
    w.SwaggerStudioTheme.set('dark'); assert.equal(effect.node.querySelector('.storm-lane'), null); effect.remove();
    const quiet = setup(t, true); quiet.SwaggerStudioTheme.set(theme);
    const reduced = quiet.SwaggerStudioResponseEffects.start(quiet.document.getElementById('response'));
    assert.equal(reduced.node.querySelector('.storm-lane'), null); reduced.remove();
  }
});
