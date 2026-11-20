const fs = require('node:fs');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const core = require('../core.js');

// Run against the packaged Java demo: npm run test:demo
(async () => {
  const base = process.env.STUDIO_DEMO_URL || 'http://127.0.0.1:8087';
  const spec = await (await fetch(`${base}/v3/api-docs`)).json();
  const dom = new JSDOM('', { url: `${base}/swagger-ui/index.html`, runScripts: 'outside-only' });
  try {
    const w = dom.window;
    Object.assign(w, { Response, Headers, TextDecoder, fetch });
    w.eval(fs.readFileSync(require.resolve('swagger-ui-dist/swagger-ui-bundle.js'), 'utf8'));
    w.eval(fs.readFileSync(require.resolve('../swagger-bridge.js'), 'utf8'));
    const fn = w.SwaggerUIBundle.plugins.SwaggerClient({ configs: {}, getConfigs: () => ({}) }).fn;
    let scenarios = 0;
    async function send(method, path, extra = {}, status = 200) {
      const op = core.operations(spec).find(item => item.path === path && item.method === method);
      assert.ok(op, `${method} ${path} must exist in generated OpenAPI`);
      const draft = { base, values: {}, form: {}, files: {}, body: '', contentType: '', ...extra };
      const options = core.requestOptions(spec, op, draft, `${base}/v3/api-docs`, base);
      const result = await w.SwaggerStudioBridge.send({ fn }, options, { origin: base });
      assert.equal(result.status, status, `${method} ${path}: ${result.text}`);
      scenarios++;
      return JSON.parse(result.text);
    }
    for (const method of ['GET', 'POST']) {
      for (const names of [['Ayşe & a,b'], ['Ali', 'Ayşe', 'a,b', 'a&b', ''], ['']]) {
        assert.deepEqual(await send(method, '/api/list-query', { values: { 'query:names': JSON.stringify(names) } }), names);
      }
    }
    for (const names of [['Ayşe & a,b'], ['Ali', 'Ayşe', 'a,b', 'a&b', '']]) {
      assert.deepEqual(await send('POST', '/api/list-form', { contentType: 'application/x-www-form-urlencoded', form: { names: JSON.stringify(names) } }), names);
    }
    assert.deepEqual(await send('GET', '/api/list-numbers', { values: { 'query:ids': '[1,0,-2]' } }), [1, 0, -2]);
    assert.deepEqual(await send('GET', '/api/list-optional', { values: { 'query:names': '[]' } }), { present: false, names: [] });
    const body = { filter: { names: ['Ayşe & a,b', ''] }, ids: [1, 0, -2] };
    assert.deepEqual(await send('POST', '/api/list-nested', { body: JSON.stringify(body), contentType: 'application/json' }), body);
    assert.deepEqual(await send('POST', '/api/list-body', { body: '{"names":[]}', contentType: 'application/json' }), []);
    const page = await send('GET', '/api/table-page');
    assert.equal(page.content.length, 2); assert.equal(page.content[0].profile.city, 'İstanbul'); assert.equal(page.archived.length, 1);
    assert.equal((await send('GET', '/api/table-page', { values: { 'query:empty': 'true' } })).content.length, 0);
    assert.equal((await send('GET', '/api/table-scalar')).count, 1);
    assert.equal((await send('GET', '/api/table-error', {}, 400))[0].field, 'names');
    console.log(`Live Java demo: ${scenarios} Swagger-built HTTP scenarios passed.`);
  } finally { dom.window.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
