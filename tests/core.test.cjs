const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../core.js');
test('response definitions support refs, exact and wildcard status, defaults and Swagger 2 schemas', () => {
  const api = { components:{responses:{created:{description:'Created',content:{'application/json':{schema:{type:'object',properties:{id:{type:'integer'}}}}}}}} };
  const op = {responses:{201:{$ref:'#/components/responses/created'},'4XX':{description:'Client error',content:{'application/problem+json':{schema:{type:'object'}}}},default:{description:'Fallback'}}};
  const definitions=core.responseDefinitions(api,op);
  assert.equal(core.selectResponseDefinition(definitions).status,'201'); assert.equal(core.selectResponseDefinition(definitions,201).media[0].schema.properties.id.type,'integer');
  assert.equal(core.selectResponseDefinition(definitions,404).status,'4XX'); assert.equal(core.selectResponseDefinition(definitions,503).status,'default');
  assert.equal(core.selectResponseDefinition(definitions.filter(item=>item.status!=='default'),503),undefined);
  const v2=core.responseDefinitions({swagger:'2.0',produces:['application/json','application/xml'],definitions:{Pet:{type:'object'}}},{responses:{200:{schema:{$ref:'#/definitions/Pet'}},204:{description:'No content'}}});
  assert.equal(v2[0].media.length,2); assert.equal(v2[0].media[0].schema.$ref,'#/definitions/Pet'); assert.equal(v2[1].media.length,0);
});
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const bundle = fs.readFileSync(require.resolve('swagger-ui-dist/swagger-ui-bundle.js'), 'utf8');
const spec = { openapi: '3.0.3', info: { title: 'Test', version: '1' }, servers: [{ url: '/api' }], components: { parameters: { id: { name: 'id', in: 'path', required: true, schema: { type: 'string' } } }, securitySchemes: { bearer: { type: 'http', scheme: 'bearer' }, key: { type: 'apiKey', in: 'header', name: 'X-API-Key' }, oauth: { type: 'oauth2', flows: {} }, basic: { type: 'http', scheme: 'basic' } } }, security: [{ bearer: [] }], paths: { '/pets/{id}': { parameters: [{ $ref: '#/components/parameters/id' }, { name: 'q', in: 'query', required: true }], get: { parameters: [{ name: 'q', in: 'query', schema: { type: 'string' } }] } }, '/pets': { post: { requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, count: { type: 'integer', minimum: 1 } } } } } }, responses: {} } } } };
const draft = extra => ({ base: 'https://api.example.test/api', values: { 'path:id': 'a/b', 'query:q': 'a&b' }, body: '', contentType: '', ...extra });
function engine(t, auth = {}, config = {}) {
  const dom = new JSDOM('', { url: 'https://api.example.test/docs', runScripts: 'outside-only' }); t.after(() => dom.window.close());
  const w = dom.window; w.Response = Response; w.Headers = Headers; w.TextDecoder = TextDecoder;
  w.eval(bundle); const fn = w.SwaggerUIBundle.plugins.SwaggerClient({ configs: {}, getConfigs: () => config }).fn;
  const ui = { fn, getConfigs: () => config, authSelectors: { authorized: () => ({ toJS: () => auth }) } };
  w.eval(fs.readFileSync(require.resolve('../swagger-bridge.js'), 'utf8'));
  return { w, ui, bridge: w.SwaggerStudioBridge };
}
test('operation parameters override shared parameters and refs resolve', () => { const ops = core.operations(spec); assert.equal(ops.length, 2); assert.equal(ops[0].parameters.length, 2); assert.equal(ops[0].parameters[1].required, undefined); });
test('schema example handles allOf, enum, readOnly and recursion', () => {
  const s = { components: { schemas: { Node: { type: 'object', properties: { name: { type: 'string', example: 'Ada' }, id: { type: 'integer', readOnly: true }, next: { $ref: '#/components/schemas/Node' } } } } } };
  assert.deepEqual(core.sample(s, { $ref: '#/components/schemas/Node' }), { name: 'Ada' });
  assert.deepEqual(core.sample({}, { allOf: [{ type: 'object', properties: { status: { enum: ['ACTIVE'] } } }, { properties: { count: { type: 'integer' } } }] }), { status: 'ACTIVE', count: 1 });
});
test('required parameters and schema constraints fail before sending', () => {
  assert.throws(() => core.requestOptions(spec, core.operations(spec)[0], draft({ values: {} }), '', 'https://api.example.test'), /id is required/);
  const op = core.operations(spec)[1];
  assert.throws(() => core.requestOptions(spec, op, draft({ contentType: 'application/json', body: '{' }), '', 'https://api.example.test'), /not valid JSON/);
  assert.throws(() => core.requestOptions(spec, op, draft({ contentType: 'application/json', body: '{"count":0}' }), '', 'https://api.example.test'), /name is required/);
  assert.throws(() => core.requestOptions(spec, op, draft({ contentType: 'application/json', body: '{"name":"Ada","count":0}' }), '', 'https://api.example.test'), /minimum/);
});
test('server variables and Swagger 2 base paths', () => {
  assert.equal(core.baseUrl({}, { servers: [{ url: 'https://{region}.example.org/v1', variables: { region: { default: 'eu' } } }] }, '', 'https://docs.example.org'), 'https://eu.example.org/v1');
  assert.equal(core.baseUrl({ swagger: '2.0', host: 'api.example.org', basePath: '/v2', schemes: ['https'] }, {}, '', 'http://localhost'), 'https://api.example.org/v2');
});
test('real Swagger engine serializes paths/query and shares bearer auth', t => {
  const auth = { bearer: { value: 'secret' } }, { ui, bridge } = engine(t, auth);
  const options = core.requestOptions(spec, core.operations(spec)[0], draft(), '', 'https://api.example.test');
  const req = bridge.build(ui, options); assert.equal(req.url, 'https://api.example.test/api/pets/a%2Fb?q=a%26b'); assert.equal(req.headers.Authorization, 'Bearer secret');
  auth.bearer.value = 'refreshed'; assert.equal(bridge.build(ui, options).headers.Authorization, 'Bearer refreshed');
  delete auth.bearer; assert.equal(bridge.build(ui, options).headers.Authorization, undefined);
});
test('real Swagger engine respects auth opt-out and API key/OAuth/basic schemes', t => {
  const { ui, bridge } = engine(t, { key: { value: 'api-key' }, oauth: { token: { access_token: 'oauth-token', token_type: 'bearer' } }, basic: { value: { username: 'a', password: 'b' } } });
  for (const [scheme, expectedHeader, value] of [['key', 'X-API-Key', 'api-key'], ['oauth', 'Authorization', 'Bearer oauth-token'], ['basic', 'Authorization', 'Basic YTpi']]) {
    const s = { ...spec, security: [{ [scheme]: [] }] }; const options = core.requestOptions(s, core.operations(s)[0], draft(), '', 'https://api.example.test'); assert.equal(bridge.build(ui, options).headers[expectedHeader], value);
  }
  const publicSpec = { ...spec, paths: { '/public': { get: { security: [] } } } }; const options = core.requestOptions(publicSpec, core.operations(publicSpec)[0], draft({ values: {} }), '', 'https://api.example.test');
  assert.equal(bridge.build(ui, options).headers.Authorization, undefined);
});
test('real Swagger engine serializes JSON and typed query objects/arrays', t => {
  const { ui, bridge } = engine(t);
  const post = core.requestOptions(spec, core.operations(spec)[1], draft({ contentType: 'application/json', body: '{"name":"Ada"}' }), '', 'https://api.example.test');
  assert.equal(bridge.build(ui, post).body, '{"name":"Ada"}');
  const s = { openapi: '3.0.3', paths: { '/search': { get: { parameters: [{ name: 'tags', in: 'query', schema: { type: 'array', items: { type: 'string' } }, style: 'form', explode: true }, { name: 'filter', in: 'query', schema: { type: 'object' }, style: 'deepObject', explode: true }] } } } };
  const req = bridge.build(ui, core.requestOptions(s, core.operations(s)[0], draft({ values: { 'query:tags': '["a","b"]', 'query:filter': '{"status":"active"}' } }), '', 'https://api.example.test'));
  const url = new URL(req.url); assert.deepEqual(url.searchParams.getAll('tags'), ['a', 'b']); assert.equal(url.searchParams.get('filter[status]'), 'active');
});
test('URL-encoded and multipart fields use actual Swagger serializers', t => {
  const { w, ui, bridge } = engine(t);
  const s = { openapi: '3.0.3', paths: { '/upload': { post: { requestBody: { content: { 'multipart/form-data': { schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' }, note: { type: 'string' } } } }, 'application/x-www-form-urlencoded': { schema: { type: 'object', properties: { note: { type: 'string' }, rating: { type: 'integer' } } } } } } } } } };
  const op = core.operations(s)[0], file = new w.File(['hello'], 'hello.txt', { type: 'text/plain' });
  const upload = bridge.build(ui, core.requestOptions(s, op, draft({ contentType: 'multipart/form-data', form: { note: 'hello' }, files: { file } }), '', 'https://api.example.test'));
  assert.equal(upload.body.get('file').name, 'hello.txt'); assert.equal(upload.body.get('note'), 'hello');
  const form = bridge.build(ui, core.requestOptions(s, op, draft({ contentType: 'application/x-www-form-urlencoded', form: { note: 'a&b', rating: '5' } }), '', 'https://api.example.test'));
  assert.match(form.body, /note=a%26b/); assert.match(form.body, /rating=5/);
});
test('async interceptors run once, errors remain responses, and cancellation/redirect bounds apply', async t => {
  let requests = 0, responses = 0, sent;
  const config = { requestInterceptor: async req => { requests++; req.headers['X-CSRF'] = 'csrf'; return req; }, responseInterceptor: async res => { responses++; res.headers['x-intercepted'] = 'yes'; return res; } };
  const { w, ui, bridge } = engine(t, { bearer: { value: 'token' } }, config);
  w.fetch = async (url, init) => { sent = { url, init }; return new Response('{"message":"denied"}', { status: 401, headers: { 'Content-Type': 'application/json' } }); };
  const options = core.requestOptions(spec, core.operations(spec)[0], draft(), '', 'https://api.example.test');
  const response = await bridge.send(ui, options, { signal: new AbortController().signal, origin: 'https://api.example.test' });
  assert.equal(requests, 1); assert.equal(responses, 1); assert.equal(sent.init.headers['X-CSRF'], 'csrf'); assert.equal(sent.init.redirect, 'error'); assert.equal(response.status, 401); assert.equal(response.headers['x-intercepted'], 'yes');
  const controller = new AbortController(); controller.abort(); await assert.rejects(bridge.send(ui, options, { signal: controller.signal, origin: 'https://api.example.test' }), /cancelled/);
});
test('origin approval runs after interceptor URL changes, before sending credentials', async t => {
  let called = false, requestedOrigin;
  const { w, ui, bridge } = engine(t, {}, { requestInterceptor: req => ({ ...req, url: 'https://other.example.test/target' }) });
  w.fetch = async () => { called = true; return new Response('{}'); };
  const options = core.requestOptions(spec, core.operations(spec)[0], draft(), '', 'https://api.example.test');
  await assert.rejects(bridge.send(ui, options, { origin: 'https://api.example.test', confirmOrigin: origin => { requestedOrigin = origin; return false; } }), /cancelled/);
  assert.equal(requestedOrigin, 'https://other.example.test'); assert.equal(called, false);
});
test('response buffering stops at 1 MiB', async t => {
  const { w, ui, bridge } = engine(t); w.fetch = async () => new Response('x'.repeat(1024 * 1024 + 100), { headers: { 'Content-Type': 'text/plain' } });
  const response = await bridge.send(ui, core.requestOptions(spec, core.operations(spec)[0], draft(), '', 'https://api.example.test'), { origin: 'https://api.example.test' });
  assert.equal(response.text.length, 1024 * 1024); assert.equal(response.headers['x-studio-truncated'], 'true');
});
