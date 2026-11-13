const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
test('application bootstrap loads config and automatically opens when Swagger becomes ready', async t => {
  const dom = new JSDOM('<html><body><script src="https://example.test/sample/swagger-ui/studio/bootstrap.js?v=revision"></script></body></html>', { url: 'https://example.test/sample/swagger-ui/index.html', runScripts: 'outside-only' }); t.after(() => dom.window.close());
  const w = dom.window; let loaded = false, opened, configUrl;
  w.fetch = async url => { configUrl = String(url); return { ok: true, json: async () => ({ title: 'My API' }) }; };
  w.ui = { specSelectors: { specJson: () => ({ toJS: () => loaded ? { openapi: '3.0.3', paths: {} } : {} }), url: () => '/sample/openapi' } };
  w.SwaggerStudio = { open: data => opened = data };
  w.SwaggerStudioTheme = { picker: () => w.document.createElement('select'), configure: () => {} };
  w.eval(fs.readFileSync(require.resolve('../bootstrap.js'), 'utf8'));
  await new Promise(r => setTimeout(r, 20)); assert.equal(opened, undefined); loaded = true;
  await new Promise(r => setTimeout(r, 130)); assert.equal(opened.config.title, 'My API'); assert.equal(opened.ui, w.ui); assert.equal(opened.specUrl, '/sample/openapi'); assert.equal(configUrl, 'https://example.test/sample/swagger-ui/studio/config.json');
});
