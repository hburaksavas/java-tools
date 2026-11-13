const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const swaggerRoot = require('swagger-ui-dist').getAbsoluteFSPath();
const customers = [{ id: 1, name: 'Ada Demir', email: 'ada@example.test', status: 'ACTIVE' }, { id: 2, name: 'Deniz Kaya', email: 'deniz@example.test', status: 'ACTIVE' }, { id: 3, name: 'Ece Yilmaz', email: 'ece@example.test', status: 'INACTIVE' }];
const spec = {
  openapi: '3.0.3', info: { title: 'Customer Service · Studio Demo', version: '1.0.0', description: 'Local sample API. All data stays in this demo process.' }, servers: [{ url: '/api' }],
  paths: {
    '/customers': {
      get: { tags: ['Customers'], summary: 'List customers', parameters: [{ name: 'status', in: 'query', description: 'ACTIVE or INACTIVE', schema: { type: 'string' } }], responses: { 200: { description: 'Customer list' } } },
      post: { tags: ['Customers'], summary: 'Create a customer', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'email'], properties: { name: { type: 'string' }, email: { type: 'string' } } }, example: { name: 'Selin Acar', email: 'selin@example.test' } } } }, responses: { 201: { description: 'Customer created' }, 400: { description: 'Invalid input' } } }
    },
    '/customers/{id}': { get: { tags: ['Customers'], summary: 'Find customer by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Customer' }, 404: { description: 'Not found' } } } },
    '/orders': { get: { tags: ['Orders'], summary: 'List recent orders', responses: { 200: { description: 'Orders' } } } },
    '/health': { get: { tags: ['System'], summary: 'Service health', responses: { 200: { description: 'Healthy' } } } }
  }
};
const assets = {
  '/': [path.join(__dirname, 'index.html'), 'text/html; charset=utf-8'],
  '/demo.js': [path.join(__dirname, 'demo.js'), 'text/javascript'],
  '/core.js': [path.join(root, 'core.js'), 'text/javascript'],
  '/studio.js': [path.join(root, 'studio.js'), 'text/javascript'],
  '/studio.css': [path.join(root, 'studio.css'), 'text/css'],
  '/scenes.js': [path.join(root, 'scenes.js'), 'text/javascript'],
  '/json.js': [path.join(root, 'json.js'), 'text/javascript'],
  '/theme.js': [path.join(root, 'theme.js'), 'text/javascript'],
  '/motion.js': [path.join(root, 'motion.js'), 'text/javascript'],
  '/playful.js': [path.join(root, 'playful.js'), 'text/javascript'],
  '/response-effects.js': [path.join(root, 'response-effects.js'), 'text/javascript'],
  '/effects.css': [path.join(root, 'effects.css'), 'text/css'],
  '/swagger-bridge.js': [path.join(root, 'swagger-bridge.js'), 'text/javascript'],
  '/swagger-ui.css': [path.join(swaggerRoot, 'swagger-ui.css'), 'text/css'],
  '/swagger-ui-bundle.js': [path.join(swaggerRoot, 'swagger-ui-bundle.js'), 'text/javascript']
};
function json(res, status, data) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); }
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && assets[url.pathname]) { const [file, type] = assets[url.pathname]; res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' }); fs.createReadStream(file).pipe(res); return; }
  if (req.method === 'GET' && url.pathname === '/v3/api-docs') return json(res, 200, spec);
  if (req.method === 'GET' && url.pathname === '/api/customers') return json(res, 200, { items: customers.filter(c => !url.searchParams.get('status') || c.status === url.searchParams.get('status')), total: customers.length });
  if (req.method === 'GET' && /^\/api\/customers\/\d+$/.test(url.pathname)) { const customer = customers.find(c => c.id === Number(url.pathname.split('/').at(-1))); return json(res, customer ? 200 : 404, customer || { message: 'Customer not found' }); }
  if (req.method === 'POST' && url.pathname === '/api/customers') {
    try { let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 65536) return json(res, 413, { message: 'Body too large' }); } const data = JSON.parse(body); if (typeof data.name !== 'string' || !data.name.trim() || typeof data.email !== 'string' || !data.email.includes('@')) return json(res, 400, { message: 'name and email are required' }); const customer = { id: customers.length + 1, name: data.name, email: data.email, status: 'ACTIVE' }; customers.push(customer); return json(res, 201, customer); }
    catch { return json(res, 400, { message: 'Invalid JSON body' }); }
  }
  if (req.method === 'GET' && url.pathname === '/api/orders') return json(res, 200, { items: [{ id: 'ORD-1001', customerId: 1, amount: 249.9, currency: 'TRY', status: 'COMPLETED' }, { id: 'ORD-1002', customerId: 2, amount: 899, currency: 'TRY', status: 'PROCESSING' }] });
  if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { status: 'UP', service: 'customer-service-demo', timestamp: new Date().toISOString() });
  json(res, 404, { message: 'Not found' });
});
server.listen(Number(process.env.STUDIO_DEMO_PORT || 4173), '127.0.0.1', () => console.log(`Studio demo: http://127.0.0.1:${server.address().port}/?studio=1`));
