const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
function setup(t, reduced = false) {
  const dom = new JSDOM('<html><head></head><body><section id="target">Readable response</section></body></html>', { url: 'https://example.test/swagger-ui/index.html', runScripts: 'outside-only', pretendToBeVisual: true });
  t.after(() => dom.window.close()); const w = dom.window;
  w.matchMedia = query => ({ matches: reduced && query.includes('reduced-motion'), addEventListener() {} });
  for (const name of ['motion.js', 'theme.js', 'playful.js', 'response-effects.js']) w.eval(fs.readFileSync(require.resolve(`../${name}`), 'utf8'));
  return w;
}
function session(w, random = () => .5) {
  let now = 0; const node = w.document.createElement('div'); node.dataset.state = 'pending'; w.document.body.append(node);
  const effect = w.SwaggerStudioPlayful.attach(node, { now: () => now, random });
  return { node, effect, advance(ms) { now = ms; effect.tick(); }, finish(code, state = code >= 500 ? 'error' : code >= 300 ? 'warning' : 'success') { node.dataset.state = state; effect.finish(code); } };
}
test('HTTP status feedback stays on the response without extra character badges', t => {
  const w = setup(t), target = w.document.getElementById('target'); w.SwaggerStudioTheme.set('ocean');
  for (const [code, state] of [[200, 'success'], [400, 'warning'], [500, 'error'], [418, 'warning']]) {
    const fx = w.SwaggerStudioResponseEffects.start(target); fx.finish(code);
    assert.equal(fx.node.dataset.state,state); assert.equal(fx.node.querySelector('.http-zoo'),null);
    assert.equal(fx.node.querySelector('.mascot-smoke'),null);

    w.SwaggerStudioTheme.set('winter'); assert.equal(fx.node.querySelectorAll('.http-zoo').length, 0);
    assert.equal(target.textContent, 'Readable response'); fx.remove();
  }
});
test('long requests keep elapsed time and progress through scenes, then stop ticking', t => {
  const w = setup(t); w.SwaggerStudioTheme.set('bosphorus');
  const s = session(w); const boat = w.document.createElement('i'); boat.className = 'ferry-boat'; s.node.append(boat);
  s.advance(4300); assert.equal(s.node.dataset.waitStage, '1'); assert.match(s.node.querySelector('.request-clock').textContent, /4.3 s/); assert.ok(boat.querySelector('.perched-gull'));
  s.advance(8200); assert.equal(s.node.dataset.waitStage, '2');
  s.finish(200); assert.equal(s.node.querySelector('.request-clock').hidden, true);
  const text = s.node.querySelector('.request-clock').textContent; s.advance(16000); assert.equal(s.node.querySelector('.request-clock').textContent, text); s.effect.remove();
});
test('celebrations occur at five successes only; failures and cancellation break the streak', t => {
  const w = setup(t);
  for (let i = 1; i <= 6; i++) { const s = session(w); s.finish(200); assert.equal(!!s.node.querySelector('.streak-party'), i === 5); s.effect.remove(); }
  const failed = session(w); failed.finish(500); failed.effect.remove();
  for (let i = 1; i <= 4; i++) { const s = session(w); s.finish(204); assert.equal(s.node.querySelector('.streak-party'), null); s.effect.remove(); }
  const cancelled = session(w); cancelled.finish(undefined, 'cancelled'); cancelled.effect.remove();
  const next = session(w); next.finish(200); assert.equal(next.node.querySelector('.streak-party'), null); next.effect.remove();
});
test('rare visitors are chosen once per request and change with the theme', t => {
  const w = setup(t); let draws = 0; w.SwaggerStudioTheme.set('bosphorus');
  const s = session(w, () => { draws++; return .01; }); assert.equal(s.node.querySelectorAll('.rare-visitors svg').length, 3);
  w.SwaggerStudioTheme.set('ocean'); s.effect.refresh(); assert.equal(s.node.querySelectorAll('.rare-visitors svg').length, 1);
  w.SwaggerStudioTheme.set('arrakis'); s.effect.refresh(); assert.equal(s.node.querySelectorAll('.rare-visitors svg').length, 1);
  s.effect.refresh(); assert.equal(draws, 1); s.effect.remove();
  const usual = session(w, () => .5); assert.equal(usual.node.querySelector('.rare-visitors'), null); usual.effect.remove();
});
test('atmospheres persist independently per theme, sync tabs and retain reduced motion palettes', t => {
  const w = setup(t, true), theme = w.SwaggerStudioTheme;
  theme.set('bosphorus'); theme.setAtmosphere('sunset'); assert.match(theme.variables(), /--st-bg:#f5e9df/);
  theme.set('winter'); theme.setAtmosphere('day'); assert.match(theme.variables(), /--st-bg:#edf5f8/);
  theme.set('bosphorus'); assert.equal(theme.atmosphere(), 'sunset');
  delete w.SwaggerStudioTheme; w.eval(fs.readFileSync(require.resolve('../theme.js'), 'utf8')); assert.equal(w.SwaggerStudioTheme.atmosphere(), 'sunset');
  w.localStorage.setItem('brsvs:studio:atmosphere-v1', JSON.stringify({ bosphorus: 'night' })); w.dispatchEvent(new w.StorageEvent('storage', { key: 'brsvs:studio:atmosphere-v1' }));
  assert.equal(w.SwaggerStudioTheme.atmosphere(), 'night'); assert.match(w.SwaggerStudioTheme.variables(), /--st-bg:#0a1828/); assert.equal(w.document.getElementById('brsvs-theme-effects'), null);
});
test('reduced motion leaves the clock readable but suppresses characters visitors and travel', t => {
  const w = setup(t, true); w.SwaggerStudioTheme.set('ocean'); const s = session(w, () => 0);
  s.advance(9000); assert.match(s.node.querySelector('.request-clock').textContent, /9.0 s/);
  s.finish(418); assert.equal(s.node.querySelector('.http-zoo'), null); assert.equal(s.node.querySelector('.rare-visitors'), null);
  w.SwaggerStudioPlayful.travel({ left:20, width:50, bottom:90 }, { left:120, width:50, bottom:90 }); assert.equal(w.document.querySelector('.endpoint-traveller'), null); s.effect.remove();
});
test('endpoint travel replaces previous journey and clears on close', t => {
  const w = setup(t), fx = w.SwaggerStudioPlayful, from = { left:20, width:50, bottom:90 }, to = { left:120, width:50, bottom:90 };
  fx.travel(from, to); assert.ok(w.document.querySelector('.endpoint-traveller svg'));
  fx.travel(to, from); assert.equal(w.document.querySelectorAll('.endpoint-traveller').length, 1);
  w.dispatchEvent(new w.CustomEvent('studio-closed')); assert.equal(w.document.querySelector('.endpoint-traveller'), null);
});

test('real Swagger execution preserves status and streaks without character badges', async t => {
  const w = setup(t); delete w.SwaggerStudioResponseEffects;
  w.eval(fs.readFileSync(require.resolve('swagger-ui-dist/swagger-ui-bundle.js'), 'utf8'));
  w.eval(fs.readFileSync(require.resolve('../response-effects.js'), 'utf8'));
  let code = 418;
  const spec = { openapi: '3.0.3', info: { title: 'Playful', version: '1' }, paths: { '/pets': { get: { operationId: 'pets', responses: { 200: { description: 'OK' }, 418: { description: 'Tea' } } } } } };
  const ui = w.SwaggerUIBundle({ spec, dom_id: null, plugins: [() => ({ fn: { execute: async () => ({ status: code, text: '{}' }) } })] });
  const sys = ui.getSystem(), operation = sys.Im.fromJS(spec.paths['/pets'].get);
  for (let i = 0; i <= 5; i++) {
    code = i === 0 ? 418 : 200;
    await sys.specActions.executeRequest({ spec, pathName: '/pets', method: 'get', operation, parameters: {}, requestContentType: 'application/json', responseContentType: 'application/json', fetch: sys.fn.fetch });
    await new Promise(resolve => setTimeout(resolve, 15));
    const node = w.document.querySelector('.brsvs-response-fx');
    assert.equal(node.querySelector('.http-zoo'),null);
    assert.equal(!!node.querySelector('.streak-party'), i === 5);
  }
  w.SwaggerStudioResponseEffects.clear(); assert.equal(w.document.querySelector('.brsvs-response-fx'), null);
});
